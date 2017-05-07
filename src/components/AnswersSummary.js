import React from 'react';
import PropTypes from 'prop-types';
import getScore, { defaults as defaultMetrics } from '../score';
import { Panel } from 'react-bootstrap';
import Histogram from './Histogram';

const propTypes = {
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.shape({
        answer: PropTypes.string.isRequired.isRequired,
        uncertainty: PropTypes.string.isRequired,
        uncertainty_input: PropTypes.string.isRequired,
        unclear_type: PropTypes.string.isRequired,
        unclear_reason: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
};

const AnswersSummary = ({ answers, answerKey }) => {
  let answerCounts = new Map([...answerKey.keys()].map(key => [key, 0]));
  // Compute totals.
  answers.forEach(answer => answerCounts.set(answer.data.answer, answerCounts.get(answer.data.answer) + 1));

  // Transform values
  const answerCountsTransform = new Map([...answerCounts].map(([key, count]) => [[getScore(defaultMetrics.color)(key).human, answerKey.get(key)], count]));
  return (
    <Panel>
      <Histogram counts={answerCountsTransform} />
    </Panel>
  );
};

AnswersSummary.propTypes = propTypes;

export default AnswersSummary;
