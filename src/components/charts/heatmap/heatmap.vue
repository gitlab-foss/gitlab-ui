<!-- eslint-disable vue/multi-word-component-names -->
<script>
import merge from 'lodash/merge';
import { white, gray100 } from '../../../../scss_to_js/scss_variables';
import { getDefaultTooltipContent } from '../../../utils/charts/config';
import { TOOLTIP_LEFT_OFFSET } from '../../../utils/charts/constants';
import { heatmapHues } from '../../../utils/charts/theme';
import { engineeringNotation } from '../../../utils/number_utils';
import { debounceByAnimationFrame } from '../../../utils/utils';
import ToolboxMixin from '../../mixins/toolbox_mixin';
import TooltipDefaultFormat from '../../shared_components/charts/tooltip_default_format.vue';
import Chart from '../chart/chart.vue';
import ChartLegend from '../legend/legend.vue';
import ChartTooltip from '../tooltip/tooltip.vue';

const defaultOptions = {
  visualMap: {
    show: false,
    inRange: {
      color: heatmapHues,
    },
  },
  series: {
    type: 'heatmap',
  },
};

/*
 * The series is an array of arrays containing [x, y, value]
 * x and y are position, value determines the color
 * We want the min and max from value field to make the range of colors
 */
function getRange(series) {
  return series.reduce(
    (acc, curr) => {
      const value = curr[2] || 0;
      if (value < acc.min) acc.min = value;
      if (value > acc.max) acc.max = value;
      return acc;
    },
    { min: 0, max: 0 }
  );
}

export default {
  components: {
    Chart,
    ChartLegend,
    ChartTooltip,
    TooltipDefaultFormat,
  },
  mixins: [ToolboxMixin],
  props: {
    options: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    dataSeries: {
      type: Array,
      required: true,
    },
    xAxisLabels: {
      type: Array,
      required: false,
      default: () => [],
    },
    yAxisLabels: {
      type: Array,
      required: false,
      default: () => [],
    },
    xAxisName: {
      type: String,
      required: false,
      default: '',
    },
    yAxisName: {
      type: String,
      required: false,
      default: '',
    },
    formatTooltipText: {
      type: Function,
      required: false,
      default: null,
    },
    legendAverageText: {
      type: String,
      required: false,
      default: 'Avg',
    },
    legendMaxText: {
      type: String,
      required: false,
      default: 'Max',
    },
    responsive: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      chart: null,
      tooltip: {
        show: false,
        title: '',
        content: {},
        left: '0',
        top: '0',
      },
      debouncedShowHideTooltip: debounceByAnimationFrame(this.showHideTooltip),
      selectedFormatTooltipText: this.formatTooltipText || this.defaultFormatTooltipText,
    };
  },
  computed: {
    computedOptions() {
      const { min, max } = getRange(this.dataSeries);
      return merge(
        {},
        defaultOptions,
        {
          series: {
            data: this.dataSeries,
            z: 2,
          },
          grid: {
            left: '64px',
            right: '32px',
            show: true,
            borderWidth: 0,
            backgroundColor: gray100,
          },
          visualMap: {
            min,
            max,
          },
          xAxis: {
            data: this.xAxisLabels,
            z: 3,
            axisTick: false,
            axisLabel: {
              margin: 2,
            },
            name: this.xAxisName,
            nameGap: 16,
            nameLocation: 'middle',
            nameTextStyle: {
              verticalAlign: 'middle',
            },
            offset: 0,
            splitLine: {
              show: true,
              interval: 0,
              lineStyle: {
                color: white,
                width: 2,
              },
            },
            axisPointer: {
              show: true,
              label: {
                formatter: this.onLabelChange,
              },
            },
          },
          yAxis: {
            data: this.yAxisLabels,
            z: 3,
            type: 'category',
            axisTick: false,
            axisLabel: {
              margin: 8,
            },
            name: this.yAxisName,
            nameLocation: 'center',
            nameGap: 50,
            nameRotate: 90,
            splitLine: {
              show: true,
              interval: 0,
              lineStyle: {
                color: white,
                width: 2,
              },
            },
          },
        },
        this.toolboxAdjustments,
        this.options
      );
    },
    legendStyle() {
      return { paddingLeft: this.computedOptions.grid.left, marginTop: '-32px' };
    },
    compiledOptions() {
      return this.chart ? this.chart.getOption() : null;
    },
    seriesInfo() {
      const { min, max } = getRange(this.dataSeries);
      const step = (max - min) / heatmapHues.length;

      return heatmapHues.map((color, index) => {
        const lowerBound = engineeringNotation(min + step * index);
        const upperBound = engineeringNotation(min + step * (index + 1));

        return {
          name: `${lowerBound} - ${upperBound}`,
          color,
          type: 'solid',
        };
      });
    },
  },
  beforeDestroy() {
    this.chart.getDom().removeEventListener('mousemove', this.debouncedShowHideTooltip);
    this.chart.getDom().removeEventListener('mouseout', this.debouncedShowHideTooltip);
  },
  methods: {
    defaultFormatTooltipText(params) {
      const { xLabels, tooltipContent } = getDefaultTooltipContent(
        params,
        this.computedOptions.yAxis.name
      );

      this.$set(this.tooltip, 'content', tooltipContent);
      this.tooltip.title = xLabels.join(', ');
    },
    onCreated(chart) {
      chart.getDom().addEventListener('mousemove', this.debouncedShowHideTooltip);
      chart.getDom().addEventListener('mouseout', this.debouncedShowHideTooltip);
      this.chart = chart;
      this.$emit('created', chart);
    },
    showHideTooltip(mouseEvent) {
      this.tooltip.show = this.chart.containPixel('grid', [mouseEvent.zrX, mouseEvent.zrY]);
    },
    onLabelChange(params) {
      this.selectedFormatTooltipText(params);
      const { seriesData = [] } = params;
      if (seriesData.length && seriesData[0].value) {
        const { seriesId, value } = seriesData[0];
        const [left, top] = this.chart.convertToPixel({ seriesId }, value);

        this.tooltip = {
          ...this.tooltip,
          left: `${left + TOOLTIP_LEFT_OFFSET}px`,
          top: `${top}px`,
        };
      }
    },
  },
};
</script>

<template>
  <div class="gl-heatmap">
    <chart v-bind="$attrs" :options="computedOptions" @created="onCreated" v-on="$listeners" />
    <chart-tooltip
      v-if="chart"
      :show="tooltip.show"
      :chart="chart"
      :top="tooltip.top"
      :left="tooltip.left"
    >
      <template #title>
        <slot v-if="formatTooltipText" name="tooltip-title"></slot>
        <div v-else>
          {{ tooltip.title }}
          <template v-if="computedOptions.xAxis.name">({{ computedOptions.xAxis.name }})</template>
        </div>
      </template>
      <slot v-if="formatTooltipText" name="tooltip-content"></slot>
      <tooltip-default-format v-else :tooltip-content="tooltip.content" />
    </chart-tooltip>
    <chart-legend
      v-if="compiledOptions"
      :chart="chart"
      :series-info="seriesInfo"
      :style="legendStyle"
      :text-style="compiledOptions.textStyle"
      :max-text="legendMaxText"
      :average-text="legendAverageText"
    />
  </div>
</template>
