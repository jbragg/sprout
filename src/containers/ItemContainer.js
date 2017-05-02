import React from 'react';
import { connect } from 'react-redux';
import { DragSource } from 'react-dnd';
import ItemLarge from '../components/ItemLarge';
import ItemThumb from '../components/ItemThumb';
import ItemBtn from '../components/ItemBtn';
import { setCurrentItem } from '../actions';
import { DragItemTypes as ItemTypes } from '../constants';
import conditions from '../experiment';

/*
 * react-dnd
 */

const itemSource = {
  beginDrag: props => ({ id: props.itemId }),
};

const collect = (dndConnect, monitor) => ({
  connectDragSource: dndConnect.dragSource(),
  connectDragPreview: dndConnect.dragPreview(),
  isDragging: monitor.isDragging(),
});

/*
 * redux
 */

const mapStateToProps = (state, { itemId } ) => ({
  selected: state.currentItemId === itemId,
  item: state.entities.items.byId.get(itemId),
  answers: state.entities.items.byId.get(itemId).answers.map(id => state.entities.answers.byId.get(id)),
  useReasons: conditions[state.systemVersion].useReasons,
  useAnswers: conditions[state.systemVersion].useAnswers,
});

const mapDispatchToProps = (dispatch, { itemId }) => ({
  onClick: () => {
    dispatch(setCurrentItem(itemId));
  },
});

const connectOptionallyDraggable = x => {
  const Component = connect(mapStateToProps, mapDispatchToProps)(x);
  const DraggableComponent = DragSource(ItemTypes.ITEM, itemSource, collect)(Component);
  return ({ draggable, ...props}) => draggable ? <DraggableComponent {...props} /> : <Component {...props} />;
};

const ItemThumbContainer = connectOptionallyDraggable(ItemThumb);
const ItemLargeContainer = connectOptionallyDraggable(ItemLarge);
const ItemBtnContainer = connectOptionallyDraggable(ItemBtn);


export {
  ItemThumbContainer,
  ItemLargeContainer,
  ItemBtnContainer,
};
