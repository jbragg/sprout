import { SET_CLUSTER_ID } from '../actions';

const clusterId = (state = 0, action) => {
  switch (action.type) {
    case SET_CLUSTER_ID: {
      return action.id;
    }
    default: {
      return state;
    }
  }
};

export default clusterId;
