import undoable from 'redux-undo';
import { combineReducers } from 'redux';
import { SET_CURRENT_ITEM, ASSIGN_ITEMS } from '../actions';

const currentItemId = (state = null, action) => {
  switch (action.type) {
    case SET_CURRENT_ITEM: {
      return action.payload.currentItemId;
    }
    case ASSIGN_ITEMS: {
      return action.itemIds.indexOf(state) >= 0 ? null : state;
    }
    default: {
      return state;
    }
  }
};

const primaryItemId = (state = null, action) => {
  switch (action.type) {
    case SET_CURRENT_ITEM: {
      return action.payload.primaryItemId;
    }
    case ASSIGN_ITEMS: {
      return action.itemIds.indexOf(state) >= 0 ? null : state;
    }
    default: {
      return state;
    }
  }
};

const similarItemIds = (state = [], action) => {
  switch (action.type) {
    case SET_CURRENT_ITEM: {
      return action.payload.similarItemIds;
    }
    case ASSIGN_ITEMS: {
      return (state == null
        ? null
        : [...state].filter(id => action.itemIds.indexOf(id) < 0)
      );
    }
    default: {
      return state;
    }
  }
};


export default combineReducers({
  currentItemId: undoable(currentItemId, {
    filter: (action, currentState, previousHistory) => (
      [SET_CURRENT_ITEM, ASSIGN_ITEMS].indexOf(action.type) >= 0
      && previousHistory != null
      && previousHistory !== (action.payload && action.payload.currentItemId)
    ),
  }),
  primaryItemId,
  similarItemIds,
});

export const currentItemIdSelector = (
  state => state.currentItem.currentItemId.present
);

export const futureItemIdsSelector = (
  state => state.currentItem.currentItemId.future
);

export const pastItemIdsSelector = (
  state => state.currentItem.currentItemId.past
);
