import React from 'react';
import PropTypes from 'prop-types';
import { HotKeys } from 'react-hotkeys';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { parse } from 'query-string';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import Joyride from 'react-joyride';
import { Grid, Col, Well, Button, Alert } from 'react-bootstrap';
import { AutoAffix } from 'react-overlays';
import Instructions from '../components/Instructions';
import Loading from '../components/Loading';
import UnlabeledColumn from './UnlabeledColumn';
import LabeledColumn from '../components/LabeledColumn';
import Countdown from '../components/Countdown';
import Survey from './Survey';
import Oracle from './Oracle';
import CustomDragLayer from '../CustomDragLayer';
import Clusters from './Clusters';
import Export from './Export';
import Thanks from '../components/Thanks';
import ExperimentProgress from '../components/ExperimentProgress';
import Progress from './Progress';
import { fetchExperiment, changeExperimentPhase, setLightbox } from '../actions';
import { itemDataSelector } from '../reducers/index';
import { States, defaults, tutorialSteps } from '../constants';

const propTypes = {
  experimentPhase: PropTypes.shape({
    name: PropTypes.string,
    startTime: PropTypes.number,
  }).isRequired,
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
  clusterView: PropTypes.bool,
  tutorial: PropTypes.bool,
  isExperiment: PropTypes.bool,
  multiPhase: PropTypes.bool,
  waitForImagesFrac: PropTypes.number,
  prefetchAll: PropTypes.bool,
  onSetLightbox: PropTypes.func.isRequired,
};

const defaultProps = {
  items: null,
  initialInstructions: null,
  labels: null,
  masterView: false,
  clusterView: false,
  tutorial: false,
  isExperiment: true,
  multiPhase: false,
  waitForImagesFrac: 0,
  prefetchAll: false,
};

class App extends React.Component {
  constructor(props) {
    super(props);
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
    ['tutorial'].forEach((key) => {
      params[key] = params[key] !== undefined;
    });
    initialize(params);

    this.state = {
      date: Date.now(),
      warnings: [],
      tutorialSteps: [],
      tutorialRunning: false,
      params,
    };
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
    this.advanceExperimentPhase = this.advanceExperimentPhase.bind(this);
    this.dismissExpiredAlerts = this.dismissExpiredAlerts.bind(this);
    this.remainingTime = this.remainingTime.bind(this);
    this.elapsedTime = this.elapsedTime.bind(this);
  }

  componentDidMount() {
    if (this.props.isExperiment) {
      this.timerID = setInterval(
        () => this.tick(),
        1000,
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.experimentPhase.name !== nextProps.experimentPhase.name) {
      this.setState({ warnings: defaults.warnings[nextProps.experimentPhase.name] || [] });
      if (nextProps.experimentPhase.name === States.LOADED) {
        if (nextProps.prefetchAll) {
          this.setState({
            itemsLoaded: new Map(nextProps.items.map(item => [item.id, false])),
          });
        } else {
          this.advanceExperimentPhase(nextProps.experimentPhase.name);
        }
        if (nextProps.tutorial) {
          setTimeout(() => {
            this.setState({
              tutorialRunning: true,
              tutorialSteps,
            });
          }, 6000);  // TODO: Check subcomponents mounted for more robust solution.
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.props.isExperiment) {
      clearInterval(this.timerID);
    }
  }

  tick() {
    this.setState((state) => {
      // Keep at most one expired warning.
      const pastWarnings = state.warnings.filter(([time]) => time <= this.elapsedTime());
      const newWarnings = state.warnings.slice(Math.max(0, pastWarnings.length - 1));
      return {
        warnings: newWarnings,
        date: Date.now(),
      };
    });
  }

  elapsedTime() {
    const now = this.state.date;
    const startTime = this.props.experimentPhase.startTime;
    return now - startTime;
  }

  remainingTime() {
    const duration = defaults.durations[this.props.experimentPhase.name];
    return duration - this.elapsedTime();
  }

  handleImageLoaded(itemId) {
    // Experiment begins when all items loaded.
    this.setState((state, props) => {
      const itemsLoaded = new Map([
        ...state.itemsLoaded,
        [itemId, true],
      ]);
      const frac = [...itemsLoaded.values()].reduce(
        (acc, val) => (val ? acc + 1 : acc),
        0,
      ) / itemsLoaded.size;
      if (
        frac >= props.waitForImagesFrac
        && props.experimentPhase.name === States.LOADED
      ) {
        this.advanceExperimentPhase(props.experimentPhase.name);
      }
      return {
        itemsLoaded,
      };
    });
  }

  advanceExperimentPhase(currentPhase) {
    if (currentPhase === States.LOADED && !this.props.multiPhase) {
      this.props.onChangeExperimentPhase(States.COMBINED);
    } else if (currentPhase === States.LOADED) {
      this.props.onChangeExperimentPhase(States.LABELING);
    } else if (currentPhase === States.COMBINED || currentPhase === States.INSTRUCTIONS) {
      this.props.onChangeExperimentPhase(States.SURVEY);
    } else if (currentPhase === States.LABELING) {
      this.props.onChangeExperimentPhase(States.ORACLE);
    } else if (currentPhase === States.ORACLE) {
      this.props.onChangeExperimentPhase(States.INSTRUCTIONS);
    }
  }

  dismissExpiredAlerts() {
    this.setState(state => ({
      warnings: state.warnings.filter(([time]) => time > this.elapsedTime()),
    }));
  }

  render() {
    const {
      items, labels, masterView, clusterView, initialInstructions, isExperiment,
      prefetchAll, tutorial, onSetLightbox,
    } = this.props;
    const experimentState = this.props.experimentPhase.name;
    if (experimentState == null || experimentState === States.LOADING) {
      return <Grid><h1><Loading /></h1></Grid>;
    } else if (clusterView) {
      return <Grid fluid><Clusters /></Grid>;
    }
    let experimentComponent = null;
    const remainingSeconds = this.remainingTime() / 1000;
    if (experimentState === States.COMBINED) {
      experimentComponent = (
        <Grid fluid>
          <Col sm={4}>
            <AutoAffix>
              <div>
                <UnlabeledColumn master={masterView} />
              </div>
            </AutoAffix>
          </Col>
          <Col sm={4}>
            <Progress />
            <LabeledColumn labels={labels} />
          </Col>
          <Col className="instructions" sm={4}>
            <AutoAffix>
              <div>
                <h3>Customer Instructions</h3>
                <p>Your task is to improve these instructions:</p>
                <Well bsSize="sm">{initialInstructions}</Well>
                {isExperiment && <Oracle />}
                <Instructions />
                {isExperiment && (
                  <Countdown
                    remainingTime={remainingSeconds}
                    onFinished={() => { this.advanceExperimentPhase(experimentState); }}
                    confirmText={'Are you sure you want to submit your instructions and end the experiment?'}
                  />
                )}
                {!isExperiment && !tutorial && (
                  <Export>
                    <Button
                      bsStyle="primary"
                    >
                      Export
                    </Button>
                  </Export>
                )}
                {tutorial && (
                  <Button
                    bsStyle="primary"
                    onClick={() => { this.props.onChangeExperimentPhase(States.THANKS); }}
                  >
                    Ready for experiment
                  </Button>
                )}
              </div>
            </AutoAffix>
          </Col>
        </Grid>
      );
    } else if (experimentState === States.LABELING) {
      experimentComponent = (
        <Grid fluid>
          <Col sm={6}>
            <Well bsSize="sm">{initialInstructions}</Well>
            <UnlabeledColumn master={masterView} />
          </Col>
          <Col sm={6}>
            <LabeledColumn labels={labels} />
            <Countdown
              remainingTime={this.remainingSeconds}
              onFinished={() => { this.advanceExperimentPhase(experimentState); }}
              confirmText={'Are you sure you want to move on to the next stage before time is up?'}
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
              onClick={() => { this.advanceExperimentPhase(experimentState); }}
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
              remainingTime={this.remainingSeconds}
              onFinished={() => { this.advanceExperimentPhase(experimentState); }}
              confirmText={'Are you sure you want to submit your instructions and end the experiment?'}
            />
          </Col>
        </Grid>
      );
    } else if (experimentState === States.SURVEY) {
      experimentComponent = <Grid><Survey /></Grid>;
    } else if (experimentState === States.THANKS) {
      experimentComponent = <Grid><Thanks params={this.state.params} /></Grid>;
    } else {
      experimentComponent = <Grid><h1><Loading /></h1></Grid>;
    }
    return (
      <HotKeys handlers={{ preview: () => { onSetLightbox(true); }}}>
        <div id="app">
          {prefetchAll &&
            <div className="hidden">
              {items.map(item => (
                <img
                  src={item.data.path}
                  key={item.id}
                  onLoad={() => { this.handleImageLoaded(item.id); }}
                />
              ))}
            </div>
          }
          <CustomDragLayer />
          {this.props.tutorial && (
            <Joyride
              ref={(c) => { this.joyride = c; }}
              steps={this.state.tutorialSteps}
              run={this.state.tutorialRunning}
            />
          )}
          {this.props.isExperiment
              && this.state.warnings.length > 0
              && this.state.warnings[0][0] <= this.elapsedTime()
              && (
                <Alert
                  bsStyle="warning"
                  onDismiss={this.dismissExpiredAlerts}
                  className="text-center"
                >
                  <ReactMarkdown source={this.state.warnings[0][1]} />
                </Alert>
              )
          }
          {(this.state.params.tutorial || this.state.params.taskIndex != null) && (
            <ExperimentProgress
              currentIndex={
                this.state.params.tutorial ? 0 : this.state.params.taskIndex + 1
              }
            />
          )}
          {experimentComponent}
        </div>
      </HotKeys>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = (state, { location }) => {
  const isLoaded = (
    state.experimentPhase.name != null
      && state.experimentPhase.name !== States.LOADING
  );
  return {
    experimentPhase: state.experimentPhase,
    labels: state.labels,
    clusterView: parse(location.search).clusters !== undefined,
    masterView: parse(location.search).master !== undefined,
    multiPhase: parse(location.search).multiPhase !== undefined,
    tutorial: Boolean(state.tutorial),
    isExperiment: Boolean(state.isExperiment),
    prefetchAll: Boolean(state.isExperiment),
    waitForImagesFrac: state.isExperiment ? 1 : 0,
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
  onSetLightbox: (payload) => {
    dispatch(setLightbox(payload));
  },
});

export default DragDropContext(HTML5Backend)(connect(mapStateToProps, mapDispatchToProps)(App));
