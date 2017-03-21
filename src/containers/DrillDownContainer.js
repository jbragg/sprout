import { connect } from 'react-redux';
import { assignAndSetCurrentItem, editLabelForm } from '../actions';
import DrillDown from '../components/Drilldown';

const mapStateToProps = state => ({
  labels: state.labels,
  item: state.entities.items.byId.get(state.currentItemId),
  groups: [...state.entities.groups.byId.values()],
  formState: state.drillDownForm,
});

const mapDispatchToProps = dispatch => ({
  onAssignItem: (id, assignment) => {
    dispatch(assignAndSetCurrentItem(id, assignment));
  },
  onEditLabelForm: (keyValues) => {
    dispatch(editLabelForm(keyValues));
  },
});

const DrillDownContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrillDown);

export default DrillDownContainer;
