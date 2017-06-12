import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { parse } from 'query-string';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import Joyride from 'react-joyride';
import { Grid, Col, Well, Button, Alert } from 'react-bootstrap';
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
import { fetchExperiment, changeExperimentPhase } from '../actions';
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
  waitForImages: PropTypes.bool,
  prefetchAll: PropTypes.bool,
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
  waitForImages: false,
  prefetchAll: false,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: Date.now(),
      warnings: [],
      tutorialSteps: [],
      tutorialRunning: false,
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
        this.setState({
          itemsLoaded: new Map(nextProps.items.map(item => [item.id, false])),
        });
        if (nextProps.tutorial) {
          setTimeout(() => {
            this.setState({
              tutorialRunning: true,
              tutorialSteps,
            });
          }, 6000);  // TODO: Check subcomponents mounted for more robust solution.
        }
        if (!this.props.waitForImages) {
          this.advanceExperimentPhase();
        }
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
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
      const ready = [...itemsLoaded.values()].every(e => e);
      if (ready && props.waitForImages) {
        this.advanceExperimentPhase();
      }
      return {
        itemsLoaded,
      };
    });
  }

  advanceExperimentPhase() {
    const currentPhase = this.props.experimentPhase.name;
    if (currentPhase === States.LOADING && !this.props.multiPhase) {
      this.props.onChangeExperimentPhase(States.COMBINED);
    } else if (currentPhase === States.LOADING) {
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
      prefetchAll,
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
            <UnlabeledColumn master={masterView} />
          </Col>
          <Col sm={4}>
            <LabeledColumn labels={labels} />
          </Col>
          <Col className="instructions" sm={4}>
            <h3>Customer Instructions</h3>
            <p>Your task is to improve these instructions:</p>
            <Well bsSize="sm">{initialInstructions}</Well>
            {isExperiment && <Oracle />}
            <Instructions />
            {isExperiment
                ? (
                  <Countdown
                    remainingTime={remainingSeconds}
                    onFinished={this.advanceExperimentPhase}
                    confirmText={'Are you sure you want to submit your instructions and end the experiment?'}
                  />
                )
                : (
                  <Export>
                    <Button
                      bsStyle="primary"
                    >
                      Export
                    </Button>
                  </Export>
                )
            }
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
              onFinished={this.advanceExperimentPhase}
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
              onClick={this.advanceExperimentPhase}
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
              onFinished={this.advanceExperimentPhase}
              confirmText={'Are you sure you want to submit your instructions and end the experiment?'}
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
        {!this.props.tutorial && this.state.warnings.length > 0 && this.state.warnings[0][0] <= this.elapsedTime() &&
          <Alert
            bsStyle="warning"
            onDismiss={this.dismissExpiredAlerts}
            className="text-center"
          >
            <ReactMarkdown source={this.state.warnings[0][1]} />
          </Alert>
        }
        {experimentComponent}
      </div>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = (state, { location }) => {
  const isLoaded = (
    state.experimentPhase.name != null &&
    state.experimentPhase.name !== States.LOADING
  );
  return {
    experimentPhase: state.experimentPhase,
    labels: state.labels,
    clusterView: parse(location.search).clusters !== undefined,
    masterView: parse(location.search).master !== undefined,
    multiPhase: parse(location.search).multiPhase !== undefined,
    tutorial: state.tutorial || false,
    isExperiment: state.isExperiment,
    prefetchAll: state.isExperiment,
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
