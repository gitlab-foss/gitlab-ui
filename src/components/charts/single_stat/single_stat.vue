<script>
import { badgeVariantOptions, variantCssColorMap } from '../../../utils/constants';
import GlBadge from '../../base/badge/badge.vue';
import GlIcon from '../../base/icon/icon.vue';
import GlAnimatedNumber from '../../utilities/animated_number/animated_number.vue';

export default {
  components: {
    GlIcon,
    GlBadge,
    GlAnimatedNumber,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    unit: {
      type: String,
      required: false,
      default: null,
    },
    variant: {
      type: String,
      required: false,
      default: badgeVariantOptions.muted,
      validator: (variant) => Object.values(badgeVariantOptions).includes(variant),
    },
    titleIcon: {
      type: String,
      required: false,
      default: null,
    },
    metaIcon: {
      type: String,
      required: false,
      default: null,
    },
    metaText: {
      type: String,
      required: false,
      default: null,
    },
    shouldAnimate: {
      type: Boolean,
      required: false,
      default: false,
    },
    animationDecimalPlaces: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      hideUnits: false,
    };
  },
  computed: {
    showMetaIcon() {
      return Boolean(this.metaIcon && !this.metaText);
    },
    showBadge() {
      return Boolean(this.metaText);
    },
    showTitleIcon() {
      return Boolean(this.titleIcon);
    },
    textColor() {
      return variantCssColorMap[this.variant];
    },
    canAnimate() {
      return this.shouldAnimate && !Number.isNaN(Number(this.value));
    },
  },
  methods: {
    setHideUnits(flag) {
      this.hideUnits = flag;
    },
  },
};
</script>

<template>
  <div
    class="gl-single-stat gl-display-flex gl-flex-direction-column gl-p-2"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div class="gl-display-flex gl-align-items-center gl-text-gray-700 gl-mb-2">
      <gl-icon v-if="showTitleIcon" :name="titleIcon" class="gl-mr-2" data-testid="title-icon" />
      <span class="gl-font-base gl-font-weight-normal" data-testid="title-text">{{ title }}</span>
    </div>
    <div class="gl-display-flex gl-align-items-baseline gl-font-weight-bold gl-text-gray-900">
      <span class="gl-font-size-h-display" :class="{ 'gl-mr-2': !unit }" data-testid="displayValue">
        <gl-animated-number
          v-if="canAnimate"
          :number="Number(value)"
          :decimal-places="animationDecimalPlaces"
          @animating="setHideUnits(true)"
          @animated="setHideUnits(false)"
        />
        <span v-else data-testid="non-animated-value">{{ value }}</span></span
      >
      <span
        v-if="unit"
        class="gl-font-sm gl-mr-2 gl-transition-medium gl-opacity-10"
        :class="{ 'gl-opacity-0!': hideUnits }"
        data-testid="unit"
        >{{ unit }}</span
      >
      <gl-icon v-if="showMetaIcon" :class="textColor" :name="metaIcon" data-testid="meta-icon" />
      <gl-badge v-if="showBadge" :variant="variant" :icon="metaIcon" data-testid="meta-badge">{{
        metaText
      }}</gl-badge>
    </div>
  </div>
</template>
