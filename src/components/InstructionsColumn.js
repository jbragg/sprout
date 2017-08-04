import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Export from '../containers/Export';
import Oracle from '../containers/Oracle';
import Countdown from '../components/Countdown';
import Instructions from './Instructions';
import Confirm from './Confirm';
import TestQuestions from '../containers/TestQuestions';
import { States } from '../constants';

const propTypes = {
  onChangeExperimentPhase: PropTypes.func.isRequired,
  advanceExperimentPhase: PropTypes.func.isRequired,
  oracle: PropTypes.bool,
  exportButton: PropTypes.bool.isRequired,
  tutorial: PropTypes.bool,
  countdown: PropTypes.bool.isRequired,
  remainingSeconds: PropTypes.number.isRequired,
  currentState: PropTypes.string.isRequired,
  testQuestions: PropTypes.bool,
  testQuestionsModalEditor: PropTypes.bool,
  testQuestionsAlwaysShowFinalLabels: PropTypes.bool,
};

const defaultProps = {
  oracle: false,
  tutorial: false,
  testQuestions: false,
  testQuestionsModalEditor: false,
  testQuestionsAlwaysShowFinalLabels: false,
};

const InstructionsColumn = ({
  tutorial, countdown, remainingSeconds,
  advanceExperimentPhase, currentState, oracle, exportButton,
  onChangeExperimentPhase, testQuestions, testQuestionsModalEditor,
  testQuestionsAlwaysShowFinalLabels,
}) => (
  <div>
    {oracle && (
      <div className="instructions-customer">
        <Oracle />
      </div>
    )}
    <Instructions />
    {testQuestions && (
      <TestQuestions
        modalEditor={testQuestionsModalEditor}
        alwaysShowFinalLabels={testQuestionsAlwaysShowFinalLabels}
      />
    )}
    {countdown && (
      <Countdown
        remainingTime={remainingSeconds}
        onFinished={() => { advanceExperimentPhase(currentState); }}
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
);

InstructionsColumn.propTypes = propTypes;
InstructionsColumn.defaultProps = defaultProps;

export default InstructionsColumn;
