import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Badge, Clearfix, Glyphicon } from 'react-bootstrap';
import ItemGroup from '../components/ItemGroup';
import AnswersSummaryDistribution from '../components/AnswersSummaryDistribution';
import {
  itemsByInstruction, itemAnswerScoresSelector,
  disagreementOrderScore, itemAnswersByInstruction,
} from '../reducers/index';
import { editTag } from '../actions';

const propTypes = {
  itemCounts: ImmutablePropTypes.mapOf(
    PropTypes.number.isRequired,
    PropTypes.number.isRequired,
  ).isRequired,
  itemScores: ImmutablePropTypes.mapOf(
    PropTypes.number.isRequired,
    PropTypes.number.isRequired,
  ).isRequired,
  instruction: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  onVisit: PropTypes.func.isRequired,
  visited: PropTypes.bool,
};

const defaultProps = {
  children: null,
  visited: null,
};

/*
 * Badge with number of workers who specified those instructions
 * <Badge pullRight >{(new Set(answers.filter(v => v.data.instructions === instruction).map(v => v.workerid))).size}</Badge>
 */
const InstructionItemGroup = ({
  itemCounts, itemScores, instruction, children, similarity, dispatch,
  onVisit, visited, answers, ...rest
}) => (
  <ItemGroup
    itemIds={[...itemCounts.sortBy(
      (count, id) => (
        disagreementOrderScore(itemScores.get(id))
        // + (-1000 * count)
      )).keys(),
    ]}
    draggable={false}
    lessPadding
    {...rest}
    onEnter={() => onVisit({ id: instruction, visited: true })}
    header={
      <Clearfix>
        <Badge pullRight >{itemCounts.size}</Badge>
        <AnswersSummaryDistribution answers={answers} />
        {visited && <Glyphicon glyph="ok" />}
        <span>{`${instruction}`}</span>
        {similarity && <span> ({similarity} in common)</span>}
      </Clearfix>
    }
  >
    {children}
  </ItemGroup>
);

InstructionItemGroup.propTypes = propTypes;
InstructionItemGroup.defaultProps = defaultProps;

const mapStateToProps = (state, { instruction }) => ({
  itemCounts: itemsByInstruction(state).get(instruction),
  itemScores: itemAnswerScoresSelector(state),
  visited: state.entities.tags.byId.get(instruction) &&
    state.entities.tags.byId.get(instruction).visited,
  answers: itemAnswersByInstruction(state).get(instruction),
  /*
  nYes: answersByInstruction(state)
    .get(instruction)
    .filter(answer => answer.data.instructions_answer === 'Yes')
    .size,
  nTotal: answersByInstruction(state)
    .get(instruction)
    .filter(answer => answer.data.instructions_answer && answer.data.instructions_answer.length > 0)
    .size,
  */
});

const mapDispatchToProps = {
  onVisit: editTag,
};

export default connect(mapStateToProps, mapDispatchToProps)(InstructionItemGroup);
