import fetch from 'isomorphic-fetch';
import latin3x3 from './rand/latin/latin3x3';
import binary from './rand/binary/binary';
import { Labels } from './constants';

/*
 * action types
 */

export const ANSWER_ORACLE = 'ANSWER_ORACLE';
export const QUEUE_ITEM_ORACLE = 'QUEUE_ITEM_ORACLE';
export const SET_CURRENT_ITEM = 'SET_CURRENT_ITEM';
export const SET_CLUSTER_ID = 'SET_CLUSTER_ID';
export const ASSIGN_ITEM = 'ASSIGN_ITEM';
export const CREATE_GROUP = 'CREATE_GROUP';
export const MERGE_GROUP = 'MERGE_GROUP';
export const EDIT_GROUP = 'EDIT_GROUP';
export const EDIT_GENERAL_INSTRUCTIONS = 'EDIT_GENERAL_INSTRUCTIONS';
export const REQUEST_EXPERIMENT = 'REQUEST_EXPERIMENT';
export const RECEIVE_EXPERIMENT = 'RECEIVE_EXPERIMENT';
export const FETCH_EXPERIMENT = 'FETCH_EXPERIMENT';

/*
 * action creators
 */

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

export function setCurrentItem(itemId = null) {
  return {
    type: SET_CURRENT_ITEM,
    itemId,
  };
}

export function assignItem(itemId, assignment) {
  return {
    type: ASSIGN_ITEM,
    itemId,
    assignment,  // {label: labelName} or {group: groupId}
  };
}

export function assignAndSetCurrentItem(itemId, assignment) {
  return (dispatch) => {
    dispatch(assignItem(itemId, assignment));
    dispatch(setCurrentItem());
  };
}

export function editGroup(groupId, keyValues) {
  return {
    type: EDIT_GROUP,
    groupId,
    keyValues,
  };
}

export function createGroup(keyValues) {
  return {
    type: CREATE_GROUP,
    keyValues,
  };
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

function receiveExperiment(json) {
  return { type: RECEIVE_EXPERIMENT, payload: json };
}

const answerKey = [
  'Definitely No',
  'Probably No',
  'No preference for Yes or No',
  'Probably Yes',
  'Definitely Yes',
];

function formatAnswerData(answerData) {
  // TODO: Do this server-side.
  const answerKeyIndex = answerKey.indexOf(answerData.answer);
  let answerValue = (answerKeyIndex >= 0) ? answerKeyIndex + 1 : Number(answerData.answer);
  // Answers on the server go from Definitely Yes to Definitely No, but we reverse that.
  answerValue = ((answerValue - 3) * -1) + 3;
  return {
    ...answerData,
    answer: answerValue,
    answerString: answerKey[answerValue - 1],
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
  return latin3x3[squareIndex][participant % 3][task];
};

const getCustomerClusterLabel = (cluster, taskIndex = 0) => (
  binary[taskIndex][cluster] === 0 ? Labels.YES : Labels.NO
);

const setUpExperiment = (experiment, answers, taskIndex) => {
  const rootDirPrefix = experiment.data.root_dir;
  const items = experiment.data.data.map(item => ({
    ...item,
    data: {
      ...item.data,
      path: `${rootDirPrefix}/${item.data.path}`,
    },
    labelGT: ((item.cls === 'DontKnow' && item.subgroup >= 0)
      ? getCustomerClusterLabel(item.subgroup, taskIndex)
      : item.cls || null
    ),
  }));
  const formattedAnswers = answers.map((answer, id) => ({
    ...answer,
    assignmentid: id,
    data: formatAnswerData(answer.data),
  }));
  return {
    items,
    answers: formattedAnswers,
    initialInstructions: experiment.data.initial_instructions,
  };
};

export function fetchExperiment(params) {
  return (dispatch) => {
    dispatch(requestExperiment());
    const experimentPromise = fetch('/static/private/pilot_instructions_experiment.json')
      .then(response => response.json());
    const answersPromise = fetch('/static/private/pilot_instructions_data_anon.json')
      .then(response => response.json());

    return Promise.all([experimentPromise, answersPromise])
      .then((result) => {
        const [experiment, answers] = result;
        const taskIndex = params.taskIndex || 0;
        const systemVersion = params.systemVersion == null ? 2 : params.systemVersion;
        dispatch(receiveExperiment({
          ...setUpExperiment(
            experiment,
            answers,
            taskIndex,
          ),
          taskIndex,
          participantIndex: params.participantIndex,
          systemVersion: (params.participantIndex == null
            ? systemVersion
            : getTreatment(params.participantIndex, taskIndex)
          ),
        }));
        dispatch(setCurrentItem());
        dispatch(startOracle());
      });
  };
}
