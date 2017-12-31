import EventEmitter from 'events';
import { getCurrentContext, setCurrentContext, revertContext } from 'event-context';

const instanceMap = new WeakMap;
const listenerMap = new WeakMap;
const nextTick = process.nextTick;
const proto = EventEmitter.prototype;
const eEmit = proto.emit;
const eAddListener = proto.addListener;
const ePrependListener = proto.prependListener;
const eRemoveListener = proto.removeListener;
const eListeners = proto.listeners;
const noop = () => {}

export const patch = () => {
  process.nextTick = (callback, ...rest) => {
    const ctx = getCurrentContext();
    if (!ctx) {
      return nextTick(callback, ...rest);
    }

    if (callback.__test === true) {
      console.log(ctx.label);
    }

    const computation = (...args) => {
      setCurrentContext(ctx);
      callback(...args);
      revertContext();
    }

    nextTick(computation, ...rest)
  }

  const wrap = nativeAddFunction => function (type, handler) {
    const ctx = getCurrentContext();
    if (!ctx) {
      return nativeAddFunction.call(this, type, handler);
    }

    const computation = (...args) => {
      setCurrentContext(ctx);
      const ret = handler.call(this, ...args);
      revertContext();
      return ret;
    }

    if (handler.listener) {
      computation.listener = handler.listener;
    }

    const handlerMap = instanceMap.get(this) || new WeakMap();
    handlerMap.set(handler, computation);
    instanceMap.set(this, handlerMap);
    listenerMap.set(computation, handler);
    const dispose = () => {
      eRemoveListener.call(this, type, computation);
      const handlerMap = instanceMap.get(this);
      if (handlerMap) {
        handlerMap.delete(handler);
      }
    }

    ctx.addDisposable(dispose);
    return nativeAddFunction.call(this, type, computation);
  }


  proto.addListener = proto.on = wrap(eAddListener);
  proto.prependListener = wrap(ePrependListener);

  proto.listeners = function (type) {
    const listeners = eListeners.call(this, type);
    return listeners.map(handler => listenerMap.get(handler) || handler);
  }

  proto.removeListener = function (type, listener) {
    const handlerMap = instanceMap.get(this);
    const computation = handlerMap ? handlerMap.get(listener) : null;
    return eRemoveListener.call(this, type, computation || listener);
  }
}

export const unpatch = () => {
  process.nextTick = nextTick;
  proto.addListener = proto.on = eAddListener;
  proto.prependListener = ePrependListener;
  proto.removeListener = eRemoveListener;
}
