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
              ? index === tutorialIndex
              : index === taskIndex + nTutorials
            ),
          },
        )}
        style={{
          display: 'inline-block',
          width: `${100 / (nTutorials + nTasks)}%`,
        }}
      >
        <span>{index < nTutorials ? 'Tutorial ' : 'Task '} {index < nTutorials ? index + 1 : index - nTutorials + 1}</span>
      </div>
    ))}
  </div>
);

ExperimentProgress.propTypes = propTypes;
ExperimentProgress.defaultProps = defaultProps;

export default ExperimentProgress;
