import React from 'react';
import PropTypes from 'prop-types';
import { scaleLinear } from 'd3-scale';
import { interpolateRdYlGn, interpolateReds } from 'd3-scale-chromatic';

const answerScore = vals => (
  scaleLinear().domain([1, 5]).range([1, 0])(
    vals.reduce((a, b) => a + b, 0) / vals.length)
);

const confusionScore = vals => (
  1 - (Math.abs(0.5 - answerScore(vals)) * 2)
);

const answerColor = interpolateRdYlGn;
const confusionColor = interpolateReds;

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

const ButtonItem = ({ currentItemId, item, answers, onClick, color }) => (
  <div className="item">
    <button
      className={`btn btn-default btn-block ${currentItemId === item.id ? 'active' : ''}`}
      onClick={onClick}
      style={{
        color: 'white',
        backgroundColor: (color !== 'confusion' ? (x) => confusionColor(
          confusionScore(x)) : (x) => answerColor(answerScore(x)))(answers.map(answer => answer.data.answer)),
      }}
    >
      {item.id}
    </button>
  </div>
);

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
            <td>unclear_reason</td>
            <td>uncertainty_input</td>
            <td>unclear_type</td>
            <td>answer</td>
          </tr>
        </thead>
        <tbody>
          {answers.map(answer => (
            <tr key={answer.assignmentid}>
              <td>{answer.data.unclear_reason}</td>
              <td>{answer.data.uncertainty_input}</td>
              <td>{answer.data.unclear_type}</td>
              <td>{answer.data.answer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Item = ({ currentItemId, item, answers, onClick, version, onLoad }) => {
  switch (version) {
    case 'button': {
      return ButtonItem({ currentItemId, item, answers, onClick });
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
