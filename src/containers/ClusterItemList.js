import React from 'react';
import PropTypes from 'prop-types';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DragSource } from 'react-dnd';
import { connect } from 'react-redux';
import Slider from 'react-slick';
import { Clearfix, Glyphicon } from 'react-bootstrap';
import { ItemThumbContainer } from '../containers/ItemContainer';
import {
  clusterIdsSelector, unlabeledClusterItemsSelector, clusterItemsSelector,
  getItemsSummary
} from '../reducers/index';
import { setClusterId } from '../actions';
import { defaults, DragItemTypes as ItemTypes } from '../constants';

const propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  summary: PropTypes.string.isRequired,
  clusterId: PropTypes.number.isRequired,
  nClusters: PropTypes.number.isRequired,
  onSetCluster: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func.isRequired,
};

const sliderSettings = {
  ...defaults.sliderSettings,
  responsive: [
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 1600,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 4,
      },
    },
    {
      breakpoint: 10000,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 5,
      },
    },
  ],
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
    } = this.props;
    const noDecrement = clusterId === 0;
    const noIncrement = clusterId >= nClusters - 1;
    return (
      <div className="clusters">
        <Clearfix>
          <div className="pull-right">
            <button
              className={`btn btn-default btn-xs glyphicon glyphicon-arrow-left ${noDecrement ? 'disabled' : ''}`}
              onClick={() => (noDecrement || onSetCluster(clusterId - 1))}
            />
            <button
              className={`btn btn-default btn-xs glyphicon glyphicon-arrow-right ${noIncrement ? 'disabled' : ''}`}
              onClick={() => (noIncrement || onSetCluster(clusterId + 1))}
            />
          </div>
          <strong className="page pull-right">{`${clusterId + 1} / ${nClusters}`}</strong>
        </Clearfix>
        {connectDragSource(
          <div
            className={`panel panel-primary ${itemIds.length === 0 ? 'disabled' : ''}`}
            style={{
              opacity: itemIds.length === 0 ? 0.5 : 1,
            }}
          >
            <div className="panel-heading panel-heading-less-padding text-right">
              <Glyphicon className="large" glyph="move" />
            </div>
            <div className="panel-body">
              <p>{summary}</p>
              {itemIds.length === 0 ? null : (
                <Slider {...sliderSettings}>
                  {itemIds.map(id => (
                    <div key={id}>
                      <ItemThumbContainer draggable itemId={id} />
                    </div>
                ))}
                </Slider>
              )}
            </div>
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
  canDrag: props => props.itemIds.length > 0,
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

const mapDispatchToProps = dispatch => ({
  onSetCluster: (id) => {
    dispatch(setClusterId(id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  DragSource(ItemTypes.CLUSTER, source, collect)(ClusterItemList),
);
