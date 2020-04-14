import { mount } from '@vue/test-utils';
import GlFormCheckboxTree from '../../../../src/components/base/form/form_checkbox_tree/form_checkbox_tree.vue';
import GlFormCheckbox from '../../../../src/components/base/form/form_checkbox/form_checkbox.vue';
import {
  V_MODEL,
  QA_PREFIX,
} from '../../../../src/components/base/form/form_checkbox_tree/models/constants';

/**
 * Construct an options tree based on shape passed as a string
 * @param {string} shape
 * @returns {array} The options tree
 */
const getOptions = (shape = '') => {
  const options = [];
  const parsed = shape
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length);

  const makeOption = value => ({ value, label: value, children: [] });

  const getDepthAndValue = str => {
    const [prefix, value] = str.split('.');
    return [prefix.length, value];
  };

  const addChildren = (option, depth, index) => {
    for (let i = index + 1; i < parsed.length; i += 1) {
      const [childDepth, value] = getDepthAndValue(parsed[i]);
      if (childDepth <= depth) {
        break;
      }
      if (childDepth === depth + 1) {
        const child = makeOption(value);
        option.children.push(child);
        addChildren(child, depth + 1, i);
      }
    }
  };

  parsed.forEach((line, index) => {
    const [depth, value] = getDepthAndValue(line);

    if (depth === 1) {
      const option = makeOption(value);
      options.push(option);
      addChildren(option, depth, index);
    }
  });

  return options;
};

const SHAPE = {
  NO_NESTING: `
  _.1
  _.2
  _.3
  _.4
  _.5
  `,
  NESTED: `
  _.1
  __.2
  __.3
  ___.4
  ___.5
`,
  COMPLEX: `
_.1
__.2
__.3
___.4
___.5
____.6
__.7
__.8
___.9
___.10
__.11
_.12
`,
};

describe('GlFormCheckboxTree', () => {
  let wrapper;

  const findCheckboxes = (el = wrapper) => el.findAll(GlFormCheckbox);
  const countIndeterminate = () => wrapper.findAll('.js-is-indeterminate').length || 0;
  const countChecked = () => wrapper.findAll('.js-is-checked').length || 0;
  const findCheckboxByValue = value => wrapper.find(`[data-qa-selector="${QA_PREFIX}${value}"]`);
  const getCheckboxesCount = el => findCheckboxes(el).length;
  const findCheckboxInput = checkbox => checkbox.find('input[type="checkbox"]');
  const expectCheckboxUnchecked = checkbox => {
    const input = findCheckboxInput(checkbox);
    expect(input.element.checked).toBe(false);
    expect(input.element.indeterminate).toBe(false);
  };
  const expectCheckboxIndeterminate = checkbox =>
    expect(findCheckboxInput(checkbox).element.indeterminate).toBe(true);
  const expectCheckboxChecked = checkbox =>
    expect(findCheckboxInput(checkbox).element.checked).toBe(true);

  const createWrapper = (props = {}) => {
    wrapper = mount(GlFormCheckboxTree, {
      propsData: {
        ...props,
      },
    });
  };

  afterEach(() => {
    wrapper.destroy();
    wrapper = null;
  });

  describe.each`
    description     | shape               | expected | initiallyChecked    | indeterminateBoxes
    ${'non-nested'} | ${SHAPE.NO_NESTING} | ${5}     | ${['1', '2', '3']}  | ${[]}
    ${'nested'}     | ${SHAPE.NESTED}     | ${5}     | ${['3', '4', '5']}  | ${[1]}
    ${'complex'}    | ${SHAPE.COMPLEX}    | ${12}    | ${[]}               | ${[]}
    ${'complex'}    | ${SHAPE.COMPLEX}    | ${12}    | ${['5', '6', '10']} | ${['1', '3', '8']}
  `(
    'initial state with a $description tree',
    ({ shape, expected, initiallyChecked, indeterminateBoxes }) => {
      beforeEach(() => {
        createWrapper({ options: getOptions(shape), [V_MODEL.PROP]: initiallyChecked });
      });

      it('renders properly', () => {
        expect(wrapper.isVueInstance()).toBe(true);
      });

      it('renders as many checkboxes as there are options', () => {
        expect(getCheckboxesCount()).toBe(expected);
      });

      it('checks boxes based on passed value', () => {
        expect(countChecked()).toBe(initiallyChecked.length);
        initiallyChecked.forEach(box => {
          expectCheckboxChecked(findCheckboxByValue(box));
        });
      });

      it('sets indeterminate state on checkboxes that have some children checked', () => {
        expect(countIndeterminate()).toBe(indeterminateBoxes.length);
        indeterminateBoxes.forEach(box => {
          expectCheckboxIndeterminate(findCheckboxByValue(box));
        });
      });
    }
  );

  describe.each`
    description     | shape               | boxToCheck
    ${'non-nested'} | ${SHAPE.NO_NESTING} | ${1}
    ${'nested'}     | ${SHAPE.NESTED}     | ${1}
    ${'complex'}    | ${SHAPE.COMPLEX}    | ${1}
  `('when checking a parent checkbox in a $description tree', ({ shape, boxToCheck }) => {
    let checkbox;

    beforeEach(() => {
      createWrapper({ options: getOptions(shape) });
      checkbox = wrapper.find(`[data-qa-selector="${QA_PREFIX}${boxToCheck}"]`);
      checkbox.find('input').trigger('click');
      return wrapper.vm.$nextTick();
    });

    it("checks all of the checkbox's children, if any", () => {
      const childrenBoxes = findCheckboxes(checkbox);
      const checkedChildren = childrenBoxes.filter(box => findCheckboxInput(box).element.checked);
      expect(checkedChildren.length).toBe(childrenBoxes.length);
    });
  });

  describe.each`
    description  | shape            | boxesToCheck  | indeterminateBoxes | checkedParents
    ${'nested'}  | ${SHAPE.NESTED}  | ${[4]}        | ${[1, 3]}          | ${[]}
    ${'nested'}  | ${SHAPE.NESTED}  | ${[4, 5]}     | ${[1]}             | ${[3]}
    ${'nested'}  | ${SHAPE.NESTED}  | ${[2, 4, 5]}  | ${[]}              | ${[1, 3]}
    ${'complex'} | ${SHAPE.COMPLEX} | ${[6]}        | ${[1, 3]}          | ${[5]}
    ${'complex'} | ${SHAPE.COMPLEX} | ${[6, 10]}    | ${[1, 3, 8]}       | ${[5]}
    ${'complex'} | ${SHAPE.COMPLEX} | ${[6, 9, 10]} | ${[1, 3]}          | ${[5, 8]}
  `(
    'when checking child checkboxes in a $description tree',
    ({ shape, boxesToCheck, indeterminateBoxes, checkedParents }) => {
      beforeEach(() => {
        createWrapper({ options: getOptions(shape) });
        boxesToCheck.forEach(box => findCheckboxInput(findCheckboxByValue(box)).trigger('click'));
        return wrapper.vm.$nextTick();
      });

      it('parents that have remaining unchecked children become indeterminate', () => {
        expect(countIndeterminate()).toBe(indeterminateBoxes.length);
        indeterminateBoxes.forEach(indeterminateBox => {
          expectCheckboxIndeterminate(findCheckboxByValue(indeterminateBox));
        });
      });

      it('parents that have all their children checked become checked as well', () => {
        checkedParents.forEach(checkedParent => {
          expectCheckboxChecked(findCheckboxByValue(checkedParent));
        });
      });
    }
  );

  describe.each`
    description  | shape            | initiallyChecked                        | boxesToUncheck | indeterminateBoxes | uncheckedBoxes
    ${'nested'}  | ${SHAPE.NESTED}  | ${['1', '2', '3', '4', '5']}            | ${[1]}         | ${[]}              | ${[1, 2, 3, 4, 5]}
    ${'nested'}  | ${SHAPE.NESTED}  | ${['1', '2', '3', '4', '5']}            | ${[3]}         | ${[1]}             | ${[3, 4, 5]}
    ${'complex'} | ${SHAPE.COMPLEX} | ${['3', '4', '5', '6']}                 | ${[3]}         | ${[]}              | ${[3, 4, 5, 6]}
    ${'complex'} | ${SHAPE.COMPLEX} | ${['3', '4', '5', '6']}                 | ${[4, 6]}      | ${[]}              | ${[3, 4, 5, 6]}
    ${'complex'} | ${SHAPE.COMPLEX} | ${['3', '4', '5', '6', '8', '9', '10']} | ${[10]}        | ${[1, 8]}          | ${[10]}
  `(
    'when unchecking checkboxes in a $description tree',
    ({ shape, initiallyChecked, boxesToUncheck, indeterminateBoxes, uncheckedBoxes }) => {
      beforeEach(() => {
        createWrapper({ options: getOptions(shape), [V_MODEL.PROP]: initiallyChecked });
        boxesToUncheck.forEach(box => findCheckboxInput(findCheckboxByValue(box)).trigger('click'));
        return wrapper.vm.$nextTick();
      });

      it("unchecks all of the checkbox's children if any", () => {
        uncheckedBoxes.forEach(uncheckedBox => {
          expectCheckboxUnchecked(findCheckboxByValue(uncheckedBox));
        });
      });

      it('sets parent checkboxes in the indeterminate state if needed', () => {
        expect(countIndeterminate()).toBe(indeterminateBoxes.length);
        indeterminateBoxes.forEach(indeterminateBox => {
          expectCheckboxIndeterminate(findCheckboxByValue(indeterminateBox));
        });
      });
    }
  );
});
