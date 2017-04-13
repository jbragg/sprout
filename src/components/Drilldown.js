import React from 'react';
import PropTypes from 'prop-types';
import { ItemLargeContainer } from '../containers/ItemContainer';

const propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    data: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  formState: PropTypes.shape({
    hasSubmitted: PropTypes.bool,
    label: PropTypes.string,
    groupId: PropTypes.number,
  }).isRequired,
  onEditLabelForm: PropTypes.func.isRequired,
  onAssignItem: PropTypes.func.isRequired,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

class DrillDown extends React.Component {
  constructor(props) {
    super(props);
    this.state = { imageStatus: 'loading' };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getErrorMsg = this.getErrorMsg.bind(this);
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.item.id !== this.props.item.id) {
      this.setState({ imageStatus: 'loading' });
    }
  }

  getErrorMsg() {
    if (this.props.formState.groupId == null && this.props.formState.label == null) {
      return 'Choose an existing group or assign a general label.';
    }
    return '';
  }

  handleChange(event) {
    let value = event.target.value || null;
    if (event.target.name === 'groupId' && value != null) {
      value = Number(event.target.value);
    }
    this.props.onEditLabelForm({ [event.target.name]: value });
  }

  handleSubmit(event) {
    this.props.onEditLabelForm({ hasSubmitted: true });
    if (this.getErrorMsg().length <= 0) {
      this.props.onAssignItem(
        this.props.item.id,
        {
          group: this.props.formState.groupId,
          label: this.props.formState.groupId == null ? this.props.formState.label : null,
        },
      );
    }
    event.preventDefault();
  }

  handleImageLoaded() {
    this.setState({ imageStatus: 'loaded' });
  }

  render() {
    const error = this.getErrorMsg();
    const errorComponent = (error && this.props.formState.hasSubmitted
      ? <p className="alert alert-danger">{error}</p>
      : null
    );
    const form = (
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label>Existing group:</label>
          <select
            name="groupId"
            className="form-control"
            value={this.props.formState.groupId == null ? '' : this.props.formState.groupId}
            onChange={this.handleChange}
          >
            <option />
            {this.props.groups.map(group => (
              <option value={group.id} key={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Label:</label>
          <div>
            {this.props.formState.groupId != null
                ? (
                  <p className="alert alert-info">
                    Remove the group to select a label instead of a group.
                  </p>
                )
                : this.props.labels.map(label => (
                  <label
                    className="radio-inline"
                    key={label}
                  >
                    <input
                      type="radio"
                      name="label"
                      value={label}
                      checked={this.props.formState.label === label}
                      onChange={this.handleChange}
                    />
                    {label}
                  </label>
                ))
            }
          </div>
        </div>
        {errorComponent}
        <button type="submit" className="btn btn-primary" disabled={errorComponent}>Submit</button>
      </form>
    );

    return (
      <div className="drilldown-container panel panel-default">
        <div className="panel-body">
          <div className={this.state.imageStatus === 'loaded' ? '' : 'hidden'}>
            <ItemLargeContainer
              itemId={this.props.item.id}
              onLoad={this.handleImageLoaded}
            />
          </div>
          {this.state.imageStatus === 'loaded'
              ? null
              : <span className="glyphicon glyphicon-refresh spinning" />
          }
          <p>Assign the item to either an existing group or a general label.</p>
          {form}
          <div className="panel panel-default panel-body">
            <button
              className="btn btn-primary"
            >
              Query the oracle instead
            </button>
            <p>
              Remaining queries: 5
            </p>
          </div>
        </div>
      </div>
    );
  }
}

DrillDown.propTypes = propTypes;

export default DrillDown;
