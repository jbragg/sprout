import React from 'react';
import PropTypes from 'prop-types';
import ItemContainer from '../containers/ItemContainer';

const propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
};

const ItemList = ({ itemIds }) => (
  <div className="form-group itemlist">
    {itemIds.map(itemId => (<ItemContainer itemId={itemId} key={itemId} version="button" />))}
  </div>
);

ItemList.propTypes = propTypes;

export default ItemList;
