import "./constants.mjs";
import { t as diagnostics } from "./diagnostics-Dngy7cNp.mjs";
import { n as getPort } from "./dist-CZXfGEkd.mjs";
import { n as isRuntimeModuleResolvable, t as importRuntimeModule } from "./import-runtime-module-BzlEQ9PI.mjs";
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
//#endregion
//#region src/node/agentic.ts
const AGENTIC_PACKAGE = "@devframes/agentic";
/**
* Whether `@devframes/agentic` is resolvable from devframe's own location
* (where its optional peer is linked). A pure `require.resolve` probe: no
* module is loaded, so the `'auto'` miss path stays zero-cost.
*/
function isAgenticInstalled(pkg = AGENTIC_PACKAGE) {
	return isRuntimeModuleResolvable(`${pkg}/package.json`);
}
let warnedMissing = false;
/** Report DF0078 (agent surface without `@devframes/agentic`) once per process. */
function warnAgenticMcpMissingOnce() {
	if (warnedMissing) return;
	warnedMissing = true;
	diagnostics.DF0078();
}
/**
* Load the MCP adapter from `@devframes/agentic/mcp`, mapping a failed load
* (typically: the optional peer is not installed) to a thrown `DF0079`.
* Loads through `importRuntimeModule`, so the adapter and the MCP SDK behind
* it never enter a consumer's bundle graph.
*/
async function importAgenticMcp(specifier = `${AGENTIC_PACKAGE}/mcp`) {
	try {
		return await importRuntimeModule(specifier);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw diagnostics.DF0079({
			reason,
			cause: error
		});
	}
}
//#endregion
//#region src/adapters/_shared.ts
const DEFAULT_PORT = 9999;
/**
* Resolve the mount base path for a devframe's SPA. Hosted adapters
* (`vite`, `embedded`) default to `/__<id>/` so they don't collide
* with the host app; standalone adapters (`cli`, `build`)
* default to `/` because they own the origin.
*
* The devframe author can override with `basePath` on the definition.
*/
function resolveBasePath(def, kind) {
	if (def.basePath) return normalizeBasePath(def.basePath);
	return kind === "standalone" ? "/" : `/__${def.id}/`;
}
function normalizeBasePath(base) {
	return cleanDoubleSlashes(withTrailingSlash(withLeadingSlash(base)));
}
/**
* Resolve the listening port for `createDevServer` (and `createHandler`'s
* side-car tiers), honoring the definition's `cli.port` / `cli.portRange` /
* `cli.random` settings. Exposed separately so authors who run their own
* argv parsing can resolve a port up-front (to print it, log it, etc.)
* before starting the server.
*/
async function resolveDevServerPort(def, options = {}) {
	const host = options.host ?? def.cli?.host ?? "localhost";
	const portOptions = {
		port: options.defaultPort ?? def.cli?.port ?? DEFAULT_PORT,
		host
	};
	if (def.cli?.portRange) portOptions.portRange = def.cli.portRange;
	if (def.cli?.random) portOptions.random = def.cli.random;
	return getPort(portOptions);
}
/**
* Normalize an *explicit* `mcp` setting into a fully-resolved config, or
* `undefined` when the MCP route is disabled. `'auto'` also resolves to
* `undefined` here: whether it mounts depends on the live agent surface,
* which only the mounting adapter can consult (through
* {@link loadAutoMcpAdapter}) - static resolvers like
* `resolveMcpConnectionMeta` treat it as unadvertisable.
*
* An enabled route trusts same-machine callers by default: the authorization
* resolves to origin-only (`false`) unless the object config opts into a
* bearer/callback identity check. An empty-string bearer is treated as no
* bearer (origin-only) rather than a usable credential.
*/
function resolveMcpConfig(mcp) {
	if (!mcp || mcp === "auto") return void 0;
	if (mcp === true) return { authorization: false };
	const authorization = typeof mcp.authorization === "string" && mcp.authorization.length === 0 ? false : mcp.authorization ?? false;
	return {
		...mcp.path !== void 0 ? { path: mcp.path } : {},
		...mcp.allowedOrigins !== void 0 ? { allowedOrigins: mcp.allowedOrigins } : {},
		...mcp.exposeSharedState !== void 0 ? { exposeSharedState: mcp.exposeSharedState } : {},
		...mcp.instructions !== void 0 ? { instructions: mcp.instructions } : {},
		authorization
	};
}
/**
* Resolve the `mcp: 'auto'` default at mount time: import the MCP adapter
* from the optional `@devframes/agentic` peer when the devframe's agent
* surface is non-empty, or return `undefined` (mount nothing) when the
* surface is empty - the zero-cost path, loading no MCP code at all. A
* non-empty surface with the peer absent also mounts nothing, reporting a
* one-time DF0078 warning instead. The adapter (and the MCP SDK behind it)
* loads through `importRuntimeModule`, so it never enters a consumer's
* bundle graph.
*/
async function loadAutoMcpAdapter(agent) {
	if (!agent.hasSurface()) return void 0;
	if (!isAgenticInstalled()) {
		warnAgenticMcpMissingOnce();
		return;
	}
	return await importAgenticMcp();
}
/**
* Resolve the `mcp` entry a `__connection.json` should advertise for a dev
* server started with the given `mcp` option, or `undefined` when the route
* is disabled. `'auto'` (the omitted default) resolves at mount time against
* the live agent surface, so hand-rolled meta advertises it only for an
* explicit setting; the adapters advertise the actually-mounted route
* themselves.
*
* Hosted bridges that hand-roll their connection meta pass the side-car
* `port`: the advertised path becomes absolute (the side-car mounts at `/`)
* and the client dials `<page-host>:<port><path>`. Without `port` the path
* stays relative, resolved against `__connection.json`'s own location (the
* same-server default).
*/
function resolveMcpConnectionMeta(mcp, port) {
	const config = resolveMcpConfig(mcp);
	if (!config) return void 0;
	const route = withoutLeadingSlash(config.path ?? "__mcp");
	return port != null ? {
		path: withLeadingSlash(route),
		port
	} : { path: route };
}
//#endregion
export { resolveMcpConfig as a, joinURL as c, withoutLeadingSlash as d, withoutTrailingSlash as f, resolveDevServerPort as i, withBase as l, normalizeBasePath as n, resolveMcpConnectionMeta as o, resolveBasePath as r, importAgenticMcp as s, loadAutoMcpAdapter as t, withLeadingSlash as u };
