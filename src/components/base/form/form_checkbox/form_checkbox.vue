<script>
import { BFormCheckbox } from 'bootstrap-vue';

export default {
  name: 'GlFormCheckbox',
  components: {
    BFormCheckbox,
  },
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'input',
  },
  methods: {
    change($event) {
      /**
       * Emitted when selected value(s) is changed due to user interaction.
       *
       * @event change
       */
      this.$emit('change', $event);
    },
    input($event) {
      /**
       * Emitted when checked state is changed.
       *
       * @event input
       */
      this.$emit('input', $event);
    },
  },
};
</script>

<template>
  <b-form-checkbox v-bind="$attrs" class="gl-form-checkbox" @change="change" @input="input">
    <!-- @slot The checkbox content to display. -->
    <slot></slot>
    <p v-if="Boolean($scopedSlots.help)" class="help-text">
      <!-- @slot The help text to display. -->
      <slot name="help"></slot>
    </p>
  </b-form-checkbox>
</template>
