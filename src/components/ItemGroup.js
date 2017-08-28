import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col, FormControl, Glyphicon, Panel } from 'react-bootstrap';
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
  draggableItems: PropTypes.bool,
  draggable: PropTypes.bool,
  lessPadding: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  collapsible: PropTypes.bool,
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
  draggableItems: true,
  draggable: true,
  lessPadding: true,
  children: null,
  collapsible: false,
};

const ItemGroup = ({
  itemIds, summary, isOver, isTarget, recommended, draggable, lessPadding,
  isNameable, name, nameEditFunc, isDragging, thumbnails, draggableItems,
  collapsible, children, header, ...rest
}) => (
  <Panel
    className={classNames(
      'class-container item-group',
      {
        recommended,
        over: isOver,
        target: isTarget,
        dragging: isDragging,
        'less-padding': lessPadding,
      },
    )}
    collapsible={collapsible}
    {...rest}
    header={
      header ||
      <div>
        <Row className="no-gutter">
          <Col xs={2}>
            {recommended && (
              <Glyphicon
                className="large"
                glyph="star"
              />
            )}
          </Col>
          <Col xs={8}>
            {isNameable
              ? (
                <FormControl
                  type="text"
                  bsSize="sm"
                  value={name}
                  onChange={nameEditFunc}
                />
              )
              : <span>{name}</span>
            }
          </Col>
          <Col className="text-right" xs={2}>
            {draggable && <Glyphicon className="large" glyph="move" />}
          </Col>
        </Row>
      </div>
    }
  >
    {summary && <p>{summary}</p>}
    <ItemList
      itemIds={itemIds}
      thumbnails={thumbnails}
      draggable={draggableItems}
    />
    {children}
  </Panel>
);

ItemGroup.propTypes = propTypes;
ItemGroup.defaultProps = defaultProps;

export default ItemGroup;
