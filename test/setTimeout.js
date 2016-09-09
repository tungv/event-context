import { createContext } from '../src/context';
import { patch, unpatch } from '../src/natives';
import { expect } from 'chai';
import { once } from 'lodash';

const nativeSetTimeout = global.setTimeout;

describe('createContext', () => {
  describe('patch setTimeout', () => {
    before(patch);
    after(unpatch);

    it('should run the context', (done) => {
      const context = createContext();
      context.run(() => setTimeout(done, 60));
    });

    it('should stop setTimeout', (done) => {
      const context = createContext();
      const doneOnce = once(done);
      const fail = label => doneOnce.bind(null, new Error);

      const computation = () => setTimeout(fail, 60);
      context.run(computation);

      nativeSetTimeout(context.dispose, 10);
      nativeSetTimeout(doneOnce, 100);
    });

    it('should stop nested computations', (done) => {
      const ctx1 = createContext();
      const doneOnce = once(done);
      const fail = label => doneOnce.bind(null, new Error(label));

      const computation = () => {
        setTimeout(() => {
          setTimeout(fail('nested computation did not stop'), 30)
        }, 30)
      };
      ctx1.run(computation);
      nativeSetTimeout(ctx1.dispose, 40);
      nativeSetTimeout(doneOnce, 100);
    });

    it('should not stop parallel contexts', (done) => {
      const doneOnce = once(done);
      const fail = label => doneOnce.bind(null, new Error(label));

      const ctx1 = createContext();
      const ctx2 = createContext();

      ctx1.run(() => setTimeout(fail('could not stop failed computation'), 30));
      ctx2.run(() => setTimeout(doneOnce, 50));

      nativeSetTimeout(ctx1.dispose, 1);
      nativeSetTimeout(fail('ctx2 is not done in time'), 60);
    });
  });
});
