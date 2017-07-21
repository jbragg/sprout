import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Panel, Button, ButtonGroup, Glyphicon, Clearfix } from 'react-bootstrap';
import { ActionCreators } from 'redux-undo';
import { ItemLargeContainer } from '../containers/ItemContainer';
import {
  currentItemIdSelector, futureItemIdsSelector, pastItemIdsSelector,
} from '../reducers/currentItem';

const propTypes = {
  currentItemId: PropTypes.number,
  master: PropTypes.bool,
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired,
  canUndo: PropTypes.bool.isRequired,
  canRedo: PropTypes.bool.isRequired,
};

const defaultProps = {
  currentItemId: null,
  master: false,
};

const CurrentItemPreview = ({
  currentItemId, master, undo, redo, canUndo, canRedo,
}) => (
  <div className="current-item-preview panel">
    <Clearfix className="item-undo">
      <ButtonGroup>
        <Button disabled={!canUndo} onClick={undo} bsSize="xsmall" >
          <Glyphicon glyph="chevron-left" />
        </Button>
        <Button disabled={!canRedo} onClick={redo} bsSize="xsmall" >
          <Glyphicon glyph="chevron-right" />
        </Button>
      </ButtonGroup>
    </Clearfix>
    {currentItemId != null
        ? (
          <ItemLargeContainer
            draggable
            itemId={currentItemId}
            master={master}
          />
        )
        : (
          <Panel className="item-large">
            <div className="text-center">Select an item to preview it here.</div>
          </Panel>
        )
    }
  </div>
);

CurrentItemPreview.propTypes = propTypes;
CurrentItemPreview.defaultProps = defaultProps;

const mapStateToProps = state => ({
  currentItemId: currentItemIdSelector(state),
  canUndo: pastItemIdsSelector(state).length > 0,
  canRedo: futureItemIdsSelector(state).length > 0,
});

export default connect(
  mapStateToProps,
  {
    undo: ActionCreators.undo,
    redo: ActionCreators.redo,
  },
)(CurrentItemPreview);
