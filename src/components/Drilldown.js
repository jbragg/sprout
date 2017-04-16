import React from 'react';
import PropTypes from 'prop-types';
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
      <div className="drilldown-container panel panel-default">
        <div className="panel-body">
          <p>Assign the item to either an existing group or a general label by dragging it.</p>
          <div className={this.state.imageStatus === 'loaded' ? '' : 'hidden'}>
            <ItemLargeContainer
              itemId={this.props.item.id}
              onLoad={this.handleImageLoaded}
            />
          </div>
          {this.state.imageStatus === 'loaded'
              ? null
              : <span className="glyphicon glyphicon-refresh spinning" />
          }
        </div>
      </div>
    );
  }
}

DrillDown.propTypes = propTypes;

export default DrillDown;
