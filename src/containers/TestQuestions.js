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
  items: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string,
      group: PropTypes.number,
    }).isRequired,
  ).isRequired,
  groups: PropTypes.objectOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  uncertainLabel: PropTypes.string.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
};

const TestQuestions = ({
  items, groups, labels, isOver, canDrop, connectDropTarget, uncertainLabel,
}) => {
  const unlabeledItemIds = [...items.values()]
    .filter(item => item.label == null && item.group == null)
    .map(item => item.id);
  return connectDropTarget(
    <div className="panel">
      <Panel
        className={`${isOver ? 'over' : ''} ${canDrop ? 'target' : ''}`}
        header={<span>Test questions</span>}
      >
        {unlabeledItemIds.length === 0 ? null : (
          <div>
            <p className="text-danger">
              Unlabeled items will not be included as test questions.
            </p>
            <ItemList itemIds={unlabeledItemIds} />
          </div>
        )}
        {labels.map((label) => {
          const itemIds = [...items.values()]
            .filter(item => (
              item.label === label ||
              (item.group != null && groups.get(item.group).label === label)),
            )
            .map(item => item.id);
          if (label !== uncertainLabel || itemIds.length > 0) {
            return (
              <Panel
                header={<span>{label}</span>}
                key={label}
                bsStyle={label === uncertainLabel ? 'danger' : 'default'}
              >
                <div>
                  {label !== uncertainLabel ? null : (
                    <p className="text-danger">
                      {`Items marked ${uncertainLabel} will not be included as test questions.`}
                    </p>
                  )}
                  {itemIds.length === 0 ? null : <ItemList itemIds={itemIds} />}
                </div>
              </Panel>
            );
          }
          return null;
        })}
      </Panel>
    </div>,
  );
};

TestQuestions.propTypes = propTypes;

/*
 * react-dnd
 */

const target = {
  drop: (props, monitor) => {
    props.onCreateTest(monitor.getItem().id);
  },
  canDrop: (props, monitor) => !props.items.has(monitor.getItem().id),
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
  items: new Map(testItemsSelector(state).map(item => [item.id, item])),
  groups: state.entities.groups.byId,
  labels: state.labels,
  uncertainLabel: state.uncertainLabel,
});

const mapDispatchToProps = dispatch => ({
  onCreateTest: (itemId) => {
    dispatch(editItem(itemId, { test: true }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget([ItemTypes.ITEM], target, collect)(TestQuestions),
);
