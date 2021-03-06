import Vue, { nextTick } from 'vue';
import { omit } from 'lodash';
import { shallowMount, mount } from '@vue/test-utils';
import GlFilteredSearch from './filtered_search.vue';
import GlFilteredSearchSuggestion from './filtered_search_suggestion.vue';
import GlFilteredSearchSuggestionList from './filtered_search_suggestion_list.vue';
import GlFilteredSearchTerm from './filtered_search_term.vue';
import GlFilteredSearchToken from './filtered_search_token.vue';
import { TERM_TOKEN_TYPE, INTENT_ACTIVATE_PREVIOUS } from './filtered_search_utils';

jest.mock('~/directives/tooltip');

const FakeToken = {
  props: ['active'],
  inheritAttrs: false,
  render: (h) => h('div'),
};

Vue.directive('GlTooltip', () => {});

const stripId = (token) => (typeof token === 'object' ? omit(token, 'id') : token);

let wrapper;
describe('Filtered search', () => {
  const defaultProps = {
    availableTokens: [{ type: 'faketoken', token: FakeToken }],
  };

  const findSearchBox = () => wrapper.findComponent({ name: 'GlSearchBoxByClickStub' });

  const createComponent = (props) => {
    wrapper = shallowMount(GlFilteredSearch, {
      propsData: { ...defaultProps, ...props },
      stubs: {
        GlSearchBoxByClick: {
          name: 'GlSearchBoxByClickStub',
          props: ['clearable', 'searchButtonAttributes'],
          template: '<div><slot name="input"></slot></div>',
        },
      },
    });
  };

  describe('value manipulation', () => {
    it('creates term when empty', () => {
      createComponent();
      expect(wrapper.emitted().input[0][0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('passes clearable false when empty', () => {
      createComponent();
      expect(findSearchBox().props('clearable')).toBe(false);
    });

    it('adds empty term to the end when not empty', () => {
      createComponent({
        value: [{ type: 'faketoken', value: { data: '' } }],
      });

      expect(stripId(wrapper.emitted().input[0][0].pop())).toStrictEqual({
        type: TERM_TOKEN_TYPE,
        value: { data: '' },
      });
    });

    it('passes clearable true when not empty', async () => {
      createComponent({
        value: [{ type: 'faketoken', value: { data: '' } }],
      });
      await nextTick();

      expect(findSearchBox().props('clearable')).toBe(true);
    });

    it('denormalizes strings if needed', async () => {
      createComponent({
        value: ['one', 'two'],
      });
      await nextTick();

      const inputEventArgs = wrapper.emitted().input[1][0];
      expect(inputEventArgs.every((t) => t.type === TERM_TOKEN_TYPE)).toBe(true);
      expect(inputEventArgs.map((t) => t.value.data)).toStrictEqual(['one', 'two', '']);
    });

    it('splits strings if needed', async () => {
      createComponent({
        value: ['one two'],
      });
      await nextTick();

      const inputEventArgs = wrapper.emitted().input[1][0];
      expect(inputEventArgs.every((t) => t.type === TERM_TOKEN_TYPE)).toBe(true);
      expect(inputEventArgs.map((t) => t.value.data)).toStrictEqual(['one', 'two', '']);
    });
  });

  describe('event handling', () => {
    it.each`
      eventName                  | payload
      ${'submit'}                | ${[[]]}
      ${'clear'}                 | ${[]}
      ${'history-item-selected'} | ${['item']}
      ${'clear-history'}         | ${[]}
    `('passes through $eventName', async ({ eventName, payload }) => {
      createComponent();
      findSearchBox().vm.$emit(eventName, payload[0]);
      await nextTick();

      expect(wrapper.emitted()[eventName][0]).toStrictEqual(payload);
    });

    it('activates token when requested', async () => {
      createComponent({
        value: [{ type: 'faketoken', value: '' }],
      });
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('activate');

      await nextTick();

      expect(wrapper.findComponent(FakeToken).props('active')).toBe(true);
    });

    it('deactivates token when requested', async () => {
      createComponent({
        value: [{ type: 'faketoken', value: '' }],
      });
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('activate');
      wrapper.findComponent(FakeToken).vm.$emit('deactivate');

      await nextTick();

      expect(
        wrapper.findAllComponents({ ref: 'tokens' }).filter((w) => w.props('active') === true)
      ).toHaveLength(0);
    });

    it('ignores deactivate requests from non-active tokens', async () => {
      createComponent({
        value: [
          { type: 'faketoken', value: { data: '1' } },
          { type: 'faketoken', value: { data: '2' } },
        ],
      });
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('activate');
      wrapper.findAllComponents(FakeToken).at(1).vm.$emit('deactivate');

      await nextTick();

      expect(wrapper.findComponent(FakeToken).props('active')).toBe(true);
    });

    it('removes empty term tokens on deactivate', async () => {
      const findSecondTerm = () => wrapper.findAllComponents(GlFilteredSearchTerm).at(1);
      createComponent({
        value: [{ type: 'faketoken', value: { data: '' } }, 'one', 'two', 'three'],
      });

      await nextTick();

      findSecondTerm().vm.$emit('activate');
      findSecondTerm().vm.$emit('input', { data: '' });

      await nextTick();

      findSecondTerm().vm.$emit('deactivate');

      await nextTick();

      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: 'faketoken', value: { data: '' } },
        { type: TERM_TOKEN_TYPE, value: { data: 'one' } },
        { type: TERM_TOKEN_TYPE, value: { data: 'three' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('destroys token if requested', async () => {
      createComponent({
        value: [{ type: 'faketoken', value: '' }, 'one'],
      });
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('destroy');

      await nextTick();

      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: 'one' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('makes previous token active if user intends it on token destruction', async () => {
      createComponent({
        value: [{ type: 'faketoken', value: '' }, ''],
      });
      await nextTick();

      wrapper
        .findComponent(GlFilteredSearchTerm)
        .vm.$emit('destroy', { intent: INTENT_ACTIVATE_PREVIOUS });

      await nextTick();

      expect(wrapper.findComponent(FakeToken).props('active')).toBe(true);
    });

    it('keeps first token active on first token destruction with backspace', async () => {
      createComponent({
        value: ['foo', { type: 'faketoken', value: '' }],
      });
      await nextTick();
      wrapper.findComponent(FakeToken).vm.$emit('activate');
      await nextTick();

      expect(wrapper.findComponent(FakeToken).props('active')).toBe(true);

      wrapper
        .findAllComponents(GlFilteredSearchTerm)
        .at(0)
        .vm.$emit('destroy', { intent: INTENT_ACTIVATE_PREVIOUS });

      await nextTick();

      expect(wrapper.findComponent(FakeToken).props('active')).toBe(true);
    });

    it('keeps active token active if later one destroyed', async () => {
      createComponent({
        value: [
          { type: 'faketoken', value: '' },
          { type: 'faketoken', value: '' },
          { type: 'faketoken', value: '' },
        ],
      });
      await nextTick();
      wrapper.findAllComponents(FakeToken).at(0).vm.$emit('activate');
      await nextTick();

      wrapper.findAllComponents(FakeToken).at(2).vm.$emit('destroy');

      await nextTick();

      expect(wrapper.findAllComponents(FakeToken).at(0).props('active')).toBe(true);
    });

    it('keeps active token active if earlier one destroyed', async () => {
      createComponent({
        value: [
          { type: 'faketoken', value: '' },
          { type: 'faketoken', value: '' },
          { type: 'faketoken', value: '' },
        ],
      });
      await nextTick();
      wrapper.findAllComponents(FakeToken).at(2).vm.$emit('activate');
      await nextTick();

      wrapper.findAllComponents(FakeToken).at(0).vm.$emit('destroy');

      await nextTick();

      expect(wrapper.findAllComponents(FakeToken).at(1).props('active')).toBe(true);
    });

    it('makes no token active if current is destroyed', async () => {
      createComponent({
        value: ['one', { type: 'faketoken', value: '' }],
      });
      await nextTick();
      wrapper.findComponent(FakeToken).vm.$emit('activate');
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('destroy');

      await nextTick();

      wrapper.findAllComponents(GlFilteredSearchTerm).wrappers.forEach((searchTermWrapper) => {
        expect(searchTermWrapper.props('active')).toBe(false);
      });
    });

    it('keeps no token active if one was destroyed when none were active', async () => {
      createComponent({
        value: ['one', { type: 'faketoken', value: '' }],
      });
      await nextTick();

      wrapper.findComponent(FakeToken).vm.$emit('destroy');

      await nextTick();

      expect(wrapper.findComponent(GlFilteredSearchTerm).props('active')).toBe(false);
    });

    it('does not destroy last token', async () => {
      createComponent();
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('destroy');

      await nextTick();

      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('replaces token when requested', async () => {
      createComponent();
      wrapper
        .findComponent(GlFilteredSearchTerm)
        .vm.$emit('replace', { type: 'faketoken', value: { data: 'test' } });

      await nextTick();

      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: 'faketoken', value: { data: 'test' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('replaces token after clear when requested', async () => {
      createComponent({
        value: ['one', { type: 'faketoken', value: '' }, 'two'],
      });

      findSearchBox().vm.$emit('input', '');

      await nextTick();

      wrapper
        .findComponent(GlFilteredSearchTerm)
        .vm.$emit('replace', { type: 'faketoken', value: { data: 'test' } });

      await nextTick();

      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: 'faketoken', value: { data: 'test' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('inserts single token when requested', async () => {
      createComponent({ value: ['one'] });
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('activate');
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('split');

      await nextTick();

      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: 'one' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('jumps to last token when insert of empty term requested', async () => {
      createComponent({ value: ['one', 'two'] });
      await nextTick();

      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('activate');
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('split');

      await nextTick();

      expect(wrapper.findAllComponents(GlFilteredSearchTerm).at(2).props('active')).toBe(true);
      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: 'one' } },
        { type: TERM_TOKEN_TYPE, value: { data: 'two' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('inserts multiple tokens when requested', async () => {
      createComponent({ value: ['one'] });
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('activate');

      await nextTick();

      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('split', ['foo', 'bar']);

      await nextTick();

      expect(wrapper.emitted().input.pop()[0].map(stripId)).toStrictEqual([
        { type: TERM_TOKEN_TYPE, value: { data: 'one' } },
        { type: TERM_TOKEN_TYPE, value: { data: 'foo' } },
        { type: TERM_TOKEN_TYPE, value: { data: 'bar' } },
        { type: TERM_TOKEN_TYPE, value: { data: '' } },
      ]);
    });

    it('submits entire search when submit is requested', () => {
      createComponent();
      wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('submit');
      expect(wrapper.emitted().submit).toBeDefined();
    });
  });

  it('normalizes term tokens to strings on submit', () => {
    createComponent({
      value: ['one'],
    });
    wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('submit');
    expect(wrapper.emitted().submit).toBeDefined();
    expect(wrapper.emitted().submit[0][0]).toStrictEqual(['one']);
  });

  it('concatenates strings on submit', () => {
    createComponent({
      value: ['one', 'two', { type: 'faketoken', value: { data: 'smth' } }, 'four', 'five'],
    });
    wrapper.findComponent(GlFilteredSearchTerm).vm.$emit('submit');
    expect(wrapper.emitted().submit).toBeDefined();
    expect(wrapper.emitted().submit[0][0].map(stripId)).toStrictEqual([
      'one two',
      { type: 'faketoken', value: { data: 'smth' } },
      'four five',
    ]);
  });

  it('passes required props to tokens', async () => {
    createComponent({
      value: [{ type: 'faketoken', value: '' }],
    });
    await nextTick();

    const fakeTokenInstance = wrapper.findComponent(FakeToken);
    expect(fakeTokenInstance.exists()).toBe(true);
    expect(Object.keys(fakeTokenInstance.attributes())).toEqual(
      expect.arrayContaining(['current-value', 'index', 'config', 'value'])
    );
  });

  it('passes `searchButtonAttributes` prop to `GlSearchBoxByClick`', () => {
    const searchButtonAttributes = { 'data-qa-selector': 'foo-bar' };

    createComponent({ searchButtonAttributes });

    expect(findSearchBox().props('searchButtonAttributes')).toEqual(searchButtonAttributes);
  });

  it('passes `searchInputAttributes` prop to search term', async () => {
    const searchInputAttributes = { 'data-qa-selector': 'foo-bar' };

    createComponent({
      value: ['one'],
      searchInputAttributes,
    });
    await nextTick();

    expect(wrapper.findComponent(GlFilteredSearchTerm).props('searchInputAttributes')).toEqual(
      searchInputAttributes
    );
  });

  it('passes `isLastToken` prop to search terms', async () => {
    createComponent({
      value: ['one'],
    });
    await nextTick();

    const filteredSearchTerms = wrapper.findAllComponents(GlFilteredSearchTerm);

    expect(filteredSearchTerms.at(0).props('isLastToken')).toBe(false);
    expect(filteredSearchTerms.at(1).props('isLastToken')).toBe(true);
  });

  it('passes `currentValue` prop to search terms', async () => {
    createComponent({
      value: ['one'],
    });
    await nextTick();

    expect(wrapper.findComponent(GlFilteredSearchTerm).props('currentValue').map(stripId)).toEqual([
      { type: 'filtered-search-term', value: { data: 'one' } },
      { type: 'filtered-search-term', value: { data: '' } },
    ]);
  });
});

describe('Filtered search integration tests', () => {
  const testTokens = [
    {
      type: 'static',
      icon: 'label',
      token: GlFilteredSearchToken,
      title: 'Static-token',
      options: [
        { title: 'first', value: 'one' },
        { title: 'second', value: 'two' },
        { title: 'third', value: 'three' },
      ],
    },
    { type: 'dynamic!token', icon: 'rocket', title: 'Fake-token', token: FakeToken },
    {
      type: 'unique',
      unique: true,
      icon: 'document',
      token: GlFilteredSearchToken,
      title: 'Unique-token',
      options: [
        { title: 'first', value: 'one' },
        { title: 'second', value: 'two' },
      ],
    },
    {
      type: 'disabled',
      icon: 'document',
      title: 'Disabled-token',
      token: FakeToken,
      disabled: true,
    },
  ];

  const mountComponent = (props) => {
    wrapper = mount(GlFilteredSearch, {
      propsData: {
        availableTokens: testTokens,
        ...props,
      },
      attachTo: document.body,
    });
  };

  const activate = (idx) =>
    wrapper
      .findAllComponents(GlFilteredSearchTerm)
      .at(idx)
      .find('div.gl-filtered-search-token-segment')
      .trigger('mousedown');

  const findInput = () =>
    wrapper
      .findAllComponents(GlFilteredSearchTerm)
      .filter((t) => t.props().active)
      .at(0)
      .find('input');

  beforeAll(() => {
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = jest.fn();
    }
  });

  afterAll(() => {
    if (HTMLElement.prototype.scrollIntoView.mock) {
      delete HTMLElement.prototype.scrollIntoView;
    }
  });

  describe('when first term is clicked', () => {
    beforeEach(async () => {
      mountComponent();
      activate(0);
      await nextTick();
    });

    it('brings focus to term element input', () => {
      const input = findInput();
      expect(input.exists()).toBe(true);
      expect(document.activeElement).toBe(input.element);
    });

    it('displays suggestions list', () => {
      const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
      expect(suggestions.exists()).toBe(true);
      expect(suggestions.findAllComponents(GlFilteredSearchSuggestion)).toHaveLength(
        testTokens.filter((t) => !t.disabled).length
      );
    });

    it('updates suggestions list as you type', async () => {
      const input = findInput();
      input.setValue('sta'); // partial of "static"

      await nextTick();

      const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
      expect(suggestions.exists()).toBe(true);
      expect(suggestions.findAllComponents(GlFilteredSearchSuggestion)).toHaveLength(1);
    });

    it('resets suggestions list as you press Space', async () => {
      const input = findInput();
      input.setValue('--wrong-- ');

      await nextTick();

      const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
      expect(suggestions.exists()).toBe(true);
      expect(suggestions.findAllComponents(GlFilteredSearchSuggestion)).toHaveLength(3);
    });

    it('does not render suggestions list if there are no suggestions available', async () => {
      const input = findInput();
      input.setValue('--wrong--');

      await nextTick();

      const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
      expect(suggestions.exists()).toBe(false);
    });

    it('replaces term with token when suggestion is selected', async () => {
      const input = findInput();
      input.trigger('keydown', { key: 'ArrowDown' });

      await nextTick();

      input.trigger('keydown', { key: 'Enter' });

      await nextTick();

      const token = wrapper.findComponent(GlFilteredSearchToken);
      expect(token.exists()).toBe(true);
    });

    it('does not mutate the `value` prop when the search input changes', async () => {
      const initialValue = [...wrapper.props('value')];

      const input = findInput();
      input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      input.trigger('keydown', { key: 'Enter' });
      await nextTick();

      expect(wrapper.props('value')).toEqual(initialValue);
    });

    it('calls alignSuggestion for new tokens', async () => {
      const input = findInput();
      input.trigger('keydown', { key: 'ArrowDown' });
      const alignSuggestionsSpy = jest.spyOn(wrapper.vm, 'alignSuggestions');

      await nextTick();

      input.trigger('keydown', { key: 'Enter' });

      await nextTick();

      expect(alignSuggestionsSpy).toHaveBeenCalled();
    });
  });

  it('does not render unique token in suggestions list if it is already present', async () => {
    mountComponent({ value: ['token', { type: 'unique', value: { data: 'something' } }] });
    activate(0);

    await nextTick();

    const suggestions = wrapper.findComponent(GlFilteredSearchSuggestionList);
    expect(suggestions.exists()).toBe(true);
    expect(suggestions.findAllComponents(GlFilteredSearchSuggestion)).toHaveLength(2);
  });

  it('correctly handles switching from one token to another', async () => {
    mountComponent({ value: ['one two'] });
    activate(0);

    await nextTick();

    activate(1);

    await nextTick();

    expect(wrapper.findAllComponents(GlFilteredSearchTerm).at(1).find('input').exists()).toBe(true);
  });

  it('activates previous token when backspacing on empty search term', async () => {
    mountComponent({ value: ['zero one two'] });
    await nextTick();

    activate(1);

    await nextTick();

    // Make sure we have the expected search term
    const inputWrapper = wrapper.find('input');
    expect(inputWrapper.element.value).toBe('one');

    // Mimic backspace behavior for jsdom
    await inputWrapper.setValue('');
    await inputWrapper.trigger('keydown', { key: 'Backspace' });

    // Make sure the previous token/search term is now active
    const input = wrapper.find('input').element;
    expect(input.value).toBe('zero');
    expect(document.activeElement).toBe(input);
  });

  it('clicking clear button clears component input', async () => {
    mountComponent({ value: ['one two three'] });
    await nextTick();

    wrapper
      .findAll('button')
      .filter((b) => b.attributes('name') === 'clear')
      .trigger('click');

    await nextTick();

    expect(wrapper.findAllComponents(GlFilteredSearchTerm)).toHaveLength(1);
  });

  // Regression test for https://gitlab.com/gitlab-org/gitlab-ui/-/issues/1761
  it('does not incorrectly activate next token of the same type after token destruction', async () => {
    mountComponent({
      value: [
        { type: 'static', value: { data: 'first', operator: '=' } },
        { type: 'static', value: { data: 'second', operator: '=' } },
        { type: 'unique', value: { data: 'something' } },
      ],
    });
    await nextTick();

    expect(
      wrapper.findAllComponents(GlFilteredSearchToken).wrappers.map((cmp) => cmp.props('active'))
    ).toEqual([false, false, false]);

    await wrapper.find('.gl-token-close').trigger('mousedown');

    expect(
      wrapper.findAllComponents(GlFilteredSearchToken).wrappers.map((cmp) => cmp.props('active'))
    ).toEqual([false, false]);
  });

  it('updates tokens list when value is passed dynamically', async () => {
    mountComponent({ value: ['one'] });
    await nextTick();

    expect(wrapper.findAllComponents(GlFilteredSearchTerm)).toHaveLength(2);

    await wrapper.setProps({
      value: ['one two'],
    });

    const termComponents = wrapper.findAllComponents(GlFilteredSearchTerm).wrappers;
    expect(termComponents).toHaveLength(3);
    expect(termComponents.map((termComponent) => termComponent.props('value'))).toEqual([
      { data: 'one' },
      { data: 'two' },
      { data: '' },
    ]);
  });
});
