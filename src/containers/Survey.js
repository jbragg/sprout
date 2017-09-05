import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Clearfix, Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { changeExperimentPhase } from '../actions';
import { States } from '../constants';
import Likert from '../components/Likert';

const usefulLabels = [
  'Very unhelpful',
  'Somewhat unhelpful',
  'Neutral',
  'Somewhat helpful',
  'Very helpful',
];

const bothQuestions = [
  {
    name: 'enjoy',
    txt: 'How much did you enjoy using the interface?',
    labels: [
      'Strongly disliked',
      'Somewhat disliked',
      'Neutral',
      'Somewhat enjoyed',
      'Strongly enjoyed',
    ],
  },
  {
    name: 'ease',
    txt: 'How easy was using the interface?',
    labels: [
      'Very difficult',
      'Somewhat difficult',
      'Neutral',
      'Somewhat easy',
      'Very easy',
    ],
  },
  {
    name: 'effective',
    txt: 'How effective was the interface for making instructions?',
    labels: [
      'Very ineffective',
      'Somewhat ineffective',
      'Neutral',
      'Somewhat effective',
      'Very effective',
    ],
  },
];

const interfaceQuestions = {
  suggestions: [
    ...bothQuestions,
    {
      name: 'workerOrganization',
      txt: 'How helpful was having the items already organized by workers (in the left column)?',
      labels: usefulLabels,
    },
    {
      name: 'workerAnswers',
      txt: "How helpful were the individual worker answers ('yes' / 'no' / '?') and reasons (in the item preview in the center column)?",
      labels: usefulLabels,
    },
    {
      name: 'suggestedTestQuestions',
      txt: 'How helpful were the recommended test questions (above the test questions in the right column)?',
      labels: usefulLabels,
    },
    {
      name: 'similarItems',
      txt: 'How helpful were the similar items (below the item preview in the center column)?',
      labels: usefulLabels,
    },
  ],
  structuredLabeling: [
    ...bothQuestions,
    {
      name: 'selfOrganization',
      txt: "How helpful was being able to organize items into 'yes' / 'maybe' / 'no' categories (in the center column)?",
      labels: usefulLabels,
    },
  ],
};

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  interface: PropTypes.string.isRequired,
};

class Survey extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.submit = this.submit.bind(this);
  }

  submit() {
    this.props.onSubmit({ ...this.state });
  }

  render() {
    return (
      <form>
        <p>Please complete the following survey.</p>
        <table className="table table-striped">
          <tbody>
            {interfaceQuestions[this.props.interface] && (
              interfaceQuestions[this.props.interface].map(
                question => (
                  <Likert
                    key={`${question.name}, ${question.txt}`}
                    txt={question.txt}
                    value={this.state[question.name] && this.state[question.name].index}
                    labels={question.labels}
                    onChange={(e) => {
                      this.setState({
                        [question.name]: {
                          index: Number(e.target.value),
                          ...question,
                        },
                      });
                    }}
                  />
                ),
              )
            )}
          </tbody>
        </table>
        <FormGroup>
          <ControlLabel>
            What did you like and dislike about the interface?
          </ControlLabel>
          <FormControl
            componentClass="textarea"
            placeholder="Your answer"
            rows="6"
            value={this.state.likeDislike || ''}
            onChange={(e) => { this.setState({ likeDislike: e.target.value }); }}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            Any other comments?
          </ControlLabel>
          <FormControl
            componentClass="textarea"
            placeholder="Your answer"
            rows="6"
            value={this.state.comments || ''}
            onChange={(e) => { this.setState({ comments: e.target.value }); }}
          />
        </FormGroup>
        <Clearfix>
          <Button
            className="pull-right"
            bsStyle="primary"
            onClick={this.submit}
          >
            Submit
          </Button>
        </Clearfix>
      </form>
    );
  }
}

Survey.propTypes = propTypes;

const mapStateToProps = state => ({
  interface: state.config.interface,
  taskIndex: state.config.experimentPosition.taskIndex,
  nTasks: state.config.experimentPosition.nTasks,
});

const mapDispatchToProps = dispatch => ({
  onSubmit: (formData) => {
    dispatch(changeExperimentPhase(States.THANKS, formData));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Survey);
