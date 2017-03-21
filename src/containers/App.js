import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DrillDownContainer from '../containers/DrillDownContainer';
import SectionItemList from '../containers/SectionItemList';
import LabelSection from '../containers/LabelSection';
import Instructions from '../containers/Instructions';

const propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  experimentState: PropTypes.string.isRequired,
  initialInstructions: PropTypes.string,
  currentItemId: PropTypes.number,
};

const App = ({ labels, experimentState, initialInstructions, currentItemId }) => (
  experimentState !== 'loaded' ? <span>Loading...</span> :
  <div id="app">
    <div className="row">
      <div className="col-sm-12">
        <div className="panel panel-default">
          <div className="panel-heading"><strong>Initial Instructions</strong></div>
          <div className="panel-body">
            <p>{initialInstructions}</p>
          </div>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-sm-6">
        <div className="panel panel-default">
          <div className="panel-heading"><strong>unreviewed</strong></div>
          <div className="panel-body">
            <SectionItemList />
          </div>
        </div>
        {currentItemId == null ? null : <DrillDownContainer />}
      </div>
      <div className="col-sm-6">
        {labels.map(label => <LabelSection label={label} key={label} />)}
      </div>
    </div>
    <div className="row">
      <div className="col-sm-12">
        <Instructions />
      </div>
    </div>
  </div>
);

App.propTypes = propTypes;

const mapStateToProps = state => ({
  labels: state.labels,
  currentItemId: state.currentItemId,
  experimentState: state.experimentState,
  initialInstructions: state.initialInstructions,
});

export default connect(mapStateToProps)(App);
