<script>
import merge from 'lodash/merge';
import { gray200 } from '../../../../scss_to_js/scss_variables'; // eslint-disable-line import/no-unresolved
import defaultChartOptions, {
  dataZoomAdjustments,
  mergeSeriesToOptions,
} from '../../../utils/charts/config';
import { colorFromDefaultPalette } from '../../../utils/charts/theme';
import { debounceByAnimationFrame } from '../../../utils/utils';
import ToolboxMixin from '../../mixins/toolbox_mixin';
import TooltipDefaultFormat from '../../shared_components/charts/tooltip_default_format.vue';
import Chart from '../chart/chart.vue';
import ChartTooltip from '../tooltip/tooltip.vue';

export default {
  components: {
    Chart,
    ChartTooltip,
    TooltipDefaultFormat,
  },
  mixins: [ToolboxMixin],
  inheritAttrs: false,
  props: {
    data: {
      type: Array,
      required: true,
    },
    option: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    yAxisTitle: {
      type: String,
      required: true,
    },
    xAxisTitle: {
      type: String,
      required: true,
    },
    symbolSize: {
      type: Number,
      required: false,
      default: 8,
    },
    formatTooltipText: {
      type: Function,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      chart: null,
      showTooltip: false,
      tooltipTitle: '',
      tooltipContent: {},
      tooltipPosition: {
        left: '0',
        top: '0',
      },
      debouncedShowHideTooltip: debounceByAnimationFrame(this.showHideTooltip),
      selectedFormatTooltipText: this.formatTooltipText || this.defaultFormatTooltipText,
    };
  },
  computed: {
    series() {
      return this.data.map((series, index) => {
        const defaultColor = colorFromDefaultPalette(index);
        const getColor = (type) =>
          series[type] && series[type].color ? series[type].color : defaultColor;

        return merge(
          {
            symbolSize: this.symbolSize,
            lineStyle: {
              color: getColor('lineStyle'),
            },
            itemStyle: {
              color: getColor('itemStyle'),
            },
          },
          series
        );
      });
    },
    options() {
      const mergedOptions = merge(
        {},
        defaultChartOptions,
        {
          tooltip: {
            formatter: this.onLabelChange,
          },
          xAxis: {
            type: 'category',
            name: this.xAxisTitle,
            axisTick: {
              alignWithLabel: true,
              show: true,
              lineStyle: {
                color: gray200,
              },
            },
            axisLabel: {
              margin: 20,
              verticalAlign: 'bottom',
            },
          },
          yAxis: {
            type: 'value',
            name: this.yAxisTitle,
          },
          legend: {
            show: false,
          },
        },
        this.option,
        dataZoomAdjustments(this.option.dataZoom),
        this.toolboxAdjustments
      );
      // All chart options can be merged but series
      // needs to be handled specially
      return mergeSeriesToOptions(mergedOptions, this.series);
    },
  },
  methods: {
    defaultFormatTooltipText(params) {
      const { data } = params;
      const [title, content] = data;
      this.tooltipTitle = title;
      const seriesName = this.yAxisTitle;
      const tooltipContent = {
        [seriesName]: {
          value: content,
          color: '',
        },
      };
      this.$set(this, 'tooltipContent', tooltipContent);
    },
    showHideTooltip(mouseEvent) {
      this.showTooltip = this.chart.containPixel('grid', [mouseEvent.zrX, mouseEvent.zrY]);
    },
    onCreated(chart) {
      chart.getDom().addEventListener('mousemove', this.debouncedShowHideTooltip);
      chart.getDom().addEventListener('mouseout', this.debouncedShowHideTooltip);
      this.chart = chart;
      this.$emit('created', chart);
    },
    onLabelChange(params) {
      this.selectedFormatTooltipText(params);

      const { data = [] } = params;

      if (data.length) {
        const [left, top] = this.chart.convertToPixel('grid', data);

        this.tooltipPosition = {
          left: `${left}px`,
          top: `${top}px`,
        };
      }
    },
  },
};
</script>
<template>
  <div class="position-relative">
    <chart v-bind="$attrs" :options="options" v-on="$listeners" @created="onCreated" />
    <chart-tooltip
      v-if="chart"
      :show="showTooltip"
      :chart="chart"
      :top="tooltipPosition.top"
      :left="tooltipPosition.left"
    >
      <template #title>
        <slot name="tooltip-title">{{ tooltipTitle }} ({{ xAxisTitle }})</slot>
      </template>

      <slot name="tooltip-content">
        <tooltip-default-format :tooltip-content="tooltipContent" />
      </slot>
    </chart-tooltip>
  </div>
</template>
