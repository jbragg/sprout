import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from '../containers/App';

const propTypes = {
  store: PropTypes.object.isRequired,
};

const Root = ({ store }) => (
  <Provider store={store}>
    <Router>
      <Route path="/:participantIndex?/:taskIndex?" component={App} />
    </Router>
  </Provider>
);

Root.propTypes = propTypes;

export default Root;
