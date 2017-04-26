import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ItemList from '../components/ItemList';
import { unlabeledSortedItemsSelector } from '../reducers';

const propTypes = {
  unreviewedItemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
};

const UnreviewedItemList = ({ unreviewedItemIds }) => (
  <div className="panel panel-default">
    <div className="panel-body">
      <div>
        <strong>All</strong>
      </div>
      <ItemList itemIds={unreviewedItemIds} />
    </div>
  </div>
);

UnreviewedItemList.propTypes = propTypes;

const mapStateToProps = state => ({
  unreviewedItemIds: unlabeledSortedItemsSelector(state).map(item => item.id),
});

export default connect(mapStateToProps)(UnreviewedItemList);
