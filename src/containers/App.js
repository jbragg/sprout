import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import DrillDownContainer from '../containers/DrillDownContainer';
import LabelSection from '../containers/LabelSection';
import Instructions from '../containers/Instructions';
import SimilarItemList from '../containers/SimilarItemList';
import Nav from '../components/Nav';
import CustomDragLayer from '../CustomDragLayer';

const propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  experimentState: PropTypes.string.isRequired,
  initialInstructions: PropTypes.string,
  currentItemId: PropTypes.number,
};

const App = ({ items, labels, experimentState, initialInstructions, currentItemId }) => (
  experimentState !== 'loaded' ? <span>Loading...</span> :
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
            {currentItemId == null ? null : <DrillDownContainer />}
            {currentItemId == null ? null : <CustomDragLayer />}
            {currentItemId == null ? null : <SimilarItemList />}
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
);

App.propTypes = propTypes;

const mapStateToProps = state => ({
  labels: state.labels,
  items: [...state.entities.items.byId.values()],
  currentItemId: state.currentItemId,
  experimentState: state.experimentState,
  initialInstructions: state.initialInstructions,
});

export default DragDropContext(HTML5Backend)(connect(mapStateToProps)(App));
