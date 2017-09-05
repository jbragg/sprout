import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import CurrentItemPreview from '../containers/CurrentItemPreview';
import InstructionsColumn from './InstructionsColumn';
import InstructionsSuggestionsColumn from '../containers/InstructionsSuggestionsColumn';
import Progress from '../containers/Progress';
import { States, tutorialSteps } from '../constants';
import withTutorial from '../withTutorial';

const propTypes = {
  onChangeExperimentPhase: PropTypes.func.isRequired,
  advanceExperimentPhase: PropTypes.func.isRequired,
  exportButton: PropTypes.bool.isRequired,
  tutorial: PropTypes.bool,
  countdown: PropTypes.bool.isRequired,
  remainingSeconds: PropTypes.number.isRequired,
};

const defaultProps = {
  tutorial: false,
};

const SuggestionsInterface = ({
  tutorial, exportButton, countdown,
  advanceExperimentPhase, onChangeExperimentPhase,
  remainingSeconds,
}) => (
  <div className="suggestions absolute">
    <div id="left">
      <div>
        <Progress instructions />
        <h2>Confusions</h2>
        <img
          src="/static/PiYG.png"
          height="10"
          width="100%"
        />
        <Row className="no-gutter">
          <Col
            xs={4}
          >
            <div>No</div>
          </Col>
          <Col
            className="text-center"
            xs={4}
          >
            <div>?</div>
          </Col>
          <Col
            className="text-right"
            xs={4}
          >
            <div>Yes</div>
          </Col>
        </Row>
        <InstructionsSuggestionsColumn />
      </div>
    </div>
    <div id="center">
      <div>
        <h2>Preview</h2>
        <CurrentItemPreview />
      </div>
    </div>
    <div id="right" className="instructions">
      <div>
        <h2>Instructions</h2>
        <InstructionsColumn
          tutorial={tutorial}
          countdown={countdown}
          remainingSeconds={remainingSeconds}
          advanceExperimentPhase={advanceExperimentPhase}
          currentState={States.COMBINED}
          exportButton={exportButton}
          onChangeExperimentPhase={onChangeExperimentPhase}
        />
      </div>
    </div>
  </div>
);

SuggestionsInterface.propTypes = propTypes;
SuggestionsInterface.defaultProps = defaultProps;

export default withTutorial(
  SuggestionsInterface, tutorialSteps.suggestions,
);
