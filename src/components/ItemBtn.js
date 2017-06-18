import React from 'react';
import PropTypes from 'prop-types';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { getColor, getContrastColor } from '../color';
import getScore, { defaults as defaultMetrics } from '../score';
import { ItemThumbContainer } from '../containers/ItemContainer';

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
    id: PropTypes.number }).isRequired,
  metric: PropTypes.string,
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  isDragging: PropTypes.bool,
  useAnswers: PropTypes.bool,
};

const defaultProps = ({
  connectDragSource: x => x,
  connectDragPreview: x => x,
  isDragging: false,
  metric: defaultMetrics.color,
  useAnswers: true,
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
      selected, item, answers, onClick, metric,
      connectDragSource, isDragging, useAnswers,
    } = this.props;
    const answerValues = answers.map(answer => answer.data.answer);
    const scores = answerValues.length > 0
      ? getScore(metric)(...answerValues)
      : null;
    const backgroundColor = useAnswers && scores != null
      ? getColor(metric)(scores.color)
      : '';
    const textColor = useAnswers && scores != null
      ? getContrastColor(backgroundColor)
      : '';
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
              border: selected ? `2px ${textColor} solid` : '',
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
