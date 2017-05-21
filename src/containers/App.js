import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { parse } from 'query-string';
import { connect } from 'react-redux';
import { Grid, Col, Well, Button } from 'react-bootstrap';
import Instructions from '../components/Instructions';
import Loading from '../components/Loading';
import UnlabeledColumn from './UnlabeledColumn';
import LabeledColumn from '../components/LabeledColumn';
import Countdown from '../components/Countdown';
import Survey from './Survey';
import Oracle from './Oracle';
import CustomDragLayer from '../CustomDragLayer';
import Master from './Master';
import { fetchExperiment, changeExperimentPhase } from '../actions';
import { itemDataSelector } from '../reducers/index';
import { States, defaults } from '../constants';

const propTypes = {
  experimentState: PropTypes.string,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired),
  initialize: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.object.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.shape({
        path: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ),
  initialInstructions: PropTypes.string,
  onChangeExperimentPhase: PropTypes.func.isRequired,
  masterView: PropTypes.bool,
};

const defaultProps = {
  experimentState: null,
  items: null,
  initialInstructions: null,
  labels: null,
  masterView: false,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: Date.now(),
      startTime: null,
    };
    const { initialize } = this.props;
    const params = {
      ...this.props.match.params,
      ...parse(this.props.location.search),
    };
    ['participantIndex', 'taskIndex', 'systemVersion'].forEach((key) => {
      if (params[key] != null) {
        params[key] = Number(params[key]);
      }
    });
    initialize(params);

    this.handleImageLoaded = this.handleImageLoaded.bind(this);
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000,
    );
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.experimentState !== States.LOADED &&
      nextProps.experimentState === States.LOADED
    ) {
      this.setState({
        itemsLoaded: new Map(nextProps.items.map(item => [item.id, false])),
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({ date: Date.now() });
  }

  handleImageLoaded(itemId) {
    // Experiment begins when all items loaded.
    this.setState((state, props) => {
      const itemsLoaded = new Map([
        ...state.itemsLoaded,
        [itemId, true],
      ]);
      const ready = [...itemsLoaded.values()].every(e => e);
      if (ready) {
        if (props.singlePage) {
          props.onChangeExperimentPhase(States.COMBINED);
        } else {
          props.onChangeExperimentPhase(States.LABELING);
        }
      }
      return {
        itemsLoaded,
        startTime: ready ? Date.now() : null,
      };
    });
  }

  render() {
    const {
      experimentState, items, labels, masterView,
      onChangeExperimentPhase, initialInstructions,
    } = this.props;
    if (experimentState == null || experimentState === States.LOADING) {
      return <Grid><h1><Loading /></h1></Grid>;
    } else if (masterView) {
      return <Grid fluid><Master /></Grid>;
    }
    let experimentComponent = null;
    if (experimentState === States.COMBINED) {
      experimentComponent = (
        <Grid fluid>
          <Col sm={4}>
            <h3>Customer Instructions</h3>
            <p>Your task is to improve these instructions:</p>
            <Well bsSize="sm">{initialInstructions}</Well>
            <Oracle />
            <Instructions />
            <Countdown
              startTime={this.state.startTime}
              now={this.state.date}
              onFinished={() => {
                this.setState({ startTime: Date.now() });
                onChangeExperimentPhase(States.SURVEY);
              }}
              duration={defaults.durations[experimentState]}
              confirmText="Are you sure you want to submit your instructions and end the experiment?"
            />
          </Col>
          <Col sm={4}>
            <UnlabeledColumn />
          </Col>
          <Col sm={4}>
            <LabeledColumn labels={labels} />
          </Col>
        </Grid>
      );
    } else if (experimentState === States.LABELING) {
      experimentComponent = (
        <Grid fluid>
          <Col sm={6}>
            <Well bsSize="sm">{initialInstructions}</Well>
            <UnlabeledColumn />
          </Col>
          <Col sm={6}>
            <LabeledColumn labels={labels} />
            <Countdown
              startTime={this.state.startTime}
              now={this.state.date}
              onFinished={() => {
                this.setState({ startTime: Date.now() });
                onChangeExperimentPhase(States.ORACLE);
              }}
              duration={defaults.durations[experimentState]}
              confirmText="Are you sure you want to move on to the next stage before time is up?"
            />
          </Col>
        </Grid>
      );
    } else if (experimentState === States.ORACLE) {
      experimentComponent = (
        <Grid fluid>
          <Col sm={6}>
            <LabeledColumn labels={labels} />
          </Col>
          <Col sm={6}>
            <h3>Customer Instructions</h3>
            <p>You may ask for clarifications of these instructions:</p>
            <Well bsSize="sm">{initialInstructions}</Well>
            <Oracle />
            <Button
              bsStyle="primary"
              onClick={() => {
                this.setState({ startTime: Date.now() });
                onChangeExperimentPhase(States.INSTRUCTIONS);
              }}
            >
              Done
            </Button>
          </Col>
        </Grid>
      );
    } else if (experimentState === States.INSTRUCTIONS) {
      experimentComponent = (
        <Grid fluid>
          <Col sm={6}>
            <LabeledColumn labels={labels} />
          </Col>
          <Col sm={6}>
            <h3>Customer Instructions</h3>
            <p>Your task is to improve these instructions:</p>
            <Well bsSize="sm">{initialInstructions}</Well>
            <Oracle />
            <Instructions />
            <Countdown
              startTime={this.state.startTime}
              now={this.state.date}
              onFinished={() => {
                this.setState({ startTime: Date.now() });
                onChangeExperimentPhase(States.SURVEY);
              }}
              duration={defaults.durations[experimentState]}
              confirmText="Are you sure you want to submit your instructions and end the experiment?"
            />
          </Col>
        </Grid>
      );
    } else if (experimentState === States.SURVEY) {
      experimentComponent = <Grid><Survey /></Grid>;
    } else if (experimentState === States.THANKS) {
      experimentComponent = <Grid><h1>Thanks!!</h1></Grid>;
    } else {
      experimentComponent = <Grid><h1><Loading /></h1></Grid>;
    }
    return (
      <div id="app">
        <div className="hidden">
          {items.map(item => (
            <img
              src={item.data.path}
              key={item.id}
              onLoad={() => { this.handleImageLoaded(item.id); }}
            />
          ))}
        </div>
        <CustomDragLayer />
        {experimentComponent}
      </div>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = (state, { location }) => {
  const isLoaded = state.experimentState != null && state.experimentState !== States.LOADING;
  return {
    experimentState: state.experimentState,
    labels: state.labels,
    masterView: parse(location.search).master !== undefined,
    singlePage: parse(location.search).singlePage !== undefined,
    items: isLoaded
      ? [...itemDataSelector(state).byId.values()]
      : null,
    initialInstructions: state.initialInstructions,
  };
};

const mapDispatchToProps = dispatch => ({
  initialize: (params) => {
    dispatch(fetchExperiment(params));
  },
  onChangeExperimentPhase: (phase) => {
    dispatch(changeExperimentPhase(phase));
  },
});

export default DragDropContext(HTML5Backend)(connect(mapStateToProps, mapDispatchToProps)(App));
