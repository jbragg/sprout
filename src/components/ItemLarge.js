import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { getEmptyImage } from 'react-dnd-html5-backend';
import getScore, { defaults as defaultMetrics } from '../score';

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
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  isDragging: PropTypes.bool,
  useReasons: PropTypes.bool,
  useAnswers: PropTypes.bool,
};

const defaultProps = ({
  connectDragPreview: x => x,
  connectDragSource: x => x,
  isDragging: false,
  useReasons: true,
  useAnswers: true,
});

class ItemLarge extends React.Component {

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }

  render() {
    const { item, answers, onLoad, connectDragSource, isDragging, useReasons, useAnswers } = this.props;
    return connectDragSource(
      <div
        className="item-large"
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="panel panel-default">
          <div className="panel-body">
            <img
              className="img-responsive"
              src={item.data.path}
              onLoad={onLoad}
            />
            { useAnswers
                ? (
                  <table className="table table-condensed">
                    <thead>
                      <tr>
                        <td />
                        <td>Answer</td>
                        {useReasons ? <td>Reason</td> : null}
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
                              <span>{getScore(defaultMetrics.color)(answer.data.answer).human}</span>
                            </div>
                          </OverlayTrigger>
                        </td>
                        { useReasons ? <td>{answer.data.unclearReasonString}</td> : null}
                      </tr>
                    ))
                }
                    </tbody>
                  </table>
                )
                : null
            }
          </div>
        </div>
      </div>,
    );
  }
}

ItemLarge.propTypes = propTypes;
ItemLarge.defaultProps = defaultProps;

export default ItemLarge;
