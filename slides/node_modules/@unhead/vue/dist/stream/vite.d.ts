import { Plugin } from 'vite';
import { U as UnheadVueStreamingOptions } from '../shared/vue.B_EhRTsW.js';
export { u as unheadVueStreamingPlugin } from '../shared/vue.B_EhRTsW.js';
import 'unplugin';
import 'unhead/stream/unplugin';

/**
 * @deprecated Use `Unhead({ streaming: true }).vite()` from `@unhead/vue/bundler` instead.
 * The `@unhead/vue/stream/vite` subpath and `unheadVuePlugin` export will be
 * removed in a future major release.
 */
declare function unheadVuePlugin(options?: UnheadVueStreamingOptions): Plugin;

export { UnheadVueStreamingOptions, unheadVuePlugin as default, unheadVuePlugin };
