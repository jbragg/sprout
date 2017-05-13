import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
};

const Confirm = ({ onConfirm, onDismiss, text, show }) => (
  <Modal show={show}>
    <Modal.Body>
      <p>{text}</p>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={onDismiss}>Never mind</Button>
      <Button bsStyle="primary" onClick={onConfirm}>Yes</Button>
    </Modal.Footer>
  </Modal>
);

Confirm.propTypes = propTypes;

export default Confirm;
