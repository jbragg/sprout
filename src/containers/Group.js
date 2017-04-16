import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DragSource, DropTarget } from 'react-dnd';
import ItemList from '../components/ItemList';
import { editGroup, mergeGroup, assignAndSetCurrentItem } from '../actions';
import { groupAnswers } from '../reducers';
import { ItemTypes } from '../dragConstants';

const propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  onGroupMergeOut: PropTypes.func.isRequired,
  onGroupEdit: PropTypes.func.isRequired,
  summary: PropTypes.string.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
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
    const { group, connectDropTarget, connectDragSource, isOver, canDrop, isDragging, onGroupMergeOut, summary } = this.props;
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
            backgroundColor: (isOver && canDrop) ? 'yellow' : '',
          }}
        >
          <div className="pull-right">
            <button
              className="btn btn-danger"
              onClick={() => {
                onGroupMergeOut({ label: group.label });
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
                value={group.name}
                onChange={this.handleChange}
                placeholder="Group name"
              />
            </div>
          </form>
        </div>
        <div className="panel-body">
          <p><strong>Summary: </strong>{summary}</p>
          <ItemList itemIds={[...group.itemIds.values()]} />
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
  beginDrag: props => ({ id: props.groupId }),
};

const collectSource = (dndConnect, monitor) => ({
  connectDragSource: dndConnect.dragSource(),
  isDragging: monitor.isDragging(),
});

const groupTarget = {
  drop: (props, monitor) => {
    if (monitor.getItemType() === ItemTypes.ITEM) {
      props.onAssign(monitor.getItem().id);
    } else {
      props.onGroupMergeIn(monitor.getItem().id);
    }
  },
  canDrop: (props, monitor) => {
    switch (monitor.getItemType()) {
      case ItemTypes.ITEM: {
        return !props.group.itemIds.has(monitor.getItem().id);
      }
      default: {
        return props.groupId !== monitor.getItem().id;
      }
    }
  },
};

const collectTarget = (dndConnect, monitor) => ({
  connectDropTarget: dndConnect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

/*
 * react-redux
 */

const mapStateToProps = (state, { groupId }) => ({
  group: state.entities.groups.byId.get(groupId),
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
