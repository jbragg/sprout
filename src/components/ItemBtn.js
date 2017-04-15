import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import getScore from '../score';
import { getColor, getContrastColor } from '../color';

const propTypes = {
  currentItemId: PropTypes.number,
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
};

const defaultProps = {
  currentItemId: null,
}

const ItemBtn = ({ currentItemId, item, answers, onClick, metric }) => {
  const answerValues = answers.map(answer => answer.data.answer);
  const score = getScore(metric)(answerValues);
  const backgroundColor = getColor(metric)(score);
  const textColor = getContrastColor(backgroundColor);
  return (
    <OverlayTrigger
      overlay={<Tooltip id="tooltip">{score}</Tooltip>}
      placement="bottom"
    >
      <button
        className={`item-btn btn btn-default ${currentItemId === item.id ? 'active' : ''}`}
        onClick={(e) => { onClick(); e.preventDefault(); }}
        style={{
          color: textColor,
          backgroundColor,
        }}
      >
        {item.id}
      </button>
    </OverlayTrigger>
  );
};

ItemBtn.propTypes = propTypes;
ItemBtn.defaultProps = defaultProps;

export default ItemBtn;
