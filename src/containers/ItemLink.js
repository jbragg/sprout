import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { ItemBtnContainer } from './ItemContainer';
import { itemsSelector } from '../reducers/index';

const propTypes = {
  itemIds: ImmutablePropTypes.mapOf(
    PropTypes.any,
    PropTypes.number.isRequired,
  ).isRequired,
  href: PropTypes.string,
  title: PropTypes.string,
};

const defaultProps = {
  href: null,
  title: null,
};

const ItemLink = ({ itemIds, href, children, title }) => {
  const id = Number(href);
  return (href != null && href.length > 0 && itemIds.has(id)
    ? <ItemBtnContainer itemId={id} useAnswers={false} />
    : (
      <a
        href={href}
        title={title}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  );
};

ItemLink.propTypes = propTypes;
ItemLink.defaultProps = defaultProps;

const mapStateToProps = state => ({
  itemIds: itemsSelector(state).byId,
});

export default connect(mapStateToProps)(ItemLink);
