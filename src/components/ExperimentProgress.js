import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
  phases: PropTypes.arrayOf(PropTypes.string.isRequired),
  currentIndex: PropTypes.number.isRequired,
};

const defaultProps = {
  phases: ['Tutorial', 'Task 1', 'Task 2', 'Task 3'],
};

const ExperimentProgress = ({ phases, currentIndex }) => (
  <div className="experiment-progress">
    {phases.map((phase, index) => (
      <div
        key={phase}
        className={classNames(
          'text-center',
          { selected: currentIndex === index },
        )}
        style={{
          display: 'inline-block',
          width: `${100 / phases.length}%`,
        }}
      >
        <span>{phase}</span>
      </div>
    ))}
  </div>
);

ExperimentProgress.propTypes = propTypes;
ExperimentProgress.defaultProps = defaultProps;

export default ExperimentProgress;
