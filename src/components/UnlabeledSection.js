import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import UnreviewedItemList from '../containers/UnreviewedItemList';
import SimilarItemList from '../containers/SimilarItemList';
import ClusterItemList from '../containers/ClusterItemList';

const propTypes = {
  useReasons: PropTypes.bool.isRequired,
  similarItemList: PropTypes.bool,
  unreviewedItemList: PropTypes.bool,
  className: PropTypes.string,
};

const defaultProps = {
  similarItemList: false,
  unreviewedItemList: true,
  className: null,
};

const UnlabeledSection = ({ useReasons, className, similarItemList, unreviewedItemList }) => (
  <div className={classNames(className, 'unlabeled-items')}>
    <div className="items-nav">
      {similarItemList && <SimilarItemList similar={useReasons} />}
      {unreviewedItemList && <UnreviewedItemList thumbnails />}
    </div>
    {useReasons && (
      <div className="clusters-nav">
        <ClusterItemList />
      </div>
    )}
  </div>
);

UnlabeledSection.propTypes = propTypes;
UnlabeledSection.defaultProps = defaultProps;

export default UnlabeledSection;
