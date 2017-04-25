import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';

import InstructionsApp from './reducers';
import App from './containers/App';
import { fetchExperiment, startOracle } from './actions';

/**
 * Logs all actions to back-end server.
 *
 * NOTE: Catches errors and does not re-raise them.
 * TODO: Perform this logging only during experiments.
 */
const productionLogger = store => next => (action) => {
  const logEntry = {};
  logEntry.start_time = new Date();
  logEntry.prev_state = store.getState();
  logEntry.action = action;

  let returnedValue;
  try {
    returnedValue = next(action);
  } catch (e) {
    logEntry.error = e;
  }

  logEntry.duration = new Date() - logEntry.start_time;
  logEntry.next_state = store.getState();

  fetch('/record', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logEntry),
  });

  return returnedValue;
};

const middlewares = [thunkMiddleware];
if (process.env.NODE_ENV === 'production') {
  middlewares.push(productionLogger);
} else {
  const { logger } = require('redux-logger');
  middlewares.push(logger);
}
const store = createStore(
  InstructionsApp,
  applyMiddleware(...middlewares),
);
store.dispatch(fetchExperiment());
store.dispatch(startOracle());

/*
window.addEventListener("beforeunload", function(event) {
  event.returnValue = "Please check with the experimenter before closing the window";
});
*/

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
