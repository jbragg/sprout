import { connect } from 'react-redux';
import { DragSource } from 'react-dnd';
import ItemLarge from '../components/ItemLarge';
import ItemThumb from '../components/ItemThumb';
import ItemBtn from '../components/ItemBtn';
import { setCurrentItem } from '../actions';
import { itemAnswers } from '../reducers';
import { ItemTypes } from '../dragConstants';

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
  answers: itemAnswers(state, itemId),
  metric: state.colorUnreviewedBy,
});

const mapDispatchToProps = (dispatch, { itemId }) => ({
  onClick: () => {
    dispatch(setCurrentItem(itemId));
  },
});

const connectItem = x => (
  connect(mapStateToProps, mapDispatchToProps)(x)
);

const makeItemDraggable = x => (
  DragSource(ItemTypes.ITEM, itemSource, collect)(x)
);

const ItemThumbContainer = connectItem(ItemThumb);
const ItemLargeDraggableContainer = makeItemDraggable(connectItem(ItemLarge));
const ItemBtnDraggableContainer = makeItemDraggable(connectItem(ItemBtn));


export {
  ItemThumbContainer,
  ItemLargeDraggableContainer,
  ItemBtnDraggableContainer,
};
