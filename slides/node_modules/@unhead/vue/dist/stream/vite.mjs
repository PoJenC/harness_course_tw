import { u as unheadVueStreamingPlugin } from '../shared/vue.jKCNnfdg.mjs';
import 'unhead/stream/unplugin';
import 'unplugin';

function unheadVuePlugin(options) {
  return unheadVueStreamingPlugin.vite(options);
}

export { unheadVuePlugin as default, unheadVuePlugin, unheadVueStreamingPlugin };
