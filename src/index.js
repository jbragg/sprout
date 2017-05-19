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
const stateTransformer = state => ({
  ...state,
  entities: {
    groups: state.entities.groups,
    items: state.entities.items,
    labels: state.entities.labels,  // Ignore itemData and answers, which don't change.
  },
});
const productionLogger = store => next => (action) => {
  const prev_state = store.getState();
  const { participantIndex, participantId } = prev_state;
  if (participantIndex == null && participantId == null) {
    return next(action);
  }
  const logEntry = {};
  logEntry.start_time = new Date();
  logEntry.prev_state = stateTransformer(prev_state);
  logEntry.action = action;

  let returnedValue;
  try {
    returnedValue = next(action);
  } catch (e) {
    logEntry.error = e;
  }

  logEntry.duration = new Date() - logEntry.start_time;
  logEntry.next_state = stateTransformer(store.getState());

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

if (process.env.NODE_ENV === 'production') {
  window.addEventListener("beforeunload", function(event) {
    const message = 'Please check with the experimenter before changing the page or closing the window';
    event.returnValue = message;
    return message;
  });
}

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root'),
);
