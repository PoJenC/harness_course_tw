import { buildStreamingPluginOptions } from 'unhead/stream/unplugin';
import { createUnplugin } from 'unplugin';

const unheadVueStreamingPlugin = /* @__PURE__ */ createUnplugin(
  (options = {}) => buildStreamingPluginOptions({
    framework: "@unhead/vue",
    mode: options.mode
  })
);

export { unheadVueStreamingPlugin as u };
