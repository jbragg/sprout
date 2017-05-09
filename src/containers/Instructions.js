import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PanelGroup, Panel } from 'react-bootstrap';
import Oracle from './Oracle';
import InstructionsEditor from './InstructionsEditor';
import StructuredInstructionsEditor from './StructuredInstructionsEditor';
import TestQuestions from './TestQuestions';

const propTypes = {
  initialInstructions: PropTypes.string.isRequired,
  structured: PropTypes.bool,
};

const defaultProps = {
  structured: false,
};

const Instructions = ({ initialInstructions, structured }) => (
  <PanelGroup>
    <Panel header={<h4>Customer instructions</h4>}>
      <p>{initialInstructions}</p>
    </Panel>
    <Oracle />
    {structured
        ? <StructuredInstructions />
        : <InstructionsEditor />
    }
    <TestQuestions />
  </PanelGroup>
);

Instructions.propTypes = propTypes;

const mapStateToProps = state => ({
  initialInstructions: state.initialInstructions,
});

export default connect(mapStateToProps)(Instructions);
