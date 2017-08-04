import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import ItemGroup from '../components/ItemGroup';
import { itemsByInstruction, itemsNoInstruction } from '../reducers/entities';
import { itemAnswerScoresSelector } from '../reducers/index';

const propTypes = {
  instructionsToItems: ImmutablePropTypes.mapOf(
    ImmutablePropTypes.mapOf(
      PropTypes.number.isRequired,
      PropTypes.number.isRequired,
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

const InstructionsSuggestionsColumn = ({
  instructionsToItems, otherItems, itemScores,
}) => (
  <div className="label-section">
    {
      [...instructionsToItems
        .sortBy(values => (-1000 * values.size)
          + (100 * [...values.keys()]
            .map(id => Math.abs(0.5 - itemScores.get(id)))
            .reduce((acc, v) => acc + v, 0)
          )
          + (-1 * [...values.keys()]
            .map(id => itemScores.get(id))
            .reduce((acc, v) => acc + v, 0)
          ),
        )
        .entries(),
      ].map(([key, values]) => (
        <ItemGroup
          key={key}
          itemIds={[...values.sortBy(
            (count, id) => (
              (-1000 * count)
              + (100 * Math.abs(0.5 - itemScores.get(id)))
              + (-1 * itemScores.get(id))
            )).keys(),
          ]}
          summary={key}
          draggable={false}
          lessPadding={false}
        />
      ))
    }
    <ItemGroup
      itemIds={[...otherItems.sortBy(id => (
        (100 * Math.abs(0.5 - itemScores.get(id))) + (-1 * itemScores.get(id))),
      )]}
      draggable={false}
      lessPadding={false}
    />
  </div>
);

InstructionsSuggestionsColumn.propTypes = propTypes;

const mapStateToProps = state => ({
  instructionsToItems: itemsByInstruction(state),
  otherItems: itemsNoInstruction(state),
  itemScores: itemAnswerScoresSelector(state),
});

export default connect(mapStateToProps)(InstructionsSuggestionsColumn);
