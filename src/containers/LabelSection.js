import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import { editGroup, createGroup, assignAndSetCurrentItem } from '../actions';
import Group from './Group';
import SectionItemList from './SectionItemList';
import { ItemTypes } from '../dragConstants';

const propTypes = {
  groupIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
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
      inInstructions: true,
    });
    this.setState({newGroupName: ''});
  }

  render() {
    const { groupIds, label, onGroupCreate, connectDropTarget, isOver, canDrop } = this.props;
    return connectDropTarget(
      <div className="class-container panel panel-default">
        <div
          className="panel-heading"
          style={{
            backgroundColor: (isOver && canDrop) ? 'yellow' : '',
          }}
        >
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

/*
 * react-dnd
 */

const labelSectionTarget = {
  drop: (props, monitor) => {
    if (monitor.isOver() && monitor.getItemType() === ItemTypes.ITEM) {
      props.onAssign(monitor.getItem().id);
    } else if (monitor.isOver()) {
      props.onGroupMove(monitor.getItem().id);
    }
  },
  canDrop: (props, monitor) => {
    if (!monitor.isOver({ shallow: true })) {
      return false;
    }
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

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
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
  onGroupCreate: (keyValues) => {
    dispatch(createGroup(keyValues));
  },
  onAssign: (itemId) => {
    dispatch(assignAndSetCurrentItem(itemId, { label }));
  },
  onGroupMove: (groupId) => {
    dispatch(editGroup(groupId, { label }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget([ItemTypes.ITEM, ItemTypes.GROUP], labelSectionTarget, collect)(LabelSection)
);
