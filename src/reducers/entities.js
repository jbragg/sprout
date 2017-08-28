import { OrderedMap as Map, OrderedSet as Set } from 'immutable';
import {
  EDIT_ITEM, EDIT_GROUP, MERGE_GROUP, CREATE_GROUP, ASSIGN_ITEMS,
  RECEIVE_EXPERIMENT, EDIT_TAG,
} from '../actions';
import { defaults } from '../constants';

const defaultState = {
  groups: { byId: new Map() },
  itemData: { byId: new Map() },
  items: { byId: new Map() },
  answers: { byId: new Map() },
  labels: new Map(defaults.labels.map(label => [label, { itemIds: new Set() }])),
  tags: { byId: new Map() },
};

const entities = (state = defaultState, action) => {
  switch (action.type) {
    case RECEIVE_EXPERIMENT: {
      return {
        ...state,
        itemData: {
          byId: new Map(action.payload.itemData.map(value => [value.id, {
            ...value,
            answers: action.payload.answers
              .filter(answer => answer.data.questionid === value.id)
              .map(answer => answer.assignmentid),
          }])),
        },
        items: {
          byId: new Map(action.payload.items.map(value => [value.id, {
            ...value,
          }])),
        },
        groups: {
          byId: new Map(action.payload.groups.map(value => [value.id, value],
          )),
        },
        answers: {
          byId: new Map(action.payload.answers.map(value => [value.assignmentid, value])),
        },
        labels: new Map([...state.labels].map(([label, value]) => ([
          label,
          {
            ...value,
            itemIds: new Set([
              ...value.itemIds,
              ...action.payload.items.filter(item => item.label === label).map(item => item.id),
            ]),
          },
        ]))),
      };
    }
    case EDIT_ITEM: {
      return {
        ...state,
        items: {
          ...state.items,
          byId: new Map([
            ...state.items.byId,
            [action.itemId, {
              ...state.items.byId.get(action.itemId),
              ...action.keyValues,
            }],
          ]),
        },
      };
    }
    case ASSIGN_ITEMS: {
      return {
        ...state,
        items: {
          ...state.items,
          byId: new Map([
            ...state.items.byId,
            ...action.itemIds.map(id => [
              id,
              {
                ...state.items.byId.get(id),
                label: null,
                group: null,
                ...action.assignment,
              },
            ]),
          ]),
        },
        groups: {
          ...state.groups,
          byId: new Map(
            [...state.groups.byId.entries()].map(
              ([key, value]) => [
                key,
                key === action.assignment.group
                ? {
                  ...value,
                  itemIds: new Set([
                    ...value.itemIds.values(),
                    ...action.itemIds]),
                }
                : {
                  ...value,
                  itemIds: new Set(
                    [...value.itemIds.values()].filter(id => action.itemIds.indexOf(id) < 0)),
                },
              ],
            ),
          ),
        },
        labels: new Map(
          [...state.labels.entries()].map(
            ([key, value]) => [
              key,
              key === action.assignment.label
              ? {
                ...value,
                itemIds: new Set([
                  ...value.itemIds.values(),
                  ...action.itemIds]),
              }
              : {
                ...value,
                itemIds: new Set(
                  [...value.itemIds.values()].filter(id => action.itemIds.indexOf(id) < 0)),
              },
            ],
          ),
        ),
      };
    }
    case EDIT_GROUP: {
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: new Map([
            ...state.groups.byId,
            [action.groupId, {
              ...state.groups.byId.get(action.groupId),
              ...action.keyValues,
            }],
          ]),
        },
      };
    }
    case CREATE_GROUP: {
      const maxGroupId = Math.max(-1, ...state.groups.byId.keys());
      const nextGroupId = maxGroupId + 1;
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: new Map([
            ...state.groups.byId,
            [nextGroupId, {
              name: '',
              description: '',
              itemIds: new Set(),
              ...action.keyValues,
              id: nextGroupId,
            }],
          ]),
        },
      };
    }
    case MERGE_GROUP: {
      // Reassign items in group to another group or label
      return {
        ...state,
        items: {
          ...state.items,
          byId: new Map(
            [...state.items.byId.entries()].map(
              ([key, value]) => (
                [key, value.group === action.groupId
                  ? { ...value, group: null, label: null, ...action.target }
                  : value]
              )),
          ),
        },
        groups: {
          ...state.groups,
          byId: new Map(
            [...state.groups.byId.entries()]
            .filter(([key]) => key !== action.groupId)
            .map(
              ([key, value]) => (
                [key, key === action.target.group
                  ? {
                    ...value,
                    itemIds: new Set([
                      ...value.itemIds.values(),
                      ...state.groups.byId.get(action.groupId).itemIds.values()]),
                  }
                  : value]
              )),
          ),
        },
        labels: new Map(
          [...state.labels.entries()]
          .map(
            ([key, value]) => (
              [key, key === action.target.label
                ? {
                  ...value,
                  itemIds: new Set([
                    ...value.itemIds.values(),
                    ...state.groups.byId.get(action.groupId).itemIds.values()]),
                }
                : value]
            )),
        ),
      };
    }
    case EDIT_TAG: {
      const { id, ...rest } = action.payload;
      return {
        ...state,
        tags: {
          ...state.tags,
          byId: new Map([
            ...state.tags.byId.entries(),
            [id, { ...rest }],
          ]),
        },
      };
    }
    default: {
      return state;
    }
  }
};

export default entities;
