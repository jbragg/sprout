import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DrillDownContainer from '../containers/DrillDownContainer';
import SectionItemList from '../containers/SectionItemList';
import LabelSection from '../containers/LabelSection';
import Instructions from '../containers/Instructions';
import { editColorUnreviewed } from '../actions';

const propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  experimentState: PropTypes.string.isRequired,
  initialInstructions: PropTypes.string,
  currentItemId: PropTypes.number,
};

const App = ({ labels, experimentState, initialInstructions, currentItemId, colorUnreviewedBy, onEditColorUnreviewed }) => (
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
            <div className="form-inline form-group">
              <label>Color by:</label>
              {' '}
              <select
                className="form-control"
                value={colorUnreviewedBy}
                onChange={ (e) => {onEditColorUnreviewed(e.target.value);} }
              >
                {['confusion', 'answer'].map(metric => (
                  <option value={metric} key={metric}>{metric}</option>
                ))}
              </select>
            </div>
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
  colorUnreviewedBy: state.colorUnreviewedBy,
});

const mapDispatchToProps = dispatch => ({
  onEditColorUnreviewed: (metric) => {
    dispatch(editColorUnreviewed(metric));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
