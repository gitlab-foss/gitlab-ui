import {
  gray50,
  gray100,
  gray200,
  gray300,
  gray500,
  gray600,
  gray700,
  gray900,
  red500,
  whiteNormal,
  dataVizAqua500,
  dataVizAqua600,
  dataVizAqua700,
  dataVizAqua800,
  dataVizAqua900,
  dataVizAqua950,
  dataVizBlue200,
  dataVizBlue400,
  dataVizBlue500,
  dataVizBlue600,
  dataVizBlue700,
  dataVizBlue800,
  dataVizBlue900,
  dataVizBlue950,
  dataVizGreen500,
  dataVizGreen600,
  dataVizGreen700,
  dataVizGreen800,
  dataVizGreen900,
  dataVizGreen950,
  dataVizMagenta500,
  dataVizMagenta600,
  dataVizMagenta700,
  dataVizMagenta800,
  dataVizMagenta900,
  dataVizMagenta950,
  dataVizOrange500,
  dataVizOrange600,
  dataVizOrange700,
  dataVizOrange800,
  dataVizOrange950,
  dataVizOrange900,
} from '../../../scss_to_js/scss_variables';
import { scrollHandleSvgPath } from '../svgs/svg_paths';
import { hexToRgba } from '../utils';

export const themeName = 'gitlab';

export const heatmapHues = [
  gray100,
  dataVizBlue200,
  dataVizBlue400,
  dataVizBlue600,
  dataVizBlue800,
];

export const gaugeNeutralHues = [gray900, gray500];
export const gaugeSafeHues = [dataVizBlue500, dataVizBlue900];
export const gaugeWarningHue = dataVizOrange500;

/**
 * The default palette is based on the Categorical data palette
 * Categorical data (also known as qualitative or thematic) uses hue to
 * differentiate qualitative data, and lightness to differentiate quantitive data.
 * More info: https://gitlab.com/gitlab-org/gitlab-design/-/issues/719#categorical
 */
export const colorPaletteDefault = [
  dataVizBlue500,
  dataVizOrange600,
  dataVizAqua500,
  dataVizGreen700,
  dataVizMagenta800,
  dataVizBlue700,
  dataVizOrange800,
  dataVizAqua700,
  dataVizGreen900,
  dataVizMagenta950,
  dataVizBlue900,
  dataVizOrange950,
  dataVizAqua900,
  dataVizGreen600,
  dataVizMagenta700,
  dataVizBlue600,
  dataVizOrange700,
  dataVizAqua600,
  dataVizGreen800,
  dataVizMagenta900,
  dataVizBlue800,
  dataVizOrange900,
  dataVizAqua800,
  dataVizGreen950,
  dataVizMagenta500,
  dataVizBlue950,
  dataVizOrange500,
  dataVizAqua950,
  dataVizGreen500,
  dataVizMagenta600,
];
export const colorFromDefaultPalette = (index) =>
  colorPaletteDefault[index % colorPaletteDefault.length];

const axes = {
  axisLabel: {
    margin: 8,
    show: true,
    color: gray600,
    hideOverlap: true,
  },
  axisLine: {
    show: false,
  },
  axisPointer: {
    lineStyle: {
      type: 'solid',
      color: gray600,
    },
    label: {
      show: false,
    },
  },
  axisTick: {
    show: true,
    alignWithLabel: true,
    lineStyle: {
      color: gray200,
    },
  },
  nameGap: 30,
  nameTextStyle: {
    fontStyle: 'bold',
  },
  splitLine: {
    lineStyle: {
      color: [gray200],
    },
  },
  splitArea: {
    show: false,
    areaStyle: {
      color: [hexToRgba(whiteNormal, 0.3), hexToRgba(gray300, 0.3)],
    },
  },
};

const isLineChartWithoutArea = (options) =>
  Array.isArray(options?.series) &&
  options.series.some((series) => series.type === 'line' && !series.areaStyle);

const createTheme = (options = {}) => ({
  color: colorPaletteDefault,
  backgroundColor: 'transparent',
  textStyle: {
    color: gray900,
  },
  markLine: {
    silent: true,
    symbol: 'none',
    label: {
      show: false,
    },
    lineStyle: {
      color: red500,
      width: 1,
      type: 'dashed',
    },
  },
  markArea: {
    silent: true,
    itemStyle: {
      color: hexToRgba(red500, 0.1),
    },
  },
  dataZoom: {
    borderColor: 'transparent',
    filterMode: 'none',
    brushSelect: false,
    dataBackground: {
      lineStyle: {
        width: 2,
        color: gray200,
        opacity: 1,
      },
      // render unfilled zoom-graph if the series is a line chart without area styles
      // more details: https://gitlab.com/gitlab-org/gitlab-ui/-/merge_requests/2364#note_666637306
      areaStyle: isLineChartWithoutArea(options)
        ? {} // Use empty object instead of null, see https://gitlab.com/gitlab-org/gitlab-ui/-/merge_requests/2185#note_707711029 for more context
        : {
            color: gray50,
            opacity: 1,
          },
    },
    fillerColor: hexToRgba(gray200, 0.23),
    handleIcon: scrollHandleSvgPath,
    handleStyle: {
      borderColor: 'transparent',
      color: gray500,
    },
    handleSize: '50%',
    labelFormatter: () => null,
    textStyle: {
      color: gray600,
    },
  },
  toolbox: {
    top: '-5',
    left: 'center',
    itemSize: 14,
    emphasis: {
      iconStyle: {
        borderWidth: 0,
        color: gray700,
      },
    },
    iconStyle: {
      color: gray200,
      borderWidth: 0,
    },
    itemGap: 8,
    feature: {
      dataZoom: {
        title: {
          zoom: 'Click to zoom in on a portion of the graph',
          back: 'Remove selection',
        },
      },
      restore: {
        title: 'Remove all selections and return chart to default state',
      },
      saveAsImage: {
        title: 'Save chart as an image',
        name: 'graph',
      },
    },
  },
  markPoint: {
    label: {
      normal: {
        textStyle: {
          color: whiteNormal,
        },
      },
      emphasis: {
        textStyle: {
          color: whiteNormal,
        },
      },
    },
  },
  line: {
    itemStyle: {
      normal: {
        borderWidth: 1,
      },
    },
    lineStyle: {
      normal: {
        width: 2,
      },
    },
    symbolSize: '6',
    symbol: 'circle',
    showSymbol: false,
    smooth: false,
  },
  categoryAxis: axes,
  valueAxis: axes,
  logAxis: axes,
  timeAxis: axes,
});

export default createTheme;
