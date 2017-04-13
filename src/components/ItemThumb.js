import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  currentItemId: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.shape({
        answer: PropTypes.string.isRequired.isRequired,
        uncertainty: PropTypes.string.isRequired,
        uncertainty_input: PropTypes.string.isRequired,
        unclear_type: PropTypes.string.isRequired,
        unclear_reason: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
  item: PropTypes.shape({
    data: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const ItemThumb = ({ item, onClick }) => (
  <button
    className="item-thumb btn btn-default"
  >
    <img
      className="img-responsive"
      src={item.data.path}
      onClick={onClick}
    />
  </button>
);

ItemThumb.propTypes = propTypes;

export default ItemThumb;
