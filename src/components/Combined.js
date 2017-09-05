import React from 'react';
import PropTypes from 'prop-types';
import UnlabeledColumn from '../containers/UnlabeledColumn';
import LabeledColumn from './LabeledColumn';
import InstructionsColumn from './InstructionsColumn';
import { States, tutorialSteps } from '../constants';
import withTutorial from '../withTutorial';

const propTypes = {
  onChangeExperimentPhase: PropTypes.func.isRequired,
  advanceExperimentPhase: PropTypes.func.isRequired,
  oracle: PropTypes.bool.isRequired,
  exportButton: PropTypes.bool.isRequired,
  tutorial: PropTypes.bool,
  countdown: PropTypes.bool.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  remainingSeconds: PropTypes.number.isRequired,
};

const defaultProps = {
  tutorial: false,
};

const Combined = ({
  oracle, tutorial, exportButton, countdown,
  advanceExperimentPhase, onChangeExperimentPhase, labels,
  remainingSeconds,
}) => (
  <div className="combined absolute">
    <div id="left">
      <UnlabeledColumn />
    </div>
    <div id="center">
      <LabeledColumn labels={labels} />
    </div>
    <div id="right" className="instructions">
      <InstructionsColumn
        tutorial={tutorial}
        countdown={countdown}
        remainingSeconds={remainingSeconds}
        advanceExperimentPhase={advanceExperimentPhase}
        currentState={States.COMBINED}
        oracle={oracle}
        exportButton={exportButton}
        onChangeExperimentPhase={onChangeExperimentPhase}
        testQuestions
        testQuestionsModalEditor
      />
    </div>
  </div>
);

Combined.propTypes = propTypes;
Combined.defaultProps = defaultProps;

export default withTutorial(
  Combined, tutorialSteps.structuredLabeling,
);
