import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import { DragItemTypes as ItemTypes } from '../constants';

const propTypes = {
  onDrop: PropTypes.func.isRequired,
  onCanDrop: PropTypes.func.isRequired,
};

const defaultProps = {
  DropComponent: (
    () => (
      <div className="panel-heading">
        <h4 className="panel-title text-center">
          <span>Remove <span className="glyphicon glyphicon-remove" /></span>
        </h4>
      </div>
    )
  ),
};

const RemoveTarget = ({
  connectDropTarget, defaultComponent, DropComponent, isOver, canDrop,
children }) => (connectDropTarget(
  <div className={`${isOver ? 'over' : ''} ${canDrop ? 'target text-danger' : ''}`}>
    {canDrop ? <DropComponent /> : children}
  </div>
));

RemoveTarget.propTypes = propTypes;
RemoveTarget.defaultProps = defaultProps;

const target = {
  drop: (props, monitor) => props.onDrop(props, monitor),
  canDrop: (props, monitor) => props.onCanDrop(props, monitor),
};

const collect = (dndConnect, monitor) => ({
  connectDropTarget: dndConnect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default DropTarget([ItemTypes.ITEM], target, collect)(RemoveTarget);
