import { documentedStoriesOf } from '../../../../../documentation/documented_stories';

const template = `
  <div>
    <h3>The Tab component should not be used on its own</h3>
    <p><code>&lt;gl-tab /&gt;</code> can only be used with <code>&lt;gl-tabs /&gt;</code> as the immediate parent</p>
  </div>
`;

documentedStoriesOf('base/tabs/tab', '').add('default', () => ({
  template,
}));
