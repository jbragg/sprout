import { connect } from 'react-redux';
import { editItem } from '../actions';
import DrillDown from '../components/Drilldown';

const mapStateToProps = state => ({
  item: state.entities.items.byId.get(state.currentItemId),
});

const mapDispatchToProps = dispatch => ({
  onEditItem: (itemId, keyValues) => {
    dispatch(editItem(itemId, keyValues));
  },
});

const DrillDownContainer = connect(mapStateToProps, mapDispatchToProps)(DrillDown);

export default DrillDownContainer;
