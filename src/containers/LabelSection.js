import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import { Panel } from 'react-bootstrap';
import { editGroup, createGroupAssignAndSetCurrentItem, assignAndSetCurrentItem } from '../actions';
import Group from './Group';
import NewGroup from '../components/NewGroup';
import ItemList from '../components/ItemList';
import { DragItemTypes as ItemTypes } from '../constants';

const propTypes = {
  groupIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
};

const LabelSection = ({ groupIds, label, onGroupCreate, connectDropTarget, isOver, canDrop, itemIds }) => (
  connectDropTarget(
    <div className="panel">
      <Panel
        className={`${isOver ? 'over' : ''} ${canDrop ? 'target' : ''}`}
        header={<span>{label}</span>}
      >
        <div>
          <ItemList itemIds={[...itemIds.values()]} />
        </div>
        <div className="panel-group">
          {groupIds.map(key => (
            <Group groupId={key} key={key} />
          ))}
        </div>
        <NewGroup onGroupCreate={onGroupCreate} />
      </Panel>
    </div>,
));

LabelSection.propTypes = propTypes;

/*
 * react-dnd
 */

const target = {
  drop: (props, monitor) => {
    if (monitor.isOver() && monitor.getItemType() === ItemTypes.ITEM) {
      props.onAssign(monitor.getItem().id);
    } else if (monitor.isOver()) {
      props.onGroupMove(monitor.getItem().id);
    }
  },
  canDrop: (props, monitor) => {
    switch (monitor.getItemType()) {
      case ItemTypes.ITEM: {
        return !props.itemIds.has(monitor.getItem().id);
      }
      default: {
        return props.groupIds.indexOf(monitor.getItem().id) < 0;
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
  onGroupCreate: (itemId) => {
    dispatch(createGroupAssignAndSetCurrentItem(itemId, { label }));
  },
  onAssign: (itemId) => {
    dispatch(assignAndSetCurrentItem(itemId, { label }));
  },
  onGroupMove: (groupId) => {
    dispatch(editGroup(groupId, { label }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget([ItemTypes.ITEM, ItemTypes.GROUP], target, collect)(LabelSection),
);
