import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import Confirm from '../components/Confirm';
import { changeExperimentPhase } from '../actions';

const propTypes = {
  onEndExperiment: PropTypes.func.isRequired,
  duration: PropTypes.number.isRequired,
  startTime: PropTypes.number.isRequired,
};

class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: Date.now(),
      clicked: false,
    };
    this.confirmed = this.confirmed.bind(this);
    this.confirm = this.confirm.bind(this);
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
    if (this.remainingTime() < 0) {
      this.props.onEndExperiment();
    }
  }

  remainingTime() {
    const { duration, startTime } = this.props;
    return Math.round((duration - (this.state.date - startTime)) / 1000);
  }

  confirm() {
    this.setState({ clicked: true });
  }

  confirmed() {
    this.setState({ clicked: false });
  }

  render() {
    const remainingTime = this.remainingTime();
    const remainingMinutes = Math.max(Math.floor(remainingTime / 60), 0);
    const remainingSeconds = Math.max(remainingTime % 60, 0);
    const formatNumber = number => (number < 10 ? `0${number}` : number);
    return (
      <div>
        <Confirm
          onConfirm={() => { this.props.onEndExperiment(); this.confirmed(); }}
          onDismiss={this.confirmed}
          show={this.state.clicked}
          text={'Are you sure you want to submit your instructions and end the experiment?'}
        />
        <Button
          bsStyle="primary"
          onClick={this.confirm}
        >
        {`Submit Instructions (${formatNumber(remainingMinutes)}:${formatNumber(remainingSeconds)} remaining)`}
      </Button>
      </div>
    );
  }
}

Countdown.propTypes = propTypes;

const mapStateToProps = state => ({
  duration: state.experimentDuration,
  startTime: state.experimentStartTime,
});

const mapDispatchToProps = dispatch => ({
  onEndExperiment: () => { dispatch(changeExperimentPhase('survey')); },
});

export default connect(mapStateToProps, mapDispatchToProps)(Countdown);
