import React from 'react';
import PropTypes from 'prop-types';

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
        className="text-center"
        style={{
          display: 'inline-block',
          width: `${100 / phases.length}%`,
          outline: '2px solid white',
          backgroundColor: currentIndex === index ? '#21618C' : '#EBF5FB',
          color: currentIndex === index ? 'white' : '#ABB2B9',
          marginBottom: '10px',
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
