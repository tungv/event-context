import { getCurrentContext, setCurrentContext, revertContext } from './context';

const nativeSetTimeout = global.setTimeout;
const nativeSetInterval = global.setInterval;

const native = {
  Timeout: global.setTimeout,
  Interval: global.setInterval,
}

export const unpatch = () => {
  global.setTimeout = native.Timeout;
  global.setInteval = native.Interval;
};

export const patch = () => {
  const methods = ['Timeout', 'Interval'];

  methods.forEach(method =>
    global[`set${method}`] = (fn, ms, ...params) => {
      const currentContext = getCurrentContext();
      if (!currentContext) {
        return native[method](fn, ms, ...params);
      }

      const computation = () => {
        setCurrentContext(currentContext);
        fn(...params);
        revertContext();
      }
      const id = native[method](computation, ms);
      const dispose = () => global[`clear${method}`](id);
      currentContext.addDisposable(dispose);
      return id;
    }
  );

  return unpatch;
}
