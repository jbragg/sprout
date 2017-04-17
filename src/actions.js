import fetch from 'isomorphic-fetch';

/*
 * action types
 */

export const ANSWER_ORACLE = 'ANSWER_ORACLE';
export const QUEUE_ITEM_ORACLE = 'QUEUE_ITEM_ORACLE';
export const SET_CURRENT_ITEM = 'SET_CURRENT_ITEM';
export const ASSIGN_ITEM = 'ASSIGN_ITEM';
export const CREATE_GROUP = 'CREATE_GROUP';
export const MERGE_GROUP = 'MERGE_GROUP';
export const EDIT_GROUP = 'EDIT_GROUP';
export const EDIT_GENERAL_INSTRUCTIONS = 'EDIT_GENERAL_INSTRUCTIONS';
export const REQUEST_EXPERIMENT = 'REQUEST_EXPERIMENT';
export const RECEIVE_EXPERIMENT = 'RECEIVE_EXPERIMENT';
export const FETCH_EXPERIMENT = 'FETCH_EXPERIMENT';
export const EDIT_COLOR_UNREVIEWED = 'EDIT_COLOR_UNREVIEWED';

/*
 * action creators
 */

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

export function editColorUnreviewed(metric) {
  return {
    type: EDIT_COLOR_UNREVIEWED,
    metric,
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
  answerValue = (answerValue - 3) * -1 + 3;
  return {
    ...answerData,
    answer: answerValue,
    answerString: answerKey[answerValue - 1],
    unclearReasonString: (answerData.unclear_type || answerData.unclear_reason) ? `Questions about ${answerData.unclear_type || '[MISSING]'} may be unclear because ${answerData.unclear_reason || '[MISSING]'}` : null,
  };
}

export function fetchExperiment() {
  return (dispatch) => {
    dispatch(requestExperiment());
    const experimentPromise = fetch('private/pilot_instructions_experiment.json')
      .then(response => response.json());
    const answersPromise = fetch('private/pilot_instructions_data_anon.json')
      .then(response => response.json());

    return Promise.all([experimentPromise, answersPromise])
      .then((result) => {
        const [experiment, answers] = result;
        const rootDirPrefix = experiment.data.root_dir;
        for (let item of experiment.data.data) {
          item.data.path = `${rootDirPrefix}/${item.data.path}`;
        }
        for (let answer of answers) {
          answer.data = formatAnswerData(answer.data);
        }
        dispatch(receiveExperiment({
          items: experiment.data.data,
          answers: answers,
          initialInstructions: experiment.data.initial_instructions,
        }));
        dispatch(setCurrentItem());
      });
  }
}

const ORACLE_CHECK_INTERVAL = 30 * 1000;  // seconds to milliseconds
let timer = null;
export function startOracle() {
  return (dispatch) => {
    clearInterval(timer);
    timer = setInterval(() => dispatch(answerOracle()), ORACLE_CHECK_INTERVAL);
  }
}
