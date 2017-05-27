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
        "It's been a few minutes. Remember your goal is to improve the instructions. You should **ask for clarifications**, **edit the instructions**, and **create test questions**.",
      ],
      [
        10 * 60 * 1000,
        'You have only a few minutes remaining. You should be improving the instructions. Remember to **ask for clarifications**, **edit the instructions**, and **create test questions**.',
      ],
    ],
  },
};

export const tutorialSteps = [
  {
    title: 'Instructions section (1/4)',
    text: "The interface is organized into four main sections. This is the instructions panel section, where you will interact with the customer and create your improved instructions.",
    selector: '.instructions',
    position: 'top-left',
  },
  {
    title: 'Unlabeled items section (2/4)',
    text: 'Items you have not yet labeled can be found here.',
    selector: '.unlabeled-items',
    position: 'top',
  },
  {
    title: 'Item preview section (3/4)',
    text: 'You can view more details about an item in this section.',
    selector: '.item-large',
    position: 'top',
  },
  {
    title: 'Labeled items section (4/4)',
    text: 'The labeled items section should help you organize items for the purpose of improving the instructions.',
    selector: '.labeled-column',
    position: 'top',
  },
  {
    text: 'An enlarged version of the item to label appears here.',
    selector: '.item-large .item',
    position: 'right',
  },
  {
    text: 'Worker answers are summarized here.',
    selector: '.item-large .answers-summary',
    position: 'top',
  },
  {
    title: 'Worker confusions are summarized here.',
    selector: '.item-large .confusions-summary',
    position: 'top',
  },
  {
    title: 'Additional information indicator',
    text: 'This shows the number of workers that are summarized here. Try hovering to see additional information.',
    selector: '.item-large .answers-summary .workers-indicator',
    position: 'right',
  },
  {
    text: "Dragging an item into one of these sections assigns a label. Please drag the current item here now to label it 'yes'. Notice that when you start dragging, the possible drop targets have dashed-red borders.",
    selector: '.labeled-column .label-section.label-yes',
    position: 'left',
  },
  {
    text: "If you are not sure yet whether to label the item 'yes' or 'no', you can postpone your decision by labeling it 'maybe'.",
    selector: '.labeled-column .label-section.label-maybe',
    position: 'left',
  },
  {
    text: "Drag an item to one of these targets to create a new group. Please drag the next current item here to assign it to a new group in the 'maybe' category.",
    selector: '.labeled-column .label-section.label-maybe .new-group',
  },
  {
    text: 'This bar shows your progress towards labeling all items (the number shows how many you have labeled). Your goal is to improve the instructions, not label all items.',
    selector: '.labeling-progress',
  },
  {
    text: 'This is the next unlabeled item with the most disagreement. Click on this item or any other item to display it in the current item panel.',
    selector: '.similar-item-list .next',
  },
  {
    text: 'Unlabeled items that are most similar to the next item appear here.',
    selector: '.similar-item-list .similar',
  },
  {
    text: 'This tab shows clusters of similar unlabeled items. Please click here now.',
    selector: '.clusters-nav',
  },
  {
    text: "Please scroll to the third cluster and drag the entire cluster to the 'no' label on the right now.",
    selector: '.cluster-item-list .page',
  },
];
