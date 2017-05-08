import React from 'react';
import PropTypes from 'prop-types';
import { Panel, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { ItemLargeContainer } from '../containers/ItemContainer';

const propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    data: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onEditItem: PropTypes.func.isRequired,
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
    return (
      <Panel className="drilldown-container">
        <div className={this.state.imageStatus === 'loaded' ? '' : 'hidden'}>
          <FormGroup>
            <ItemLargeContainer
              draggable
              itemId={this.props.item.id}
              onLoad={this.handleImageLoaded}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Reason</ControlLabel>
            <FormControl
              componentClass="textarea"
              rows="5"
              value={this.props.item.reason || ''}
              placeholder="Enter a reason for the label. If you drag this item to the test questions section, the reason will also be shown to workers who answer this question incorrectly."
              onChange={(e) => {
                this.props.onEditItem(
                  this.props.item.id,
                  { reason: e.target.value },
                );
              }}
            />
          </FormGroup>
        </div>
        {this.state.imageStatus === 'loaded'
            ? null
            : <h1>Loading <span className="glyphicon glyphicon-refresh spinning" /></h1>
          }
      </Panel>
    );
  }
}

DrillDown.propTypes = propTypes;

export default DrillDown;
