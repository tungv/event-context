const fs = require('fs');
const { execSync } = require('child_process');
const corePackage = require('./package.json');
const pluginPackage = require('./plugin-package-template.json');

const PLUGIN_NAMES = process.argv.slice(2);

PLUGIN_NAMES.forEach(buildPlugin);

function buildPlugin (PLUGIN_NAME) {
  const PLUGIN_PACKAGE_NAME = `event-context-plugin-${PLUGIN_NAME}`;
  const CORE_VERSION = corePackage.version;
  const SRC = `./src/plugins/${PLUGIN_NAME}`
  const DEST = `./build/plugins-${PLUGIN_NAME}`

  console.info(`
building plugin:  ${PLUGIN_NAME}
npm package:      ${PLUGIN_PACKAGE_NAME}
core version:     ${CORE_VERSION}
output:           ${DEST}
  `)

  console.info('bundling plugin package');
  execSync(`rollup -c --environment BUILD_PLUGIN:${PLUGIN_NAME}`);
  console.info('bundling done');

  pluginPackage.name = PLUGIN_PACKAGE_NAME;
  pluginPackage.version = CORE_VERSION;
  pluginPackage.peerDependencies['event-context'] = `^${CORE_VERSION}`;
  pluginPackage.description = `${PLUGIN_NAME} plugin for event-context (Universal event context library for JavaScript)`;

  const outputPackageJson = JSON.stringify(pluginPackage, null, 2);
  console.info(`
    ----------------
    package.json
    ${outputPackageJson.split('\n').join('\n  ')}
  `);

  fs.writeFileSync(`${DEST}/package.json`, outputPackageJson);
  fs.createReadStream(`${SRC}/README.md`).pipe(fs.createWriteStream(`${DEST}/README.md`));

}
