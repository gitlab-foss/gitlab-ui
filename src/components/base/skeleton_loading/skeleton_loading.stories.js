import { withKnobs, number } from '@storybook/addon-knobs';
import { documentedStoriesOf } from '../../../../documentation/documented_stories';
import readme from './skeleton_loading.md';
import { GlDeprecatedSkeletonLoading } from '../../../../index';

const components = {
  GlDeprecatedSkeletonLoading,
};

const template = '<gl-deprecated-skeleton-loading :lines="lines" />';

function generateProps() {
  return {
    lines: {
      type: Number,
      default: number('lines', 3, {
        range: true,
        min: 1,
        max: 3,
        step: 1,
      }),
    },
  };
}

documentedStoriesOf('base/skeleton-loading', readme)
  .addDecorator(withKnobs)
  .add('default', () => ({
    props: generateProps(),
    components,
    template,
  }));
