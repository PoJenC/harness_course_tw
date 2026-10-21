import * as unplugin from 'unplugin';
import { StreamingPluginOptions } from 'unhead/stream/unplugin';

type UnheadVueStreamingOptions = Pick<StreamingPluginOptions, 'mode'>;
/**
 * Bundler-agnostic streaming SSR plugin for `@unhead/vue`.
 *
 * Vue does not need a source-level transform: per-chunk head patches are
 * emitted by `wrapStream` on the server as self-deleting inline scripts.
 * This plugin exists to wire the client streaming bootstrap (virtual iife
 * module + `transformIndexHtml` head-prepend on vite).
 */
declare const unheadVueStreamingPlugin: unplugin.UnpluginInstance<UnheadVueStreamingOptions | undefined, boolean>;

export { unheadVueStreamingPlugin as u };
export type { UnheadVueStreamingOptions as U };
