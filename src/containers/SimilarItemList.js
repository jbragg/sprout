import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Panel } from 'react-bootstrap';
import Slider from 'react-slick';
import { ItemThumbContainer } from '../containers/ItemContainer';

const propTypes = {
  primaryItemId: PropTypes.number.isRequired,
  similarItemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  similar: PropTypes.bool,
};

const defaultProps = {
  similar: true,
};

const sliderSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 2,
  swipe: false,
};

const SimilarItemList = ({ primaryItemId, similarItemIds, similar }) => (
  <Panel>
    <Row>
      <Col sm={5}>
        <div>
          <strong>Next</strong>
        </div>
        <div className="btn-group">
          <ItemThumbContainer draggable itemId={primaryItemId} />
        </div>
      </Col>
      {!similar ? null : (
        <Col sm={7}>
          <div>
            <strong>Similar</strong>
          </div>
          <Slider {...sliderSettings}>
            {similarItemIds.length > 0
            ? similarItemIds.map(id => (
              <div key={id}>
                <ItemThumbContainer draggable itemId={id} />
              </div>
            ))
            : <div />
          }
          </Slider>
        </Col>
      )}
    </Row>
  </Panel>
);

SimilarItemList.propTypes = propTypes;
SimilarItemList.defaultProps = defaultProps;

const mapStateToProps = state => ({
  primaryItemId: state.primaryItemId,
  similarItemIds: state.similarItemIds,
});

export default connect(mapStateToProps)(SimilarItemList);
