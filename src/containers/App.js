import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import DrillDownContainer from '../containers/DrillDownContainer';
import LabelSection from '../containers/LabelSection';
import Instructions from '../containers/Instructions';
import SimilarItemList from '../containers/SimilarItemList';
import ClusterItemList from '../containers/ClusterItemList';
import UnreviewedItemList from '../containers/UnreviewedItemList';
import Nav from '../components/Nav';
import CustomDragLayer from '../CustomDragLayer';
import { fetchExperiment } from '../actions';

const propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  experimentState: PropTypes.string,
  initialInstructions: PropTypes.string,
  currentItemId: PropTypes.number,
};

const defaultProps = {
  experimentState: null,
};

class App extends React.Component {
  constructor(props) {
    super(props)
    const { initialize } = this.props;
    const { participantIndex, taskIndex } = this.props.match.params;
    initialize(participantIndex, taskIndex);
  }

  render() {
    const { items, labels, experimentState, initialInstructions, currentItemId } = this.props;
    return (
      experimentState !== 'loaded'
      ? (
        <div className="container">
          <h1>Loading <span className="glyphicon glyphicon-refresh spinning" /></h1>
        </div>
      )
      : (
        <div id="app">
          <div className="hidden">
            {items.map(item => (
              <img src={item.data.path} key={item.id} />
            ))}
          </div>
          <Nav />
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-5">
                <div className="panel-group">
                  <div className="panel panel-default">
                    <div className="panel-heading"><strong>Initial Instructions</strong></div>
                    <div className="panel-body">
                      <p>{initialInstructions}</p>
                    </div>
                  </div>
                  {currentItemId == null ? null : <ClusterItemList />}
                  {currentItemId == null ? null : <SimilarItemList />}
                  {true ? null : <UnreviewedItemList />}
                  {currentItemId == null ? null : <DrillDownContainer />}
                  {currentItemId == null ? null : <CustomDragLayer />}
                </div>
              </div>
              <div className="col-sm-4">
                <div className="panel-group">
                  {labels.map(label => <LabelSection label={label} key={label} />)}
                </div>
              </div>
              <div className="col-sm-3">
                <Instructions />
              </div>
            </div>
          </div>
        </div>
      )
    )
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = state => ({
  labels: state.labels,
  items: [...state.entities.items.byId.values()],
  currentItemId: state.currentItemId,
  experimentState: state.experimentState,
  initialInstructions: state.initialInstructions,
});

const mapDispatchToProps = dispatch => ({
  initialize: (participantIndex, taskIndex) => {
    dispatch(fetchExperiment(participantIndex, taskIndex));
  },
});

export default DragDropContext(HTML5Backend)(connect(mapStateToProps, mapDispatchToProps)(App));
