import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Panel, OverlayTrigger, Popover } from 'react-bootstrap';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import ItemList from '../components/ItemList';
import RemoveTarget from '../components/RemoveTarget';
import InstructionsModal from './InstructionsModal';
import Alert from '../components/Alert';
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
  itemLabels: ImmutablePropTypes.mapOf(PropTypes.string).isRequired,
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

const errors = {
  tooShort: 'These items are missing explanations.',
  label: 'Labels for these items have changed.',
};

class TestQuestions extends React.Component {
  constructor(props) {
    super(props);
    this.state = { current: null };
    this.setCurrent = this.setCurrent.bind(this);
  }

  setCurrent(id) {
    this.setState({ current: id });
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
      <Alert>
        Label these items {finalLabels.join(' / ')} to include them as test questions.
      </Alert>
    );
    return connectDropTarget(
      <div className={`test-questions panel panel-default ${isOver ? 'over' : ''} ${canDrop ? 'target' : ''}`}>
        <InstructionsModal
          show={this.state.current != null}
          itemId={this.state.current}
          onSubmit={() => { this.setState({ current: null }); }}
        />
        <RemoveTarget
          onDrop={(_, monitor) => { onEditTest(monitor.getItem().id, false); }}
          onCanDrop={(_, monitor) => (
            monitor.getItemType() === ItemTypes.ITEM && items.has(monitor.getItem().id)
          )}
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
                onClick={this.setCurrent}
              />
            </div>
          )}
          {labels.map((label) => {
            const getError = (item) => {
              if (item.reason == null || item.reason.text.length === 0) {
                return 'tooShort';
              } else if (itemLabels.get(item.id) !== item.reason.label) {
                return 'label';
              }
              return null;
            };
            const needsReview = new Map([...items.values()]
              .filter(item => itemLabels.get(item.id) === label)
              .map(item => [
                item.id,
                getError(item),
              ]),
            );
            const itemsByError = {
              tooShort: [...needsReview].filter(([, value]) => value === 'tooShort').map(([id]) => id),
              label: [...needsReview].filter(([, value]) => value === 'label').map(([id]) => id),
            };
            const itemsNoError = [...needsReview]
              .filter(([, value]) => value == null)
              .map(([itemid]) => itemid);
            if (needsReview.size > 0) {
              return (
                <Panel
                  header={<span>{label}</span>}
                  key={label}
                  bsStyle={label === uncertainLabel ? 'danger' : 'default'}
                >
                  <div>
                    {label === uncertainLabel ? warning : null}
                    {label === uncertainLabel
                        ? (
                          <ItemList
                            itemIds={[...needsReview.keys()]}
                            onClick={this.setCurrent}
                          />
                        )
                        : (
                          <div>
                            {itemsNoError.length === 0 ? null : (
                              <ItemList
                                itemIds={itemsNoError}
                                onClick={this.setCurrent}
                              />
                            )}
                            {[...Object.keys(itemsByError)].map(error => (
                              (itemsByError[error].length === 0) ? null : (
                                <div key={error}>
                                  <Alert>
                                    {errors[error]} Edit your explanations for these items by clicking on them.
                                </Alert>
                                  <ItemList
                                    itemIds={itemsByError[error]}
                                    onClick={this.setCurrent}
                                  />
                                </div>
                              )))}
                          </div>
                        )
                    }
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
  labels: state.config.labels,
  uncertainLabel: state.config.uncertainLabel,
  finalLabels: state.config.finalLabels,
});

const mapDispatchToProps = dispatch => ({
  onEditTest: (itemId, testValue) => {
    dispatch(editItem(itemId, { test: testValue }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DropTarget([ItemTypes.ITEM], target, collect)(TestQuestions),
);
