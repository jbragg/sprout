import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormControl } from 'react-bootstrap';
import { editItem } from '../actions';
import { itemLabelsSelector } from '../reducers/index';

const propTypes = {
  reason: PropTypes.shape({
    text: PropTypes.string,
    label: PropTypes.string,
  }),
  label: PropTypes.string,
  onEditItem: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  itemId: PropTypes.number.isRequired,
};

const defaultProps = {
  reason: null,
  label: null,
  placeholder: 'Your reason will be shown to a worker that gets the question wrong (if you make this a test question).',
};

const ReasonFormControl = ({
  onEditItem, reason, label, placeholder, itemId,
}) => (
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

ReasonFormControl.propTypes = propTypes;
ReasonFormControl.defaultProps = defaultProps;

const mapStateToProps = (state, { itemId }) => ({
  reason: state.entities.items.byId.get(itemId).reason,
  label: itemLabelsSelector(state).get(itemId),
});

const mapDispatchToProps = {
  onEditItem: editItem,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReasonFormControl);
