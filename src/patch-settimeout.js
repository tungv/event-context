const { getCurrentContext, setCurrentContext, revertContext } = require('./context');

const nativeSetTimeout = global.setTimeout;

const patchSetTimeout = () => {
  global.setTimeout = (fn, ms, ...params) => {
    const currentContext = getCurrentContext();
    if (!currentContext) {
      return nativeSetTimeout(fn, ms, ...params);
    }

    const parentContext = currentContext;
    currentContext.label && console.log('> setTimeout', currentContext.label);
    const computation = () => {
      parentContext.label && console.log('> setTimeout.computation', parentContext.label);
      setCurrentContext(parentContext);
      fn(...params);
      revertContext();
    }
    const id = nativeSetTimeout(computation, ms);
    currentContext.disposables.push(() => clearTimeout(id));
    return id;
  }
}

patchSetTimeout();
