import React from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { ItemThumbContainer } from './ItemContainer';

const Clusters = ({ clusters, itemToVal }) => (
  <div>
    {[...clusters.entries()].map(([key, items]) => (
      <div key={key}>
        <h2>{`${key} (${itemToVal ? itemToVal([...items][0]) : null})`}</h2>
        {[...items].map(item => <ItemThumbContainer itemId={item.id} key={item.id} />)}
      </div>
    ))}
  </div>
);

const Master = ({ clustersSubgroup, clustersQuery, clusters }) => (
  <div>
    <h1>Subgroup clusters</h1>
    <Clusters clusters={clustersSubgroup} itemToVal={item => item.labelGT} />
    <h1>Query clusters</h1>
    <Clusters clusters={clustersQuery} itemToVal={item => item.labelGT} />
    <h1>Computed clusters</h1>
    <Clusters clusters={clusters} />
  </div>
);

const mapStateToProps = state => ({
  clustersSubgroup: List([...state.entities.itemData.byId.values()])
    .groupBy(item => `${item.subgroup}:${item.cls}`)
    .sortBy(([item]) => item.subgroup),
  clustersQuery: List([...state.entities.itemData.byId.values()])
    .groupBy(item => JSON.stringify(item.data.query))
    .sortBy(([item]) => JSON.stringify(item.data.query)),
  clusters: List([...state.entities.itemData.byId.values()])
    .groupBy(item => item.cluster)
    .sortBy(([item]) => item.cluster),
});

export default connect(mapStateToProps)(Master);
