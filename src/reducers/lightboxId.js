import { SET_LIGHTBOX } from '../actions';

const lightboxId = (state = null, action) => {
  switch (action.type) {
    case SET_LIGHTBOX: {
      return action.payload && action.payload.id;
    }
    default: {
      return state;
    }
  }
};

export default lightboxId;
