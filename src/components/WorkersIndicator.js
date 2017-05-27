import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  workers: PropTypes.number.isRequired,
  pullRight: PropTypes.bool,
};

const defaultProps = {
  pullRight: true,
};

const WorkersIndicator = ({ workers, pullRight }) => (
  <span className={`workers-indicator ${pullRight ? 'pull-right' : ''}`}>
    {workers}
    {' '}
    <span className="glyphicon glyphicon-user" />
  <span className="glyphicon glyphicon-triangle-bottom" />
  </span>
);

WorkersIndicator.propTypes = propTypes;
WorkersIndicator.defaultProps = defaultProps;

export default WorkersIndicator;
