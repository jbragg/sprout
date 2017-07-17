import {
  QUEUE_ITEM_ORACLE, UNQUEUE_ITEM_ORACLE, ANSWER_ORACLE,
} from '../actions';

const defaultState = {
  queuedItems: [],
  answerInterval: 30 * 1000,  // seconds to milliseconds
  answeredItems: [],
};

const oracle = (state = defaultState, action) => {
  switch (action.type) {
    case QUEUE_ITEM_ORACLE: {
      return {
        ...state,
        queuedItems: [
          ...state.queuedItems,
          {
            queryTime: Date.now(),
            id: action.itemId,
          },
        ],
      };
    }
    case UNQUEUE_ITEM_ORACLE: {
      return {
        ...state,
        queuedItems: state.queuedItems
          .filter(item => item.id !== action.itemId),
      };
    }
    case ANSWER_ORACLE: {
      const nextQueuedItem = state.queuedItems.length > 0
        ? state.queuedItems[0]
        : null;
      const lastAnswerTime = (state.answeredItems.length > 0
        ? state.answeredItems[state.answeredItems.length - 1].answerTime
        : null
      );
      const longEnoughSinceLastAnswer = (
        lastAnswerTime == null
        || Date.now() - lastAnswerTime > state.answerInterval
      );
      const longEnoughSinceQueued = (
        nextQueuedItem != null
        && Date.now() - nextQueuedItem.queryTime > state.answerInterval
      );
      const shouldAnswer = longEnoughSinceQueued && longEnoughSinceLastAnswer;
      return {
        ...state,
        queuedItems: (shouldAnswer
          ? state.queuedItems.slice(1)
          : state.queuedItems
        ),
        answeredItems: shouldAnswer ? [
          ...state.answeredItems,
          {
            ...nextQueuedItem,
            answerTime: Date.now(),
          },
        ]
        : state.answeredItems,
      };
    }
    default: {
      return state;
    }
  }
};

export default oracle;
