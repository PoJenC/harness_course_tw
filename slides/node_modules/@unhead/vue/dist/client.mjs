import { createDomRenderer, createHead as createHead$1 } from 'unhead/client';
export { renderDOMHead } from 'unhead/client';
import { v as vueInstall } from './shared/vue.DKb5ZKVl.mjs';
export { V as VueHeadMixin } from './shared/vue.CQ8Pi46G.mjs';
import 'vue';
import './shared/vue.CXwiCT15.mjs';
import 'unhead/plugins';
import 'unhead/utils';
import './shared/vue.D2XR8FqS.mjs';

// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const domRenderer = createDomRenderer();
  let head;
  let renderId = 0;
  const debouncedRenderer = () => {
    const id = ++renderId;
    setTimeout(() => {
      if (id === renderId)
        domRenderer(head);
    }, 0);
  };
  head = createHead$1({ render: debouncedRenderer, ...options });
  head.install = vueInstall(head);
  return head;
}

export { createHead };
