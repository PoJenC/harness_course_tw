import { SerializableHead } from './types.js';

declare const TagIdMap: {
    readonly html: 0;
    readonly head: 1;
    readonly title: 4;
    readonly meta: 5;
    readonly body: 44;
    readonly script: 52;
    readonly style: 53;
    readonly link: 54;
    readonly base: 56;
};
interface PreparedHtmlTemplate {
    html: string;
    input: SerializableHead;
}
interface PreparedHtmlTemplateWithIndexes {
    html: string;
    input: SerializableHead;
    indexes: {
        htmlTagStart: number;
        htmlTagEnd: number;
        headTagEnd: number;
        bodyTagStart: number;
        bodyTagEnd: number;
        bodyCloseTagStart: number;
    };
}
declare const PreparedTemplateBrand: unique symbol;
/**
 * A reusable parsed HTML template.
 *
 * The object owns the exact `html` string its indexes describe, so it can be
 * safely reused across many renders/requests without re-parsing and without
 * any risk of indexes drifting from the template they were computed for.
 *
 * Create one with {@link prepareTemplate}.
 *
 * @experimental The prepared-template API may change in a future minor release.
 */
interface PreparedTemplate extends PreparedHtmlTemplateWithIndexes {
    readonly [PreparedTemplateBrand]: true;
    readonly html: string;
    readonly input: SerializableHead;
    readonly indexes: Readonly<PreparedHtmlTemplateWithIndexes['indexes']>;
}
/**
 * Parse an HTML template once so it can be reused across many renders/requests.
 *
 * Server and streaming functions that accept an HTML `template` string
 * (`transformHtmlTemplate`, `transformHtmlTemplateRaw`, `renderSSRHeadShell`,
 * `prepareStreamingTemplate`, `wrapStream`) also accept the returned
 * `PreparedTemplate`, skipping the per-request template parse.
 *
 * The returned value is immutable. Unhead does not cache templates by their
 * HTML string, so the caller controls the value's lifetime. It contains no
 * request or head state: keep it at process scope and create a new head for
 * each request.
 *
 * @experimental The prepared-template API may change in a future minor release.
 *
 * @example
 * ```ts
 * const template = prepareTemplate(await readFile('index.html', 'utf-8'))
 * // per request
 * const html = transformHtmlTemplateRaw(head, template)
 * ```
 */
declare function prepareTemplate(html: string): PreparedTemplate;
/**
 * Parse HTML attributes string into key-value object
 */
declare function parseAttributes(attrStr: string): Record<string, string>;
/**
 * Parse HTML to find tag indexes without extracting head elements
 * Used for transformHtmlTemplateRaw where we don't want to extract existing head content
 */
declare function parseHtmlForIndexes(html: string): PreparedHtmlTemplateWithIndexes;
declare function parseHtmlForUnheadExtraction(html: string): PreparedHtmlTemplateWithIndexes;
/**
 * Optimized HTML construction function that uses indexes instead of string.replace()
 * This avoids searching through the entire HTML
 */
declare function applyHeadToHtml(template: PreparedHtmlTemplateWithIndexes, headHtml: {
    htmlAttrs: string;
    headTags: string;
    bodyAttrs: string;
    bodyTagsOpen?: string;
    bodyTags: string;
}): string;

export { TagIdMap, applyHeadToHtml, parseAttributes, parseHtmlForIndexes, parseHtmlForUnheadExtraction, prepareTemplate };
export type { PreparedHtmlTemplate, PreparedHtmlTemplateWithIndexes, PreparedTemplate };
