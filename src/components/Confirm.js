import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onDismiss: PropTypes.func,
  dismissable: PropTypes.bool,
  text: PropTypes.string.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node,
  confirmText: PropTypes.string,
  dismissText: PropTypes.string,
};

const defaultProps = {
  show: null,
  onDismiss: () => {},
  dismissable: true,
  children: null,
  confirmText: 'Yes',
  dismissText: 'Never mind',
};

class Confirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show() {
    this.setState({ show: true });
  }

  hide() {
    this.setState({ show: false });
  }

  render() {
    const {
      onConfirm, onDismiss, text, dismissable,
      confirmText, dismissText, children,
    } = this.props;
    const show = this.props.show == null ? this.state.show : this.props.show;
    const modalComponent = (
      <Modal show={show}>
        <Modal.Body>
          <p>{text}</p>
        </Modal.Body>
        <Modal.Footer>
          {dismissable && (
            <Button
              onClick={() => { onDismiss(); this.hide(); }}
            >
              {dismissText}
            </Button>
          )}
          <Button
            bsStyle="primary"
            onClick={() => { onConfirm(); this.hide(); }}
          >
            {confirmText}
          </Button>
        </Modal.Footer>
      </Modal>
    );
    return (children
      ? (
        <div>
          {modalComponent}
          {React.cloneElement(
            React.Children.only(children),
            { onClick: this.show },
          )}
        </div>
      )
      : modalComponent
    );
  }
}

Confirm.propTypes = propTypes;
Confirm.defaultProps = defaultProps;

export default Confirm;
