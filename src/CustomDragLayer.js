import React from 'react';
import PropTypes from 'prop-types';
import { DragLayer } from 'react-dnd';
import { DragItemTypes as ItemTypes } from './constants';
import { ItemThumbContainer } from './containers/ItemContainer';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(props) {
  const { clientOffset } = props;
  if (!clientOffset) {
    return {
      display: 'none',
    };
  }

  let { x, y } = clientOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

class CustomDragLayer extends React.Component {

  renderItem(type, item) {
    switch (type) {
      case ItemTypes.ITEM:
        return (<ItemThumbContainer itemId={item.id} />);
      default:
        return null;
    }
  }

  render() {
    const { item, itemType, isDragging } = this.props;

    if (!isDragging) {
      return null;
    }

    return (
      <div style={layerStyles}>
        <div style={getItemStyles(this.props)}>
          {this.renderItem(itemType, item)}
        </div>
      </div>
    );
  }
}

const dragLayerCollect = monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  clientOffset: monitor.getClientOffset(),
  isDragging: monitor.isDragging(),
});

export default DragLayer(dragLayerCollect)(CustomDragLayer);
