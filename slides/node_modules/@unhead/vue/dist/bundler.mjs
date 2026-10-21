import { createFrameworkPlugin } from '@unhead/bundler/framework';
import { u as unheadVueStreamingPlugin } from './shared/vue.jKCNnfdg.mjs';
import 'unhead/stream/unplugin';
import 'unplugin';

const Unhead = /* @__PURE__ */ createFrameworkPlugin({
  framework: "@unhead/vue",
  streamingPlugin: unheadVueStreamingPlugin
});

export { Unhead };
