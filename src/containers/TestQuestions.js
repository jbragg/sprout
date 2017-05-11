import React from 'react';
import PropTypes from 'prop-types';
import { Panel, OverlayTrigger, Popover, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import ItemList from '../components/ItemList';
import RemoveTarget from '../components/RemoveTarget';
import InstructionsModal from './InstructionsModal';
import { testItemsSelector, itemLabelsSelector } from '../reducers/index';
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
  itemLabels: PropTypes.objectOf(PropTypes.string).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  finalLabels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  uncertainLabel: PropTypes.string.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  onEditTest: PropTypes.func.isRequired,
  // dropResult: PropTypes.number,
};

const defaultProps = {
  // dropResult: null,
};

class TestQuestions extends React.Component {
  constructor(props) {
    super(props);
    this.state = { current: null };
  }

  /*
   * Uncomment to edit instructions on drop.
   *
  componentWillReceiveProps(nextProps) {
    if (this.state.current == null && nextProps.dropResult != null) {
      this.setState({ current: nextProps.dropResult });
    }
  }
  */

  render() {
    const {
      items, itemLabels, labels,
      isOver, canDrop,
      connectDropTarget, uncertainLabel, finalLabels, onEditTest,
    } = this.props;
    const unlabeledItemIds = [...items.values()]
      .filter(item => item.label == null && item.group == null)
      .map(item => item.id);
    const warning = (
      <Alert bsStyle="danger">
        Label these items {finalLabels.join(' / ')} to include them as test questions.
      </Alert>
    );
    return connectDropTarget(
      <div className={`panel panel-default ${isOver ? 'over' : ''} ${canDrop ? 'target' : ''}`}>
        <InstructionsModal
          show={this.state.current != null}
          itemId={this.state.current}
          onSubmit={() => { this.setState({ current: null }); }}
        />
        <RemoveTarget
          onDrop={(_, monitor) => { onEditTest(monitor.getItem().id, false); }}
          onCanDrop={(_, monitor) => items.has(monitor.getItem().id)}
        >
          <div className="panel-heading">
            <h4 className="panel-title">
              Test questions
              {' '}
              <OverlayTrigger
                overlay={
                  <Popover id="popover">
                    <p>Drag items here to include them in an interactive tutorial.</p>
                    <p>Select items that test if workers understand the instructions.</p>
                    <p>Click on an item to edit your explanation.</p>
                  </Popover>
                }
                placement="top"
              >
                <span className="glyphicon glyphicon-question-sign" />
              </OverlayTrigger>
            </h4>
          </div>
        </RemoveTarget>
        <div className="panel-body">
          {unlabeledItemIds.length === 0 ? null : (
            <div>
              {warning}
              <ItemList
                itemIds={unlabeledItemIds}
                onClick={(itemId) => { this.setState({ current: itemId }); }}
              />
            </div>
          )}
          {labels.map((label) => {
            const itemIds = [...items.values()]
              .filter(item => itemLabels.get(item.id) === label)
              .map(item => item.id);
            if (itemIds.length > 0) {
              return (
                <Panel
                  header={<span>{label}</span>}
                  key={label}
                  bsStyle={label === uncertainLabel ? 'danger' : 'default'}
                >
                  <div>
                    {label !== uncertainLabel ? null : warning}
                    {itemIds.length === 0 ? null : (
                      <ItemList
                        itemIds={itemIds}
                        onClick={(itemId) => { this.setState({ current: itemId }); }}
                      />
                    )}
                  </div>
                </Panel>
              );
            }
            return null;
          })}
        </div>
      </div>,
    );
  }
}

TestQuestions.propTypes = propTypes;
TestQuestions.defaultProps = defaultProps;

/*
 * react-dnd
 */

const target = {
  drop: (props, monitor) => {
    const itemId = monitor.getItem().id;
    props.onEditTest(itemId, true);
    return { added: itemId };
  },
  canDrop: (props, monitor) => !props.items.has(monitor.getItem().id),
};

const collect = (dndConnect, monitor) => ({
  connectDropTarget: dndConnect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
  // dropResult: monitor.getDropResult() == null ? null : monitor.getDropResult().added,
});

/*
 * react-redux
 */

const mapStateToProps = state => ({
  items: new Map(testItemsSelector(state).map(item => [item.id, item])),
  itemLabels: itemLabelsSelector(state),
  labels: state.labels,
  uncertainLabel: state.uncertainLabel,
  finalLabels: state.finalLabels,
});

const mapDispatchToProps = dispatch => ({
  onEditTest: (itemId, testValue) => {
    dispatch(editItem(itemId, { test: testValue }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget([ItemTypes.ITEM], target, collect)(TestQuestions),
);
