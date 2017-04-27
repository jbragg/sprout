import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ItemThumbContainer } from '../containers/ItemContainer';
import { clusterIdsSelector, unlabeledClusterItemsSelector, getItemsSummary } from '../reducers/index';
import { setClusterId } from '../actions';

const propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  summary: PropTypes.string.isRequired,
  clusterId: PropTypes.number.isRequired,
  nClusters: PropTypes.number.isRequired,
  onSetCluster: PropTypes.func.isRequired,
};

const ClusterItemList = ({ clusterId, nClusters, itemIds, summary, onSetCluster }) => {
  const noDecrement = clusterId === 0;
  const noIncrement = clusterId >= nClusters - 1;
  return (
    <div className="panel panel-default">
      <div className="panel-body">
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
        <div className="btn-group">
          {itemIds.slice(null, 3).map(id => (
            <ItemThumbContainer draggable itemId={id} key={id} />
          ))}
        </div>
      </div>
    </div>
  )
};

ClusterItemList.propTypes = propTypes;

const mapStateToProps = (state) => {
  const itemIds = unlabeledClusterItemsSelector(state);
  return {
    itemIds,
    summary: getItemsSummary(itemIds, state),
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
