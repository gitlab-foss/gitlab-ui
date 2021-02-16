import castArray from 'lodash/castArray';
import isArray from 'lodash/isArray';
import merge from 'lodash/merge';
import { blue500 } from '../../../scss_to_js/scss_variables'; // eslint-disable-line import/no-unresolved
import Breakpoints from '../breakpoints';
import { columnOptions } from '../constants';
import { areDatesEqual } from '../datetime_utility';
import { engineeringNotation } from '../number_utils';
import { hexToRgba } from '../utils';
import { ANNOTATIONS_SERIES_NAME, arrowSymbol, CHART_TYPE_BAR, CHART_TYPE_LINE } from './constants';

export const defaultAreaOpacity = 0.2;
export const defaultFontSize = 12;
export const defaultHeight = 400;
export const validRenderers = ['canvas', 'svg'];

export const axes = {
  name: 'Value',
  type: 'value',
  nameLocation: 'center',
};

export const xAxis = merge({}, axes, {
  boundaryGap: false,
  splitLine: {
    show: false,
  },
});

export const yAxis = merge({}, axes, {
  nameGap: 50,
  axisLabel: {
    formatter: (num) => engineeringNotation(num, 2),
  },
});

export const grid = {
  top: 16,
  bottom: 44,
  left: 64,
  right: 32,
};

export const gridWithSecondaryYAxis = {
  ...grid,
  right: 64,
};

export const lineStyle = {
  symbol: 'circle',
  type: 'line',
  width: 2,
};

/**
 * Annotations series consists of annotations lines
 * along with markers. Annotations co-exist with data
 * series but have their own virtual coords so that they stay put
 * irrespective of data series extents.
 */
export const annotationsYAxisCoords = {
  min: 0,
  pos: 3, // 3% height of chart's grid
  max: 100,
  show: false,
};

export const symbolSize = 6;

/**
 * These comparison operators are currently in monitoring
 * charts that have alerting related data.
 *
 * {Array} Possible values for greater than
 */
const GREATER_THAN = ['>', '&gt;'];

/**
 * These comparison operators are currently in monitoring
 * charts that have alerting related data.
 *
 * {Array} Possible values for less than
 */
const LESS_THAN = ['<', '&lt;'];

/**
 * All default dataZoom configs will have slider & inside
 * (for reference, see https://gitlab.com/gitlab-org/gitlab-ui/issues/240)
 * Inside is disabled for larger viewports (lg and xl)
 * and is specifically to enable touch zoom for mobile devices
 * @param {Object} options
 */
export const getDataZoomConfig = ({ filterMode = 'none' } = {}) => {
  const disabledBreakpoints = ['lg', 'xl'];
  const disabled = disabledBreakpoints.includes(Breakpoints.getBreakpointSize());
  const minSpan = filterMode === 'none' ? 0.01 : null;

  return {
    grid: {
      bottom: 81,
    },
    xAxis: {
      nameGap: 67,
    },
    dataZoom: [
      {
        type: 'slider',
        bottom: 22,
        filterMode,
        minSpan,
      },
      {
        type: 'inside',
        filterMode,
        minSpan,
        disabled,
      },
    ],
  };
};

// All chart options can be merged but series
// needs to be concatenated.
// Series can be an object for single series or
// an array of objects.
export const mergeSeriesToOptions = (options, series = []) => {
  const { series: optSeries = [] } = options;
  return {
    ...options,
    series: [...castArray(series), ...castArray(optSeries)],
  };
};

/**
 * If an annotation series exists, the chart options should have an
 * array of yAxis settings so that the series can exist in its own
 * coordinate system without interfering with the data series
 *
 * @param {Object} options options to merge annotation series yAxis with
 * @param {Boolean} hasAnnotations if annotation series yAxis should be merged
 * @returns {Object} options
 */
export const mergeAnnotationAxisToOptions = (options, hasAnnotations = false) => ({
  ...options,
  ...(hasAnnotations && { yAxis: [options.yAxis, annotationsYAxisCoords] }),
});

export const dataZoomAdjustments = (dataZoom) => {
  // handle cases where dataZoom is array and object.
  const useSlider = dataZoom && isArray(dataZoom) ? dataZoom.length : Boolean(dataZoom);

  return useSlider ? getDataZoomConfig({ filterMode: 'weakFilter' }) : [];
};

export const getToolboxConfig = ({
  restoreIconPath = '',
  saveImageIconPath = '',
  zoomIconPath = '',
  backIconPath = '',
} = {}) => {
  const toolboxConfig = {
    toolbox: {
      feature: {},
    },
  };

  if (restoreIconPath.length) {
    toolboxConfig.toolbox.feature.restore = {
      icon: restoreIconPath,
    };
  }

  if (saveImageIconPath.length) {
    toolboxConfig.toolbox.feature.saveAsImage = {
      icon: restoreIconPath,
    };
  }

  if (zoomIconPath.length && backIconPath.length) {
    toolboxConfig.toolbox.feature.dataZoom = {
      icon: {
        zoom: zoomIconPath,
        back: backIconPath,
      },
    };
  }

  return toolboxConfig;
};

/**
 * Generate eCharts markArea arrays for thresholds and annotations.
 *
 * This method purposefully has no knowledge of comparison
 * operators used in thresholds as it is not necessary and instead
 * expects explict value bounds
 *
 * Examples:
 * { min: 7, max: 10 } => markArea from 7 to 10
 * { min: 1, max: 7 } => markArea from 1 to 7
 *
 * If min and max are equal it would be markLine and would be
 * generated by `generateMarkLines`
 *
 * @param {Object} threshold Threshold/Annotation object with min and max values
 * @param {String} axis markArea is generated against this axis
 * @returns {Array}
 */
const generateMarkArea = ({ min, max }, axis = 'yAxis') => [{ [axis]: min }, { [axis]: max }];

/**
 * Generate eCharts markLine objects for thresholds and annotations.
 *
 * This method purposefully has no knowledge of comparison
 * operators used in thresholds as it is not necessary and instead
 * expects explict value bounds
 *
 * In order to continue supporting existing thresholds format, min
 * is passed as undefined so the correct markLine object is generated.
 *
 * For annotations, min and max will be the same value.
 *
 * Threshold Examples:
 * { max: 7 } => markLine at 7
 *
 * Annotation Examples:
 * { min: 7, max: 7 } => markLine at 7
 *
 * @param {Object} threshold Threshold/Annotation object with min and max values
 * @param {String} axis markLine is generated against this axis
 * @returns {Object}
 */
const generateMarkLines = ({ min, max }, axis = 'yAxis') => {
  if (min) {
    return { [axis]: min };
  }
  return { [axis]: max };
};

/**
 * Generates markPoints that are placed under the markLines.
 *
 * These are used only in annotation lines. For annotation lines,
 * both min and max are same values so only one is enough to generate
 * the markPoint.
 *
 * @param {Object} annotation object
 * @return {Object}
 */
const generateMarkPoints = ({ min, tooltipData }) => {
  return {
    name: 'annotations',
    xAxis: min,
    yAxis: 0,
    tooltipData,
  };
};

/**
 * Generate set of markAreas and markLines to draw on charts
 * as alert thresholds.
 *
 * Alert thresholds always have a markLine associated with a markArea
 *
 * @param {Array} thresholds Array of alert thresholds
 * @returns {Object} markAreas and markLines
 */
export function getThresholdConfig(thresholds) {
  if (!thresholds.length) {
    return {};
  }

  const data = thresholds.reduce(
    (acc, alert) => {
      const { threshold, operator } = alert;

      if (GREATER_THAN.includes(operator)) {
        acc.areas.push(
          generateMarkArea({
            min: threshold,
            max: Infinity,
          })
        );
      } else if (LESS_THAN.includes(operator)) {
        acc.areas.push(
          generateMarkArea({
            min: Number.NEGATIVE_INFINITY,
            max: threshold,
          })
        );
      }

      acc.lines.push(
        generateMarkLines({
          max: threshold,
        })
      );

      return acc;
    },
    { lines: [], areas: [] }
  );

  return {
    markLine: {
      data: data.lines,
    },
    markArea: {
      data: data.areas,
      zlevel: -1,
    },
  };
}

/**
 * This method is only for testing both markLines and markAreas
 * that are used for annotations.
 *
 * `getAnnotationsConfig` as of %12.10 supports only markLines.
 * But this method can generate lines, points and areas.
 *
 * @param {Array} annotations Array of annotation objects
 * @returns {Object} { areas, lines, points }
 */
export const parseAnnotations = (annotations) =>
  annotations.reduce(
    (acc, annotation) => {
      // because only markLines are supported all cases will
      // satisfy this condition. This is more of a sanity check
      // until markAreas are supported.
      // https://gitlab.com/gitlab-org/gitlab/-/issues/212910
      if (areDatesEqual(annotation.min, annotation.max)) {
        acc.lines.push(generateMarkLines(annotation, 'xAxis'));
        acc.points.push(generateMarkPoints(annotation, 'xAxis'));
        return acc;
      }

      acc.areas.push(generateMarkArea(annotation, 'xAxis'));
      return acc;
    },
    { areas: [], lines: [], points: [] }
  );

/**
 * Generate set of markAreas and markLines to draw on charts
 * as annotations.
 *
 * Annotations as of %12.10 will only be markLines.
 * markAreas are not supported yet. They are generated by
 * `parseAnnotations` but not rendered.
 *
 * @param {Array} annotations Array of annotations
 * @returns {Object} { markLines }
 */
export const getAnnotationsConfig = (annotations) => {
  if (!annotations.length) {
    return {};
  }

  // annotations parsing is moved out so that it can be tested
  // for markLines and markAreas.
  const { lines, points } = parseAnnotations(annotations);

  return {
    markLine: {
      lineStyle: {
        color: blue500,
      },
      silent: true,
      data: lines,
    },
    markPoint: {
      itemStyle: {
        color: blue500,
      },
      symbol: arrowSymbol,
      symbolSize: '8',
      symbolOffset: [0, ' 60%'],
      data: points,
    },
  };
};

/**
 * Given thresholds and annotations options, this method generates
 * an annotation series that co-exists along with the data series.
 *
 * yAxis option is useful in cases where multiple yAxis settings
 * are used in a chart. Currently, all of our charts have single
 * yAxis settings.
 *
 * @param {Object} params Thresholds, annotations and yAxis options
 * @returns {Object} Annotation series
 */
export const generateAnnotationSeries = (annotations, yAxisIndex = 1) => {
  if (!annotations.length) {
    return null;
  }
  return merge(
    {
      name: ANNOTATIONS_SERIES_NAME,
      yAxisIndex,
      type: 'scatter',
      data: [],
    },
    getAnnotationsConfig(annotations)
  );
};

/**
 * This method generates the data series and relevant defaults for a bar chart
 *
 * @param {Object} options
 * @param {string} options.name - xAxis name for the chart
 * @param {string} options.color - color to render the data series
 * @param {Array} options.data - data set to be rendered
 * @param {string} [options.stack] - controls how the stacked charts should render either `stacked` or `tiled`
 * @param {number} [options.yAxisIndex] - specifies the yAxis to use (if there are multiple)
 * @returns {Object} Bar chart series
 */
export const generateBarSeries = ({
  name,
  color,
  data = [],
  stack = columnOptions.stacked,
  yAxisIndex = 0,
}) => ({
  type: CHART_TYPE_BAR,
  name,
  data,
  stack,
  barMaxWidth: '50%',
  yAxisIndex,
  itemStyle: {
    color: hexToRgba(color, 0.2),
    barBorderColor: color,
    barBorderWidth: 1,
  },
  emphasis: {
    itemStyle: {
      color: hexToRgba(color, 0.4),
    },
  },
});

/**
 * This method generates the data series and relevant defaults for a line chart
 *
 * @param {Object} options
 * @param {string} options.name - xAxis name for the chart
 * @param {string} options.color - color to render the data series
 * @param {Array} options.data - data set to be rendered
 * @param {number} [options.yAxisIndex] - specifies the yAxis to use (if there are multiple)
 * @returns {Object} Line chart series
 */
export const generateLineSeries = ({ name, color, data = [], yAxisIndex = 0 }) => ({
  name,
  data,
  type: CHART_TYPE_LINE,
  yAxisIndex,
  lineStyle: { color },
  itemStyle: { color },
});

/**
 * The method works well if tooltip content should be against y-axis values.
 * However, for bar charts, the tooltip should be against x-axis values.
 * This method should be updated to work with all types of visualizations.
 * https://gitlab.com/gitlab-org/gitlab-ui/-/issues/674
 *
 * @param {Object} params series data
 * @param {String} yAxisTitle y-axis title
 * @returns {Object} tooltip title and content
 */
export const getDefaultTooltipContent = (params, yAxisTitle = null) => {
  const seriesDataLength = params.seriesData.length;
  const { xLabels, tooltipContent } = params.seriesData.reduce(
    (acc, chartItem) => {
      const [title, value] = chartItem.value || [];
      // Let's use the y axis title as series name when only one series exists
      // This way, TooltipDefaultFormat will display the y axis title as label
      const seriesName = seriesDataLength === 1 && yAxisTitle ? yAxisTitle : chartItem.seriesName;
      const color = seriesDataLength === 1 ? '' : chartItem.color;
      acc.tooltipContent[seriesName] = {
        value,
        color,
      };
      if (!acc.xLabels.includes(title)) {
        acc.xLabels.push(title);
      }
      return acc;
    },
    {
      xLabels: [],
      tooltipContent: {},
    }
  );

  return { xLabels, tooltipContent };
};

export default {
  grid,
  xAxis,
  yAxis,
};
