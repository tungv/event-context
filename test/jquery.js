import { expect } from 'chai';
import { once } from 'lodash';
import jsdom from 'jsdom-global';

import { createContext } from '../src/context';
import { patch, unpatch } from '../src/plugins/jquery/index';

describe('createContext', () => {
  describe('patch jQuery', () => {
    let $;

    before(function () {
      this.timeout(10000)
      this.jsdom = jsdom();
      $ = require('jquery');
      patch($);
    });

    after(function () {
      this.jsdom();
    });

    it('should run jQuery event as normal', done => {
      const context = createContext();
      const target = $('<div />');
      const doneOnce = once(done);
      const fail = label => doneOnce.bind(null, new Error);

      const handler = () => {
        // console.log('clicked');
        target.off('click');
        doneOnce();
      };

      const computation = () => target.click(handler);
      context.run(computation);

      setTimeout(() => target.trigger('click'), 20);
      setTimeout(fail('did not trigger handler on time'), 50);
    });

    it('should stop jQuery event', done => {
      const context = createContext();
      const target = $('<div />');
      const doneOnce = once(done);
      const fail = label => doneOnce.bind(null, new Error);

      const computation = () => target.click(fail('should stop click event handler'));
      context.run(computation);

      setTimeout(context.dispose, 10);
      setTimeout(() => target.click(), 20);
      setTimeout(doneOnce, 30);
    });

    it('should let jQuery to remove event by itself', done => {
      const context = createContext();
      const target = $('<div />');

      let counter = 0;

      const handler = () => {
        ++counter;
        // console.log('clicked', counter);
        target.off('click', handler);
      };

      const computation = () => target.click(handler);
      context.run(computation);

      // first click to trigger off()
      setTimeout(() => target.trigger('click'), 20);

      // second click to test
      setTimeout(() => {
        expect(counter).equal(1);
        target.trigger('click')
      }, 40);

      setTimeout(() => {
        expect(counter).equal(1);
        context.dispose();
        done();
      }, 50);
    });
  });
});
