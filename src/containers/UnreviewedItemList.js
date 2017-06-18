import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ItemList from '../components/ItemList';
import {
  unlabeledSortedItemIdsSelector, sortedItemIdsSelector,
} from '../reducers/index';

const propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  thumbnails: PropTypes.bool,
};

const defaultProps = {
  thumbnails: true,
};

const UnreviewedItemList = ({ itemIds, thumbnails }) => (
  <ItemList itemIds={itemIds} thumbnails={thumbnails} />
);

UnreviewedItemList.propTypes = propTypes;
UnreviewedItemList.defaultProps = defaultProps;

const mapStateToProps = (state, { unlabeledOnly }) => ({
  itemIds: (unlabeledOnly
    ? unlabeledSortedItemIdsSelector(state)
    : sortedItemIdsSelector(state)
  ),
});

export default connect(mapStateToProps)(UnreviewedItemList);
