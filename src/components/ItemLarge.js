import React from 'react';
import PropTypes from 'prop-types';
import { getEmptyImage } from 'react-dnd-html5-backend';
import {
  Image, Glyphicon, FormGroup, ControlLabel,
} from 'react-bootstrap';
import AnswersTable from './AnswersTable';
import ConfusionsTable from './ConfusionsTable';
import AnswersSummary from './AnswersSummary';
import ReasonFormControl from '../containers/ReasonFormControl';

const propTypes = {
  answers: PropTypes.array.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
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
  editReason: PropTypes.bool,
};

const defaultProps = ({
  connectDragPreview: x => x,
  connectDragSource: x => x,
  isDragging: false,
  useReasons: true,
  useAnswers: true,
  aggregateOnly: true,
  editReason: false,
});

class ItemLarge extends React.Component {
  constructor(props) {
    super(props);
    this.state = { imageStatus: 'loading' };

    this.handleImageLoaded = this.handleImageLoaded.bind(this);
  }

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.item.id !== this.props.item.id) {
      this.setState({ imageStatus: 'loading' });
    }
  }

  handleImageLoaded() {
    this.setState({ imageStatus: 'loaded' });
  }

  render() {
    const {
      item, answers, connectDragSource, isDragging, useReasons,
      useAnswers, answerKey, aggregateOnly, editReason,
    } = this.props;
    const { imageStatus } = this.state;
    const itemComponent = (
      <div>
        {useAnswers
            ? <AnswersSummary answers={answers} answerKey={answerKey} />
            : null
        }
        {useAnswers && useReasons && aggregateOnly
            ? <ConfusionsTable answers={answers} />
            : null
        }
        {useAnswers && !aggregateOnly
            ? <AnswersTable useReasons={useReasons} answers={answers} />
            : null
        }
        <Image
          responsive
          thumbnail
          src={item.data.path}
          onLoad={this.handleImageLoaded}
        />
      </div>
    );
    return connectDragSource(
      <div
        className="panel panel-default item-large"
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <div className="panel-heading panel-heading-less-padding text-right">
          <Glyphicon className="large" glyph="move" />
        </div>
        <div className="panel-body">
          <div className={imageStatus === 'loaded' ? '' : 'hidden'}>
            {editReason
              ? (
                <div>
                  <FormGroup>
                    {itemComponent}
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Reason</ControlLabel>
                    <ReasonFormControl itemId={item.id} />
                  </FormGroup>
                </div>
              )
              : itemComponent
            }
          </div>
          {imageStatus === 'loaded'
              ? null
              : <h1>Loading <span className="glyphicon glyphicon-refresh spinning" /></h1>
            }
        </div>
      </div>,
    );
  }
}

ItemLarge.propTypes = propTypes;
ItemLarge.defaultProps = defaultProps;

export default ItemLarge;
