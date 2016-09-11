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

export const createContext = (label = 'anonymous') => {
  const ctx = {};
  const disposables = [];
  let hasRun = false;
  let state = {};

  const run = (computation) => {
    if (hasRun) {
      throw new Error('Each context can only run once');
    }

    hasRun = true;
    ctx.parent = currentContext;

    // inherit states
    if (ctx.parent) {
      const parentState = Object.create(ctx.parent.getState());
      state = Object.assign(parentState, state);
    }
    currentContext = ctx;

    computation();
    currentContext = ctx.parent;
  }

  // public API
  ctx.run = run;
  ctx.addDisposable = (disposable) => disposables.push(disposable);
  ctx.dispose = () => disposables.forEach(fn => fn());
  ctx.getState = () => state
  ctx.toString = () => `[Context ${label}]`;
  return ctx;
}

export const withContext = fn => function (...params) {
  const ctx = createContext();
  return ctx.run(() => {
    fn.apply(this, params);
  });
}
