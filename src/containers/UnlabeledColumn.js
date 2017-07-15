import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PanelGroup } from 'react-bootstrap';
import UnlabeledSection from '../components/UnlabeledSection';
import CurrentItemPreview from './CurrentItemPreview';
import conditions from '../experiment';

const propTypes = {
  useReasons: PropTypes.bool,
  master: PropTypes.bool,
  similarNav: PropTypes.bool.isRequired,
};

const defaultProps = {
  useReasons: true,
  master: false,
};

const UnlabeledColumn = ({ useReasons, master, similarNav, clusters }) => (
  <PanelGroup>
    <UnlabeledSection
      className="panel"
      useReasons={useReasons}
      similarNav={similarNav}
      clusters={clusters}
    />
    <CurrentItemPreview
      draggable
      master={master}
    />
  </PanelGroup>
);

UnlabeledColumn.propTypes = propTypes;
UnlabeledColumn.defaultProps = defaultProps;

const mapStateToProps = state => ({
  useReasons: conditions[state.config.systemVersion].useReasons,
  similarNav: state.config.similarNav,
  clusters: state.config.clusters,
});

export default connect(mapStateToProps)(UnlabeledColumn);
