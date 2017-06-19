import React from 'react';
import PropTypes from 'prop-types';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { ItemThumbContainer } from '../containers/ItemContainer';

const propTypes = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number }).isRequired,
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  isDragging: PropTypes.bool,
  textColor: PropTypes.string,
  backgroundColor: PropTypes.string,
};

const defaultProps = ({
  connectDragSource: x => x,
  connectDragPreview: x => x,
  isDragging: false,
  textColor: null,
  backgroundColor: null,
});

class ItemBtn extends React.Component {
  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }

  render() {
    const {
      selected, item, onClick,
      connectDragSource, isDragging, textColor, backgroundColor,
    } = this.props;
    return connectDragSource(
      <span
        className="item-btn"
        style={{
          opacity: isDragging ? 0.5 : null,
        }}
      >
        <OverlayTrigger
          overlay={<Popover id="popover">{<ItemThumbContainer itemId={item.id} />}</Popover>}
          placement="bottom"
        >
          <button
            className={`item-btn btn btn-default ${selected ? 'active' : ''}`}
            onClick={(e) => { onClick(item.id); e.preventDefault(); }}
            style={{
              color: textColor,
              backgroundColor,
              border: selected ? '2px black solid' : null,
            }}
          >
            {item.id}
          </button>
        </OverlayTrigger>
      </span>,
    );
  }
}

ItemBtn.propTypes = propTypes;
ItemBtn.defaultProps = defaultProps;

export default ItemBtn;
