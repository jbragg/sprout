import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SectionItemList from '../containers/SectionItemList';
import { editGroup, mergeGroup } from '../actions';

const propTypes = {
  groupId: PropTypes.number.isRequired,
  groups: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  onGroupMerge: PropTypes.func.isRequired,
  onGroupEdit: PropTypes.func.isRequired,
};

class Group extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onGroupEdit(
      this.props.groupId,
      { [event.target.name]: event.target.value },
    );
    event.preventDefault();
  }

  render() {
    const thisGroup = this.props.groups.get(this.props.groupId);
    return (
      <div className="class-container panel panel-default">
        <div className="panel-heading">
          <div className="pull-right">
            <button
              className="btn btn-danger"
              onClick={() => {
                this.props.onGroupMerge(
                  this.props.groupId,
                  { label: thisGroup.label });
              }}
            >
              Delete
            </button>
          </div>
          <form
            className="form-inline"
            onSubmit={(e) => { e.preventDefault(); }}
          >
            <div className="form-group form-group-sm">
              <label className="sr-only">Group Name</label>
              <input
                className="form-control"
                type="text"
                name="name"
                value={thisGroup.name}
                onChange={this.handleChange}
                placeholder="Group name"
              />
            </div>
            {' '}
            <div className="form-group">
              <label className="sr-only">Group Label</label>
              <select
                className="form-control"
                name="label"
                value="default"
                onChange={this.handleChange}
              >
                <option value="default" disabled>-change label-</option>
                {this.props.labels
                    .filter(value => value !== thisGroup.label)
                    .map(value => (
                      <option value={value} key={value}>{value}</option>
                    ))
                }
              </select>
            </div>
            {' '}
            <div className="form-group">
              <label className="sr-only">Merge Group</label>
              <select
                className="form-control"
                value="default"
                onChange={(e) => {
                  this.props.onGroupMerge(
                    this.props.groupId,
                    { group: Number(e.target.value) },
                  );
                }}
              >
                <option value="default" disabled>-merge into-</option>
                {[...this.props.groups.values()]
                    .filter(group => group.id !== this.props.groupId)
                    .map(group => (
                      <option
                        value={group.id}
                        key={group.id}
                      >
                        {group.name}
                      </option>
                    ))
                }
              </select>
            </div>
          </form>
        </div>
        <div className="panel-body">
          <SectionItemList group={thisGroup.id} />
        </div>
      </div>
    );
  }
}

Group.propTypes = propTypes;

const mapStateToProps = state => ({
  labels: state.labels,
  groups: state.entities.groups.byId,
});

const mapDispatchToProps = dispatch => ({
  onGroupMerge: (groupId, target) => {
    dispatch(mergeGroup(groupId, target));
  },
  onGroupEdit: (groupId, keyValues) => {
    dispatch(editGroup(groupId, keyValues));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Group);
