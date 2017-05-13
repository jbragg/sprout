import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table, OverlayTrigger, Popover } from 'react-bootstrap';

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

const confusionsToTable = (confusions, icon = true) => (
  <Table condensed >
    <tbody>
      {confusions.map(([type, reason], index) => (
        <tr key={index}>
          {icon ? <td><span className="glyphicon glyphicon-user" /></td> : null}
          <td>{type}</td>
          <td>{reason}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);

const ConfusionsTable = ({ answers }) => {
  const confusions = answers
    .filter(answer => answer.data.unclear_type || answer.data.unclear_reason)
    .map(answer => [answer.data.unclear_type, answer.data.unclear_reason]);
  if (confusions.length === 0) { return null; }
  return (
    <div>
      {confusions.length === 1
          ? confusionsToTable(confusions)
          : (
            <OverlayTrigger
              overlay={
                <Popover id="popover" title="Additional confusions">
                  {confusionsToTable(confusions.slice(1))}
                </Popover>
            }
              placement="bottom"
            >
              <Row className="no-gutter">
                <Col xs={8}>
                  {confusionsToTable(confusions.slice(0, 1), false)}
                </Col>
                <Col xs={4}>
                  <span className="glyphicon glyphicon-triangle-bottom" />
                  <span className="pull-right">
                    {confusions.length}
                    {' '}
                    <span className="glyphicon glyphicon-user" />
                  </span>
                </Col>
              </Row>
            </OverlayTrigger>
          )
      }
    </div>
  );
};

ConfusionsTable.propTypes = propTypes;

export default ConfusionsTable;
