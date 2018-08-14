const global = {
  oracle: false,
  prefetchAll: false,
  exportButton: true,
  countdown: false,
  warnings: false,
  tutorial: false,
  waitForImagesFrac: 0,
  exemplarsFirst: true,
  clusters: false,
  fixedLabelTargets: false,
  useReasons: true,
  useAnswers: true,
  draggable: true,
  interface: 'structuredLabeling',
  editReason: false,
  hideNestedSuggestions: true,
};

export const suggestionsInterface = {
  // draggable: false,
  // editReason: true,
  interface: 'suggestions',
};

const experiment = {
  waitForImagesFrac: 1,
  //waitForImagesFrac: 0.1,
  prefetchAll: true,
  exportButton: false,
  countdown: true,
  warnings: true,
};

const tutorial = {
  exportButton: false,
  tutorial: true,
};

const shared = {
  bird: {
    ...global,
    experimentPath: '/static/private/experiment/bird.with_vec.json',
    answersPath: '/static/private/answers/bird.json',
    initialInstructions: 'Mark whether the image is an image of a bird.',
  },
};

export default {
  tasks: {
    /* Resolve */
    sampleSprout: {
      ...shared.bird,
      ...suggestionsInterface,
    },

    sampleSproutTutorial: {
      ...shared.bird,
      ...suggestionsInterface,
      ...tutorial,
    },

    sampleStructuredLabeling: {
      ...shared.bird,
      useAnswers: false,
      useReasons: false,
    },

    sampleStructuredLabelingTutorial: {
      ...shared.bird,
      useAnswers: false,
      useReasons: false,
      ...tutorial,
    },

  },
};
