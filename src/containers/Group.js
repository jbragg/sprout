import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Row, Col, FormControl, Glyphicon } from 'react-bootstrap';
import { DragSource, DropTarget } from 'react-dnd';
import ItemList from '../components/ItemList';
import { editGroup, mergeGroup, assignAndSetCurrentItem } from '../actions';
import { recommendedGroupSelector, getItemsSummary } from '../reducers/index';
import { DragItemTypes as ItemTypes } from '../constants';
import conditions from '../experiment';

const propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  onGroupEdit: PropTypes.func.isRequired,
  summary: PropTypes.string.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func.isRequired,
  recommended: PropTypes.bool.isRequired,
  isDragging: PropTypes.bool.isRequired,
  currentItemId: PropTypes.number,
  useReasons: PropTypes.bool,
  monitorItemId: PropTypes.number,
};

const defaultProps = {
  currentItemId: null,
  useReasons: true,
  monitorItemId: null,
};

class Group extends React.Component {
  constructor(props) {
    super(props);
    this.state = { recommended: props.recommended };
  }

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }

  componentWillReceiveProps(nextProps) {
    /**
     * Need to remove css class before reapplying to ensure animation works.
     */
    const { currentItemId, group } = this.props;
    if (nextProps.currentItemId !== currentItemId || nextProps.group.itemIds.size !== group.itemIds.size) {
      this.setState({ recommended: false }, () => {
        setTimeout(() => this.setState({ recommended: nextProps.recommended }), 0);
      });
    }
  }

  render() {
    const {
      group, connectDropTarget, connectDragSource, isOver, canDrop,
      isDragging, summary, useReasons, monitorItemId, onGroupEdit,
    } = this.props;
    const recommended = this.state.recommended && useReasons;
    // canDrop is not sufficient here because a group should catch but
    // ignore its own items to prevent the parent label from handling.
    const isTarget = canDrop && !group.itemIds.has(monitorItemId);
    return connectDragSource(connectDropTarget(
      <div
        className={`class-container panel panel-primary ${recommended ? 'recommended' : ''} ${isOver ? 'over' : ''} ${isTarget ? 'target' : ''}`}
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div
          className="panel-heading panel-heading-less-padding"
        >
          <Row className="no-gutter">
            <Col xs={2}>
              {recommended
                ? (
                  <Glyphicon
                    className={`large ${(isOver && canDrop) ? 'text-primary' : ''}`}
                    glyph="star"
                    style={{
                      color: (isOver && canDrop) ? '' : 'yellow',
                    }}
                  />
                )
                : null
              }
            </Col>
            <Col xs={8}>
              <FormControl
                type="text"
                bsSize="sm"
                value={group.name}
                onChange={(e) => { onGroupEdit({ name: e.target.value }); }}
              />
            </Col>
            <Col className="text-right" xs={2}>
              <Glyphicon className="large" glyph="move" />
            </Col>
          </Row>
        </div>
        <div className="panel-body">
          {useReasons ? <p>{summary}</p> : null}
          <ItemList itemIds={[...group.itemIds.values()]} />
        </div>
      </div>,
    ));
  }
}

Group.propTypes = propTypes;
Group.defaultProps = defaultProps;

/*
 * react-dnd
 */

const groupSource = {
  beginDrag: props => ({
    id: props.groupId,
    itemIds: [...props.group.itemIds.keys()],
  }),
};

const collectSource = (dndConnect, monitor) => ({
  connectDragSource: dndConnect.dragSource(),
  connectDragPreview: dndConnect.dragPreview(),
  isDragging: monitor.isDragging(),
});

const groupTarget = {
  drop: (props, monitor) => {
    if (monitor.getItemType() === ItemTypes.ITEM) {
      if (!props.group.itemIds.has(monitor.getItem().id)) {
        /* This check is here instead of in canDrop() so a group handles
         * (by ignoring but still catching)
         * drop events of its own items rather than the parent label.
         */
        props.onAssign([monitor.getItem().id]);
      }
    } else if (monitor.getItemType() === ItemTypes.GROUP) {
      const id = monitor.getItem().id;
      if (props.confirmMerge == null) {
        props.onGroupMergeIn(id);
      } else {
        props.confirmMerge(() => props.onGroupMergeIn(id));
      }
    } else {  // ItemTypes.CLUSTER
      const ids = monitor.getItem().ids;
      if (props.confirmMerge == null) {
        props.onAssign(ids);
      } else {
        props.confirmMerge(() => props.onAssign(ids));
      }
    }
  },
  canDrop: (props, monitor) => {
    switch (monitor.getItemType()) {
      case ItemTypes.GROUP: {
        return props.groupId !== monitor.getItem().id;
      }
      default: {
        return true;
      }
    }
  },
};

const collectTarget = (dndConnect, monitor) => ({
  connectDropTarget: dndConnect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
  monitorItemId: monitor.getItem() == null ? null : monitor.getItem().id,
});

/*
 * react-redux
 */

const mapStateToProps = (state, { groupId }) => ({
  group: state.entities.groups.byId.get(groupId),
  summary: getItemsSummary([...state.entities.groups.byId.get(groupId).itemIds], state),
  recommended: recommendedGroupSelector(state) === groupId,
  currentItemId: state.currentItemId,
  useReasons: conditions[state.systemVersion].useReasons,
});

const mapDispatchToProps = (dispatch, { groupId }) => ({
  onGroupEdit: (keyValues) => {
    dispatch(editGroup(groupId, keyValues));
  },
  onAssign: (itemIds) => {
    dispatch(assignAndSetCurrentItem(itemIds, { group: groupId }));
  },
  onGroupMergeIn: (sourceGroupId) => {
    dispatch(mergeGroup(sourceGroupId, { group: groupId }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DragSource(ItemTypes.GROUP, groupSource, collectSource)(
    DropTarget(
      [ItemTypes.ITEM, ItemTypes.GROUP, ItemTypes.CLUSTER],
      groupTarget,
      collectTarget,
    )(Group),
  ),
);
