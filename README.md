# event-context

- Event context for JavaScript
- Work in both NodeJS and browsers
- No dependencies

## Features

1. automatic state passing to downstream functions without explicitly declaring them in functions' parameters (think of [React's context](https://facebook.github.io/react/docs/context.html) but with inheritance). State values are accessible everywhere with `ctx.getState()`
2. automatic disposal for every pending tasks and event listeners to prevent memory leaks. EventContext works with Promise as well, so you can abort nested unresolved promises with ease. Context disposal is accessible everywhere with `ctx.dispose()`

# Plugins
EventContext for jQuery (jQuery events) https://www.npmjs.com/package/event-context-plugin-jquery

EventContext for NodeJS (nextTick, EventEmitter) https://www.npmjs.com/package/event-context-plugin-node

## Installation:

```bash
npm i -S event-context

# to use it with a plugin, just add the plugin package
npm i -S event-context-plugin-node
```

## Usages

### Passing data across functions without declaring them each time.

This is super useful to getting the request that causing an unexpected error.
See the example below, it was not easy to get the req inside a downstream function
without explicitly passing the req along the way.

```js
import { withContext, getCurrentContext } from 'event-context';
import { patch } from 'event-context-plugin-node';

// patch all NodeJS binding after this call
patch();

const server = http.createServer(withContext((req, res) => {
  const ctx = getCurrentContext();
  const state = ctx.getState();

  state.req = req;

  handleRequest(req.path, (err, value) => {
    res.end(value);
  });
}));

function handleRequest(path, callback) {
  // do some works with path
  process.nextTick(() => {
    callDB(callback);
  });
}

function callDB(callback) {
  try {
    somethingWrong();
  } catch (ex) {
    const ctx = currentContext();
    const { req } = ctx.getState();
    const { method, url } = req;
    console.error('Server Error. Gracefully dying. Request causing error: ', method, url);
  }
}

```

### State inheritance

State values are prototypically inherited (think of angular1's `scope`).

```js

// initiate contexts
const parent = createContext('parent');
const child = createContext('child');

const pState = parent.getState();
const cState = child.getState();

// state can be set even before running.
pState.parentOnly = 'parentOnly';
pState.shared = 'parentShared';

cState.childOnly = 'childOnly';
cState.shared = 'childOverwrite';

const childComputation = () => setTimeout(() => {
  // child
  const state = getCurrentContext().getState();
  expect(state.childOnly).equal('childOnly');
  expect(state.parentOnly).equal('parentOnly');
  expect(state.shared).equal('childOverwrite');
  done();
}, 10);

const parentComputaion = () => setTimeout(() => {
  // parent
  child.run(() => {
    // child
    childComputation()
  })
}, 10)

parent.run(() => {
  // parent
  parentComputaion();
});

```

### Auto unbinding

When you decide to stop all event listeners created in an context, just call `ctx.dispose()`

```js
const ctx = getCurrentContext();
ctx.dispose()
```

All bound event handlers within the context will be removed.

## Contributions
All contributions are super welcome
