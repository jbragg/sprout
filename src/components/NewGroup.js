import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';

import { DragItemTypes as ItemTypes } from '../constants';

const propTypes = {
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
};

const NewGroup = ({ connectDropTarget, isOver, canDrop }) => (
  connectDropTarget(
    <div className={`btn btn-nohover ${isOver ? 'over' : ''} ${canDrop ? 'target' : ''}`}>
      <h5 className="glyphicon glyphicon-plus" />
      {' '}
      Drag here for new group
    </div>,
  )
);

NewGroup.propTypes = propTypes;

const target = {
  drop: (props, monitor) => {
    props.onGroupCreate(monitor.getItem().id);
  },
};

const collect = (dndConnect, monitor) => ({
  connectDropTarget: dndConnect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default DropTarget([ItemTypes.ITEM], target, collect)(NewGroup);
