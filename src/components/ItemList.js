import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Slider from 'react-slick';
import {
  ItemBtnContainer, ItemThumbContainer,
} from '../containers/ItemContainer';
import { defaults } from '../constants';

const propTypes = {
  itemIds: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number.isRequired),
    ImmutablePropTypes.orderedSetOf(PropTypes.number.isRequired),
  ]).isRequired,
  onClick: PropTypes.func,
  thumbnails: PropTypes.bool,
};

const defaultProps = {
  onClick: null,
  thumbnails: false,
};

const sliderSettings = {
  ...defaults.sliderSettings,
  responsive: [
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 1600,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 4,
      },
    },
    {
      breakpoint: 10000,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 5,
      },
    },
  ],
};

const ItemList = ({ itemIds, onClick, thumbnails }) => (
  <div className="form-group itemlist">
    {thumbnails
        ? (itemIds.length > 0 && (
          <Slider {...sliderSettings}>
            {itemIds.map(id => (
              <div key={id}>
                <ItemThumbContainer draggable itemId={id} />
              </div>
            ))}
          </Slider>
        ))
        : [...itemIds].map(itemId => (
          <ItemBtnContainer
            draggable
            itemId={itemId}
            key={itemId}
            onClick={onClick}
          />
        ))
    }
  </div>
);

ItemList.propTypes = propTypes;
ItemList.defaultProps = defaultProps;

export default ItemList;
