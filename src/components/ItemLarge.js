import React from 'react';
import PropTypes from 'prop-types';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { PanelGroup, Image } from 'react-bootstrap';
import AnswersTable from './AnswersTable';
import ConfusionsTable from './ConfusionsTable';
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
  aggregateOnly: PropTypes.bool,
  answerKey: PropTypes.objectOf(PropTypes.string.isRequired).isRequired,
};

const defaultProps = ({
  connectDragPreview: x => x,
  connectDragSource: x => x,
  isDragging: false,
  useReasons: true,
  useAnswers: true,
  aggregateOnly: true,
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
      useAnswers, answerKey, aggregateOnly,
    } = this.props;
    return connectDragSource(
      <div
        className="item-large"
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <Image responsive thumbnail src={item.data.path} onLoad={onLoad} />
        <PanelGroup>
          {useAnswers
              ? <AnswersSummary answers={answers} answerKey={answerKey} />
              : null
          }
          {useReasons && aggregateOnly
              ? <ConfusionsTable answers={answers} />
              : null
          }
          {useAnswers && !aggregateOnly
              ? <AnswersTable useReasons={useReasons} answers={answers} />
              : null
          }
        </PanelGroup>
      </div>,
    );
  }
}

ItemLarge.propTypes = propTypes;
ItemLarge.defaultProps = defaultProps;

export default ItemLarge;
