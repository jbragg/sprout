import { EDIT_LABEL_FORM, EDIT_GENERAL_INSTRUCTIONS, SET_CURRENT_ITEM, ASSIGN_ITEM, EDIT_GROUP, CREATE_GROUP, MERGE_GROUP, REQUEST_EXPERIMENT, RECEIVE_EXPERIMENT } from './actions';

const initialState = {
  labels: ['yes', 'maybe', 'no'],
  finalLabels: ['yes', 'no'],
  uncertainLabel: 'maybe',
  experimentState: null,
  currentItemId: null,
  initialInstructions: null,
  entities: {
    groups: { byId: new Map() },
    items: { byId: new Map() },
    answers: { byId: new Map() },
  },
  drillDownForm: {},
  generalInstructions: '',
};


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
    case SET_CURRENT_ITEM: {
      const itemId = action.newItemId != null ? action.newItemId :
        Math.min(...[...state.entities.items.byId.keys()].filter(key =>
          state.entities.items.byId.get(key).group == null &&
          state.entities.items.byId.get(key).label == null));
      return {
        ...state,
        currentItemId: itemId,
        drillDownForm: {
          ...state.drillDownForm,
          hasSubmitted: false,
          groupId: itemId == null ? null : state.entities.items.byId.get(itemId).group,
          label: itemId == null ? null : state.entities.items.byId.get(itemId).label,
        },
      };
    }
    case ASSIGN_ITEM: {
      return {
        ...state,
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
