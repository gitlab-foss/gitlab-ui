<script>
import { GlTooltipDirective } from '../../../directives/tooltip';
import { getDayDifference, getDateInPast, getDateInFuture } from '../../../utils/datetime_utility';
import GlDatepicker from '../datepicker/datepicker.vue';
import GlIcon from '../icon/icon.vue';

export default {
  components: {
    GlDatepicker,
    GlIcon,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  props: {
    fromLabel: {
      type: String,
      required: false,
      default: 'From',
    },
    toLabel: {
      type: String,
      required: false,
      default: 'To',
    },
    value: {
      type: Object,
      required: false,
      default: null,
    },
    i18n: {
      type: Object,
      required: false,
      default: null,
    },
    defaultMinDate: {
      type: Date,
      required: false,
      default: null,
    },
    defaultMaxDate: {
      type: Date,
      required: false,
      default: null,
    },
    defaultStartDate: {
      type: Date,
      required: false,
      default: null,
    },
    defaultEndDate: {
      type: Date,
      required: false,
      default: null,
    },
    maxDateRange: {
      type: Number,
      required: false,
      default: 0,
    },
    startPickerClass: {
      type: String,
      required: false,
      default: '',
    },
    startPickerTarget: {
      type: String,
      required: false,
      default: '',
    },
    startPickerContainer: {
      type: String,
      required: false,
      default: '',
    },
    endPickerClass: {
      type: String,
      required: false,
      default: '',
    },
    endPickerTarget: {
      type: String,
      required: false,
      default: '',
    },
    endPickerContainer: {
      type: String,
      required: false,
      default: '',
    },
    labelClass: {
      type: String,
      required: false,
      default: '',
    },
    theme: {
      type: String,
      required: false,
      default: '',
    },
    sameDaySelection: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * If provided, renders an info icon with a tooltip.
     */
    tooltip: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * Additional class(es) to apply to the date range indicator section.
     */
    dateRangeIndicatorClass: {
      type: [String, Object, Array],
      required: false,
      default: '',
    },
  },
  data() {
    return {
      fromCalendarMaxDate: this.defaultMaxDate ? getDateInPast(this.defaultMaxDate, 1) : null,
      startDate: this.defaultStartDate,
      endDate: this.defaultEndDate,
      openToCalendar: false,
    };
  },
  computed: {
    effectiveMaxDateRange() {
      return this.sameDaySelection ? this.maxDateRange - 1 : this.maxDateRange;
    },
    toCalendarMinDate() {
      if (!this.startDate) return null;

      return this.sameDaySelection ? this.startDate : getDateInFuture(this.startDate, 1);
    },
    toCalendarMaxDate() {
      if (!this.startDate || !this.maxDateRange) return this.defaultMaxDate;

      const computedMaxEndDate = getDateInFuture(this.startDate, this.effectiveMaxDateRange);
      return new Date(Math.min(computedMaxEndDate, this.defaultMaxDate));
    },
    dateRangeViolation() {
      return this.startDate >= this.endDate || this.exceedsDateRange;
    },
    exceedsDateRange() {
      if (this.numberOfDays < 0) {
        return false;
      }
      return this.maxDateRange && this.numberOfDays > this.maxDateRange;
    },
    toCalendarDefaultDate() {
      return this.endDate || this.toCalendarMinDate;
    },
    numericStartTime() {
      return this.startDate ? this.startDate.getTime() : null;
    },
    numberOfDays() {
      if (!this.startDate || !this.endDate) {
        return -1;
      }
      const numberOfDays = getDayDifference(this.startDate, this.endDate);
      return this.sameDaySelection ? numberOfDays + 1 : numberOfDays;
    },
  },
  watch: {
    value(val) {
      const { startDate, endDate } = val;
      this.startDate = startDate;
      this.endDate = endDate;
    },
  },
  methods: {
    onStartDateSelected(startDate) {
      this.startDate = startDate;

      if (this.dateRangeViolation) {
        this.openToCalendar = true;
        this.endDate = null;
      } else this.$emit('input', { startDate, endDate: this.endDate });
    },
    onEndDateSelected(endDate) {
      this.openToCalendar = false;
      this.endDate = endDate;
      /**
       * Emitted when start or end date selected with {startDate, endDate} value
       *
       * @event input
       * */
      this.$emit('input', { startDate: this.startDate, endDate });
    },
    onStartPickerOpen() {
      /**
       * Emitted when the primary action button is clicked.
       *
       * @event start-picker-open
       * */
      this.$emit('start-picker-open');
    },
    onStartPickerClose() {
      /**
       * Emitted when the start date datepicker is hidden.
       *
       * @event start-picker-close
       * */
      this.$emit('start-picker-close');
    },
    onEndPickerOpen() {
      /**
       * Emitted when the end date datepicker becomes visible.
       *
       * @event end-picker-open
       * */
      this.$emit('end-picker-open');
    },
    onEndPickerClose() {
      /**
       * Emitted when the end date datepicker is hidden.
       *
       * @event end-picker-close
       * */
      this.$emit('end-picker-close');
    },
  },
};
</script>

<template>
  <div class="gl-daterange-picker">
    <div :class="startPickerClass">
      <label :class="labelClass">{{ fromLabel }}</label>

      <gl-datepicker
        v-model="startDate"
        :min-date="defaultMinDate"
        :max-date="fromCalendarMaxDate"
        :start-range="defaultMinDate"
        :end-range="fromCalendarMaxDate"
        :theme="theme"
        :i18n="i18n"
        :target="startPickerTarget"
        :container="startPickerContainer"
        @input="onStartDateSelected"
        @open="onStartPickerOpen"
        @close="onStartPickerClose"
      />
    </div>
    <div :class="endPickerClass">
      <label :class="labelClass">{{ toLabel }}</label>
      <gl-datepicker
        :key="numericStartTime"
        v-model="endDate"
        :min-date="toCalendarMinDate"
        :max-date="toCalendarMaxDate"
        :start-range="toCalendarMinDate"
        :end-range="toCalendarMaxDate"
        :theme="theme"
        :i18n="i18n"
        :target="endPickerTarget"
        :container="endPickerContainer"
        :start-opened="openToCalendar"
        :default-date="toCalendarDefaultDate"
        @input="onEndDateSelected"
        @open="onEndPickerOpen"
        @close="onEndPickerClose"
      />
    </div>
    <div
      :class="dateRangeIndicatorClass"
      data-testid="daterange-picker-indicator"
      class="gl-display-flex gl-flex-direction-row gl-align-items-center gl-text-gray-500 gl-ml-2"
    >
      <!-- @slot Content to display for days selected. The value is -1 when no date range is selected.-->
      <slot v-bind="{ daysSelected: numberOfDays }"></slot>
      <gl-icon
        v-if="tooltip"
        v-gl-tooltip
        name="information-o"
        :title="tooltip"
        :size="16"
        class="gl-ml-2"
      />
    </div>
  </div>
</template>
