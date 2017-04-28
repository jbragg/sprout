import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProgressBar } from 'react-bootstrap';
import { unlabeledItemsSelector } from '../reducers/index';

const propTypes = {
  labeledItems: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
};

const Progress = ({ labeledItems, totalItems }) => (
  <ProgressBar
    now={labeledItems}
    label={`${labeledItems}`}
    max={totalItems}
  />
);

Progress.propTypes = propTypes;

const mapStateToProps = state => ({
  labeledItems: state.entities.items.byId.size - unlabeledItemsSelector(state).length,
  totalItems: state.entities.items.byId.size,
});

export default connect(mapStateToProps)(Progress);
