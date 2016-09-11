import { getCurrentContext, setCurrentContext, revertContext } from './context';

const methods = ['then', 'catch', 'finally'];
const natives = {};
let patched = false;

export const unpatch = () => {
  patched = false;
  methods.forEach(method => {
    global.Promise.prototype[method] = natives[method];
  })
};

export const patch = () => {
  if (patched) {
    console.warn(`Cannot call patch() for promise twice`);
    return;
  }
  patched = true;
  const proto = Promise.prototype;
  methods.forEach(method => {
    // store the original version
    natives[method] = proto[method];

    // patching
    proto[method] = function (...params) {
      const currentContext = getCurrentContext();
      if (!currentContext) {
        return natives[method].apply(this, params);
      }

      const wrappedParams = params.map(f => {
        if (typeof f !== 'function') {
          return f;
        }

        const computation = (...args) => {
          setCurrentContext(currentContext);
          const ret = f.apply(this, args);
          revertContext();
          return ret;
        }

        return computation;
      });

      return natives[method].apply(this, wrappedParams);
    };
  });

  return unpatch;
}
