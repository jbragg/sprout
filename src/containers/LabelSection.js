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
import Confirm from '../components/Confirm';
import { DragItemTypes as ItemTypes } from '../constants';

const propTypes = {
  groupIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  onGroupCreate: PropTypes.func.isRequired,
  onGroupDelete: PropTypes.func.isRequired,
};

class LabelSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmFunc: null,
      confirmText: null,
    };
    this.confirmed = this.confirmed.bind(this);
    this.confirm = this.confirm.bind(this);
  }

  confirm(confirmFunc, confirmText) {
    this.setState({ confirmFunc, confirmText });
  }

  confirmed() {
    this.setState({ confirmFunc: null, confirmText: null, });
  }

  render() {
    const {
      groupIds, label, onGroupCreate, connectDropTarget,
      isOver, canDrop, itemIds, onGroupDelete,
    } = this.props;
    const mergeMessage = 'Are you sure? All items from the dragged group will be moved to the target group. This action is not reversible.';
    const deleteMessage = 'Are you sure you want to delete the group? All items in the group will keep their label. This action is not reversible.';
    return connectDropTarget(
      <div className={`panel panel-default ${isOver ? 'over' : ''} ${canDrop ? 'target' : ''}`}>
        <Confirm
          text={this.state.confirmText || 'Are you sure?'}
          show={this.state.confirmFunc != null}
          onConfirm={() => { this.state.confirmFunc(); this.confirmed(); }}
          onDismiss={this.confirmed}
        />
        <RemoveTarget
          onDrop={(_, monitor) => {
            const id = monitor.getItem().id;
            this.confirm(() => { onGroupDelete(id); }, deleteMessage);
          }}
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
                <Group
                  groupId={key}
                  key={key}
                  confirmMerge={(f) => { this.confirm(f, mergeMessage); }}
                />
              ))}
            </div>
          )}
          <NewGroup onGroupCreate={onGroupCreate} />
        </div>
      </div>,
    );
  }
}

LabelSection.propTypes = propTypes;

/*
 * react-dnd
 */

const target = {
  drop: (props, monitor) => {
    if (monitor.didDrop()) {  // Check if a group already handled the event.
      return;
    }
    if (monitor.getItemType() === ItemTypes.ITEM) {
      props.onAssign(monitor.getItem().id);
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
