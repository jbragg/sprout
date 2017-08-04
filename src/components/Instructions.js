import React from 'react';
import PropTypes from 'prop-types';
import InstructionsEditor from '../containers/InstructionsEditor';
import StructuredInstructionsEditor from '../containers/StructuredInstructionsEditor';

const propTypes = {
  structured: PropTypes.bool,
};

const defaultProps = {
  structured: false,
};

const Instructions = ({ structured }) => (structured
  ? <StructuredInstructionsEditor />
  : <InstructionsEditor />
);

Instructions.propTypes = propTypes;
Instructions.defaultProps = defaultProps;

export default Instructions;
