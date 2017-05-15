import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Well } from 'react-bootstrap';
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
  <div>
    <h3>Customer Instructions</h3>
    <p>Your task is to improve these instructions:</p>
    <Well bsSize="sm">{initialInstructions}</Well>
    <Oracle />
    {structured
        ? <StructuredInstructionsEditor />
        : (
          <div>
            <h3>Improved Instructions</h3>
            <InstructionsEditor />
          </div>
        )
    }
    <TestQuestions />
  </div>
);

Instructions.propTypes = propTypes;

const mapStateToProps = state => ({
  initialInstructions: state.initialInstructions,
});

export default connect(mapStateToProps)(Instructions);
