import { connect } from 'react-redux';
import ItemLarge from '../components/ItemLarge';
import ItemThumb from '../components/ItemThumb';
import ItemBtn from '../components/ItemBtn';
import { setCurrentItem } from '../actions';

const mapStateToProps = (state, { itemId } ) => ({
  currentItemId: state.currentItemId,
  item: state.entities.items.byId.get(itemId),
  answers: [...state.entities.answers.byId.values()].filter(answer => (
    answer.data.questionid === itemId)),
});

const mapDispatchToProps = (dispatch, { itemId }) => ({
  onClick: () => {
    dispatch(setCurrentItem(itemId));
  },
});

const makeItemContainer = x => (
  connect(mapStateToProps, mapDispatchToProps)(x)
);

const ItemLargeContainer = makeItemContainer(ItemLarge);
const ItemThumbContainer = makeItemContainer(ItemThumb);
const ItemBtnContainer = makeItemContainer(ItemBtn);

export { ItemLargeContainer, ItemThumbContainer, ItemBtnContainer };
