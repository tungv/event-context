import { createContext } from '../src/context';
import { patch, unpatch } from '../src/natives';
import { expect } from 'chai';
import { once } from 'lodash';

describe('createContext', () => {
  describe('Promise', () => {
    before(patch);
    after(unpatch);

    it('should work with Promise', done => {
      const ctx = createContext();
      ctx.run(() => {
        const promise = new Promise((resolve) => {
          setTimeout(() => {
            resolve(42);
          }, 10)
        });

        promise.then(value => {
          expect(value).to.equal(42);
          done()
        });
      });
    });

    it('should stop promises', done => {
      const fail = label => done.bind(null, new Error(label));
      const ctx = createContext();
      ctx.run(() => {
        const promise = new Promise((resolve) => {
          setTimeout(() => {
            resolve(42);
          }, 20)
        });

        promise.then(value => {
          fail();
        });
      });

      setTimeout(ctx.dispose, 10);
      setTimeout(done, 30);
    });
  });
});
