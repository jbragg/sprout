import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import Confirm from '../components/Confirm';
import { changeExperimentPhase } from '../actions';

const propTypes = {
  onEndExperiment: PropTypes.func.isRequired,
  duration: PropTypes.number.isRequired,
  startTime: PropTypes.number,
  now: PropTypes.number.isRequired,
};

const defaultProps = {
  startTime: null,
};

class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
    };
    this.confirmed = this.confirmed.bind(this);
    this.confirm = this.confirm.bind(this);
    this.ready = this.ready.bind(this);
  }

  ready() {
    return this.props.startTime != null;
  }

  componentWillReceiveProps(nextProps) {
    if (this.ready() && nextProps.now !== this.props.now && this.remainingTime(nextProps.now) <= 0) {
      this.props.onEndExperiment();
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
    if (!this.ready()) {
      return null;
    }
    const remainingTime = this.remainingTime(this.props.now);
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
Countdown.defaultProps = defaultProps;

const mapStateToProps = state => ({
  duration: state.experimentDuration,
  startTime: state.experimentStartTime,
});

const mapDispatchToProps = dispatch => ({
  onEndExperiment: () => { dispatch(changeExperimentPhase('survey')); },
});

export default connect(mapStateToProps, mapDispatchToProps)(Countdown);
