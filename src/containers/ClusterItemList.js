import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Slider from 'react-slick';
import { ItemThumbContainer } from '../containers/ItemContainer';
import { clusterIdsSelector, unlabeledClusterItemsSelector, clusterItemsSelector, getItemsSummary } from '../reducers/index';
import { setClusterId } from '../actions';
import { defaults } from '../constants';

const propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  summary: PropTypes.string.isRequired,
  clusterId: PropTypes.number.isRequired,
  nClusters: PropTypes.number.isRequired,
  onSetCluster: PropTypes.func.isRequired,
};

const sliderSettings = {
  ...defaults.sliderSettings,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
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

const ClusterItemList = ({ clusterId, nClusters, itemIds, summary, onSetCluster }) => {
  const noDecrement = clusterId === 0;
  const noIncrement = clusterId >= nClusters - 1;
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <div className="clearfix">
          <div className="pull-right">
            <button
              className={`btn btn-default glyphicon glyphicon-arrow-left ${noDecrement ? 'disabled' : ''}`}
              onClick={() => (noDecrement || onSetCluster(clusterId - 1))}
            />
            <button
              className={`btn btn-default glyphicon glyphicon-arrow-right ${noIncrement ? 'disabled' : ''}`}
              onClick={() => (noIncrement || onSetCluster(clusterId + 1))}
            />
          </div>
          <p><strong>Summary: </strong>{summary}</p>
        </div>
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
    </div>
  );
};

ClusterItemList.propTypes = propTypes;

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

export default connect(mapStateToProps, mapDispatchToProps)(ClusterItemList);
