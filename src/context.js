let prevContext = null;
let currentContext = null;

export const getCurrentContext = () => currentContext;
export const setCurrentContext = ctx => {
  prevContext = currentContext;
  currentContext = ctx;
}
export const revertContext = () => {
  currentContext = prevContext;
}

export const createContext = (label) => {
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
    ctx.disposables.forEach(fn => fn());
  }

  Object.assign(ctx, {
    run,
    dispose,
  });

  return ctx;
}
