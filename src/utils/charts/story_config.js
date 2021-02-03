import times from 'lodash/times';
import { SERIES_NAME, SERIES_NAME_SHORT } from '../stories_utils';

import {
  marqueeSelectionSvgPath,
  redoSvgPath,
  clearAllSvgPath,
  downloadSvgPath,
} from '../svgs/svg_paths';
import { colorFromDefaultPalette } from './theme';

export const toolbox = {
  feature: {
    dataZoom: {
      icon: {
        zoom: marqueeSelectionSvgPath,
        back: redoSvgPath,
      },
    },
    restore: {
      icon: clearAllSvgPath,
    },
    saveAsImage: {
      icon: downloadSvgPath,
    },
  },
};

/**
 * Generates series data for usage in chart examples
 *
 * @param {Number} amount number of generated series
 * @param {String} nameType type of names - how long they should be
 * @returns {Array} generated series data
 */
export const generateSeriesData = (amount = 10, nameType = SERIES_NAME_SHORT) => {
  const defaultData = [820, 932, 960, 1150, 1290, 1330, 1390];
  const name = SERIES_NAME[nameType];

  return times(amount, (index) => ({
    color: colorFromDefaultPalette(index),
    data: defaultData.map((value) => value * index),
    name: `${name}${index + 1}`,
  }));
};
