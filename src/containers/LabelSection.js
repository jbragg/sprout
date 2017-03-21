import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createGroup } from '../actions';
import Group from './Group';
import SectionItemList from './SectionItemList';

const propTypes = {
  groupIds: PropTypes.arrayOf(PropTypes.number).isRequired,
};

class LabelSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {newGroupName: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit() {
    this.props.onGroupCreate({
      label: this.props.label,
      name: this.state.newGroupName,
    });
    this.setState({newGroupName: ''});
  }

  render() {
    const {groupIds, label, onGroupCreate} = this.props;
    return (
      <div className="class-container panel panel-default">
        <div className="panel-heading">
          <strong>{label}</strong>
        </div>
        <div className="panel-body">
          <div>
            <SectionItemList label={label} />
          </div>
          {groupIds.map(key => (
            <Group groupId={key} key={key} />
          ))}
          <form className="form-inline">
            <div className="form-group">
              <label className="sr-only">New group name</label>
              <input
                className="form-control"
                type="text"
                name="newGroupName"
                value={this.state.newGroupName}
                onChange={this.handleChange}
                placeholder="New group name"
              />
            </div>
            {' '}
            <button
              className="btn btn-primary"
              type="submit"
              onClick={(e) => { e.preventDefault(); this.handleSubmit(); }}
              disabled={this.state.newGroupName.length === 0}
            >
              Create
            </button>
          </form>
        </div>
      </div>
    );
  }
}

LabelSection.propTypes = propTypes;

const mapStateToProps = (state, { label }) => ({
  groupIds: [...state.entities.groups.byId.values()].filter(group => group.label === label).map(group => group.id),
});

const mapDispatchToProps = dispatch => ({
  onGroupCreate: (keyValues) => {
    dispatch(createGroup(keyValues));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LabelSection);
