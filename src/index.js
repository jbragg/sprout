import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { logger } from 'redux-logger';
import fetch from 'isomorphic-fetch';

import reducer from './reducers/index';

import Root from './components/Root';

/**
 * Logs all actions to back-end server.
 *
 * NOTE: Catches errors and does not re-raise them.
 * TODO: Perform this logging only during experiments.
 */
const productionLogger = store => next => (action) => {
  if (store.getState().participantIndex == null) {
    return next(action);
  }
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
  middlewares.push(logger);
}
const store = createStore(
  reducer,
  applyMiddleware(...middlewares),
);

/*
window.addEventListener("beforeunload", function(event) {
  event.returnValue = "Please check with the experimenter before closing the window";
});
*/

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root'),
);
