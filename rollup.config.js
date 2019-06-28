import babel from 'rollup-plugin-babel';
import vue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import css from 'rollup-plugin-css-porter';
import svg from 'rollup-plugin-svg';
import commonjs from 'rollup-plugin-commonjs';
import glob from 'glob';

export default glob
  .sync('+(components|directives)/**/!(*.stories).+(js|vue)')
  .concat('charts.js')
  .concat('index.js')
  .map(input => {
    const outputFilename = input.replace(/\.(vue|js)$/, '');

    return {
      external: [
        '@gitlab/ui',
        'copy-to-clipboard',
        'echarts',
        'lodash/mergeWith',
        'lodash.get',
        'lodash.startcase',
        'popper.js',
        'vue-functional-data-merge',
        'vue',
      ],
      input,
      output: {
        format: 'esm',
        file: `dist/${outputFilename}.js`,
      },
      plugins: [
        css({
          dest: 'dist/gitlab_ui.css',
        }),
        svg(),
        string({
          include: '**/*.md',
        }),
        vue(),
        babel({
          exclude: ['node_modules/!(bootstrap-vue)/**'],
        }),
        resolve(),
        commonjs({
          namedExports: {
            echarts: ['echarts'],
          },
        }),
      ],
    };
  });
