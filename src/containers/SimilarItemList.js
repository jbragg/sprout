import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Panel } from 'react-bootstrap';
import Slider from 'react-slick';
import { ItemThumbContainer } from '../containers/ItemContainer';
import Loading from '../components/Loading';
import { defaults } from '../constants';
import { unlabeledItemIdsSelector } from '../reducers/index';

const propTypes = {
  isFinished: PropTypes.bool.isRequired,
  primaryItemId: PropTypes.number,
  similarItemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  similar: PropTypes.bool,
};

const defaultProps = {
  similar: true,
  primaryItemId: null,
};

const sliderSettings = {
  ...defaults.sliderSettings,
  responsive: [
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
      },
    },
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 1600,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 10000,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 4,
      },
    },
  ],
};

const SimilarItemList = ({ primaryItemId, similarItemIds, similar, isFinished }) => {
  let component = null;
  if (isFinished) {
    component = null;
  } else if (primaryItemId == null) {
    component = <p>hi</p>;
  } else {
    component = (
      <Panel>
        <Row className="no-gutter">
          <Col className="next" xs={6} sm={5} md={4} lg={3}>
            <div>
              <strong>Next</strong>
            </div>
            <div className="btn-group">
              <ItemThumbContainer draggable itemId={primaryItemId} />
            </div>
          </Col>
          {similar && (
            <Col className="similar" xs={6} sm={7} md={8} lg={9}>
              <div>
                <strong>Similar</strong>
              </div>
              {similarItemIds.length > 0 && (
                <Slider {...sliderSettings}>
                  {similarItemIds.map(id => (
                    <div key={id}>
                      <ItemThumbContainer draggable itemId={id} />
                    </div>
                  ))}
                </Slider>
              )}
            </Col>
          )}
        </Row>
      </Panel>
    );
  }
  return <div className="similar-item-list">{component}</div>;
};

SimilarItemList.propTypes = propTypes;
SimilarItemList.defaultProps = defaultProps;

const mapStateToProps = state => ({
  isFinished: unlabeledItemIdsSelector(state).length === 0,
  primaryItemId: state.currentItem.primaryItemId,
  similarItemIds: state.currentItem.similarItemIds,
});

export default connect(mapStateToProps)(SimilarItemList);
