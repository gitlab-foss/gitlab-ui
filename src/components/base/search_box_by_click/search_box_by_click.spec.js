import { shallowMount, createLocalVue } from '@vue/test-utils';
import GlDropdownItem from '../dropdown/dropdown_item.vue';
import GlFormInput from '../form/form_input/form_input.vue';
import SearchBoxByClick from './search_box_by_click.vue';
import ClearIcon from '~/components/shared_components/clear_icon_button/clear_icon_button.vue';

const localVue = createLocalVue();
localVue.directive('gl-tooltip', {});

const GlFormInputGroupStub = {
  template: `
    <div>
      <slot name="prepend"></slot>
      <slot></slot>
      <slot name="append"></slot>
    </div>
  `,
};

describe('search box by click component', () => {
  let wrapper;

  const createComponent = (propsData) => {
    wrapper = shallowMount(SearchBoxByClick, {
      propsData,
      stubs: { GlFormInputGroup: GlFormInputGroupStub },
      localVue,
    });
  };

  const findClearIcon = () => wrapper.find(ClearIcon);

  afterEach(() => {
    wrapper.destroy();
  });

  it('emits input event when input changes', async () => {
    createComponent({ value: 'somevalue' });

    wrapper.find({ ref: 'input' }).vm.$emit('input', 'new value');

    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().input).toEqual([['new value']]);
  });

  it('does not displays history dropdown by default', () => {
    createComponent();
    expect(wrapper.find({ ref: 'historyDropdown' }).exists()).toBe(false);
  });

  describe('clear button', () => {
    it('is not rendered when value is empty', () => {
      createComponent({ value: '' });
      expect(findClearIcon().exists()).toBe(false);
    });

    it('is not rendered when clearable is false', () => {
      createComponent({ value: 'some', clearable: false });
      expect(findClearIcon().exists()).toBe(false);
    });

    it('is rendered when value is provided', () => {
      createComponent({ value: 'somevalue' });
      expect(findClearIcon().exists()).toBe(true);
    });

    it('emits empty string when clicked', async () => {
      createComponent({ value: 'somevalue' });
      findClearIcon().vm.$emit('click');

      await wrapper.vm.$nextTick();
      expect(wrapper.emitted().input).toEqual([['']]);
    });

    it('emits clear event when clicked', async () => {
      createComponent({ value: 'somevalue' });
      findClearIcon().vm.$emit('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted().clear).toHaveLength(1);
    });
  });

  describe('when historyItems prop is provided', () => {
    beforeEach(() => {
      createComponent({ historyItems: ['one', 'two', 'three'] });
    });

    it('displays history dropdown', () => {
      expect(wrapper.find({ ref: 'historyDropdown' }).exists()).toBe(true);
    });

    it('hides dropdown when close buton is clicked', () => {
      wrapper.vm.$refs.historyDropdown.hide = jest.fn();

      wrapper.find({ ref: 'closeHistory' }).vm.$emit('click');

      expect(wrapper.vm.$refs.historyDropdown.hide).toHaveBeenCalled();
    });

    it('emits clear-history event when clear button is clicked', () => {
      wrapper.find({ ref: 'clearHistory' }).vm.$emit('click');

      expect(wrapper.emitted()['clear-history'].length).toBe(1);
    });

    it('emits proper events when history item is clicked', async () => {
      wrapper.find(GlDropdownItem).vm.$emit('click');

      await wrapper.vm.$nextTick();
      expect(wrapper.emitted().input[0]).toEqual(['one']);
      expect(wrapper.emitted()['history-item-selected'][0]).toEqual(['one']);
    });
  });

  describe('disabled state', () => {
    beforeEach(() => {
      createComponent({
        value: 'somevalue',
        historyItems: ['one', 'two', 'three'],
        disabled: true,
      });
    });

    it('displays disabled history dropdown', () => {
      expect(wrapper.find({ ref: 'historyDropdown' }).exists()).toBe(true);
      expect(wrapper.find({ ref: 'historyDropdown' }).attributes('disabled')).toBe('true');
    });

    it('displays disabled input', () => {
      expect(wrapper.find({ ref: 'input' }).exists()).toBe(true);
      expect(wrapper.find({ ref: 'input' }).attributes('disabled')).toBe('true');
    });

    it('displays disabled search button', () => {
      expect(wrapper.find({ ref: 'searchButton' }).exists()).toBe(true);
      expect(wrapper.find({ ref: 'searchButton' }).attributes('disabled')).toBe('true');
    });

    it('does not render clear icon even with value', () => {
      expect(findClearIcon().exists()).toBe(false);
    });
  });

  it('emits submit event when Enter key is pressed', async () => {
    createComponent({ value: 'some-input' });

    wrapper.find(GlFormInput).vm.$emit('keydown', { type: 'key', keyCode: 13 });

    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().submit[0]).toEqual(['some-input']);
  });

  it('emits submit event when search button is pressed', async () => {
    createComponent({ value: 'some-input' });
    wrapper.find({ ref: 'searchButton' }).vm.$emit('click');

    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().submit[0]).toEqual(['some-input']);
  });
});
