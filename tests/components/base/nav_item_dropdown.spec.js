import { shallowMount } from '@vue/test-utils';
import { BNavItemDropdown } from 'bootstrap-vue';
import GlNavItemDropdown from '../../../src/components/base/nav/nav_item_dropdown.vue';
import GlIcon from '../../../src/components/base/icon/icon.vue';

describe('GlNavItemDropdown', () => {
  let wrapper;

  const factory = (propsData = {}, slots = {}) => {
    wrapper = shallowMount(GlNavItemDropdown, {
      propsData,
      slots,
      stubs: {
        BNavItemDropdown,
      },
    });
  };

  const findBNavItemDropdown = () => wrapper.find(BNavItemDropdown);

  afterEach(() => {
    wrapper.destroy();
  });

  describe('default', () => {
    it('renders BNavItemDropdown', () => {
      const expectedText = 'Hello!';

      factory({ text: expectedText });

      const navItemDropdown = findBNavItemDropdown();

      expect(navItemDropdown.exists()).toBe(true);
      expect(navItemDropdown.find('.dropdown-toggle').text()).toBe(expectedText);
    });

    describe('button-content slot', () => {
      it('renders default template', () => {
        factory();

        const glIcon = wrapper.find(GlIcon);

        expect(glIcon.exists()).toBeTruthy();
        expect(glIcon.classes('dropdown-chevron')).toBeTruthy();
      });

      it('renders custom template', () => {
        factory(
          {},
          {
            'button-content': '<div class="foo">Custom button-content</div>',
          }
        );

        const buttonContentSlot = wrapper.find('.foo');

        expect(buttonContentSlot.exists()).toBeTruthy();
        expect(buttonContentSlot.text()).toBe('Custom button-content');
      });
    });
  });
});
