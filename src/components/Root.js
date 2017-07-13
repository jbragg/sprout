import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import AppLoader from '../containers/AppLoader';

const propTypes = {
  store: PropTypes.object.isRequired,
};

const Root = ({ store }) => (
  <Provider store={store}>
    <Router>
      <Route path="/:taskIndex?/:participantIndex?" component={AppLoader} />
    </Router>
  </Provider>
);

Root.propTypes = propTypes;

export default Root;
