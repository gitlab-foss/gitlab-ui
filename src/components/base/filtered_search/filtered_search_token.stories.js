import PortalVue from 'portal-vue';
import Vue from 'vue';
import { GlIcon } from '../../../index';
import { provide } from './common_story_options';
import GlFilteredSearchSuggestion from './filtered_search_suggestion.vue';
import readme from './filtered_search_token.md';
import GlFilteredSearchToken from './filtered_search_token.vue';

Vue.use(PortalVue);

const generateProps = ({ active = true } = {}) => ({
  active,
});

// eslint-disable-next-line no-unused-vars
export const Default = (args, { argTypes }) => ({
  components: {
    GlFilteredSearchToken,
    GlFilteredSearchSuggestion,
    GlIcon,
  },
  provide,
  props: ['active'],
  data() {
    return {
      value: { operator: '=', data: 'Yes' },
      config: {
        title: 'Confidential',
      },
    };
  },
  mounted() {
    this.$nextTick(() => {
      document.activeElement.blur();
    });
  },
  template: `
    <div>
      <div> {{ value }} </div>
      <div class="gl-border-1 gl-border-solid gl-border-gray-200">
        <gl-filtered-search-token
          v-model="value"
          class="gl-h-full"
          :config="config"
          :active="active"
        >
          <template #suggestions>
            <gl-filtered-search-suggestion value="Yes"><gl-icon name="eye-slash" :size="16"/> Yes</gl-filtered-search-suggestion>
            <gl-filtered-search-suggestion value="No"><gl-icon name="eye" :size="16"/> No</gl-filtered-search-suggestion>
          </template>
        </gl-filtered-search-token>
      </div>
      <div>
        <portal-target name="portal" class="gl-relative" />
      </div>
    </div>
  `,
});
Default.args = generateProps();

// eslint-disable-next-line no-unused-vars
export const WithCustomOperatorsOptions = (args, { argTypes }) => ({
  components: {
    GlFilteredSearchToken,
    GlFilteredSearchSuggestion,
    GlIcon,
  },
  provide,
  props: ['active'],
  data() {
    return {
      value: { operator: '!', data: 'Yes' },
      config: {
        title: 'Confidential',
        operators: [
          { value: '^', description: 'or' },
          { value: '!', description: 'is not', default: 'true' },
        ],
      },
    };
  },
  mounted() {
    this.$nextTick(() => {
      document.activeElement.blur();
    });
  },
  template: `
    <div>
      <div> {{ value }} </div>
      <div class="gl-border-1 gl-border-solid gl-border-gray-200">
        <gl-filtered-search-token
          v-model="value"
          class="gl-h-full"
          :config="config"
          :active="active"
        >
          <template #suggestions>
            <gl-filtered-search-suggestion value="Yes"><gl-icon name="eye-slash" :size="16"/> Yes</gl-filtered-search-suggestion>
            <gl-filtered-search-suggestion value="No"><gl-icon name="eye" :size="16"/> No</gl-filtered-search-suggestion>
          </template>
        </gl-filtered-search-token>
      </div>
      <div>
        <portal-target name="portal" class="gl-relative" />
      </div>
    </div>
  `,
});
WithCustomOperatorsOptions.args = generateProps();

// eslint-disable-next-line no-unused-vars
export const WithStaticOptions = (args, { argTypes }) => ({
  components: {
    GlFilteredSearchToken,
    GlFilteredSearchSuggestion,
  },
  provide,
  props: ['active'],
  data() {
    return {
      value: { operator: '=', data: 'first' },
      config: {
        title: 'Confidential',
        options: [
          { icon: 'hourglass', title: 'first', value: 'one' },
          { title: 'second-without-icon', value: 'two' },
          { icon: 'issues', title: 'third', value: 'three' },
        ],
      },
    };
  },
  mounted() {
    this.$nextTick(() => {
      document.activeElement.blur();
    });
  },
  template: `
    <div>
      <div> {{ value }} </div>
      <div class="gl-border-1 gl-border-solid gl-border-gray-200">
        <gl-filtered-search-token
          v-model="value"
          class="gl-h-full"
          :config="config"
          :active="active"
        />
      </div>
      <div>
        <portal-target name="portal" class="gl-relative" />
      </div>
    </div>
  `,
});
WithStaticOptions.args = generateProps();

export default {
  title: 'base/filtered-search/token',
  component: GlFilteredSearchToken,
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
};
