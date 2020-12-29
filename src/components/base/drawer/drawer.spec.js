import { shallowMount } from '@vue/test-utils';
import Drawer from './drawer.vue';

describe('drawer component', () => {
  let wrapper;
  const mountWithOpts = ({ props = { open: true }, slots = {} }) => {
    wrapper = shallowMount(Drawer, { propsData: props, slots });
  };

  afterEach(() => {
    wrapper.destroy();
  });

  describe('default settings', () => {
    describe('when open is true', () => {
      it('makes gl-drawer visible when open is true', () => {
        mountWithOpts({});

        expect(wrapper.isVisible()).toBe(true);
      });
    });

    describe('when header-height is set', () => {
      it('renders drawer container with `top` and `max-height` styles', () => {
        const headerHeight = '40px';
        mountWithOpts({ props: { open: true, headerHeight } });

        expect(wrapper.find('aside').attributes('style')).toBe(
          `top: ${headerHeight}; z-index: 10; max-height: calc(100vh - ${headerHeight});`
        );
      });
    });

    describe('when open is false', () => {
      it('cannot find aside html element', () => {
        mountWithOpts({ props: { open: false } });

        expect(wrapper.find('aside').exists()).toBe(false);
      });
    });

    describe('on click of the close button', () => {
      it('emits close event', () => {
        mountWithOpts({ props: { open: true } });

        wrapper.find('.gl-drawer-close-button').trigger('click');

        expect(wrapper.emitted().close.length).toBe(1);
      });
    });

    describe('on esc keydown', () => {
      it('emits close event when open is true', () => {
        mountWithOpts({ props: { open: true } });

        const event = new KeyboardEvent('keydown', { keyCode: 27 });
        document.dispatchEvent(event);

        expect(wrapper.emitted().close.length).toBe(1);
      });

      it('does not call onClose when open is false', () => {
        mountWithOpts({ props: { open: false } });

        const event = new KeyboardEvent('keydown', { keyCode: 27 });
        document.dispatchEvent(event);

        expect(wrapper.emitted().close).toBeFalsy();
      });

      it('does not call onClose when open is false and keyCode is not esc', () => {
        mountWithOpts({ props: { open: false } });

        const event = new KeyboardEvent('keydown', { keyCode: 37 });
        document.dispatchEvent(event);

        expect(wrapper.emitted().close).toBeFalsy();
      });
    });
  });

  describe('header', () => {
    it('renders nodes when added to the header slot', () => {
      mountWithOpts({
        slots: {
          header: '<div class="test-header">Test</div>',
        },
      });

      expect(wrapper.find('.gl-drawer-header').find('.test-header').exists()).toBe(true);
    });
  });

  describe('body', () => {
    it('renders nodes when added to the body slot', () => {
      mountWithOpts({
        slots: {
          default: '<li class="item-one">One</li>',
        },
      });

      expect(wrapper.find('.gl-drawer-body').findAll('.item-one').length).toBe(1);
    });
  });
});
