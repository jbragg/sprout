import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import { getEmptyImage } from 'react-dnd-html5-backend';
import {
  Image, Glyphicon, Row, Col, ListGroup, ListGroupItem, OverlayTrigger,
  Popover,
} from 'react-bootstrap';
import Lightbox from 'react-image-lightbox';
import AnswersTable from '../components/AnswersTable';
import ConfusionsTable from '../components/ConfusionsTable';
import AnswersSummary from '../components/AnswersSummary';
import ExplanationTips from '../components/ExplanationTips';
import ReasonFormControl from './ReasonFormControl';
import AnswerFormControl from './AnswerFormControl';
import ItemList from '../components/ItemList';
import Loading from '../components/Loading';
import {
  recommendedGroupSelector, itemSimilaritiesSelector,
} from '../reducers/index';

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
  confusionsTable: PropTypes.bool,
  answersTable: PropTypes.bool,
  answersSummary: PropTypes.bool,
  answerKey: PropTypes.objectOf(PropTypes.string.isRequired).isRequired,
  editReason: PropTypes.bool,
  draggable: PropTypes.bool,
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
  confusionsTable: false,
  answersTable: true,
  answersSummary: false,
  editReason: false,
  draggable: false,
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
      useAnswers, answerKey, editReason, draggable,
      recommendedGroup, master, lightboxOpen, onSetLightbox,
      similarItems, itemSimilarities, textColor, backgroundColor, zoomable,
      answersSummary, confusionsTable, answersTable,
    } = this.props;
    const { imageStatus } = this.state;
    const itemComponent = (
      <ListGroup>
        {useAnswers && answersSummary && (
          <ListGroupItem>
            <AnswersSummary answers={answers} answerKey={answerKey} />
          </ListGroupItem>
        )}
        {useAnswers && useReasons && confusionsTable && (
          <ListGroupItem>
            <ConfusionsTable answers={answers} />
          </ListGroupItem>
        )}
        {useAnswers && answersTable && (
          <ListGroupItem>
            <AnswersTable
              useReasons={useReasons}
              answers={answers}
            />
          </ListGroupItem>
        )}
        {editReason && (
          <ListGroupItem className="edit-reason">
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>
                    Your Answer
                  </th>
                  <th>
                    Your explanation
                    {' '}
                    <OverlayTrigger
                      overlay={
                        <Popover id="popover">
                          Tips for explanations:
                          <ExplanationTips />
                        </Popover>
                      }
                      placement="top"
                    >
                      <Glyphicon glyph="question-sign" />
                    </OverlayTrigger>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <AnswerFormControl itemId={item.id} />
                  </td>
                  <td>
                    <ReasonFormControl itemId={item.id} />
                  </td>
                </tr>
              </tbody>
            </table>
          </ListGroupItem>
        )}
        {master && (
          <ListGroupItem>
            <pre>{JSON.stringify(item, null, 2)}</pre>
          </ListGroupItem>
        )}
        <ListGroupItem>
          {imageStatus !== 'loaded' && <h1><Loading /></h1>}
          <Image
            className={classNames(
              'item',
              {
                zoomable,
                hidden: imageStatus !== 'loaded',
              },
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
              { recommended: imageStatus === 'loaded' && recommendedGroup >= 0 && useReasons },
            )}
            style={{
              opacity: isDragging ? 0.5 : null,
            }}
          >
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
                  {draggable && <Glyphicon className="large" glyph="move" />}
                </Col>
              </Row>
            </div>
            <div className="item-details">
              {itemComponent}
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

const mapStateToProps = (state, { itemId }) => ({
  itemSimilarities: itemSimilaritiesSelector(state).get(itemId),
  lightboxOpen: state.lightboxId === itemId,
  recommendedGroup: recommendedGroupSelector(state),
  answerKey: state.config.answerKey,
  editReason: state.config.editReason,
  master: state.config.master,
});

export default connect(mapStateToProps)(ItemLarge);
