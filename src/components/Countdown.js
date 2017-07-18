import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Confirm from './Confirm';

const propTypes = {
  onFinished: PropTypes.func.isRequired,
  remainingTime: PropTypes.number.isRequired,
  confirmText: PropTypes.string.isRequired,
  expireText: PropTypes.string.isRequired,
};

class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expired: false };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.remainingTime !== this.props.remainingTime &&
      nextProps.remainingTime <= 0
    ) {
      this.setState({ expired: true });
    }
  }

  render() {
    const { remainingTime } = this.props;
    const remainingMinutes = Math.max(Math.floor(remainingTime / 60), 0);
    const remainingSeconds = Math.max(Math.floor(remainingTime % 60), 0);
    const formatNumber = number => (number < 10 ? `0${number}` : number);
    return (
      <Confirm
        onConfirm={this.props.onFinished}
        text={this.state.expired
          ? this.props.expireText
          : this.props.confirmText
        }
        dismissable={!this.state.expired}
        show={this.state.expired || null}
      >
        <Button
          bsStyle="primary"
        >
          {`Submit (${formatNumber(remainingMinutes)}:${formatNumber(remainingSeconds)} remaining)`}
        </Button>
      </Confirm>
    );
  }
}

Countdown.propTypes = propTypes;

export default Countdown;
