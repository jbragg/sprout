import fetch from 'isomorphic-fetch';
import { OrderedSet as Set } from 'immutable';
import latin3x3 from './rand/latin/latin3x3';
import { groupsSelector } from './reducers/index';
import config from './config';

/*
 * action types
 */

export const ANSWER_ORACLE = 'ANSWER_ORACLE';
export const QUEUE_ITEM_ORACLE = 'QUEUE_ITEM_ORACLE';
export const UNQUEUE_ITEM_ORACLE = 'UNQUEUE_ITEM_ORACLE';
export const SET_CURRENT_ITEM = 'SET_CURRENT_ITEM';
export const SET_CLUSTER_ID = 'SET_CLUSTER_ID';
export const ASSIGN_ITEMS = 'ASSIGN_ITEMS';
export const EDIT_ITEM = 'EDIT_ITEM';
export const CREATE_GROUP = 'CREATE_GROUP';
export const MERGE_GROUP = 'MERGE_GROUP';
export const EDIT_GROUP = 'EDIT_GROUP';
export const EDIT_GENERAL_INSTRUCTIONS = 'EDIT_GENERAL_INSTRUCTIONS';
export const REQUEST_EXPERIMENT = 'REQUEST_EXPERIMENT';
export const RECEIVE_EXPERIMENT = 'RECEIVE_EXPERIMENT';
export const FETCH_EXPERIMENT = 'FETCH_EXPERIMENT';
export const CHANGE_EXPERIMENT_PHASE = 'CHANGE_EXPERIMENT_PHASE';
export const SET_LIGHTBOX = 'SET_LIGHTBOX';
export const SET_AUTOADVANCE = 'SET_AUTOADVANCE';

/*
 * action creators
 */

export function setAutoAdvance(payload) {
  return {
    type: SET_AUTOADVANCE,
    payload,
  };
}

export function setLightbox(payload) {
  return {
    type: SET_LIGHTBOX,
    payload,
  };
}

export function setClusterId(id) {
  return {
    type: SET_CLUSTER_ID,
    id,
  };
}

function answerOracle() {
  return {
    type: ANSWER_ORACLE,
  };
}

export function queueItemOracle(itemId) {
  return {
    type: QUEUE_ITEM_ORACLE,
    itemId,
  };
}

export function unqueueItemOracle(itemId) {
  return {
    type: UNQUEUE_ITEM_ORACLE,
    itemId,
  };
}

export function setCurrentItem(itemId = null) {
  return {
    type: SET_CURRENT_ITEM,
    itemId,
  };
}

export function assignItems(itemIds, assignment, setCurrent = false) {
  const action = {
    type: ASSIGN_ITEMS,
    itemIds,
    assignment,  // { label: labelName } or { group: groupId }
  };
  return (setCurrent
    ? (dispatch) => {
      dispatch(action);
      dispatch(setCurrentItem());
    }
    : action
  );
}

export function editItem(itemId, keyValues) {
  return {
    type: EDIT_ITEM,
    itemId,
    keyValues,  // { test: true } or { reason: { label: true, text: 'something' } }
  };
}

export function editGroup(groupId, keyValues) {
  return {
    type: EDIT_GROUP,
    groupId,
    keyValues,
  };
}

export function createGroup(keyValues, itemIds = null, setCurrent = false) {
  const action = {
    type: CREATE_GROUP,
    keyValues,
  };
  return (setCurrent || itemIds != null
    ? (dispatch, getState) => {
      dispatch(createGroup(keyValues));
      if (itemIds != null) {
        const groupId = Math.max(...groupsSelector(getState()).byId.keys());
        dispatch(assignItems(itemIds, { group: groupId }));
      }
      if (setCurrent) {
        dispatch(setCurrentItem());
      }
    }
    : action
  );
}

export function mergeGroup(groupId, target) {
  return {
    type: MERGE_GROUP,
    groupId,
    target,  // {label: labelName} or {group: groupId}
  };
}

export function editGeneralInstructions(markdown) {
  return {
    type: EDIT_GENERAL_INSTRUCTIONS,
    markdown,
  };
}

const ORACLE_CHECK_INTERVAL = 30 * 1000;  // seconds to milliseconds
let timer = null;
function startOracle() {
  return (dispatch) => {
    clearInterval(timer);
    timer = setInterval(() => dispatch(answerOracle()), ORACLE_CHECK_INTERVAL);
  };
}

function requestExperiment() {
  return { type: REQUEST_EXPERIMENT };
}

function receiveExperiment(payload) {
  return { type: RECEIVE_EXPERIMENT, payload };
}

const answerKey = new Map([
  [1, 'Definitely No'],
  [2, 'Probably No'],
  [3, 'No preference for Yes or No'],
  [4, 'Probably Yes'],
  [5, 'Definitely Yes'],
]);

function formatAnswerData(answerData) {
  // TODO: Do this server-side.
  const answerKeyIndex = [...answerKey.values()].indexOf(answerData.answer);
  let answerValue = (answerKeyIndex >= 0) ? answerKeyIndex + 1 : Number(answerData.answer);
  // Answers on the server go from Definitely Yes to Definitely No, but we reverse that.
  answerValue = ((answerValue - 3) * -1) + 3;
  return {
    ...answerData,
    answer: answerValue,
    answerString: answerKey.get(answerValue),
    unclearReasonString: (answerData.unclear_type || answerData.unclear_reason) ? `Questions about ${answerData.unclear_type || '[MISSING]'} may be unclear because ${answerData.unclear_reason || '[MISSING]'}` : null,
  };
}

const getTreatment = (participantIndex, taskIndex) => {
  if (participantIndex == null || taskIndex == null) {
    return 2;  // full system
  }
  const participant = Number(participantIndex);
  const task = Number(taskIndex);
  const squareIndex = Math.floor(participant / 3) % latin3x3.length;
  return latin3x3[squareIndex][participant % 3][task] - 1;
};

const getItemLabels = (items, groups = null) => {
  const groupsMap = new Map(groups.map(group => [group.id, group]));
  return new Map(items.map(item => [
    item.id,
    (item.group != null
      ? groupsMap.get(item.group).label
      : item.label
    ),
  ]));
};

const setUpExperiment = (
  experiment, itemRootPath, answers = null, state = null, oracle = null,
) => {
  const oracleLabels = oracle == null ? new Map() : getItemLabels(oracle.items, oracle.groups);
  const experimentData = experiment.data;
  const itemData = experimentData.map((item, id) => ({
    id,
    ...item,
    data: {
      ...item.data,
      path: `${itemRootPath}/${item.data.path}`,
    },
    labelGT: oracleLabels.get(item.id != null ? item.id : id),
  }));
  const items = state && state.items ? state.items : itemData.map(item => ({
    id: item.id,
  }));
  const formattedAnswers = answers == null ? [] :
    answers.map((answer, id) => ({
      ...answer,
      assignmentid: id,
      data: formatAnswerData(answer.data),
    }));
  const groups = state && state.groups
    ? state.groups.map(
      group => ({
        name: '',
        description: '',
        ...group,
        itemIds: new Set(
          group.itemIds
          || items.filter(item => item.group === group.id).map(item => item.id),
        ),
      }),
    )
    : [];
  return {
    answerKey,
    items,
    itemData,
    groups,
    answers: formattedAnswers,
  };
};

export function fetchExperiment(params) {
  return (dispatch) => {
    dispatch(requestExperiment());
    let task = null;
    let experimentId = null;
    let taskId = params.taskId;
    if (params.tutorial || params.taskIndex != null) {
      experimentId = params.experimentId || 'default';
      taskId = params.tutorial
        ? config.experiments[experimentId].tutorial
        : config.experiments[experimentId].tasks[params.taskIndex];
    }
    task = config.tasks[taskId];
    const experimentPromise = fetch(task.experimentPath)
      .then(response => response.json());
    const promises = [
      experimentPromise,
      (task.answersPath == null
        ? Promise.resolve(null)
        : fetch(task.answersPath).then(response => response.json())
      ),
      (task.statePath == null
        ? Promise.resolve(null)
        : fetch(task.statePath).then(response => response.json())
      ),
      (task.oraclePath == null
        ? Promise.resolve(null)
        : fetch(task.oraclePath).then(response => response.json())
      ),
    ];

    return Promise.all(promises)
      .then((result) => {
        const [experiment, answers, state, oracle] = result;

        let systemVersion = null;
        if (params.participantIndex != null) {
          systemVersion = params.tutorial
            ? 2
            : getTreatment(params.participantIndex, params.taskIndex);
        } else {
          systemVersion = params.systemVersion == null ? 2 : params.systemVersion;
        }
        dispatch(receiveExperiment({
          ...setUpExperiment(
            experiment,
            task.itemRootPath,
            answers,
            state,
            oracle,
          ),
          initialInstructions: task.initialInstructions,
          instructions: (state && state.instructions) || task.initialInstructions,
          tutorial: task.tutorial,
          isExperiment: task.isExperiment,
          participantId: params.participantId,
          participantIndex: params.participantIndex,
          systemVersion,
        }));
        dispatch(setCurrentItem());
        if (task.isExperiment) {
          dispatch(startOracle());
        }
      });
  };
}

export function changeExperimentPhase(phase, payload = null) {
  return {
    type: CHANGE_EXPERIMENT_PHASE,
    phase,
    payload,
  };
}
