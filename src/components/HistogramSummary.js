import React from 'react';
import PropTypes from 'prop-types';
import VegaLite from 'react-vega-lite';
import { Row, Col } from 'react-bootstrap';

const propTypes = {
  values: PropTypes.arrayOf(
    PropTypes.shape({
      answer: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
};

const spec = {
  mark: 'circle',
  width: 100,
  encoding: {
    x: {
      aggregate: 'average',
      field: 'answer',
      type: 'quantitative',
      scale: { domain: [-1, 1] },
      axis: { title: false },
    },
  },
};

const HistogramSummary = ({ values }) => (
  <div>
    <Row className="no-gutter">
      <Col sm={8}>
        <div>
          <VegaLite spec={spec} data={{ values }} />
        </div>
      </Col>
      <Col sm={4}>
        <span className="glyphicon glyphicon-triangle-bottom" />
        <span className="pull-right">
          {values.length}
          {' '}
          <span className="glyphicon glyphicon-user" />
        </span>
      </Col>
    </Row>
  </div>
);

HistogramSummary.propTypes = propTypes;

export default HistogramSummary;
