import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ItemList from '../components/ItemList';
import { ItemThumbContainer } from '../containers/ItemContainer';
import { getUnlabeledItemIds, scoreItem } from '../reducers';

const propTypes = {
  primaryItemId: PropTypes.number.isRequired,
  similarItemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
};

const SimilarItemList = ({ primaryItemId, similarItemIds, unreviewedItemIds }) => (
  <div className="panel panel-default">
    <div className="panel-heading">
      Unclassified
    </div>
    <div className="panel-body">
      <div className="row">
        <div className="col-sm-3">
          <div>
            <strong>Next</strong>
          </div>
          <div className="btn-group">
            <ItemThumbContainer itemId={primaryItemId} />
          </div>
        </div>
        <div className="col-sm-9">
          <div>
            <strong>Similar</strong>
          </div>
          <div className="btn-group">
            {similarItemIds.slice(null, 3).map(id => (
              <ItemThumbContainer itemId={id} key={id} />
            ))}
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div>
            <strong>All</strong>
          </div>
          <ItemList itemIds={unreviewedItemIds} />
        </div>
      </div>
    </div>
  </div>
);

SimilarItemList.propTypes = propTypes;

const mapStateToProps = state => ({
  primaryItemId: state.primaryItemId,
  similarItemIds: state.similarItemIds,
  unreviewedItemIds: getUnlabeledItemIds(state).sort((id1, id2) => (
    (state.colorUnreviewedBy === 'confusion' ? -1 : 1) *  // Descending order for confusion
    (scoreItem(state, id1) - scoreItem(state, id2)))),
});

export default connect(mapStateToProps)(SimilarItemList);
