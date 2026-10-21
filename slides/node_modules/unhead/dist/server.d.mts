import { PreparedTemplate } from './parser.mjs';
export { prepareTemplate } from './parser.mjs';
export { S as ServerUnhead, c as createHead } from './shared/unhead.QzuLtzKx.mjs';
import { S as SSRHeadPayload, U as Unhead } from './shared/unhead.C7ofc94j.mjs';
import { RenderSSRHeadOptions, HeadRenderer } from './types.mjs';
export { a as CreateServerHeadOptions } from './shared/unhead.C7ofc94j.mjs';
import { HeadTag } from './stream/server.mjs';
import 'hookable';

declare function createServerRenderer(options?: RenderSSRHeadOptions): HeadRenderer<SSRHeadPayload>;
/**
 * @deprecated Use `head.render()` instead.
 */
declare function renderSSRHead(head: Unhead<any>, options?: RenderSSRHeadOptions): SSRHeadPayload;

declare function capoTagWeight(tag: HeadTag): number;

/**
 * Transform an HTML template string by extracting any head tags and attributes from it, pushing them to Unhead,
 * and injecting the resulting head tags back into the HTML.
 * Uses optimized parsing and index-based HTML construction for best performance.
 *
 * Accepts either a raw HTML string (parsed per call) or a `PreparedTemplate`
 * from `prepareTemplate()` for templates that are stable across requests.
 */
declare function transformHtmlTemplate(head: Unhead<any, SSRHeadPayload>, html: string | PreparedTemplate): string;
/**
 * Transform an HTML template string by injecting head tags managed by Unhead.
 *
 * The differs to `transformHtmlTemplate` in that it does not extract and push any head input from the HTML, resulting
 * in much more performant execution if you don't need that feature.
 *
 * However, this also means that any head tags or attributes already present in the HTML may be duplicated or
 * ordered incorrectly, so use with caution.
 *
 * Accepts either a raw HTML string (parsed per call) or a `PreparedTemplate`
 * from `prepareTemplate()` for templates that are stable across requests.
 */
declare function transformHtmlTemplateRaw(head: Unhead<any, SSRHeadPayload>, html: string | PreparedTemplate): string;

declare function propsToString(props: Record<string, any>): string;

declare function ssrRenderTags<T extends HeadTag>(tags: T[], options?: RenderSSRHeadOptions): {
    headTags: string;
    bodyTags: string;
    bodyTagsOpen: string;
    htmlAttrs: string;
    bodyAttrs: string;
};

declare function escapeHtml(str: string): string;
declare function tagToString<T extends HeadTag>(tag: T): string;

export { PreparedTemplate, SSRHeadPayload, Unhead, capoTagWeight, createServerRenderer, escapeHtml, propsToString, renderSSRHead, ssrRenderTags, tagToString, transformHtmlTemplate, transformHtmlTemplateRaw };
