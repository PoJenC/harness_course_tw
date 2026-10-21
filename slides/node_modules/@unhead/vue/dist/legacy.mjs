import { DeprecationsPlugin } from 'unhead/legacy';
import { PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin } from 'unhead/plugins';
import { createHead as createHead$1 } from './client.mjs';
import { createHead as createHead$2 } from './server.mjs';
export { V as VueHeadMixin } from './shared/vue.CQ8Pi46G.mjs';
export { renderDOMHead } from 'unhead/client';
import './shared/vue.DKb5ZKVl.mjs';
import 'vue';
import 'unhead/server';
import './shared/vue.D2XR8FqS.mjs';
import './shared/vue.CXwiCT15.mjs';
import 'unhead/utils';

const legacyPlugins = [DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin];
// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  return createHead$1({
    ...options,
    plugins: [...legacyPlugins, ...options.plugins || []]
  });
}
// @__NO_SIDE_EFFECTS__
function createServerHead(options = {}) {
  return createHead$2({
    ...options,
    plugins: [...legacyPlugins, ...options.plugins || []]
  });
}

export { createHead$1 as createClientHead, createHead, createServerHead, legacyPlugins };
