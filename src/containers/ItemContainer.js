import React from 'react';
import { connect } from 'react-redux';
import { DragSource } from 'react-dnd';
import ItemLarge from '../components/ItemLarge';
import ItemThumb from '../components/ItemThumb';
import ItemBtn from '../components/ItemBtn';
import { setCurrentItem, setLightbox } from '../actions';
import { DragItemTypes as ItemTypes } from '../constants';
import conditions from '../experiment';
import getScore, { defaults as defaultMetrics } from '../score';
import { getColor, getContrastColor } from '../color';
import {
  itemDataSelector, itemsSelector, itemAnswersSelector,
  recommendedGroupSelector, itemSimilaritiesSelector,
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

const mapStateToProps = (state, { itemId, useReasons, useAnswers, metric }) => {
  const useAnswersVal = useAnswers == null
    ? conditions[state.config.systemVersion].useAnswers
    : useAnswers;
  const metricVal = metric != null ? defaultMetrics.color : metric;
  const answers = itemAnswersSelector(state).get(itemId);
  const scores = answers.length > 0
    ? getScore(metricVal)(...answers.map(answer => answer.data.answer))
    : null;
  const backgroundColor = scores != null && useAnswersVal
    ? getColor(metricVal)(scores.color)
    : null;
  const textColor = scores != null && useAnswersVal
    ? getContrastColor(backgroundColor)
    : null;
  return {
    selected: state.currentItem.currentItemId === itemId,
    item: itemDataSelector(state).byId.get(itemId),
    isLabeled: (
      itemsSelector(state).byId.get(itemId).group != null
      || itemsSelector(state).byId.get(itemId).label != null
    ),
    answers,
    backgroundColor,
    textColor,
    useReasons: useReasons == null ? conditions[state.config.systemVersion].useReasons : useReasons,
    useAnswers: useAnswersVal,
    answerKey: state.config.answerKey,
    recommendedGroup: recommendedGroupSelector(state),
    lightboxOpen: state.lightboxId === itemId,
    itemSimilarities: itemSimilaritiesSelector(state).get(itemId),
    similarItems: !state.config.similarNav,
  };
};

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
