import multiEntry from 'rollup-plugin-multi-entry';
import buble from 'rollup-plugin-buble';
import alias from 'rollup-plugin-alias';
import path from 'path';

const tests = process.env.TESTS;
const entry = tests ? tests.split(',').map(t => `test/${t}.js`) : 'test/*.js';

export default {
  moduleName: 'EventContext',
  entry,
  dest: '_test/index.js',
  format: 'cjs',
  plugins: [
    multiEntry(),
    buble(),
    alias({
      'event-context': path.resolve('./src'),
    }),
  ]
};
