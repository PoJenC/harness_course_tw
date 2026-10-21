import { Plugin } from 'vite';
import { UnheadVueOptions } from './bundler.mjs';
import '@unhead/bundler/framework';
import './shared/vue.B_EhRTsW.mjs';
import 'unplugin';
import 'unhead/stream/unplugin';

type UnheadVueViteOptions = UnheadVueOptions;
/**
 * Vite plugin for `@unhead/vue`. Kept for backwards compatibility; prefer
 * the unified `@unhead/vue/bundler` entry which dispatches to all bundlers.
 *
 * @example
 * ```ts
 * import { Unhead } from '@unhead/vue/vite'
 * export default defineConfig({ plugins: [...Unhead({ streaming: true })] })
 * ```
 */
declare function Unhead(options?: UnheadVueOptions): Plugin[];

export { Unhead };
export type { UnheadVueViteOptions };
