import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Slider from 'react-slick';
import { ProgressBar } from 'react-bootstrap';
import {
  ItemBtnContainer, ItemThumbContainer,
} from '../containers/ItemContainer';
import { defaults } from '../constants';

const propTypes = {
  itemIds: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number.isRequired),
    ImmutablePropTypes.orderedSetOf(PropTypes.number.isRequired),
    ImmutablePropTypes.orderedMapOf(PropTypes.number.isRequired),
  ]).isRequired,
  onClick: PropTypes.func,
  thumbnails: PropTypes.bool,
  dots: PropTypes.bool,
};

const defaultProps = {
  onClick: null,
  thumbnails: false,
  dots: false,
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

class ItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { slide: 0, slidesToShow: 1 };
    this.handleSlideChange = this.handleSlideChange.bind(this);
  }

  handleSlideChange(cur, next) {
    this.setState({ slide: next, slidesToShow: Math.abs(next - cur) });
  }

  render() {
    const { onClick, thumbnails, dots } = this.props;
    const itemIds = (Array.isArray(this.props.itemIds)
      ? this.props.itemIds
      : [...this.props.itemIds.keys()]
    );
    return (
      <div className="form-group itemlist">
        {thumbnails
            ? (itemIds.length > 0 && (
              <Slider
                {...sliderSettings}
                dots={dots}
                beforeChange={this.handleSlideChange}
              >
                {itemIds.map(id => (
                  <div key={id}>
                    <ItemThumbContainer draggable itemId={id} />
                  </div>
                ))}
              </Slider>
            ))
            : itemIds.map(itemId => (
              <ItemBtnContainer
                draggable
                itemId={itemId}
                key={itemId}
                onClick={onClick}
              />
            ))
        }
        {thumbnails && !dots && itemIds.length > 0 && (
          <ProgressBar
            now={this.state.slide}
            max={(itemIds.length - 1) - ((itemIds.length - 1) % this.state.slidesToShow)}
          />
        )}
      </div>
    );
  }
}

ItemList.propTypes = propTypes;
ItemList.defaultProps = defaultProps;

export default ItemList;
