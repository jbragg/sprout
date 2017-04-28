import { scaleLinear } from 'd3-scale';

// Average answer value (0 is "Definitely No" 1 is "Definitely Yes")
const answerScore = vals => (
  scaleLinear().domain([1, 5]).range([0, 1])(
    vals.reduce((a, b) => a + b, 0) / vals.length)
);


// Distance of average answer value from 0 or 1
const agreementScore = vals => (
  scaleLinear().domain([0, 2]).range([0, 1])(
    Math.abs(3 - (vals.reduce((a, b) => a + b, 0) / vals.length)),
  )
);

// Confusion: Average distance of each answer from nearest "Definitely No" or "Definitely Yes"
const confusionScore = vals => (
  scaleLinear().domain([0, 2]).range([1, 0])(
    vals.map(v => Math.abs(3 - v)).reduce((a, b) => a + b, 0) / vals.length)
);

const getScore = (metric) => {
  if (metric === 'confusion') {
    return confusionScore;
  } else if (metric === 'agreement') {
    return agreementScore;
  }
  return answerScore;
};

const defaultMetrics = {
  'sort': 'confusion',
  'color': 'answer',
};

export { defaultMetrics as defaults };
export default getScore;
