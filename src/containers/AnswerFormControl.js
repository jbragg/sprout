import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormControl } from 'react-bootstrap';
import { editItem, assignItems } from '../actions';
import { itemLabelsSelector } from '../reducers/index';

const propTypes = {
  reason: PropTypes.shape({
    text: PropTypes.string,
    label: PropTypes.string,
  }),
  label: PropTypes.string,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onEditItem: PropTypes.func.isRequired,
  onAssignItem: PropTypes.func.isRequired,
  itemId: PropTypes.number.isRequired,
  updateReason: PropTypes.bool,
};

const defaultProps = {
  reason: null,
  label: null,
  updateReason: true,
};

const AnswerFormControl = ({
  onEditItem, onAssignItem, reason, label, labels, itemId, updateReason,
}) => (
  <FormControl
    componentClass="select"
    placeholder="Your label"
    value={label || ''}
    onChange={(e) => {
      const newLabel = e.target.value || null;
      const currentReason = reason && reason.text;
      onAssignItem(
        [itemId],
        { label: newLabel },
        false,
        false,
      );
      if (updateReason) {
        onEditItem(
          itemId,
          { reason: { label: newLabel, text: currentReason } },
        );
      }
    }}
  >
    <option />
    {labels.map(s => (
      <option key={s}>{s}</option>
    ))}
  </FormControl>
);

AnswerFormControl.propTypes = propTypes;
AnswerFormControl.defaultProps = defaultProps;

const mapStateToProps = (state, { itemId }) => ({
  reason: state.entities.items.byId.get(itemId).reason,
  label: itemLabelsSelector(state).get(itemId),
  labels: state.config.finalLabels,
});

const mapDispatchToProps = {
  onEditItem: editItem,
  onAssignItem: assignItems,
};

export default connect(mapStateToProps, mapDispatchToProps)(AnswerFormControl);
