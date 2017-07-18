import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Confirm from './Confirm';

const propTypes = {
  onFinished: PropTypes.func.isRequired,
  remainingTime: PropTypes.number.isRequired,
  confirmText: PropTypes.string.isRequired,
};

class Countdown extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.remainingTime !== this.props.remainingTime &&
      nextProps.remainingTime <= 0
    ) {
      this.props.onFinished();
    }
  }

  render() {
    const { remainingTime } = this.props;
    const remainingMinutes = Math.max(Math.floor(remainingTime / 60), 0);
    const remainingSeconds = Math.max(Math.floor(remainingTime % 60), 0);
    const formatNumber = number => (number < 10 ? `0${number}` : number);
    return (
      <div>
        <Confirm
          onConfirm={this.props.onFinished}
          text={this.props.confirmText}
        >
          <Button
            bsStyle="primary"
          >
            {`Submit (${formatNumber(remainingMinutes)}:${formatNumber(remainingSeconds)} remaining)`}
          </Button>
        </Confirm>
      </div>
    );
  }
}

Countdown.propTypes = propTypes;

export default Countdown;
