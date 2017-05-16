import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const propTypes = {
  n: PropTypes.number.isRequired,
};

const GroupDrag = ({ n }) => (
  <Button bsSize="large" bsStyle="primary">{n}</Button>
);

GroupDrag.propTypes = propTypes;

export default GroupDrag;
