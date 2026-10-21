import { createHead as createHead$1 } from 'unhead/server';
export { prepareTemplate, propsToString, renderSSRHead, transformHtmlTemplate } from 'unhead/server';
import { v as vueInstall } from './shared/vue.DKb5ZKVl.mjs';
import { V as VueResolver } from './shared/vue.D2XR8FqS.mjs';
export { V as VueHeadMixin } from './shared/vue.CQ8Pi46G.mjs';
import 'vue';
import './shared/vue.CXwiCT15.mjs';
import 'unhead/plugins';
import 'unhead/utils';

// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

export { createHead };
