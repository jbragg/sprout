import React from 'react';
import PropTypes from 'prop-types';
import VegaLite from 'react-vega-lite';
import { Row, Col } from 'react-bootstrap';
import WorkersIndicator from './WorkersIndicator';

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
      <Col xs={8}>
        <div style={{ width: '130px', padding: '0 15px' }}>
          <img
            src="/static/PiYG.png"
            height="10"
            width="100%"
          />
        </div>
        <div>
          <VegaLite spec={spec} data={{ values }} />
        </div>
        <div style={{ width: '130px', padding: '0 5px' }}>
          <Row className="no-gutter">
            <Col
              xs={4}
            >
              <div>No</div>
            </Col>
            <Col
              className="text-center"
              xs={4}
            >
              <div>Maybe</div>
            </Col>
            <Col
              className="text-right"
              xs={4}
            >
              <div>Yes</div>
            </Col>
          </Row>
        </div>
      </Col>
      <Col xs={4}>
        <WorkersIndicator workers={values.length} />
      </Col>
    </Row>
  </div>
);

HistogramSummary.propTypes = propTypes;

export default HistogramSummary;
