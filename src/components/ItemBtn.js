import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import getScore from '../score';
import { getColor, getContrastColor } from '../color';

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
  metric: PropTypes.string.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
};

const defaultProps = ({
  connectDragSource: x => x,
  isDragging: false,
});

const ItemBtn = ({ selected, item, answers, onClick, metric, connectDragSource, isDragging }) => {
  const answerValues = answers.map(answer => answer.data.answer);
  const score = getScore(metric)(answerValues);
  const backgroundColor = getColor(metric)(score);
  const textColor = getContrastColor(backgroundColor);
  return connectDragSource(
    <div
      className="item-btn"
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <OverlayTrigger
        overlay={<Tooltip id="tooltip">{score.toFixed(2)}</Tooltip>}
        placement="bottom"
      >
        <button
          className={`item-btn btn btn-default ${selected ? 'active' : ''}`}
          onClick={(e) => { onClick(); e.preventDefault(); }}
          style={{
            color: textColor,
            backgroundColor,
            border: selected ? `2px ${textColor} solid` : '',
          }}
        >
          {item.id}
        </button>
      </OverlayTrigger>
    </div>
  );
};

ItemBtn.propTypes = propTypes;
ItemBtn.defaultProps = defaultProps;

export default ItemBtn;
