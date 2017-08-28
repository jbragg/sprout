import { RECOMMEND_TEST_ITEMS } from '../actions';

const recommendations = (state = [], action) => {
  switch (action.type) {
    case RECOMMEND_TEST_ITEMS: {
      return [
        ...action.payload.recommendations,
        ...state,
      ];
    }
    default: {
      return state;
    }
  }
};

export default recommendations;
