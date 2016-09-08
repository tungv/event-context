const { getCurrentContext, setCurrentContext, revertContext } = require('../context');

const nativeSetTimeout = global.setTimeout;

const unpatch = () => {
  global.setTimeout = nativeSetTimeout;
};

const patchSetTimeout = () => {
  global.setTimeout = (fn, ms, ...params) => {
    const currentContext = getCurrentContext();
    if (!currentContext) {
      return nativeSetTimeout(fn, ms, ...params);
    }

    currentContext.label && console.log('> setTimeout', currentContext.label);
    const computation = () => {
      currentContext.label && console.log('> setTimeout.computation', currentContext.label);
      setCurrentContext(currentContext);
      fn(...params);
      revertContext();
    }
    const id = nativeSetTimeout(computation, ms);
    currentContext.disposables.push(() => clearTimeout(id));
    return id;
  }

  return unpatch;
}

exports.patch = patchSetTimeout;
exports.unpatch = unpatch;
