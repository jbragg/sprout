import React from 'react';
import PropTypes from 'prop-types';
import { stringify } from 'query-string';
import Loading from './Loading';

const propTypes = {
  params: PropTypes.shape({
    tutorialIndex: PropTypes.number,
    taskIndex: PropTypes.number,
    nTutorials: PropTypes.number.isRequired,
    nTasks: PropTypes.number.isRequired,
    experimentId: PropTypes.string.isRequired,
    participantIndex: PropTypes.number,
    participantId: PropTypes.string,
  }),
  redirectTime: PropTypes.number,
};

const defaultProps = {
  params: null,
  redirectTime: 6000,
};

class Thanks extends React.Component {
  constructor(props) {
    super(props);
    this.shouldRedirect = this.shouldRedirect.bind(this);
    this.redirectUrl = this.redirectUrl.bind(this);
  }

  componentDidMount() {
    if (this.shouldRedirect()) {
      setTimeout(() => {
        window.location.href = this.redirectUrl();
      }, this.props.redirectTime);
    }
  }

  shouldRedirect() {
    const { params } = this.props;
    return params && (params.taskIndex !== params.nTasks - 1);
  }

  redirectUrl() {
    const params = this.props.params;
    const queryString = stringify({
      tutorialIndex: (params.tutorialIndex != null
        ? undefined
        : params.taskIndex + 1
      ),
      taskIndex: (params.taskIndex != null
        ? undefined
        : params.tutorialIndex
      ),
      experimentId: params.experimentId,
      participantId: params.participantId != null ? params.participantId : undefined,
      participantIndex: params.participantIndex != null ? params.participantIndex : undefined,
    });
    return `/?${queryString}`;
  }

  render() {
    if (this.shouldRedirect()) {
      return <h1><Loading /></h1>;
    }
    return <h1>All done. Thanks!</h1>;
  }
}

Thanks.propTypes = propTypes;
Thanks.defaultProps = defaultProps;

export default Thanks;
