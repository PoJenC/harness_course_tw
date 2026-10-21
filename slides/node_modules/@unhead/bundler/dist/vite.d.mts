import { Plugin } from 'vite';
import { V as VitePluginOptions, I as InternalFrameworkContext } from './shared/bundler.jX5C9Mv1.mjs';

/**
 * Vite plugin factory that composes the core Unhead build-time transforms
 * (tree-shake, seo-meta, inline-script transform, minify, SSR static replace,
 * devtools).
 *
 * Framework packages (e.g. `@unhead/vue/vite`) should not call this directly;
 * use the `createFrameworkVitePlugin` helper in `./framework` which threads
 * `_framework` correctly without exposing it on public options.
 */
declare function Unhead(options?: VitePluginOptions, internal?: InternalFrameworkContext): Plugin[];

export { Unhead, VitePluginOptions };
