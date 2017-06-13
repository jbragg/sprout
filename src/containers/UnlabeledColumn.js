import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PanelGroup } from 'react-bootstrap';
import { ItemLargeContainer } from '../containers/ItemContainer';
import UnlabeledSection from '../components/UnlabeledSection';
import conditions from '../experiment';

const propTypes = {
  currentItemId: PropTypes.number,
  useReasons: PropTypes.bool,
  master: PropTypes.bool,
};

const defaultProps = {
  currentItemId: null,
  useReasons: true,
  master: false,
};

const UnlabeledColumn = ({ useReasons, currentItemId, master }) => (
  <PanelGroup>
    <UnlabeledSection className="panel" useReasons={useReasons} />
    {currentItemId != null && (
      <ItemLargeContainer
        draggable
        itemId={currentItemId}
        master={master}
      />
    )}
  </PanelGroup>
);

UnlabeledColumn.propTypes = propTypes;
UnlabeledColumn.defaultProps = defaultProps;

const mapStateToProps = state => ({
  currentItemId: state.currentItemId,
  useReasons: conditions[state.systemVersion].useReasons,
});

export default connect(mapStateToProps)(UnlabeledColumn);
