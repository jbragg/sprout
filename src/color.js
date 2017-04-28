import { interpolateRdYlGn, interpolateReds, interpolateGreens } from 'd3-scale-chromatic';

// from https://24ways.org/2010/calculating-color-contrast/
const getContrastColor = (rgbColor) => {
  const [r, g, b] = rgbColor.split('(')[1].split(')')[0].split(',');
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

const getColor = (metric) => {
  if (metric === 'confusion') {
    return interpolateReds;
  } else if (metric === 'agreement') {
    return interpolateGreens;
  }
  return interpolateRdYlGn;  // color === 'answer'
};

export { getContrastColor, getColor };
