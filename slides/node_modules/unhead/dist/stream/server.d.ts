import { PreparedTemplate } from '../parser.js';
export { prepareTemplate } from '../parser.js';
import { ServerUnhead } from '../server.js';
import { f as CreateStreamableServerHeadOptions, U as Unhead, S as SSRHeadPayload } from '../shared/unhead.BCbtEyRi.js';
import { ResolvableHead } from '../types.js';
export { H as HeadTag } from '../shared/unhead.DC0v7nqS.js';
import 'hookable';

/**
 * Base context with just the head instance.
 * Extended by framework-specific contexts.
 */
interface BaseStreamableHeadContext<T = ResolvableHead> {
    /**
     * The Unhead instance to provide to your framework
     */
    head: ServerUnhead<T>;
}
/**
 * Context returned by createStreamableHead for streaming SSR.
 * Includes shell coordination utilities for framework wrappers.
 */
interface StreamableHeadContext<T = ResolvableHead> extends BaseStreamableHeadContext<T> {
    /**
     * Call this when the shell is ready.
     * Pass to your framework's onShellReady callback.
     */
    onShellReady: () => void;
    /**
     * Promise that resolves when shell is ready.
     * Use this to coordinate stream wrapping in framework-specific code.
     */
    shellReady: Promise<void>;
}
/**
 * Context for frameworks using web streams (Vue, Solid, Svelte).
 * Provides a wrapStream helper for easy stream wrapping.
 */
interface WebStreamableHeadContext<T = ResolvableHead> extends BaseStreamableHeadContext<T> {
    /**
     * Wrap a web ReadableStream to handle head injection automatically.
     * @param stream - The app's ReadableStream
     * @param template - The HTML template (string or `prepareTemplate()` result)
     * @returns A new ReadableStream with shell and closing HTML included
     */
    wrapStream: (stream: ReadableStream<Uint8Array>, template: string | PreparedTemplate) => ReadableStream<Uint8Array>;
}
/**
 * Creates a head instance configured for streaming SSR.
 *
 * Returns a context with:
 * - `head`: The Unhead instance for your framework's provider
 * - `onShellReady`: Callback to pass to your framework's streaming API
 * - `shellReady`: Promise that resolves when shell is ready
 *
 * Each framework package (@unhead/react, @unhead/vue, etc.) may extend this
 * with framework-specific streaming utilities.
 *
 * @example
 * ```ts
 * const { head, onShellReady, shellReady } = createStreamableHead()
 * ```
 */
declare function createStreamableHead<T = ResolvableHead>(options?: CreateStreamableServerHeadOptions): StreamableHeadContext<T>;
/**
 * Generates the bootstrap script that creates the streaming queue on the window object.
 * This script is injected into the shell and must run before any streaming updates.
 *
 * For frameworks that construct HTML programmatically (without a template),
 * use this directly to inject the bootstrap into your shell `<head>`.
 *
 * @param streamKey - The window property name for the stream queue (default: '__unhead__')
 * @param nonce - Optional CSP nonce to stamp on the script tag
 * @returns An inline `<script>` tag string
 */
declare function createBootstrapScript(streamKey?: string, nonce?: string): string;
/**
 * Renders the current head state and clears entries atomically.
 *
 * Use this for frameworks that construct HTML programmatically (without a template)
 * where `renderSSRHeadShell` / `prepareStreamingTemplate` aren't suitable.
 *
 * @param head - The Unhead instance
 * @returns The rendered SSR head payload
 *
 * @example
 * ```ts
 * const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = renderShell(head)
 * const shell = `<!DOCTYPE html><html${htmlAttrs}><head>${headTags}</head><body${bodyAttrs}>${bodyTagsOpen}`
 *
 * // Stream the app, then close it with the streamed body tags.
 * res.end(`${renderStreamBodyTags(head)}${bodyTags}</body></html>`)
 * ```
 */
declare function renderShell(head: Unhead<any, SSRHeadPayload>): SSRHeadPayload;
/**
 * @experimental
 *
 * Renders the app shell with initial head tags for streaming SSR.
 * Call this once at the start before streaming app content.
 *
 * Requires the Vite plugin with `streaming: true` to inject the bootstrap
 * script and streaming client via `transformIndexHtml`.
 *
 * @param head - The Unhead instance
 * @param template - HTML template containing <html>, <head>, </head>, <body> (string or `prepareTemplate()` result)
 * @returns Rendered shell with head tags injected
 *
 * @example
 * ```ts
 * const shell = renderSSRHeadShell(head, template)
 * ```
 */
declare function renderSSRHeadShell(head: Unhead<any>, template: string | PreparedTemplate): string;
/**
 * Renders and clears streamed body tags.
 *
 * Manual drivers must write this before `</body>`.
 * `renderStreamEnd()` includes it for template streams.
 */
declare function renderStreamBodyTags(head: Unhead<any>): string;
/**
 * Adds streamed body tags to the closing HTML.
 *
 * Manual drivers must write this instead of `parts.end`.
 *
 * @example
 * ```ts
 * const parts = prepareStreamingTemplate(head, template)
 * res.write(parts.shell)
 * // ...stream the app, calling renderSSRHeadSuspenseChunk per boundary
 * res.end(renderStreamEnd(head, parts))
 * ```
 */
declare function renderStreamEnd(head: Unhead<any>, parts: StreamingTemplateParts): string;
declare function renderSSRHeadSuspenseChunk(head: Unhead<any>): string;
/**
 * @experimental
 *
 * Wraps a web ReadableStream with head injection for streaming SSR.
 *
 * This is a convenience wrapper that:
 * 1. Prepares the template with head injection
 * 2. Writes the shell (with head tags)
 * 3. Streams the app content
 * 4. Writes the closing HTML (with body tags)
 *
 * @param head - The Unhead instance
 * @param stream - The app's ReadableStream (from renderToWebStream, etc.)
 * @param template - Full HTML template (string or `prepareTemplate()` result)
 * @param preRenderedState - Optional pre-rendered head payload to use for the shell
 * @param options - Optional streaming hooks
 * @param options.flushChunk - Returns extra HTML to emit after each app
 * chunk and once before the closing HTML (used by framework packages to
 * interleave head-update scripts)
 * @returns A new ReadableStream with shell and closing HTML included
 *
 * @example
 * ```ts
 * const appStream = renderToWebStream(app)
 * const fullStream = wrapStream(head, appStream, template)
 * return new Response(fullStream)
 * ```
 */
declare function wrapStream(head: Unhead<any>, stream: ReadableStream<Uint8Array>, template: string | PreparedTemplate, preRenderedState?: SSRHeadPayload, options?: {
    flushChunk?: () => string;
}): ReadableStream<Uint8Array>;
/**
 * Result from prepareStreamingTemplate containing the shell and end parts
 */
interface StreamingTemplateParts {
    /**
     * The shell HTML with head tags, htmlAttrs, bodyAttrs, and bootstrap script injected.
     * Write this before streaming app content.
     */
    shell: string;
    /**
     * The closing HTML with bodyTags injected before </body>.
     * Write this after streaming app content completes.
     */
    end: string;
    /**
     * Offset for streamed body tags within `end`.
     */
    bodyTagsAt?: number;
}
/**
 * @experimental
 *
 * Prepares a template for streaming SSR by splitting it at the SSR outlet
 * marker (`<!--app-html-->` / `<!--ssr-outlet-->`) when present, so the
 * streamed app content lands inside the mount container. Falls back to
 * splitting at body tag boundaries when no marker is found.
 *
 * This is the recommended way to handle streaming templates as it:
 * - Uses consistent template parsing (same as transformHtmlTemplateRaw)
 * - Properly injects head content, html/body attrs, and bootstrap script
 * - Injects body tags (scripts at end of body) into the closing part
 *
 * @param head - The Unhead instance
 * @param template - Full HTML template (string or `prepareTemplate()` result)
 * @returns Object with `shell` (before app) and `end` (after app) parts
 *
 * @example
 * ```ts
 * const { shell, end } = prepareStreamingTemplate(head, template)
 * response.write(shell)
 * // ... stream app content ...
 * response.write(end)
 * ```
 */
declare function prepareStreamingTemplate(head: Unhead<any>, template: string | PreparedTemplate, preRenderedState?: SSRHeadPayload): StreamingTemplateParts;

export { CreateStreamableServerHeadOptions, PreparedTemplate, SSRHeadPayload, Unhead, createBootstrapScript, createStreamableHead, prepareStreamingTemplate, renderSSRHeadShell, renderSSRHeadSuspenseChunk, renderShell, renderStreamBodyTags, renderStreamEnd, wrapStream };
export type { BaseStreamableHeadContext, StreamableHeadContext, StreamingTemplateParts, WebStreamableHeadContext };
