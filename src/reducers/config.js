import { RECEIVE_EXPERIMENT } from '../actions';
import { defaults } from '../constants';
import { defaults as defaultMetrics } from '../score';

const defaultState = {
  participantIndex: null,
  systemVersion: null,
  labels: defaults.labels,
  finalLabels: defaults.finalLabels,
  tutorial: false,
  uncertainLabel: defaults.uncertainLabel,
  similarNav: false,
  initialInstructions: null,
  sortMetric: defaultMetrics.sort,
  exemplarsFirst: true,
  clusters: false,
};

const config = (state = defaultState, action) => {
  switch (action.type) {
    case RECEIVE_EXPERIMENT: {
      return {
        ...state,
        ...action.payload.config,
      };
    }
    default: {
      return state;
    }
  }
};

export default config;
