import { SET_CURRENT_ITEM, ASSIGN_ITEMS } from '../actions';

const defaultState = {
  currentItemId: null,
  primaryItemId: null,
  similarItemIds: [],
};

const currentItem = (state = defaultState, action) => {
  switch (action.type) {
    case SET_CURRENT_ITEM: {
      return {
        ...state,
        ...action.payload,
      };
    }
    case ASSIGN_ITEMS: {
      return {
        ...state,
        currentItemId: (
          (
            action.itemIds.indexOf(state.currentItemId) >= 0
            || action.itemIds.indexOf(state.primaryItemId) >= 0
          )
          ? null
          : state.currentItemId
        ),
        primaryItemId: (action.itemIds.indexOf(state.primaryItemId) >= 0
          ? null
          : state.primaryItemId
        ),
        similarItemIds: (state.similarItemIds == null
          ? null
          : [...state.similarItemIds].filter(
            id => action.itemIds.indexOf(id) < 0,
          )
        ),
      };
    }
    default: {
      return state;
    }
  }
};

export default currentItem;
