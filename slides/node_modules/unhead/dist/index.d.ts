import { Unhead } from './client.js';
import { HeadEntryOptions, ActiveHeadEntry } from './types.js';
import { HeadSafe } from './types.js';
import { ResolvableHead, UseSeoMetaInput, InferLink, Link, InferScript, Script } from './types.js';
export { c as createUnhead } from './shared/unhead.Lz0VBgli.js';
export { u as useScript } from './shared/unhead.COtviqoG.js';
import 'hookable';

declare function useHead<T extends Unhead<any>, I = ResolvableHead>(unhead: T, input?: ResolvableHead, options?: HeadEntryOptions): ActiveHeadEntry<I>;
declare function useHeadSafe<T extends Unhead<any>>(unhead: T, input?: HeadSafe, options?: HeadEntryOptions): ActiveHeadEntry<HeadSafe>;
declare function useSeoMeta<T extends Unhead<any>>(unhead: T, input?: UseSeoMetaInput, options?: HeadEntryOptions): ActiveHeadEntry<UseSeoMetaInput>;

type IsUnion<T, U = T> = T extends U ? ([U] extends [T] ? false : true) : never;
type DefinedLink<T extends {
    rel: string;
}> = T extends {
    rel: infer U;
} ? IsUnion<U> extends false ? T extends Link ? T : Link & Omit<T, 'rel'> : Link & Omit<T, 'rel'> : never;
type DefinedScript<T extends object> = T extends {
    type: infer U;
} ? IsUnion<U> extends false ? T extends Script ? T : Script & Omit<T, 'type'> : Script & Omit<T, 'type'> : T extends Script ? T : Script & Omit<T, 'type'>;
/**
 * Typed helper for declaring a `<link>` element inside {@link useHead}.
 *
 * Known `rel` values stay strict: `rel: 'preload'` still requires `as`,
 * preload fonts still require `crossorigin`, `rel: 'mask-icon'` still requires
 * `color`, etc. Non-standard `rel` values not covered by `KnownLinkRel` (e.g.
 * OpenID endpoints, custom protocol discovery links) are accepted via
 * `GenericLink` without losing strictness on the rest of the union.
 *
 * Standard rels like `'me'`, `'webmention'`, `'privacy-policy'`, and
 * `'terms-of-service'` are already in the `Link` union, so they work with
 * `useHead` directly without this helper.
 *
 * @example
 * ```ts
 * import { defineLink, useHead } from 'unhead'
 *
 * useHead({
 *   link: [
 *     defineLink({ rel: 'openid2.provider', href: 'https://example.com/openid' }),
 *     defineLink({ rel: 'EditURI', href: '/rsd.xml', type: 'application/rsd+xml' }),
 *   ],
 * })
 * ```
 */
declare function defineLink<const T extends {
    rel: string;
}>(link: T & InferLink<T>): DefinedLink<T>;
/**
 * Typed helper for declaring a `<script>` element inside {@link useHead}.
 *
 * Known `type` values stay strict: `type: 'module'` still requires `src` or inline
 * content, `type: 'application/ld+json'` still requires `textContent`, etc. Custom
 * or non-standard `type` values (e.g. `'text/plain'`, `'text/html'`) are accepted
 * via {@link GenericScript} without losing strictness on the rest of the union.
 *
 * @example
 * ```ts
 * import { defineScript, useHead } from 'unhead'
 *
 * useHead({
 *   script: [
 *     defineScript({ type: 'text/plain', textContent: 'debug-token' }),
 *   ],
 * })
 * ```
 */
declare function defineScript<const T extends object>(script: T & InferScript<T>): DefinedScript<T>;

export { defineLink, defineScript, useHead, useHeadSafe, useSeoMeta };
