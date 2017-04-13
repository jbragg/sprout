import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ItemThumbContainer } from '../containers/ItemContainer';

const propTypes = {
  primaryItemId: PropTypes.number.isRequired,
  similarItemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
};

const SimilarItemList = ({ primaryItemId, similarItemIds }) => (
  <div className="similar-item-list row">
    <div className="col-sm-6 col-md-4 col-lg-3">
      <div className="panel panel-default">
        <div className="panel-heading">
          <span>Unclassified</span>
        </div>
        <div className="panel-body">
          <ItemThumbContainer itemId={primaryItemId} />
        </div>
      </div>
    </div>
    <div className="col-sm-6 col-md-8 col-lg-9">
      <div className="panel panel-default">
        <div className="panel-heading">
          Similar
        </div>
        <div className="panel-body">
          <div className="btn-group">
            {similarItemIds.slice(null, 4).map(id => (
              <ItemThumbContainer itemId={id} key={id} />
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
