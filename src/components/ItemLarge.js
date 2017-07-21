import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import { getEmptyImage } from 'react-dnd-html5-backend';
import {
  Image, Glyphicon, FormGroup, ControlLabel, Row, Col,
  ListGroup, ListGroupItem,
} from 'react-bootstrap';
import Lightbox from 'react-image-lightbox';
import AnswersTable from './AnswersTable';
import ConfusionsTable from './ConfusionsTable';
import AnswersSummary from './AnswersSummary';
import ReasonFormControl from '../containers/ReasonFormControl';
import ItemList from './ItemList';
import Loading from './Loading';

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
  similarItems: PropTypes.bool,
  itemSimilarities: ImmutablePropTypes.orderedMapOf(
    PropTypes.number.isRequired,
  ),
  aggregateOnly: PropTypes.bool,
  answerKey: PropTypes.objectOf(PropTypes.string.isRequired).isRequired,
  editReason: PropTypes.bool,
  draggable: PropTypes.bool.isRequired,
  recommendedGroup: PropTypes.number,
  master: PropTypes.bool,
  zoomable: PropTypes.bool,
  lightboxOpen: PropTypes.bool.isRequired,
  onSetLightbox: PropTypes.func.isRequired,
  textColor: PropTypes.string,
  backgroundColor: PropTypes.string,
};

const defaultProps = ({
  connectDragPreview: x => x,
  connectDragSource: x => x,
  isDragging: false,
  useReasons: true,
  useAnswers: true,
  similarItems: true,
  itemSimilarities: null,
  aggregateOnly: true,
  editReason: false,
  recommendedGroup: null,
  master: false,
  zoomable: true,
  textColor: null,
  backgroundColor: null,
});

class ItemLarge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageStatus: 'loading',
    };

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
      useAnswers, answerKey, aggregateOnly, editReason, draggable,
      recommendedGroup, master, lightboxOpen, onSetLightbox,
      similarItems, itemSimilarities, textColor, backgroundColor, zoomable,
    } = this.props;
    const { imageStatus } = this.state;
    const itemComponent = (
      <ListGroup className={imageStatus === 'loaded' ? '' : 'hidden'}>
        {useAnswers && (
          <ListGroupItem>
            <AnswersSummary answers={answers} answerKey={answerKey} />
          </ListGroupItem>
        )}
        {useAnswers && useReasons && aggregateOnly && (
          <ListGroupItem>
            <ConfusionsTable answers={answers} />
          </ListGroupItem>
        )}
        {useAnswers && !aggregateOnly && (
          <ListGroupItem>
            <AnswersTable useReasons={useReasons} answers={answers} />
          </ListGroupItem>
        )}
        {master && (
          <ListGroupItem>
            <pre>{JSON.stringify(item, null, 2)}</pre>
          </ListGroupItem>
        )}
        <ListGroupItem>
          <Image
            className={classNames(
              'item',
              { zoomable },
            )}
            responsive
            src={item.data.path}
            onLoad={this.handleImageLoaded}
            onClick={zoomable && (
              () => { onSetLightbox({ id: item.id }); }
            )}
          />
          {lightboxOpen &&
            <Lightbox
              mainSrc={item.data.path}
              onCloseRequest={() => { onSetLightbox(null); }}
            />
          }
        </ListGroupItem>
      </ListGroup>
    );
    const showSimilarItems = useReasons && similarItems;
    return (
      <div className={classNames({ 'no-similar-items': !showSimilarItems })}>
        {connectDragSource(
          <div
            className={classNames(
              'panel panel-default item-large',
              { recommended: imageStatus === 'loaded' && recommendedGroup >= 0 },
            )}
            style={{
              opacity: isDragging ? 0.5 : null,
            }}
          >
            {draggable && (
              <div
                className="panel-heading panel-heading-less-padding"
                style={{
                  color: textColor,
                  backgroundColor,
                }}
              >
                <Row className="no-gutter">
                  <Col xs={2} />
                  <Col className="text-center panel-title" xs={8}>
                    {item.id}
                  </Col>
                  <Col className="text-right" xs={2}>
                    <Glyphicon className="large" glyph="move" />
                  </Col>
                </Row>
              </div>
            )}
            <div className="item-details">
              {editReason
                ? (
                  <div className={imageStatus === 'loaded' ? '' : 'hidden'}>
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
              {imageStatus !== 'loaded' && <h1><Loading /></h1>}
            </div>
          </div>,
        )}
        {showSimilarItems && (
          <div className="similar-items panel panel-default">
            {itemSimilarities && itemSimilarities.size > 0
                ? (
                  <div className="panel-body">
                    <strong>Similar items</strong>
                    <ItemList itemIds={itemSimilarities} thumbnails />
                  </div>
                )
                : <div className="panel-body text-center">No similar items to show</div>
            }
          </div>
        )}
      </div>
    );
  }
}

ItemLarge.propTypes = propTypes;
ItemLarge.defaultProps = defaultProps;

export default ItemLarge;
