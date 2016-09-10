# event-context

- Event context for JavaScript
- Work in both NodeJS and browsers
- No dependencies

## The concept
Group related events. Similar to nodejs's domain module.
Related events now can share a contextual storage via `ctx.getState()`

# event-context-plugin-jquery
Make EventContext package aware of jQuery bindings

## Installation:

```bash
npm i -S event-context event-context-plugin-jquery
```

## Usages

### Passing data across functions without declaring them each time.

```js
import { createContext, getCurrentContext } from 'event-context';
import { patch } from 'event-context-plugins-jquery';

// patch all jQuery binding after this call
patch();

$(function () {
  function doSth() {
    callSomethingElse();
  }

  function callSomethingElse() {
    const ctx = getCurrentContext();
    console.log('the context data is:', ctx.getState());
    // the above line will print { theMeaningOfLife: 42, x: ..., y: ... } with x, y values will fill in automagically
  }

  // ... some code
  const ctx = createContext();

  $('#awesome-button').click(function (e) {
    ctx.run(() => {
      const state = ctx.getState();
      state.theMeaningOfLife = 42;
      // get the click position
      state.x = e.pageX;
      state.y = e.pageY;

      // you don't need to pass everything here
      doSth();
    });
  });
});

// if you only care about the state, not the context, you can skip createContext step and replace it with
$('#awesome-button').click(withContext(function (e) {
  const ctx = getCurrentContext();
  const state = ctx.getState();
  state.theMeaningOfLife = 42;
  state.x = e.pageX;
  state.y = e.pageY;

  doSth();
}));

```

### Auto unbinding

When you decide to stop all event listeners created in an context, just call `ctx.dispose()`

```js
const ctx = getCurrentContext();
ctx.dispose()
```

All bound event handlers within the context will be removed.

## See also
EventContext for NodeJS https://www.npmjs.com/package/event-context-plugin-node
