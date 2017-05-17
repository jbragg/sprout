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

const Master = ({ clustersGT, clusters }) => (
  <div>
    <h1>Ground truth clusters</h1>
    <Clusters clusters={clustersGT} itemToVal={item => item.labelGT} />
    <h1>Computed clusters</h1>
    <Clusters clusters={clusters} />
  </div>
);

const mapStateToProps = state => ({
  clustersGT: List([...state.entities.items.byId.values()])
    .groupBy(item => item.subgroup)
    .sortBy(([item]) => item.subgroup),
  clusters: List([...state.entities.items.byId.values()])
    .groupBy(item => item.cluster)
    .sortBy(([item]) => item.cluster),
});

export default connect(mapStateToProps)(Master);
