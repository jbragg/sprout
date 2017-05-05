import React from 'react';
import PropTypes from 'prop-types';
import { getEmptyImage } from 'react-dnd-html5-backend';

const propTypes = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.shape({
        answer: PropTypes.string.isRequired.isRequired,
        uncertainty: PropTypes.string.isRequired,
        uncertainty_input: PropTypes.string.isRequired,
        unclear_type: PropTypes.string.isRequired,
        unclear_reason: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
  item: PropTypes.shape({
    data: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func,
  isDragging: PropTypes.bool,
};

const defaultProps = ({
  connectDragPreview: x => x,
  connectDragSource: x => x,
  isDragging: false,
});

class ItemThumb extends React.Component {
  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }

  render() {
    const { item, selected, onClick, connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <button
        className={`item-thumb btn btn-default ${selected ? 'active' : ''}`}
        onClick={(e) => { onClick(); e.preventDefault(); }}
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="text-center small"><small>{item.id}</small></div>
        <img
          className="img-responsive"
          src={item.data.path}
        />
      </button>,
    );
  }
}

ItemThumb.propTypes = propTypes;
ItemThumb.defaultProps = defaultProps;

export default ItemThumb;
