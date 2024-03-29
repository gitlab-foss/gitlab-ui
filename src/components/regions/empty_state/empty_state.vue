<script>
import GlButton from '../../base/button/button.vue';

export default {
  components: {
    GlButton,
  },
  props: {
    /**
     * The title (heading) of the empty state.
     */
    title: {
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
     * The illustration's height used to prevent content reflow.
     */
    svgHeight: {
      type: Number,
      required: false,
      default: null,
    },
    /**
     * The desciption/body text of the empty state.
     */
    description: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The primary GlButton's href.
     */
    primaryButtonLink: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The primary GlButton's text. If falsey, the button is not shown.
     */
    primaryButtonText: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The secondary GlButton's href.
     */
    secondaryButtonLink: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The secondary GlButton's text. If falsey, the button is not shown.
     */
    secondaryButtonText: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Determines whether to render the compact layout.
     */
    compact: {
      type: Boolean,
      required: false,
      default: false,
    },
    invertInDarkMode: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  computed: {
    height() {
      return this.shouldPreventImageReflow ? this.svgHeight : null;
    },
    shouldPreventImageReflow() {
      return Boolean(this.svgHeight);
    },
    shouldRenderPrimaryButton() {
      return Boolean(this.primaryButtonLink && this.primaryButtonText);
    },
    shouldRenderSecondaryButton() {
      return Boolean(this.secondaryButtonLink && this.secondaryButtonText);
    },
  },
};
</script>

<template>
  <section
    class="gl-display-flex"
    :class="{
      'empty-state gl-text-center gl-flex-direction-column': !compact,
      'gl-flex-direction-row': compact,
    }"
  >
    <div
      :class="{ 'gl-display-none gl-sm-display-block gl-px-4': compact, 'gl-max-w-full': !compact }"
    >
      <div v-if="svgPath" :class="{ 'svg-content': !compact }" class="svg-250">
        <img
          :src="svgPath"
          alt=""
          role="img"
          :class="{ 'gl-dark-invert-keep-hue': invertInDarkMode }"
          class="gl-max-w-full"
          :height="height"
        />
      </div>
    </div>
    <div :class="compact ? 'gl-flex-grow-1 gl-flex-basis-0 gl-px-4' : 'gl-max-w-full gl-m-auto'">
      <div class="gl-mx-auto gl-my-0" :class="{ 'gl-p-5': !compact }">
        <!--
            @slot Use this slot to customize the empty state's title area.
            Overrides the `title` prop.
          -->
        <slot ref="title" name="title">
          <h1 class="gl-font-size-h-display gl-line-height-36" :class="compact ? 'h5' : 'h4'">
            {{ title }}
          </h1>
        </slot>
        <p v-if="description || $scopedSlots.description" ref="description" class="gl-mt-3">
          <!--
            @slot Use this slot to customize the empty state's description
            area. Overrides the `description` prop.
          -->
          <slot name="description">
            {{ description }}
          </slot>
        </p>
        <div
          class="gl-display-flex gl-flex-wrap"
          :class="{ 'gl-justify-content-center': !compact }"
        >
          <!--
            @slot Use this slot to customize the empty state's actions area,
            where the buttons are. Overrides button-related props:
            `primaryButtonLink`, `primaryButtonText`, `secondaryButtonLink`,
            `secondaryButtonText`.
          -->
          <slot name="actions">
            <gl-button
              v-if="shouldRenderPrimaryButton"
              variant="confirm"
              :class="compact ? 'gl-mr-3' : 'gl-mx-2'"
              class="gl-mb-3"
              :href="primaryButtonLink"
              >{{ primaryButtonText }}</gl-button
            >
            <gl-button
              v-if="shouldRenderSecondaryButton"
              class="gl-mb-3 gl-mr-3"
              :class="{ 'gl-mx-2!': !compact }"
              :href="secondaryButtonLink"
              >{{ secondaryButtonText }}
            </gl-button>
          </slot>
        </div>
      </div>
    </div>
  </section>
</template>
