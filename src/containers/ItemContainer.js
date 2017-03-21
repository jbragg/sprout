import { connect } from 'react-redux';
import Item from '../components/Item';
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

const ItemContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Item);

export default ItemContainer;
