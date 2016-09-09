import multiEntry from 'rollup-plugin-multi-entry';
import buble from 'rollup-plugin-buble';

export default {
  moduleName: 'EventContext',
  entry: 'test/*.js',
  dest: '_test/index.js',
  format: 'cjs',
  plugins: [multiEntry(), buble()]
};
