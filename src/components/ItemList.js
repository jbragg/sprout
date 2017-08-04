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
  itemInFocus: PropTypes.number,
  draggable: PropTypes.bool,
};

const defaultProps = {
  onClick: null,
  thumbnails: false,
  dots: true,
  itemInFocus: null,
  draggable: true,
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

const getArray = sequence => (Array.isArray(sequence)
  ? sequence
  : [...sequence.keys()]
);

class ItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slide: 0,
      slidesToShow: 1,
    };
    this.goToItem = this.goToItem.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.itemInFocus !== this.props.itemInFocus
      && nextProps.itemInFocus != null
    ) {
      this.goToItem(nextProps.itemInFocus);
    }
  }

  goToItem(id) {
    const itemIds = getArray(this.props.itemIds);
    const nextId = itemIds.indexOf(id);
    if (nextId >= 0) {
      this.slider.slickGoTo(nextId);
    }
  }

  render() {
    const { onClick, thumbnails, dots, draggable } = this.props;
    const itemIds = getArray(this.props.itemIds);
    return (
      <div className="form-group itemlist">
        {thumbnails
            ? (itemIds.length > 0 && (
              <Slider
                ref={(c) => { this.slider = c; }}
                {...sliderSettings}
                dots={dots}
                beforeChange={(cur, next) => {
                  setTimeout(
                    () => {
                      this.setState({ slidesToShow: Math.abs(cur - next) });
                    },
                    5000,
                  );
                }}
                afterChange={(next) => {
                  /**
                   * TODO: Move to beforeChange and remove setTimeout if
                   * transition bug is fixed:
                   * https://github.com/akiran/react-slick/issues/136
                   */
                  this.setState({ slide: next });
                }}
              >
                {itemIds.map(id => (
                  <div key={id}>
                    <ItemThumbContainer draggable={draggable} itemId={id} />
                  </div>
                ))}
              </Slider>
            ))
            : itemIds.map(itemId => (
              <ItemBtnContainer
                draggable={draggable}
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
