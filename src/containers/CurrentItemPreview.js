import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Panel } from 'react-bootstrap';
import { ItemLargeContainer } from '../containers/ItemContainer';

const propTypes = {
  currentItemId: PropTypes.number,
  master: PropTypes.bool,
};

const defaultProps = {
  currentItemId: null,
  master: false,
};

const CurrentItemPreview = ({ currentItemId, master }) => (
  currentItemId != null
    ? (
      <ItemLargeContainer
        draggable
        itemId={currentItemId}
        master={master}
      />
    )
    : (
      <Panel><div className="text-center">Select an item to preview it here.</div></Panel>
    )
);

CurrentItemPreview.propTypes = propTypes;
CurrentItemPreview.defaultProps = defaultProps;

const mapStateToProps = state => ({
  currentItemId: state.currentItem.currentItemId,
});

export default connect(mapStateToProps)(CurrentItemPreview);
