import React from 'react';
import PropTypes from 'prop-types';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Image } from 'react-bootstrap';
import AnswersTable from './AnswersTable';
import AnswersSummary from './AnswersSummary';

const propTypes = {
  onLoad: PropTypes.func.isRequired,
  answers: PropTypes.array.isRequired,
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
  summaryOnly: PropTypes.bool,
  answerKey: PropTypes.objectOf(PropTypes.string.isRequired).isRequired,
};

const defaultProps = ({
  connectDragPreview: x => x,
  connectDragSource: x => x,
  isDragging: false,
  useReasons: true,
  useAnswers: true,
  summaryOnly: true,
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
    const {
      item, answers, onLoad, connectDragSource, isDragging, useReasons,
      useAnswers, answerKey, summaryOnly,
    } = this.props;
    return connectDragSource(
      <div
        className="item-large"
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <Image responsive thumbnail src={item.data.path} onLoad={onLoad} />
        {useAnswers
          ? <AnswersSummary answers={answers} answerKey={answerKey} />
          : null
        }
        {useAnswers && !summaryOnly
          ? <AnswersTable useReasons={useReasons} answers={answers} />
          : null
        }
      </div>,
    );
  }
}

ItemLarge.propTypes = propTypes;
ItemLarge.defaultProps = defaultProps;

export default ItemLarge;
