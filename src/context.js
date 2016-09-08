let prevContext = null;
let currentContext = null;

const getCurrentContext = () => currentContext;
const setCurrentContext = ctx => {
  prevContext = currentContext;
  currentContext = ctx;
}
const revertContext = () => {
  currentContext = prevContext;
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

exports.createContext = createContext;
exports.getCurrentContext = getCurrentContext;
exports.setCurrentContext = setCurrentContext;
exports.revertContext = revertContext;
