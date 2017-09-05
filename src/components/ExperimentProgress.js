import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
  tutorialIndex: PropTypes.number,
  taskIndex: PropTypes.number,
  nTutorials: PropTypes.number.isRequired,
  nTasks: PropTypes.number.isRequired,
};

const defaultProps = {
  tutorialIndex: null,
  taskIndex: null,
};

const ExperimentProgress = ({
  tutorialIndex, taskIndex, nTutorials, nTasks,
}) => (
  <div className="experiment-progress">
    {Array(nTutorials + nTasks).fill().map((_, index) => (
      <div
        key={index}
        className={classNames(
          'text-center',
          {
            selected: (tutorialIndex != null
              ? index % 2 === 0 && Math.floor(index / 2) === tutorialIndex
              : index % 2 === 1 && Math.floor(index / 2) === taskIndex
            ),
          },
        )}
        style={{
          display: 'inline-block',
          width: `${100 / (nTutorials + nTasks)}%`,
        }}
      >
        <span>{index % 2 === 0 ? 'Practice' : 'Task '} {Math.floor(index / 2) + 1}</span>
      </div>
    ))}
  </div>
);

ExperimentProgress.propTypes = propTypes;
ExperimentProgress.defaultProps = defaultProps;

export default ExperimentProgress;
