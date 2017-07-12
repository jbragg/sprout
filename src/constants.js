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
    text: 'Imagine a customer has given you these instructions for how to label a set of items. Your goal is to clarify these instructions for crowd workers, who will use them to label a large set of items for the customer.',
    selector: '.instructions-customer',
  },
  /*{
    text: 'Now we will proceed to describe the 4 main sections of the application interface you will be using.',
    selector: '.instructions',
  },
  */
  {
    title: 'Instructions section (1/4)',
    text: 'This is the instructions panel section, where you will interact with the customer (top) and create your improved instructions (bottom).',
    selector: '.instructions',
    position: 'top-left',
  },
  {
    title: 'Item navigation section (2/4)',
    text: 'This section is for finding new items to label.',
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
    text: 'Drag items to this section to label and organize them. Remember this is not your goal, since workers will be doing this later. Your goal is to improve the instructions for the workers!',
    selector: '.labeled-column',
    position: 'top',
  },
  {
    text: 'An enlarged version of the item to label appears in the item preview. You can also zoom in further by clicking here.',
    selector: '.item-large .item',
    position: 'right',
  },
  {
    text: 'Worker answers are summarized here (when available).',
    selector: '.item-large .answers-summary',
    position: 'top',
  },
  {
    text: 'Worker confusions are summarized here (when available).',
    selector: '.item-large .confusions-summary',
    position: 'top',
  },
  {
    title: 'Additional information indicator',
    text: 'This shows the number of workers that are summarized in this section. Hover to see details.',
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
    text: "The shaking means that the system is thinks this item might belong in the group with a star. Please drag it there now.",
    selector: '.item-large',
  },
  {
    text: 'This bar shows your progress towards labeling all items (the number shows how many you have labeled). Your goal is to improve the instructions, not label all items.',
    selector: '.labeling-progress',
  },
  /*
  {
    text: 'This is the next unlabeled item with the most disagreement. Click on this item or any other item to display it in the current item panel.',
    selector: '.similar-item-list .next',
  },
  {
    text: 'Unlabeled items that are most similar to the next item appear here.',
    selector: '.similar-item-list .similar',
  },
  */
  {
    text: 'This tab shows clusters of similar unlabeled items.',// Please click here now.',
    selector: '.clusters-nav',
  },
  {
    text: "Please scroll to the third cluster.",
    selector: '.cluster-item-list .page',
  },
  {
    text: "Use these arrows to scroll to different items within a group.",
    selector: '.cluster-item-list .slick-next',
  },
  {
    text: "The progress bar tells you your scrolling position.",
    selector: '.cluster-item-list .progress',
  },
  {
    text: "Now drag the cluster to the 'no' label.",
    selector: '.cluster-item-list',
  },
  {
    text: "All the items are here, sorted in order of decreasing amounts of worker disagreement. Use the 'Go to first unlabeled' button to go to the next unlabeled item with the most disagreement. 'Go to current' scrolls to the item that is currently being previewed.",
    selector: '.items-nav',
  },
  {
    text: "Now try asking the customer how they'd like an item labeled by dragging it to the 'Ask for a clarification' section.",
    selector: '.instructions',
  },
  {
    text: 'Now try editing the instructions (including referring to an example item) and previewing your edits.',
    selector: '.instructions',
  },
  {
    text: 'Now try creating a test question and creating a reason for it.',
    selector: '.instructions',
  },
];
