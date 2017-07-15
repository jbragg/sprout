import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Col, Well, Button } from 'react-bootstrap';
import Joyride from 'react-joyride';
import { States, tutorialSteps } from '../constants';
import UnlabeledColumn from '../containers/UnlabeledColumn';
import LabeledColumn from './LabeledColumn';
import Export from '../containers/Export';
import Progress from '../containers/Progress';
import Oracle from '../containers/Oracle';
import Instructions from './Instructions';
import Countdown from '../components/Countdown';

const propTypes = {
  masterView: PropTypes.bool.isRequired,
  onChangeExperimentPhase: PropTypes.func.isRequired,
  advanceExperimentPhase: PropTypes.func.isRequired,
  oracle: PropTypes.bool.isRequired,
  exportButton: PropTypes.bool.isRequired,
  tutorial: PropTypes.bool.isRequired,
  countdown: PropTypes.bool.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  initialInstructions: PropTypes.string.isRequired,
  remainingSeconds: PropTypes.number.isRequired,
};

class Combined extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tutorialRunning: false,
    };
  }

  componentDidMount() {
    if (this.props.tutorial) {
      this.setState({
        tutorialRunning: true,
      });
    }
  }

  render() {
    const {
      masterView, oracle, tutorial, exportButton, countdown,
      advanceExperimentPhase, onChangeExperimentPhase, labels,
      initialInstructions, remainingSeconds,
    } = this.props;
    return (
      <Grid fluid>
        {tutorial && (
          <Joyride
            ref={(c) => { this.joyride = c; }}
            steps={tutorialSteps}
            run={this.state.tutorialRunning}
            type={'continuous' && 'single'}
            scrollToSteps={false}
          />
        )}
        <Col id="left" sm={4}>
          <div>
            <UnlabeledColumn master={masterView} />
          </div>
        </Col>
        <Col id="center" sm={4}>
          <Progress />
          <LabeledColumn labels={labels} />
        </Col>
        <Col id="right" className="instructions" sm={4}>
          <div>
            <div className="instructions-customer">
              <h3>Customer Instructions</h3>
              <p>Your task is to improve these instructions:</p>
              <Well bsSize="sm">{initialInstructions}</Well>
              {oracle && <Oracle />}
            </div>
            <Instructions />
            {countdown && (
              <Countdown
                remainingTime={remainingSeconds}
                onFinished={() => { advanceExperimentPhase(States.COMBINED); }}
                confirmText={'Are you sure you want to submit your instructions and end the experiment?'}
              />
            )}
            {exportButton && (
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
                onClick={() => { onChangeExperimentPhase(States.THANKS); }}
              >
                Ready for experiment
              </Button>
            )}
          </div>
        </Col>
      </Grid>
    );
  }
}

Combined.propTypes = propTypes;

export default Combined;
