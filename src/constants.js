import React from 'react';

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
  labels: [Labels.YES, Labels.MAYBE, Labels.NO],
  finalLabels: [Labels.YES, Labels.NO],
  uncertainLabel: Labels.MAYBE,
  durations: {
    [States.COMBINED]: 20 * 60 * 1000,  // minutes to milliseconds
    [States.LABELING]: 5 * 60 * 1000,
    [States.INSTRUCTIONS]: 5 * 60 * 1000,
  },
  warnings: {
    [States.COMBINED]: [
      [
        6 * 60 * 1000,
        "It's been a few minutes. Remember your goal is to improve the instructions!", // You should **ask for clarifications**, **edit the instructions**, and **create test questions**.",
      ],
      [
        12 * 60 * 1000,
        'You have only a few minutes remaining. You should be improving the instructions by now!', // Remember to **ask for clarifications**, **edit the instructions**, and **create test questions**.',
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
    // text: 'This is the instructions panel section, where you will interact with the customer (top) and create your improved instructions (bottom).',
    text: 'This is the instructions panel section, where you will create your improved instructions (including test questions).',
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
    text: 'You can view more details about an item in the current item preview.',
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
    text: "All the items are here. The front of the list has items with shadows that represent groups of similar items, followed by items with high worker disagreement. Use the 'Go to first unlabeled' button to go to the left-most unlabeled item. 'Go to current' scrolls to the item that is currently being previewed.",
    selector: '.items-nav',
  },
  {
    text: "Use these arrows to scroll to different items within this group. **Action required**: Try scrolling now.",
    selector: '.items-nav .slick-next',
  },
  /*
  {
    text: "The progress bar tells you your scrolling position.",
    selector: '.items-nav .progress',
  },
  */
  {
    text: 'An enlarged version of the current item appears here. **Action required**: Try zooming into the item now by clicking here and scrolling the mouse (or using the magnification buttons).',
    selector: '.item-large .item',
    position: 'right',
  },
  {
    text: "Worker answers are summarized here (when available). Notice that the color at the top of the item corresponds to the average answer value. You can use these colors to quickly identify if workers disagree with a label you have assigned (for instance, if an item is red but you labeled it 'yes').",
    selector: '.item-large .answers-summary',
    position: 'top',
  },
  {
    title: 'Additional information indicator',
    text: 'This shows the number of workers that are summarized in this section. **Action required**: Hover to see a detailed breakdown of answers.',
    selector: '.item-large .answers-summary .workers-indicator',
    position: 'right',
  },
  {
    text: 'Reasons for worker labels are summarized here (when available). **Action required**: Hover to see additional reasons (if available).',
    selector: '.item-large .confusions-summary',
    position: 'top',
  },
  {
    text: 'Items that are similar to the current item appear here. **Action required**: Try clicking on one of these.',
    selector: '.current-item-preview .similar-items',
  },
  {
    text: 'You can use these buttons to navigate backwards and forwards like in a web browser. **Action required**: Go back to the previous item.',
    selector: '.item-undo',
  },
  {
    text: "Dragging an item into one of these sections assigns a label. **Action required**: Please drag the current item here now to label it 'yes'. Notice that when you start dragging, the possible drop targets have dashed-red borders.",
    selector: '.labeled-column .label-section.label-yes',
    position: 'left',
  },
  {
    text: "If you are not sure yet whether to label the item 'yes' or 'no', you can postpone your decision by labeling it 'maybe'.",
    selector: '.labeled-column .label-section.label-maybe',
    position: 'left',
  },
  {
    text: "Drag an item to one of these targets to create a new group. **Action required**: Please drag the next current item here to assign it to a new group in the 'maybe' category.",
    selector: '.labeled-column .label-section.label-maybe .new-group',
  },
  {
    text: "The shaking means that the system is thinks this item might belong in the group with a star. **Action required**: Please drag it there now.",
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
  /*
  {
    text: 'This tab shows clusters of similar unlabeled items.',// Please click here now.',
    selector: '.clusters-nav',
  },
  {
    text: "Please scroll to the third cluster.",
    selector: '.cluster-item-list .page',
  },
  {
    text: "Now drag the cluster to the 'no' label.",
    selector: '.cluster-item-list',
  },
  */
  /*
  {
    text: "Now try asking the customer how they'd like an item labeled by dragging it to the 'Ask for a clarification' section.",
    selector: '.instructions',
  },
  */
  {
    text: '**Action required**: Now try editing the instructions (including referring to an example item) and previewing your edits.',
    selector: '.instructions .instructions-editor',
  },
  {
    text: 'Now try creating a test question and creating a reason for it.',
    selector: '.instructions .test-questions',
  },
  {
    text: 'During the real experiment, this button will show the time remaining and optionally let you end the experiment if you are done early. **Action required**: Continue to familiarize yourself with the interface and ask the experimenter if anything is unclear. Click this button when you are ready to begin the real experiment.',
    selector: '.btn-ready',
  },
];
