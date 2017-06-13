import React from 'react';
import PropTypes from 'prop-types';
import { DragLayer } from 'react-dnd';
import { DragItemTypes as ItemTypes } from './constants';
import { ItemThumbContainer } from './containers/ItemContainer';
import GroupDrag from './components/GroupDrag';

const propTypes = {
  item: PropTypes.object,
  itemType: PropTypes.string,
  isDragging: PropTypes.bool.isRequired,
  clientOffset: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }),
};

const defaultProps = {
  item: null,
  itemType: null,
  clientOffset: null,
};

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(clientOffset) {
  if (!clientOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = clientOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

function renderItem(type, item) {
  switch (type) {
    case ItemTypes.ITEM:
      return (<ItemThumbContainer itemId={item.id} />);
    case ItemTypes.CLUSTER:
      return (<GroupDrag n={item.ids.length} />);
    case ItemTypes.GROUP:
      return (<GroupDrag n={item.itemIds.size} />);
    default:
      return null;
  }
}

const CustomDragLayer = ({ item, itemType, isDragging, clientOffset }) => {
  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(clientOffset)}>
        {renderItem(itemType, item)}
      </div>
    </div>
  );
};

CustomDragLayer.propTypes = propTypes;
CustomDragLayer.defaultProps = defaultProps;

const dragLayerCollect = monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  clientOffset: monitor.getClientOffset(),
  isDragging: monitor.isDragging(),
});

export default DragLayer(dragLayerCollect)(CustomDragLayer);
