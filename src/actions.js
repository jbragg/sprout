import fetch from 'isomorphic-fetch';

/*
 * action types
 */

export const EDIT_LABEL_FORM = 'EDIT_LABEL_FORM';
export const SET_CURRENT_ITEM = 'SET_CURRENT_ITEM';
export const ASSIGN_ITEM = 'ASSIGN_ITEM';
export const CREATE_GROUP = 'CREATE_GROUP';
export const MERGE_GROUP = 'MERGE_GROUP';
export const EDIT_GROUP = 'EDIT_GROUP';
export const REQUEST_EXPERIMENT = 'REQUEST_EXPERIMENT';
export const RECEIVE_EXPERIMENT = 'RECEIVE_EXPERIMENT';
export const FETCH_EXPERIMENT = 'FETCH_EXPERIMENT';

/*
 * action creators
 */

export function editLabelForm(keyValues) {
  return {
    type: EDIT_LABEL_FORM,
    keyValues,
  };
}

export function setCurrentItem(itemId = null) {
  return {
    type: SET_CURRENT_ITEM,
    newItemId: itemId,
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

function requestExperiment() {
  return {type: REQUEST_EXPERIMENT};
}

function receiveExperiment(json) {
  return {type: RECEIVE_EXPERIMENT, payload: json};
}

function stringAnswerToInt(answer) {
  // TODO: Do this server-side.
  switch (answer) {
    case 'Definitely Yes': {
      return 1;
    }
    case 'Probably Yes': {
      return 2;
    }
    case 'No preference for Yes or No': {
      return 3;
    }
    case 'Probably No': {
      return 4;
    }
    case 'Definitely No': {
      return 5;
    }
    default: {
      return Number(answer);
    }
  }
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
          answer.data.answer = stringAnswerToInt(answer.data.answer);
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
