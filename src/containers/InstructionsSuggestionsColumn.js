import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { PanelGroup, Clearfix, Badge } from 'react-bootstrap';
import { connect } from 'react-redux';
import ItemGroup from '../components/ItemGroup';
import InstructionItemGroup from '../containers/InstructionItemGroup';
import {
  itemsNoInstruction, instructionsTree1, instructionsTree2,
  disagreementOrderScore, itemAnswerScoresSelector,
} from '../reducers/index';

const propTypes = {
  instructionsTree: ImmutablePropTypes.mapOf(
    ImmutablePropTypes.mapOf(
      PropTypes.number.isRequired, // Similarity score
      PropTypes.string.isRequired,
    ),
    PropTypes.string.isRequired,
  ).isRequired,
  otherItems: ImmutablePropTypes.iterableOf(
    PropTypes.number.isRequired,
  ).isRequired,
  itemScores: ImmutablePropTypes.mapOf(
    PropTypes.number.isRequired,
    PropTypes.number.isRequired,
  ).isRequired,
};

const defaultProps = {
  collapsible: true,
};

const InstructionsSuggestionsColumn = ({
  otherItems, itemScores, instructionsTree,
}) => (
  <PanelGroup accordion >
    {
      [...instructionsTree.map((similarities, key) => (
        <InstructionItemGroup
          key={key}
          instruction={key}
          eventKey={key}
        >
          {similarities.size > 0 && (
            <div>
              <strong>Related</strong>
              <PanelGroup accordion >
                {
                  [...similarities.map((v, k) => (
                    <InstructionItemGroup
                      similarity={v}
                      key={k}
                      eventKey={k}
                      instruction={k}
                      collapsible
                    />
                  )).values()]
                }
              </PanelGroup>
            </div>
          )}
        </InstructionItemGroup>
      )).values()]
    }
    <ItemGroup
      header={
        <Clearfix>
          Other (Uncategorized)
          <Badge pullRight >{otherItems.size}</Badge>
        </Clearfix>
      }
      eventKey="Uncategorized"
      itemIds={[...otherItems.sortBy(
        id => disagreementOrderScore(itemScores.get(id)),
      )]}
      draggable={false}
      lessPadding
    />
  </PanelGroup>
);

InstructionsSuggestionsColumn.propTypes = propTypes;
InstructionsSuggestionsColumn.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  const hideNested = state.config.hideNestedSuggestions;
  return {
    instructionsTree: hideNested
      ? instructionsTree2(state)
      : instructionsTree1(state),
    otherItems: itemsNoInstruction(state),
    itemScores: itemAnswerScoresSelector(state),
  };
};

export default connect(mapStateToProps)(InstructionsSuggestionsColumn);
