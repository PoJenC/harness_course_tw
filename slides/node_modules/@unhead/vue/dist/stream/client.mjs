import { createStreamableHead as createStreamableHead$1 } from 'unhead/stream/client';
import { v as vueInstall } from '../shared/vue.DKb5ZKVl.mjs';
import { V as VueResolver } from '../shared/vue.D2XR8FqS.mjs';
export { V as VueHeadMixin } from '../shared/vue.CQ8Pi46G.mjs';
import 'vue';
import '../shared/vue.CXwiCT15.mjs';
import 'unhead/plugins';
import 'unhead/utils';

// @__NO_SIDE_EFFECTS__
function createStreamableHead(options = {}) {
  const head = createStreamableHead$1({
    ...options,
    propResolvers: [VueResolver, ...options.propResolvers || []]
  });
  if (head) {
    head.install = vueInstall(head);
  }
  return head;
}

export { createStreamableHead };
