import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import { HotKeys } from 'react-hotkeys';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { Grid, Col, Button } from 'react-bootstrap';
import AlertContainer from 'react-alert';
import Instructions from '../components/Instructions';
import Loading from '../components/Loading';
import UnlabeledColumn from './UnlabeledColumn';
import LabeledColumn from '../components/LabeledColumn';
import Countdown from '../components/Countdown';
import Combined from '../components/Combined';
import SuggestionsInterface from '../components/SuggestionsInterface';
import Survey from './Survey';
import Oracle from './Oracle';
import CustomDragLayer from '../CustomDragLayer';
import Clusters from './Clusters';
import Raw from './Raw';
import Thanks from '../components/Thanks';
import ExperimentProgress from '../components/ExperimentProgress';
import { changeExperimentPhase, setLightbox } from '../actions';
import { itemDataSelector } from '../reducers/index';
import { currentItemIdSelector } from '../reducers/currentItem';
import { States, defaults } from '../constants';


const propTypes = {
  experimentPhase: PropTypes.shape({
    name: PropTypes.string,
    startTime: PropTypes.number,
  }).isRequired,
  experimentPosition: PropTypes.shape({
    taskIndex: PropTypes.number,
    tutorialIndex: PropTypes.number,
    nTutorials: PropTypes.number,
    nTasks: PropTypes.number,
  }),
  experimentId: PropTypes.string,
  participantId: PropTypes.string,
  participantIndex: PropTypes.number,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  items: ImmutablePropTypes.orderedMapOf(
    PropTypes.shape({
      data: PropTypes.shape({
        path: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
  onChangeExperimentPhase: PropTypes.func.isRequired,
  clusterView: PropTypes.bool,
  rawView: PropTypes.bool,
  tutorial: PropTypes.bool,
  multiPhase: PropTypes.bool,
  waitForImagesFrac: PropTypes.number,
  prefetchAll: PropTypes.bool,
  onSetLightbox: PropTypes.func.isRequired,
  exportButton: PropTypes.bool.isRequired,
  countdown: PropTypes.bool.isRequired,
  oracle: PropTypes.bool.isRequired,
  warnings: PropTypes.bool.isRequired,
  currentItemId: PropTypes.number,
  interfaceName: PropTypes.string.isRequired,
};

const defaultProps = {
  clusterView: false,
  rawView: false,
  tutorial: false,
  multiPhase: false,
  waitForImagesFrac: 1,
  prefetchAll: true,
  experimentPosition: null,
  experimentId: null,
  participantId: undefined,
  participantIndex: undefined,
  currentItemId: null,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: Date.now(),
      warnings: [],
      itemsLoaded: new Map([...props.items.keys()].map(id => [id, false])),
    };
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
    this.advanceExperimentPhase = this.advanceExperimentPhase.bind(this);
    this.remainingTime = this.remainingTime.bind(this);
    this.elapsedTime = this.elapsedTime.bind(this);

    if (!props.prefetchAll) {
      this.advanceExperimentPhase(props.experimentPhase.name);
    }
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000,
    );
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.warnings
      && this.props.experimentPhase.name !== nextProps.experimentPhase.name
    ) {
      this.alert.removeAll();
      const warnings = defaults.warnings[nextProps.experimentPhase.name] || [];
      this.setState({ warnings });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState((state) => {
      // Keep at most one expired warning.
      const pastWarnings = state.warnings.filter(([time]) => time <= this.elapsedTime());
      if (this.props.warnings) {
        pastWarnings.forEach(([, warning]) => {
          this.alert.info(<ReactMarkdown source={warning} />, { time: 0 });
        });
      }
      const newWarnings = state.warnings.slice(pastWarnings.length);
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
        frac >= this.props.waitForImagesFrac
        && props.experimentPhase.name === States.LOADED
      ) {
        this.advanceExperimentPhase(props.experimentPhase.name);
      }
      return {
        itemsLoaded,
      };
    });
  }

  advanceExperimentPhase(currentPhase, payload = null) {
    if (currentPhase === States.LOADED && this.props.experimentPosition != null) {
      this.props.onChangeExperimentPhase(States.WELCOME, payload);
    } else if ((currentPhase === States.LOADED || currentPhase === States.WELCOME) && !this.props.multiPhase) {
      this.props.onChangeExperimentPhase(States.COMBINED, payload);
    } else if (currentPhase === States.LOADED || currentPhase === States.WELCOME) {
      this.props.onChangeExperimentPhase(States.LABELING, payload);
    } else if (currentPhase === States.COMBINED || currentPhase === States.INSTRUCTIONS) {
      this.props.onChangeExperimentPhase(States.SURVEY, payload);
    } else if (currentPhase === States.LABELING) {
      this.props.onChangeExperimentPhase(States.ORACLE, payload);
    } else if (currentPhase === States.ORACLE) {
      this.props.onChangeExperimentPhase(States.INSTRUCTIONS, payload);
    }
  }

  render() {
    const {
      items, labels, clusterView, oracle,
      prefetchAll, tutorial, onSetLightbox, rawView, countdown, exportButton,
      currentItemId, interfaceName,
    } = this.props;
    const experimentState = this.props.experimentPhase.name;
    if (experimentState == null || experimentState === States.LOADING) {
      return <Grid><h1><Loading /></h1></Grid>;
    } else if (clusterView) {
      return <Grid fluid><Clusters /></Grid>;
    } else if (rawView) {
      return <Grid fluid><Raw /></Grid>;
    }
    let experimentComponent = null;
    const remainingSeconds = this.remainingTime() / 1000;
    if (experimentState === States.WELCOME) {
      experimentComponent = (
        <Grid>
          <p>You are about to begin {this.props.experimentPosition.tutorialIndex != null ? 'practice task' : 'real task'} {this.props.experimentPosition.tutorialIndex != null ? `${this.props.experimentPosition.tutorialIndex + 1} / ${this.props.experimentPosition.nTutorials}` : `${this.props.experimentPosition.taskIndex + 1} / ${this.props.experimentPosition.nTasks}`}.</p>
          {this.props.experimentPosition.tutorialIndex != null && (
            <div>
              <p>In the practice task, please follow the tutorial by clicking on each flashing red dot you see and following the instructions. You should ask the experimenter about anything that is confusing in the practice task.</p>
              <p>After this practice task, there will be a timed task in a different domain using this interface.</p>
            </div>
          )}
          <Button
            bsStyle="primary"
            onClick={() => { this.advanceExperimentPhase(experimentState); }}
          >
            Ready to begin
          </Button>
        </Grid>
      );
    } else if (experimentState === States.COMBINED) {
      experimentComponent = (interfaceName === 'suggestions'
        ? (
          <SuggestionsInterface
            oracle={oracle}
            countdown={countdown}
            exportButton={exportButton}
            remainingSeconds={remainingSeconds}
            advanceExperimentPhase={this.advanceExperimentPhase}
            onChangeExperimentPhase={this.props.onChangeExperimentPhase}
            tutorial={tutorial}
          />
        )
        : (
          <Combined
            labels={labels}
            oracle={oracle}
            countdown={countdown}
            exportButton={exportButton}
            remainingSeconds={remainingSeconds}
            advanceExperimentPhase={this.advanceExperimentPhase}
            onChangeExperimentPhase={this.props.onChangeExperimentPhase}
            tutorial={tutorial}
          />
        )
      );
    } else if (experimentState === States.LABELING) {
      experimentComponent = (
        <Grid fluid>
          <Col sm={6}>
            <UnlabeledColumn />
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
      experimentComponent = (
        <Grid>
          <Thanks
            params={{
              ...this.props.experimentPosition,
              experimentId: this.props.experimentId,
              participantId: this.props.participantId,
              participantIndex: this.props.participantIndex,
            }}
          />
        </Grid>
      );
    } else {
      experimentComponent = <Grid><h1><Loading /></h1></Grid>;
    }
    return (
      <HotKeys
        handlers={{
          preview: () => { onSetLightbox({ id: currentItemId }); },
        }}
      >
        <div
          id="app"
          className={classNames({
            experiment: (
              this.props.experimentPosition
              && this.props.experimentPosition.taskIndex != null
            ),
            'experiment-tutorial': (
              this.props.experimentPosition
              && this.props.experimentPosition.tutorialIndex != null
            ),
          })}
        >
          {prefetchAll &&
            <div className="hidden">
              {[...items.values()].map(item => (
                <img
                  src={item.data.path}
                  key={item.id}
                  onLoad={() => { this.handleImageLoaded(item.id); }}
                />
              ))}
            </div>
          }
          <CustomDragLayer />
          {this.props.experimentPosition && (
            <ExperimentProgress
              tutorialIndex={this.props.experimentPosition.tutorialIndex}
              taskIndex={this.props.experimentPosition.taskIndex}
              nTutorials={this.props.experimentPosition.nTutorials}
              nTasks={this.props.experimentPosition.nTasks}
            />
          )}
          {experimentComponent}
          {this.props.warnings && (
            <AlertContainer
              ref={(c) => { this.alert = c; }}
              position="top left"
              theme="light"
            />
          )}
        </div>
      </HotKeys>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = state => ({
  experimentPhase: state.experimentPhase,
  labels: state.config.labels,
  tutorial: state.config.tutorial,
  waitForImagesFrac: state.config.waitForImagesFrac,
  items: itemDataSelector(state).byId,
  experimentPosition: state.config.experimentPosition,
  experimentId: state.config.experimentId,
  participantId: state.config.participantId,
  participantIndex: state.config.participantIndex,
  currentItemId: currentItemIdSelector(state),
  clusterView: state.config.clusterView,
  rawView: state.config.rawView,
  multiPhase: state.config.multiPhase,
  prefetchAll: state.config.prefetchAll,
  exportButton: state.config.exportButton,
  countdown: state.config.countdown,
  oracle: state.config.oracle,
  warnings: state.config.warnings,
  interfaceName: state.config.interface,
});

const mapDispatchToProps = {
  onChangeExperimentPhase: changeExperimentPhase,
  onSetLightbox: setLightbox,
};

export default DragDropContext(HTML5Backend)(connect(mapStateToProps, mapDispatchToProps)(App));
