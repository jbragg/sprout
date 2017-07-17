import { SET_AUTOADVANCE } from '../actions';

const autoAdvance = (state = true, action) => {
  switch (action.type) {
    case SET_AUTOADVANCE: {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};

export default autoAdvance;

