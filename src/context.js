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
  const ctx = {};
  const disposables = [];
  const state = {};

  const run = (computation) => {
    prevContext = currentContext;
    currentContext = ctx;
    computation();
    currentContext = prevContext;
  }

  const addDisposable = (disposable) => disposables.push(disposable);

  const dispose = () => {
    disposables.forEach(fn => fn());
  }

  const getState = () => state;

  // public API
  ctx.run = run;
  ctx.addDisposable = addDisposable;
  ctx.dispose = dispose;
  ctx.getState = getState;
  return ctx;
}

export const withContext = fn => function (...params) {
  const ctx = createContext();
  return ctx.run(() => {
    fn.apply(this, params);
  });
}
