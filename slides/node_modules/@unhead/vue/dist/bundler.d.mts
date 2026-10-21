import * as _unhead_bundler_framework from '@unhead/bundler/framework';
import { UnheadFrameworkOptions } from '@unhead/bundler/framework';
import { UnheadVueStreamingOptions } from './stream/vite.mjs';
import 'unplugin';
import 'unhead/stream/unplugin';

type UnheadVueOptions = UnheadFrameworkOptions<UnheadVueStreamingOptions>;
/**
 * Unified bundler plugin factory for `@unhead/vue`. Returns an object with
 * per-bundler dispatch methods (`vite`, `webpack`, `rspack`, `rollup`) so a
 * single call site covers every supported builder.
 *
 * @example
 * ```ts
 * // vite:
 * import { Unhead } from '@unhead/vue/bundler'
 * export default defineConfig({ plugins: [...Unhead({ streaming: true }).vite()] })
 *
 * // nuxt kit:
 * addBuildPlugin(Unhead({ streaming: true }))
 * ```
 */
declare const Unhead: (options?: UnheadFrameworkOptions<UnheadVueStreamingOptions>) => _unhead_bundler_framework.UnheadBundlerFactory;

export { Unhead };
export type { UnheadVueOptions };
