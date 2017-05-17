import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ItemBtnContainer } from './ItemContainer';
import { itemsSelector } from '../reducers/index';

const propTypes = {
  itemId: PropTypes.number.isRequired,
  isItem: PropTypes.bool.isRequired,
  href: PropTypes.string,
  title: PropTypes.string,
};

const defaultProps = {
  href: null,
  title: null,
};

const ItemLink = ({ itemId, isItem, href, children, title }) => (
  isItem
    ? <ItemBtnContainer itemId={itemId} useAnswers={false} />
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

ItemLink.propTypes = propTypes;

const mapStateToProps = (state, { href }) => ({
  isItem: href != null && href.length > 0 && itemsSelector(state).byId.has(Number(href)),
  itemId: Number(href),
});

export default connect(mapStateToProps)(ItemLink);
