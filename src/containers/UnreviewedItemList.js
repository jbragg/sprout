import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Checkbox } from 'react-bootstrap';
import ItemList from '../components/ItemList';
import { setCurrentItem, setAutoAdvance } from '../actions';
import {
  unlabeledSortedItemIdsSelector, sortedItemIdsSelector,
} from '../reducers/index';

const propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  thumbnails: PropTypes.bool,
  onSetCurrentItem: PropTypes.func.isRequired,
  currentItemId: PropTypes.number,
  primaryItemId: PropTypes.number,
  autoAdvance: PropTypes.bool.isRequired,
  onSetAutoAdvance: PropTypes.func.isRequired,
};

const defaultProps = {
  thumbnails: true,
  currentItemId: null,
  primaryItemId: null,
};

class UnreviewedItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemInFocus: props.primaryItemId,
      currentClicked: false,
      advanceClicked: false,
    };
    this.handleAutoAdvance = this.handleAutoAdvance.bind(this);
    this.handleGoToCurrent = this.handleGoToCurrent.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentItemId == null) {
      this.setState({ itemInFocus: null });
    }
    this.handleAutoAdvance(this.state, nextProps);
    this.handleGoToCurrent(this.state, nextProps);
  }

  handleAutoAdvance(state = this.state, props = this.props) {
    if (
      props.primaryItemId != null
      && props.primaryItemId !== state.itemInFocus
      && (state.advanceClicked || props.autoAdvance)
    ) {
      if (props.primaryItemId !== props.currentItemId) {
        props.onSetCurrentItem(props.primaryItemId);
      }
      this.setState({
        itemInFocus: props.primaryItemId,
        advanceClicked: false,
      });
    }
  }

  handleGoToCurrent(state = this.state, props = this.props) {
    if (
      props.currentItemId != null
      && props.currentItemId !== state.itemInFocus
      && state.currentClicked
    ) {
      this.setState({
        itemInFocus: props.currentItemId,
        currentClicked: false,
      });
    }
  }

  render() {
    const {
      itemIds, thumbnails, autoAdvance, onSetAutoAdvance, onSetCurrentItem,
    } = this.props;
    return (
      <div>
        <Button
          onClick={() => {
            this.setState(
              { advanceClicked: true, itemInFocus: null },
              () => { onSetCurrentItem(); this.handleAutoAdvance(); },
            );
          }}
        >
          Go to first unlabeled
        </Button>
        {' '}
        <Button
          onClick={() => {
            this.setState(
              { currentClicked: true, itemInFocus: null },

              this.handleGoToCurrent,
            );
          }}
        >
          Go to current
        </Button>
        <Checkbox
          checked={autoAdvance}
          onChange={(e) => { onSetAutoAdvance(e.target.checked); }}
        >
          Automatically advance to first unlabeled
        </Checkbox>
        <ItemList
          itemIds={itemIds}
          thumbnails={thumbnails}
          itemInFocus={this.state.itemInFocus}
        />
      </div>
    );
  }
}

UnreviewedItemList.propTypes = propTypes;
UnreviewedItemList.defaultProps = defaultProps;

const mapStateToProps = (state, { unlabeledOnly }) => ({
  autoAdvance: state.autoAdvance,
  currentItemId: state.currentItemId,
  primaryItemId: state.primaryItemId,
  itemIds: (unlabeledOnly
    ? unlabeledSortedItemIdsSelector(state)
    : sortedItemIdsSelector(state)
  ),
});

const mapDispatchToProps = {
  onSetCurrentItem: setCurrentItem,
  onSetAutoAdvance: setAutoAdvance,
};

export default connect(mapStateToProps, mapDispatchToProps)(UnreviewedItemList);
