import { getCurrentContext, setCurrentContext, revertContext } from 'event-context';

export const patch = $ => {
  const $add = $.event.add;
  const $remove = $.event.remove;

  $.event.add = function (elem, types, handler, data, selector) {
    // console.log(elem, types, handler, data, selector);
    const ctx = getCurrentContext();
    if (!ctx) {
      return $add.call(this, elem, types, handler, data, selector);
    }

    const computation = function (...args) {
      setCurrentContext(ctx);
      handler.__computation = computation;
      handler.call(this, ...args);
      revertContext();
    }

    ctx.disposables.push(
      () => {
        $remove(elem, types, computation, selector);
      }
    );

    return $add.call(this, elem, types, computation, data, selector);
  }

  $.event.remove = function (elem, types, handler, selector, mappedTypes) {
    if (typeof handler === 'function' && typeof handler.__computation === 'function') {
      return $remove.call(this, elem, types, handler.__computation, selector, mappedTypes);
    }
    return $remove.call(this, elem, types, handler, selector, mappedTypes);
  }
}
