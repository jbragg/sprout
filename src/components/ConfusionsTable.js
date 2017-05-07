import React from 'react';
import PropTypes from 'prop-types';
import { Table, Panel } from 'react-bootstrap';

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

const ConfusionsTable = ({ answers }) => {
  const confusions = answers
    .filter(answer => answer.data.unclear_type || answer.data.unclear_reason)
    .map(answer => [answer.data.unclear_type, answer.data.unclear_reason]);
  if (confusions.length === 0) { return null; }
  return (
    <Panel>
      <div><strong>Worker confusions</strong></div>
      <Table condensed >
        <tbody>
          {confusions
            .map(([type, reason], index) => (
              <tr key={index}>
                <td><span className="glyphicon glyphicon-user" /></td>
                <td>{type}</td>
                <td>{reason}</td>
              </tr>
            ))
          }
        </tbody>
      </Table>
    </Panel>
  );
};

ConfusionsTable.propTypes = propTypes;

export default ConfusionsTable;
