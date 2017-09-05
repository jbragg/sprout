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
  WELCOME: 'welcome',
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
        "It's been a few minutes. Remember your goal is to improve the instructions and include at least 4 test questions (2 'yes' and 2 'no').", // You should **ask for clarifications**, **edit the instructions**, and **create test questions**.",
      ],
      [
        12 * 60 * 1000,
        "You have only a few minutes remaining. You should have edited the instructions by now and added some of the 4 minimum test questions (2 'yes' and 2 'no').", // Remember to **ask for clarifications**, **edit the instructions**, and **create test questions**.',
      ],
    ],
  },
};

export const tutorialSteps = {
  structuredLabeling: [
    {
      text: 'Your goal is to write instructions for crowd workers so they will label new items according to *your* understanding of this concept.',
      selector: '.instructions-editor',
    },
    {
      text: "It is important that you include questions that test whether workers understand your instructions. Items you drag here will be used as test questions. You should include a minimum of 4 test questions (2 'yes' and 2 'no').",
      selector: '.instructions .test-questions',
    },
    {
      text: 'All the items are here, in no particular order. **Action required before next red dot**: Click on a thumbnail now.',
      selector: '.items-nav',
    },
    {
      text: "Dragging an item into one of these sections assigns a label (yes / maybe / no). **Action required before next red dot**: Drag the current item to the 'yes' category. Notice that when you start dragging, the possible drop targets have dashed-red borders.",
      selector: '.labeled-column',
      position: 'left',
    },
    {
      text: 'The current item has automatically advanced to the next one. **Action required before next red dot**: Try zooming into the item now by clicking here and scrolling the mouse (or using the magnification buttons).',
      selector: '.item-large .item',
      position: 'right',
    },
    /*
    {
      text: 'You can use these buttons to navigate backwards and forwards like in a web browser. **Action required**: Go back to the previous item.',
      selector: '.item-undo',
    },
    */
    {
      text: "Drag an item to one of these targets to create a new group. **Action required before next red dot**: Drag an item here to assign it to a new group in the 'maybe' category.",
      selector: '.labeled-column .label-section.label-maybe .new-group',
    },
    {
      text: 'This bar shows your progress towards labeling all items (the number shows how many you have labeled). But your goal is to improve the instructions, not label all items.',
      selector: '.labeling-progress',
    },
    {
      text: '**Action required before next red dot**: Now edit the instructions, refer to an example item, and preview your edits.',
      selector: '.instructions .instructions-editor',
    },
    {
      text: '**Action required before next red dot**: Drag a labeled item here that tests your instructions and click on it to explain your label to workers.',
      selector: '.instructions .test-questions',
    },
    {
      text: 'During the real experiment, this button will show the time remaining and optionally let you end the experiment if you are done early. **Action required**: Continue to improve the instructions and ask the experimenter if anything is unclear. Click this button when you are ready to use this interface with a real task.',
      selector: '.btn-ready',
    },
  ],
  suggestions: [
    {
      text: 'Your goal is to write instructions for crowd workers so they will label new items according to *your* understanding of this concept.',
      selector: '.instructions-editor',
    },
    {
      text: "It is important that you include questions that test whether workers understand your instructions. Items you drag here will be used as test questions. You should include a minimum of 4 test questions (2 'yes' and 2 'no').",
      selector: '.instructions .test-questions',
    },
    {
      text: 'All the items are here, organized into categories that were confusing to workers. **Action required before next red dot**: Click on an item button in one of the categories.',
      selector: '#left',
    },
    {
      text: 'This bar shows how many of the confusion categories you have expanded.',
      selector: '.labeling-progress',
    },
    {
      text: "These are what workers think the answer should be. '?' means the worker thinks the instructions should be clarified.",
      selector: '.item-large .answers-table',
      position: 'top',
    },
    {
      text: 'If you make this item a test question, you should enter your answer and explanation here.',
      selector: '.item-large .edit-reason',
      position: 'top',
    },
    {
      text: 'Items that may be similar to the current item appear here.',
      selector: '.current-item-preview .similar-items',
    },
    {
      text: 'This shows the number of items in the category.',
      selector: '.class-container .badge',
    },
    {
      text: "This shows the distribution of worker answers across all items in the category. Each rectangle is an answer. Green is 'yes', white is '?', and pink is 'no'.",
      selector: '.answers-summary-distribution',
    },
    {
      text: 'Notice also that the color of an item is the average color of its answers.',
      selector: '.class-container',
    },
    {
      text: '**Action required before next red dot**: Now edit the instructions, refer to an example item, and preview your edits.',
      selector: '.instructions .instructions-editor',
    },
    {
      text: 'You can drag any item here, including the recommended test questions (above). **Action required before next red dot**: Drag a recommended test question here and explain your label to workers using the item preview (click on the item to open).',
      selector: '.instructions .test-questions',
    },
    {
      text: 'During the real experiment, this button will show the time remaining and optionally let you end the experiment if you are done early. **Action required**: Continue to improve the instructions and ask the experimenter if anything is unclear. Click this button when you are ready to use this interface with a real task.',
      selector: '.btn-ready',
    },
  ],
};
