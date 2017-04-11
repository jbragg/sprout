import { scaleLinear, scaleLog } from 'd3-scale';

const answerScore = vals => (
  scaleLinear().domain([1, 5]).range([0, 1])(
    vals.reduce((a, b) => a + b, 0) / vals.length)
);

const agreementScore = vals => (
  scaleLinear().domain([0, 2]).range([0, 1])(
    Math.abs(3 - vals.reduce((a, b) => a + b, 0) / vals.length)
  )
);

const confusionScore = vals => (
  scaleLinear().domain([0, 2]).range([1, 0])(
    vals.map(v => Math.abs(3 - v)).reduce((a, b) => a + b, 0) / vals.length)
);

const getScore = color => {
  if (color === 'confusion') {
    return confusionScore;
  } else if (color === 'agreement') {
    return agreementScore;
  }
  return answerScore;
};

export default getScore;
