import React from 'react';
import PropTypes from 'prop-types';
import { stringify } from 'query-string';
import Loading from './Loading';

const propTypes = {
  params: PropTypes.shape({
    tutorial: PropTypes.bool,
    taskIndex: PropTypes.number,
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
    return params && (
      params.tutorial || params.taskIndex === 0 || params.taskIndex === 1
    );
  }

  redirectUrl() {
    const { params } = this.props;
    const queryString = stringify({
      ...params,
      tutorial: undefined,
      taskIndex: params.taskIndex == null ? 0 : params.taskIndex + 1,
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
