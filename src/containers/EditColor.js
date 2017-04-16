import React from 'react';
import { connect } from 'react-redux';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { editColorUnreviewed } from '../actions';

const colorByHelp = (
  <div>
    <p>All values are scaled to the [0, 1] interval.</p>
    <p><strong>Answer:</strong> Average answer value (0 is &apos;Definitely No&apos;, 1 is &apos;Definitely Yes&apos;)</p>
    <p><strong>Agreement:</strong> Distance of average answer value from 0 or 1.</p>
    <p><strong>Confusion:</strong> Average distance of each answer from nearest &apos;Definitely No&apos; or &apos;Definitely Yes&apos;.</p>
  </div>
);

const EditColor = ({ colorUnreviewedBy, onEditColorUnreviewed }) => (
  <div className="navbar-form navbar-left form-group">
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
);

const mapStateToProps = state => ({
  colorUnreviewedBy: state.colorUnreviewedBy,
});

const mapDispatchToProps = dispatch => ({
  onEditColorUnreviewed: (metric) => {
    dispatch(editColorUnreviewed(metric));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EditColor);
