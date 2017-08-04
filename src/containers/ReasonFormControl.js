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
  placeholder: PropTypes.string,
  itemId: PropTypes.number.isRequired,
  editableAnswer: PropTypes.bool,
};

const defaultProps = {
  reason: null,
  label: null,
  placeholder: 'Your reason will be shown to a worker that gets the question wrong (if you make this a test question).',
  editableAnswer: true,
};

const ReasonFormControl = ({
  onEditItem, onAssignItem, reason, label, placeholder, labels, itemId,
  editableAnswer,
}) => {
  const reasonComponent = (
    <FormControl
      componentClass="textarea"
      rows="5"
      value={(reason && reason.text) || ''}
      placeholder={placeholder}
      onChange={(e) => {
        onEditItem(itemId, { reason: { label, text: e.target.value } });
      }}
    />
  );
  if (!editableAnswer) {
    return reasonComponent;
  }
  return (
    <tr>
      <td>
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
            onEditItem(
              itemId,
              { reason: { label: newLabel, text: currentReason } },
            );
          }}
        >
          <option />
          {labels.map(s => (
            <option key={s}>{s}</option>
          ))}
        </FormControl>
      </td>
      <td>
        {reasonComponent}
      </td>
    </tr>
  );
};

ReasonFormControl.propTypes = propTypes;
ReasonFormControl.defaultProps = defaultProps;

const mapStateToProps = (state, { itemId }) => ({
  reason: state.entities.items.byId.get(itemId).reason,
  label: itemLabelsSelector(state).get(itemId),
  labels: state.config.finalLabels,
});

const mapDispatchToProps = {
  onEditItem: editItem,
  onAssignItem: assignItems,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReasonFormControl);
