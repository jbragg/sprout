import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

const propTypes = {
  // remainingTime: PropTypes.number.isRequired,
};

class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = { date: Date.now() };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000,
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({ date: Date.now() });
  }

  render() {
    const { duration, startTime } = this.props;
    const remainingTime = Math.round((duration - (this.state.date - startTime)) / 1000);
    const remainingMinutes = Math.max(Math.floor(remainingTime / 60), 0);
    const remainingSeconds = Math.max(remainingTime % 60, 0);
    const formatNumber = number => (number < 10 ? `0${number}` : number);
    return (
      <Button bsStyle="primary">
        {`Submit Instructions (${formatNumber(remainingMinutes)}:${formatNumber(remainingSeconds)} remaining)`}
      </Button>
    );
  }
}

Countdown.propTypes = propTypes;

const mapStateToProps = state => ({
  duration: state.experimentDuration,
  startTime: state.experimentStartTime,
});

export default connect(mapStateToProps)(Countdown);
