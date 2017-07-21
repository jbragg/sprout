import React from 'react';
import PropTypes from 'prop-types';
import LabelSection from '../containers/LabelSection';

const propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

const LabeledColumn = ({ labels }) => (
  <div className="labeled-column">
    {labels.map(label => <LabelSection label={label} key={label} />)}
  </div>
);

LabeledColumn.propTypes = propTypes;

export default LabeledColumn;
