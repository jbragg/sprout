import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table, OverlayTrigger, Popover } from 'react-bootstrap';
import WorkersIndicator from './WorkersIndicator';

const propTypes = {
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.shape({
        answer: PropTypes.number.isRequired,
        unclear_type: PropTypes.string,
        unclear_reason: PropTypes.string,
      }).isRequired,
    }),
  ).isRequired,
};

const confusionsToTable = (confusions, icon = true, head = true) => (
  <Table condensed >
    {head && (
      <thead>
        <tr>
          {icon && <th />}
          <th />
        </tr>
      </thead>
    )}
    <tbody>
      {confusions.map(([id, type, reason]) => (
        <tr key={id}>
          {icon && <td><span className="glyphicon glyphicon-user" /></td>}
          <td>{type ? `${type} | ${reason}` : reason}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);

const ConfusionsTable = ({ answers }) => {
  const confusions = answers
    .filter(answer => answer.data.unclear_type || answer.data.unclear_reason)
    .map(answer => [answer.assignmentid, answer.data.unclear_type, answer.data.unclear_reason]);
  let component = null;
  if (confusions.length === 0) {
    component = <div className="text-center">No worker confusions to show</div>;
  } else if (confusions.length === 1) {
    component = confusionsToTable(confusions);
  } else {
    component = (
      <OverlayTrigger
        overlay={
          <Popover id="popover">
            {confusionsToTable(confusions.slice(1), true, false)}
          </Popover>
        }
        placement="bottom"
      >
        <Row className="no-gutter">
          <Col xs={8}>
            {confusionsToTable(confusions.slice(0, 1))}
          </Col>
          <Col xs={4}>
            <WorkersIndicator workers={confusions.length} />
          </Col>
        </Row>
      </OverlayTrigger>
    );
  }
  return <div className="confusions-summary">{component}</div>;
};

ConfusionsTable.propTypes = propTypes;

export default ConfusionsTable;
