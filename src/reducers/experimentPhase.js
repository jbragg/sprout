import {
  REQUEST_EXPERIMENT, RECEIVE_EXPERIMENT, CHANGE_EXPERIMENT_PHASE,
} from '../actions';
import { States } from '../constants';

const defaultState = {
  name: null,
  startTime: null,
};

const experimentPhase = (state = defaultState, action) => {
  switch (action.type) {
    case REQUEST_EXPERIMENT: {
      return {
        ...state,
        name: States.LOADING,
        startTime: Date.now(),
      };
    }
    case RECEIVE_EXPERIMENT: {
      return {
        ...state,
        name: States.LOADED,
        startTime: Date.now(),
      };
    }
    case CHANGE_EXPERIMENT_PHASE: {
      return {
        ...state,
        name: action.phase,
        startTime: Date.now(),
      };
    }
    default: {
      return state;
    }
  }
};

export default experimentPhase;
