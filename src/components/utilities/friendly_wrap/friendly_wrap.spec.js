import { shallowMount, createLocalVue } from '@vue/test-utils';
import FriendlyWrap from './friendly_wrap.vue';

const localVue = createLocalVue();

describe('Friendly wrap component', () => {
  let wrapper;

  const createComponent = (props) => {
    wrapper = shallowMount(FriendlyWrap, {
      localVue,
      propsData: props,
    });
  };

  afterEach(() => {
    wrapper.destroy();
  });

  it('wraps text on slashes by default', () => {
    const text = '/some/file/path';
    const textWrapped = '/<wbr>some/<wbr>file/<wbr>path';
    createComponent({
      text,
    });

    expect(wrapper.text()).toBe(text);
    expect(wrapper.html()).toMatch(textWrapped);
  });

  it('supports backslashes', () => {
    const text = '\\some\\long\\file\\path';
    const textWrapped = '\\<wbr>some\\<wbr>long\\<wbr>file\\<wbr>path';
    createComponent({
      text,
      symbols: ['\\'],
    });
    expect(wrapper.text()).toBe(text);
    expect(wrapper.html()).toMatch(textWrapped);
  });

  it('accepts multiple symbols', () => {
    const text = 'some;text-that.needs;to-be.wrapped';
    const textWrapped = 'some;<wbr>text-<wbr>that.<wbr>needs;<wbr>to-<wbr>be.<wbr>wrapped';
    createComponent({
      text,
      symbols: [';', '-', '.'],
    });
    expect(wrapper.text()).toBe(text);
    expect(wrapper.html()).toMatch(textWrapped);
  });

  it('works with words', () => {
    const text = 'it goes on and on and on and on';
    const textWrapped = 'it goes on and<wbr> on and<wbr> on and<wbr> on';
    createComponent({
      text,
      symbols: ['and'],
    });
    expect(wrapper.text()).toBe(text);
    expect(wrapper.html()).toMatch(textWrapped);
  });

  it(`does not break with sensitive symbols like '<' or 'w' or 'b' or 'r' or '>'`, () => {
    const text = '< or w or b or r or >';
    const textWrapped = '&lt;<wbr> or<wbr> w<wbr> or<wbr> b<wbr> or<wbr> r<wbr> or<wbr> &gt;<wbr>';
    createComponent({
      text,
      symbols: ['&lt;', ...'wbr'.split(''), '&gt;'],
    });

    expect(wrapper.text()).toBe(text);
    expect(wrapper.html()).toMatch(textWrapped);
  });

  it('escapes text to prevent XSS', () => {
    const text = '<script>alert(1)</script>';
    const textWrapped = '&lt;script&gt;alert(1)&lt;/<wbr>script&gt;';
    createComponent({
      text,
    });

    expect(wrapper.text()).toBe(text);
    expect(wrapper.html()).toMatch(textWrapped);
  });
});
