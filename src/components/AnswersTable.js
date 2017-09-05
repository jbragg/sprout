import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Tooltip, OverlayTrigger, Glyphicon } from 'react-bootstrap';
import getScore, { defaults as defaultMetrics } from '../score';

const propTypes = {
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.shape({
        answer: PropTypes.number,
        uncertainty: PropTypes.string,
        uncertainty_input: PropTypes.string,
        unclear_type: PropTypes.string,
        unclear_reason: PropTypes.string,
        test: PropTypes.string,
      }).isRequired,
    }),
  ).isRequired,
  useReasons: PropTypes.bool,
  overlay: PropTypes.bool,
};

const defaultProps = ({
  useReasons: true,
  overlay: true,
});

const AnswersTable = ({ answers, useReasons, overlay }) => {
  const relevantAnswers = answers.filter(a => a.data.answer != null);
  const instructionsCounts = List(answers)
    .filter(answer => answer.data.instructions)
    .countBy(answer => answer.data.instructions)
    .sortBy(count => -1 * count);
  if (relevantAnswers.length === 0 && instructionsCounts.size === 0) {
    return <div className="text-center">No answers to show</div>;
  }
  return (
    <table className="answers-table table table-condensed">
      <thead>
        <tr>
          <th />
          <th className="text-center">Answer</th>
          {useReasons ? <th>Reason</th> : <th />}
        </tr>
      </thead>
      <tbody>
        {[...instructionsCounts.entries()].map(([instruction, count]) => (
          <tr key={instruction}>
            <td style={{ whiteSpace: 'nowrap' }}>
              <Glyphicon glyph="user" />
              {count > 1 && <span>&times;{count}</span>}
            </td>
            <td className="text-center">?</td>
            <td>{instruction}</td>
          </tr>
        ))}
        {relevantAnswers
          .filter(a => !a.data.instructions)
          .sort((a, b) => a.data.answer - b.data.answer)
          .map(answer => (
            <tr key={answer.assignmentid}>
              <td><span className="glyphicon glyphicon-user" /></td>
              <td className="text-center">
                {!overlay
                  ? <span>{answer.data.answerString.toLowerCase() || ''}</span>
                  : (
                    <OverlayTrigger
                      overlay={<Tooltip id="tooltip">{answer.data.answerString}</Tooltip>}
                      placement="bottom"
                    >
                      <div>
                        <span>{getScore(defaultMetrics.color)(answer.data.answer).human}</span>
                      </div>
                    </OverlayTrigger>
                  )
                }
              </td>
              {useReasons
                ? (
                  <td>
                    {`${answer.data.unclear_type ? `${answer.data.unclear_type} | ` : ''}${answer.data.unclear_reason || answer.data.test || ''}`}
                  </td>
                )
                : <td />
              }
            </tr>
          ))
        }
      </tbody>
    </table>
  );
};

AnswersTable.propTypes = propTypes;
AnswersTable.defaultProps = defaultProps;

export default AnswersTable;
