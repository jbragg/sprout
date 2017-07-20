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
  clusters: PropTypes.bool,
};

const defaultProps = {
  similarNav: false,
  className: null,
  clusters: false,
};

const UnlabeledSection = ({ useReasons, clusters, className, similarNav }) => (
  <div className={classNames(className, 'unlabeled-items panel panel-default')}>
    <div className="items-nav panel-body">
      {similarNav
          ? <SimilarItemList similar={useReasons} />
          : <UnreviewedItemList thumbnails />
      }
    </div>
    {useReasons && clusters && (
      <div className="clusters-nav">
        <ClusterItemList />
      </div>
    )}
  </div>
);

UnlabeledSection.propTypes = propTypes;
UnlabeledSection.defaultProps = defaultProps;

export default UnlabeledSection;
