import React from 'react';
import ReactDOM from 'react-dom';
import Mousetrap from 'mousetrap';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import fetch from 'isomorphic-fetch';

import reducer from './reducers/index';

import Root from './components/Root';

// Disable react-hotkeys for in-focus input, select, and textarea
Mousetrap.prototype.stopCallback = (e, element) => (
  element.tagName === 'INPUT'
    || element.tagName === 'SELECT'
    || element.tagName === 'TEXTAREA'
    || (element.contentEditable && element.contentEditable === 'true')
);

/**
 * Logs all actions to back-end server.
 *
 * NOTE: Catches errors and does not re-raise them.
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
  const prevState = store.getState();
  const { participantIndex, participantId } = prevState.config;
  if (participantIndex == null && participantId == null) {
    return next(action);
  }
  const logEntry = {};
  logEntry.start_time = new Date();
  logEntry.prev_state = stateTransformer(prevState);
  logEntry.action = action;

  let returnedValue;
  try {
    returnedValue = next(action);
  } catch (e) {
    logEntry.error = e;
  }

  logEntry.duration = new Date() - logEntry.start_time;
  logEntry.next_state = stateTransformer(store.getState());

  logEntry.participant_id = logEntry.next_state.config.participantId;
  logEntry.participant_index = logEntry.next_state.config.participantIndex;
  logEntry.task_id = logEntry.next_state.config.taskId;
  logEntry.experiment_id = logEntry.next_state.config.experimentId;

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
  const logger = createLogger({
    duration: true,
    stateTransformer: state => ({
      ...state,
      entities: {
        ...state.entities,
        itemData: {
          ...state.entities.itemData,
          byId: state.entities.itemData.byId.toJS(),
        },
        items: {
          ...state.entities.items,
          byId: state.entities.items.byId.toJS(),
        },
        groups: {
          ...state.entities.groups,
          byId: state.entities.groups.byId.toJS(),
        },
        answers: {
          ...state.entities.answers,
          byId: state.entities.answers.byId.toJS(),
        },
      },
    }),
  });
  middlewares.push(logger);
}
const store = createStore(
  reducer,
  applyMiddleware(...middlewares),
);

if (process.env.NODE_ENV === 'production') {
  window.addEventListener('beforeunload', (event) => {
    const message = 'Please check with the experimenter before changing the page or closing the window';
    event.returnValue = message;
    return message;
  });
}

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root'),
);
