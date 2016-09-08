const context = require('./context');
const patchSetTimeout = require('./patches/setTimeout');

patchSetTimeout.patch();

module.exports = context;
