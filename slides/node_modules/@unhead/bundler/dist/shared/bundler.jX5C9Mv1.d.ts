import { BuildOptions } from 'vite';

interface TreeshakeServerComposablesOptions extends BaseTransformerTypes {
    /**
     * @deprecated Use `treeshake: false` at the top level instead.
     */
    enabled?: boolean;
}

interface UseSeoMetaTransformOptions extends BaseTransformerTypes {
    /**
     * Whether to transform imports of `useSeoMeta` and `useServerSeoMeta` to `useHead` and `useServerHead`.
     */
    imports?: boolean;
    /**
     * Extra import paths to consider where `useSeoMeta()` may be imported from.
     */
    importPaths?: string[];
}

interface BaseTransformerTypes {
    sourcemap?: boolean;
    filter?: {
        exclude?: RegExp[];
        include?: RegExp[];
    };
}
interface UnpluginOptions extends BaseTransformerTypes {
    treeshake?: TreeshakeServerComposablesOptions | false;
    transformSeoMeta?: UseSeoMetaTransformOptions | false;
    minify?: MinifyTransformOptions | false;
    /**
     * Transpile static inline scripts to the bundler's browser target.
     *
     * Enabled by default for Vite, where the resolved `build.target` is
     * inherited automatically. Set to `false` to opt out or provide an object
     * to override the target.
     */
    transformInlineScripts?: InlineScriptTransformOptions | false;
}
interface VitePluginOptions extends UnpluginOptions {
    /** Vite DevTools integration (dev-only). Enabled by default, set `false` to disable. */
    devtools?: UnheadDevtoolsOptions | false;
    /** Inject ValidatePlugin in dev to surface head tag warnings in the console. Enabled by default, set `false` to disable. */
    validate?: boolean;
    /**
     * @internal
     * @deprecated Pass via the `internal` second argument of `Unhead()` instead.
     * Retained as a passthrough so existing framework wrappers keep working.
     */
    _framework?: string;
}
/**
 * Internal extension carrying the framework package name (e.g. `@unhead/vue`)
 * so the base bundler factory can import runtime plugins from the right path.
 * Never exposed on public option types; framework wrappers pass this via
 * the factory helpers in `./framework`.
 *
 * @internal
 */
interface InternalFrameworkContext {
    framework?: string;
}
interface UnheadDevtoolsOptions {
}

type MinifyFn = (code: string) => Promise<string | null>;
interface InlineScriptTransformOptions {
    /**
     * Override the JavaScript target used for inline scripts. When omitted,
     * Vite's resolved `build.target` is used.
     */
    target?: BuildOptions['target'];
}
interface MinifyTransformOptions extends BaseTransformerTypes {
    /**
     * Custom JS minifier function, or `false` to disable JS minification.
     *
     * Use a subpath import to get a preconfigured minifier:
     * - `@unhead/bundler/minify/rolldown` (Vite 8+)
     * - `@unhead/bundler/minify/esbuild` (Vite 7)
     */
    js?: false | MinifyFn;
    /**
     * Custom CSS minifier function, or `false` to disable CSS minification.
     *
     * Use `@unhead/bundler/minify/lightningcss` for a preconfigured minifier.
     */
    css?: false | MinifyFn;
    /**
     * Transpile inline JavaScript before optional minification.
     *
     * Vite builds inherit the resolved `build.target`; pass an object to
     * override it. Other bundlers currently require a custom `js` transform.
     */
    transpile?: boolean | InlineScriptTransformOptions;
}

export type { InternalFrameworkContext as I, MinifyFn as M, VitePluginOptions as V };
