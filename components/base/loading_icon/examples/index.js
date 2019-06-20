import LoadingIconBasicExample from './loading_icon.basic.example.vue';
import LoadingIconBigExample from './loading_icon.big.example.vue';
import LoadingIconInlineExample from './loading_icon.inline.example.vue';
import LoadingIconAllOptionsExample from './loading_icon.all.example.vue';

export default [
  {
    name: 'Basic',
    items: [
      {
        id: 'loading-icon-basic',
        name: 'Basic',
        description: 'Basic Loading Icon',
        component: LoadingIconBasicExample,
      },
      {
        id: 'loading-icon-big',
        name: 'Big',
        description: 'Big Loading Icon',
        component: LoadingIconBigExample,
      },
      {
        id: 'loading-icon-inline',
        name: 'Inline',
        description: 'Loading Icon Inline',
        component: LoadingIconInlineExample,
      },
    ],
  },
  {
    name: 'Full',
    items: [
      {
        id: 'loading-icon-all-options',
        name: 'All sizes and colors',
        description: 'Loading Icon: all sizes and colors',
        component: LoadingIconAllOptionsExample,
      },
    ],
  },
];
