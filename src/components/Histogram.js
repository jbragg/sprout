import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Tooltip, OverlayTrigger, ProgressBar } from 'react-bootstrap';

const propTypes = {
  counts: PropTypes.objectOf(PropTypes.number.isRequired).isRequired,
};

const Histogram = ({ counts }) => {
  const totalCount = [...counts.values()].reduce((acc, val) => acc + val, 0);
  const average = [...counts].reduce((acc, [[val], count]) => acc + (val * count), 0) / totalCount;
  return (
    <div>
      <p>{`Average answer: ${average.toFixed(2)} (${totalCount} workers)`}</p>
      <div className="histogram">
        {[...counts].map(([[value, name], count]) => (
          <Row className="no-gutter" key={value}>
            <Col className="text-right" xs={2}>
              <OverlayTrigger
                overlay={<Tooltip id="tooltip">{name}</Tooltip>}
                placement="bottom"
              >
                <span>{value}</span>
              </OverlayTrigger>
            </Col>
            <Col xs={7}>
              <ProgressBar label={count} now={count} max={totalCount} />
            </Col>
            <Col xs={3}>
              <span>{`${((count / totalCount) * 100).toFixed(0)}%`}</span>
            </Col>
          </Row>
    ))}
      </div>
    </div>
  );
};

Histogram.propTypes = propTypes;

export default Histogram;
