import { a as defineDiagnostics, i as createBirpc, n as argsToJsonSchema, o as DEVFRAME_EVENTS, r as resolveAgentSafety, t as toolInputToRpcArgs } from "../tool-input-CES3Pc4y.mjs";
import { t as hash } from "../hash-DdPnc4k3.mjs";
import { createEventEmitter } from "../utils/events.mjs";
import { withBase, withProtocol } from "../utils/url.mjs";
import { t as createSharedState } from "../shared-state-Cow3u-_m.mjs";
import { i as structuredCloneStringify, n as structuredCloneParse, t as structuredCloneDeserialize } from "../structured-clone-CgtQ61SA.mjs";
import { createStreamReader, createStreamSink } from "../utils/streaming-channel.mjs";
import { toAgentToolName } from "../utils/agent-tool-name.mjs";
//#region src/constants.ts
/** Devframe runtime routes and static output conventions. */
const DEVFRAME_CONNECTION_META_FILENAME = "__connection.json";
/**
* Global key holding the serializable connection prepared by
* `setupDevframeConnection()`. External viewers can use this key to read the
* connection from another JavaScript realm.
*/
const DEVFRAME_CONNECTION_KEY = "__DEVFRAME_CONNECTION__";
/**
* Request header carrying the SSE session id on every RPC `POST`. The
* server mints the id as the stream's first event (`event: session`);
* the client echoes it here so the POST joins that stream's birpc
* channel. Mirrors birpc's own SSE helpers for wire compatibility.
*/
const DEVFRAME_SSE_SESSION_HEADER = "x-birpc-session";
const DEVFRAME_RPC_DUMP_MANIFEST_FILENAME = "__rpc-dump/index.json";
/**
* Shared-state key carrying the wire-service advertisements (package name →
* `DevframeServiceMeta`). Written by the node services host; mirrored to
* clients for feature-detection via `client.services`.
*/
const DEVFRAME_SERVICES_STATE_KEY = "devframe:services";
/**
* Page-URL **fragment** parameter carrying a one-time authentication code (OTP)
* for "magic link" auth. A host can print a link like
* `<origin>/#devframe_otp=<code>`; the client reads the code, exchanges it for a
* token, and strips the parameter from the URL. The code rides the fragment
* (never the query string) so the browser never transmits it to the server,
* keeping it out of access logs and `Referer` headers. See `buildOtpAuthUrl`
* (node) and the `authenticateWithUrlOtp` / `consumeOtpFromUrl` client utilities
* (or `connectDevframe`'s `otpParam`).
*/
const DEVFRAME_OTP_URL_PARAM = "devframe_otp";
/**
* WS upgrade-URL query parameter carrying a previously-issued bearer token.
* Set by `createWsRpcChannel` (browser transport) whenever `authToken` is
* passed; read at connect time by a host's connect-time trust hook (see
* `recipes/interactive-auth`'s `onConnect`) so a returning client can be
* trusted before its own `anonymous:devframe:auth` handshake call arrives.
*/
const DEVFRAME_AUTH_TOKEN_QUERY_PARAM = "devframe_auth_token";
/** External viewer origin requested during connection bootstrap. */
const DEVFRAME_VIEWER_ORIGIN_QUERY_PARAM = "devframe_viewer_origin";
/** Token that authorizes an external viewer origin registration. */
const DEVFRAME_VIEWER_ORIGIN_TOKEN_QUERY_PARAM = "devframe_viewer_origin_token";
DEVFRAME_EVENTS.postMessage.remoteAssetsError;
//#endregion
//#region src/rpc/cache.ts
/**
* @experimental API is expected to change.
*/
var RpcCacheManager = class {
	cacheMap = /* @__PURE__ */ new Map();
	options;
	keySerializer;
	constructor(options) {
		this.options = options;
		this.keySerializer = options.keySerializer || ((args) => hash(args));
	}
	updateOptions(options) {
		this.options = {
			...this.options,
			...options
		};
	}
	cached(m, a) {
		const methodCache = this.cacheMap.get(m);
		if (methodCache) return methodCache.get(this.keySerializer(a));
	}
	has(m, a) {
		return this.cacheMap.get(m)?.has(this.keySerializer(a)) ?? false;
	}
	apply(req, res) {
		const methodCache = this.cacheMap.get(req.m) || /* @__PURE__ */ new Map();
		methodCache.set(this.keySerializer(req.a), res);
		this.cacheMap.set(req.m, methodCache);
	}
	validate(m) {
		return this.options.functions.includes(m);
	}
	clear(fn) {
		if (fn) this.cacheMap.delete(fn);
		else this.cacheMap.clear();
	}
};
//#endregion
//#region src/rpc/diagnostics.ts
const diagnostics = defineDiagnostics({
	docsBase: "https://devfra.me/errors",
	codes: {
		DF0019: {
			why: (p) => `RPC function "${p.name}" has \`agent\` set but \`jsonSerializable\` is \`false\`; MCP requires JSON-serializable data.`,
			fix: "Remove `jsonSerializable: false`, or remove `agent` to keep it RPC-only."
		},
		DF0020: {
			why: (p) => `RPC function "${p.name}" declares \`jsonSerializable: true\` but the value at "${p.path}" is a ${p.type}.`,
			fix: "Either drop `jsonSerializable: true` (falls back to structured-clone) or change the value to a JSON-safe shape."
		},
		DF0021: {
			why: (p) => `RPC function "${p.name}" is already registered`,
			fix: "Use the `force` parameter to overwrite an existing registration."
		},
		DF0022: { why: (p) => `RPC function "${p.name}" is not registered. Use register() to add new functions.` },
		DF0023: { why: (p) => `RPC function "${p.name}" is not registered` },
		DF0024: { why: (p) => `Either handler or setup function must be provided for RPC function "${p.name}"` },
		DF0025: { why: (p) => `Function "${p.name}" not found in dump store` },
		DF0026: { why: (p) => `No dump match for "${p.name}" with args: ${p.args}` },
		DF0027: { why: (p) => `Function "${p.name}" with type "${p.type}" cannot have dump configuration. Only "static" and "query" types support dumps.` },
		DF0028: {
			why: (p) => `Function "${p.name}" with type "${p.type}" cannot use \`snapshot: true\`. Only "query" functions support this sugar; "static" functions have equivalent default behavior already.`,
			fix: "Remove `snapshot: true`, or change the function type to `query`."
		},
		DF0043: {
			why: (p) => `RPC function "${p.name}" received an invalid argument at position ${p.index}: ${p.issues}`,
			fix: "Pass a value that satisfies the `args` schema declared for this function."
		},
		DF0044: {
			why: (p) => `RPC function "${p.name}" returned a value that failed its \`returns\` schema: ${p.issues}`,
			fix: "Make the handler return a value that satisfies the `returns` schema, or relax the schema."
		}
	}
});
//#endregion
//#region src/rpc/agent-json-serialization.ts
/**
* Prevents using a coding-agent-exposed RPC function that is explicitly
* marked as non-serializable, and marks these functions as serializable by
* default.
*
* @internal
*/
function ensureAgentJsonSerializable(fnDef) {
	if (fnDef.agent && fnDef.jsonSerializable === false) throw diagnostics.DF0019({ name: fnDef.name });
	if (fnDef.agent && !fnDef.jsonSerializable) fnDef.jsonSerializable = true;
}
//#endregion
//#region src/rpc/validate-io.ts
/**
* Run a single [Standard Schema](https://standardschema.dev) validator,
* awaiting the result when the validator is asynchronous.
*/
async function runStandardSchema(schema, value) {
	const result = schema["~standard"].validate(value);
	return result instanceof Promise ? await result : result;
}
/**
* Render Standard Schema issues into a single human-readable line for a
* diagnostic message, prefixing each with its dotted path when present.
*/
function formatIssues(issues) {
	return issues.map((issue) => {
		const path = issue.path?.map((segment) => typeof segment === "object" ? segment.key : segment).join(".");
		return path ? `${path}: ${issue.message}` : issue.message;
	}).join("; ");
}
/**
* Validate positional arguments against their declared schemas. Only
* indices with a schema are checked; extra arguments pass through
* untouched. Throws `DF0038` on the first failing argument.
*
* Validation guards the payload without rewriting it: the original values
* are handed to the handler unchanged, so a schema that describes a subset
* of an object never silently strips the sender's extra fields (and any
* declared transforms stay a purely type-level concern).
*
* @internal
*/
async function validateRpcArgs(name, argsSchema, args) {
	const original = args.slice();
	if (!argsSchema || argsSchema.length === 0) return original;
	for (let index = 0; index < argsSchema.length; index++) {
		const schema = argsSchema[index];
		if (!schema) continue;
		const result = await runStandardSchema(schema, args[index]);
		if (result.issues) throw diagnostics.DF0043({
			name,
			index,
			issues: formatIssues(result.issues)
		});
	}
	return original;
}
/**
* Validate a handler's resolved return value against its declared schema.
* Throws `DF0039` when the value fails the schema, otherwise returns the
* original value unchanged (guard-only, never rewriting the payload; see
* {@link validateRpcArgs}). Passes through when no return schema is set.
*
* @internal
*/
async function validateRpcReturn(name, returnSchema, value) {
	if (!returnSchema) return value;
	const result = await runStandardSchema(returnSchema, value);
	if (result.issues) throw diagnostics.DF0044({
		name,
		issues: formatIssues(result.issues)
	});
	return value;
}
//#endregion
//#region src/rpc/handler.ts
async function getRpcResolvedSetupResult(definition, context) {
	if (!definition.setup) return {};
	if (typeof context === "object" && context !== null) {
		definition.__cache ??= /* @__PURE__ */ new WeakMap();
		const cache = definition.__cache;
		let promise = cache.get(context);
		if (!promise) {
			promise = Promise.resolve(definition.setup(context));
			promise.catch(() => {
				if (cache.get(context) === promise) cache.delete(context);
			});
			cache.set(context, promise);
		}
		return await promise;
	}
	if (!definition.__promise) {
		const promise = Promise.resolve(definition.setup(context));
		promise.catch(() => {
			if (definition.__promise === promise) definition.__promise = void 0;
		});
		definition.__promise = promise;
	}
	return await definition.__promise;
}
async function getRpcHandler(definition, context) {
	let handler = definition.handler;
	if (!handler) {
		const result = await getRpcResolvedSetupResult(definition, context);
		if (!result.handler) throw diagnostics.DF0024({ name: definition.name });
		handler = result.handler;
	}
	const argsSchema = definition.args;
	const returnSchema = definition.returns;
	if (!argsSchema && !returnSchema) return handler;
	const inner = handler;
	const validating = async (...args) => {
		const validatedArgs = await validateRpcArgs(definition.name, argsSchema, args);
		const output = await inner(...validatedArgs);
		return await validateRpcReturn(definition.name, returnSchema, output);
	};
	return validating;
}
//#endregion
//#region src/rpc/collector.ts
var RpcFunctionsCollectorBase = class {
	context;
	definitions = /* @__PURE__ */ new Map();
	functions;
	_onChanged = [];
	constructor(context) {
		this.context = context;
		const definitions = this.definitions;
		const self = this;
		this.functions = new Proxy({}, {
			get(_, prop) {
				const definition = definitions.get(prop);
				if (!definition) return void 0;
				return getRpcHandler(definition, self.context);
			},
			has(_, prop) {
				return definitions.has(prop);
			},
			getOwnPropertyDescriptor(_, prop) {
				return {
					value: definitions.get(prop)?.handler,
					configurable: true,
					enumerable: true
				};
			},
			ownKeys() {
				return Array.from(definitions.keys());
			}
		});
	}
	register(fnDef, force = false) {
		if (this.definitions.has(fnDef.name) && !force) throw diagnostics.DF0021({ name: fnDef.name });
		ensureAgentJsonSerializable(fnDef);
		this.definitions.set(fnDef.name, fnDef);
		this._onChanged.forEach((cb) => cb(fnDef.name));
	}
	update(fn, force = false) {
		if (!this.definitions.has(fn.name) && !force) throw diagnostics.DF0022({ name: fn.name });
		ensureAgentJsonSerializable(fn);
		this.definitions.set(fn.name, fn);
		this._onChanged.forEach((cb) => cb(fn.name));
	}
	onChanged(fn) {
		this._onChanged.push(fn);
		return () => {
			const index = this._onChanged.indexOf(fn);
			if (index !== -1) this._onChanged.splice(index, 1);
		};
	}
	async getHandler(name) {
		return await getRpcHandler(this.definitions.get(name), this.context);
	}
	getSchema(name) {
		const definition = this.definitions.get(name);
		if (!definition) throw diagnostics.DF0023({ name: String(name) });
		return {
			args: definition.args,
			returns: definition.returns
		};
	}
	has(name) {
		return this.definitions.has(name);
	}
	get(name) {
		return this.definitions.get(name);
	}
	list() {
		return Array.from(this.definitions.keys());
	}
};
//#endregion
//#region src/rpc/serialization.ts
/**
* `JSON.stringify` with a single-pass strict replacer.
*
* Throws `DF0020` synchronously when the value contains a type JSON
* cannot round-trip losslessly: `Map`, `Set`, `Date`, `BigInt`, class
* instances, or `undefined` inside an array (silently becomes `null`).
*
* Native pass-throughs (no extra work needed):
*   - circular references: `JSON.stringify` raises `TypeError`.
*   - `BigInt` at top level: caught here for a friendlier error path.
*
* Lenient cases (allowed without throwing):
*   - `undefined` as an object property: legitimate optional field;
*     JSON.stringify just omits it.
*   - `undefined` at the root: legitimate "action returned nothing".
*   - `Symbol` / `Function` values: semantically "drop me" in JSON.
*
* `fnName` is used only for the diagnostic message; pass the RPC
* function name when calling from a wire serializer / dump writer so
* the error points at the offending function.
*/
function strictJsonStringify(value, fnName = "") {
	return JSON.stringify(value, function strictReplacer(key, val) {
		const holder = this;
		const original = holder != null ? holder[key] : val;
		if (original === void 0) {
			if (Array.isArray(holder)) throw nonJsonAt(fnName, "undefined", holder, key);
			return val;
		}
		if (original !== null) assertJsonSafe(original, holder, key, fnName);
		return val;
	});
}
/** Throw `DF0020` when `original` is a type JSON can't round-trip losslessly. */
function assertJsonSafe(original, holder, key, fnName) {
	if (typeof original === "bigint") throw nonJsonAt(fnName, "BigInt", holder, key);
	if (typeof original !== "object") return;
	if (original instanceof Map) throw nonJsonAt(fnName, "Map", holder, key);
	if (original instanceof Set) throw nonJsonAt(fnName, "Set", holder, key);
	if (original instanceof Date) throw nonJsonAt(fnName, "Date", holder, key);
	if (Array.isArray(original)) return;
	const proto = Object.getPrototypeOf(original);
	if (proto !== null && proto !== Object.prototype) throw nonJsonAt(fnName, original.constructor?.name ?? "class instance", holder, key);
}
function nonJsonAt(fnName, type, parent, key) {
	const path = formatPath(parent, key);
	return diagnostics.DF0020({
		name: fnName || "<anonymous>",
		type,
		path
	});
}
function formatPath(parent, key) {
	if (Array.isArray(parent)) return `[${key}]`;
	if (key === "") return "<root>";
	return key;
}
//#endregion
//#region src/client/connection-storage.ts
const CONNECTION_META_KEY = "__DEVFRAME_CONNECTION_META__";
const CONNECTION_AUTH_TOKEN_KEY = "__DEVFRAME_CONNECTION_AUTH_TOKEN__";
function readFromWindows(key) {
	const getters = [
		() => window?.[key],
		() => globalThis?.[key],
		() => parent.window?.[key]
	];
	for (const getter of getters) try {
		const value = getter();
		if (value) return value;
	} catch {}
}
function readStoredConnection() {
	return readFromWindows(DEVFRAME_CONNECTION_KEY);
}
function readStoredConnectionMeta() {
	return readFromWindows(CONNECTION_META_KEY);
}
function readStoredAuthToken(userAuthToken) {
	if (userAuthToken) return userAuthToken;
	try {
		const token = localStorage.getItem(CONNECTION_AUTH_TOKEN_KEY);
		if (token) return token;
	} catch {}
	return readFromWindows(CONNECTION_AUTH_TOKEN_KEY);
}
/**
* Publish the connection on this window for same-origin frames to inherit.
* Call again after mutating `connection.connectionMeta` so the legacy meta
* copy below follows.
*/
function storeConnection(connection) {
	globalThis[DEVFRAME_CONNECTION_KEY] = connection;
	globalThis[CONNECTION_META_KEY] = {
		...connection.connectionMeta,
		baseUrl: connection.metaBaseUrl
	};
	if (connection.authToken) storeAuthToken(connection.authToken);
}
function storeAuthToken(token) {
	try {
		localStorage.setItem(CONNECTION_AUTH_TOKEN_KEY, token);
	} catch {}
	globalThis[CONNECTION_AUTH_TOKEN_KEY] = token;
	const connection = readStoredConnection();
	if (connection) globalThis[DEVFRAME_CONNECTION_KEY] = {
		...connection,
		authToken: token
	};
}
//#endregion
//#region src/client/connection.ts
/**
* Allow an external viewer to connect by registering its browser origin with
* the Devframe host. Returns `false` if the host did not provide an origin
* registration token.
*/
async function registerDevframeViewerOrigin(connection, origin = globalThis.location?.origin) {
	const token = connection.connectionMeta.viewerOriginToken;
	if (!token || !origin) return false;
	const url = new URL(connection.metaBaseUrl);
	url.searchParams.set(DEVFRAME_VIEWER_ORIGIN_QUERY_PARAM, origin);
	url.searchParams.set(DEVFRAME_VIEWER_ORIGIN_TOKEN_QUERY_PARAM, token);
	const response = await fetch(url, { cache: "no-store" });
	if (!response.ok) throw new Error(`Failed to register external viewer origin (${response.status}).`);
	return true;
}
function resolveMetaBaseUrl(baseURL) {
	const metaPath = withBase(DEVFRAME_CONNECTION_META_FILENAME, baseURL);
	try {
		return new URL(metaPath, globalThis.location?.href).href;
	} catch {
		return metaPath;
	}
}
function withAuthToken(connection, authToken) {
	return authToken && authToken !== connection.authToken ? {
		...connection,
		authToken
	} : connection;
}
/**
* Return connection information previously prepared in this window or an
* accessible parent window.
*/
function getDevframeConnection() {
	const connection = readStoredConnection();
	if (connection) return withAuthToken(connection, readStoredAuthToken() ?? connection.authToken ?? connection.connectionMeta.authToken);
	const connectionMeta = readStoredConnectionMeta();
	if (!connectionMeta) return void 0;
	return {
		connectionMeta,
		metaBaseUrl: connectionMeta.baseUrl ?? resolveMetaBaseUrl("./"),
		authToken: readStoredAuthToken(connectionMeta.authToken)
	};
}
/**
* Prepare the connection information shared by a devframe client and external
* viewers. Reuses an explicit or previously prepared connection before
* fetching `__connection.json` from the configured base URLs.
*/
async function setupDevframeConnection(options = {}) {
	if (options.connection) {
		const connection = withAuthToken(options.connection, readStoredAuthToken(options.authToken ?? options.connection.authToken ?? options.connection.connectionMeta.authToken));
		storeConnection(connection);
		return connection;
	}
	const bases = Array.isArray(options.baseURL) ? options.baseURL : [options.baseURL ?? "./"];
	if (options.connectionMeta) {
		const connection = {
			connectionMeta: options.connectionMeta,
			/**
			* Preserve the established connectionMeta behavior: an explicitly
			* supplied descriptor resolves from the caller's explicit base.
			*/
			metaBaseUrl: resolveMetaBaseUrl(bases[0] ?? "./"),
			authToken: readStoredAuthToken(options.authToken ?? options.connectionMeta.authToken)
		};
		storeConnection(connection);
		return connection;
	}
	const existing = getDevframeConnection();
	if (existing) {
		const connection = withAuthToken(existing, readStoredAuthToken(options.authToken ?? existing.authToken ?? existing.connectionMeta.authToken));
		storeConnection(connection);
		return connection;
	}
	const errors = [];
	for (const base of bases) {
		const metaPath = withBase(DEVFRAME_CONNECTION_META_FILENAME, base);
		const metaUrl = resolveMetaBaseUrl(base);
		try {
			const response = await fetch(metaPath);
			if (!response.ok) throw new Error(`Failed to fetch connection meta from ${metaUrl}: ${response.status}`);
			const connectionMeta = await response.json();
			const loadedFrom = response.url || metaUrl;
			const connection = {
				connectionMeta,
				/**
				* A served `baseUrl` re-points relative resolution (RPC dump shards,
				* transport paths) at the meta that owns them: a static hub build's
				* per-frame meta directs each frame SPA at the hub's own dump.
				*/
				metaBaseUrl: connectionMeta.baseUrl ? new URL(connectionMeta.baseUrl, loadedFrom).href : loadedFrom,
				authToken: readStoredAuthToken(options.authToken ?? connectionMeta.authToken)
			};
			storeConnection(connection);
			return connection;
		} catch (error) {
			errors.push(error);
		}
	}
	throw new Error(`Failed to get connection meta from ${bases.join(", ")}`, { cause: errors });
}
/**
* The error rejected from `rpc.call(...)` (and carried on
* `rpc.connectionError`) when a call cannot be served because the connection is
* down, the client is unauthorized, or a call timed out. Its `kind` lets a UI
* tailor its message and recovery affordance without string-matching.
*/
var DevframeConnectionError = class extends Error {
	name = "DevframeConnectionError";
	kind;
	constructor(kind, message, options) {
		super(message, options);
		this.kind = kind;
	}
};
/**
* Whether a status means calls can be attempted. `connecting` counts because
* the transport queues outgoing calls until the socket opens; the terminal
* failure states short-circuit calls so a stuck socket never hangs the UI.
*/
function isCallableStatus(status) {
	return status === "connected" || status === "connecting";
}
//#endregion
//#region src/client/otp.ts
/**
* Read a one-time authentication code (OTP) from the current page URL's
* fragment, without side effects. Returns `undefined` when the parameter is
* absent.
*/
function readOtpFromUrl(param = DEVFRAME_OTP_URL_PARAM) {
	try {
		const hash = globalThis.location?.hash?.replace(/^#/, "") ?? "";
		return new URLSearchParams(hash).get(param) || void 0;
	} catch {
		return;
	}
}
function stripParamFromUrl(param) {
	try {
		const url = new URL(globalThis.location.href);
		const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));
		if (!fragment.has(param)) return;
		fragment.delete(param);
		url.hash = fragment.toString();
		globalThis.history?.replaceState(globalThis.history.state, "", url.href);
	} catch {}
}
/**
* Read the one-time code from the page URL fragment and remove it from the
* address bar (and the current history entry), so the single-use code isn't
* left in the URL, browser history, or a `Referer`. Returns the code, or
* `undefined` when absent.
*/
function consumeOtpFromUrl(param = DEVFRAME_OTP_URL_PARAM) {
	const code = readOtpFromUrl(param);
	if (code) stripParamFromUrl(param);
	return code;
}
/**
* Consume a one-time code from the page URL (see {@link consumeOtpFromUrl}) and
* exchange it for a token via the client. Resolves `true` when the client is
* authenticated (already trusted, or the exchange succeeded), and `false` when
* no code is present or the exchange failed.
*
* Higher-level integrations (e.g. Vite DevTools) that want to drive their own
* authentication UI can disable `connectDevframe`'s built-in handling with
* `otpParam: false` and call this (or {@link consumeOtpFromUrl}) themselves.
*/
async function authenticateWithUrlOtp(rpc, options = {}) {
	const code = consumeOtpFromUrl(options.param ?? "devframe_otp");
	if (!code) return false;
	if (rpc.isTrusted) return true;
	return rpc.requestTrustWithCode(code);
}
//#endregion
//#region src/client/rpc-services.ts
/** @internal */
function createDevframeServicesClient(rpc) {
	let current = {};
	const handles = /* @__PURE__ */ new WeakMap();
	let statePromise;
	const state = () => {
		statePromise ??= rpc.sharedState.get(DEVFRAME_SERVICES_STATE_KEY, { initialValue: {} }).then((shared) => {
			current = shared.value();
			shared.on("updated", (value) => {
				current = value;
			});
			return shared;
		});
		return statePromise;
	};
	state();
	return {
		state,
		has: (pkg) => pkg in current,
		keys: () => Object.keys(current),
		get: (pkg) => {
			const entry = current[pkg];
			if (!entry) return void 0;
			let handle = handles.get(entry);
			if (!handle) {
				handle = {
					...entry,
					rpc: rpc.scope(entry.scope).rpc
				};
				handles.set(entry, handle);
			}
			return handle;
		}
	};
}
//#endregion
//#region src/client/rpc-shared-state.ts
function createRpcSharedStateClientHost(rpc) {
	const sharedState = /* @__PURE__ */ new Map();
	const stateDisposers = /* @__PURE__ */ new Map();
	const initialValues = /* @__PURE__ */ new Map();
	const keyAddedListeners = /* @__PURE__ */ new Set();
	const isStaticBackend = rpc.connectionMeta.backend === "static";
	function mergeWithInitialValue(key, serverState) {
		const initial = initialValues.get(key);
		if (initial && typeof initial === "object" && !Array.isArray(initial) && typeof serverState === "object" && !Array.isArray(serverState)) return {
			...initial,
			...serverState
		};
		return serverState;
	}
	rpc.client.register({
		name: DEVFRAME_EVENTS.broadcast.clientStateUpdated,
		type: "event",
		handler: (key, fullState, syncId) => {
			const state = sharedState.get(key);
			if (!state || state.syncIds.has(syncId)) return;
			state.mutate(() => mergeWithInitialValue(key, fullState), syncId);
		}
	});
	rpc.client.register({
		name: DEVFRAME_EVENTS.broadcast.clientStatePatch,
		type: "event",
		handler: (key, patches, syncId) => {
			const state = sharedState.get(key);
			if (!state || state.syncIds.has(syncId)) return;
			state.patch(patches, syncId);
		}
	});
	function registerSharedState(key, state) {
		const offs = [];
		offs.push(state.on("updated", (fullState, patches, syncId) => {
			if (isStaticBackend) return;
			if (patches) rpc.callEvent("devframe:rpc:server-state:patch", key, patches, syncId);
			else rpc.callEvent("devframe:rpc:server-state:set", key, fullState, syncId);
		}));
		return () => {
			for (const off of offs) off();
		};
	}
	return {
		keys: () => Array.from(sharedState.keys()),
		onKeyAdded(fn) {
			keyAddedListeners.add(fn);
			return () => {
				keyAddedListeners.delete(fn);
			};
		},
		delete(key) {
			const dispose = stateDisposers.get(key);
			stateDisposers.delete(key);
			const existed = sharedState.delete(key);
			initialValues.delete(key);
			dispose?.();
			return existed;
		},
		get: async (key, options) => {
			if (options?.initialValue !== void 0) initialValues.set(key, options.initialValue);
			if (sharedState.has(key)) return sharedState.get(key);
			const state = createSharedState({
				initialValue: options?.initialValue,
				enablePatches: false
			});
			async function initSharedState() {
				if (!isStaticBackend) rpc.callEvent("devframe:rpc:server-state:subscribe", key);
				if (options?.initialValue !== void 0) {
					sharedState.set(key, state);
					for (const fn of keyAddedListeners) fn(key);
					rpc.call("devframe:rpc:server-state:get", key).then((serverState) => {
						if (serverState !== void 0) state.mutate(() => mergeWithInitialValue(key, serverState));
					}).catch((error) => {
						console.error("Error getting server state", error);
					});
					stateDisposers.set(key, registerSharedState(key, state));
					return state;
				} else {
					const serverValue = await rpc.call("devframe:rpc:server-state:get", key);
					state.mutate(() => mergeWithInitialValue(key, serverValue));
					sharedState.set(key, state);
					for (const fn of keyAddedListeners) fn(key);
					stateDisposers.set(key, registerSharedState(key, state));
					return state;
				}
			}
			return new Promise((resolve, reject) => {
				if (!rpc.isTrusted) {
					resolve(state);
					let initialized = false;
					rpc.events.on(DEVFRAME_EVENTS.client.isTrustedUpdated, (isTrusted) => {
						if (isTrusted && !initialized) {
							initialized = true;
							initSharedState();
						}
					});
				} else initSharedState().then(resolve, reject);
			});
		}
	};
}
//#endregion
//#region src/rpc/wire-codec.ts
const EMPTY_WIRE_DEFS = /* @__PURE__ */ new Map();
/**
* Build the per-connection wire codec every live transport (WS server, WS
* client, SSE server, SSE client) shares: per-method dispatch between strict
* JSON (methods declared `jsonSerializable: true`) and `s:`-prefixed
* structured-clone (everything else, including all error envelopes), with a
* request-id → method map so a response independently picks the same
* encoder as its request. One codec per connection; request-id spaces
* don't collide across connections.
*
* @internal
*/
function createRpcWireCodec(definitions = EMPTY_WIRE_DEFS) {
	const pendingRequestMethods = /* @__PURE__ */ new Map();
	return {
		serialize: (msg) => {
			let method;
			if (msg.t === "q") method = msg.m;
			else {
				method = pendingRequestMethods.get(msg.i);
				pendingRequestMethods.delete(msg.i);
			}
			if (!(msg.t === "s" && "e" in msg) && !!method && definitions.get(method)?.jsonSerializable === true) return strictJsonStringify(msg, method ?? "");
			return `s:${structuredCloneStringify(msg)}`;
		},
		deserialize: (raw) => {
			const msg = raw.startsWith("s:") ? structuredCloneParse(raw.slice(2)) : JSON.parse(raw);
			if (msg.t === "q" && msg.i && msg.m) pendingRequestMethods.set(msg.i, msg.m);
			return msg;
		}
	};
}
//#endregion
//#region src/rpc/transports/sse-client.ts
function NOOP$1() {}
/** Split the next complete SSE frame (up to a blank line) off the buffer. */
function takeFrame(buffer) {
	const boundary = buffer.search(/\n\n|\r\n\r\n/);
	if (boundary < 0) return void 0;
	return {
		frame: buffer.slice(0, boundary),
		rest: buffer.slice(boundary + (buffer[boundary] === "\r" ? 4 : 2))
	};
}
/** Parse one SSE frame's lines into its event name and data lines. */
function parseFrame(frame) {
	let event = "message";
	const data = [];
	for (const rawLine of frame.split(/\r?\n/)) {
		if (rawLine.startsWith(":")) continue;
		if (rawLine.startsWith("event:")) event = rawLine.slice(6).trimStart();
		else if (rawLine.startsWith("data:")) data.push(rawLine.slice(5).replace(/^ /, ""));
	}
	return {
		event,
		data
	};
}
/**
* Build a birpc `ChannelOptions` object backed by an SSE stream (server →
* client) and HTTP `POST` (client → server): the WebSocket-free counterpart
* to `createWsRpcChannel`, wire-compatible with `attachSseRpcTransport`.
*
* The stream is consumed via `fetch` streaming (not `EventSource`), so it
* works in browsers and server runtimes alike. The server's first frame
* (`event: session`) carries the session id; every `POST` echoes it in the
* `x-birpc-session` header. A response to a client-initiated request comes
* back in the `POST`'s own body and is re-injected into the channel; a
* dropped stream terminates the channel; there is no reconnect, matching
* the WS channel's closed-is-done semantics.
*/
function createSseRpcChannel(options) {
	const { onConnected = NOOP$1, onError = NOOP$1, onDisconnected = NOOP$1, definitions, fetch: fetchImpl = globalThis.fetch.bind(globalThis) } = options;
	let url = options.url;
	if (options.authToken) url = `${url}${url.includes("?") ? "&" : "?"}${DEVFRAME_AUTH_TOKEN_QUERY_PARAM}=${encodeURIComponent(options.authToken)}`;
	const codec = createRpcWireCodec(definitions);
	const abort = new AbortController();
	let closed = false;
	let onMessage;
	let activeReader;
	let resolveSession;
	let rejectSession;
	const sessionReady = new Promise((resolve, reject) => {
		resolveSession = resolve;
		rejectSession = reject;
	});
	sessionReady.catch(() => {});
	function fail(error) {
		if (closed) return;
		closed = true;
		rejectSession(error);
		onError(error);
		onDisconnected();
	}
	function end() {
		if (closed) return;
		closed = true;
		rejectSession(/* @__PURE__ */ new Error("Devframe SSE stream closed"));
		onDisconnected();
	}
	function dispatch(event, data) {
		if (event === "session") {
			resolveSession(data);
			onConnected();
			return;
		}
		onMessage?.(data);
	}
	/** Parse the SSE byte stream frame by frame and dispatch each event. */
	async function consume(stream) {
		const reader = stream.getReader();
		activeReader = reader;
		const decoder = new TextDecoder();
		let buffer = "";
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			for (;;) {
				const taken = takeFrame(buffer);
				if (!taken) break;
				buffer = taken.rest;
				const { event, data } = parseFrame(taken.frame);
				if (data.length > 0) dispatch(event, data.join("\n"));
			}
		}
		end();
	}
	(async () => {
		try {
			const response = await fetchImpl(url, {
				headers: { accept: "text/event-stream" },
				signal: abort.signal
			});
			if (!response.ok || !response.body) throw new Error(`Devframe SSE stream request failed: ${response.status}`);
			await consume(response.body);
		} catch (error) {
			if (abort.signal.aborted) {
				end();
				return;
			}
			fail(error instanceof Error ? error : new Error(String(error)));
		}
	})();
	return {
		close: () => {
			closed = true;
			abort.abort();
			activeReader?.cancel().catch(() => {});
		},
		on: (handler) => {
			onMessage = handler;
		},
		post: async (data) => {
			let sessionId;
			try {
				sessionId = await sessionReady;
			} catch {
				return;
			}
			if (closed) {
				onError(/* @__PURE__ */ new Error("Devframe SSE channel is closed; message dropped"));
				return;
			}
			try {
				const response = await fetchImpl(url, {
					method: "POST",
					headers: {
						"content-type": "text/plain; charset=utf-8",
						[DEVFRAME_SSE_SESSION_HEADER]: sessionId
					},
					body: data
				});
				if (response.status === 200) {
					const body = await response.text();
					if (body) onMessage?.(body);
					return;
				}
				if (!response.ok) throw new Error(`Devframe SSE POST failed: ${response.status}`);
			} catch (error) {
				onError(error instanceof Error ? error : new Error(String(error)));
			}
		},
		serialize: codec.serialize,
		deserialize: codec.deserialize
	};
}
//#endregion
//#region src/rpc/client.ts
function createRpcClient(functions, options) {
	const { channel, rpcOptions = {} } = options;
	return createBirpc(functions, {
		...channel,
		timeout: -1,
		...rpcOptions,
		proxify: false
	});
}
//#endregion
//#region src/client/rpc-live.ts
/**
* The transport-independent half of a live RPC client mode (connection
* status, pending-call guarding, and the trust handshake), shared by the
* WebSocket and SSE modes. Each transport supplies only its channel.
*/
function createLiveRpcClientMode(options) {
	const { transport, authToken, connectionMeta, events, clientRpc, rpcOptions = {}, callTimeout = 0 } = options;
	let isTrusted = false;
	let status = "connecting";
	let connectionError = null;
	const trustedPromise = Promise.withResolvers();
	function setStatus(next, error = null) {
		if (error) connectionError = error;
		else if (next === "connected") connectionError = null;
		if (next === status) return;
		const previous = status;
		status = next;
		events.emit(DEVFRAME_EVENTS.client.connectionStatus, next, previous);
	}
	const pending = /* @__PURE__ */ new Set();
	function rejectAllPending(error) {
		for (const entry of [...pending]) entry.reject(error);
	}
	function terminalError() {
		if (status === "disconnected" || status === "error") return new DevframeConnectionError("connection", "[devframe] Not connected to the devframe server", { cause: connectionError ?? void 0 });
		if (status === "unauthorized") return new DevframeConnectionError("auth", "[devframe] Not authorized by the devframe server", { cause: connectionError ?? void 0 });
		return null;
	}
	/**
	* Wrap an in-flight call promise so it settles on server response, on an
	* optional wall-clock timeout, or when the connection drops, so it never hangs.
	*/
	function guardCall(promise, method) {
		return new Promise((resolve, reject) => {
			let settled = false;
			let timer;
			const entry = { reject(error) {
				if (settled) return;
				finish();
				events.emit(DEVFRAME_EVENTS.client.error, error, method);
				reject(error);
			} };
			function finish() {
				settled = true;
				pending.delete(entry);
				if (timer) clearTimeout(timer);
			}
			pending.add(entry);
			if (callTimeout > 0) timer = setTimeout(() => {
				entry.reject(new DevframeConnectionError("timeout", `[devframe] RPC call "${method}" timed out after ${callTimeout}ms`));
			}, callTimeout);
			promise.then((value) => {
				if (settled) return;
				finish();
				resolve(value);
			}, (error) => {
				if (settled) return;
				finish();
				const err = error instanceof Error ? error : new Error(String(error));
				events.emit(DEVFRAME_EVENTS.client.error, err, method);
				reject(err);
			});
		});
	}
	const definitions = /* @__PURE__ */ new Map();
	for (const name of connectionMeta.jsonSerializableMethods ?? []) definitions.set(name, { jsonSerializable: true });
	const channel = options.createChannel({
		definitions,
		onError(error) {
			setStatus("error", error);
			events.emit(DEVFRAME_EVENTS.client.connectionError, error);
			rejectAllPending(new DevframeConnectionError("connection", "[devframe] Connection to the devframe server failed", { cause: error }));
		},
		onDisconnected() {
			if (status !== "error") setStatus("disconnected");
			rejectAllPending(new DevframeConnectionError("connection", "[devframe] Disconnected from the devframe server", { cause: connectionError ?? void 0 }));
		}
	});
	const serverRpc = createRpcClient(clientRpc.functions, {
		channel,
		rpcOptions
	});
	clientRpc.register({
		name: DEVFRAME_EVENTS.broadcast.authRevoked,
		type: "event",
		handler: () => {
			isTrusted = false;
			const authError = new DevframeConnectionError("auth", "[devframe] The devframe server revoked this client's trust");
			setStatus("unauthorized", authError);
			events.emit(DEVFRAME_EVENTS.client.connectionError, authError);
			rejectAllPending(authError);
			events.emit(DEVFRAME_EVENTS.client.isTrustedUpdated, false);
		}
	});
	let currentAuthToken = authToken;
	async function requestTrustWithToken(token) {
		currentAuthToken = token;
		const result = await serverRpc.$call("anonymous:devframe:auth", {
			authToken: token,
			/**
			* Sent raw; the server parses it into a display label (see
			* `describeUA` in `node/auth/state.ts`) so `ua-parser-modern` stays
			* out of the browser bundle.
			*/
			ua: navigator.userAgent,
			origin: location.origin
		});
		isTrusted = result.isTrusted;
		if (isTrusted) {
			trustedPromise.resolve(true);
			setStatus("connected");
		} else {
			const authError = new DevframeConnectionError("auth", "[devframe] The devframe server refused this client's credentials");
			setStatus("unauthorized", authError);
			events.emit(DEVFRAME_EVENTS.client.connectionError, authError);
		}
		events.emit(DEVFRAME_EVENTS.client.isTrustedUpdated, isTrusted);
		return result.isTrusted;
	}
	async function requestTrustWithCode(code) {
		const token = (await serverRpc.$call("anonymous:devframe:auth:exchange", {
			code,
			ua: navigator.userAgent,
			origin: location.origin
		}))?.authToken ?? null;
		if (token) {
			currentAuthToken = token;
			isTrusted = true;
			trustedPromise.resolve(true);
			setStatus("connected");
			events.emit(DEVFRAME_EVENTS.client.isTrustedUpdated, true);
		}
		return token;
	}
	async function requestAuthCode(options = {}) {
		await serverRpc.$call("anonymous:devframe:auth:request-code", {
			ua: navigator.userAgent,
			origin: location.origin,
			...options.reissue ? { reissue: true } : {}
		});
	}
	async function requestTrust() {
		if (isTrusted) return true;
		return requestTrustWithToken(currentAuthToken ?? "");
	}
	async function ensureTrusted(timeout = 6e4) {
		if (isTrusted) trustedPromise.resolve(true);
		if (timeout <= 0) return trustedPromise.promise;
		let timer;
		try {
			await Promise.race([trustedPromise.promise, new Promise((_, reject) => {
				timer = setTimeout(() => {
					reject(/* @__PURE__ */ new Error("[devframe] Timeout waiting for rpc to be trusted"));
				}, timeout);
			})]);
			return isTrusted;
		} finally {
			clearTimeout(timer);
		}
	}
	return {
		transport,
		get isTrusted() {
			return isTrusted;
		},
		get status() {
			return status;
		},
		get connectionError() {
			return connectionError;
		},
		requestTrust,
		requestTrustWithToken,
		requestTrustWithCode,
		requestAuthCode,
		ensureTrusted,
		call: (...args) => {
			const method = String(args[0]);
			const failFast = terminalError();
			if (failFast) {
				events.emit(DEVFRAME_EVENTS.client.error, failFast, method);
				return Promise.reject(failFast);
			}
			return guardCall(serverRpc.$call(...args), method);
		},
		callEvent: (...args) => {
			const failFast = terminalError();
			if (failFast) {
				events.emit(DEVFRAME_EVENTS.client.error, failFast, String(args[0]));
				return;
			}
			return serverRpc.$callEvent(...args);
		},
		callOptional: (...args) => {
			const method = String(args[0]);
			const failFast = terminalError();
			if (failFast) {
				events.emit(DEVFRAME_EVENTS.client.error, failFast, method);
				return Promise.reject(failFast);
			}
			return guardCall(serverRpc.$callOptional(...args), method);
		},
		close: () => {
			channel.close();
		}
	};
}
//#endregion
//#region src/client/rpc-sse.ts
/**
* Resolve a {@link ConnectionMeta.sse} descriptor into a concrete
* `http(s)://` URL, with the same proxy-safe rules as `resolveWsUrl`: the
* object / relative-path forms resolve against where `__connection.json`
* was loaded (the client trusts its own location, never a server-baked
* hostname), while an explicit `port`/`host` (or a full `http(s)://` URL
* string) opts into a cross-origin endpoint.
*/
function resolveSseUrl(sse, metaBaseUrl, loc) {
	const base = (() => {
		try {
			return new URL(metaBaseUrl, loc.href);
		} catch {
			return new URL(loc.href);
		}
	})();
	if (sse && typeof sse === "object") {
		if (sse.host != null || sse.port != null) {
			const host = sse.host ?? `${base.hostname}:${sse.port}`;
			return new URL(sse.path ?? "/", `${base.protocol}//${host}`).href;
		}
		return new URL(sse.path ?? "", base).href;
	}
	const str = sse ?? "";
	if (/^https?:\/\//i.test(str)) return str;
	return new URL(str, base).href;
}
/**
* The SSE-backed live client mode, picked by `connectDevframe` when the
* server advertises SSE as its primary transport (`backend: 'sse'`) or when
* the caller pins `transport: 'sse'`. Same status machine, call guarding,
* and trust handshake as the WebSocket mode, over `createSseRpcChannel`.
*/
function createSseRpcClientMode(options) {
	const { authToken, connectionMeta, metaBaseUrl, events, clientRpc, rpcOptions = {}, sseOptions = {}, callTimeout = 0 } = options;
	const url = resolveSseUrl(connectionMeta.sse, metaBaseUrl ?? "./", location);
	return createLiveRpcClientMode({
		transport: "sse",
		authToken,
		connectionMeta,
		events,
		clientRpc,
		rpcOptions,
		callTimeout,
		createChannel: (handlers) => createSseRpcChannel({
			url,
			authToken,
			definitions: handlers.definitions,
			...sseOptions,
			onConnected() {
				sseOptions.onConnected?.();
			},
			onError(error) {
				handlers.onError(error);
				sseOptions.onError?.(error);
			},
			onDisconnected() {
				handlers.onDisconnected();
				sseOptions.onDisconnected?.();
			}
		})
	});
}
//#endregion
//#region src/rpc/dump/error.ts
/**
* Inverse of {@link serializeDumpError}: rebuild a thrown `Error` from
* the plain object stored in a dump record. Preserves `cause`, restores
* the original `name`, and re-attaches any custom own properties.
*/
function reviveDumpError(stored) {
	const { name, message, cause: rawCause, ...extras } = stored;
	const cause = rawCause instanceof Error ? rawCause : isPlainErrorShape(rawCause) ? reviveDumpError(rawCause) : rawCause;
	const error = cause !== void 0 ? new Error(message, { cause }) : new Error(message);
	error.name = name;
	Object.assign(error, extras);
	return error;
}
function isPlainErrorShape(value) {
	return typeof value === "object" && value !== null && typeof value.message === "string" && typeof value.name === "string";
}
//#endregion
//#region src/client/static-rpc.ts
function isStaticEntry(value) {
	return typeof value === "object" && value !== null && value.type === "static" && typeof value.path === "string";
}
function isQueryEntry(value) {
	return typeof value === "object" && value !== null && value.type === "query" && typeof value.records === "object" && value.records !== null;
}
function isRecord(value) {
	return typeof value === "object" && value !== null && ("output" in value || "error" in value);
}
function resolveRecordOutput(record) {
	if (record.error) throw reviveDumpError(record.error);
	return record.output;
}
function hasMeaningfulArgs(args) {
	return args.some((arg) => arg !== null && arg !== void 0);
}
function unwrapEnvelope(raw) {
	if (raw !== null && typeof raw === "object" && "serialization" in raw && "data" in raw) return raw.data;
	return raw;
}
function createStaticRpcCaller(manifest, fetchJson) {
	const staticCache = /* @__PURE__ */ new Map();
	const queryRecordCache = /* @__PURE__ */ new Map();
	function reviveIfStructuredClone(value, serialization) {
		if (serialization === "structured-clone" && Array.isArray(value)) return structuredCloneDeserialize(value);
		return value;
	}
	function decode(raw, serialization) {
		return reviveIfStructuredClone(unwrapEnvelope(raw), serialization);
	}
	async function loadStatic(entry) {
		if (!staticCache.has(entry.path)) staticCache.set(entry.path, fetchJson(entry.path).then((raw) => decode(raw, entry.serialization)));
		const data = await staticCache.get(entry.path);
		if (isRecord(data)) return resolveRecordOutput(data);
		return data;
	}
	async function loadQueryRecord(path, serialization) {
		if (!queryRecordCache.has(path)) queryRecordCache.set(path, fetchJson(path).then((raw) => decode(raw, serialization)));
		return await queryRecordCache.get(path);
	}
	async function call(functionName, args) {
		if (!(functionName in manifest)) throw new Error(`[devframe-rpc] Function "${functionName}" not found in dump store`);
		const entry = manifest[functionName];
		if (isStaticEntry(entry)) {
			if (hasMeaningfulArgs(args)) throw new Error(`[devframe-rpc] No dump match for "${functionName}" with args: ${JSON.stringify(args)}`);
			return await loadStatic(entry);
		}
		if (isQueryEntry(entry)) {
			const argsHash = hash(args);
			const recordPath = entry.records[argsHash];
			if (recordPath) return resolveRecordOutput(await loadQueryRecord(recordPath, entry.serialization));
			if (entry.fallback) return resolveRecordOutput(await loadQueryRecord(entry.fallback, entry.serialization));
			throw new Error(`[devframe-rpc] No dump match for "${functionName}" with args: ${JSON.stringify(args)}`);
		}
		if (!hasMeaningfulArgs(args)) return entry;
		throw new Error(`[devframe-rpc] No dump match for "${functionName}" with args: ${JSON.stringify(args)}`);
	}
	return {
		call: async (functionName, args) => await call(functionName, args),
		callOptional: async (functionName, args) => {
			if (!(functionName in manifest)) return void 0;
			return await call(functionName, args);
		},
		callEvent: async (_functionName, _args) => {}
	};
}
//#endregion
//#region src/client/rpc-static.ts
async function createStaticRpcClientMode(options) {
	const staticCaller = createStaticRpcCaller(await options.fetchJsonFromBases(DEVFRAME_RPC_DUMP_MANIFEST_FILENAME), options.fetchJsonFromBases);
	return {
		transport: "static",
		isTrusted: true,
		/**
		* A static backend has no live socket; every call is a local fetch, so it
		* is "connected" for its whole life.
		*/
		status: "connected",
		connectionError: null,
		requestTrust: async () => true,
		requestTrustWithToken: async () => true,
		/** Static backends are always trusted, so there's nothing to exchange. */
		requestTrustWithCode: async () => null,
		/** No server terminal to print a code in. */
		requestAuthCode: async () => {},
		ensureTrusted: async () => true,
		call: (...args) => staticCaller.call(args[0], args.slice(1)),
		callEvent: (...args) => staticCaller.callEvent(args[0], args.slice(1)),
		callOptional: (...args) => staticCaller.callOptional(args[0], args.slice(1)),
		/** No live socket to close; every call is a local fetch. */
		close: () => {}
	};
}
//#endregion
//#region src/client/rpc-streaming.ts
const STREAM_KEY_SEPARATOR = "";
function streamKey(channel, id) {
	return `${channel}${STREAM_KEY_SEPARATOR}${id}`;
}
/**
* Client-side streaming host. Mirrors `createRpcSharedStateClientHost`:
* registers the two `:chunk` / `:end` event handlers once, then per-stream
* state lives in a `Map<streamKey, StreamReader>`.
*/
function createRpcStreamingClientHost(rpc) {
	const readers = /* @__PURE__ */ new Map();
	const uploads = /* @__PURE__ */ new Map();
	rpc.client.register({
		name: DEVFRAME_EVENTS.broadcast.streamingChunk,
		type: "event",
		handler(channel, id, seq, chunk) {
			readers.get(streamKey(channel, id))?._push(seq, chunk);
		}
	});
	rpc.client.register({
		name: DEVFRAME_EVENTS.broadcast.streamingEnd,
		type: "event",
		handler(channel, id, error) {
			const key = streamKey(channel, id);
			const reader = readers.get(key);
			if (!reader) return;
			reader._end(error);
			readers.delete(key);
		}
	});
	rpc.client.register({
		name: DEVFRAME_EVENTS.broadcast.streamingUploadCancel,
		type: "event",
		handler(channel, id) {
			const key = streamKey(channel, id);
			const sink = uploads.get(key);
			if (!sink) return;
			sink.abort("server cancelled upload");
			uploads.delete(key);
		}
	});
	rpc.events.on(DEVFRAME_EVENTS.client.isTrustedUpdated, (isTrusted) => {
		if (!isTrusted) return;
		for (const [key, reader] of readers) {
			if (reader.cancelled || reader.done) continue;
			const sepIdx = key.indexOf(STREAM_KEY_SEPARATOR);
			if (sepIdx < 0) continue;
			const channel = key.slice(0, sepIdx);
			const id = key.slice(sepIdx + 1);
			rpc.callEvent("devframe:streaming:subscribe", channel, id, { afterSeq: reader.lastSeenSeq });
		}
	});
	function subscribe(channel, id, options = {}) {
		const key = streamKey(channel, id);
		const existing = readers.get(key);
		if (existing) return existing;
		const reader = createStreamReader({
			id,
			highWaterMark: options.highWaterMark,
			onOverflow(dropped) {
				console.warn(`[devframe] DF0029: Stream "${channel}#${id}" dropped ${dropped} chunk(s) after exceeding the client high-water mark.`);
			},
			onCancel() {
				rpc.callEvent("devframe:streaming:cancel", channel, id);
				readers.delete(key);
			}
		});
		readers.set(key, reader);
		if (rpc.isTrusted) rpc.callEvent("devframe:streaming:subscribe", channel, id, { afterSeq: 0 });
		else {
			const off = rpc.events.on(DEVFRAME_EVENTS.client.isTrustedUpdated, (trusted) => {
				if (trusted) {
					off();
					if (readers.has(key) && !reader.cancelled && !reader.done) rpc.callEvent("devframe:streaming:subscribe", channel, id, { afterSeq: reader.lastSeenSeq });
				}
			});
		}
		return reader;
	}
	function upload(channel, id) {
		const key = streamKey(channel, id);
		const existing = uploads.get(key);
		if (existing) return existing;
		const sink = createStreamSink({ id });
		sink.events.on("chunk", (seq, chunk) => {
			rpc.callEvent("devframe:streaming:upload-chunk", channel, id, seq, chunk);
		});
		sink.events.on("end", (error) => {
			rpc.callEvent("devframe:streaming:upload-end", channel, id, error);
			uploads.delete(key);
		});
		uploads.set(key, sink);
		return sink;
	}
	return {
		subscribe,
		upload
	};
}
//#endregion
//#region src/rpc/transports/ws-client.ts
function NOOP() {}
const EMPTY_DEFS = /* @__PURE__ */ new Map();
/**
* Build a birpc `ChannelOptions` object backed by a browser `WebSocket`.
* Pass the result straight to `createRpcClient`'s `channel` option.
*
* Also returns `close()`, closing the underlying socket, mirroring the server transport's
* existing `WsRpcTransport.close()`. `birpc`'s own `ChannelOptions` has no teardown of its own.
*/
function createWsRpcChannel(options) {
	let url = options.url;
	if (options.authToken) url = `${url}?${DEVFRAME_AUTH_TOKEN_QUERY_PARAM}=${encodeURIComponent(options.authToken)}`;
	const ws = new WebSocket(url);
	const { onConnected = NOOP, onError = NOOP, onDisconnected = NOOP, definitions = EMPTY_DEFS } = options;
	ws.addEventListener("open", (e) => {
		onConnected(e);
	});
	ws.addEventListener("error", (e) => {
		const _e = e instanceof Error ? e : new Error(e.type);
		onError(_e);
	});
	ws.addEventListener("close", (e) => {
		onDisconnected(e);
	});
	const codec = createRpcWireCodec(definitions);
	return {
		close: () => {
			ws.close();
		},
		on: (handler) => {
			ws.addEventListener("message", (e) => {
				handler(e.data);
			});
		},
		post: (data) => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(data);
				return;
			}
			if (ws.readyState === WebSocket.CONNECTING) {
				const onOpen = () => {
					cleanup();
					if (ws.readyState === WebSocket.OPEN) ws.send(data);
				};
				const onClose = () => cleanup();
				function cleanup() {
					ws.removeEventListener("open", onOpen);
					ws.removeEventListener("close", onClose);
				}
				ws.addEventListener("open", onOpen);
				ws.addEventListener("close", onClose);
				return;
			}
			onError(/* @__PURE__ */ new Error("Devframe WebSocket is not open; message dropped"));
		},
		serialize: codec.serialize,
		deserialize: codec.deserialize
	};
}
//#endregion
//#region src/client/rpc-ws.ts
/**
* Resolve a {@link ConnectionMeta.websocket} descriptor into a concrete
* `ws(s)://` URL.
*
* The object / relative-path forms connect to the page's own origin (only the
* `http`→`ws` protocol swap is applied), resolving the path against where
* `__connection.json` was loaded. This is deliberately host-agnostic so the
* connection survives a reverse proxy that changes the domain or port, since the
* client trusts its own location, never a server-baked hostname. An explicit
* `port`/`host` (or a full `ws(s)://` URL string) opts into a cross-origin
* endpoint, e.g. a side-car server on its own port.
*/
function resolveWsUrl(websocket, metaBaseUrl, loc) {
	const base = (() => {
		try {
			return new URL(metaBaseUrl, loc.href);
		} catch {
			return new URL(loc.href);
		}
	})();
	const wsProtocol = base.protocol === "https:" ? "wss:" : "ws:";
	if (websocket && typeof websocket === "object") {
		if (websocket.host != null || websocket.port != null) {
			const host = websocket.host ?? `${base.hostname}:${websocket.port}`;
			const target = new URL(websocket.path ?? "/", `${wsProtocol}//${host}`);
			target.protocol = wsProtocol;
			return target.href;
		}
		const target = new URL(websocket.path ?? "", base);
		target.protocol = wsProtocol;
		return target.href;
	}
	if (typeof websocket === "number") return `${wsProtocol}//${base.hostname}:${websocket}`;
	const str = websocket ?? "";
	if (/^wss?:\/\//i.test(str)) return str;
	if (/^https?:\/\//i.test(str)) return withProtocol(str, /^https/i.test(str) ? "wss://" : "ws://");
	const target = new URL(str, base);
	target.protocol = wsProtocol;
	return target.href;
}
function createWsRpcClientMode(options) {
	const { authToken, connectionMeta, metaBaseUrl, events, clientRpc, rpcOptions = {}, wsOptions = {}, callTimeout = 0 } = options;
	const url = resolveWsUrl(connectionMeta.websocket, metaBaseUrl ?? "./", location);
	return createLiveRpcClientMode({
		transport: "websocket",
		authToken,
		connectionMeta,
		events,
		clientRpc,
		rpcOptions,
		callTimeout,
		createChannel: (handlers) => createWsRpcChannel({
			url,
			authToken,
			definitions: handlers.definitions,
			...wsOptions,
			onConnected(event) {
				wsOptions.onConnected?.(event);
			},
			onError(error) {
				handlers.onError(error);
				wsOptions.onError?.(error);
			},
			onDisconnected(event) {
				handlers.onDisconnected();
				wsOptions.onDisconnected?.(event);
			}
		})
	});
}
//#endregion
//#region src/utils/scope.ts
/** Whether a name is already namespaced (contains a `:` separator). */
function isQualifiedName(name) {
	return name.includes(":");
}
/**
* Prefix a bare name with `<namespace>:`. Names that already contain a
* `:` are returned unchanged, so callers can reference another scope's
* ids explicitly (e.g. `ctx.rpc.call('other-plugin:fn')`).
*/
function qualifyName(namespace, name) {
	return isQualifiedName(name) ? name : `${namespace}:${name}`;
}
//#endregion
//#region src/settings-store.ts
/**
* The key-value store surface over a lazily-resolved shared state, shared by
* the node-side (file-backed) and client-side (RPC-mirrored) settings stores.
* Each side supplies its own `store()` resolver; the read/write/subscribe
* behavior on top of it is identical.
*/
function createSettingsStore(store) {
	return {
		async get(key) {
			return (await store()).value()?.[key];
		},
		async set(key, value) {
			(await store()).mutate((draft) => {
				if (draft === void 0) return { [key]: value };
				draft[key] = value;
			});
		},
		async delete(key) {
			(await store()).mutate((draft) => {
				if (draft !== void 0) delete draft[key];
			});
		},
		async all() {
			return (await store()).value() ?? {};
		},
		async onChange(fn) {
			return (await store()).on("updated", (full) => fn(full ?? {}));
		}
	};
}
//#endregion
//#region src/client/settings.ts
function createClientSettingsStore(rpc, namespace, scope) {
	const stateKey = `devframe:settings:${scope}:${namespace}`;
	let statePromise;
	function store() {
		if (!statePromise) statePromise = (async () => {
			await rpc.ensureTrusted();
			return rpc.sharedState.get(stateKey);
		})().catch((error) => {
			statePromise = void 0;
			throw error;
		});
		return statePromise;
	}
	return createSettingsStore(store);
}
/**
* Build the client-side `settings` surface for a scope namespace. Mirrors
* the node-side stores over the shared-state sync protocol.
*/
function createClientSettings(rpc, namespace) {
	return {
		global: createClientSettingsStore(rpc, namespace, "global"),
		project: createClientSettingsStore(rpc, namespace, "project")
	};
}
//#endregion
//#region src/client/scope.ts
/**
* Build a namespace-scoped view of a {@link DevframeRpcClient}. Every RPC
* id, shared-state key, and streaming channel passed through the returned
* `rpc` surface is auto-namespaced with `<namespace>:`.
*/
function createScopedClientContext(rpc, namespace) {
	return {
		namespace,
		base: rpc,
		rpc: {
			namespace,
			register(fn) {
				if (isQualifiedName(fn.name)) throw new Error(`[devframe] Scoped client RPC registration for namespace "${namespace}" received an already-namespaced function name "${fn.name}". Pass a bare name without a ":" separator.`);
				rpc.client.register({
					...fn,
					name: `${namespace}:${fn.name}`
				});
			},
			call: ((method, ...args) => rpc.call(qualifyName(namespace, method), ...args)),
			callEvent: ((method, ...args) => rpc.callEvent(qualifyName(namespace, method), ...args)),
			callOptional: ((method, ...args) => rpc.callOptional(qualifyName(namespace, method), ...args)),
			sharedState: ((key, options) => rpc.sharedState.get(qualifyName(namespace, key), options)),
			streaming: {
				subscribe: (channel, id, options) => rpc.streaming.subscribe(qualifyName(namespace, channel), id, options),
				upload: (channel, id) => rpc.streaming.upload(qualifyName(namespace, channel), id)
			}
		},
		settings: createClientSettings(rpc, namespace),
		scope: rpc.scope
	};
}
//#endregion
//#region src/client/webmcp.ts
/**
* The page's WebMCP model context, when the browser (or a polyfill)
* provides one. Checks `document.modelContext` (current draft) first,
* then `navigator.modelContext` (earlier drafts and polyfills).
*/
function resolveWebMcpModelContext() {
	if (typeof document !== "undefined") {
		const context = document.modelContext;
		if (context) return context;
	}
	if (typeof navigator !== "undefined") {
		const context = navigator.modelContext;
		if (context) return context;
	}
}
/**
* Mirror the `agent`-flagged RPC functions of a browser-side collector
* (`rpc.client`) onto the page's WebMCP model context as callable tools,
* using the same `agent` signature, wire names, and `arg0`/`arg1`/… input
* schema as the node-side MCP adapter. Functions without an `agent` field
* stay unexposed (default-deny), and the tool set follows later
* `register`/`update` calls. Returns a dispose that unregisters every tool.
*/
function registerWebMcpTools(clientRpc, options = {}) {
	const resolved = options.modelContext ?? resolveWebMcpModelContext();
	if (!resolved) return () => {};
	const modelContext = resolved;
	/** Unregister callbacks keyed by definition name. */
	const registered = /* @__PURE__ */ new Map();
	/** Wire name → definition name, to detect sanitization collisions. */
	const wireNames = /* @__PURE__ */ new Map();
	function register(def, agent) {
		const name = toAgentToolName(def.name);
		const owner = wireNames.get(name);
		if (owner && owner !== def.name) {
			console.warn(`[devframe] WebMCP tool name "${name}" (from "${def.name}") collides with "${owner}"; keeping the first registration.`);
			return;
		}
		const controller = new AbortController();
		const safety = resolveAgentSafety(def.type, agent);
		const result = modelContext.registerTool({
			name,
			description: agent.description,
			inputSchema: argsToJsonSchema(def.args),
			annotations: {
				title: agent.title ?? def.name,
				readOnlyHint: safety === "read",
				destructiveHint: safety === "destructive"
			},
			execute: (args) => executeRpcTool(def, clientRpc.context, args)
		}, { signal: controller.signal });
		if (result && "then" in result) result.then(() => {}, () => {});
		wireNames.set(name, def.name);
		registered.set(def.name, () => {
			controller.abort();
			if (result && "unregister" in result && typeof result.unregister === "function") result.unregister();
			wireNames.delete(name);
		});
	}
	function sync(id) {
		const names = id ? [id] : [...clientRpc.definitions.keys()];
		for (const name of names) {
			registered.get(name)?.();
			registered.delete(name);
			const def = clientRpc.definitions.get(name);
			const agent = def?.agent;
			if (def && agent) register(def, agent);
		}
	}
	sync();
	const unsubscribe = clientRpc.onChanged((id) => sync(id));
	return () => {
		unsubscribe();
		for (const unregister of registered.values()) unregister();
		registered.clear();
	};
}
async function executeRpcTool(def, context, args) {
	try {
		const positional = toolInputToRpcArgs(args, def.args?.length);
		return { content: [{
			type: "text",
			text: stringifyResult(await (await getRpcHandler(def, context))(...positional))
		}] };
	} catch (error) {
		return {
			isError: true,
			content: [{
				type: "text",
				text: formatError(error)
			}]
		};
	}
}
/**
* Agent-exposed functions are strict-JSON by contract (`jsonSerializable:
* true` is enforced at registration), so plain `JSON.stringify` suffices.
*/
function stringifyResult(value) {
	if (value === void 0) return "undefined";
	if (typeof value === "string") return value;
	return JSON.stringify(value, null, 2);
}
function formatError(error) {
	if (!(error instanceof Error)) return String(error);
	const cause = error.cause instanceof Error ? ` (cause: ${error.cause.message})` : "";
	return `${error.name}: ${error.message}${cause}`;
}
//#endregion
//#region src/client/rpc.ts
/**
* Resolve the requested `transport` option against what the server
* advertises. `'auto'` trusts the advertisement: the server's declared
* primary (`backend`), preferring the WebSocket when both endpoints are
* present; an explicit `'websocket'` / `'sse'` pins that transport and
* throws when the server doesn't advertise it.
*/
function resolveClientTransport(requested, meta) {
	if (meta.backend === "static") return "static";
	const hasWebsocket = meta.websocket !== void 0;
	const hasSse = meta.sse !== void 0;
	if (requested === "websocket") {
		if (!hasWebsocket) throw new Error("[devframe] transport: 'websocket' was requested, but this server does not advertise a WebSocket endpoint");
		return "websocket";
	}
	if (requested === "sse") {
		if (!hasSse) throw new Error("[devframe] transport: 'sse' was requested, but this server does not advertise an SSE endpoint");
		return "sse";
	}
	if (meta.backend === "sse" && hasSse) return "sse";
	if (hasWebsocket) return "websocket";
	if (hasSse) return "sse";
	throw new Error("[devframe] This server advertises no RPC transport (backend \"none\"), so there is nothing to connect to. Enable the WebSocket or SSE endpoint on the server, or use its static/MCP surfaces instead.");
}
async function getDevframeRpcClient(options = {}) {
	const { baseURL = "./", rpcOptions = {}, cacheOptions = false } = options;
	const events = createEventEmitter();
	const bases = Array.isArray(baseURL) ? baseURL : [baseURL];
	let connection = await setupDevframeConnection(options);
	const { connectionMeta, metaBaseUrl, authToken } = connection;
	let resolvedBaseURL = bases[0] ?? "./";
	try {
		resolvedBaseURL = new URL(".", metaBaseUrl).href;
	} catch {}
	const cacheManager = new RpcCacheManager({
		functions: [],
		...typeof options.cacheOptions === "object" ? options.cacheOptions : {}
	});
	const context = { rpc: void 0 };
	const clientRpc = new RpcFunctionsCollectorBase(context);
	const disposeWebMcp = options.webmcp === false ? void 0 : registerWebMcpTools(clientRpc);
	let disposeBrowserAgentBridge;
	let closed = false;
	let cacheGeneration = 0;
	let cacheFunctions;
	function invalidateCache() {
		cacheGeneration++;
		cacheFunctions = void 0;
		cacheManager.clear();
		if (cacheOptions === true) cacheManager.updateOptions({ functions: [] });
	}
	if (cacheOptions) {
		clientRpc.register({
			name: DEVFRAME_EVENTS.broadcast.cacheInvalidate,
			type: "event",
			handler: invalidateCache
		});
		events.on(DEVFRAME_EVENTS.client.connectionStatus, invalidateCache);
		events.on(DEVFRAME_EVENTS.client.isTrustedUpdated, invalidateCache);
	}
	async function fetchJsonFromBases(path) {
		const candidates = [resolvedBaseURL, ...bases.filter((base) => base !== resolvedBaseURL)].filter((x) => x != null);
		const errors = [];
		for (const base of candidates) try {
			return await fetch(withBase(path, base)).then((r) => {
				if (!r.ok) throw new Error(`Failed to fetch ${path} from ${base}: ${r.status}`);
				return r.json();
			});
		} catch (error) {
			errors.push(error);
		}
		throw new Error(`Failed to load ${path} from ${candidates.join(", ")}`, { cause: errors });
	}
	const timeout = options.callTimeout ?? 0;
	const requestBudget = timeout > 0 ? timeout : Infinity;
	let mode;
	const liveModeOptions = {
		authToken,
		connectionMeta,
		metaBaseUrl,
		events,
		clientRpc,
		callTimeout: options.callTimeout,
		rpcOptions: {
			...rpcOptions,
			async onRequest(req, next, resolve) {
				const deadline = performance.now() + requestBudget;
				await rpcOptions.onRequest?.call(this, req, next, resolve);
				if (cacheOptions === true && req.i && mode.isTrusted && !req.m.startsWith("anonymous:") && req.m !== "devframe:rpc:cacheable-functions") {
					function checkDeadline() {
						if (performance.now() >= deadline) throw new DevframeConnectionError("timeout", `[devframe] RPC call "${req.m}" timed out after ${timeout}ms`);
					}
					while (!cacheFunctions) {
						checkDeadline();
						if (closed || mode.status !== "connected") break;
						const generation = cacheGeneration;
						cacheFunctions = mode.callOptional("devframe:rpc:cacheable-functions").then((functions) => {
							if (generation === cacheGeneration) cacheManager.updateOptions({ functions: functions ?? [] });
						}).catch((error) => {
							if (generation === cacheGeneration) cacheFunctions = void 0;
							throw error;
						});
						await cacheFunctions;
					}
					await cacheFunctions;
					checkDeadline();
				}
				const generation = cacheGeneration;
				if (cacheOptions && req.i && !closed && mode.isTrusted && cacheManager.validate(req.m)) {
					if (cacheManager.has(req.m, req.a)) return resolve(cacheManager.cached(req.m, req.a));
					const res = await next(req);
					if (generation === cacheGeneration && !closed) cacheManager.apply(req, res);
				} else await next(req);
			}
		}
	};
	const transport = resolveClientTransport(options.transport ?? "auto", connectionMeta);
	mode = transport === "static" ? await createStaticRpcClientMode({ fetchJsonFromBases }) : transport === "sse" ? createSseRpcClientMode({
		...liveModeOptions,
		sseOptions: options.sseOptions
	}) : createWsRpcClientMode({
		...liveModeOptions,
		wsOptions: options.wsOptions
	});
	let authChannel;
	try {
		authChannel = new BroadcastChannel("devframe-auth");
	} catch {}
	let bootstrapAuthPromise;
	let bootstrapAuthSettled = false;
	function gateOnBootstrapAuth(fn) {
		return ((...args) => {
			if (bootstrapAuthSettled || !bootstrapAuthPromise) return fn(...args);
			return bootstrapAuthPromise.then(() => fn(...args));
		});
	}
	/** Release authentication and transport resources even if another disposer fails. */
	function closeRpcClient() {
		closed = true;
		invalidateCache();
		try {
			disposeBrowserAgentBridge?.();
			disposeWebMcp?.();
		} finally {
			try {
				authChannel?.close();
			} finally {
				mode.close?.();
			}
		}
	}
	const rpc = {
		events,
		get isTrusted() {
			return mode.isTrusted;
		},
		get status() {
			return mode.status;
		},
		get connectionError() {
			return mode.connectionError;
		},
		get transport() {
			return mode.transport ?? transport;
		},
		get connection() {
			return connection;
		},
		connectionMeta,
		ensureTrusted: mode.ensureTrusted,
		requestTrust: mode.requestTrust,
		requestTrustWithToken: async (token) => {
			storeAuthToken(token);
			connection = {
				...connection,
				authToken: token
			};
			return mode.requestTrustWithToken(token);
		},
		requestTrustWithCode: async (code) => {
			const token = await mode.requestTrustWithCode(code);
			if (!token) return false;
			storeAuthToken(token);
			connection = {
				...connection,
				authToken: token
			};
			try {
				authChannel?.postMessage({
					type: "auth-update",
					authToken: token
				});
			} catch {}
			return true;
		},
		requestAuthCode: (options) => mode.requestAuthCode(options),
		call: gateOnBootstrapAuth(mode.call),
		callEvent: gateOnBootstrapAuth(mode.callEvent),
		callOptional: gateOnBootstrapAuth(mode.callOptional),
		client: clientRpc,
		sharedState: void 0,
		services: void 0,
		streaming: void 0,
		cacheManager,
		scope: void 0,
		close: closeRpcClient
	};
	rpc.sharedState = createRpcSharedStateClientHost(rpc);
	rpc.streaming = createRpcStreamingClientHost(rpc);
	rpc.services = createDevframeServicesClient(rpc);
	const scopedCache = /* @__PURE__ */ new Map();
	rpc.scope = ((namespace) => {
		if (!namespace) return rpc;
		let scoped = scopedCache.get(namespace);
		if (!scoped) {
			scoped = createScopedClientContext(rpc, namespace);
			scopedCache.set(namespace, scoped);
		}
		return scoped;
	});
	context.rpc = rpc;
	function isTopLevelUnframed() {
		try {
			return typeof window !== "undefined" && window.self === window.top;
		} catch {
			return false;
		}
	}
	async function runSimpleAuthPrompt() {
		if (options.simpleAuth === false || !isTopLevelUnframed()) return;
		if (typeof globalThis.prompt !== "function") return;
		await rpc.requestAuthCode().catch(() => {});
		while (!rpc.isTrusted) {
			const code = globalThis.prompt("devframe: enter the authentication code shown in your terminal");
			if (code == null) return;
			const trimmed = code.trim();
			if (!trimmed) continue;
			if (await rpc.requestTrustWithCode(trimmed)) return;
		}
	}
	async function bootstrapAuth() {
		const trusted = await mode.requestTrust();
		const otpParam = options.otpParam ?? "devframe_otp";
		const viaOtp = otpParam ? await authenticateWithUrlOtp(rpc, { param: otpParam }) : false;
		if (trusted || viaOtp || rpc.isTrusted) return;
		await runSimpleAuthPrompt();
	}
	bootstrapAuthPromise = bootstrapAuth().then(() => {
		bootstrapAuthSettled = true;
	}, () => {
		bootstrapAuthSettled = true;
	});
	if (connectionMeta.mcp) import("../browser-agent-rpc-BXhoSh1z.mjs").then(({ setupBrowserAgentRpcBridge }) => {
		if (!closed) disposeBrowserAgentBridge = setupBrowserAgentRpcBridge(rpc);
	}).catch(() => {});
	if (authChannel) authChannel.onmessage = (event) => {
		if (event.data?.type === "auth-update" && event.data.authToken) rpc.requestTrustWithToken(event.data.authToken);
	};
	return rpc;
}
//#endregion
//#region src/client/index.ts
const connectDevframe = getDevframeRpcClient;
//#endregion
export { DevframeConnectionError, authenticateWithUrlOtp, connectDevframe, consumeOtpFromUrl, createClientSettings, createRpcStreamingClientHost, createScopedClientContext, getDevframeConnection, getDevframeRpcClient, isCallableStatus, readOtpFromUrl, registerDevframeViewerOrigin, registerWebMcpTools, resolveClientTransport, resolveSseUrl, resolveWebMcpModelContext, resolveWsUrl, setupDevframeConnection, storeConnection };
