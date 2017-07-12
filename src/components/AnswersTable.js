import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Tooltip, OverlayTrigger } from 'react-bootstrap';
import getScore, { defaults as defaultMetrics } from '../score';

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
  useReasons: PropTypes.bool,
};

const defaultProps = ({
  useReasons: true,
});

const AnswersTable = ({ answers, useReasons }) => (
  <Panel>
    <table className="table table-condensed">
      <thead>
        <tr>
          <td />
          <td>Answer</td>
          {useReasons ? <td>Reason</td> : null}
        </tr>
      </thead>
      <tbody>
        {answers
        .sort((a, b) => a.data.answer - b.data.answer)
        .map(answer => (
          <tr key={answer.assignmentid}>
            <td><span className="glyphicon glyphicon-user" /></td>
            <td>
              <OverlayTrigger
                overlay={<Tooltip id="tooltip">{answer.data.answerString}</Tooltip>}
                placement="bottom"
              >
                <div>
                  <span>{getScore(defaultMetrics.color)(answer.data.answer).human}</span>
                </div>
              </OverlayTrigger>
            </td>
            {useReasons && (
              <td>
                {`${answer.data.unclear_type ? answer.data.unclear_type + ' | ' : ''}${answer.data.unclear_reason || ''}`}
              </td>
            )}
          </tr>
        ))
      }
      </tbody>
    </table>
  </Panel>
);

AnswersTable.propTypes = propTypes;
AnswersTable.defaultProps = defaultProps;

export default AnswersTable;
