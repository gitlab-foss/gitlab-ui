<script>
import GlButton from '../button/button.vue';
import GlButtonGroup from '../button_group/button_group.vue';
import GlIcon from '../icon/icon.vue';

export default {
  name: 'GlKeysetPagination',
  components: {
    GlButtonGroup,
    GlButton,
    GlIcon,
  },
  props: {
    // The following 4 properties match the default names of the
    // [PageInfo](https://docs.gitlab.com/ee/api/graphql/reference/index.html#pageinfo)
    // GraphQL type, allowing the returned `pageInfo` object to
    // be bound directly to this component:
    // `<gl-keyset-pagination v-bind="pageInfo">`
    /**
     * Whether or not the "Prev" button should be enabled
     */
    hasPreviousPage: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Whether or not the "Next" button should be enabled
     */
    hasNextPage: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * A cursor that points to the first item in the current page.
     * Will be passed as an event parameter when the "prev" event is fired.
     */
    startCursor: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * A cursor that points to the last item in the current page.
     * Will be passed as an event parameter when the "next" event is fired.
     */
    endCursor: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The text that will be rendered inside the "Prev" button.
     * It\'s important to provide this parameter since the default text is not translatable.
     */
    prevText: {
      type: String,
      required: false,
      default: 'Prev',
    },
    /**
     * A link that will be used as the "Prev" button\'s "href" attribute.
     * If provided, the "Prev" button renders as a link button; otherwise, it is rendered as a regular button.
     */
    prevButtonLink: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * The text that will be rendered inside the "Next" button.
     * It\'s important to provide this parameter since the default text is not translatable.
     */
    nextText: {
      type: String,
      required: false,
      default: 'Next',
    },
    /**
     * A link that will be used as the "Next" button\'s "href" attribute.
     * If provided, the "Next" button renders as a link button; otherwise, it is rendered as a regular button.
     */
    nextButtonLink: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Whether or not both buttons should be disabled (regardless of the "hasPreviousPage" and "hasNextPage" values).
     */
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
};
</script>

<template>
  <gl-button-group class="gl-keyset-pagination" v-bind="$attrs" v-on="$listeners">
    <gl-button
      :href="prevButtonLink"
      :disabled="disabled || !hasPreviousPage"
      data-testid="prevButton"
      @click="$emit('prev', startCursor)"
    >
      <!-- @slot Used to customize the appearance of the "Prev" button -->
      <slot name="previous-button-content">
        <div class="gl-display-flex gl-align-center">
          <gl-icon name="chevron-left" />
          {{ prevText }}
        </div>
      </slot>
    </gl-button>
    <gl-button
      :href="nextButtonLink"
      :disabled="disabled || !hasNextPage"
      data-testid="nextButton"
      @click="$emit('next', endCursor)"
    >
      <!-- @slot Used to customize the appearance of the "Next" button -->
      <slot name="next-button-content">
        <div class="gl-display-flex gl-align-center">
          {{ nextText }}
          <gl-icon name="chevron-right" />
        </div>
      </slot>
    </gl-button>
  </gl-button-group>
</template>
