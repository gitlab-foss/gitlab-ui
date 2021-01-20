import { withKnobs, boolean } from '@storybook/addon-knobs';
import { documentedStoriesOf } from '../../../../../documentation/documented_stories';
import readme from './form_textarea.md';
import { GlFormTextarea } from '../../../../../index';

const components = {
  GlFormTextarea,
};

const template = `
  <gl-form-textarea
    v-model="model"
    :placeholder="placeholder"
    :rows="5"
    :no-resize="noResize"
  />
`;

function generateProps({ noResize = GlFormTextarea.props.noResize.default } = {}) {
  return {
    model: {
      type: String,
      default:
        'We take inspiration from other companies, and we always go for the boring solutions. Just like the rest of our work, we continually adjust our values and strive always to make them better. We used to have more values, but it was difficult to remember them all, so we condensed them and gave sub-values and created an acronym. Everyone is welcome to suggest improvements.',
    },
    placeholder: {
      type: String,
      default: 'hello',
    },
    noResize: {
      type: Boolean,
      default: boolean('no-resize', noResize),
    },
  };
}

documentedStoriesOf('base/form/form-textarea', readme)
  .addDecorator(withKnobs)
  .add('default', () => ({
    components,
    props: generateProps(),
    template,
  }));
