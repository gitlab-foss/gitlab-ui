<script>
import { GlTooltipDirective } from '../../../directives/tooltip';
import GlButton from '../../base/button/button.vue';

export default {
  components: {
    GlButton,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  props: {
    title: {
      type: String,
      required: false,
      default: 'Clear',
    },
    tooltipContainer: {
      required: false,
      default: false,
      validator: (value) =>
        value === false || typeof value === 'string' || value instanceof HTMLElement,
    },
  },
};
</script>

<template>
  <gl-button
    v-gl-tooltip.hover="{ container: tooltipContainer }"
    variant="default"
    category="tertiary"
    class="gl-clear-icon-button"
    size="small"
    name="clear"
    icon="clear"
    :title="title"
    :aria-label="title"
    v-on="$listeners"
  />
</template>
