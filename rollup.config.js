import buble from 'rollup-plugin-buble';
import strip from 'rollup-plugin-strip';

export default {
  moduleName: 'EventContext',
  entry: 'src/index.js',
  dest: 'dist/index.js',
  format: 'umd',
  plugins: [buble(), strip({
    debugger: true,
    // defaults to `[ 'console.*', 'assert.*' ]`
    functions: [ 'console.log', 'assert.*', 'debug', 'alert' ],
  })]
};
