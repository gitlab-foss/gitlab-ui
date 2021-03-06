import { GlDatepicker } from '../../../index';
import { disableControls } from '../../../utils/stories_utils';
import { useFakeDate } from '../../../utils/use_fake_date';
import { makeContainer } from '../../../utils/story_decorators/container';
import readme from './datepicker.md';

const defaults = {
  components: { GlDatepicker },
  mixins: [useFakeDate()],
};

const currentYear = 2020;
const defaultDate = new Date(currentYear, 0, 15);
const defaultMinDate = new Date(currentYear, 0, 1);
const defaultMaxDate = new Date(currentYear, 2, 31);

const generateProps = ({ minDate = defaultMinDate, maxDate = defaultMaxDate } = {}) => ({
  minDate,
  maxDate,
});

export const Default = (_args, { argTypes }) => ({
  ...defaults,
  props: Object.keys(argTypes),
  data() {
    return {
      pickerValue: defaultDate,
    };
  },
  template: `<gl-datepicker :max-date="maxDate" :min-date="minDate" :start-opened="true" v-model="pickerValue" />`,
});
Default.args = generateProps();

export const CustomTrigger = (_args, { argTypes }) => ({
  ...defaults,
  props: Object.keys(argTypes),
  data() {
    return {
      pickerValue: null,
    };
  },
  template: `
    <div>
      <div class="dropdown">
        <button type="button" class="dropdown-menu-toggle">
          <span class="dropdown-toggle-text"> Start date: {{value}} </span>
        </button>
      </div>
      <gl-datepicker v-model="pickerValue" target=".dropdown-menu-toggle" :container="null" />
    </div>`,
});
CustomTrigger.args = generateProps();

export const WithClearButton = (_args, { argTypes }) => ({
  ...defaults,
  props: Object.keys(argTypes),
  data() {
    return {
      pickerValue: defaultDate,
    };
  },
  template: `<gl-datepicker showClearButton :max-date="maxDate" :min-date="minDate" v-model="pickerValue" />`,
});
WithClearButton.args = generateProps();

export default {
  title: 'base/datepicker',
  component: GlDatepicker,
  decorators: [makeContainer({ height: '280px' })],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    ...disableControls([
      'target',
      'container',
      'value',
      'startRange',
      'endRange',
      'disableDayFn',
      'firstDay',
      'ariaLabel',
      'placeholder',
      'autocomplete',
      'disabled',
      'displayField',
      'startOpened',
      'defaultDate',
      'i18n',
      'theme',
      'showClearButton',
      'inputId',
      'inputLabel',
      'inputName',
    ]),
    minDate: {
      control: 'date',
    },
    maxDate: {
      control: 'date',
    },
  },
};
