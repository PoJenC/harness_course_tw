import * as unplugin from 'unplugin';
import { UnpluginOptions } from 'unplugin';

declare const VIRTUAL_CLIENT_ID = "virtual:@unhead/streaming-client";
declare const VIRTUAL_IIFE_ID = "virtual:@unhead/streaming-iife.js";
type Nonce = string | (() => string | undefined);
interface StreamingPluginOptions {
    /** Framework package e.g. '@unhead/vue' */
    framework: string;
    /** Plugin name (optional, defaults to `${framework}:streaming`) */
    name?: string;
    /**
     * File extension filter for transform hook, e.g. /\.vue$/. Optional;
     * only required by frameworks whose client streaming support relies on
     * source-level AST injection (React/Solid/Svelte). Vue does not use it.
     */
    filter?: RegExp;
    /** Optional source-code prefilter for transform hooks. */
    codeFilter?: RegExp;
    /** Transform handler called for files matching `filter`. */
    transform?: (code: string, id: string, options?: {
        ssr?: boolean;
    }) => {
        code: string;
        map?: any;
    } | null | undefined | void;
    /**
     * How to load the streaming client (vite-only, ignored on webpack/rspack/rollup where
     * index.html injection isn't available; frameworks inject the iife themselves in SSR).
     * - 'async' (default): Non-blocking external script. In dev served from a virtual
     *   module; in production emitted as a real asset chunk via `emitFile`.
     * - 'inline': Inline the IIFE directly in HTML. Largest HTML, smallest TTFB,
     *   always safe in production. Recommended for streaming SSR.
     * - 'module': ES module dynamic import of the client bootstrap. Vite rewrites the
     *   import path through its module graph so it survives production builds.
     * @default 'async'
     */
    mode?: 'async' | 'inline' | 'module';
    /**
     * CSP nonce forwarded on every injected `<script>` tag. Pass a string or a
     * function returning a string (useful when the nonce rotates per request).
     * Omit to inject without a nonce.
     *
     * Not stamped during a build-time manifest pass (Vite calls
     * `transformIndexHtml(undefined, ctx)` to collect tags for frameworks,
     * e.g. Nuxt, that inject them at render time). A per-request nonce
     * cannot be baked into a static manifest. Frameworks reading tags from
     * a manifest must stamp the nonce themselves when they render each
     * request.
     */
    nonce?: Nonce;
    /**
     * Stream key global name; must match `experimentalStreamKey` on the server
     * head instance. Used by dev-mode warnings to detect when the server
     * bootstrap script hasn't run (common misconfig).
     * @default '__unhead__'
     */
    streamKey?: string;
    /**
     * Emit a warning when the client IIFE runs but no server bootstrap queue
     * has been installed (i.e. server didn't call `wrapStream` /
     * `renderSSRHeadShell`). Dev-only.
     * @default true in dev, false in prod
     */
    warnOnMissingServerBootstrap?: boolean;
}
/**
 * Builds the bundler-agnostic unplugin hook set for the streaming plugin. Exposed so
 * framework wrappers (e.g. `@unhead/vue/bundler`) can bake in their own
 * `framework`, `filter`, and `transform` while still using this factory
 * to produce hooks that work across vite/webpack/rspack/rollup/esbuild via `createUnplugin`.
 *
 * SSR detection is bundler-specific:
 * - vite build: `config.env.isSsrBuild`
 * - vite dev (v6+ environments): `this.environment.name === 'ssr'` per-transform
 * - webpack/rspack: `compiler.options.name === 'server'` or `target === 'node'`
 */
declare function buildStreamingPluginOptions(options: StreamingPluginOptions, meta?: {
    framework?: string;
}): UnpluginOptions;
/**
 * Internal cross-bundler unplugin factory. Framework wrappers pick a single bundler's
 * output (`.vite`, `.webpack`, `.rspack`, etc.) to expose via their own subpath export.
 *
 * Consumers should prefer the unified framework bundler entry (e.g.
 * `@unhead/{vue,react,svelte,solid-js}/bundler`) rather than importing this
 * directly.
 */
declare const createStreamingPlugin: unplugin.UnpluginInstance<StreamingPluginOptions, boolean>;

export { VIRTUAL_CLIENT_ID, VIRTUAL_IIFE_ID, buildStreamingPluginOptions, createStreamingPlugin };
export type { Nonce, StreamingPluginOptions };
