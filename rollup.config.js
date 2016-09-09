import buble from 'rollup-plugin-buble';
import strip from 'rollup-plugin-strip';

const capitalize = str => str[0].toUpperCase() + str.slice(1);

const plugin = process.env.BUILD_PLUGIN;
const entry = plugin ? `src/patches/${plugin}.js` : 'src/index.js';
const moduleName = plugin ? `EventContextPlugin${capitalize(plugin)}` : 'EventContext';
const dest = plugin ? `build/plugins-${plugin}` : 'build/core';

export default {
  moduleName,
  entry,
  targets: [
    { dest: `${dest}/index.js`, format: 'cjs' },
    { dest: `${dest}/index.es.js`, format: 'es' },
    { dest: `${dest}/dist/index.js`, format: 'umd' },
  ],
  format: 'iife',
  plugins: [buble(), strip({
    debugger: true,
    // defaults to `[ 'console.*', 'assert.*' ]`
    functions: [ 'console.*', 'assert.*', 'debug', 'alert' ],
  })],
  globals: {
    'event-context': 'EventContext',
  }
};
