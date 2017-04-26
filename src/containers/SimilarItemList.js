import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ItemThumbContainer } from '../containers/ItemContainer';

const propTypes = {
  primaryItemId: PropTypes.number.isRequired,
  similarItemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
};

const SimilarItemList = ({ primaryItemId, similarItemIds }) => (
  <div className="panel panel-default">
    <div className="panel-body">
      <div className="row">
        <div className="col-sm-3">
          <div>
            <strong>Next</strong>
          </div>
          <div className="btn-group">
            <ItemThumbContainer draggable itemId={primaryItemId} />
          </div>
        </div>
        <div className="col-sm-9">
          <div>
            <strong>Similar</strong>
          </div>
          <div className="btn-group">
            {similarItemIds.slice(null, 3).map(id => (
              <ItemThumbContainer draggable itemId={id} key={id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

SimilarItemList.propTypes = propTypes;

const mapStateToProps = state => ({
  primaryItemId: state.primaryItemId,
  similarItemIds: state.similarItemIds,
});

export default connect(mapStateToProps)(SimilarItemList);
