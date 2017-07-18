import React from 'react';
import PropTypes from 'prop-types';
import InstructionsEditor from '../containers/InstructionsEditor';
import StructuredInstructionsEditor from '../containers/StructuredInstructionsEditor';
import TestQuestions from '../containers/TestQuestions';

const propTypes = {
  structured: PropTypes.bool,
  testQuestions: PropTypes.bool,
};

const defaultProps = {
  structured: false,
  testQuestions: true,
};

const Instructions = ({ structured, testQuestions }) => (
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
    {testQuestions && <TestQuestions />}
  </div>
);

Instructions.propTypes = propTypes;
Instructions.defaultProps = defaultProps;

export default Instructions;
