import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PanelGroup } from 'react-bootstrap';
import UnlabeledSection from '../components/UnlabeledSection';
import CurrentItemPreview from './CurrentItemPreview';

const propTypes = {
  useReasons: PropTypes.bool,
  master: PropTypes.bool,
  similarNav: PropTypes.bool.isRequired,
  clusters: PropTypes.bool,
};

const defaultProps = {
  useReasons: true,
  master: false,
  clusters: false,
};

const UnlabeledColumn = ({ useReasons, master, similarNav, clusters }) => (
  <PanelGroup>
    <CurrentItemPreview
      draggable
      master={master}
    />
    <UnlabeledSection
      useReasons={useReasons}
      similarNav={similarNav}
      clusters={clusters}
    />
  </PanelGroup>
);

UnlabeledColumn.propTypes = propTypes;
UnlabeledColumn.defaultProps = defaultProps;

const mapStateToProps = state => ({
  useReasons: state.config.useReasons,
  similarNav: state.config.similarNav,
  clusters: state.config.clusters,
});

export default connect(mapStateToProps)(UnlabeledColumn);
