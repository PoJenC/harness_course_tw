import { Plugin } from 'vite';
import { StreamingPluginOptions } from './unplugin.js';
export { VIRTUAL_CLIENT_ID, VIRTUAL_IIFE_ID, buildStreamingPluginOptions } from './unplugin.js';
import 'unplugin';

/**
 * @deprecated Import from `unhead/stream/unplugin` instead and call `.vite(options)`
 * on the returned unplugin instance. The `unhead/stream/vite` subpath will be
 * removed in a future major release.
 *
 * ```ts
 * // Before
 * import { createStreamingPlugin } from 'unhead/stream/vite'
 * const plugin = createStreamingPlugin({ framework, filter, transform })
 *
 * // After
 * import { createStreamingPlugin } from 'unhead/stream/unplugin'
 * const plugin = createStreamingPlugin.vite({ framework, filter, transform })
 * ```
 */
declare function createStreamingPlugin(options: StreamingPluginOptions): Plugin;

export { StreamingPluginOptions, createStreamingPlugin };
