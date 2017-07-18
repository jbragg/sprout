import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onDismiss: PropTypes.func,
  text: PropTypes.string.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node,
};

const defaultProps = {
  show: null,
  onDismiss: () => {},
  children: null,
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
    const { onConfirm, onDismiss, text, children } = this.props;
    const show = this.props.show == null ? this.state.show : this.props.show;
    const modalComponent = (
      <Modal show={show}>
        <Modal.Body>
          <p>{text}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => { onDismiss(); this.hide(); }}
          >
            Never mind
          </Button>
          <Button
            bsStyle="primary"
            onClick={() => { onConfirm(); this.hide(); }}
          >
            Yes
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
