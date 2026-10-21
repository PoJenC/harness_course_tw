import { t as diagnostics } from "./diagnostics-Dngy7cNp.mjs";
import { t as lookup } from "./mrmime-40h5OOIp.mjs";
import { createRequire } from "node:module";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, normalize, resolve, sep } from "pathe";
import { isatty } from "node:tty";
import { formatWithOptions, inspect } from "node:util";
import { createReadStream, existsSync } from "node:fs";
import { Buffer } from "node:buffer";
import { Readable } from "node:stream";
//#region ../../node_modules/.pnpm/obug@3.0.0/node_modules/obug/dist/core.js
/**
* Coerce `value`.
*/
function coerce(value) {
	if (value instanceof Error) return value.stack || value.message;
	return value;
}
/**
* Selects a color for a debug namespace
* @return An ANSI color code for the given namespace
*/
function selectColor(colors, namespace) {
	let hash = 0;
	for (let i = 0; i < namespace.length; i++) {
		hash = (hash << 5) - hash + namespace.charCodeAt(i);
		hash |= 0;
	}
	return colors[Math.abs(hash) % colors.length];
}
/**
* Checks if the given string matches a namespace template, honoring
* asterisks as wildcards.
*/
function matchesTemplate(search, template) {
	let searchIndex = 0;
	let templateIndex = 0;
	let starIndex = -1;
	let matchIndex = 0;
	while (searchIndex < search.length) if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
		if (template[templateIndex] === "*") {
			starIndex = templateIndex;
			matchIndex = searchIndex;
			templateIndex++;
		} else {
			searchIndex++;
			templateIndex++;
		}
	} else if (starIndex !== -1) {
		templateIndex = starIndex + 1;
		matchIndex++;
		searchIndex = matchIndex;
	} else return false;
	while (templateIndex < template.length && template[templateIndex] === "*") templateIndex++;
	return templateIndex === template.length;
}
function humanize(value) {
	if (value >= 1e3) return `${(value / 1e3).toFixed(1)}s`;
	return `${value}ms`;
}
let globalNamespaces = "";
function createDebug$1(namespace, options) {
	let prevTime;
	let enableOverride;
	let namespacesCache;
	let enabledCache;
	const debug = ((...args) => {
		if (!debug.enabled) return;
		const curr = Date.now();
		const diff = curr - (prevTime || curr);
		prevTime = curr;
		args[0] = coerce(args[0]);
		if (typeof args[0] !== "string") args.unshift("%O");
		let index = 0;
		args[0] = args[0].replace(/%([a-z%])/gi, (match, format) => {
			if (match === "%%") return "%";
			index++;
			const formatter = options.formatters[format];
			if (typeof formatter === "function") {
				const value = args[index];
				match = formatter.call(debug, value);
				args.splice(index, 1);
				index--;
			}
			return match;
		});
		options.formatArgs.call(debug, diff, args);
		debug.log(...args);
	});
	debug.extend = function(namespace, delimiter = ":") {
		return createDebug$1(this.namespace + delimiter + namespace, {
			useColors: this.useColors,
			color: this.color,
			formatArgs: this.formatArgs,
			formatters: this.formatters,
			inspectOpts: this.inspectOpts,
			log: this.log,
			humanize: this.humanize
		});
	};
	Object.assign(debug, options);
	debug.namespace = namespace;
	Object.defineProperty(debug, "enabled", {
		enumerable: true,
		configurable: false,
		get: () => {
			if (enableOverride != null) return enableOverride;
			if (namespacesCache !== globalNamespaces) {
				namespacesCache = globalNamespaces;
				enabledCache = enabled(namespace);
			}
			return enabledCache;
		},
		set: (v) => {
			enableOverride = v;
		}
	});
	return debug;
}
let names = [];
let skips = [];
function enable(namespaces) {
	globalNamespaces = namespaces;
	names = [];
	skips = [];
	const split = globalNamespaces.trim().replace(/\s+/g, ",").split(",").filter(Boolean);
	for (const ns of split) if (ns[0] === "-") skips.push(ns.slice(1));
	else names.push(ns);
}
/**
* Returns true if the given mode name is enabled, false otherwise.
*/
function enabled(name) {
	for (const skip of skips) if (matchesTemplate(name, skip)) return false;
	for (const ns of names) if (matchesTemplate(name, ns)) return true;
	return false;
}
//#endregion
//#region ../../node_modules/.pnpm/obug@3.0.0/node_modules/obug/dist/ansi.js
let env = {};
try {
	process.env.DEBUG;
	env = process.env;
} catch (_unused) {}
const colors = process.stderr.getColorDepth && process.stderr.getColorDepth(env) > 2 ? [
	20,
	21,
	26,
	27,
	32,
	33,
	38,
	39,
	40,
	41,
	42,
	43,
	44,
	45,
	56,
	57,
	62,
	63,
	68,
	69,
	74,
	75,
	76,
	77,
	78,
	79,
	80,
	81,
	92,
	93,
	98,
	99,
	112,
	113,
	128,
	129,
	134,
	135,
	148,
	149,
	160,
	161,
	162,
	163,
	164,
	165,
	166,
	167,
	168,
	169,
	170,
	171,
	172,
	173,
	178,
	179,
	184,
	185,
	196,
	197,
	198,
	199,
	200,
	201,
	202,
	203,
	204,
	205,
	206,
	207,
	208,
	209,
	214,
	215,
	220,
	221
] : [
	6,
	2,
	3,
	4,
	5,
	1
];
const inspectOpts = Object.keys(env).filter((key) => /^debug_/i.test(key)).reduce((obj, key) => {
	const prop = key.slice(6).toLowerCase().replace(/_([a-z])/g, (_, k) => k.toUpperCase());
	let value = env[key];
	const lowerCase = typeof value === "string" && value.toLowerCase();
	if (value === "null") value = null;
	else if (lowerCase === "yes" || lowerCase === "on" || lowerCase === "true" || lowerCase === "enabled") value = true;
	else if (lowerCase === "no" || lowerCase === "off" || lowerCase === "false" || lowerCase === "disabled") value = false;
	else value = Number(value);
	obj[prop] = value;
	return obj;
}, Object.create(null));
/**
* Is stdout a TTY? Colored output is enabled when `true`.
*/
function useColors() {
	return "colors" in inspectOpts ? Boolean(inspectOpts.colors) : isatty(process.stderr.fd);
}
function getDate() {
	if (inspectOpts.hideDate) return "";
	return `${(/* @__PURE__ */ new Date()).toISOString()} `;
}
/**
* Adds ANSI color escape codes if enabled.
*/
function formatArgs(diff, args) {
	const { namespace: name, useColors } = this;
	if (useColors) {
		const c = this.color;
		const colorCode = `\u{1B}[3${c < 8 ? c : `8;5;${c}`}`;
		const prefix = `  ${colorCode};1m${name} \u{1B}[0m`;
		args[0] = prefix + args[0].split("\n").join(`\n${prefix}`);
		args.push(`${colorCode}m+${this.humanize(diff)}\u{1B}[0m`);
	} else args[0] = `${getDate()}${name} ${args[0]}`;
}
function log(...args) {
	process.stderr.write(`${formatWithOptions(this.inspectOpts, ...args)}\n`);
}
const defaultOptions = {
	useColors: useColors(),
	formatArgs,
	formatters: {
		/**
		* Map %o to `util.inspect()`, all on a single line.
		*/
		o(v) {
			this.inspectOpts.colors = this.useColors;
			return inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
		},
		/**
		* Map %O to `util.inspect()`, allowing multiple lines if needed.
		*/
		O(v) {
			this.inspectOpts.colors = this.useColors;
			return inspect(v, this.inspectOpts);
		}
	},
	inspectOpts,
	log,
	humanize
};
function createDebug(namespace, options) {
	var _ref;
	const color = (_ref = options && options.color) !== null && _ref !== void 0 ? _ref : selectColor(colors, namespace);
	return createDebug$1(namespace, Object.assign(defaultOptions, { color }, options));
}
enable(env.DEBUG || "");
//#endregion
//#region src/utils/remote-assets.ts
const debugFetch = createDebug("devframe:remote-assets:fetch");
const debugCache = createDebug("devframe:remote-assets:cache");
const MANIFEST_FILENAME = ".manifest.json";
/**
* Upstream response headers replayed to the browser. Everything outside this
* list is dropped, because it describes the *provider's* transfer rather than
* the file: hop-by-hop and encoding headers no longer match the body `fetch`
* already decoded, and a CDN's policy headers (`set-cookie`, `cache-control`,
* framing/CSP) belong to its origin, so replaying them under the dev server's
* origin could just as well break the iframe these assets render in.
*/
const PROXIED_HEADERS = [
	"content-language",
	"etag",
	"last-modified"
];
const CACHE_CONTROL_HEADER = "no-store";
/** Flatten a jsDelivr (`name`/`files`) or unpkg (`path`/`files`) file tree. */
function flattenTree(nodes, style) {
	const out = [];
	const walk = (list, prefix) => {
		for (const node of list) if (style === "path") {
			if (node.type === "file") out.push((node.path ?? "").replace(/^\//, ""));
			else walk(node.files ?? [], "");
		} else if (node.type === "file") out.push(prefix + (node.name ?? ""));
		else if (node.files) walk(node.files, `${prefix}${node.name}/`);
	};
	walk(nodes, "");
	return out;
}
const providers = {
	jsdelivr: {
		fileUrl: (pkg, version, filePath) => `https://cdn.jsdelivr.net/npm/${pkg}@${version}/${filePath}`,
		listFiles: async (pkg, version, fetchImpl) => {
			const url = `https://data.jsdelivr.com/v1/packages/npm/${pkg}@${version}`;
			debugFetch("listing files for %s@%s from %s", pkg, version, url);
			const res = await fetchImpl(url);
			if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
			return flattenTree((await res.json()).files ?? [], "name");
		}
	},
	unpkg: {
		fileUrl: (pkg, version, filePath) => `https://unpkg.com/${pkg}@${version}/${filePath}`,
		listFiles: async (pkg, version, fetchImpl) => {
			const url = `https://unpkg.com/${pkg}@${version}/?meta`;
			debugFetch("listing files for %s@%s from %s", pkg, version, url);
			const res = await fetchImpl(url);
			if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
			return flattenTree([await res.json()], "path");
		}
	}
};
function resolveProvider(assets) {
	const p = assets.provider ?? "jsdelivr";
	return typeof p === "string" ? {
		provider: providers[p],
		name: p
	} : {
		provider: p,
		name: "custom"
	};
}
/**
* Resolve a locally installed copy of `assets.package` from
* `assets.resolveFrom`'s dependency graph and return its assets directory,
* or `undefined` when the package (or directory) is absent. A different
* installed version warns (`DF0062`); a different major throws (`DF0061`).
*/
function resolveInstalled(assets) {
	if (assets.resolveFrom == null) return void 0;
	let pkgJsonPath;
	let installed;
	try {
		const requireFrom = createRequire(assets.resolveFrom);
		pkgJsonPath = requireFrom.resolve(`${assets.package}/package.json`);
		installed = requireFrom(`${assets.package}/package.json`).version;
	} catch {
		return;
	}
	if (typeof installed !== "string") return void 0;
	if (installed !== assets.version) {
		const major = (v) => v.trim().split(".")[0] ?? v;
		if (major(installed) !== major(assets.version)) throw diagnostics.DF0061({
			package: assets.package,
			required: assets.version,
			installed
		});
		diagnostics.DF0062({
			package: assets.package,
			required: assets.version,
			installed
		});
	}
	const dir = join(dirname(pkgJsonPath), assets.path ?? "dist");
	return existsSync(dir) ? dir : void 0;
}
function contentTypeFor(filePath) {
	const type = lookup(filePath);
	if (!type) return "application/octet-stream";
	return type === "text/html" ? "text/html; charset=utf-8" : type;
}
/**
* Headers for a file streamed through from the provider. `Content-Type` and
* `Cache-Control` are ours, so a file looks identical whether it came from the
* provider or from the cache ({@link createStore}'s `serveCached`).
*/
function proxyHeaders(filePath, upstream) {
	const headers = new Headers({
		"Content-Type": contentTypeFor(filePath),
		"Cache-Control": CACHE_CONTROL_HEADER
	});
	const encoding = upstream.get("content-encoding");
	const length = upstream.get("content-length");
	if (length && (!encoding || encoding === "identity")) headers.set("Content-Length", length);
	for (const name of PROXIED_HEADERS) {
		const value = upstream.get(name);
		if (value != null) headers.set(name, value);
	}
	return headers;
}
/** Clean a request path into a safe package-relative POSIX path, or `null` if it escapes root. */
function cleanRequestPath(urlPath) {
	let cleaned;
	try {
		cleaned = decodeURIComponent(urlPath || "/");
	} catch {
		return null;
	}
	cleaned = cleaned.replace(/[?#].*$/, "").replace(/^\/+|\/+$/g, "");
	const normalized = normalize(cleaned);
	if (normalized === ".." || normalized.startsWith(`..${sep}`) || normalized.startsWith("/")) return null;
	return normalized === "." ? "" : normalized;
}
/** Candidate files for a request, in order: direct hit, index, `.html`, SPA fallback. */
function candidatePaths(prefix, cleaned) {
	const candidates = [];
	if (cleaned) candidates.push(prefix + cleaned);
	candidates.push(`${prefix}${cleaned ? `${cleaned}/` : ""}index.html`);
	if (cleaned && !extname(cleaned)) candidates.push(`${prefix + cleaned}.html`);
	if (!/\.[a-z0-9]+$/i.test(cleaned) && !candidates.includes(`${prefix}index.html`)) candidates.push(`${prefix}index.html`);
	return candidates;
}
/**
* Resolve the safe destination for a provider-listed `filePath` beneath
* `prefix`, materializing into the already-resolved `root`, or `null` when
* the entry is unsafe or lies outside the selected `prefix`. A compromised
* provider is an untrusted boundary even though the built-in jsDelivr/unpkg
* listings never emit any of this: reject an absolute path, a backslash
* (never normalized into a separator; Windows-style traversal stays rejected
* on every platform), and any suffix whose resolved destination would land
* outside `root`. `target === root` is deliberately unsafe too: it names the
* directory itself, never a writable file.
*/
function materializeTarget(filePath, prefix, root) {
	if (filePath.includes("\\") || isAbsolute(filePath) || !filePath.startsWith(prefix)) return null;
	const suffix = filePath.slice(prefix.length);
	if (!suffix || isAbsolute(suffix)) return null;
	const target = resolve(root, suffix);
	return target === root || !target.startsWith(root + sep) ? null : target;
}
function createStore(assets, cacheDir) {
	const normalized = {
		...assets,
		path: assets.path ?? "dist"
	};
	const { provider, name: providerName } = resolveProvider(assets);
	const fetchImpl = assets.fetch ?? globalThis.fetch;
	const prefix = `${normalized.path}/`;
	let manifestPromise;
	let manifestReported = false;
	async function loadManifest() {
		const manifestFile = join(cacheDir, MANIFEST_FILENAME);
		if (existsSync(manifestFile)) try {
			return new Set(JSON.parse(await readFile(manifestFile, "utf8")));
		} catch {}
		if (assets.offline || !provider.listFiles) return null;
		try {
			const files = await provider.listFiles(normalized.package, normalized.version, fetchImpl);
			await mkdir(cacheDir, { recursive: true });
			await writeFile(manifestFile, JSON.stringify(files), "utf8").catch(() => {});
			return new Set(files);
		} catch (error) {
			if (!manifestReported) {
				manifestReported = true;
				diagnostics.DF0059({
					package: normalized.package,
					version: normalized.version,
					provider: providerName,
					reason: errText(error),
					cause: error
				});
			}
			return null;
		}
	}
	async function serveCached(filePath) {
		const abs = join(cacheDir, filePath);
		let size;
		try {
			const s = await stat(abs);
			if (!s.isFile()) return null;
			size = s.size;
		} catch {
			return null;
		}
		debugCache("serving %s from cache (%d bytes)", filePath, size);
		return new Response(Readable.toWeb(createReadStream(abs)), { headers: {
			"Content-Type": contentTypeFor(filePath),
			"Content-Length": String(size),
			"Cache-Control": CACHE_CONTROL_HEADER
		} });
	}
	/** Persist `body` to the cache at `filePath` (tmp + rename); failures warn (`DF0063`). */
	async function persist(filePath, body) {
		const target = join(cacheDir, filePath);
		const tmp = `${target}.${Math.random().toString(36).slice(2)}.tmp`;
		try {
			await mkdir(dirname(target), { recursive: true });
			await writeFile(tmp, Buffer.from(await new Response(body).arrayBuffer()));
			await rename(tmp, target);
		} catch (error) {
			await rm(tmp, { force: true }).catch(() => {});
			diagnostics.DF0063({
				filepath: target,
				reason: errText(error),
				cause: error
			});
		}
	}
	/** Fetch `filePath` through the provider: `null` on 404, a `Response` on 200, throws (`DF0060`) otherwise. */
	async function serveRemote(filePath) {
		const url = provider.fileUrl(normalized.package, normalized.version, filePath);
		let res;
		try {
			debugFetch("fetching %s from %s", filePath, url);
			res = await fetchImpl(url);
		} catch (error) {
			throw diagnostics.DF0060({
				url,
				package: normalized.package,
				reason: errText(error),
				cause: error
			});
		}
		if (res.status === 404) {
			await res.body?.cancel().catch(() => {});
			return null;
		}
		if (!res.ok || !res.body) {
			await res.body?.cancel().catch(() => {});
			throw diagnostics.DF0060({
				url,
				package: normalized.package,
				reason: `HTTP ${res.status}`
			});
		}
		const [toClient, toCache] = res.body.tee();
		persist(filePath, toCache);
		return new Response(toClient, {
			status: res.status,
			statusText: res.statusText,
			headers: proxyHeaders(filePath, res.headers)
		});
	}
	async function serve(urlPath) {
		const cleaned = cleanRequestPath(urlPath);
		if (cleaned === null) return null;
		const candidates = candidatePaths(prefix, cleaned);
		manifestPromise ??= loadManifest();
		const manifest = await manifestPromise;
		if (manifest) {
			const filePath = candidates.find((c) => manifest.has(c));
			if (!filePath) return null;
			return await serveCached(filePath) ?? (assets.offline ? Promise.reject(diagnostics.DF0060({
				url: filePath,
				package: normalized.package,
				reason: "offline: true and the file is not in the cache"
			})) : serveRemote(filePath));
		}
		for (const candidate of candidates) {
			const cached = await serveCached(candidate);
			if (cached) return cached;
		}
		if (assets.offline) return null;
		for (const candidate of candidates) {
			const remote = await serveRemote(candidate);
			if (remote) return remote;
		}
		return null;
	}
	async function materialize(targetDir) {
		const fail = (reason, cause) => {
			throw diagnostics.DF0064({
				package: normalized.package,
				version: normalized.version,
				reason,
				cause
			});
		};
		if (!provider.listFiles) fail("the configured provider has no file listing (`listFiles`)");
		let files;
		try {
			files = await provider.listFiles(normalized.package, normalized.version, fetchImpl);
		} catch (error) {
			return fail(errText(error), error);
		}
		const root = resolve(targetDir);
		for (const filePath of files) {
			const target = materializeTarget(filePath, prefix, root);
			if (target == null) continue;
			const url = provider.fileUrl(normalized.package, normalized.version, filePath);
			let res;
			try {
				res = await fetchImpl(url);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
			} catch (error) {
				return fail(`failed to download ${filePath}: ${errText(error)}`, error);
			}
			await mkdir(dirname(target), { recursive: true });
			await writeFile(target, Buffer.from(await res.arrayBuffer()));
		}
	}
	return {
		assets: normalized,
		serve,
		materialize
	};
}
function errText(error) {
	return error instanceof Error ? error.message : String(error);
}
const PACKAGE_NAME_RE = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const VERSION_RE = /^\d+\.\d+\.\d+(?:-[a-z0-9-]+(?:\.[a-z0-9-]+)*)?(?:\+[a-z0-9-]+(?:\.[a-z0-9-]+)*)?$/i;
/** Reject a {@link RemoteAssets} with an unsafe package name or version (`DF0065`). */
function assertValidRemoteAssets(assets) {
	if (assets.package.length > 214 || !PACKAGE_NAME_RE.test(assets.package)) throw diagnostics.DF0065({
		field: "package",
		value: assets.package
	});
	if (!VERSION_RE.test(assets.version)) throw diagnostics.DF0065({
		field: "version",
		value: assets.version
	});
}
/**
* Normalize a {@link StaticAssetsSource} into something servable: a local
* directory (strings pass through; a remote source short-circuits to a
* locally installed copy of its package when present) or a caching
* {@link RemoteAssetsStore} back-proxy. Remote caches live under
* `<projectStorageDir>/.remote-assets/<package>@<version>/`.
*
* A remote source's `package`/`version` are validated first (`DF0065`); both
* are interpolated into CDN URLs and the cache path.
*
* `defaultResolveFrom` (typically the declaring devframe's `importMetaUrl`)
* supplies a `resolveFrom` base for a remote source that doesn't set one:
* it is applied only when `source.resolveFrom` is `undefined`, so an explicit
* per-source string still wins and an explicit `null` still opts out of the
* installed-copy lookup.
*/
function resolveStaticAssetsSource(source, projectStorageDir, defaultResolveFrom) {
	if (typeof source === "string") return source;
	assertValidRemoteAssets(source);
	const resolved = source.resolveFrom === void 0 && defaultResolveFrom != null ? {
		...source,
		resolveFrom: defaultResolveFrom
	} : source;
	return resolveInstalled(resolved) ?? createStore(resolved, join(projectStorageDir, ".remote-assets", `${resolved.package.replace(/\//g, "+")}@${resolved.version}`));
}
//#endregion
export { createDebug as n, resolveStaticAssetsSource as t };
