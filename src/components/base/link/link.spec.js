import { mount } from '@vue/test-utils';
import Link from './link.vue';

const safeLink = jest.fn();

describe('link component', () => {
  let wrapper;

  const createWrapper = (options) => {
    wrapper = mount(Link, options);
  };

  afterEach(() => {
    wrapper.destroy();
    wrapper = null;
  });

  describe('default settings', () => {
    beforeEach(() => {
      createWrapper({ directives: { safeLink } });
    });

    it('should not have a target attribute', () => {
      expect(wrapper.attributes('target')).toBeUndefined();
    });

    it('should not have a rel attribute', () => {
      expect(wrapper.attributes('rel')).toBeUndefined();
    });

    it('should have a default href as #', () => {
      expect(wrapper.attributes('href')).toBe('#');
    });

    it('should have called the safe-link directive', () => {
      expect(safeLink).toHaveBeenCalled();
    });
  });

  describe('target blank', () => {
    it('should set secure rels for hrefs in a different domain', () => {
      createWrapper({
        propsData: {
          target: '_blank',
          href: 'http://example.com',
        },
      });

      expect(wrapper.attributes('rel')).toBe('noopener noreferrer');
    });

    it('should set noopener rel for hrefs for the same domain', () => {
      /* This behavior is due to the fact that
      /* bootstrap-vue link component adds rel="noopener" when target is set as "_blank"
      /* https://github.com/bootstrap-vue/bootstrap-vue/pull/418/files#diff-997fcb1eb150236aec5306a4d72229beR25
      */
      createWrapper({
        propsData: {
          target: '_blank',
          href: window.location.hostname,
        },
      });
      expect(wrapper.attributes('rel')).toBe('noopener');
    });

    it('should keep rel attribute for hrefs in the same domain', () => {
      createWrapper({ attrs: { rel: 'nofollow' } });

      expect(wrapper.attributes('rel')).toBe('nofollow');
    });
  });

  describe('unsafe urls', () => {
    /* GlSafeLinkDirective is actually responsible to handle the unsafe URLs
    /* and GlLink uses this directive to make all the links secure by default
    */
    it('should set href to blank ', () => {
      createWrapper({
        propsData: {
          // eslint-disable-next-line no-script-url
          href: 'javascript:alert(1)',
        },
      });

      expect(wrapper.attributes('href')).toBe('about:blank');
    });
  });
});
