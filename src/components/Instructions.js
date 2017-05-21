import React from 'react';
import PropTypes from 'prop-types';
import InstructionsEditor from '../containers/InstructionsEditor';
import StructuredInstructionsEditor from '../containers/StructuredInstructionsEditor';
import TestQuestions from '../containers/TestQuestions';

const propTypes = {
  structured: PropTypes.bool,
};

const defaultProps = {
  structured: false,
};

const Instructions = ({ structured }) => (
  <div>
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
Instructions.defaultProps = defaultProps;

export default Instructions;
