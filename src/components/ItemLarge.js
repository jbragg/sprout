import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const propTypes = {
  onLoad: PropTypes.func.isRequired,
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
};

const ItemLarge = ({ item, answers, onLoad }) => (
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

ItemLarge.propTypes = propTypes;

export default ItemLarge;
