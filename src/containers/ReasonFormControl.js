import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormControl } from 'react-bootstrap';
import { editItem } from '../actions';

const propTypes = {
  reason: PropTypes.string,
  onEditItem: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

const defaultProps = {
  reason: null,
  placeholder: 'Enter the reason for your label (optional unless you make the item a test question',
};

const ReasonFormControl = ({ onEditItem, reason, placeholder }) => (
  <FormControl
    componentClass="textarea"
    rows="5"
    value={reason || ''}
    placeholder={placeholder}
    onChange={(e) => { onEditItem({ reason: e.target.value }); }}
  />
);

ReasonFormControl.propTypes = propTypes;
ReasonFormControl.defaultProps = defaultProps;

const mapStateToProps = (state, { itemId })  => ({
  reason: state.entities.items.byId.get(itemId).reason,
});

const mapDispatchToProps = (dispatch, { itemId }) => ({
  onEditItem: (keyValues) => {
    dispatch(editItem(itemId, keyValues));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ReasonFormControl);
