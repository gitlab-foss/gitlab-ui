<script>
import { bannerVariants } from '../../../utils/constants';
import GlButton from '../button/button.vue';
import GlCard from '../card/card.vue';

export default {
  name: 'GlBanner',
  components: {
    GlButton,
    GlCard,
  },
  props: {
    /**
     * Used to set the title of the banner.
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * Text for the submit button.
     */
    buttonText: {
      type: String,
      required: true,
    },
    /**
     * Link for the submit button.
     */
    buttonLink: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The illustration's URL.
     */
    svgPath: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The variant of the banner.
     */
    variant: {
      type: String,
      required: false,
      default: bannerVariants[0],
      validator(value) {
        return bannerVariants.includes(value);
      },
    },
    /**
     * Removes the border for banners embedded in content.
     */
    embedded: {
      type: Boolean,
      required: false,
      default: null,
    },
  },
  computed: {
    isIntroducing() {
      return this.variant === bannerVariants[1];
    },
  },
  methods: {
    handleClose() {
      /**
       * Emitted when the close button is clicked.
       *
       * @event close
       * @type {object}
       */
      this.$emit('close');
    },
    primaryButtonClicked() {
      /**
       * Emitted when the primary action button is clicked.
       *
       * @event primary
       * @type {object}
       */
      this.$emit('primary');
    },
  },
};
</script>

<template>
  <gl-card
    class="gl-px-8 gl-py-6 gl-line-height-20"
    :class="{ 'gl-banner-introduction': isIntroducing, 'gl-border-none!': embedded }"
    body-class="gl-display-flex gl-p-0!"
  >
    <div v-if="svgPath" class="gl-banner-illustration">
      <img :src="svgPath" alt="" role="presentation" />
    </div>
    <div class="gl-banner-content">
      <h1 class="gl-banner-title">{{ title }}</h1>
      <!-- @slot The banner content to display -->
      <slot></slot>
      <gl-button
        variant="confirm"
        category="primary"
        data-testid="gl-banner-primary-button"
        :href="buttonLink"
        @click="primaryButtonClicked"
        >{{ buttonText }}</gl-button
      >
      <!-- @slot The banner actions to display -->
      <slot name="actions"></slot>
    </div>
    <gl-button
      :variant="isIntroducing ? 'confirm' : 'default'"
      category="tertiary"
      size="small"
      icon="close"
      aria-label="Close banner"
      class="gl-banner-close"
      @click="handleClose"
    />
  </gl-card>
</template>
