import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getEmptyImage } from 'react-dnd-html5-backend';

const propTypes = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  item: PropTypes.shape({
    data: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func,
  isDragging: PropTypes.bool,
  isLabeled: PropTypes.bool,
  textColor: PropTypes.string,
  backgroundColor: PropTypes.string,
};

const defaultProps = ({
  connectDragPreview: x => x,
  connectDragSource: x => x,
  isDragging: false,
  isLabeled: false,
  textColor: null,
  backgroundColor: null,
});

class ItemThumb extends React.Component {
  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }

  render() {
    const {
      item, selected, onClick, connectDragSource, isDragging, isLabeled,
      textColor, backgroundColor,
    } = this.props;
    return connectDragSource(
      <button
        className={classNames(
          'item-thumb btn btn-default',
          { labeled: isLabeled },
        )}
        onClick={(e) => { onClick(item.id); e.preventDefault(); }}
        style={{
          opacity: isDragging ? 0.5 : null,
          border: selected ? '2px solid black' : null,
        }}
      >
        <div
          className="text-center small"
          style={{
            color: textColor,
            backgroundColor,
          }}
        >
          <small>{item.id}</small>
        </div>
        <img
          className="img-responsive"
          src={item.data.path}
        />
      </button>,
    );
  }
}

ItemThumb.propTypes = propTypes;
ItemThumb.defaultProps = defaultProps;

export default ItemThumb;
