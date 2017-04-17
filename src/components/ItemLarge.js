import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { getEmptyImage } from 'react-dnd-html5-backend';

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
};

const defaultProps = ({
  connectDragPreview: x => x,
  connectDragSource: x => x,
  isDragging: false,
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
    const { item, answers, onLoad, connectDragSource, isDragging } = this.props;
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
      </div>
    );
  }
}

ItemLarge.propTypes = propTypes;
ItemLarge.defaultProps = defaultProps;

export default ItemLarge;
