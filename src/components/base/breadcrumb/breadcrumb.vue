<!-- eslint-disable vue/multi-word-component-names -->
<script>
import { BBreadcrumb } from 'bootstrap-vue';
import GlIcon from '../icon/icon.vue';
import GlButton from '../button/button.vue';
import { GlTooltipDirective } from '../../../directives/tooltip';
import GlBreadcrumbItem from './breadcrumb_item.vue';

export const COLLAPSE_AT_SIZE = 4;

export default {
  components: {
    BBreadcrumb,
    GlIcon,
    GlButton,
    GlBreadcrumbItem,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  inheritAttrs: false,
  props: {
    /**
     * The breadcrumb items to be displayed as links.
     */
    items: {
      type: Array,
      required: true,
      default: () => [{ text: '', href: '' }],
      validator: (links) => {
        return links.every((link) => {
          const keys = Object.keys(link);
          return keys.includes('text') && (keys.includes('href') || keys.includes('to'));
        });
      },
    },
  },
  data() {
    return {
      isListCollapsed: true,
    };
  },
  computed: {
    breadcrumbsSize() {
      return this.items.length;
    },
    hasCollapsible() {
      return this.breadcrumbsSize > COLLAPSE_AT_SIZE;
    },
    nonCollapsibleIndices() {
      return [0, this.breadcrumbsSize - 1, this.breadcrumbsSize - 2];
    },
  },
  methods: {
    isFirstItem(index) {
      return index === 0;
    },
    isLastItem(index) {
      return index === this.breadcrumbsSize - 1;
    },
    expandBreadcrumbs() {
      this.isListCollapsed = false;

      try {
        this.$refs.firstItem[0].querySelector('a').focus();
      } catch (e) {
        /* eslint-disable-next-line no-console */
        console.error(`Failed to set focus on the first breadcrumb item.`);
      }
    },
    showCollapsedBreadcrumbsExpander(index) {
      return index === 0 && this.hasCollapsible && this.isListCollapsed;
    },
    isItemCollapsed(index) {
      return (
        this.hasCollapsible && this.isListCollapsed && !this.nonCollapsibleIndices.includes(index)
      );
    },
    getAriaCurrentAttr(index) {
      return this.isLastItem(index) ? 'page' : false;
    },
  },
};
</script>
<template>
  <nav class="gl-breadcrumbs" aria-label="Breadcrumb">
    <!-- @slot The avatar to display. -->
    <slot name="avatar"></slot>
    <b-breadcrumb class="gl-breadcrumb-list" v-bind="$attrs" v-on="$listeners">
      <template v-for="(item, index) in items">
        <gl-breadcrumb-item
          :key="index"
          :ref="isFirstItem(index) ? 'firstItem' : null"
          :text="item.text"
          :href="item.href"
          :to="item.to"
          :class="{ 'gl-display-none': isItemCollapsed(index) }"
          :aria-current="getAriaCurrentAttr(index)"
        >
          <span>{{ item.text }}</span>
          <span
            v-if="!isLastItem(index)"
            :key="`${index} ${item.text}`"
            class="gl-breadcrumb-separator"
            data-testid="separator"
          >
            <!-- @slot The separator to display. -->
            <slot name="separator">
              <gl-icon name="chevron-right" />
            </slot>
          </span>
        </gl-breadcrumb-item>

        <template v-if="showCollapsedBreadcrumbsExpander(index)">
          <!-- eslint-disable-next-line vue/valid-v-for -->
          <gl-button
            v-gl-tooltip.hover="'Show all breadcrumbs'"
            aria-label="Show all breadcrumbs"
            data-testid="collapsed-expander"
            icon="ellipsis_h"
            category="primary"
            @click="expandBreadcrumbs"
          />
          <!-- eslint-disable-next-line vue/require-v-for-key -->
          <span
            key="expander"
            class="gl-display-inline-flex gl-text-gray-500"
            data-testid="expander-separator"
          >
            <slot name="separator">
              <gl-icon name="chevron-right" />
            </slot>
          </span>
        </template>
      </template>
    </b-breadcrumb>
  </nav>
</template>
