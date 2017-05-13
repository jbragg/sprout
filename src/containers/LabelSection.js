import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import { Panel } from 'react-bootstrap';
import {
  editGroup, createGroupAssignAndSetCurrentItem, assignAndSetCurrentItem,
  mergeGroup,
} from '../actions';
import Group from './Group';
import NewGroup from '../components/NewGroup';
import ItemList from '../components/ItemList';
import RemoveTarget from '../components/RemoveTarget';
import { DragItemTypes as ItemTypes } from '../constants';

const propTypes = {
  groupIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  onGroupCreate: PropTypes.func.isRequired,
  onGroupDelete: PropTypes.func.isRequired,
};

const LabelSection = ({
  groupIds, label, onGroupCreate, connectDropTarget, isOver, canDrop, itemIds,
  onGroupDelete,
}) => (
  connectDropTarget(
    <div className={`panel panel-default ${isOver ? 'over' : ''} ${canDrop ? 'target' : ''}`}>
      <RemoveTarget
        onDrop={(_, monitor) => { onGroupDelete(monitor.getItem().id); }}
        onCanDrop={(_, monitor) => monitor.getItemType() === ItemTypes.GROUP && groupIds.indexOf(monitor.getItem().id) >= 0}
      >
        <div className="panel-heading">
          <h4 className="panel-title">{label}</h4>
        </div>
      </RemoveTarget>
      <div className="panel-body">
        <div>
          <ItemList itemIds={[...itemIds.values()]} />
        </div>
        {groupIds.length === 0 ? null : (
          <div className="panel-group">
            {groupIds.map(key => (
              <Group groupId={key} key={key} />
            ))}
          </div>
        )}
        <NewGroup onGroupCreate={onGroupCreate} />
      </div>
    </div>,
));

LabelSection.propTypes = propTypes;

/*
 * react-dnd
 */

const target = {
  drop: (props, monitor) => {
    if (monitor.getItemType() === ItemTypes.ITEM) {
      if (!monitor.didDrop()) {  // Check if a group already handled the event.
        props.onAssign(monitor.getItem().id);
      }
    } else if (monitor.getItemType() === ItemTypes.GROUP) {
      props.onGroupMove(monitor.getItem().id);
    } else {  // ItemTypes.CLUSTER
      props.onGroupCreate(monitor.getItem().ids);
    }
  },
  canDrop: (props, monitor) => {
    switch (monitor.getItemType()) {
      case ItemTypes.ITEM: {
        return !props.itemIds.has(monitor.getItem().id);
      }
      case ItemTypes.GROUP: {
        return props.groupIds.indexOf(monitor.getItem().id) < 0;
      }
      default: {
        return true;
      }
    }
  },
};

const collect = (dndConnect, monitor) => ({
  connectDropTarget: dndConnect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
});

/*
 * react-redux
 */

const mapStateToProps = (state, { label }) => ({
  groupIds: [...state.entities.groups.byId.values()].filter(group => group.label === label).map(group => group.id),
  itemIds: state.entities.labels.get(label).itemIds,
});

const mapDispatchToProps = (dispatch, { label }) => ({
  onGroupDelete: (groupId) => {
    dispatch(mergeGroup(groupId, { label }));
  },
  onGroupCreate: (itemIds) => {
    dispatch(createGroupAssignAndSetCurrentItem(itemIds, { label }));
  },
  onAssign: (itemId) => {
    dispatch(assignAndSetCurrentItem([itemId], { label }));
  },
  onGroupMove: (groupId) => {
    dispatch(editGroup(groupId, { label }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget(
    [ItemTypes.ITEM, ItemTypes.GROUP, ItemTypes.CLUSTER],
    target,
    collect,
  )(LabelSection),
);
