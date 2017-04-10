import React from 'react';
import PropTypes from 'prop-types';
import ItemContainer from '../containers/ItemContainer';
import getScore from '../score';

const propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  metric: PropTypes.string.isRequired,
};

const ItemList = ({ itemIds, metric }) => (
  <div className="form-group itemlist">
    {itemIds.map(itemId => (
      <ItemContainer
        itemId={itemId}
        key={itemId}
        version="button"
        color={metric}
      />
    ))}
  </div>
);

ItemList.propTypes = propTypes;

export default ItemList;
