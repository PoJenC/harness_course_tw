import { REMOTE_CONNECTION_KEY } from "devframe/constants";
//#region src/client-modules.ts
const URL_SCHEME_RE = /^[a-z][a-z\d+.-]*:/i;
/**
* Whether a client-script `importFrom` is a **bare module specifier**: an
* npm-style name (`vite-plugin-vue-tracer/client/vite-devtools`) rather than
* a URL the browser can resolve natively.
*/
function isBareModuleSpecifier(specifier) {
	const value = specifier.trim();
	return !!value && !value.startsWith("/") && !value.startsWith("./") && !value.startsWith("../") && !URL_SCHEME_RE.test(value);
}
/**
* Resolve a dock client script's `importFrom` to the URL to import. URL
* specifiers pass through untouched; a **bare** specifier resolves through
* the explicit `resolveClientModule` callback (a viewer's own policy), then
* the host-advertised `template` (`ConnectionMeta.configs.dock.clientModuleResolution`,
* its `{specifier}` token replaced, e.g. Vite's `'/@id/{specifier}'`),
* resolved against `metaBaseUrl` so it targets the host's origin from any
* viewer. With neither, it stays unchanged, since a page import map may
* still cover it.
*/
function resolveClientModuleSpecifier(specifier, options = {}) {
	if (!isBareModuleSpecifier(specifier)) return specifier;
	const custom = options.resolveClientModule?.(specifier);
	if (custom) return custom;
	if (!options.template) return specifier;
	const applied = options.template.includes("{specifier}") ? options.template.replaceAll("{specifier}", specifier) : options.template + specifier;
	try {
		return new URL(applied, options.metaBaseUrl).href;
	} catch {
		return applied;
	}
}
/**
* Diagnose a failed client-script import: name the likely cause instead of
* leaving only the browser's opaque `TypeError`. `importFrom` is the entry's
* declared specifier, `specifier` what was actually imported (after
* {@link resolveClientModuleSpecifier}).
*/
function clientScriptFailureHint(importFrom, specifier) {
	if (!isBareModuleSpecifier(importFrom)) return "";
	if (specifier === importFrom) return ". The specifier is a bare npm specifier and this host advertises no client-module resolution (`ConnectionMeta.configs.dock.clientModuleResolution`). Serve the script as a self-contained bundle by URL, pass `resolveClientModule` to this client host, or run under a host that resolves bare specifiers (e.g. Vite: `/@id/{specifier}`).";
	return `. The host resolved the bare specifier "${importFrom}" to this URL but could not serve the module. Check the package is installed and resolvable from the host project's root (and built, if its exports point at build output).`;
}
//#endregion
//#region src/remote-url.ts
function base64UrlEncode(value) {
	const bytes = new TextEncoder().encode(value);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function setRemoteConnectionParam(value, param) {
	const parts = value ? value.split("&") : [];
	const existingIdx = parts.findIndex((part) => part.split("=")[0] === REMOTE_CONNECTION_KEY);
	if (existingIdx >= 0) parts[existingIdx] = param;
	else parts.push(param);
	return parts.join("&");
}
/** Encode a remote connection descriptor into an external viewer URL. */
function buildRemoteConnectionUrl(baseUrl, payload, transport = "fragment") {
	const encoded = base64UrlEncode(JSON.stringify(payload));
	const param = `${REMOTE_CONNECTION_KEY}=${encoded}`;
	if (transport === "fragment") {
		const hashIdx = baseUrl.indexOf("#");
		if (hashIdx === -1) return `${baseUrl}#${param}`;
		const beforeHash = baseUrl.slice(0, hashIdx);
		const rawHash = baseUrl.slice(hashIdx + 1);
		if (!rawHash) return `${beforeHash}#${param}`;
		const routeQueryIdx = rawHash.indexOf("?");
		if (routeQueryIdx !== -1) return `${beforeHash}#${rawHash.slice(0, routeQueryIdx + 1)}${setRemoteConnectionParam(rawHash.slice(routeQueryIdx + 1), param)}`;
		return `${beforeHash}#${setRemoteConnectionParam(rawHash, param)}`;
	}
	const hashIdx = baseUrl.indexOf("#");
	const hash = hashIdx === -1 ? "" : baseUrl.slice(hashIdx);
	const beforeHash = hashIdx === -1 ? baseUrl : baseUrl.slice(0, hashIdx);
	return `${beforeHash}${beforeHash.includes("?") ? "&" : "?"}${param}${hash}`;
}
function stripParamList(value) {
	const parts = value.split("&");
	const filtered = parts.filter((part) => part.split("=")[0] !== REMOTE_CONNECTION_KEY);
	return [filtered.join("&"), filtered.length !== parts.length];
}
/** Strip the descriptor from a URL fragment, preserving its route/query split. */
function stripHashParams(hash) {
	const routeQueryIdx = hash.indexOf("?");
	if (routeQueryIdx === -1) return stripParamList(hash);
	const route = hash.slice(0, routeQueryIdx);
	const [query, changed] = stripParamList(hash.slice(routeQueryIdx + 1));
	if (!changed) return [hash, false];
	return [query ? `${route}?${query}` : route, true];
}
/** Strip the descriptor from a URL query string (the part before any fragment). */
function stripQueryParams(beforeHash) {
	const queryIdx = beforeHash.indexOf("?");
	if (queryIdx === -1) return [beforeHash, false];
	const path = beforeHash.slice(0, queryIdx);
	const [query, changed] = stripParamList(beforeHash.slice(queryIdx + 1));
	if (!changed) return [beforeHash, false];
	return [query ? `${path}?${query}` : path, true];
}
/** Remove the remote connection descriptor from a URL before displaying or copying it. */
function stripRemoteConnectionFromUrl(input) {
	const hashIdx = input.indexOf("#");
	const rawHash = hashIdx === -1 ? void 0 : input.slice(hashIdx + 1);
	const rawBeforeHash = hashIdx === -1 ? input : input.slice(0, hashIdx);
	const [hash, hashChanged] = rawHash === void 0 ? [void 0, false] : stripHashParams(rawHash);
	const [beforeHash, queryChanged] = stripQueryParams(rawBeforeHash);
	if (!hashChanged && !queryChanged) return input;
	return hash ? `${beforeHash}#${hash}` : beforeHash;
}
//#endregion
export { resolveClientModuleSpecifier as a, isBareModuleSpecifier as i, stripRemoteConnectionFromUrl as n, clientScriptFailureHint as r, buildRemoteConnectionUrl as t };
