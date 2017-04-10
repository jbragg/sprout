import { connect } from 'react-redux';
import ItemList from '../components/ItemList';
import getScore from '../score';

const scoreItemAnswers = (state, itemId) => (
  getScore(state.colorUnreviewedBy)([...state.entities.answers.byId.values()]
    .filter(answer => (answer.data.questionid === itemId))
    .map(answer => answer.data.answer))
);

const mapStateToProps = (state, { label, group }) => ({
  itemIds: ([...state.entities.items.byId.values()]
    .filter(item => (
      group != null ? item.group === group : item.group == null && item.label === label))
    .sort((item1, item2) => (
      state.colorUnreviewedBy === 'confusion' ? -1 : 1) *  // Descending order for confusion
      (scoreItemAnswers(state, item1.id) - scoreItemAnswers(state, item2.id)))
    .map(item => item.id)),
  metric: state.colorUnreviewedBy,
});

const SectionItemList = connect(mapStateToProps)(ItemList);

export default SectionItemList;
