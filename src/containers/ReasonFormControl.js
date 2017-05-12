import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormControl } from 'react-bootstrap';
import { editItem } from '../actions';
import { itemLabelsSelector } from '../reducers/index';

const propTypes = {
  reason: PropTypes.shape({
    text: PropTypes.string.isRequired,
    label: PropTypes.string,
  }),
  label: PropTypes.string,
  onEditItem: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

const defaultProps = {
  reason: null,
  label: null,
  placeholder: 'Enter the reason for your label (optional unless you make the item a test question',
};

const ReasonFormControl = ({ onEditItem, reason, label, placeholder }) => (
  <FormControl
    componentClass="textarea"
    rows="5"
    value={reason == null || reason.text == null ? '' : reason.text}
    placeholder={placeholder}
    onChange={(e) => {
      onEditItem({ reason: { label, text: e.target.value }});
    }}
  />
);

ReasonFormControl.propTypes = propTypes;
ReasonFormControl.defaultProps = defaultProps;

const mapStateToProps = (state, { itemId })  => ({
  reason: state.entities.items.byId.get(itemId).reason,
  label: itemLabelsSelector(state).get(itemId),
});

const mapDispatchToProps = (dispatch, { itemId }) => ({
  onEditItem: (keyValues) => {
    dispatch(editItem(itemId, keyValues));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ReasonFormControl);
