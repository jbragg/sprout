import { suggestionsInterface } from './config';

export default {
  '2': [
    { useAnswers: false, useReasons: false },
    { ...suggestionsInterface, useAnswers: true, useReasons: true },
  ],
  '3': [
    { useAnswers: false, useReasons: false },
    { useAnswers: true, useReasons: false },
    { useAnswers: true, useReasons: true },
  ]
};
