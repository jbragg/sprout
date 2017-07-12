import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col, FormControl, Glyphicon } from 'react-bootstrap';
import ItemList from './ItemList';

const propTypes = {
  itemIds: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number.isRequired),
    ImmutablePropTypes.orderedSetOf(PropTypes.number.isRequired),
  ]).isRequired,
  summary: PropTypes.string,
  thumbnails: PropTypes.bool,
  recommended: PropTypes.bool,
  isOver: PropTypes.bool,
  isTarget: PropTypes.bool,
  isDragging: PropTypes.bool,
  isNameable: PropTypes.bool,
  name: PropTypes.string,
  nameEditFunc: PropTypes.func,
};

const defaultProps = {
  summary: null,
  thumbnails: false,
  recommended: false,
  isOver: false,
  isTarget: false,
  isDragging: false,
  isNameable: false,
  name: '',
  nameEditFunc: null,
};

const ItemGroup = ({
  itemIds, summary, isOver, isTarget, recommended,
  isNameable, name, nameEditFunc, isDragging, thumbnails,
}) => (
  <div
    className={`class-container item-group panel panel-primary ${recommended ? 'recommended' : ''} ${isOver ? 'over' : ''} ${isTarget ? 'target' : ''}`}
    style={{
      opacity: isDragging ? 0.5 : null,
    }}
  >
    <div
      className="panel-heading panel-heading-less-padding"
    >
      <Row className="no-gutter">
        <Col xs={2}>
          {recommended
            ? (
              <Glyphicon
                className="large"
                glyph="star"
                style={{ color: 'yellow' }}
              />
            )
            : null
          }
        </Col>
        <Col xs={8}>
          {isNameable && (
            <FormControl
              type="text"
              bsSize="sm"
              value={name}
              onChange={nameEditFunc}
            />
          )}
        </Col>
        <Col className="text-right" xs={2}>
          <Glyphicon className="large" glyph="move" />
        </Col>
      </Row>
    </div>
    <div className="panel-body">
      {summary && <p>{summary}</p>}
      <ItemList itemIds={itemIds} thumbnails={thumbnails} />
    </div>
  </div>
);

ItemGroup.propTypes = propTypes;
ItemGroup.defaultProps = defaultProps;

export default ItemGroup;
