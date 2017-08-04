import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import { combineReducers } from 'redux';
import isEqual from 'lodash/isEqual';
import { OrderedMap as Map, OrderedSet as Set } from 'immutable';
import getScore from '../score';
import { defaults } from '../constants';
import config from './config';
import autoAdvance from './autoAdvance';
import entities, { itemDataSelector } from './entities';
import currentItem, { currentItemIdSelector } from './currentItem';
import clusterId from './clusterId';
import lightboxId from './lightboxId';
import generalInstructions from './generalInstructions';
import experimentPhase from './experimentPhase';
import oracle from './oracle';

export { itemDataSelector };

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

const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
);

/*
 * selectors
 */

export const itemsSelector = state => state.entities.items;
export const groupsSelector = state => state.entities.groups;
export const answersSelector = state => state.entities.answers;
export const clusterIdsSelector = createSelector(
  itemDataSelector,
  items => new Set([...items.byId.values()].map(item => item.cluster)),
);
export const groupLabelsSelector = createSelector(
  groupsSelector,
  groups => new Map([...groups.byId].map(([key, group]) => [key, group.label])),
);
export const labelGroupsSelector = createDeepEqualSelector(
  groupLabelsSelector,
  state => state.config.labels,
  (groups, labs) => new Map(labs.map(label => [
    label,
    [...groups].filter(([, value]) => value === label).map(([id]) => id),
  ])),
);
export const itemLabelsSelector = createSelector(
  itemsSelector,
  groupsSelector,
  (items, groups) => new Map([...items.byId.values()].map(item => [
    item.id,
    item.group == null ? item.label : groups.byId.get(item.group).label,
  ])),
);
export const itemVectorsSelector = createSelector(
  itemDataSelector,
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
export const itemIdsSelector = createSelector(
  itemsSelector,
  items => [...items.byId.keys()],
);
export const isUnlabeled = item => (item.group == null && item.label == null);
export const unlabeledItemIdsSelector = createSelector(
  itemsSelector,
  items => new Set([...items.byId.values()]
    .filter(item => isUnlabeled(item))
    .map(item => item.id)),
);
export const testItemsSelector = createSelector(
  itemsSelector,
  items => [...items.byId.values()].filter(item => item.test),
);
export const queuedItemsSelector = createSelector(
  state => state.oracle.queuedItems,
  queuedItems => new Set(queuedItems.map(item => item.id)),
);
export const clusterItemsSelector = createSelector(
  state => state.clusterId,
  itemDataSelector,
  (curClusterId, items) => (curClusterId == null
    ? []
    : [...items.byId.values()].filter(
      item => item.cluster === curClusterId,
    ).map(item => item.id)
  ),
);
export const unlabeledClusterItemsSelector = createSelector(
  state => state.clusterId,
  unlabeledItemIdsSelector,
  itemDataSelector,
  (curClusterId, itemIds, items) => (curClusterId == null
    ? []
    : itemIds.filter(id => items.byId.get(id).cluster === curClusterId)
  ),
);
export const clusterExemplarIdsSelector = createSelector(
  itemDataSelector,
  items => [...items.byId.filter(item => item.exemplar).keys()],  // Unsorted.
);
export const itemAnswersSelector = createSelector(
  itemDataSelector,
  answersSelector,
  (items, answers) => new Map([...items.byId].map(([id, item]) => [
    id,
    item.answers.map(answerId => answers.byId.get(answerId)),
  ])),
);
export const itemAnswerScoresSelector = createSelector(
  itemAnswersSelector,
  itemAnswers => new Map(
    [...itemAnswers].map(([id, answers]) => [
      id,
      getScore('answer')(
        ...answers.map(answer => answer.data.answer),
      ).color,
    ]),
  ),
);
export const itemScoresSelector = createSelector(
  itemAnswersSelector,
  state => state.config.sortMetric,
  (itemAnswers, sortMetric) => new Map(
    [...itemAnswers].map(([id, answers]) => [
      id,
      getScore(sortMetric)(
        ...answers.map(answer => answer.data.answer),
      ).color,
    ]),
  ),
);
export const sortedItemIdsSelector = createSelector(
  itemScoresSelector,
  clusterExemplarIdsSelector,
  itemIdsSelector,
  state => state.config.useAnswers,
  state => state.config.exemplarsFirst && state.config.useReasons,
  (scores, exemplars, allItemIds, shouldSort, exemplarsFirst) => {
    if (!shouldSort) {
      return allItemIds;
    }
    const sortedItemIds = [...scores.keys()].sort(
      (id1, id2) => scores.get(id1) - scores.get(id2),
    );
    const sorted = (exemplarsFirst
      ? [...exemplars, ...sortedItemIds.filter(id => !exemplars.includes(id))]
      : sortedItemIds
    );
    return sorted;
  },
);
export const unlabeledSortedItemIdsSelector = createSelector(
  unlabeledItemIdsSelector,
  sortedItemIdsSelector,
  (unlabeledItemIds, sortedItemIds) => sortedItemIds.filter(id => unlabeledItemIds.has(id)),
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
  unlabeledItemIdsSelector,
  groupItemsSelector,
  itemSimilaritiesSelector,
  (itemId, unlabeledItems, groups, similarities) => {
    if (itemId == null || !unlabeledItems.has(itemId)) {
      return -1;
    }
    const groupSimilarities = new Map([...groups]
      .map(([groupId, itemIds]) => [groupId, [...similarities.get(itemId).keys()].findIndex(id => [...itemIds].indexOf(id) >= 0)])  // first index into similarities of item in group
      .filter(([, index]) => index > -1)
      .map(([groupId, index]) => [groupId, [...similarities.get(itemId).keys()][index]])
      .sort(([, i1], [, i2]) => i1 - i2),
    );
    return groupSimilarities.size === 0 ? -1 : [...groupSimilarities.keys()][0];
  },
);

export const getItemsSummary = (itemIds, state) => (
  []
  .concat(...itemIds
    //.filter(id => itemDataSelector(state).byId.get(id).exemplar)  // Select only exemplar for cluster?
    .map(id => itemAnswersSelector(state).get(id)),
  )
  .map(answer => answer.data.unclear_type || answer.data.unclear_reason)
  .filter(s => s)
  .join(' ... ')
);

/*
 * reducers
 */

export default combineReducers({
  config,
  autoAdvance,
  entities,
  currentItem,
  clusterId,
  lightboxId,
  generalInstructions,
  experimentPhase,
  oracle,
});
