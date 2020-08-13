import { mount, shallowMount } from '@vue/test-utils';
import SearchBoxByType from './search_box_by_type.vue';
import LoadingIcon from '../loading_icon/loading_icon.vue';
import ClearIcon from '~/components/shared_components/clear_icon_button/clear_icon_button.vue';

const modelEvent = SearchBoxByType.model.event;
const newValue = 'new value';

describe('search box by type component', () => {
  let wrapper;

  const createComponent = (propsData, mountFn = shallowMount) => {
    wrapper = mountFn(SearchBoxByType, { propsData });
  };

  const findClearIcon = () => wrapper.find(ClearIcon);
  const findInput = () => wrapper.find({ ref: 'input' });

  afterEach(() => {
    wrapper.destroy();
    wrapper = null;
  });

  describe('clear icon component', () => {
    beforeEach(() => {
      createComponent({ value: 'somevalue' });
    });

    it('is not rendered when value is empty', () => {
      createComponent({ value: '' });
      expect(findClearIcon().exists()).toBe(false);
    });

    it('is rendered when value is provided', () => {
      expect(findClearIcon().exists()).toBe(true);
    });

    it('emits empty value when clicked', () => {
      findClearIcon().vm.$emit('click', { stopPropagation: jest.fn() });

      expect(wrapper.emitted().input).toEqual([['']]);
    });
  });

  describe('v-model', () => {
    beforeEach(() => {
      createComponent({ value: 'somevalue' }, mount);
    });

    it('syncs value prop to input value', async () => {
      wrapper.setProps({ value: newValue });
      await wrapper.vm.$nextTick();

      expect(findInput().element.value).toEqual(newValue);
    });

    it(`emits ${modelEvent} event when input value changes`, () => {
      findInput().setValue(newValue);

      expect(wrapper.emitted().input).toEqual([[newValue]]);
    });
  });

  describe('debounce', () => {
    describe.each([10, 100, 1000])('given a debounce of %dms', debounce => {
      beforeEach(() => {
        jest.useFakeTimers();

        createComponent({ debounce }, mount);

        findInput().setValue(newValue);
      });

      it(`emits a ${modelEvent} after the debounce delay`, () => {
        // Just before debounce completes
        jest.advanceTimersByTime(debounce - 1);
        expect(wrapper.emitted(modelEvent)).toBe(undefined);

        // Exactly when debounce completes
        jest.advanceTimersByTime(1);
        expect(wrapper.emitted(modelEvent)).toEqual([[newValue]]);
      });
    });
  });

  describe('lazy', () => {
    beforeEach(() => {
      createComponent({ lazy: true }, mount);

      findInput().setValue(newValue);
    });

    it.each(['change', 'blur'])(`emits ${modelEvent} event after input's %s event`, event => {
      expect(wrapper.emitted(modelEvent)).toBe(undefined);

      findInput().trigger(event);

      expect(wrapper.emitted(modelEvent)).toEqual([[newValue]]);
    });
  });

  it('renders loading icon when `isLoading` prop is provided', () => {
    createComponent({ isLoading: true });
    expect(wrapper.find(LoadingIcon).exists()).toBe(true);
  });
});
