import React from 'react';
import PropTypes from 'prop-types';
import {
  Panel, FormGroup, ControlLabel, OverlayTrigger, Popover,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { ItemLargeContainer } from './ItemContainer';
import ReasonFormControl from './ReasonFormControl';

const propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  editReason: PropTypes.bool,
};

const defaultProps = {
  editReason: false,
};

class DrillDown extends React.Component {
  constructor(props) {
    super(props);
    this.state = { imageStatus: 'loading' };

    this.handleImageLoaded = this.handleImageLoaded.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.item.id !== this.props.item.id) {
      this.setState({ imageStatus: 'loading' });
    }
  }

  handleImageLoaded() {
    this.setState({ imageStatus: 'loaded' });
  }

  render() {
    const { imageStatus } = this.state;
    const { editReason, item } = this.props;
    const itemContainer = (
      <ItemLargeContainer
        draggable
        itemId={item.id}
        onLoad={this.handleImageLoaded}
      />
    );
    return (
      <Panel>
        <div className={imageStatus === 'loaded' ? '' : 'hidden'}>
          {editReason
            ? (
              <div>
                <FormGroup>
                  {itemContainer}
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Reason</ControlLabel>
                  <ReasonFormControl itemId={item.id} />
                </FormGroup>
              </div>
            )
            : itemContainer
          }
        </div>
        {imageStatus === 'loaded'
            ? null
            : <h1>Loading <span className="glyphicon glyphicon-refresh spinning" /></h1>
          }
      </Panel>
    );
  }
}

DrillDown.propTypes = propTypes;
DrillDown.defaultProps = defaultProps;

const mapStateToProps = state => ({
  item: state.entities.items.byId.get(state.currentItemId),
});

export default connect(mapStateToProps)(DrillDown);
