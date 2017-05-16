import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Clearfix, Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { changeExperimentPhase } from '../actions';

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

class Survey extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: '' };
    this.updateComments = this.updateComments.bind(this);
    this.submitComments = this.submitComments.bind(this);
  }

  updateComments(e) {
    this.setState({ text: e.target.value });
  }

  submitComments() {
    this.props.onSubmit({ comments: this.state.text });
  }

  render() {
    return (
      <form>
        <FormGroup>
          <ControlLabel>
            Feedback:
          </ControlLabel>
          <FormControl
            componentClass="textarea"
            placeholder="Please enter any comments you have."
            rows="6"
            value={this.state.comments}
            onChange={this.updateComments}
          />
        </FormGroup>
        <Clearfix>
          <Button
            className="pull-right"
            bsStyle="primary"
            onClick={this.submitComments}
          >
            Submit
          </Button>
        </Clearfix>
      </form>
    );
  }
}

Survey.propTypes = propTypes;

const mapDispatchToProps = dispatch => ({
  onSubmit: (formData) => {
    dispatch(changeExperimentPhase('thanks', formData));
  },
});

export default connect(null, mapDispatchToProps)(Survey);
