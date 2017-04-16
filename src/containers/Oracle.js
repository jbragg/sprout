import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { DropTarget } from 'react-dnd';
import ItemList from '../components/ItemList';
import { queueItemOracle } from '../actions';
import { ItemTypes } from '../dragConstants';

const propTypes = {
  queries: PropTypes.objectOf(
    PropTypes.shape({
      queryTime: PropTypes.instanceOf(Date).isRequired,
      itemId: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  finalLabels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

const customerHelp = (
  <div>
    <p>Drag items here to ask the customer.</p>
    <p>Items will be queued until the customer reviews them, usually after a few minutes.</p>
    <p>Based on the customer's answer, reviewed items will appear in the yes / no sections.</p>
  </div>
);

const Oracle = ({ queries, finalLabels, connectDropTarget, isOver, canDrop }) => {
  const queuedItemIds = [...queries.values()].filter(query => query.status === 'queued').map(query => query.id);
  const pendingItemIds = [...queries.values()].filter(query => query.status === 'pending').map(query => query.id);
  return connectDropTarget(
    <div
      className="navbar-form navbar-right"
      style={{
        backgroundColor: (isOver && canDrop) ? 'red' : '',
      }}
    >
      <OverlayTrigger
        overlay={<Popover id="popover" title="Help">{customerHelp}</Popover>}
        placement="bottom"
      >
        <span className="glyphicon glyphicon-question-sign" />
      </OverlayTrigger>
      {' '}
      <div className="form-group">
        <label>Queued:</label>
        {' '}
        {queuedItemIds.length === 0 ? <div className="form-control" /> : <ItemList itemIds={queuedItemIds} />}
        {' '}
      </div>
      {' '}
      {pendingItemIds.length === 0 ? null : <ItemList itemIds={pendingItemIds} />}
      {' '}
      {finalLabels.map((label) => {
        const itemIds = [...queries.values()].filter(query => query.status === 'answered' && query.label === label).map(query => query.id);
        return (
          <div className="form-group" key={label}>
            <label>{label}:</label>
            {' '}
            {itemIds.length === 0 ? <div className="form-control" /> : <ItemList itemIds={itemIds} />}
            {' '}
          </div>
        );
      })}
    </div>
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
  canDrop: (props, monitor) => (!props.queries.has(monitor.getItem().id)),
}

const collect = (dndConnect, monitor) => ({
  connectDropTarget: dndConnect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

/*
 * react-redux
 */

const mapStateToProps = state => ({
  queries: state.oracle.queries,
  minutesToAnswer: state.oracle.minutesToAnswer,
  finalLabels: state.finalLabels,
});

const mapDispatchToProps = dispatch => ({
  onQueue: (itemId) => {
    dispatch(queueItemOracle(itemId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget([ItemTypes.ITEM], oracleTarget, collect)(Oracle),
);
