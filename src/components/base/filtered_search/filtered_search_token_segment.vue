<script>
import { last } from 'lodash';
import { Portal } from 'portal-vue';
import { COMMA } from '../../../utils/constants';
import GlFilteredSearchSuggestion from './filtered_search_suggestion.vue';
import GlFilteredSearchSuggestionList from './filtered_search_suggestion_list.vue';
import { splitOnQuotes, wrapTokenInQuotes } from './filtered_search_utils';

export default {
  name: 'GlFilteredSearchTokenSegment',
  components: {
    Portal,
    GlFilteredSearchSuggestionList,
    GlFilteredSearchSuggestion,
  },
  inject: ['portalName', 'alignSuggestions'],
  inheritAttrs: false,
  props: {
    /**
     * If this token segment is currently being edited.
     */
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
    label: {
      type: String,
      required: false,
      default: 'Search',
    },
    multiSelect: {
      type: Boolean,
      required: false,
      default: false,
    },
    options: {
      type: Array,
      required: false,
      default: () => null,
    },
    optionTextField: {
      type: String,
      required: false,
      default: 'value',
    },
    customInputKeydownHandler: {
      type: Function,
      required: false,
      default: () => () => false,
    },
    /**
     * Current term value
     */
    value: {
      required: true,
      validator: () => true,
    },
    /**
     * HTML attributes to add to the search input
     */
    searchInputAttributes: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    /**
     * If this is the last token
     */
    isLastToken: {
      type: Boolean,
      required: false,
      default: false,
    },
    currentValue: {
      type: Array,
      required: false,
      default: () => [],
    },
    cursorPosition: {
      type: String,
      required: false,
      default: 'end',
      validator: (value) => ['start', 'end'].includes(value),
    },
  },

  data() {
    return {
      fallbackValue: this.value,
    };
  },

  computed: {
    matchingOption() {
      return this.options?.find((o) => o.value === this.value);
    },

    nonMultipleValue() {
      return this.multiSelect ? last(this.value.split(COMMA)) : this.value;
    },

    inputValue: {
      get() {
        return this.matchingOption
          ? this.matchingOption[this.optionTextField]
          : this.nonMultipleValue;
      },

      set(v) {
        /**
         * Emitted when this token segment's value changes.
         *
         * @type {object} option The current option.
         */
        this.$emit('input', this.getMatchingOptionForInputValue(v)?.value ?? v);
      },
    },

    hasOptionsOrSuggestions() {
      return this.options?.length || this.$slots.suggestions;
    },

    defaultSuggestedValue() {
      if (!this.options) {
        return this.nonMultipleValue;
      }
      if (this.value) {
        const match =
          this.getMatchingOptionForInputValue(this.inputValue) ||
          this.getMatchingOptionForInputValue(this.inputValue, { loose: true });
        return match?.value;
      }

      const defaultSuggestion = this.options.find((op) => op.default);
      return (defaultSuggestion ?? this.options[0])?.value;
    },
    containerAttributes() {
      return (
        this.isLastToken &&
        !this.active &&
        this.currentValue.length > 1 &&
        this.searchInputAttributes
      );
    },
  },

  watch: {
    active: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.activate();
        } else {
          this.deactivate();
        }
      },
    },

    inputValue(newValue) {
      const hasUnclosedQuote = newValue.split('"').length % 2 === 0;
      if (newValue.indexOf(' ') === -1 || hasUnclosedQuote) {
        return;
      }

      const [firstWord, ...otherWords] = splitOnQuotes(newValue).filter(
        (w, idx, arr) => Boolean(w) || idx === arr.length - 1
      );
      this.$emit('input', this.getMatchingOptionForInputValue(firstWord)?.value ?? firstWord);

      if (otherWords.length) {
        /**
         * Emitted when Space appears in token segment value
         * @property {array|string} newStrings New strings to be converted into term tokens
         */
        this.$emit('split', otherWords);
      }
    },
  },

  methods: {
    emitIfInactive(e) {
      if (!this.active) {
        /**
         * Emitted on mousedown event on the main component.
         */
        this.$emit('activate');
        e.preventDefault();
      }
    },

    getMatchingOptionForInputValue(v, { loose } = { loose: false }) {
      return this.options?.find((o) =>
        loose ? o[this.optionTextField].startsWith(v) : [this.optionTextField] === v
      );
    },

    activate() {
      this.fallbackValue = this.value;

      this.$nextTick(() => {
        const { input } = this.$refs;
        if (input) {
          input.focus();
          input.scrollIntoView({ block: 'nearest', inline: 'end' });
          this.alignSuggestions(input);
          if (this.cursorPosition === 'start') {
            input?.setSelectionRange(0, 0);
          }
        }
      });
    },

    deactivate() {
      if (!this.options) {
        return;
      }

      if (this.matchingOption?.value !== this.value) {
        this.$emit('input', this.fallbackValue);
      }
    },

    applySuggestion(suggestedValue) {
      const formattedSuggestedValue = wrapTokenInQuotes(suggestedValue);

      /**
       * Emitted when autocomplete entry is selected.
       *
       * @type {string} value The selected value.
       */
      this.$emit('select', formattedSuggestedValue);

      if (!this.multiSelect) {
        this.$emit('input', formattedSuggestedValue);
        this.$emit('complete', formattedSuggestedValue);
      }
    },

    handleInputKeydown(e) {
      const { key } = e;
      const { suggestions, input } = this.$refs;
      const suggestedValue = suggestions?.getValue();

      const handlers = {
        ArrowLeft: () => {
          if (input.selectionStart === 0) {
            e.preventDefault();
            this.$emit('previous');
          }
        },
        ArrowRight: () => {
          if (input.selectionEnd === this.inputValue.length) {
            e.preventDefault();
            this.$emit('next');
          }
        },
        Backspace: () => {
          if (this.inputValue === '') {
            e.preventDefault();
            /**
             * Emitted when Backspace is pressed and the value is empty
             */
            this.$emit('backspace');
          }
        },
        Enter: () => {
          e.preventDefault();
          if (suggestedValue != null) {
            this.applySuggestion(suggestedValue);
          } else {
            /**
             * Emitted when Enter is pressed and no suggestion is selected
             */
            this.$emit('submit');
          }
        },
        ':': () => {
          if (suggestedValue != null) {
            e.preventDefault();
            this.applySuggestion(suggestedValue);
          }
        },
        Escape: () => {
          e.preventDefault();
          /**
           * Emitted when suggestion is selected from the suggestion list
           */
          this.$emit('complete');
        },
      };

      const suggestionsHandlers = {
        ArrowDown: () => suggestions.nextItem(),
        Down: () => suggestions.nextItem(),
        ArrowUp: () => suggestions.prevItem(),
        Up: () => suggestions.prevItem(),
      };

      if (this.hasOptionsOrSuggestions) {
        Object.assign(handlers, suggestionsHandlers);
      }

      if (Object.keys(handlers).includes(key)) {
        handlers[key]();
        return;
      }

      this.customInputKeydownHandler(e, {
        suggestedValue,
        inputValue: this.inputValue,
        applySuggestion: (v) => this.applySuggestion(v),
      });
    },

    handleBlur() {
      if (this.multiSelect) {
        this.$emit('complete');
      } else if (this.active) {
        /**
         * Emitted when this term token will lose its focus.
         */
        this.$emit('deactivate');
      }
    },
  },
};
</script>

<template>
  <div
    v-bind="containerAttributes"
    class="gl-filtered-search-token-segment"
    :class="{
      'gl-filtered-search-token-segment-active': active,
    }"
    data-testid="filtered-search-token-segment"
    @mousedown.left="emitIfInactive"
  >
    <template v-if="active">
      <input
        ref="input"
        v-bind="searchInputAttributes"
        v-model="inputValue"
        class="gl-filtered-search-token-segment-input"
        :aria-label="label"
        @keydown="handleInputKeydown"
        @blur="handleBlur"
      />

      <portal :key="`operator-${_uid}`" :to="portalName">
        <gl-filtered-search-suggestion-list
          v-if="hasOptionsOrSuggestions"
          :key="`operator-${_uid}`"
          ref="suggestions"
          :initial-value="defaultSuggestedValue"
          @suggestion="applySuggestion"
        >
          <template v-if="options">
            <gl-filtered-search-suggestion
              v-for="(option, idx) in options"
              :key="`${option.value}-${idx}`"
              :value="option.value"
              :icon-name="option.icon"
            >
              <slot name="option" v-bind="{ option }"> {{ option[optionTextField] }} </slot>
            </gl-filtered-search-suggestion>
          </template>

          <slot v-else name="suggestions"></slot>
        </gl-filtered-search-suggestion-list>
      </portal>
    </template>

    <slot v-else name="view" v-bind="{ inputValue }">{{ inputValue }}</slot>
  </div>
</template>
