<!-- eslint-disable vue/multi-word-component-names -->
<script>
import { BTable } from 'bootstrap-vue';
import { logWarning, isDev } from '../../../utils/utils';
import { tableFullSlots, tableFullProps, glTableLiteWarning } from './constants';

const shouldUseFullTable = ({ $attrs, $scopedSlots }) => {
  return (
    tableFullProps.some((prop) => $attrs[prop] !== undefined) ||
    tableFullSlots.some((slot) => $scopedSlots[slot] !== undefined)
  );
};

export default {
  components: {
    BTable,
  },
  inheritAttrs: false,
  mounted() {
    // logWarning will call isDev before logging any message
    // this additional call to isDev is being made to exit the condition early when run in production
    if (isDev() && !shouldUseFullTable(this)) {
      logWarning(glTableLiteWarning);
    }
  },
};
</script>

<template>
  <b-table class="gl-table" v-bind="$attrs" v-on="$listeners">
    <template v-for="slot in Object.keys($scopedSlots)" #[slot]="scope">
      <slot :name="slot" v-bind="scope"></slot>
    </template>
  </b-table>
</template>
