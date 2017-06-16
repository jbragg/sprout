import React from 'react';
import { connect } from 'react-redux';
import { DragSource } from 'react-dnd';
import ItemLarge from '../components/ItemLarge';
import ItemThumb from '../components/ItemThumb';
import ItemBtn from '../components/ItemBtn';
import { setCurrentItem, setLightbox } from '../actions';
import { DragItemTypes as ItemTypes } from '../constants';
import conditions from '../experiment';
import {
  itemDataSelector, itemAnswersSelector, recommendedGroupSelector,
} from '../reducers/index';

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

const mapStateToProps = (state, { itemId, useReasons, useAnswers }) => ({
  selected: state.currentItemId === itemId,
  item: itemDataSelector(state).byId.get(itemId),
  answers: itemAnswersSelector(state).get(itemId),
  useReasons: useReasons == null ? conditions[state.systemVersion].useReasons : useReasons,
  useAnswers: useAnswers == null ? conditions[state.systemVersion].useAnswers : useAnswers,
  answerKey: state.answerKey,
  recommendedGroup: recommendedGroupSelector(state),
  lightboxOpen: state.lightboxOpen,
});

const mapDispatchToProps = (dispatch, { onClick }) => ({
  onClick: (onClick != null
    ? onClick
    : (id) => { dispatch(setCurrentItem(id)); }
  ),
  onSetLightbox: (payload) => { dispatch(setLightbox(payload)); },
});

const connectOptionallyDraggable = (x) => {
  const Component = connect(mapStateToProps, mapDispatchToProps)(x);
  const DraggableComponent = DragSource(
    ItemTypes.ITEM,
    itemSource,
    collect,
  )(Component);
  return ({ draggable, ...props }) => (draggable
    ? <DraggableComponent draggable {...props} />
    : <Component draggable={false} {...props} />
  );
};

const ItemThumbContainer = connectOptionallyDraggable(ItemThumb);
const ItemLargeContainer = connectOptionallyDraggable(ItemLarge);
const ItemBtnContainer = connectOptionallyDraggable(ItemBtn);


export {
  ItemThumbContainer,
  ItemLargeContainer,
  ItemBtnContainer,
};
