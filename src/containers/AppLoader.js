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
import latin3x3 from '../rand/latin/latin3x3';
import conditions from '../experiment';

const getTreatment = (participantIndex, taskIndex) => {
  if (participantIndex == null || taskIndex == null) {
    return 2;  // full system
  }
  const participant = Number(participantIndex);
  const task = Number(taskIndex);
  const squareIndex = Math.floor(participant / 3) % latin3x3.length;
  return latin3x3[squareIndex][participant % 3][task] - 1;
};

const getAllParams = (params) => {
  let taskId = params.taskId;
  let relevantParams = { ...params };
  if (params.experimentId) {
    taskId = params.tutorial
      ? config.experiments[params.experimentId].tutorial
      : config.experiments[params.experimentId].tasks[params.taskIndex];
    relevantParams.experimentPosition = {
      tutorial: params.tutorial,
      taskIndex: params.taskIndex,
    };
    delete relevantParams.tutorial;  // tutorial is overloaded.
    delete relevantParams.taskIndex;
    if (params.participantIndex != null && !params.tutorial) {
      relevantParams.systemVersion = getTreatment(
        params.participantIndex, params.taskIndex,
      );
    }
  }
  if (relevantParams.systemVersion != null) {
    relevantParams = {
      ...relevantParams,
      ...conditions[relevantParams.systemVersion],
    };
  }
  const task = config.tasks[taskId];
  return {
    systemVersion: 2,
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
      'participantIndex', 'taskIndex', 'systemVersion',
    ];
    const boolParams = [
      'tutorial', 'clusters', 'raw', 'master', 'multiPhase', 'exemplar',
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
    this.state = { params: allParams };
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
        <App
          clusterView={this.state.params.clusters}
          rawView={this.state.params.raw}
          masterView={this.state.params.master}
          multiPhase={this.state.params.multiPhase}
          prefetchAll={this.state.params.prefetchAll}
          exportButton={this.state.params.exportButton}
          countdown={this.state.params.countdown}
          oracle={this.state.params.oracle}
          warnings={this.state.params.warnings}
        />
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
