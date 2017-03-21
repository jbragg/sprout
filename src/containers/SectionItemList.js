import { connect } from 'react-redux';
import ItemList from '../components/ItemList';

const mapStateToProps = (state, { label, group }) => ({
  itemIds: [...state.entities.items.byId.values()].filter(item => (
    group != null ? item.group === group : item.group == null && item.label === label)).map(item => item.id),
});

const SectionItemList = connect(mapStateToProps)(ItemList);

export default SectionItemList;
