import mean from 'lodash/mean';
import meanBy from 'lodash/meanBy';
import { scaleLinear } from 'd3-scale';

// Average answer value (0 is "Definitely No" 1 is "Definitely Yes")
const answerScore = (...vals) => {
  const score = scaleLinear().domain([1, 5]).range([0, 1])(
    mean(vals));
  const humanScore = scaleLinear().domain([0, 1]).range([-1, 1])(score);
  return {
    color: score,
    human: humanScore,
  };
};


// Distance of average answer value from 0 or 1
const agreementScore = (...vals) => {
  const score = scaleLinear().domain([0, 2]).range([0, 1])(
    Math.abs(3 - (mean(vals))),
  );
  return {
    color: score,
    human: score,
  };
};

// Confusion: Average distance of each answer from nearest "Definitely No" or "Definitely Yes"
const confusionScore = (...vals) => {
  const score = scaleLinear().domain([0, 2]).range([1, 0])(
    meanBy(vals, v => Math.abs(3 - v)));
  return {
    color: score,
    human: score,
  };
};

const getScore = (metric) => {
  if (metric === 'confusion') {
    return confusionScore;
  } else if (metric === 'agreement') {
    return agreementScore;
  }
  return answerScore;
};

const defaultMetrics = {
  sort: 'agreement',
  color: 'answer',
};

export { defaultMetrics as defaults };
export default getScore;
