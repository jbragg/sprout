import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import ItemList from '../components/ItemList';
import { testItemsSelector } from '../reducers/index';
import { DragItemTypes as ItemTypes } from '../constants';
import { editItem } from '../actions';

const propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
  finalLabels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
};

const TestQuestions = ({ items, finalLabels, isOver, canDrop, connectDropTarget }) => (
  connectDropTarget(
    <div className="panel">
      <Panel
        className={`${isOver ? 'over' : ''} ${canDrop ? 'target' : ''}`}
        header={<span>Test questions</span>}
      >
        {finalLabels.map((label) => {
          const itemIds = items.filter(item => item.label === label).map(item => item.id);
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
  )
);

TestQuestions.propTypes = propTypes;

/*
 * react-dnd
 */

const target = {
  drop: (props, monitor) => {
    props.onCreateTest(monitor.getItem().id);
  },
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
  items: testItemsSelector(state),
  finalLabels: state.finalLabels,
});

const mapDispatchToProps = dispatch => ({
  onCreateTest: (itemId) => {
    dispatch(editItem(itemId, { test: true }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget([ItemTypes.ITEM], target, collect)(TestQuestions),
);
