import { shallowMount } from '@vue/test-utils';
import { BCarousel } from 'bootstrap-vue';
import Carousel from '../../../src/components/base/carousel/carousel.vue';

describe('Carousel component', () => {
  const collapseId = 'collapse-id';
  let wrapper;

  const createWrapper = propsData => {
    wrapper = shallowMount(Carousel, { propsData });
  };

  describe('default', () => {
    beforeEach(() => {
      createWrapper({
        id: collapseId,
      });
    });

    afterEach(() => {
      wrapper.destroy();
    });

    it('renders a BCarousel component', () => {
      expect(wrapper.find(BCarousel).exists()).toBe(true);
    });
  });
});
