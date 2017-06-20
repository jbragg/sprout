import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import UnreviewedItemList from '../containers/UnreviewedItemList';
import SimilarItemList from '../containers/SimilarItemList';
import ClusterItemList from '../containers/ClusterItemList';

const propTypes = {
  useReasons: PropTypes.bool.isRequired,
  similarNav: PropTypes.bool,
  className: PropTypes.string,
};

const defaultProps = {
  similarNav: false,
  className: null,
};

const UnlabeledSection = ({ useReasons, className, similarNav }) => (
  <div className={classNames(className, 'unlabeled-items')}>
    <div className="items-nav">
      {similarNav
          ? <SimilarItemList similar={useReasons} />
          : <UnreviewedItemList thumbnails />
      }
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
