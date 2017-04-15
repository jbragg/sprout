import { connect } from 'react-redux';
import { editLabelForm } from '../actions';
import DrillDown from '../components/Drilldown';

const mapStateToProps = state => ({
  item: state.entities.items.byId.get(state.currentItemId),
});

const DrillDownContainer = connect(mapStateToProps)(DrillDown);

export default DrillDownContainer;
