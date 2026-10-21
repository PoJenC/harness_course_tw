import { Unhead } from './client.js';
import { HeadPluginInput, HeadPluginOptions } from './types.js';
export { D as DeprecationsPlugin } from './shared/unhead.Fj9s3zvE.js';
import { V as ValidationRuleId, R as RulesConfig } from './shared/unhead.XrgiArBm.js';
export { a as RuleConfig, b as RuleSeverity, c as ValidationRuleOptions } from './shared/unhead.XrgiArBm.js';
import { HeadTag } from './stream/server.js';
import 'hookable';

declare const AliasSortingPlugin: HeadPluginInput;

interface CanonicalPluginOptions {
    canonicalHost?: string;
    customResolver?: (url: string) => string;
    /**
     * Query parameters to preserve in canonical and og:url tags.
     * All other query parameters will be stripped by default.
     *
     * Set to `false` to disable query filtering (keep all params).
     *
     * @default [] (strips all query params)
     */
    queryWhitelist?: string[] | false;
    /**
     * Whether canonical URLs should have a trailing slash.
     *
     * - `true` - always add trailing slash
     * - `false` - always remove trailing slash
     * - `undefined` - leave as-is (default)
     */
    trailingSlash?: boolean;
}
/**
 * CanonicalPlugin resolves paths in tags that require a canonical host to be set.
 *
 *  - Resolves paths in meta tags like `og:image` and `twitter:image`.
 *  - Resolves paths in the `og:url` meta tag.
 *  - Resolves paths in the `link` tag with the `rel="canonical"` attribute.
 *  - Filters query parameters from canonical and og:url tags.
 * @example
 * const plugin = CanonicalPlugin({
 *   canonicalHost: 'https://example.com',
 *   customResolver: (path) => `/custom${path}`,
 * });
 *
 * // This plugin will resolve URLs in meta tags like:
 * // <meta property="og:image" content="/image.jpg">
 * // to:
 * // <meta property="og:image" content="https://example.com/image.jpg">
 */
declare function CanonicalPlugin(options: CanonicalPluginOptions): ((head: Unhead) => HeadPluginOptions & {
    key: string;
});

declare function defineHeadPlugin(plugin: HeadPluginInput, key?: string): HeadPluginInput;

declare const FlatMetaPlugin: HeadPluginInput;

interface InferSeoMetaPluginOptions {
    /**
     * Transform the og title.
     *
     * @param title
     */
    ogTitle?: ((title?: string) => string);
    /**
     * Transform the og description.
     *
     * @param description
     */
    ogDescription?: ((description?: string) => string);
    /**
     * The twitter card to use.
     *
     * By default, the card is `summary_large_image` when the resolved head has an `og:image` or `twitter:image`,
     * and `summary` otherwise. A `twitter:card` set elsewhere in the head always wins.
     *
     * @deprecated Twitter/X renders link previews from Open Graph metadata. Set this to `false` and rely on Open Graph metadata instead.
     */
    twitterCard?: false | 'summary' | 'summary_large_image' | 'app' | 'player';
}
declare function InferSeoMetaPlugin(options?: InferSeoMetaPluginOptions): HeadPluginInput;

interface MinifyPluginOptions {
    /**
     * Custom JS minifier. Set to `false` to disable JS minification.
     * Defaults to built-in lightweight minifier.
     */
    js?: false | ((code: string) => string);
    /**
     * Custom CSS minifier. Set to `false` to disable CSS minification.
     * Defaults to built-in lightweight minifier.
     */
    css?: false | ((code: string) => string);
    /**
     * Minify JSON script types (application/ld+json, application/json,
     * speculationrules, importmap).
     * @default true
     */
    json?: boolean;
    /**
     * Omit line breaks between rendered tags, producing a single line of output.
     *
     * Applied surgically by the renderer (separators only); newlines inside
     * inline content are still handled by the minifiers above, so this is safe.
     *
     * @default false
     */
    omitLineBreaks?: boolean;
}
/**
 * Minifies inline script and style tag content during SSR rendering.
 *
 * Uses lightweight pure-JS minifiers by default (zero native dependencies, safe for edge/serverless).
 * Custom minifiers can be provided for heavier optimization.
 *
 * Note: The `ssr:render` hook runs synchronously in the render pipeline, so custom minifiers must be synchronous.
 *
 * @example
 * ```ts
 * import { MinifyPlugin } from 'unhead/plugins'
 *
 * const head = createHead({
 *   plugins: [MinifyPlugin()]
 * })
 * ```
 */
declare function MinifyPlugin(options?: MinifyPluginOptions): HeadPluginInput;

/**
 * Resolves Promise values outside the synchronous tag pipeline. Pending entries
 * are omitted from the current render and become available on the next render.
 */
declare const PromisesPlugin: HeadPluginInput;

declare const SafeInputPlugin: HeadPluginInput;

declare const TemplateParamsPlugin: HeadPluginInput;

interface HeadValidationRule {
    id: ValidationRuleId;
    message: string;
    severity: 'warn' | 'info';
    source?: string;
    tag?: HeadTag;
}
interface ValidatePluginOptions {
    /**
     * Callback to handle validation results. Receives all rules found per resolve cycle.
     * Defaults to `console.warn` for each rule.
     */
    onReport?: (rules: HeadValidationRule[]) => void;
    /**
     * Configure rule severity and options. Accepts a severity string or an ESLint-style
     * `[severity, options]` tuple for rules that support configuration.
     *
     * @example
     * ```ts
     * rules: {
     *   'missing-description': 'off',
     *   'too-many-preloads': ['warn', { max: 10 }],
     *   'too-many-prefetches': ['info', { max: 100 }],
     *   'inline-style-size': ['info', { maxKB: 20 }],
     * }
     * ```
     */
    rules?: RulesConfig;
    /**
     * Project root path. When set, source locations are displayed as relative paths.
     */
    root?: string;
    /**
     * Run only these rules. Every other rule is off, even when `rules` enables it.
     *
     * Use `['streamed-tag-hidden-from-bots']` for a focused streaming server instance.
     */
    only?: readonly ValidationRuleId[];
    /**
     * Key used to deduplicate plugin registrations.
     *
     * Use a unique key when one head needs more than one validator instance.
     *
     * @default 'validate'
     */
    key?: string;
}
declare function ValidatePlugin(options?: ValidatePluginOptions): HeadPluginInput;

export { AliasSortingPlugin, CanonicalPlugin, FlatMetaPlugin, InferSeoMetaPlugin, MinifyPlugin, PromisesPlugin, RulesConfig, SafeInputPlugin, TemplateParamsPlugin, ValidatePlugin, ValidationRuleId, defineHeadPlugin };
export type { CanonicalPluginOptions, HeadValidationRule, MinifyPluginOptions, ValidatePluginOptions };
