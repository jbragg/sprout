import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ItemLargeContainer } from './ItemContainer';
import { sortedItemIdsSelector } from '../reducers/index';

const propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
};

const Raw = ({ itemIds }) => (
  <div>
    {itemIds.map(id => (
      <div
        style={{
          maxWidth: '300px',
          display: 'inline-block',
          verticalAlign: 'top',
        }}
        key={id}
      >
        <ItemLargeContainer
          itemId={id}
          aggregateOnly={false}
          draggable
        />
      </div>
    ))}
  </div>
);

Raw.propTypes = propTypes;

const mapStateToProps = state => ({
  itemIds: sortedItemIdsSelector(state),
});

export default connect(mapStateToProps)(Raw);
