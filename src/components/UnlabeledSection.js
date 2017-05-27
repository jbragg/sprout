import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Panel, Tabs, Tab } from 'react-bootstrap';
import SimilarItemList from '../containers/SimilarItemList';
import ClusterItemList from '../containers/ClusterItemList';
import Progress from '../containers/Progress';

const propTypes = {
  useReasons: PropTypes.bool.isRequired,
}

const UnlabeledSection = ({ useReasons, className }) => (
  <div className={classNames(className, 'unlabeled-items')}>
    <Progress />
    {useReasons
      ? (
        <Tabs defaultActiveKey={0} id="unlabeled-items" mountOnEnter unmountOnExit >
          <Tab tabClassName="items-nav" eventKey={0} title="Items">
            <SimilarItemList similar={useReasons}/>
          </Tab>
          <Tab tabClassName="clusters-nav" eventKey={1} title="Clusters">
            <ClusterItemList />
          </Tab>
        </Tabs>
      )
      : <SimilarItemList similar={useReasons}/>
    }
  </div>
);

UnlabeledSection.propTypes = propTypes;

export default UnlabeledSection;
