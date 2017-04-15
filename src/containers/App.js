import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import DrillDownContainer from '../containers/DrillDownContainer';
import SectionItemList from '../containers/SectionItemList';
import LabelSection from '../containers/LabelSection';
import Instructions from '../containers/Instructions';
import SimilarItemList from '../containers/SimilarItemList';
import { editColorUnreviewed } from '../actions';

const propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  experimentState: PropTypes.string.isRequired,
  initialInstructions: PropTypes.string,
  currentItemId: PropTypes.number,
};

const colorByHelp = (
  <div>
    <p>All values are scaled to the [0, 1] interval.</p>
    <p><strong>Answer:</strong> Average answer value (0 is &apos;Definitely No&apos;, 1 is &apos;Definitely Yes&apos;)</p>
    <p><strong>Agreement:</strong> Distance of average answer value from 0 or 1.</p>
    <p><strong>Confusion:</strong> Average distance of each answer from nearest &apos;Definitely No&apos; or &apos;Definitely Yes&apos;.</p>
  </div>
);

const App = ({ labels, experimentState, initialInstructions, currentItemId, colorUnreviewedBy, onEditColorUnreviewed }) => (
  experimentState !== 'loaded' ? <span>Loading...</span> :
  <div id="app">
    <div className="row">
      <div className="col-sm-6">
        <div className="panel panel-default">
          <div className="panel-heading"><strong>Initial Instructions</strong></div>
          <div className="panel-body">
            <p>{initialInstructions}</p>
          </div>
        </div>
        {currentItemId == null ? null : <DrillDownContainer />}
        {currentItemId == null ? null : <SimilarItemList />}
      </div>
      <div className="col-sm-3">
        <div className="form-inline form-group">
          <label>Color by:</label>
          {' '}
          <OverlayTrigger
            overlay={<Popover id="popover" title="Help">{colorByHelp}</Popover>}
            placement="bottom"
          >
            <span className="glyphicon glyphicon-question-sign" />
          </OverlayTrigger>
          {' '}
          <select
            className="form-control"
            value={colorUnreviewedBy}
            onChange={(e) => { onEditColorUnreviewed(e.target.value); }}
          >
            {['answer', 'agreement', 'confusion'].map(metric => (
              <option value={metric} key={metric}>{metric}</option>
            ))}
          </select>
        </div>
        <div className="panel-group">
          <div className="panel panel-default">
            <div className="panel-heading"><strong>unreviewed</strong></div>
            <div className="panel-body">
              <SectionItemList />
            </div>
          </div>
          {labels.map(label => <LabelSection label={label} key={label} />)}
        </div>
      </div>
      <div className="col-sm-3">
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
