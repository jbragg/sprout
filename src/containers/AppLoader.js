import React from 'react';
import PropTypes from 'prop-types';
import { HotKeys } from 'react-hotkeys';
import { parse } from 'query-string';
import { connect } from 'react-redux';
import { Grid } from 'react-bootstrap';
import Loading from '../components/Loading';
import App from './App';
import { fetchExperiment } from '../actions';
import { States } from '../constants';
import config from '../config';
import latin2x2 from '../rand/latin/latin2x2';
import latin3x3 from '../rand/latin/latin3x3';
import conditions from '../experiment';

const getTreatment = (participantIndex, taskIndex, nTasks) => {
  if (participantIndex == null || taskIndex == null) {
    return 2; // full system
  }
  let squares = null;
  if (nTasks === 3) {
    squares = latin3x3;
  } else if (nTasks === 2) {
    squares = latin2x2;
  } else {
    throw new Error('Undefined latin square size');
  }
  const participant = Number(participantIndex);
  const task = Number(taskIndex);
  const squareIndex = Math.floor(participant / nTasks) % squares.length;
  return squares[squareIndex][participant % nTasks][task] - 1;
};

const getAllParams = (params) => {
  let taskId = params.taskId;
  let relevantParams = { ...params };
  if (params.experimentId) {
    taskId = params.tutorialIndex != null
      ? config.experiments[params.experimentId].tutorials[params.tutorialIndex]
      : config.experiments[params.experimentId].tasks[params.taskIndex];
    relevantParams.experimentPosition = {
      tutorialIndex: params.tutorialIndex,
      taskIndex: params.taskIndex,
      nTutorials: config.experiments[params.experimentId].tutorials.length,
      nTasks: config.experiments[params.experimentId].tasks.length,
    };
    delete relevantParams.tutorialIndex;
    delete relevantParams.taskIndex;
    if (params.participantIndex != null) {
      relevantParams.systemVersion = getTreatment(
        params.participantIndex,
        params.taskIndex != null ? params.taskIndex : params.tutorialIndex,
        relevantParams.experimentPosition.nTasks,
      );
    }
  }
  if (relevantParams.systemVersion != null) {
    relevantParams = {
      ...relevantParams,
      ...conditions[
        (
          relevantParams.experimentPosition
          && relevantParams.experimentPosition.nTasks
        ) || 3
      ][relevantParams.systemVersion],
    };
  }
  const task = config.tasks[taskId];
  return {
    ...task,
    ...relevantParams,
    taskId,
  };
};

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  initialize: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.object.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

class AppLoader extends React.Component {
  constructor(props) {
    super(props);
    const { initialize } = this.props;
    const params = {
      ...this.props.match.params,
      ...parse(this.props.location.search),
    };
    const numberParams = [
      'participantIndex', 'taskIndex', 'systemVersion', 'tutorialIndex',
    ];
    const boolParams = [
      'tutorial', 'clusters', 'master', 'multiPhase', 'exemplarsFirst',
      'rawView', 'clusterView', 'hideNestedSuggestions',
      'prefetchAll',
    ];
    numberParams.forEach((key) => {
      if (params[key] != null) {
        params[key] = Number(params[key]);
      }
    });
    boolParams.forEach((key) => {
      if (params[key] !== undefined) {
        params[key] = params[key] !== 'false';
      }
    });
    const allParams = getAllParams(params);
    initialize(allParams);
  }

  render() {
    const { isLoaded } = this.props;
    if (!isLoaded) {
      return <Grid><h1><Loading /></h1></Grid>;
    }
    return (
      <HotKeys
        keyMap={{
          preview: '1',
        }}
      >
        <App />
      </HotKeys>
    );
  }
}

AppLoader.propTypes = propTypes;

const mapStateToProps = state => ({
  isLoaded: (
    state.experimentPhase.name != null
    && state.experimentPhase.name !== States.LOADING
  ),
});

const mapDispatchToProps = dispatch => ({
  initialize: (params) => {
    dispatch(fetchExperiment(params));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AppLoader);
