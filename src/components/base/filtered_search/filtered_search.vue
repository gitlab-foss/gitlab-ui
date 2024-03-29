<script>
import { cloneDeep, isEqual } from 'lodash';
import PortalVue from 'portal-vue';
import Vue from 'vue';
import { GlTooltipDirective } from '../../../directives/tooltip';
import GlIcon from '../icon/icon.vue';
import GlSearchBoxByClick from '../search_box_by_click/search_box_by_click.vue';
import GlFilteredSearchTerm from './filtered_search_term.vue';
import {
  isEmptyTerm,
  INTENT_ACTIVATE_PREVIOUS,
  createTerm,
  ensureTokenId,
  normalizeTokens,
  denormalizeTokens,
  needDenormalization,
} from './filtered_search_utils';

Vue.use(PortalVue);

let portalUuid = 0;

function initialState() {
  return [createTerm()];
}

export default {
  name: 'GlFilteredSearch',
  components: {
    GlSearchBoxByClick,
    GlIcon,
  },
  directives: { GlTooltip: GlTooltipDirective },
  provide() {
    portalUuid += 1;
    this.portalName = `filters_portal_${portalUuid}`;

    return {
      portalName: this.portalName,
      alignSuggestions: (ref) => this.alignSuggestions(ref),
      // Return a function reference instead of a prop to work around vue-apollo@3 bug.
      // TODO: This can be reverted once https://github.com/vuejs/vue-apollo/pull/1153
      // has been merged and we consume it, or we upgrade to vue-apollo@4.
      suggestionsListClass: () => this.suggestionsListClass,
    };
  },
  inheritAttrs: false,
  props: {
    /**
     * If provided, used as value of filtered search
     */
    value: {
      required: false,
      type: Array,
      default: () => [],
    },
    /**
     * Available tokens
     */
    availableTokens: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * If provided, used as history items for this component
     */
    placeholder: {
      type: String,
      required: false,
      default: 'Search',
    },
    clearButtonTitle: {
      type: String,
      required: false,
      default: 'Clear',
    },
    historyItems: {
      type: Array,
      required: false,
      default: null,
    },
    /**
     * Additional classes to add to the suggestion list menu. NOTE: this not reactive, and the value
     * must be available and fixed when the component is instantiated
     */
    suggestionsListClass: {
      type: [String, Array, Object],
      required: false,
      default: null,
    },
    /**
     * Display operators' descriptions instead of their values (e.g., "is" instead of "=").
     */
    showFriendlyText: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * HTML attributes to add to the search button
     */
    searchButtonAttributes: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    /**
     * HTML attributes to add to the search input
     */
    searchInputAttributes: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      tokens: initialState(),
      activeTokenIdx: null,
      suggestionsStyle: {},
      intendedCursorPosition: 'end',
    };
  },
  computed: {
    activeToken() {
      return this.tokens[this.activeTokenIdx];
    },
    lastTokenIdx() {
      return this.tokens.length - 1;
    },
    isLastTokenActive() {
      return this.activeTokenIdx === this.lastTokenIdx;
    },
    hasValue() {
      return this.tokens.length > 1 || this.tokens[0].value.data !== '';
    },
    termPlaceholder() {
      return this.hasValue ? null : this.placeholder;
    },
    currentAvailableTokens() {
      return this.availableTokens.filter((token) => {
        if (token.disabled) {
          return false;
        }

        if (token.unique) {
          return !this.tokens.find((t) => t.type === token.type);
        }

        return true;
      });
    },
  },
  watch: {
    tokens: {
      handler() {
        if (process.env.NODE_ENV !== 'production') {
          const invalidToken = this.tokens.find((token) => !token.id);
          if (invalidToken) {
            throw new Error(`Token does not have an id:\n${JSON.stringify(invalidToken)}`);
          }
        }

        if (this.tokens.length === 0 || !this.isLastTokenEmpty()) {
          this.tokens.push(createTerm());
        }

        /**
         * Emitted when the tokens (value) changes
         * @property {array} tokens
         */
        this.$emit('input', this.tokens);
      },
      deep: true,
      immediate: true,
    },
    value: {
      handler(newValue, oldValue) {
        if (newValue.length && !isEqual(newValue, oldValue)) {
          this.applyNewValue(cloneDeep(newValue));
        }
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    applyNewValue(newValue) {
      this.tokens = needDenormalization(newValue) ? denormalizeTokens(newValue) : newValue;
    },

    isLastToken(idx) {
      return !this.activeTokenIdx && idx === this.lastTokenIdx;
    },

    isLastTokenEmpty() {
      return isEmptyTerm(this.tokens[this.lastTokenIdx]);
    },

    getTokenEntry(type) {
      return this.availableTokens.find((t) => t.type === type);
    },

    getTokenComponent(type) {
      return this.getTokenEntry(type)?.token || GlFilteredSearchTerm;
    },

    activate(idx) {
      this.activeTokenIdx = idx;
    },

    activatePreviousToken() {
      if (this.activeTokenIdx > 0) {
        this.activeTokenIdx -= 1;
        this.intendedCursorPosition = 'end';
      }
    },

    activateNextToken() {
      if (this.activeTokenIdx < this.value.length) {
        this.activeTokenIdx += 1;
        this.intendedCursorPosition = 'start';
      }
    },

    alignSuggestions(ref) {
      const offsetRef = ref.getBoundingClientRect().left;
      const offsetMenu = this.$el.getBoundingClientRect().left;
      const transform = `translateX(${Math.floor(offsetRef - offsetMenu)}px)`;
      this.suggestionsStyle = { transform };
    },

    deactivate(token) {
      this.intendedCursorPosition = 'end';
      const tokenIdx = this.tokens.indexOf(token);
      if (tokenIdx === -1 || this.activeTokenIdx !== tokenIdx) {
        return;
      }

      if (!this.isLastTokenEmpty()) {
        this.tokens.push(createTerm());
      }

      if (!this.isLastTokenActive && isEmptyTerm(this.activeToken)) {
        this.tokens.splice(tokenIdx, 1);
      }

      this.activeTokenIdx = null;
    },

    destroyToken(idx, { intent } = {}) {
      if (this.tokens.length === 1) {
        return;
      }

      this.tokens.splice(idx, 1);

      // First, attempt to honor the user's activation intent behind the
      // destruction of the token, if any. Otherwise, try to maintain the
      // active state for the token that was active at the time. If that's not
      // possible, make sure no token is active.
      if (intent === INTENT_ACTIVATE_PREVIOUS) {
        // If there is a previous token, activate it; else, activate the first token
        this.activeTokenIdx = Math.max(idx - 1, 0);
      } else if (idx < this.activeTokenIdx) {
        // Preserve the active token's active status (it shifted down one index)
        this.activeTokenIdx -= 1;
      } else if (idx === this.activeTokenIdx) {
        // User destroyed the active token; don't activate another one.
        this.activeTokenIdx = null;
      }
      // Do nothing if there was no active token, or if idx > this.activeTokenIdx,
      // to preserve the active state of the remaining tokens.
    },

    replaceToken(idx, token) {
      this.$set(this.tokens, idx, ensureTokenId({ ...token, value: { data: '', ...token.value } }));
      this.activeTokenIdx = idx;
    },

    createTokens(idx, newStrings = ['']) {
      if (
        this.activeTokenIdx !== this.lastTokenIdx &&
        newStrings.length === 1 &&
        newStrings[0] === ''
      ) {
        this.activeTokenIdx = this.lastTokenIdx;
        return;
      }

      const newTokens = newStrings.map((data) => createTerm(data));

      this.tokens.splice(idx + 1, 0, ...newTokens);

      this.activeTokenIdx = idx + newStrings.length;
    },

    completeToken() {
      if (this.activeTokenIdx === this.lastTokenIdx - 1) {
        this.activeTokenIdx = this.lastTokenIdx;
      } else {
        this.activeTokenIdx = null;
      }
    },

    submit() {
      /**
       * Emitted when search is submitted
       * @property {array} tokens
       */
      this.$emit('submit', normalizeTokens(cloneDeep(this.tokens)));
    },
  },
};
</script>

<template>
  <!--
  Emitted when search is cleared
  @event clear
  -->
  <!--
  Emitted when item from history is selected
  @event history-item-selected
  @property {object} value History item
  -->
  <!--
  Emitted when clear history button is clicked
  @event clear-history
  -->
  <gl-search-box-by-click
    v-bind="$attrs"
    :value="tokens"
    :history-items="historyItems"
    :clearable="hasValue"
    :search-button-attributes="searchButtonAttributes"
    data-testid="filtered-search-input"
    @submit="submit"
    @input="applyNewValue"
    @history-item-selected="$emit('history-item-selected', $event)"
    @clear="$emit('clear')"
    @clear-history="$emit('clear-history')"
  >
    <template #history-item="slotScope">
      <!-- @slot Slot to customize history item in history dropdown. Used only if using history items -->
      <slot name="history-item" v-bind="slotScope"></slot>
    </template>
    <template #input>
      <div class="gl-filtered-search-scrollable">
        <template v-for="(token, idx) in tokens">
          <component
            :is="getTokenComponent(token.type)"
            ref="tokens"
            :key="token.id"
            v-model="token.value"
            :config="getTokenEntry(token.type)"
            :active="activeTokenIdx === idx"
            :cursor-position="intendedCursorPosition"
            :available-tokens="currentAvailableTokens"
            :current-value="tokens"
            :index="idx"
            :placeholder="termPlaceholder"
            :show-friendly-text="showFriendlyText"
            :search-input-attributes="searchInputAttributes"
            :is-last-token="isLastToken(idx)"
            class="gl-filtered-search-item"
            :class="{
              'gl-filtered-search-last-item': isLastToken(idx),
            }"
            @activate="activate(idx)"
            @deactivate="deactivate(token)"
            @destroy="destroyToken(idx, $event)"
            @replace="replaceToken(idx, $event)"
            @complete="completeToken"
            @submit="submit"
            @split="createTokens(idx, $event)"
            @previous="activatePreviousToken"
            @next="activateNextToken"
          />
        </template>
      </div>
      <portal-target
        ref="menu"
        :key="activeTokenIdx"
        :name="portalName"
        slim
        :style="suggestionsStyle"
      />
    </template>
  </gl-search-box-by-click>
</template>
