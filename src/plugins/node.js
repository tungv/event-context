import EventEmitter from 'events';
import { getCurrentContext, setCurrentContext, revertContext } from 'event-context';

const nextTick = process.nextTick;

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
}

export const unpatch = () => {
  process.nextTick = nextTick;
}
