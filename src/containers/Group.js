import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DragSource, DropTarget } from 'react-dnd';
import ItemGroup from '../components/ItemGroup';
import { editGroup, mergeGroup, assignItems } from '../actions';
import { recommendedGroupSelector, getItemsSummary } from '../reducers/index';
import { currentItemIdSelector } from '../reducers/currentItem';
import { DragItemTypes as ItemTypes } from '../constants';

const propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    itemIds: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number.isRequired),
      ImmutablePropTypes.orderedSetOf(PropTypes.number.isRequired),
    ]).isRequired,
  }).isRequired,
  onGroupEdit: PropTypes.func.isRequired,
  summary: PropTypes.string.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func.isRequired,
  recommended: PropTypes.bool.isRequired,
  isDragging: PropTypes.bool.isRequired,
  currentItemId: PropTypes.number,
  useReasons: PropTypes.bool,
  monitorItemId: PropTypes.number,
  draggableItems: PropTypes.bool,
};

const defaultProps = {
  currentItemId: null,
  useReasons: true,
  monitorItemId: null,
  draggableItems: true,
};

class Group extends React.Component {
  constructor(props) {
    super(props);
    this.state = { recommended: props.recommended };
  }

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }

  componentWillReceiveProps(nextProps) {
    /**
     * Need to remove css class before reapplying to ensure animation works.
     */
    const { currentItemId, group } = this.props;
    if (nextProps.currentItemId !== currentItemId || nextProps.group.itemIds !== group.itemIds) {
      this.setState({ recommended: false }, () => {
        setTimeout(() => this.setState({ recommended: nextProps.recommended }), 0);
      });
      if (nextProps.recommended && this.node) {
        this.node.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  render() {
    const {
      group, connectDropTarget, connectDragSource, isOver, canDrop,
      isDragging, summary, useReasons, monitorItemId, onGroupEdit,
      draggableItems,
    } = this.props;
    const recommended = this.state.recommended && useReasons;
    // canDrop is not sufficient here because a group should catch but
    // ignore its own items to prevent the parent label from handling.
    const isTarget = canDrop && !group.itemIds.has(monitorItemId);
    return connectDragSource(connectDropTarget(
      <div className="panel" ref={(c) => { this.node = c; }}>
        <ItemGroup
          itemIds={group.itemIds}
          isOver={isOver}
          isTarget={isTarget}
          isDragging={isDragging}
          recommended={recommended}
          isNameable
          name={group.name}
          nameEditFunc={(e) => {
            onGroupEdit({ name: e.target.value }, group.id);
          }}
          summary={useReasons ? summary : null}
          draggableItems={draggableItems}
        />
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
  beginDrag: props => ({
    id: props.groupId,
    itemIds: props.group.itemIds,
  }),
};

const collectSource = (dndConnect, monitor) => ({
  connectDragSource: dndConnect.dragSource(),
  connectDragPreview: dndConnect.dragPreview(),
  isDragging: monitor.isDragging(),
});

const groupTarget = {
  drop: (props, monitor) => {
    if (monitor.getItemType() === ItemTypes.ITEM) {
      if (!props.group.itemIds.has(monitor.getItem().id)) {
        /* This check is here instead of in canDrop() so a group handles
         * (by ignoring but still catching)
         * drop events of its own items rather than the parent label.
         */
        props.onAssign(
          [monitor.getItem().id],
          props.groupId,
          props.autoAdvance,
        );
      }
    } else if (monitor.getItemType() === ItemTypes.GROUP) {
      const id = monitor.getItem().id;
      if (props.confirmMerge == null) {
        props.onGroupMergeIn(id, props.groupId);
      } else {
        props.confirmMerge(() => props.onGroupMergeIn(id, props.groupId));
      }
    } else {  // ItemTypes.CLUSTER
      const ids = [...monitor.getItem().ids];
      if (props.confirmMerge == null) {
        props.onAssign(ids, props.groupId, props.autoAdvance);
      } else {
        props.confirmMerge(
          () => props.onAssign(ids, props.groupId, props.autoAdvance),
        );
      }
    }
  },
  canDrop: (props, monitor) => {
    switch (monitor.getItemType()) {
      case ItemTypes.GROUP: {
        return props.groupId !== monitor.getItem().id;
      }
      default: {
        return true;
      }
    }
  },
};

const collectTarget = (dndConnect, monitor) => ({
  connectDropTarget: dndConnect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
  monitorItemId: monitor.getItem() == null ? null : monitor.getItem().id,
});

/*
 * react-redux
 */

const mapStateToProps = (state, { groupId }) => ({
  group: state.entities.groups.byId.get(groupId),
  summary: getItemsSummary([...state.entities.groups.byId.get(groupId).itemIds], state),
  recommended: recommendedGroupSelector(state) === groupId,
  currentItemId: currentItemIdSelector(state),
  useReasons: state.config.useReasons,
  autoAdvance: state.autoAdvance,
});

const mapDispatchToProps = dispatch => ({
  onGroupEdit: (keyValues, groupId) => {
    dispatch(editGroup(groupId, keyValues));
  },
  onAssign: (itemIds, groupId, autoAdvance) => {
    dispatch(assignItems(itemIds, { group: groupId }, autoAdvance));
  },
  onGroupMergeIn: (sourceGroupId, groupId) => {
    dispatch(mergeGroup(sourceGroupId, { group: groupId }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DragSource(
    ItemTypes.GROUP,
    groupSource,
    collectSource,
  )(
    DropTarget(
      [ItemTypes.ITEM, ItemTypes.GROUP, ItemTypes.CLUSTER],
      groupTarget,
      collectTarget,
    )(Group),
  ),
);
