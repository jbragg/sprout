import React from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, Radio } from 'react-bootstrap';

const propTypes = {
  txt: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired),
};

const defaultProps = {
  value: null,
  labels: [
    'Strongly disagree',
    'Disagree',
    'Neutral',
    'Agree',
    'Strongly agree',
  ],
};

const Likert = ({ txt, onChange, value, labels }) => (
  <tr>
    <td>
      <ControlLabel>
        {txt}
      </ControlLabel>
    </td>
    {[labels.map((label, index) => (
      <td key={label}>
        <Radio value={index} checked={value === index} onChange={onChange} inline>
          {label}
        </Radio>
      </td>
    ))]}
  </tr>
);

Likert.propTypes = propTypes;
Likert.defaultProps = defaultProps;

export default Likert;
