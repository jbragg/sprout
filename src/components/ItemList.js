import React from 'react';
import PropTypes from 'prop-types';
import { ItemBtnContainer } from '../containers/ItemContainer';
import getScore from '../score';

const propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
};

const ItemList = ({ itemIds }) => (
  <div className="form-group itemlist">
    {itemIds.map(itemId => (
      <ItemBtnContainer
        itemId={itemId}
        key={itemId}
      />
    ))}
  </div>
);

ItemList.propTypes = propTypes;

export default ItemList;
