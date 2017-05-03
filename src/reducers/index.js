import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import {
  ANSWER_ORACLE, QUEUE_ITEM_ORACLE, SET_CLUSTER_ID,
  EDIT_GENERAL_INSTRUCTIONS, SET_CURRENT_ITEM, ASSIGN_ITEM,
  EDIT_GROUP, CREATE_GROUP, MERGE_GROUP, REQUEST_EXPERIMENT,
  RECEIVE_EXPERIMENT } from '../actions';
import getScore, { defaults as defaultMetrics } from '../score';
import { Labels, defaults } from '../constants';
import conditions from '../experiment';

const labels = [Labels.YES, Labels.MAYBE, Labels.NO];
const finalLabels = [Labels.YES, Labels.NO];
const uncertainLabel = Labels.MAYBE;

const initialState = {
  participantIndex: null,
  systemVersion: null,
  labels,
  finalLabels,
  oracle: {
    queuedItems: [],
    answerInterval: 1 * 60 * 1000,  // minutes to milliseconds
    answeredItems: [],
  },
  uncertainLabel,
  experimentState: null,
  experimentDuration: 15 * 60 * 1000,  // minutes to milliseconds
  experimentStartTime: null,
  currentItemId: null,
  primaryItemId: null,
  similarItemIds: [],
  clusterId: 0,
  initialInstructions: null,
  entities: {
    groups: { byId: new Map() },
    items: { byId: new Map() },
    answers: { byId: new Map() },
    labels: new Map(labels.map(label => [label, { itemIds: new Set() }])),
  },
  generalInstructions: null,
};

/*
 * utilities
 */

const dotProduct = (vec1, vec2) => {
  let sum = 0;
  for (let i = 0; i < vec1.length; i += 1) {
    sum += vec1[i] * vec2[i];
  }
  return sum;
};

const cosineSimilarity = (vec1, vec2) => (
  dotProduct(vec1, vec2) / Math.sqrt(dotProduct(vec1, vec1)) / Math.sqrt(dotProduct(vec2, vec2))
);

/*
 * selectors
 */

export const experimentReady = state => state.experimentState === 'loaded';
export const itemsSelector = state => state.entities.items;
export const groupsSelector = state => state.entities.groups;
export const currentItemIdSelector = state => state.currentItemId;
export const answersSelector = state => state.entities.answers;
export const clusterIdsSelector = createSelector(
  itemsSelector,
  items => new Set([...items.byId.values()].map(item => item.cluster)),
)
export const itemVectorsSelector = createSelector(
  itemsSelector,
  items => new Map([...items.byId].map(([key, item]) => [key, item.vector])),
);
export const itemSimilaritiesSelector = createSelector(
  itemVectorsSelector,
  itemVectors => new Map([...itemVectors].map(([id, vector]) => {
    if (vector == null) {
      return [id, new Map()];
    }
    const otherItems = ([...itemVectors]
      .filter(([key, value]) => key !== id && value != null)
      .map(([key, otherVector]) => [key, cosineSimilarity(vector, otherVector)])
      .filter(([, similarity]) => similarity >= defaults.similarityThreshold)
      .sort(([, similarity1], [, similarity2]) => similarity2 - similarity1)  // descending
    );
    return [id, new Map(otherItems)];
  })),
);
const isUnlabeled = item => (item.group == null && item.label == null);
export const unlabeledItemsSelector = createSelector(
  itemsSelector,
  items => [...items.byId.values()].filter(item => isUnlabeled(item)),
);
export const clusterItemsSelector = createSelector(
  state => state.clusterId,
  itemsSelector,
  (clusterId, items) => clusterId == null ? [] : [...items.byId.values()].filter(item => item.cluster === clusterId).map(item => item.id),
);
export const unlabeledClusterItemsSelector = createSelector(
  state => state.clusterId,
  unlabeledItemsSelector,
  (clusterId, items) => clusterId == null ? [] : items.filter(item => item.cluster === clusterId).map(item => item.id),
);
export const itemAnswersSelector = createSelector(
  itemsSelector,
  answersSelector,
  (items, answers) => new Map([...items.byId].map(([id, item]) => [id, item.answers.map(answerId => answers.byId.get(answerId))])),
);
export const unlabeledItemScoresSelector = createSelector(
  unlabeledItemsSelector,
  itemAnswersSelector,
  (items, answers) => new Map(items.map(item => [item.id, getScore(defaultMetrics.sort)(...answers.get(item.id).map(answer => answer.data.answer)).color])),
);
export const unlabeledSortedItemsSelector = createSelector(
  unlabeledItemsSelector,
  unlabeledItemScoresSelector,
  (items, scores) => [...items].sort((item1, item2) => scores.get(item1.id) - scores.get(item2.id)),
);
export const groupItemsSelector = createSelector(
  groupsSelector,
  groups => new Map([...groups.byId].map(([key, value]) => [key, value.itemIds])),
);
/*
 * Return closest group id, or -1
 */
export const recommendedGroupSelector = createSelector(
  currentItemIdSelector,
  groupItemsSelector,
  itemSimilaritiesSelector,
  (itemId, groups, similarities) => {
    if (itemId == null) {
      return -1;
    }
    const groupSimilarities = new Map([...groups]
      .map(([groupId, itemIds]) => [groupId, [...similarities.get(itemId).keys()].findIndex(id => [...itemIds].indexOf(id) >= 0)])  // first index into similarities of item in group
      .filter(([, index]) => index > -1)
      .map(([groupId, index]) => [groupId, [...similarities.get(itemId).keys()][index]])
      .sort(([, i1], [, i2]) => i1 - i2)
    );
    //console.log(groupSimilarities);
    return groupSimilarities.size === 0 ? -1 : [...groupSimilarities.keys()][0];
  },
);

const nextClusterSelector = createSelector(
  state => state.clusterId,
  clusterIdsSelector,
  (clusterId, clusterIds) => {
    if (clusterId === Math.max(...clusterIds)) {
      return -1;
    } else if (clusterId >= 0) {
      return clusterId + 1;
    } else {
      return clusterId;
    }
  },
);

const getSimilarItemIds = (itemId, state, unlabeledOnly = true) => {
  const unlabeledItemIds = unlabeledItemsSelector(state).map(item => item.id);
  return [...itemSimilaritiesSelector(state).get(itemId).keys()].filter(id => !unlabeledOnly || unlabeledItemIds.indexOf(id) >= 0);
};

export const getItemsSummary = (itemIds, state) => (
  [].concat(...itemIds.map(id => itemAnswersSelector(state).get(id))).map(answer => answer.data.unclear_type).filter(s => s.length > 0).join(', ')
);

/*
 * reducers
 */

function InstructionsApp(state = initialState, action) {
  switch (action.type) {
    case SET_CLUSTER_ID: {
      return {
        ...state,
        clusterId: action.id,
      };
    }
    case ANSWER_ORACLE: {
      const nextQueuedItem = state.oracle.queuedItems.length > 0 ? state.oracle.queuedItems[0] : null;
      const lastAnswerTime = state.oracle.answeredItems.length > 0 ? state.oracle.answeredItems[state.oracle.answeredItems.length - 1].answerTime : null;
      const longEnoughSinceLastAnswer = lastAnswerTime == null || (Date.now() - lastAnswerTime > state.oracle.answerInterval);
      const longEnoughSinceQueued = nextQueuedItem != null && (Date.now() - nextQueuedItem.queryTime > state.oracle.answerInterval);
      const shouldAnswer = longEnoughSinceQueued && longEnoughSinceLastAnswer;
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
              label: state.entities.items.byId.get(nextQueuedItem.id).labelGT || state.uncertainLabel,
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
    case SET_CURRENT_ITEM: {
      let currentItemId = state.currentItemId;
      let primaryItemId = state.primaryItemId;
      let similarItemIds = state.similarItemIds;
      if (action.itemId == null && currentItemId == null && state.primaryItemId == null) {
        const { useReasons, useAnswers } = conditions[state.systemVersion];
        // Choose next primaryItem.
        if (!useReasons && !useAnswers) {
          primaryItemId = unlabeledItemsSelector(state)[0].id
        } else {
          primaryItemId = unlabeledSortedItemsSelector(state)[0].id;
        }
        currentItemId = primaryItemId;
        similarItemIds = getSimilarItemIds(primaryItemId, state);
      } else if (action.itemId == null && currentItemId == null && state.similarItemIds.length > 0) {
        // Move to next similarItem.
        currentItemId = state.similarItemIds[0];
      } else if (action.itemId == null && currentItemId == null) {
        // No more similarItems.
        currentItemId = primaryItemId;
      } else if (action.itemId == null) {
        // Nothing to do.
      } else if (action.itemId !== primaryItemId && state.similarItemIds.indexOf(action.itemId) < 0 && isUnlabeled(state.entities.items.byId.get(action.itemId))) {
        // New unlabeled item.
        primaryItemId = action.itemId;
        currentItemId = primaryItemId;
        similarItemIds = getSimilarItemIds(primaryItemId, state);
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
        currentItemId: (action.itemId === state.currentItemId || action.itemId === state.primaryItemId) ? null : state.currentItemId,
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
        experimentStartTime: Date.now(),
        systemVersion: action.payload.systemVersion,
        participantIndex: action.payload.participantIndex,
        initialInstructions: action.payload.initialInstructions,
        generalInstructions: action.payload.initialInstructions,
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
