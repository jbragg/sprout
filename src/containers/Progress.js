import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProgressBar } from 'react-bootstrap';
import {
  answersByInstruction, unlabeledItemIdsSelector,
} from '../reducers/index';

const propTypes = {
  labeledItems: PropTypes.number,
  totalItems: PropTypes.number,
  viewedInstructions: PropTypes.number,
  totalInstructions: PropTypes.number,
  instructions: PropTypes.bool,
};

const defaultProps = {
  labeledItems: null,
  totalItems: null,
  viewedInstructions: null,
  totalInstructions: null,
  instructions: false,
};

const Progress = ({ labeledItems, totalItems, viewedInstructions, totalInstructions, instructions }) => (
  <div className="labeling-progress">
    <strong>{!instructions ? 'Items labeled' : 'Confusions viewed'}</strong>
    <ProgressBar
      now={!instructions ? labeledItems : viewedInstructions}
      label={`${!instructions ? labeledItems : viewedInstructions}`}
      max={!instructions ? totalItems : totalInstructions}
    />
  </div>
);

Progress.propTypes = propTypes;
Progress.defaultProps = defaultProps;

const mapStateToProps = state => ({
  labeledItems: state.entities.items.byId.size - unlabeledItemIdsSelector(state).size,
  totalItems: state.entities.items.byId.size,
  viewedInstructions: state.entities.tags.byId.filter(v => v.visited).size,
  totalInstructions: answersByInstruction(state).size,
});

export default connect(mapStateToProps)(Progress);
