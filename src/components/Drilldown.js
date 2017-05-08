import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { ItemLargeContainer } from '../containers/ItemContainer';

const propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    data: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
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
          <ItemLargeContainer
            draggable
            itemId={this.props.item.id}
            onLoad={this.handleImageLoaded}
          />
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
