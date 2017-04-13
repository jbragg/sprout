import React from 'react';
import PropTypes from 'prop-types';
import { ItemBtnContainer } from '../containers/ItemContainer';
import getScore from '../score';

const propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  metric: PropTypes.string.isRequired,
};

const ItemList = ({ itemIds, metric }) => (
  <div className="form-group itemlist">
    {itemIds.map(itemId => (
      <ItemBtnContainer
        itemId={itemId}
        key={itemId}
        metric={metric}
      />
    ))}
  </div>
);

ItemList.propTypes = propTypes;

export default ItemList;
