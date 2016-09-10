import { patch, unpatch } from '../src/plugins/node/index';
import { expect } from 'chai';
import { once } from 'lodash';
import { createContext, getCurrentContext } from '../src/context';
import * as native from '../src/natives';

const nativeSetTimeout = global.setTimeout;

describe('createContext', () => {
  describe('patch process.nextTick', () => {
    before(patch);
    before(native.patch);
    after(unpatch);
    after(native.unpatch);

    it('should run the context', (done) => {
      const context = createContext();
      context.run(() => {
        const id = process.nextTick(() => {
          done();
        });
      });
    });

    it('should stop process.nextTick', (done) => {
      const context = createContext('ctx');
      const doneOnce = once(done);
      const fail = label => doneOnce.bind(null, new Error);

      const computation = () => {
        process.nextTick(() => {
          setTimeout(fail('could not stop nextTick'), 20);
        });
      }

      context.run(computation);

      nativeSetTimeout(context.dispose, 10);
      nativeSetTimeout(doneOnce, 50);
    });

    it('should stop nested computations', (done) => {
      const ctx1 = createContext('nested');
      const doneOnce = once(done);
      const fail = label => doneOnce.bind(null, new Error(label));

      const computation = () => {
        process.nextTick(() => {
          process.nextTick(() => {
            setTimeout(fail('nested computation did not stop'), 20)
          })
        })
      };
      ctx1.run(computation);
      nativeSetTimeout(ctx1.dispose, 10);
      nativeSetTimeout(doneOnce, 30);
    });

    it('should not stop parallel contexts', (done) => {
      const doneOnce = once(done);
      const fail = label => doneOnce.bind(null, new Error(label));

      const ctx1 = createContext('ctx1');
      const ctx2 = createContext('ctx2');

      ctx1.run(() => process.nextTick(
        () => setTimeout(fail('could not stop failed computation'), 20)
      ));
      ctx2.run(() => process.nextTick(
        () => setTimeout(doneOnce, 30)
      ));

      nativeSetTimeout(ctx1.dispose, 10);
      nativeSetTimeout(fail('ctx2 is not done in time'), 40);
    });
  });
});
