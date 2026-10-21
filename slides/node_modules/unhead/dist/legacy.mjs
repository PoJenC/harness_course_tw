import { D as DeprecationsPlugin, P as PromisesPlugin, T as TemplateParamsPlugin, A as AliasSortingPlugin } from './shared/unhead.D9VfQWNo.mjs';
import { c as createUnhead } from './shared/unhead.D7HkBzZn.mjs';
import { c as createHead$1 } from './shared/unhead.CaeaMM5q.mjs';
import { c as createHead$2 } from './shared/unhead.DGl9jcjg.mjs';
import './shared/unhead.CHEy9ana.mjs';
import './shared/unhead.DspMpm6y.mjs';
import './shared/unhead.CGPOfp5O.mjs';
import './shared/unhead.Bm4Y6XQI.mjs';
import 'hookable';
import './shared/unhead.C5Bksi2B.mjs';
import './shared/unhead.DD4N5B4k.mjs';
import './shared/unhead.DJuZwX9c.mjs';

const legacyPlugins = [DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin];
const activeHead = { value: null };
function getActiveHead() {
  return activeHead.value;
}
function createHead(options = {}) {
  return activeHead.value = createHead$1({
    ...options,
    plugins: [...legacyPlugins, ...options.plugins || []]
  });
}
function createServerHead(options = {}) {
  return activeHead.value = createHead$2({
    ...options,
    plugins: [...legacyPlugins, ...options.plugins || []]
  });
}
const createHeadCore = createUnhead;

export { DeprecationsPlugin, activeHead, createHead, createHeadCore, createServerHead, getActiveHead, legacyPlugins };
