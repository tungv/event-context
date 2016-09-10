# event-context

- Event context for JavaScript
- Work in both NodeJS and browsers
- No dependencies

## The concept
Group related events. Similar to nodejs's domain module.
Related events now can share a contextual storage via `ctx.getState()`

# event-context-plugin-node
Make EventContext package aware of jQuery bindings

## Installation:

```bash
npm i -S event-context event-context-plugin-node
```

## Usages

### Passing data across functions without declaring them each time.

```js
import { withContext, getCurrentContext } from 'event-context';
import { patch } from 'event-context-plugins-node';

// patch all NodeJS binding after this call
patch();

const server = http.createServer(withContext((req, res) => {
  const ctx = getCurrentContext();
  const state = ctx.getState();

  state.theMeaningOfLife = 42;
  state.method = req.method;

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
  // now assume you need the meaning of life and req method
  // you don't need to pass those values to handleRequest and then to callDB
  // just take it from the currentContext
  const ctx = currentContext();
  const { theMeaningOfLife, method } = ctx.getState();
  console.log(theMeaningOfLife); // log 42
  console.log(method); // log the method that called the handleRequest that called this callDB
  callback();
}

```

### Auto unbinding

When you decide to stop all event listeners created in an context, just call `ctx.dispose()`

```
const ctx = getCurrentContext();
ctx.dispose()
```

All bound event handlers within the context will be removed.

## See also
EventContext for jQuery https://www.npmjs.com/package/event-context-plugin-jquery
