import { withKnobs } from '@storybook/addon-knobs';
import { documentedStoriesOf } from '../../../../documentation/documented_stories';
import readme from './dashboard_skeleton.md';
import { GlDashboardSkeleton } from '../../../../index';

const components = {
  GlDashboardSkeleton,
};

const template = `
  <gl-dashboard-skeleton />
`;

documentedStoriesOf('regions/dashboard-skeleton', readme)
  .addDecorator(withKnobs)
  .add('default', () => ({
    components,
    template,
  }));
