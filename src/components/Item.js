import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { interpolateRdYlGn, interpolateReds, interpolateGreens } from 'd3-scale-chromatic';
import getScore from '../score';

// from https://24ways.org/2010/calculating-color-contrast/
const getContrastColor = (rgbColor) => {
  const [r, g, b] = rgbColor.split('(')[1].split(')')[0].split(',');
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

const getColor = (color) => {
  if (color === 'confusion') {
    return interpolateReds;
  } else if (color === 'agreement') {
    return interpolateGreens;
  }
  return interpolateRdYlGn;  // color === 'answer'
};

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
  version: PropTypes.string.isRequired,
};

const ButtonItem = ({ currentItemId, item, answers, onClick, color }) => {
  const answerValues = answers.map(answer => answer.data.answer);
  const score = getScore(color)(answerValues);
  const backgroundColor = getColor(color)(score);
  const textColor = getContrastColor(backgroundColor);
  return (
    <OverlayTrigger
      overlay={<Tooltip id="tooltip">{score}</Tooltip>}
      placement="bottom"
    >
      <div className="item">
        <button
          className={`btn btn-default btn-block ${currentItemId === item.id ? 'active' : ''}`}
          onClick={onClick}
          style={{
            color: textColor,
            backgroundColor,
          }}
        >
          {item.id}
        </button>
      </div>
    </OverlayTrigger>
  );
};

const LargeItem = ({ item, answers, onLoad }) => (
  <div className="item-large">
    <div className="panel panel-default panel-body">
      <img
        className="img-responsive"
        src={item.data.path}
        onLoad={onLoad}
      />
      <table className="table table-condensed">
        <thead>
          <tr>
            <td />
            <td>Answer</td>
            <td>Reason</td>
          </tr>
        </thead>
        <tbody>
          {answers
              .sort((a, b) => a.data.answer - b.data.answer)
              .map(answer => (
                <tr key={answer.assignmentid}>
                  <td><span className="glyphicon glyphicon-user" /></td>
                  <td>
                    <OverlayTrigger
                      overlay={<Tooltip id="tooltip">{answer.data.answerString}</Tooltip>}
                      placement="bottom"
                    >
                      <div>
                        <span>{answer.data.answer}</span>
                      </div>
                    </OverlayTrigger>
                  </td>
                  <td>{answer.data.unclearReasonString}</td>
                </tr>
              ))
          }
        </tbody>
      </table>
  </div>
</div>
);

const Item = ({ currentItemId, item, answers, onClick, version, onLoad, color }) => {
  switch (version) {
    case 'button': {
      return ButtonItem({ currentItemId, item, answers, onClick, color });
    }
    case 'drilldown': {
      return LargeItem({ item, answers, onLoad });
    }
    default: {
      return null;
    }
  }
};

Item.propTypes = propTypes;

export default Item;
