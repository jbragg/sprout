import React from 'react';
import PropTypes from 'prop-types';
import Joyride from 'react-joyride';
import ReactMarkdown from 'react-markdown';
import { tutorialSteps } from './constants';

export default (WrappedComponent) => {
  const propTypes = { tutorial: PropTypes.bool };
  const defaultProps = { tutorial: false };
  class WithTutorial extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        running: false,
      };
    }

    componentDidMount() {
      if (this.props.tutorial) {
        setTimeout(() => {
          this.setState({
            running: true,
          });
        }, 0);
      }
    }

    render() {
      return (
        <div>
          <Joyride
            ref={(c) => { this.joyride = c; }}
            steps={tutorialSteps.map(step => ({
              ...step,
              text: <ReactMarkdown source={step.text} />,
            }))}
            run={this.state.running}
            type={'continuous' && 'single'}
            scrollToSteps={false}
          />
          <WrappedComponent {...this.props} />
        </div>
      );
    }
  }
  WithTutorial.propTypes = propTypes;
  WithTutorial.defaultProps = defaultProps;
  return WithTutorial;
};
