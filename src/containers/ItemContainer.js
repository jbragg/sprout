import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DragSource } from 'react-dnd';
import ItemLarge from './ItemLarge';
import ItemThumb from '../components/ItemThumb';
import ItemBtn from '../components/ItemBtn';
import { setCurrentItem, setLightbox } from '../actions';
import { DragItemTypes as ItemTypes } from '../constants';
import getScore, { defaults as defaultMetrics } from '../score';
import { getColor, getContrastColor } from '../color';
import {
  itemDataSelector, itemsSelector, itemAnswersSelector,
} from '../reducers/index';
import { currentItemIdSelector } from '../reducers/currentItem';

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
    ? state.config.useAnswers
    : useAnswers;
  const metricVal = metric == null ? defaultMetrics.color : metric;
  const allAnswers = itemAnswersSelector(state).get(itemId);
  const answers = allAnswers.filter(answer => answer.data.answer != null);
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
    selected: currentItemIdSelector(state) === itemId,
    item: itemDataSelector(state).byId.get(itemId),
    isLabeled: (
      itemsSelector(state).byId.get(itemId).group != null
      || itemsSelector(state).byId.get(itemId).label != null
    ),
    answers: allAnswers,
    backgroundColor,
    textColor,
    useReasons: useReasons == null ? state.config.useReasons : useReasons,
    useAnswers: useAnswersVal,
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
  const OptionallyDraggableComponent = ({ draggable, ...props }) => (draggable
    ? <DraggableComponent draggable {...props} />
    : <Component draggable={false} {...props} />
  );
  OptionallyDraggableComponent.propTypes = { draggable: PropTypes.bool };
  OptionallyDraggableComponent.defaultProps = { draggable: false };
  return OptionallyDraggableComponent;
};

const ItemThumbContainer = connectOptionallyDraggable(ItemThumb);
const ItemLargeContainer = connectOptionallyDraggable(ItemLarge);
const ItemBtnContainer = connectOptionallyDraggable(ItemBtn);


export {
  ItemThumbContainer,
  ItemLargeContainer,
  ItemBtnContainer,
};
