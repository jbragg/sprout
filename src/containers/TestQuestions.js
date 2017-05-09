import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import ItemList from '../components/ItemList';
import RemoveTarget from '../components/RemoveTarget';
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
  onEditTest,
}) => {
  const unlabeledItemIds = [...items.values()]
    .filter(item => item.label == null && item.group == null)
    .map(item => item.id);
  return connectDropTarget(
    <div className={`panel panel-default ${isOver ? 'over' : ''} ${canDrop ? 'target' : ''}`}>
      <RemoveTarget
        onDrop={(_, monitor) => { onEditTest(monitor.getItem().id, false); }}
        onCanDrop={(_, monitor) => items.has(monitor.getItem().id)}
      >
        <div className="panel-heading">
          <h4 className="panel-title">
            Test questions
          </h4>
        </div>
      </RemoveTarget>
      <div className="panel-body">
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
      </div>
    </div>,
  );
};

TestQuestions.propTypes = propTypes;

/*
 * react-dnd
 */

const target = {
  drop: (props, monitor) => {
    props.onEditTest(monitor.getItem().id, true);
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
  onEditTest: (itemId, testValue) => {
    dispatch(editItem(itemId, { test: testValue }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget([ItemTypes.ITEM], target, collect)(TestQuestions),
);
