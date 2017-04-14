import { connect } from 'react-redux';
import ItemList from '../components/ItemList';
import getScore from '../score';

const scoreItemAnswers = (state, itemId) => (
  getScore(state.colorUnreviewedBy)([...state.entities.answers.byId.values()]
    .filter(answer => (answer.data.questionid === itemId))
    .map(answer => answer.data.answer))
);

const mapStateToProps = (state, { label, group }) => {
  let itemIds;
  if (group != null) {
    itemIds = [...state.entities.groups.byId.get(group).itemIds.values()];
  } else if (label != null) {
    itemIds = [...state.entities.labels.get(label).itemIds.values()];
  } else {
    itemIds = [...state.entities.items.byId.values()]
    .filter(item => (item.group == null && item.label === label))
    .map(item => item.id);
  }
  return {
    itemIds: group != null || label != null
    ? itemIds
    : itemIds.sort((id1, id2) => (
      state.colorUnreviewedBy === 'confusion' ? -1 : 1) *  // Descending order for confusion
      (scoreItemAnswers(state, id1) - scoreItemAnswers(state, id2))),
    metric: state.colorUnreviewedBy,
  };
};

const SectionItemList = connect(mapStateToProps)(ItemList);

export default SectionItemList;
