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
  isDragging: monitor.isDragging(),
});

/*
 * redux
 */

const mapStateToProps = (state, { itemId } ) => ({
  selected: state.currentItemId === itemId,
  item: state.entities.items.byId.get(itemId),
  answers: itemAnswers(state, itemId),
});

const mapDispatchToProps = (dispatch, { itemId }) => ({
  onClick: () => {
    dispatch(setCurrentItem(itemId));
  },
});

const makeItemContainer = x => (
  DragSource(ItemTypes.ITEM, itemSource, collect)(
    connect(mapStateToProps, mapDispatchToProps)(x))
);

const ItemLargeContainer = makeItemContainer(ItemLarge);
const ItemThumbContainer = makeItemContainer(ItemThumb);
const ItemBtnContainer = makeItemContainer(ItemBtn);

export { ItemLargeContainer, ItemThumbContainer, ItemBtnContainer };
