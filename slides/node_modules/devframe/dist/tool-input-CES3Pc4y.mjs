import { colors } from "./utils/colors.mjs";
import { defineDiagnostics } from "nostics";
import { ansiFormatter } from "nostics/formatters/ansi";
//#region src/events.ts
/**
* Centralized registry of the core devframe event names: the node-side host
* bus events, the client RPC connection events, and the server→client
* broadcast notifications, so these names live in one place instead of
* scattered string literals.
*
* **Keep this in sync with [`docs/content/8.references/3.events.md`](../../../docs/content/8.references/3.events.md)**
* (the "Core devframe events" section): every name here appears in that page's
* tables, and every name there resolves to an entry here. Add, rename, or
* remove a name in both places in the same change, and reference
* `DEVFRAME_EVENTS.*` from call sites instead of re-typing a literal.
*
* This map covers **notifications** (events, broadcasts). The request/response
* RPC endpoints of the shared-state, streaming, and auth-handshake protocols
* (`devframe:rpc:server-state:*`, `devframe:streaming:subscribe`,
* `anonymous:devframe:auth`, …) are defined at their handlers and typed in
* `types/rpc-augments.ts`; they aren't events and stay out of this map.
*
* The `EventEmitter` maps (`RpcClientEvents`, `DevframeAgentHostEvents`) and the
* `DevframeRpcClientFunctions` augmentation declare these names as type-level
* keys (a literal is unavoidable in a type position); those declarations mirror
* this map and move with it.
*/
const DEVFRAME_EVENTS = {
	/**
	* Node-side host `EventEmitter` events. The agent host (`ctx.agent.events`)
	* emits these as its tool/resource surface changes; protocol adapters (e.g.
	* MCP) subscribe to re-publish their manifest.
	*/
	bus: {
		agentManifestChanged: "agent:manifest:changed",
		agentToolRegistered: "agent:tool:registered",
		agentToolUnregistered: "agent:tool:unregistered",
		agentResourceRegistered: "agent:resource:registered",
		agentResourceUnregistered: "agent:resource:unregistered"
	},
	/**
	* Client-side RPC connection `EventEmitter` events (`rpc.events`) a UI
	* subscribes to for connection lifecycle and error surfacing.
	*/
	client: {
		isTrustedUpdated: "rpc:is-trusted:updated",
		error: "rpc:error",
		connectionStatus: "connection:status",
		connectionError: "connection:error"
	},
	/**
	* Broadcast notifications the server pushes to clients (server → client),
	* `devframe:` prefix. The paired request methods (subscribe/get/set/…) are
	* RPC endpoints, not events, and are omitted deliberately.
	*/
	broadcast: {
		authRevoked: "devframe:auth:revoked",
		cacheInvalidate: "devframe:rpc:cache:invalidate",
		clientStateUpdated: "devframe:rpc:client-state:updated",
		clientStatePatch: "devframe:rpc:client-state:patch",
		streamingChunk: "devframe:streaming:chunk",
		streamingEnd: "devframe:streaming:end",
		streamingUploadCancel: "devframe:streaming:upload-cancel"
	},
	/**
	* In-page channel notifications the page script pushes to its panels
	* (page script → panel), `devframe:` prefix. The paired request methods
	* (`devframe:in-page:page-state:subscribe`/`set`/`patch`) are call
	* endpoints, not events, and are defined at their handlers
	* (`in-page-channel/state.ts`).
	*/
	inPageChannel: {
		panelStateUpdated: "devframe:in-page:panel-state:updated",
		panelStatePatch: "devframe:in-page:panel-state:patch"
	},
	/** `postMessage` channels the runtime posts across window boundaries. */
	postMessage: {
		remoteAssetsError: "devframe:remote-assets-error",
		inPageChannel: "devframe:in-page-channel"
	}
};
//#endregion
//#region src/utils/nostics.ts
const formatAnsi = ansiFormatter(colors);
/**
* The reporter every {@link defineDiagnostics} call below wires in ahead of
* any caller-supplied ones: prints the diagnostic through devframe's own
* ANSI colors via `console[method]` (default `'warn'`).
*/
function devframeReporter(d, { method = "warn" } = {}) {
	console[method](formatAnsi(d));
}
/**
* Drop-in replacement for `nostics`'s `defineDiagnostics()` with devframe's
* ANSI console reporter pre-wired ahead of any `reporters` passed in. Every
* `diagnostics.ts` in devframe core, `@devframes/hub`, `@devframes/json-render`,
* and the built-in plugins defines its codes through this instead of
* `nostics`'s own `defineDiagnostics`; the reporter registration lives
* here, once, so none of them need to build their own reporter (`colors`,
* `ansiFormatter`) or take a direct dependency on `nostics` themselves.
*/
function defineDiagnostics$1(options) {
	return defineDiagnostics({
		...options,
		reporters: [devframeReporter, ...options.reporters ?? []]
	});
}
//#endregion
//#region ../../node_modules/.pnpm/birpc@4.2.0/node_modules/birpc/dist/index.mjs
function createPromiseWithResolvers() {
	let resolve;
	let reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
const random = Math.random.bind(Math);
const urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid(size = 21) {
	let id = "";
	let i = size;
	while (i--) id += urlAlphabet[random() * 64 | 0];
	return id;
}
const DEFAULT_TIMEOUT = 6e4;
const defaultSerialize = (i) => i;
const defaultDeserialize = defaultSerialize;
const { clearTimeout, setTimeout } = globalThis;
function createBirpc($functions, options) {
	const { post, on, off = () => {}, eventNames = [], serialize = defaultSerialize, deserialize = defaultDeserialize, resolver, bind = "rpc", timeout = DEFAULT_TIMEOUT, proxify = true } = options;
	let $closed = false;
	const _rpcPromiseMap = /* @__PURE__ */ new Map();
	let _promiseInit;
	let rpc;
	async function _call(method, args, event, optional) {
		if ($closed) throw new Error(`[birpc] rpc is closed, cannot call "${method}"`);
		const req = {
			m: method,
			a: args,
			t: "q"
		};
		if (optional) req.o = true;
		const send = async (_req) => post(serialize(_req));
		if (event) {
			await send(req);
			return;
		}
		if (_promiseInit) try {
			await _promiseInit;
		} finally {
			_promiseInit = void 0;
		}
		let { promise, resolve, reject } = createPromiseWithResolvers();
		const id = nanoid();
		req.i = id;
		let timeoutId;
		async function handler(newReq = req) {
			if (timeout >= 0) {
				timeoutId = setTimeout(() => {
					try {
						if (options.onTimeoutError?.call(rpc, method, args) !== true) throw new Error(`[birpc] timeout on calling "${method}"`);
					} catch (e) {
						reject(e);
					}
					_rpcPromiseMap.delete(id);
				}, timeout);
				if (typeof timeoutId === "object") timeoutId = timeoutId.unref?.();
			}
			_rpcPromiseMap.set(id, {
				resolve,
				reject,
				timeoutId,
				method
			});
			await send(newReq);
			return promise;
		}
		try {
			if (options.onRequest) await options.onRequest.call(rpc, req, handler, resolve);
			else await handler();
		} catch (e) {
			if (options.onGeneralError?.call(rpc, e) !== true) throw e;
			return;
		} finally {
			clearTimeout(timeoutId);
			_rpcPromiseMap.delete(id);
		}
		return promise;
	}
	const builtinMethods = {
		$call: (method, ...args) => _call(method, args, false),
		$callOptional: (method, ...args) => _call(method, args, false, true),
		$callEvent: (method, ...args) => _call(method, args, true),
		$callRaw: (options) => _call(options.method, options.args, options.event, options.optional),
		$rejectPendingCalls,
		get $closed() {
			return $closed;
		},
		get $meta() {
			return options.meta;
		},
		$close,
		$functions
	};
	if (proxify) rpc = new Proxy({}, { get(_, method) {
		if (Object.hasOwn(builtinMethods, method)) return builtinMethods[method];
		if (method === "then" && !eventNames.includes("then") && !("then" in $functions)) return void 0;
		const sendEvent = (...args) => _call(method, args, true);
		if (eventNames.includes(method)) {
			sendEvent.asEvent = sendEvent;
			return sendEvent;
		}
		const sendCall = (...args) => _call(method, args, false);
		sendCall.asEvent = sendEvent;
		return sendCall;
	} });
	else rpc = builtinMethods;
	function $close(customError) {
		$closed = true;
		_rpcPromiseMap.forEach(({ reject, method }) => {
			const error = /* @__PURE__ */ new Error(`[birpc] rpc is closed, cannot call "${method}"`);
			if (customError) {
				customError.cause ??= error;
				return reject(customError);
			}
			reject(error);
		});
		_rpcPromiseMap.clear();
		off(onMessage);
	}
	function $rejectPendingCalls(handler) {
		const handlerResults = Array.from(_rpcPromiseMap.values()).map(({ method, reject }) => {
			if (!handler) return reject(/* @__PURE__ */ new Error(`[birpc]: rejected pending call "${method}".`));
			return handler({
				method,
				reject
			});
		});
		_rpcPromiseMap.clear();
		return handlerResults;
	}
	async function onMessage(data, ...extra) {
		let msg;
		try {
			msg = deserialize(data);
		} catch (e) {
			if (options.onGeneralError?.call(rpc, e) !== true) throw e;
			return;
		}
		if (msg.t === "q") {
			const { m: method, a: args, o: optional } = msg;
			let result, error;
			let fn = await (resolver ? resolver.call(rpc, method, $functions[method]) : $functions[method]);
			if (optional) fn ||= () => void 0;
			if (!fn) error = /* @__PURE__ */ new Error(`[birpc] function "${method}" not found`);
			else try {
				result = await fn.apply(bind === "rpc" ? rpc : $functions, args);
			} catch (e) {
				error = e;
			}
			if (msg.i) {
				if (error && options.onFunctionError) {
					if (options.onFunctionError.call(rpc, error, method, args) === true) return;
				}
				if (!error) try {
					await post(serialize({
						t: "s",
						i: msg.i,
						r: result
					}), ...extra);
					return;
				} catch (e) {
					error = e;
					if (options.onGeneralError?.call(rpc, e, method, args) !== true) throw e;
				}
				try {
					await post(serialize({
						t: "s",
						i: msg.i,
						e: error
					}), ...extra);
				} catch (e) {
					if (options.onGeneralError?.call(rpc, e, method, args) !== true) throw e;
				}
			}
		} else {
			const { i: ack, r: result, e: error } = msg;
			const promise = _rpcPromiseMap.get(ack);
			if (promise) {
				clearTimeout(promise.timeoutId);
				if (error) promise.reject(error);
				else promise.resolve(result);
			}
			_rpcPromiseMap.delete(ack);
		}
	}
	_promiseInit = on(onMessage);
	return rpc;
}
//#endregion
//#region src/agent/safety.ts
/**
* An agent tool's safety classification: the explicit `agent.safety`, else
* inferred from the function `type` (`static`/`query` are read-only, the rest
* mutate). Shared by every agent surface (MCP host, WebMCP, in-page bridge).
*/
function resolveAgentSafety(type, agent) {
	if (agent.safety) return agent.safety;
	return type === "static" || type === "query" || type == null ? "read" : "action";
}
//#endregion
//#region src/agent/to-json-schema.ts
const FALLBACK_OBJECT_SCHEMA = Object.freeze({
	type: "object",
	additionalProperties: true
});
/**
* Convert a Standard Schema to JSON Schema for the agent/MCP surface.
*
* Devframe stays validator-neutral, so conversion uses the schema's own
* [Standard JSON Schema](https://standardschema.dev/) converter
* (`~standard.jsonSchema`) when the validator provides one; zod 4 does,
* for example. Validators without a native converter (e.g. valibot) degrade
* to a permissive object schema rather than pulling in a converter library.
*/
function safeToJsonSchema(schema) {
	const standard = schema["~standard"];
	if (standard.jsonSchema) try {
		return standard.jsonSchema.input({ target: "draft-2020-12" });
	} catch {
		return FALLBACK_OBJECT_SCHEMA;
	}
	return FALLBACK_OBJECT_SCHEMA;
}
/**
* JSON Schema for an RPC function's positional args on the agent/MCP
* surface. Each positional arg is advertised under `arg0` / `arg1` / …,
* matching how the agent bridge coerces the incoming object payload back
* into positional arguments.
*
* Returns `{ type: 'object', properties: {} }` when there are no args.
* @internal
*/
function argsToJsonSchema(args) {
	if (!args || args.length === 0) return {
		type: "object",
		properties: {}
	};
	const properties = {};
	const required = [];
	for (let i = 0; i < args.length; i++) {
		const key = `arg${i}`;
		properties[key] = safeToJsonSchema(args[i]);
		required.push(key);
	}
	return {
		type: "object",
		properties,
		required,
		additionalProperties: false
	};
}
//#endregion
//#region src/tool-input.ts
/**
* Convert an object-shaped tool input into positional arguments.
*
* Tool schemas expose positional parameters as `arg0`, `arg1`, and so on.
* Arrays pass through for callers that already provide positional arguments.
*/
function collectPositionalArgs(input, argumentCount) {
	if (Array.isArray(input)) return input;
	if (input === void 0 || input === null) return [];
	if (typeof input !== "object") return void 0;
	const record = input;
	if (argumentCount != null) return Array.from({ length: argumentCount }, (_, index) => record[`arg${index}`]);
	if ("arg0" in record) {
		const positional = [];
		while (`arg${positional.length}` in record) positional.push(record[`arg${positional.length}`]);
		return positional;
	}
	return Object.keys(record).length === 0 ? [] : void 0;
}
/** Convert tool input for an RPC, preserving an untyped payload as arg 0. */
function toolInputToRpcArgs(input, argumentCount) {
	return collectPositionalArgs(input, argumentCount) ?? [input];
}
//#endregion
export { defineDiagnostics$1 as a, createBirpc as i, argsToJsonSchema as n, DEVFRAME_EVENTS as o, resolveAgentSafety as r, toolInputToRpcArgs as t };
