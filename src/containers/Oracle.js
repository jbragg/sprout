import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popover, OverlayTrigger, Panel } from 'react-bootstrap';
import { DropTarget } from 'react-dnd';
import ItemList from '../components/ItemList';
import { queueItemOracle } from '../actions';
import { DragItemTypes as ItemTypes } from '../constants';

const propTypes = {
  queuedItems: PropTypes.arrayOf(
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
};

const customerHelp = (
  <div>
    <p>Drag items here to ask the customer.</p>
    <p>Items will be queued until the customer reviews them, usually after a few minutes.</p>
    <p>Based on the customer&apos;s answer, reviewed items will appear in the yes / no sections.</p>
  </div>
);

const Oracle = ({ queuedItems, answeredItems, labels, connectDropTarget, isOver, canDrop }) => {
  const queuedItemIds = queuedItems.map(val => val.id);
  return connectDropTarget(
    <div className="panel">
      <Panel
        className={(isOver && canDrop) ? 'target' : ''}
        header={
          <span>
          Ask for a clarification
          <OverlayTrigger
            overlay={<Popover id="popover" title="Help">{customerHelp}</Popover>}
            placement="bottom"
          >
            <span className="glyphicon glyphicon-question-sign" />
          </OverlayTrigger>
          </span>
        }
      >
        <div>
          {queuedItemIds.length === 0 ? null : <ItemList itemIds={queuedItemIds} />}
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
      </Panel>
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
  canDrop: (props, monitor) => (props.queuedItems.findIndex(val => val.id === monitor.getItem().id) < 0 && props.answeredItems.findIndex(val => val.id === monitor.getItem().id) < 0),
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
  queuedItems: state.oracle.queuedItems,
  answeredItems: state.oracle.answeredItems,
  labels: state.labels,
});

const mapDispatchToProps = dispatch => ({
  onQueue: (itemId) => {
    dispatch(queueItemOracle(itemId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget([ItemTypes.ITEM], oracleTarget, collect)(Oracle),
);
