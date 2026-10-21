//#region src/utils/url.d.ts
/**
 * URL path-joining and slash-normalization helpers shared by the adapters,
 * the RPC clients, and the hub's mount-path plumbing. In-house replacements
 * for the handful of `ufo` functions devframe used, kept dependency-free and
 * browser-safe (pure string operations, no `node:` imports).
 */
/** `input` with a leading `/` added when missing. */
export declare function withLeadingSlash(input: string): string;
/** `input` with a leading `/` removed; a bare `/` stays `/`. */
export declare function withoutLeadingSlash(input: string): string;
/** `input` with a trailing `/` added when missing. */
export declare function withTrailingSlash(input: string): string;
/** `input` with a trailing `/` removed; a bare `/` stays `/`. */
export declare function withoutTrailingSlash(input: string): string;
/** Collapses runs of `/` in every path portion, preserving `://`. */
export declare function cleanDoubleSlashes(input: string): string;
/**
 * Joins path segments onto `base` with exactly one `/` at each seam.
 * A segment's leading `/` or `./` is dropped; empty and bare-`/` segments
 * are skipped; the last segment's trailing slash is preserved.
 */
export declare function joinURL(base: string, ...segments: string[]): string;
/**
 * Prefixes `input` with `base` unless it already carries the prefix or is an
 * absolute URL with a protocol. An empty or `/` base is a no-op.
 */
export declare function withBase(input: string, base: string): string;
/** Replaces (or adds) the protocol of `input`: `withProtocol(url, 'ws://')`. */
export declare function withProtocol(input: string, protocol: string): string;
//#endregion