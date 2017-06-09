import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { ItemBtnContainer } from '../containers/ItemContainer';

const propTypes = {
  itemIds: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number.isRequired),
    ImmutablePropTypes.orderedSetOf(PropTypes.number.isRequired),
  ]).isRequired,
  onClick: PropTypes.func,
};

const defaultProps = {
  onClick: null,
};

const ItemList = ({ itemIds, onClick }) => (
  <div className="form-group itemlist">
    {[...itemIds].map(itemId => (
      <ItemBtnContainer
        draggable
        itemId={itemId}
        key={itemId}
        onClick={onClick}
      />
    ))}
  </div>
);

ItemList.propTypes = propTypes;
ItemList.defaultProps = defaultProps;

export default ItemList;
