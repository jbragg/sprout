import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Tabs, Tab } from 'react-bootstrap';
import SimilarItemList from '../containers/SimilarItemList';
import ClusterItemList from '../containers/ClusterItemList';
import Progress from '../containers/Progress';

const propTypes = {
  useReasons: PropTypes.bool.isRequired,
}

const UnlabeledSection = ({ useReasons }) => (
  <div className="panel">
    <Progress />
    {useReasons
      ? (
        <Tabs defaultActiveKey={0} id="unlabeled-items" mountOnEnter unmountOnExit >
          <Tab eventKey={0} title="Items">
            <SimilarItemList similar={useReasons}/>
          </Tab>
          <Tab eventKey={1} title="Clusters">
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
