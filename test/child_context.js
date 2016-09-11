import { createContext, getCurrentContext } from '../src/context';
import * as natives from '../src/natives';
import * as promise from '../src/promise';
import { expect } from 'chai';
import { once } from 'lodash';

describe('getState', () => {
  describe('Promise', () => {
    before(natives.patch);
    before(promise.patch);
    after(natives.unpatch);
    after(promise.unpatch);

    it('should return parent ctx if .then is call in outer scope', done => {
      const ctx = createContext('parent');
      const checker = value => {
        const current = getCurrentContext();
        expect(value).to.equal(42);
        expect(String(current)).equal('[Context parent]')
        done()
      };

      ctx.run(() => {
        const promise = new Promise((resolve) => {
          const childCtx = createContext('child');
          childCtx.run(() => setTimeout(() => {
            resolve(42);
          }, 10))
        });

        promise.then(checker).catch(done);
      });
    });

    it('should switch to correct ctx', done => {
      const ctx = createContext('parent');
      const sleep = ms => new Promise(resolve => {
        setTimeout(resolve, ms)
      });

      const checker = value => {
        const current = getCurrentContext();
        expect(value).to.equal(42);
        expect(String(current)).equal('[Context child]')
        done()
      };

      ctx.run(() => {
        const promise = new Promise((resolve) => {
          const childCtx = createContext('child');
          childCtx.run(() => {
            sleep(10)
              .then(() => {
                return 42
              })
              .then(checker)
              .catch(done)
          })
        });
      });
    });

    it('should inherit data from parent\'s state', done => {
      const parent = createContext('parent');
      const child = createContext('child');

      const pState = parent.getState();
      const cState = child.getState();

      pState.parentOnly = 'parentOnly';
      pState.shared = 'parentShared';

      cState.childOnly = 'childOnly';
      cState.shared = 'childOverwrite';

      const childComputation = () => setTimeout(() => {
        // child
        const state = getCurrentContext().getState();
        expect(state.childOnly).equal('childOnly');
        expect(state.shared).equal('childOverwrite');
        expect(state.parentOnly).equal('parentOnly');
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
      })
    })
  });
});
