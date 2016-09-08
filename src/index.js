const nativeSetTimeout = global.setTimeout;

let prevContext = null;
let currentContext = null;

const getCurrentContext = () => currentContext;

const patchSetTimeout = () => {
  global.setTimeout = (fn, ms, ...params) => {
    if (!currentContext) {
      return nativeSetTimeout(fn, ms, ...params);
    }

    const parentContext = currentContext;
    currentContext.label && console.log('> setTimeout', currentContext.label);
    const computation = () => {
      parentContext.label && console.log('> setTimeout.computation', parentContext.label);
      prevContext = currentContext;
      currentContext = parentContext;
      fn(...params);
      currentContext = prevContext;
    }
    const id = nativeSetTimeout(computation, ms);
    currentContext.disposables.push(() => clearTimeout(id));
    return id;
  }
}

const createContext = (label) => {
  const ctx = {
    label,
    disposables: [],
  }

  const run = (computation) => {
    prevContext = currentContext;
    currentContext = ctx;
    computation();
    currentContext = prevContext;
  }

  const dispose = () => {
    for(let disposeFn of ctx.disposables) {
      disposeFn();
    }
  }

  Object.assign(ctx, {
    run,
    dispose,
  });

  return ctx;
}

patchSetTimeout();

exports.createContext = createContext;
exports.getCurrentContext = getCurrentContext;
