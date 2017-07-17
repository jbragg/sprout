import { EDIT_GENERAL_INSTRUCTIONS, RECEIVE_EXPERIMENT } from '../actions';

const generalInstructions = (state = null, action) => {
  switch (action.type) {
    case RECEIVE_EXPERIMENT: {
      return (action.payload.instructions != null
        ? action.payload.instructions
        : action.payload.config.initialInstructions
      );
    }
    case EDIT_GENERAL_INSTRUCTIONS: {
      return action.markdown;
    }
    default: {
      return state;
    }
  }
};

export default generalInstructions;
