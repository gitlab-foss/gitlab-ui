import { shallowMount, createLocalVue } from '@vue/test-utils';
import Icon from './icon.vue';
import { iconSizeOptions } from '~/utils/constants';

const ICONS_PATH = '/path/to/icons.svg';
const TEST_SIZE = 8;
const TEST_NAME = 'check-circle';

const localVue = createLocalVue();

jest.mock('@gitlab/svgs/dist/icons.svg', () => '/path/to/icons.svg');

describe('Icon component', () => {
  let wrapper;
  let consoleSpy;

  const createComponent = (props) => {
    wrapper = shallowMount(Icon, {
      propsData: {
        size: TEST_SIZE,
        name: TEST_NAME,
        ...props,
      },
      localVue,
    });
  };

  const validateName = (name) => Icon.props.name.validator(name);

  afterEach(() => {
    wrapper.destroy();

    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('when created', () => {
    beforeEach(() => {
      createComponent();
    });

    it(`shows svg class "s${TEST_SIZE}" and path "${ICONS_PATH}#${TEST_NAME}"`, () => {
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('size validator', () => {
    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    const maxSize = Math.max(...iconSizeOptions);

    it('fails with size outside options', async () => {
      createComponent({
        size: maxSize + 10,
      });

      expect(consoleSpy).toBeCalledWith(
        `[gitlab-ui] Unexpected value '${maxSize + 10}' was provided for the icon size`
      );
    });

    it('passes with use-deprecated-sizes', () => {
      createComponent({
        size: maxSize + 10,
        useDeprecatedSizes: true,
      });

      expect(consoleSpy).not.toBeCalled();
    });

    it('passes with size in options', () => {
      createComponent({ size: maxSize });

      expect(consoleSpy).not.toBeCalled();
    });
  });

  describe('name validator', () => {
    it('fails with name that does not exist', () => {
      const badName = `${TEST_NAME}-bogus-zebra`;
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(validateName(badName)).toBe(false);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Icon '${badName}' is not a known icon of @gitlab/svgs`
      );
    });

    it('passes with name that exists', () => {
      expect(validateName(TEST_NAME)).toBe(true);
    });
  });
});
