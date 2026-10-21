import { HookableCore } from 'hookable';
import { t as GenericScript, aO as ScriptHttpEvents, D as DataKeys, a3 as MaybeEventFnHandlers, z as HttpEventAttributes, aL as SchemaAugmentations, H as HeadTag, R as ResolvableHead, b2 as TagPosition, b3 as TagPriority, at as ProcessesTemplateParams, aK as ResolvesDuplicates, b5 as TemplateParams } from './unhead.DC0v7nqS.mjs';

type UseScriptStatus = 'awaitingLoad' | 'loading' | 'loaded' | 'error' | 'removed';
type UseScriptContext<T extends Record<symbol | string, any>> = ScriptInstance<T>;
/**
 * Either a string source for the script or full script properties.
 */
type UseScriptInputBase = Omit<GenericScript, 'src' | keyof ScriptHttpEvents> & DataKeys & MaybeEventFnHandlers<HttpEventAttributes> & SchemaAugmentations['script'];
type UseScriptResolvedInput = UseScriptInputBase & {
    src: string;
};
type BaseScriptApi = Record<symbol | string, any>;
/** A keyed client-side resource loaded without a DOM script tag. */
interface UseScriptLoaderInput<T extends BaseScriptApi = BaseScriptApi> {
    key: string;
    loader: UseScriptLoader<T>;
    crossorigin?: never;
    referrerpolicy?: never;
    src?: never;
    innerHTML?: never;
    onerror?: never;
    onload?: never;
    textContent?: never;
}
type HasDiscriminatedParameters<T> = T extends {
    (first: infer A, ...rest1: any[]): any;
    (first: infer B, ...rest2: any[]): any;
} ? A extends B ? B extends A ? false : true : true : false;
type HasDifferentParameterCounts<T> = T extends {
    (...args: infer A): any;
} & {
    (...args: infer B): any;
} ? A['length'] extends B['length'] ? B['length'] extends A['length'] ? false : true : true : false;
type IsOverloadedFunction<T> = HasDiscriminatedParameters<T> extends true ? true : HasDifferentParameterCounts<T> extends true ? true : false;
type AsVoidFunctions<T extends BaseScriptApi> = {
    [K in keyof T]: T[K] extends any[] ? T[K] : T[K] extends (...args: infer A) => any ? IsOverloadedFunction<T[K]> extends true ? T[K] : (...args: A) => void : T[K] extends Record<any, any> ? AsVoidFunctions<T[K]> : never;
};
type UseScriptInput = string | UseScriptResolvedInput;
type UseFunctionType<T, U> = T extends {
    resolve: infer V;
} ? V extends (...args: any) => any ? NonNullable<Awaited<ReturnType<V>>> : U : T extends {
    use: infer V;
} ? V extends (...args: any) => any ? NonNullable<Awaited<ReturnType<V>>> : U : U;
type WarmupStrategy = false | 'preload' | 'preconnect' | 'dns-prefetch';
type UseScriptWaitForSetup<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void | (() => void);
interface UseScriptWaitForResolve<T = unknown> {
    <V extends T>(value: V): V;
    <V extends T>(value: PromiseLike<V>): PromiseLike<V>;
    (value: T | PromiseLike<T>): T | PromiseLike<T>;
}
type UseScriptWaitForInferredResult<T> = [T] extends [void | (() => void)] ? unknown : NonNullable<Awaited<T>>;
interface UseScriptWaitFor {
    /**
     * With an explicit result type, setup may use callback-style registration and
     * return cleanup. Without one, `waitFor(resolve => resolve(value))` infers it.
     */
    <T = never, R = void>(setup: (resolve: UseScriptWaitForResolve<[T] extends [never] ? unknown : T>, reject: (reason?: unknown) => void) => R): Promise<[T] extends [never] ? UseScriptWaitForInferredResult<R> : T>;
}
interface UseScriptContextOptions {
    /**
     * Aborted when the script is removed or fails to load.
     */
    signal: AbortSignal;
    /**
     * Wait for an SDK-specific readiness callback. Abort rejection and returned
     * cleanup are tied to the script lifecycle.
     */
    waitFor: UseScriptWaitFor;
}
type UseScriptResolver<T extends BaseScriptApi> = (ctx: UseScriptContextOptions) => T | PromiseLike<T | undefined | null> | undefined | null;
/**
 * Register a script load trigger. A returned function is treated as cleanup;
 * other return values are ignored for backwards compatibility.
 */
type UseScriptTrigger = (load: () => void) => any;
type UseScriptLoader<T extends BaseScriptApi = BaseScriptApi> = (ctx: UseScriptContextOptions) => T | PromiseLike<T>;
/**
 * A consumer-owned view of a shared script. Disposing it only releases the
 * callbacks and triggers registered through this scope.
 */
interface ScriptScope<T extends BaseScriptApi> extends ScriptInstance<T> {
    readonly script: ScriptInstance<T>;
    /**
     * Aborted when this consumer is disposed or the shared script fails or is removed.
     */
    readonly signal: AbortSignal;
    dispose: () => void;
    /**
     * Remove the shared script for every consumer. Use `dispose()` to release
     * only the registrations and resources owned by this scope.
     */
    remove: () => boolean;
}
interface ScriptInstance<T extends BaseScriptApi> {
    proxy: AsVoidFunctions<T>;
    instance?: T;
    id: string;
    /**
     * Aborted when the script is removed or fails to load.
     */
    signal: AbortSignal;
    status: Readonly<UseScriptStatus>;
    entry?: ActiveHeadEntry<any>;
    load: () => Promise<T>;
    warmup: (rel: WarmupStrategy) => ActiveHeadEntry<any>;
    remove: () => boolean;
    setupTriggerHandler: (trigger: UseScriptOptions['trigger']) => () => void;
    onLoaded: (fn: (instance: T) => void | Promise<void>, options?: EventHandlerOptions) => () => void;
    onError: (fn: (err?: Error) => void | Promise<void>, options?: EventHandlerOptions) => () => void;
    /**
     * @internal
     */
    _warmupStrategy?: string;
    /**
     * @internal
     */
    _loadPromise: Promise<T | false>;
    /**
     * @internal
     */
    _warmupEl: any;
    /**
     * @internal
     */
    _triggerAbortController?: AbortController | null;
    /**
     * @internal
     */
    _triggerAbortControllers?: Set<AbortController>;
    /**
     * @internal
     */
    _triggerPromises?: Promise<void>[];
    /**
     * @internal
     */
    _setupTriggerHandler: (trigger: UseScriptOptions['trigger'], removeOnError?: boolean) => () => void;
    /**
     * @internal
     */
    _cbs: {
        loaded: null | ((instance: T) => void | Promise<void>)[];
        error: null | ((err?: Error) => void | Promise<void>)[];
    };
}
interface EventHandlerOptions {
    /**
     * Used to dedupe the event, allowing you to have an event run only a single time.
     */
    key?: string;
}
type RecordingEntry = {
    type: 'get';
    key: string | symbol;
    args?: any[];
    value?: any;
} | {
    type: 'apply';
    key: string | symbol;
    args: any[];
};
interface UseScriptOptions<T extends BaseScriptApi = Record<string, any>> extends HeadEntryOptions {
    /**
     * Create a consumer-owned handle without changing the shared script lifecycle.
     * Existing callers receive the cached shared script unless this is enabled.
     */
    scope?: boolean;
    /**
     * Resolve the script instance from the window. This legacy callback is always
     * called without arguments. It may return the API asynchronously.
     */
    use?: () => T | PromiseLike<T | undefined | null> | undefined | null;
    /**
     * Resolve the script API with lifecycle helpers. Prefer this over `use` when
     * readiness needs an abort signal or `waitFor()` callback bridge.
     */
    resolve?: UseScriptResolver<T>;
    /**
     * The trigger to load the script:
     * - `undefined` | `client` - (Default) Load the script on the client when this js is loaded.
     * - `manual` - Load the script manually by calling `$script.load()`, exists only on the client.
     * - `Promise` - Load the script when the promise resolves, exists only on the client.
     * - `Function` - Register a callback function to load the script, exists only on the client. It may return a cleanup function.
     * - `server` - Have the script injected on the server.
     */
    trigger?: 'client' | 'server' | 'manual' | Promise<boolean | void> | UseScriptTrigger | null;
    /**
     * Add a preload or preconnect link tag before the script is loaded.
     */
    warmupStrategy?: WarmupStrategy;
    /**
     * Context to run events with. This is useful in Vue to attach the current instance context before
     * calling the event, allowing the event to be reactive.
     */
    eventContext?: any;
    /**
     * Called before the script is initialized. Will not be triggered when the script is already loaded. This means
     * this is guaranteed to be called only once, unless the script is removed and re-added.
     */
    beforeInit?: () => void;
}
/** Options for a keyed, client-only resource that does not render a script tag. */
type UseScriptLoaderOptions<T extends BaseScriptApi = BaseScriptApi> = Omit<UseScriptOptions<T>, 'resolve' | 'use' | 'warmupStrategy'> & {
    resolve?: never;
    use?: never;
    warmupStrategy?: never;
};
type UseScriptReturn<T extends Record<symbol | string, any>> = ScriptInstance<UseFunctionType<UseScriptOptions<T>, T>>;
type UseScriptScopeReturn<T extends Record<symbol | string, any>> = ScriptScope<UseFunctionType<UseScriptOptions<T>, T>>;

type HookResult = Promise<void> | void;
type SyncHookResult = void;
interface SSRHeadPayload {
    headTags: string;
    bodyTags: string;
    bodyTagsOpen: string;
    htmlAttrs: string;
    bodyAttrs: string;
}
interface RenderSSRHeadOptions {
    omitLineBreaks?: boolean;
    resolvedTags?: HeadTag[];
    tagWeight?: (tag: HeadTag) => number;
}
interface EntryResolveCtx<T> {
    tags: HeadTag[];
    entries: HeadEntry<T>[];
}
interface DomBeforeRenderCtx extends ShouldRenderContext {
    tags: HeadTag[];
}
interface ShouldRenderContext {
    shouldRender: boolean;
}
interface DomRenderTagContext {
    tag: HeadTag;
    id: string;
    $el?: Element;
    shouldRender: boolean;
}
interface SSRRenderContext {
    tags: HeadTag[];
    html: SSRHeadPayload;
}
interface TagResolveContext {
    tagMap: Map<string, HeadTag>;
    tags: HeadTag[];
}
interface CoreHeadHooks {
    'entries:updated': (ctx: Unhead<any>) => HookResult;
    'entries:resolve': (ctx: EntryResolveCtx<any>) => SyncHookResult;
    'entries:normalize': (ctx: {
        tags: HeadTag[];
        entry: HeadEntry<any>;
    }) => SyncHookResult;
    'tag:normalise': (ctx: {
        tag: HeadTag;
        entry: HeadEntry<any>;
        resolvedOptions: CreateClientHeadOptions;
    }) => SyncHookResult;
    'tags:beforeResolve': (ctx: TagResolveContext) => SyncHookResult;
    'tags:resolve': (ctx: TagResolveContext) => SyncHookResult;
    'tags:afterResolve': (ctx: TagResolveContext) => SyncHookResult;
    'script:updated': (ctx: {
        script: ScriptInstance<any>;
    }) => void | Promise<void>;
}
interface DOMHeadHooks {
    'dom:beforeRender': (ctx: DomBeforeRenderCtx) => SyncHookResult;
    /** @deprecated Not called internally. Will be removed in v4. */
    'dom:renderTag': (ctx: DomRenderTagContext, document: Document, track: (id: string, scope: string, fn: () => void) => void) => HookResult;
    /** @deprecated Will be removed in v4. DOM rendering is synchronous; run post-render logic after calling `renderDOMHead()` directly. */
    'dom:rendered': (ctx: {
        renders: DomRenderTagContext[];
    }) => HookResult;
}
interface SSRHeadHooks {
    /**
     * Fired by `renderSSRHeadSuspenseChunk` with normalized tags from entries
     * pending after the shell. It runs before streamed body tags are split out.
     * It also runs before the remaining patch is serialized and entries clear.
     *
     * The chunk renderer normally serializes entry input without normalizing
     * tags. This hook supplies normalized copies for inspection. The rendered
     * patch does not use these tags. Plugin-owned shapes (`_flatMeta`, the legacy
     * `body` prop) are left for the listener to resolve.
     *
     * Synchronous: the renderer does not wait for promises before it serializes
     * the patch and clears entries.
     */
    'ssr:streamChunk': (ctx: {
        tags: HeadTag[];
    }) => SyncHookResult;
    'ssr:beforeRender': (ctx: ShouldRenderContext) => HookResult;
    'ssr:render': (ctx: {
        tags: HeadTag[];
        options: RenderSSRHeadOptions;
    }) => HookResult;
    'ssr:rendered': (ctx: SSRRenderContext) => HookResult;
}
type ClientHeadHooks = CoreHeadHooks & DOMHeadHooks;
type ServerHeadHooks = CoreHeadHooks & SSRHeadHooks;
type HeadHooks = CoreHeadHooks & DOMHeadHooks & SSRHeadHooks;

/**
 * Side effects are mapped with a key and their cleanup function.
 *
 * For example, `meta:data-h-4h46h465`: () => { document.querySelector('meta[data-h-4h46h465]').remove() }
 */
type SideEffectsRecord = Record<string, () => void>;
interface HeadEntry<Input> {
    /**
     * User provided input for the entry.
     */
    input: Input;
    options?: Omit<HeadEntryOptions, 'head' | 'onRendered'>;
    /**
     * Head entry index
     *
     * @internal
     */
    _i: number;
    /**
     * Resolved tags
     *
     * @internal
     */
    _tags?: HeadTag[];
    /**
     * Precomputed normalized tags shared across head instances (SSR default init
     * entry). Only used when no entry hooks, tag weight overrides or entry
     * options could observe or alter normalization, see `resolveTags`.
     *
     * @internal
     */
    _precomputedTags?: HeadTag[];
    /**
     * Pending patch to apply on next render (client-only)
     * @internal
     */
    _pending?: Input;
    /**
     * @internal
     */
    _o?: Input;
}
interface HeadPluginOptions extends CreateHeadOptions {
    hooks?: Record<string, (...args: any[]) => any>;
}
type HeadPluginInput = (HeadPluginOptions & {
    key: string;
}) | (((head: Unhead) => HeadPluginOptions & {
    key: string;
}) & {
    key?: string;
});
type HeadPlugin = HeadPluginOptions & {
    key: string;
};
/**
 * An active head entry provides an API to manipulate it.
 */
interface ActiveHeadEntry<Input> {
    /**
     * Updates the entry with new input.
     *
     * Will first clear any side effects for previous input.
     */
    patch: (input: Input) => void;
    /**
     * Dispose the entry, removing it from the active head.
     *
     * Will queue side effects for removal.
     */
    dispose: () => void;
    /**
     * @internal
     */
    _i: number;
}
type PropResolver = ((key?: string, value?: any, tag?: HeadTag) => any) & {
    /**
     * Marks the resolver as the identity function for plain non-reactive JSON
     * values (strings/numbers/booleans/plain objects/arrays). When every
     * configured resolver is static, the SSR default init entry can use the
     * precomputed fast path (see `server/createHead.ts`).
     *
     * @internal
     */
    _static?: boolean;
};
interface CreateHeadOptions {
    document?: Document;
    /**
     * Initial head input that should be added.
     *
     * Any tags here are added with low priority.
     */
    init?: (ResolvableHead | undefined | false)[];
    /**
     * Prop resolvers for tags.
     */
    propResolvers?: PropResolver[];
    /**
     * @experimental
     * Key used for window attachment during streaming SSR.
     * Allows multiple Unhead instances on the same page.
     * @default '__unhead__'
     */
    experimentalStreamKey?: string;
    /**
     * @internal
     */
    _tagWeight?: (tag: HeadTag) => number;
}
interface CreateServerHeadOptions extends CreateHeadOptions {
    plugins?: HeadPluginInput[];
    hooks?: Partial<ServerHeadHooks>;
    /**
     * Custom tag weight function for controlling `<head>` tag ordering.
     *
     * By default, tags are sorted using CAPO weights optimised for the browser preload scanner.
     * Override this to change the ordering — for example, to prioritise SEO meta tags for bot requests.
     *
     * @example
     * ```ts
     * import { capoTagWeight } from 'unhead/server'
     *
     * createHead({
     *   tagWeight(tag) {
     *     // Promote SEO meta above styles for bots
     *     if (isBot && tag.tag === 'meta' && tag.props.property?.startsWith('og:'))
     *       return 55 // just above styles (60)
     *     return capoTagWeight(tag)
     *   }
     * })
     * ```
     */
    tagWeight?: (tag: HeadTag) => number;
    /**
     * Should default important tags be skipped.
     *
     * Adds the following tags with low priority:
     * - <html lang="en">
     * - <meta charset="utf-8">
     * - <meta name="viewport" content="width=device-width, initial-scale=1">
     */
    disableDefaults?: boolean;
    /**
     * Omit line breaks between rendered tags, producing a single line of output.
     *
     * Only removes the separators *between* tags; newlines inside inline
     * `<script>`/`<style>`/JSON-LD content are preserved.
     *
     * @deprecated Prefer `MinifyPlugin` from `unhead/plugins`, which minifies the
     * inline content itself (where the real bytes are) rather than only dropping
     * separators.
     */
    omitLineBreaks?: boolean;
}
interface CreateStreamableServerHeadOptions extends Omit<CreateServerHeadOptions, 'experimentalStreamKey'> {
    /**
     * Key used for window attachment during streaming SSR.
     * Allows multiple Unhead instances on the same page.
     * @default '__unhead__'
     */
    streamKey?: string;
    /**
     * Request CSP nonce for the bootstrap and Unhead patch scripts.
     * Apply the same nonce to application scripts and the response CSP header.
     */
    nonce?: string;
    /**
     * Set when the driver writes streamed body tags before `</body>`.
     *
     * Use `renderStreamBodyTags()` or `renderStreamEnd()` to write them.
     * `wrapStream()` enables this option automatically.
     *
     * @default false
     */
    writesBodyTags?: boolean;
}
interface CreateClientHeadOptions extends CreateHeadOptions {
    plugins?: HeadPluginInput[];
    hooks?: Partial<ClientHeadHooks>;
    /**
     * Custom render function for DOM updates.
     */
    render?: (head: Unhead<any>) => boolean | void;
}
interface HeadEntryOptions extends TagPosition, TagPriority, ProcessesTemplateParams, ResolvesDuplicates {
    head?: Unhead;
    /**
     * Called after unhead has finished applying DOM updates.
     *
     * Useful for synchronising external tools (e.g. analytics) with the current document head.
     *
     * Only called on the client — ignored during SSR.
     *
     * @example
     * useHead({ title: 'My Page' }, {
     *   onRendered({ renders }) {
     *     amplitude.track('Page View', { title: document.title })
     *   }
     * })
     */
    onRendered?: (ctx: {
        renders: DomRenderTagContext[];
    }) => void | Promise<void>;
    /**
     * @internal
     */
    _safe?: boolean;
    /**
     * @internal
     */
    _index?: number;
    /**
     * Source location for devtools tracing.
     * @internal
     */
    _source?: string;
}
type HeadRenderer<T = unknown> = (head: Unhead<any, any>) => T;
interface Unhead<Input = ResolvableHead, RenderResult = unknown> {
    /**
     * Render the head tags using the configured renderer.
     */
    render: () => RenderResult;
    /**
     * Registered plugins.
     */
    plugins: Map<string, HeadPlugin>;
    /**
     * The head entries.
     */
    entries: Map<number, HeadEntry<Input>>;
    /**
     * Create a new head entry.
     */
    push: (entry: Input, options?: HeadEntryOptions) => ActiveHeadEntry<Input>;
    /**
     * Exposed hooks for easier extension.
     */
    hooks?: HookableCore<HeadHooks>;
    /**
     * Resolved options
     */
    resolvedOptions: CreateHeadOptions;
    /**
     * Use a head plugin, loads the plugins hooks.
     */
    use: (plugin: HeadPluginInput) => void;
    /**
     * Is it a server-side render context.
     */
    ssr: boolean;
    /**
     * @internal
     */
    _entryCount: number;
    /**
     * Number of entry hooks included in cached normalization.
     *
     * @internal
     */
    _h: number;
    /**
     * @internal
     */
    dirty?: boolean;
    /**
     * Invalidate all entries and re-queue them for normalization.
     * @internal
     */
    invalidate?: () => void;
    /**
     * @internal
     */
    _dom?: DomState;
    /**
     * @internal
     */
    _du?: boolean;
    /**
     * Batches client pushes into one render.
     *
     * @internal
     */
    _b?: boolean;
    /**
     * @internal
     */
    _scripts?: Record<string, any>;
    /**
     * @internal
     */
    _templateParams?: TemplateParams;
    /**
     * @internal
     */
    _separator?: string;
    /**
     * @internal
     */
    _title?: string;
    /**
     * @internal
     */
    _titleTemplate?: string;
    /**
     * Per-response state for shell rendering and streamed body tags.
     *
     * @internal
     */
    _stream?: {
        shellRendered?: true;
        bodyTags?: any[];
        seen?: Set<string>;
        writesBodyTags?: boolean;
        nonce?: string;
    };
}
interface DomState {
    /**
     * @internal
     */
    _t: string;
    /**
     * @internal
     */
    _p: SideEffectsRecord;
    /**
     * @internal
     */
    _s: SideEffectsRecord;
    /**
     * @internal
     */
    _e: Map<string, Element>;
}

export type { ActiveHeadEntry as A, SyncHookResult as B, CreateClientHeadOptions as C, DOMHeadHooks as D, EntryResolveCtx as E, UseFunctionType as F, UseScriptContext as G, HeadPluginInput as H, UseScriptContextOptions as I, UseScriptInput as J, UseScriptLoader as K, UseScriptLoaderInput as L, UseScriptLoaderOptions as M, UseScriptOptions as N, UseScriptResolvedInput as O, PropResolver as P, UseScriptResolver as Q, RecordingEntry as R, SSRHeadPayload as S, UseScriptReturn as T, Unhead as U, UseScriptScopeReturn as V, UseScriptStatus as W, UseScriptWaitFor as X, UseScriptWaitForResolve as Y, UseScriptWaitForSetup as Z, WarmupStrategy as _, CreateServerHeadOptions as a, HeadRenderer as b, CreateHeadOptions as c, UseScriptTrigger as d, ClientHeadHooks as e, CreateStreamableServerHeadOptions as f, ServerHeadHooks as g, AsVoidFunctions as h, CoreHeadHooks as i, DomBeforeRenderCtx as j, DomRenderTagContext as k, DomState as l, EventHandlerOptions as m, HeadEntry as n, HeadEntryOptions as o, HeadHooks as p, HeadPlugin as q, HeadPluginOptions as r, HookResult as s, RenderSSRHeadOptions as t, SSRHeadHooks as u, SSRRenderContext as v, ScriptInstance as w, ScriptScope as x, ShouldRenderContext as y, SideEffectsRecord as z };
