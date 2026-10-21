export { c as createHead } from './shared/unhead.CaeaMM5q.mjs';
export { c as createDomRenderer, r as renderDOMHead } from './shared/unhead.DD4N5B4k.mjs';
import './shared/unhead.D7HkBzZn.mjs';
import './shared/unhead.CGPOfp5O.mjs';
import './shared/unhead.Bm4Y6XQI.mjs';
import 'hookable';
import './shared/unhead.C5Bksi2B.mjs';
import './shared/unhead.DJuZwX9c.mjs';

function createDebouncedFn(callee, delayer) {
  let ctxId = 0;
  return () => {
    const delayFnCtxId = ++ctxId;
    delayer(() => {
      if (ctxId === delayFnCtxId) {
        callee();
      }
    });
  };
}

export { createDebouncedFn };
