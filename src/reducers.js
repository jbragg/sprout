import { EDIT_LABEL_FORM, EDIT_COLOR_UNREVIEWED, EDIT_GENERAL_INSTRUCTIONS, SET_CURRENT_ITEM, ASSIGN_ITEM, EDIT_GROUP, CREATE_GROUP, MERGE_GROUP, REQUEST_EXPERIMENT, RECEIVE_EXPERIMENT } from './actions';

const initialState = {
  suggestSimilar: true,  // TODO: Handle false case.
  labels: ['yes', 'maybe', 'no'],
  finalLabels: ['yes', 'no'],
  uncertainLabel: 'maybe',
  experimentState: null,
  currentItemId: null,
  primaryItemId: null,
  similarItemIds: [],
  initialInstructions: null,
  entities: {
    groups: { byId: new Map() },
    items: { byId: new Map() },
    answers: { byId: new Map() },
  },
  drillDownForm: {},
  generalInstructions: '',
  colorUnreviewedBy: 'answer',
};

const getUnlabeledItemIds = state => (
  [...state.entities.items.byId.keys()].filter(key =>
    state.entities.items.byId.get(key).group == null &&
    state.entities.items.byId.get(key).label == null)
);


// TODO: Return items that are actually similar.
const getSimilarItemIds = (primaryItemId, unlabeledItemIds, max) => (
  [...unlabeledItemIds].filter(x => x !== primaryItemId).filter((_, i) => i < max)
);

function InstructionsApp(state = initialState, action) {
  switch (action.type) {
    case EDIT_LABEL_FORM: {
      return {
        ...state,
        drillDownForm: {
          ...state.drillDownForm,
          ...action.keyValues,
        },
      };
    }
    case EDIT_GENERAL_INSTRUCTIONS: {
      return {
        ...state,
        generalInstructions: action.markdown,
      };
    }
    case EDIT_COLOR_UNREVIEWED: {
      return {
        ...state,
        colorUnreviewedBy: action.metric,
      };
    }
    case SET_CURRENT_ITEM: {
      let currentItemId = state.currentItemId;
      let primaryItemId = state.primaryItemId;
      let similarItemIds = state.similarItemIds;
      if (action.itemId == null && state.primaryItemId == null) {
        // Choose next primaryItem.
        primaryItemId = Math.min(...getUnlabeledItemIds(state));
        currentItemId = primaryItemId;
        similarItemIds = getSimilarItemIds(primaryItemId, getUnlabeledItemIds(state), 5);
      } else if (action.itemId == null && state.similarItemIds.length > 0) {
        // Move to next similarItem.
        currentItemId = state.similarItemIds[0];
      } else if (action.itemId == null) {
        // No more similarItems.
        currentItemId = primaryItemId;
      } else if (getUnlabeledItemIds(state).indexOf(action.itemId) >= 0 && action.itemId !== primaryItemId && similarItemIds.indexOf(action.itemId) < 0) {
        // New unlabeled item selected.
        primaryItemId = action.itemId;
        currentItemId = primaryItemId;
        similarItemIds = getSimilarItemIds(primaryItemId, getUnlabeledItemIds(state), 5);
      } else {
        currentItemId = action.itemId;
      }
      return {
        ...state,
        currentItemId,
        primaryItemId,
        similarItemIds,
        drillDownForm: {
          ...state.drillDownForm,
          hasSubmitted: false,
          groupId: currentItemId == null ? null : state.entities.items.byId.get(currentItemId).group,
          label: currentItemId == null ? null : state.entities.items.byId.get(currentItemId).label,
        },
      };
    }
    case ASSIGN_ITEM: {
      return {
        ...state,
        currentItemId: action.itemId === state.currentItemId ? null : state.currentItemId,
        primaryItemId: action.itemId === state.primaryItemId ? null : state.primaryItemId,
        similarItemIds: [...state.similarItemIds].filter(id => id !== action.itemId),
        entities: {
          ...state.entities,
          items: {
            ...state.entities.items,
            byId: new Map([
              ...state.entities.items.byId,
              [action.itemId, {
                ...state.entities.items.byId.get(action.itemId),
                label: null,
                group: null,
                ...action.assignment,
              }],
            ]),
          },
        },
      };
    }
    case EDIT_GROUP: {
      return {
        ...state,
        entities: {
          ...state.entities,
          groups: {
            ...state.entities.groups,
            byId: new Map([
              ...state.entities.groups.byId,
              [action.groupId, {
                ...state.entities.groups.byId.get(action.groupId),
                ...action.keyValues,
              }],
            ]),
          },
        },
      };
    }
    case CREATE_GROUP: {
      const maxGroupId = Math.max(-1, ...state.entities.groups.byId.keys());
      const nextGroupId = maxGroupId + 1;
      return {
        ...state,
        entities: {
          ...state.entities,
          groups: {
            ...state.entities.groups,
            byId: new Map([
              ...state.entities.groups.byId,
              [nextGroupId, {
                name: '',
                description: '',
                ...action.keyValues,
                id: nextGroupId,
              }],
            ]),
          },
        },
      };
    }
    case MERGE_GROUP: {
      // Reassign items in group to another group or label
      return {
        ...state,
        entities: {
          ...state.entities,
          items: {
            ...state.entities.items,
            byId: new Map(
              [...state.entities.items.byId.entries()].map(
                ([key, value]) => (
                  [key, value.group === action.groupId
                    ? { ...value, group: null, label: null, ...action.target }
                    : value]
                )),
            ),
          },
          groups: {
            ...state.entities.groups,
            byId: new Map(
              [...state.entities.groups.byId].filter(
                ([key]) => key !== action.groupId),
            ),
          },
        },
      };
    }
    case REQUEST_EXPERIMENT: {
      return {
        ...state,
        experimentState: 'loading',
      };
    }
    case RECEIVE_EXPERIMENT: {
      return {
        ...state,
        experimentState: 'loaded',
        initialInstructions: action.payload.initialInstructions,
        entities: {
          ...state.entities,
          items: {
            byId: new Map(action.payload.items.map(value => [value.id, value])),
          },
          answers: {
            byId: new Map(action.payload.answers.map(value => [value.assignmentid, value])),
          },
        },
      };
    }
    default: {
      return state;
    }
  }
}

export default InstructionsApp;
