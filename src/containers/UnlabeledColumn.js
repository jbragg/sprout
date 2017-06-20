import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PanelGroup, Panel } from 'react-bootstrap';
import { ItemLargeContainer } from '../containers/ItemContainer';
import UnlabeledSection from '../components/UnlabeledSection';
import conditions from '../experiment';

const propTypes = {
  currentItemId: PropTypes.number,
  useReasons: PropTypes.bool,
  master: PropTypes.bool,
  similarNav: PropTypes.bool.isRequired,
};

const defaultProps = {
  currentItemId: null,
  useReasons: true,
  master: false,
};

const UnlabeledColumn = ({ useReasons, currentItemId, master, similarNav }) => (
  <PanelGroup>
    <UnlabeledSection
      className="panel"
      useReasons={useReasons}
      similarNav={similarNav}
    />
    {currentItemId != null
        ? (
          <ItemLargeContainer
            draggable
            itemId={currentItemId}
            master={master}
          />
        )
        : (
          <Panel><div className="text-center">Select an item to preview it here.</div></Panel>
        )
    }
  </PanelGroup>
);

UnlabeledColumn.propTypes = propTypes;
UnlabeledColumn.defaultProps = defaultProps;

const mapStateToProps = state => ({
  currentItemId: state.currentItemId,
  useReasons: conditions[state.systemVersion].useReasons,
  similarNav: state.similarNav,
});

export default connect(mapStateToProps)(UnlabeledColumn);
