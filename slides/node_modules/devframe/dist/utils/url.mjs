//#region src/utils/url.ts
/**
* URL path-joining and slash-normalization helpers shared by the adapters,
* the RPC clients, and the hub's mount-path plumbing. In-house replacements
* for the handful of `ufo` functions devframe used, kept dependency-free and
* browser-safe (pure string operations, no `node:` imports).
*/
/** Matches an explicit protocol prefix: `http://`, `wss://`, `file://`, … */
const PROTOCOL_RE = /^[\w+.-]{2,}:\/\//;
/** `input` with a leading `/` added when missing. */
function withLeadingSlash(input) {
	return input.startsWith("/") ? input : `/${input}`;
}
/** `input` with a leading `/` removed; a bare `/` stays `/`. */
function withoutLeadingSlash(input) {
	return (input.startsWith("/") ? input.slice(1) : input) || "/";
}
/** `input` with a trailing `/` added when missing. */
function withTrailingSlash(input) {
	return input.endsWith("/") ? input : `${input}/`;
}
/** `input` with a trailing `/` removed; a bare `/` stays `/`. */
function withoutTrailingSlash(input) {
	return (input.endsWith("/") ? input.slice(0, -1) : input) || "/";
}
/** Collapses runs of `/` in every path portion, preserving `://`. */
function cleanDoubleSlashes(input) {
	return input.split("://").map((part) => part.replace(/\/{2,}/g, "/")).join("://");
}
/**
* Joins path segments onto `base` with exactly one `/` at each seam.
* A segment's leading `/` or `./` is dropped; empty and bare-`/` segments
* are skipped; the last segment's trailing slash is preserved.
*/
function joinURL(base, ...segments) {
	let url = base;
	for (const segment of segments) {
		if (!segment || segment === "/") continue;
		url = url ? withTrailingSlash(url) + segment.replace(/^\.?\//, "") : segment;
	}
	return url;
}
/**
* Prefixes `input` with `base` unless it already carries the prefix or is an
* absolute URL with a protocol. An empty or `/` base is a no-op.
*/
function withBase(input, base) {
	if (!base || base === "/" || PROTOCOL_RE.test(input)) return input;
	const prefix = withoutTrailingSlash(base);
	return input.startsWith(prefix) ? input : joinURL(prefix, input);
}
/** Replaces (or adds) the protocol of `input`: `withProtocol(url, 'ws://')`. */
function withProtocol(input, protocol) {
	const match = input.match(PROTOCOL_RE);
	return protocol + (match ? input.slice(match[0].length) : input);
}
//#endregion
export { cleanDoubleSlashes, joinURL, withBase, withLeadingSlash, withProtocol, withTrailingSlash, withoutLeadingSlash, withoutTrailingSlash };
