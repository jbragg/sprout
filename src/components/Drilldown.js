import React from 'react';
import PropTypes from 'prop-types';
import {
  Panel, FormGroup, FormControl, ControlLabel, OverlayTrigger, Popover,
} from 'react-bootstrap';
import { ItemLargeContainer } from '../containers/ItemContainer';

const propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    data: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    reason: PropTypes.string,
  }).isRequired,
  onEditItem: PropTypes.func.isRequired,
};

const help = (
  <div>
    <p>If you drag this item to the test questions section, your reason will be shown to test and teach workers. For these items, you should:</p>
    <ol>
      <li>Explain why the label you assigned is correct and possibly why the other label is wrong.</li>
      <li>Refer to your instructions.</li>
      <li><strong>Don&#39;t</strong> refer to other items or external knowledge. You should not assume a worker has completed any other items in the task.</li>
      <li>Use straightforward, simple language.</li>
    </ol>
  </div>
);

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
            <ControlLabel>
              Reason
              {' '}
              <OverlayTrigger
                overlay={
                  <Popover id="popover" title="Help">{help}</Popover>
                }
                placement="top"
              >
                <span className="glyphicon glyphicon-question-sign" />
              </OverlayTrigger>
            </ControlLabel>
            <FormControl
              componentClass="textarea"
              rows="5"
              value={this.props.item.reason || ''}
              placeholder="Enter the reason for your label (optional unless you make the item a test question)"
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
