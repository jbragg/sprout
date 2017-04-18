import { createSelector } from 'reselect';
import { ANSWER_ORACLE, QUEUE_ITEM_ORACLE, EDIT_COLOR_UNREVIEWED, EDIT_GENERAL_INSTRUCTIONS, SET_CURRENT_ITEM, ASSIGN_ITEM, EDIT_GROUP, CREATE_GROUP, MERGE_GROUP, REQUEST_EXPERIMENT, RECEIVE_EXPERIMENT } from './actions';
import getScore from './score';

const initialState = {
  suggestSimilar: true,  // TODO: Handle false case.
  labels: ['yes', 'maybe', 'no'],
  finalLabels: ['yes', 'no'],
  oracle: {
    queuedItems: [],
    answerInterval: 1 * 60 * 1000,  // minutes to milliseconds
    answeredItems: [],
  },
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
    labels: new Map([
      ['yes', { itemIds: new Set() }],
      ['maybe', { itemIds: new Set() }],
      ['no', { itemIds: new Set() }],
    ]),
  },
  generalInstructions: '',
  colorUnreviewedBy: 'answer',
};

// TODO: Return items that are actually similar.
const getSimilarItemIds = (primaryItemId, unlabeledItemIds, max) => (
  [...unlabeledItemIds].filter(x => x !== primaryItemId).filter((_, i) => i < max)
);

export const itemsSelector = state => state.entities.items;
export const answersSelector = state => state.entities.answers;
export const metricSelector = state => state.colorUnreviewedBy;
export const unlabeledItemsSelector = createSelector(
  itemsSelector,
  items => [...items.byId.values()].filter(item => item.group == null && item.label == null),
);
export const unlabeledItemScoresSelector = createSelector(
  unlabeledItemsSelector,
  answersSelector,
  metricSelector,
  (items, answers, metric) => new Map([...items].map(item => [item.id, getScore(metric)(item.answers.map(answerId => answers.byId.get(answerId).data.answer))])),
);
export const unlabeledSortedItemsSelector = createSelector(
  unlabeledItemsSelector,
  unlabeledItemScoresSelector,
  metricSelector,
  (items, scores, metric) => [...items].sort((item1, item2) => (metric === 'confusion' ? -1 : 1) * (scores.get(item1.id) - scores.get(item2.id))),
);


export const groupAnswers = (state, groupId) => (
  [...state.entities.answers.byId.values()].filter(answer => (
    state.entities.groups.byId.get(groupId).itemIds.has(answer.data.questionid)))
);

function InstructionsApp(state = initialState, action) {
  switch (action.type) {
    case ANSWER_ORACLE: {
      const nextQueuedItem = state.oracle.queuedItems.length > 0 ? state.oracle.queuedItems[0] : null;
      const lastAnswerTime = state.oracle.answeredItems.length > 0 ? state.oracle.answeredItems[state.oracle.answeredItems.length - 1].answerTime : null;
      const longEnoughSinceLastAnswer = lastAnswerTime == null || (Date.now() - lastAnswerTime > state.oracle.answerInterval);
      const longEnoughSinceQueued = nextQueuedItem != null && (Date.now() - nextQueuedItem.queryTime > state.oracle.answerInterval);
      const shouldAnswer = longEnoughSinceQueued && longEnoughSinceLastAnswer;
      /*
      console.log(nextQueuedItem);
      console.log(lastAnswerTime);
      console.log(longEnoughSinceLastAnswer);
      console.log(longEnoughSinceQueued);
      */
      return {
        ...state,
        oracle: {
          ...state.oracle,
          queuedItems: shouldAnswer ? state.oracle.queuedItems.slice(1) : state.oracle.queuedItems,
          answeredItems: shouldAnswer ? [
            ...state.oracle.answeredItems,
            {
              ...nextQueuedItem,
              answerTime: Date.now(),
              label: state.finalLabels[Math.round(Math.random())],
            },
          ]
          : state.oracle.answeredItems,
        },
      };
    }
    case QUEUE_ITEM_ORACLE: {
      return {
        ...state,
        oracle: {
          ...state.oracle,
          queuedItems: [
            ...state.oracle.queuedItems,
            {
              queryTime: Date.now(),
              id: action.itemId,
            },
          ],
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
        primaryItemId = Math.min(...unlabeledItemsSelector(state).map(item => item.id));
        currentItemId = primaryItemId;
          similarItemIds = getSimilarItemIds(primaryItemId, unlabeledItemsSelector(state).map(item => item.id), 5);
      } else if (action.itemId == null && state.similarItemIds.length > 0) {
        // Move to next similarItem.
        currentItemId = state.similarItemIds[0];
      } else if (action.itemId == null) {
        // No more similarItems.
        currentItemId = primaryItemId;
      } else if (unlabeledItemsSelector(state).map(item => item.id).indexOf(action.itemId) >= 0 && action.itemId !== primaryItemId && similarItemIds.indexOf(action.itemId) < 0) {
        // New unlabeled item selected.
        primaryItemId = action.itemId;
        currentItemId = primaryItemId;
        similarItemIds = getSimilarItemIds(primaryItemId, unlabeledItemsSelector(state).map(item => item.id), 5);
      } else {
        currentItemId = action.itemId;
      }
      return {
        ...state,
        currentItemId,
        primaryItemId,
        similarItemIds,
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
          groups: {
            ...state.entities.groups,
            byId: new Map(
              [...state.entities.groups.byId.entries()].map(
                ([key, value]) => [
                  key,
                  key === action.assignment.group
                  ? {
                    ...value,
                    itemIds: new Set([
                      ...value.itemIds.values(),
                      action.itemId]),
                  }
                  : {
                    ...value,
                    itemIds: new Set(
                      [...value.itemIds.values()].filter(id => id !== action.itemId)),
                  },
                ],
              ),
            ),
          },
          labels: new Map(
            [...state.entities.labels.entries()].map(
              ([key, value]) => [
                key,
                key === action.assignment.label
                ? {
                  ...value,
                  itemIds: new Set([
                    ...value.itemIds.values(),
                    action.itemId]),
                }
                : {
                  ...value,
                  itemIds: new Set(
                    [...value.itemIds.values()].filter(id => id !== action.itemId)),
                },
              ],
            ),
          ),
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
                itemIds: new Set(),
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
              [...state.entities.groups.byId.entries()]
              .filter(([key]) => key !== action.groupId)
              .map(
                ([key, value]) => (
                  [key, key === action.target.group
                    ? {
                      ...value,
                      itemIds: new Set([
                        ...value.itemIds.values(),
                        ...state.entities.groups.byId.get(action.groupId).itemIds.values()]),
                    }
                    : value]
                )),
            ),
          },
          labels: new Map(
            [...state.entities.labels.entries()]
            .map(
              ([key, value]) => (
                [key, key === action.target.label
                  ? {
                    ...value,
                    itemIds: new Set([
                      ...value.itemIds.values(),
                      ...state.entities.groups.byId.get(action.groupId).itemIds.values()]),
                  }
                  : value]
              )),
          ),
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
            byId: new Map(action.payload.items.map(value => [value.id, {
              ...value,
              answers: action.payload.answers
              .filter(answer => answer.data.questionid === value.id)
              .map(answer => answer.assignmentid),
            }])),
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
