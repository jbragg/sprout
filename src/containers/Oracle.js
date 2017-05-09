import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popover, OverlayTrigger, Panel } from 'react-bootstrap';
import { DropTarget } from 'react-dnd';
import ItemList from '../components/ItemList';
import RemoveTarget from '../components/RemoveTarget';
import { queueItemOracle, unqueueItemOracle } from '../actions';
import { DragItemTypes as ItemTypes } from '../constants';

const propTypes = {
  queuedItems: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
  answeredItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onUnqueue: PropTypes.func.isRequired,
};

const customerHelp = (
  <div>
    <p>Drag items here to ask the customer.</p>
    <p>Items will be queued until the customer reviews them, usually after a few minutes.</p>
    <p>Based on the customer&apos;s answer, reviewed items will appear in the yes / no sections.</p>
  </div>
);

const Oracle = ({ queuedItems, answeredItems, labels, connectDropTarget, isOver, canDrop, onUnqueue }) => {
  return connectDropTarget(
    <div className={`panel panel-default ${isOver ? 'over' : ''} ${canDrop ? 'target' : ''}`}>
      <RemoveTarget
        onDrop={(_, monitor) => { onUnqueue(monitor.getItem().id); }}
        onCanDrop={(_, monitor) => queuedItems.has(monitor.getItem().id)}
      >
        <div className="panel-heading">
          <h4 className="panel-title">
            Ask for a clarification
            {' '}
            <OverlayTrigger
              overlay={
                <Popover id="popover" title="Help">{customerHelp}</Popover>
              }
              placement="bottom"
            >
              <span className="glyphicon glyphicon-question-sign" />
            </OverlayTrigger>
          </h4>
        </div>
      </RemoveTarget>
      <div className="panel-body">
        <div>
          {queuedItems.size === 0 ? null : <ItemList itemIds={[...queuedItems.keys()]} />}
        </div>
        {labels.map((label) => {
          const itemIds = answeredItems.filter(val => val.label === label).map(val => val.id);
          return (
            <Panel
              header={<span>{label}</span>}
              key={label}
            >
              <div>
                {itemIds.length === 0 ? null : <ItemList itemIds={itemIds} />}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>,
  );
};

Oracle.propTypes = propTypes;

/*
 * react-dnd
 */

const oracleTarget = {
  drop: (props, monitor) => {
    props.onQueue(monitor.getItem().id);
  },
  canDrop: (props, monitor) => (!props.queuedItems.has(monitor.getItem().id) && props.answeredItems.findIndex(val => val.id === monitor.getItem().id) < 0),
};

const collect = (dndConnect, monitor) => ({
  connectDropTarget: dndConnect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

/*
 * react-redux
 */

const mapStateToProps = state => ({
  queuedItems: new Map(state.oracle.queuedItems.map(item => [item.id, item])),
  answeredItems: state.oracle.answeredItems,
  labels: state.labels,
});

const mapDispatchToProps = dispatch => ({
  onQueue: (itemId) => {
    dispatch(queueItemOracle(itemId));
  },
  onUnqueue: (itemId) => {
    dispatch(unqueueItemOracle(itemId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget([ItemTypes.ITEM], oracleTarget, collect)(Oracle),
);
