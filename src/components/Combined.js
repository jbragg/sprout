import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Well, Button } from 'react-bootstrap';
import Joyride from 'react-joyride';
import ReactMarkdown from 'react-markdown';
import { States, tutorialSteps } from '../constants';
import UnlabeledColumn from '../containers/UnlabeledColumn';
import LabeledColumn from './LabeledColumn';
import Export from '../containers/Export';
import Progress from '../containers/Progress';
import Oracle from '../containers/Oracle';
import Instructions from './Instructions';
import Countdown from '../components/Countdown';
import Confirm from './Confirm';

const propTypes = {
  masterView: PropTypes.bool.isRequired,
  onChangeExperimentPhase: PropTypes.func.isRequired,
  advanceExperimentPhase: PropTypes.func.isRequired,
  oracle: PropTypes.bool.isRequired,
  testQuestions: PropTypes.bool.isRequired,
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
      setTimeout(() => {
        this.setState({
          tutorialRunning: true,
        });
      }, 3000);
    }
  }

  render() {
    const {
      masterView, oracle, tutorial, exportButton, countdown,
      advanceExperimentPhase, onChangeExperimentPhase, labels,
      initialInstructions, remainingSeconds, testQuestions,
    } = this.props;
    return (
      <Grid fluid className="combined">
        {tutorial && (
          <Joyride
            ref={(c) => { this.joyride = c; }}
            steps={tutorialSteps.map(step => ({
              ...step,
              text: <ReactMarkdown source={step.text} />,
            }))}
            run={this.state.tutorialRunning}
            type={'continuous' && 'single'}
            scrollToSteps={false}
          />
        )}
        <div id="left">
          <UnlabeledColumn master={masterView} />
        </div>
        <div id="center">
          <Progress />
          <LabeledColumn labels={labels} />
        </div>
        <div id="right" className="instructions">
          <div className="instructions-customer">
            <h3>Customer Instructions</h3>
            <p>Your task is to improve these instructions:</p>
            <Well bsSize="sm">{initialInstructions}</Well>
            {oracle && <Oracle />}
          </div>
          <Instructions testQuestions={testQuestions} />
          {countdown && (
            <Countdown
              remainingTime={remainingSeconds}
              onFinished={() => { advanceExperimentPhase(States.COMBINED); }}
              confirmText={'Are you sure you want to submit your instructions and end the experiment?'}
              expireText={'Time is up! Are you ready to proceed to the next part of the experiment?'}
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
            <Confirm
              onConfirm={() => { onChangeExperimentPhase(States.THANKS); }}
              text="Have you completed the tutorial? Check with the experimenter."
            >
              <Button
                className="btn-ready"
                bsStyle="primary"
              >
                Ready for experiment
              </Button>
            </Confirm>
          )}
        </div>
      </Grid>
    );
  }
}

Combined.propTypes = propTypes;

export default Combined;
