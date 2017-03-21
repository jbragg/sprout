import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

import InstructionsApp from './reducers';
import App from './containers/App';
import { fetchExperiment } from './actions';

const loggerMiddleware = createLogger();

const store = createStore(
  InstructionsApp,
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  )
);
store.dispatch(fetchExperiment());

/*
window.addEventListener("beforeunload", function(event) {
  event.returnValue = "Please check with the experimenter before closing the window";
});
*/

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
);
