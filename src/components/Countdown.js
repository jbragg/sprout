import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Confirm from './Confirm';

const propTypes = {
  onFinished: PropTypes.func.isRequired,
  duration: PropTypes.number.isRequired,
  startTime: PropTypes.number.isRequired,
  now: PropTypes.number.isRequired,
  confirmText: PropTypes.string.isRequired,
};

class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
    };
    this.confirmed = this.confirmed.bind(this);
    this.confirm = this.confirm.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.now !== this.props.now && this.remainingTime(nextProps.now) <= 0) {
      this.props.onFinished();
    }
  }

  remainingTime(now) {
    const { duration, startTime } = this.props;
    return Math.round((duration - (now - startTime)) / 1000);
  }

  confirm() {
    this.setState({ clicked: true });
  }

  confirmed() {
    this.setState({ clicked: false });
  }

  render() {
    const remainingTime = this.remainingTime(this.props.now);
    const remainingMinutes = Math.max(Math.floor(remainingTime / 60), 0);
    const remainingSeconds = Math.max(remainingTime % 60, 0);
    const formatNumber = number => (number < 10 ? `0${number}` : number);
    return (
      <div>
        <Confirm
          onConfirm={() => { this.props.onFinished(); this.confirmed(); }}
          onDismiss={this.confirmed}
          show={this.state.clicked}
          text={this.props.confirmText}
        />
        <Button
          bsStyle="primary"
          onClick={this.confirm}
        >
          {`Submit (${formatNumber(remainingMinutes)}:${formatNumber(remainingSeconds)} remaining)`}
        </Button>
      </div>
    );
  }
}

Countdown.propTypes = propTypes;

export default Countdown;
