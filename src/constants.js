export const DragItemTypes = {
  ITEM: 'item',
  GROUP: 'group',
  CLUSTER: 'cluster',
};

export const Labels = {
  YES: 'yes',
  MAYBE: 'maybe',
  NO: 'no',
};

export const States = {
  LOADING: 'loading',
  LOADED: 'loaded',
  COMBINED: 'singlePage',
  LABELING: 'labeling',
  ORACLE: 'oracle',
  INSTRUCTIONS: 'instructions',
  SURVEY: 'survey',
  THANKS: 'thanks',
};

export const defaults = {
  sliderSettings: {
    dots: true,
    infinite: false,
    speed: 500,
    swipe: false,
  },
  similarityThreshold: 0.5,
  structuredInstructions: false,
  durations: {
    [States.COMBINED]: 15 * 60 * 1000,  // minutes to milliseconds
    [States.LABELING]: 5 * 60 * 1000,
    [States.INSTRUCTIONS]: 5 * 60 * 1000,
  },
  warnings: {
    [States.COMBINED]: [
      [
        5 * 60 * 1000,
        "It's been a few minutes. Remember your goal is to improve the instructions. You should **ask for clarifications**, **edit the instructions**, and **create test questions**."
      ],
      [
        10 * 60 * 1000,
        "You have only a few minutes remaining. You should be improving the instructions. Remember to **ask for clarifications**, **edit the instructions**, and **create test questions**."
      ],
    ],
  },
}
