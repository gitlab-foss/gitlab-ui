import { mount, shallowMount } from '@vue/test-utils';
import { formInputSizes } from '../../../../utils/constants';
import GlFormInput from './form_input.vue';

const modelEvent = GlFormInput.model.event;
const newValue = 'foo';

describe('GlFormInput', () => {
  let wrapper;

  const createComponent = (propsData = {}, mountFn = shallowMount) => {
    wrapper = mountFn(GlFormInput, {
      propsData,
    });
  };

  describe('size prop', () => {
    describe('when number is passed', () => {
      // Exclude the default null value
      const sizes = Object.values(formInputSizes).filter(Boolean);

      it.each(sizes)('adds correct class for size %s', (size) => {
        createComponent({ size });

        expect(wrapper.classes()).toEqual(['gl-form-input', `gl-form-input-${size}`]);
      });

      it('does not add a size class if not given the size prop', () => {
        createComponent();

        expect(wrapper.classes()).toEqual(['gl-form-input']);
      });

      it('does not add a size class if passed null', () => {
        createComponent({ size: null });

        expect(wrapper.classes()).toEqual(['gl-form-input']);
      });
    });

    describe('when object is passed', () => {
      describe('when `default` key is provided', () => {
        it('adds responsive CSS classes and base class', () => {
          createComponent({ size: { default: 'md', md: 'lg', lg: 'xl' } });

          expect(wrapper.classes()).toEqual([
            'gl-form-input',
            'gl-form-input-md',
            'gl-md-form-input-lg',
            'gl-lg-form-input-xl',
          ]);
        });
      });

      describe('when `default` key is not provided', () => {
        it('adds responsive CSS classes', () => {
          createComponent({ size: { md: 'lg', lg: 'xl' } });

          expect(wrapper.classes()).toEqual([
            'gl-form-input',
            'gl-md-form-input-lg',
            'gl-lg-form-input-xl',
          ]);
        });
      });
    });
  });

  describe('v-model', () => {
    beforeEach(() => {
      createComponent({}, mount);

      wrapper.setValue(newValue);
    });

    it('synchronously emits an update event', () => {
      expect(wrapper.emitted('update')).toEqual([[newValue]]);
    });

    it('synchronously updates model', () => {
      expect(wrapper.emitted(modelEvent)).toEqual([[newValue]]);
    });
  });

  describe('debounce', () => {
    describe.each([10, 100, 1000])('given a debounce of %dms', (debounce) => {
      beforeEach(() => {
        jest.useFakeTimers();

        createComponent({ debounce }, mount);

        wrapper.setValue(newValue);
      });

      it('synchronously emits an update event', () => {
        expect(wrapper.emitted('update')).toEqual([[newValue]]);
      });

      it('emits a model event after the debounce delay', () => {
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

      wrapper.setValue(newValue);
    });

    it('synchronously emits an update event', () => {
      expect(wrapper.emitted('update')).toEqual([[newValue]]);
    });

    it.each(['change', 'blur'])('updates model after %s event', (event) => {
      expect(wrapper.emitted(modelEvent)).toBe(undefined);

      wrapper.trigger(event);

      expect(wrapper.emitted(modelEvent)).toEqual([[newValue]]);
    });
  });
});
