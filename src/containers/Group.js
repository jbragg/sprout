import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DragSource, DropTarget } from 'react-dnd';
import SectionItemList from '../containers/SectionItemList';
import { editGroup, mergeGroup, assignAndSetCurrentItem } from '../actions';
import { groupAnswers } from '../reducers';
import { ItemTypes } from '../dragConstants';

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
  onGroupMergeOut: PropTypes.func.isRequired,
  onGroupEdit: PropTypes.func.isRequired,
  summary: PropTypes.string.isRequired,
  isOver: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
};

class Group extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onGroupEdit({ [event.target.name]: event.target.value });
    event.preventDefault();
  }

  render() {
    const { labels, groupId, connectDropTarget, connectDragSource, isOver, isDragging, groups, onGroupMergeOut, summary } = this.props;
    const thisGroup = groups.get(groupId);
    return connectDragSource(connectDropTarget(
      <div
        className="class-container panel panel-default"
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div
          className="panel-heading"
          style={{
            backgroundColor: isOver ? 'yellow' : '',
          }}
        >
          <div className="pull-right">
            <button
              className="btn btn-danger"
              onClick={() => {
                onGroupMergeOut({ label: thisGroup.label });
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
                {labels
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
                  onGroupMergeOut({ group: Number(e.target.value) });
                }}
              >
                <option value="default" disabled>-merge into-</option>
                {[...groups.values()]
                    .filter(group => group.id !== groupId)
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
          <p><strong>Summary: </strong>{summary}</p>
          <SectionItemList group={thisGroup.id} />
        </div>
      </div>
    ));
  }
}

Group.propTypes = propTypes;

/*
 * react-dnd
 */

const groupSource = {
  beginDrag(props) {
    return { id: props.groupId };
  }
};

const collectSource = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
});

const groupTarget = {
  drop(props, monitor) {
    if (monitor.getItemType() === ItemTypes.ITEM) {
      props.onAssign(monitor.getItem().id);
    } else {
      props.onGroupMergeIn(monitor.getItem().id);
    }
  }
};

const collectTarget = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
});

/*
 * react-redux
 */

const mapStateToProps = (state, { groupId }) => ({
  labels: state.labels,
  groups: state.entities.groups.byId,
  summary: groupAnswers(state, groupId).map(answer => answer.data.unclear_type).filter(s => s.length > 0).join(', '),
});

const mapDispatchToProps = (dispatch, { groupId }) => ({
  onGroupMergeOut: (target) => {
    dispatch(mergeGroup(groupId, target));
  },
  onGroupEdit: (keyValues) => {
    dispatch(editGroup(groupId, keyValues));
  },
  onAssign: (itemId) => {
    dispatch(assignAndSetCurrentItem(itemId, { group: groupId }));
  },
  onGroupMergeIn: (sourceGroupId) => {
    dispatch(mergeGroup(sourceGroupId, { group: groupId }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DragSource(ItemTypes.GROUP, groupSource, collectSource)(
    DropTarget([ItemTypes.ITEM, ItemTypes.GROUP], groupTarget, collectTarget)(Group)
  )
);
