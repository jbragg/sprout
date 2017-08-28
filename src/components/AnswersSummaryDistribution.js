import React from 'react';
import PropTypes from 'prop-types';
import { OrderedMap } from 'immutable';
import classNames from 'classnames';
import getScore, { defaults as defaultMetrics } from '../score';
import { getColor } from '../color';
import { resolveAnswerKey } from '../actions';

const propTypes = {
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      answer: PropTypes.number,
      instructions_answer: PropTypes.string,
    }).isRequired,
  ).isRequired,
  includeInstructionsAnswer: PropTypes.bool,
  className: PropTypes.string,
};

const defaultProps = {
  includeInstructionsAnswer: false,
  className: null,
};

const AnswersSummaryDistribution = ({ answers, includeInstructionsAnswer, className }) => {
  const score = answerVal => getScore(defaultMetrics.color)(answerVal).color;
  const color = s => getColor(defaultMetrics.color)(s);
  const transformedAnswers = answers
    .filter(answer => (
      answer.data.answer != null
      || (includeInstructionsAnswer && answer.data.instructions_answer)
    ))
    .map(answer => ({
      ...answer,
      data: {
        ...answer.data,
        instructions_answer: resolveAnswerKey[answer.data.instructions_answer] || null,
      },
    }));
  const scores = new OrderedMap(
    transformedAnswers.map(answer => ([
      answer.assignmentid,
      score(answer.data.answer != null ? answer.data.answer : answer.data.instructions_answer),
    ])),
  ).sortBy(v => v);
  const colors = scores.map(color);
  return (
    <span
      className={classNames(
        'answers-summary-distribution',
        className,
      )}
    >
      {[...colors.map((c, id) => (
        <span
          key={id}
          className="unit"
          style={{
            backgroundColor: c,
            width: `${100 / colors.size}%`,
          }}
        >
          &nbsp;
        </span>
      )).values()]}
    </span>
  );
};

AnswersSummaryDistribution.propTypes = propTypes;
AnswersSummaryDistribution.defaultProps = defaultProps;

export default AnswersSummaryDistribution;
