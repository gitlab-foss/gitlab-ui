<!-- eslint-disable vue/multi-word-component-names -->
<script>
import { BCarousel } from 'bootstrap-vue';

export default {
  components: {
    BCarousel,
  },
};
</script>
<template>
  <b-carousel v-bind="$attrs" v-on="$listeners">
    <template v-for="slot in Object.keys($slots)" #[slot]>
      <slot :name="slot"></slot>
    </template>
  </b-carousel>
</template>
