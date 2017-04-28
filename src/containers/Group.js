import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DragSource, DropTarget } from 'react-dnd';
import ItemList from '../components/ItemList';
import { editGroup, mergeGroup, assignAndSetCurrentItem } from '../actions';
import { recommendedGroupSelector, getItemsSummary } from '../reducers/index';
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
  recommended: PropTypes.bool.isRequired,
  isDragging: PropTypes.bool.isRequired,
  currentItemId: PropTypes.number,
};

const defaultProps = {
  currentItemId: null,
};

class Group extends React.Component {
  constructor(props) {
    super(props);
    this.state = { recommended: props.recommended };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { currentItemId } = this.props;
    if (nextProps.currentItemId !== currentItemId) {
      this.setState({ recommended: false }, () => {
        setTimeout(() => this.setState({ recommended: nextProps.recommended }), 0);
      });
    }
  }

  handleChange(event) {
    this.props.onGroupEdit({ [event.target.name]: event.target.value });
    event.preventDefault();
  }

  render() {
    const { group, connectDropTarget, connectDragSource, isOver, canDrop, isDragging, onGroupMergeOut, summary } = this.props;
    return connectDragSource(connectDropTarget(
      <div
        className={`class-container panel panel-primary ${this.state.recommended ? 'recommended' : ''} ${(isOver && canDrop) ? 'target' : ''}`}
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="panel-heading">
          <div className="pull-right">
            <button
              className="btn btn-default text-danger"
              onClick={() => {
                onGroupMergeOut({ label: group.label });
              }}
            >
              <span className="text-danger">Delete</span>
            </button>
          </div>
          <form
            className="form-inline"
            onSubmit={(e) => { e.preventDefault(); }}
          >
            {this.state.recommended
                ? (
                  <span
                    className={`glyphicon glyphicon-star ${(isOver && canDrop) ? 'text-primary' : ''} pull-left`}
                    style={{
                      color: (isOver && canDrop) ? '' : 'yellow',
                    }}
                  />
                )
                : null
            }
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
      </div>,
    ));
  }
}

Group.propTypes = propTypes;
Group.defaultProps = defaultProps;

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
  summary: getItemsSummary([...state.entities.groups.byId.get(groupId).itemIds], state),
  recommended: recommendedGroupSelector(state) === groupId,
  currentItemId: state.currentItemId,
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
    DropTarget([ItemTypes.ITEM, ItemTypes.GROUP], groupTarget, collectTarget)(Group),
  ),
);
