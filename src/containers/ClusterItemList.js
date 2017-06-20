import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DragSource } from 'react-dnd';
import { connect } from 'react-redux';
import { Clearfix } from 'react-bootstrap';
import ItemGroup from '../components/ItemGroup';
import {
  clusterIdsSelector, unlabeledClusterItemsSelector, clusterItemsSelector,
  getItemsSummary,
} from '../reducers/index';
import { setClusterId } from '../actions';
import { DragItemTypes as ItemTypes } from '../constants';

const propTypes = {
  itemIds: ImmutablePropTypes.orderedSetOf(
    PropTypes.number.isRequired,
  ).isRequired,
  summary: PropTypes.string.isRequired,
  clusterId: PropTypes.number.isRequired,
  nClusters: PropTypes.number.isRequired,
  onSetCluster: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
};

class ClusterItemList extends React.Component {
  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }

  render() {
    const {
      clusterId, nClusters, itemIds, summary, onSetCluster, connectDragSource,
      isDragging,
    } = this.props;
    const noDecrement = clusterId === 0;
    const noIncrement = clusterId >= nClusters - 1;
    return (
      <div className="cluster-item-list">
        <Clearfix>
          <span className="page pull-right">
            <strong>{`${clusterId + 1} / ${nClusters}`}</strong>
            {' '}
            <button
              className={classNames(
                'btn btn-default btn-xs glyphicon glyphicon-arrow-left',
                { disabled: noDecrement },
              )}
              onClick={() => (noDecrement || onSetCluster(clusterId - 1))}
            />
            <button
              className={classNames(
                'btn btn-default btn-xs glyphicon glyphicon-arrow-right',
                { disabled: noIncrement },
              )}
              onClick={() => (noIncrement || onSetCluster(clusterId + 1))}
            />
          </span>
        </Clearfix>
        {connectDragSource(
          <div
            className={classNames({ disabled: itemIds.size === 0 })}
            style={{ opacity: itemIds.size === 0 ? 0.5 : null }}
          >
            <ItemGroup
              itemIds={itemIds}
              summary={summary}
              thumbnails
              isDragging={isDragging}
            />
          </div>,
        )}
      </div>
    );
  }
}

ClusterItemList.propTypes = propTypes;

/*
 * react-dnd
 */

const source = {
  beginDrag: props => ({ ids: props.itemIds }),
  canDrag: props => props.itemIds.size > 0,
};

const collect = (dndConnect, monitor) => ({
  connectDragSource: dndConnect.dragSource(),
  connectDragPreview: dndConnect.dragPreview(),
  isDragging: monitor.isDragging(),
});

/*
 * react-redux
 */

const mapStateToProps = (state) => {
  const itemIds = unlabeledClusterItemsSelector(state);
  const allItemIds = clusterItemsSelector(state);
  return {
    itemIds,
    summary: getItemsSummary(allItemIds, state),
    clusterId: state.clusterId,
    nClusters: Math.max(...[...clusterIdsSelector(state).values()]) + 1,
  };
};

const mapDispatchToProps = {
  onSetCluster: setClusterId,
};

export default connect(mapStateToProps, mapDispatchToProps)(
  DragSource(ItemTypes.CLUSTER, source, collect)(ClusterItemList),
);
