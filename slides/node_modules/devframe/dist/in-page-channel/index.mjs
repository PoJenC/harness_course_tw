import { a as defineDiagnostics, i as createBirpc, n as argsToJsonSchema, o as DEVFRAME_EVENTS, r as resolveAgentSafety, t as toolInputToRpcArgs } from "../tool-input-CES3Pc4y.mjs";
import { createEventEmitter } from "../utils/events.mjs";
import { t as createSharedState } from "../shared-state-Cow3u-_m.mjs";
import { nanoid } from "../utils/nanoid.mjs";
import { r as registerBrowserAgentTool } from "../browser-agent-Pu-FLk6I.mjs";
//#region src/in-page-channel/diagnostics.ts
const diagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase: "https://devfra.me/errors",
	codes: {
		DF0077: {
			why: (p) => `In-page channel function "${p.name}" is not registered on this endpoint.`,
			fix: "Declare the function in this endpoint's `functions` option."
		},
		DF0080: {
			why: (p) => `In-page channel function "${p.name}" has \`agent\` set but \`jsonSerializable\` is \`false\`; MCP requires JSON-serializable data.`,
			fix: "Remove `jsonSerializable: false`, or remove `agent` to keep it channel-only."
		}
	}
});
//#endregion
//#region src/in-page-channel/protocol.ts
/**
* Wire protocol of the in-page channel handshake and its port-level control
* frames. The envelope is transport-neutral by design: it identifies the
* protocol (`channel` tag + `v`), the user channel (`name`), and the peers
* (`panelId`, `instanceId`), so a future cross-tab transport (e.g. a
* `BroadcastChannel`) can reuse it unchanged.
*/
/** `postMessage` tag every handshake message carries. */
const IN_PAGE_CHANNEL_TAG = DEVFRAME_EVENTS.postMessage.inPageChannel;
function isControlFrame(data) {
	return !!data && typeof data === "object" && "__dfIpc" in data;
}
function isHandshakeMessage(data) {
	if (!data || typeof data !== "object") return false;
	const message = data;
	return message.channel === IN_PAGE_CHANNEL_TAG && typeof message.name === "string" && typeof message.panelId === "string" && (message.kind === "hello" || message.kind === "grant");
}
const INSTANCE_STORAGE_KEY = "devframe:in-page-channel:instance";
let memoryInstanceId;
/**
* The page context's instance id: one nanoid per browser tab, persisted in
* `sessionStorage` so it survives page-script reloads. It scopes handshakes
* when the same app is open in several tabs, since a panel pinned to an instance
* id ignores grants from every other tab's page script.
*/
function resolveInstanceId(win) {
	try {
		const storage = win?.sessionStorage;
		if (storage) {
			let id = storage.getItem(INSTANCE_STORAGE_KEY);
			if (!id) {
				id = nanoid();
				storage.setItem(INSTANCE_STORAGE_KEY, id);
			}
			return id;
		}
	} catch {}
	memoryInstanceId ??= nanoid();
	return memoryInstanceId;
}
/** Resolve the origins accepted during the handshake (default: same-origin). */
function resolveAllowedOrigins(allowedOrigins, win) {
	if (allowedOrigins?.length) return allowedOrigins;
	const origin = win?.location?.origin;
	return origin && origin !== "null" ? [origin] : ["*"];
}
/**
* Default handshake targets of a panel: its ancestor chain plus the
* `opener` of each window, including a popup containing the panel iframe. `WindowProxy`
* references stay valid across navigations, so hellos posted to these reach
* a page script even after the host page reloads.
*/
function defaultHandshakeTargets(win) {
	const targets = [];
	try {
		let current = win;
		while (current.parent && current.parent !== current) {
			targets.push(current.parent);
			current = current.parent;
		}
	} catch {}
	for (const current of [win, ...targets]) try {
		const opener = current.opener;
		if (opener && opener !== win && !targets.includes(opener)) targets.push(opener);
	} catch {}
	return targets;
}
const DEFAULT_HEARTBEAT = {
	intervalMs: 5e3,
	timeoutMs: 12e3
};
/** Resolve the heartbeat option against its defaults. */
function resolveHeartbeat(option) {
	return option === false ? void 0 : {
		...DEFAULT_HEARTBEAT,
		...option
	};
}
/** A coded in-page channel error; every failure mode carries a stable `code`. */
var InPageChannelError = class extends Error {
	code;
	name = "InPageChannelError";
	constructor(code, message, options) {
		super(message, options);
		this.code = code;
	}
};
const warned = /* @__PURE__ */ new Set();
/**
* `console.warn` once per distinct message, since handshake noise (foreign
* origins, version mismatches, missing targets) repeats on every retry tick.
*/
function warnOnce(message) {
	if (!warned.has(message)) {
		warned.add(message);
		console.warn(`[devframe] ${message}`);
	}
}
function jsonArrayViolation(value, path, seen) {
	for (let i = 0; i < value.length; i++) {
		const violation = jsonViolation(value[i], `${path}[${i}]`, seen);
		if (violation) return violation;
	}
}
function jsonObjectViolation(value, path, seen) {
	const proto = Object.getPrototypeOf(value);
	if (proto !== Object.prototype && proto !== null) return `${path} is an instance of ${value.constructor?.name ?? "an exotic class"}`;
	for (const [key, entry] of Object.entries(value)) {
		const violation = jsonViolation(entry, `${path}.${key}`, seen);
		if (violation) return violation;
	}
}
function jsonViolation(value, path, seen) {
	if (value === null || typeof value === "boolean" || typeof value === "string") return void 0;
	if (typeof value === "number") return Number.isFinite(value) ? void 0 : `${path} is ${value}`;
	if (typeof value !== "object") return `${path} is ${value === void 0 ? "`undefined`" : `a ${typeof value}`}`;
	if (seen.has(value)) return `${path} is circular`;
	seen.add(value);
	return Array.isArray(value) ? jsonArrayViolation(value, path, seen) : jsonObjectViolation(value, path, seen);
}
/**
* Enforce a `jsonSerializable: true` contract: throws code
* `not-serializable` naming the offending path when the value contains
* anything strict JSON can't represent, surfacing the bug at the offending
* call instead of a silent coercion later.
*/
function assertJsonSerializable(value, what, functionName) {
	const violation = jsonViolation(value, what, /* @__PURE__ */ new Set());
	if (violation) throw new InPageChannelError("not-serializable", `in-page function "${functionName}" is declared jsonSerializable, but ${violation}`);
}
function formatIssues(issues) {
	return issues.map((issue) => {
		const path = issue.path?.map((s) => typeof s === "object" ? s.key : s).join(".");
		return path ? `${path}: ${issue.message}` : issue.message;
	}).join("; ");
}
/**
* Validate positional arguments against their Standard Schemas (mirrors the
* RPC layer's `validateRpcArgs`): only indices with a schema are checked,
* values pass through unchanged, the first failure rejects with code
* `invalid-args`.
*/
async function validateArgs(name, schemas, args) {
	for (let index = 0; index < schemas.length; index++) {
		const schema = schemas[index];
		if (!schema) continue;
		const result = await schema["~standard"].validate(args[index]);
		if (result.issues) throw new InPageChannelError("invalid-args", `in-page function "${name}" rejected argument ${index}: ${formatIssues(result.issues)}`);
	}
}
function serializeArgs(codec, args) {
	return codec.serialize ? args.map(codec.serialize) : args;
}
function deserializeResult(codec, result) {
	return codec.deserialize && result !== void 0 ? codec.deserialize(result) : result;
}
function channelMethod(type, name) {
	return `devframe:in-page:${type === "event" ? "event" : "function"}:${name}`;
}
const FUNCTION_METHOD_PREFIX = channelMethod("function", "");
function createLocalFunctionRegistry(codec) {
	const definitions = /* @__PURE__ */ new Map();
	const listeners = /* @__PURE__ */ new Map();
	return {
		definitions,
		register(definition) {
			if ("agent" in definition && definition.agent) {
				if (definition.jsonSerializable === false) throw diagnostics.DF0080({ name: definition.name });
				definition.jsonSerializable = true;
			}
			definitions.set(channelMethod(definition.type, definition.name), definition);
		},
		registerInternal(method, handler) {
			definitions.set(method, {
				name: method,
				handler
			});
		},
		on(name, listener) {
			const key = channelMethod("event", name);
			let registered = listeners.get(key);
			if (!registered) {
				registered = /* @__PURE__ */ new Set();
				listeners.set(key, registered);
			}
			registered.add(listener);
			return () => {
				registered.delete(listener);
				if (registered.size === 0) listeners.delete(key);
			};
		},
		resolve(name) {
			const definition = definitions.get(name);
			const registered = listeners.get(name);
			if (!definition && !registered?.size) return void 0;
			return async (...rawArgs) => {
				const args = codec.deserialize ? rawArgs.map(codec.deserialize) : rawArgs;
				if (definition?.jsonSerializable) assertJsonSerializable(args, "its arguments", definition.name);
				if (definition?.args?.length) await validateArgs(definition.name, definition.args, args);
				const result = await definition?.handler?.(...args);
				for (const listener of [...listeners.get(name) ?? []]) listener(...args);
				if (definition?.type === "event") return void 0;
				if (definition?.jsonSerializable && result !== void 0) assertJsonSerializable(result, "its return value", definition.name);
				return codec.serialize && result !== void 0 ? codec.serialize(result) : result;
			};
		}
	};
}
/**
* Consult each registry in order and, only once none owns the name, fall back
* to the coded "not registered" error for a `function:` call (events stay
* silent). The fallback lives here, after every registry, so chaining a
* state registry ahead of the user registry never masks a real handler.
*/
function resolveLocalHandler(name, registries) {
	for (const registry of registries) {
		const handler = registry(name);
		if (handler) return handler;
	}
	if (name.startsWith(FUNCTION_METHOD_PREFIX)) return () => {
		throw diagnostics.DF0077({ name: name.slice(FUNCTION_METHOD_PREFIX.length) });
	};
}
/** Register an endpoint's local agent functions for browser-backed transports. */
function registerInPageAgentTools(channelName, registry) {
	const disposals = [];
	for (const definition of registry.definitions.values()) {
		if (definition.type === "event" || !("agent" in definition) || !definition.agent) continue;
		const agent = definition.agent;
		disposals.push(registerBrowserAgentTool({
			id: `${channelName}:${definition.name}`,
			title: agent.title ?? definition.name,
			description: agent.description,
			safety: resolveAgentSafety(definition.type, agent),
			tags: agent.tags,
			inputSchema: argsToJsonSchema(definition.args),
			invoke: (args) => {
				const positional = toolInputToRpcArgs(args, definition.args?.length);
				return registry.resolve(channelMethod(definition.type, definition.name))(...positional);
			}
		}));
	}
	return () => disposals.forEach((dispose) => dispose());
}
function wrapPostError(error) {
	if (error instanceof DOMException && error.name === "DataCloneError") return new InPageChannelError("not-cloneable", `a payload could not be structured-cloned across the in-page channel: ${error.message}. Strip non-cloneable values (functions, DOM nodes, framework reactivity proxies) before sending: declare the function \`jsonSerializable: true\` for a precise error, or provide a \`serialize\` hook.`, { cause: error });
	return error;
}
function attachChannelPort(port, options) {
	let birpcHandler;
	let disposed = false;
	const attached = {
		rpc: createBirpc({}, {
			post: (data) => {
				try {
					port.postMessage(data);
				} catch (error) {
					throw wrapPostError(error);
				}
			},
			on: (fn) => {
				birpcHandler = fn;
			},
			off: () => {
				birpcHandler = void 0;
			},
			/**
			* Deadlines live at the endpoint layer (`withCallDeadline`) with
			* status-aware errors; birpc's own timer stays off.
			*/
			timeout: -1,
			proxify: false,
			resolver: (name, resolved) => resolved ?? options.resolveLocal(name)
		}),
		lastActivity: Date.now(),
		postControl(kind) {
			try {
				port.postMessage({ __dfIpc: kind });
			} catch {}
		},
		dispose(disposeOptions) {
			if (disposed) return;
			disposed = true;
			if (disposeOptions?.bye) attached.postControl("bye");
			const error = new InPageChannelError("closed", `in-page channel call dropped: ${disposeOptions?.reason ?? "the in-page channel port was closed"}`);
			attached.rpc.$rejectPendingCalls(({ reject }) => reject(error));
			attached.rpc.$close();
			port.removeEventListener("message", onMessage);
			port.removeEventListener("close", onClose);
			try {
				port.close();
			} catch {}
		}
	};
	function onMessage(event) {
		attached.lastActivity = Date.now();
		const data = event.data;
		if (isControlFrame(data)) {
			if (data.__dfIpc === "bye") options.onPeerClosed();
			else options.onControl(data.__dfIpc);
			return;
		}
		birpcHandler?.(data);
	}
	function onClose() {
		options.onPeerClosed();
	}
	port.addEventListener("message", onMessage);
	port.addEventListener("close", onClose);
	port.start?.();
	return attached;
}
/**
* Race a call against its deadline, rejecting with a status-aware error
* (code `timeout`). `ms <= 0` disables the deadline.
*/
function withCallDeadline(promise, ms, describeTimeout) {
	if (ms <= 0) return promise;
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new InPageChannelError("timeout", describeTimeout())), ms);
		promise.then((value) => {
			clearTimeout(timer);
			resolve(value);
		}, (error) => {
			clearTimeout(timer);
			reject(error);
		});
	});
}
//#endregion
//#region src/in-page-channel/state.ts
/**
* The channel shared-state layer: `createSharedState` pumped over the
* in-page channel, mirroring the RPC shared-state wire design with the page
* script playing the server's role: it owns the canonical value, replays a
* snapshot to every (re)subscribing panel, and fans syncId-deduplicated
* updates out to the panels subscribed to each key.
*
* Request endpoints (panel → page script) are defined here at their
* handlers, like the RPC layer's `devframe:rpc:server-state:*`; the
* page-script → panel notifications live in `DEVFRAME_EVENTS.inPageChannel`.
*/
const IN_PAGE_STATE_RPC = {
	/** Subscribe to a key; returns the authority's current snapshot. */
	subscribe: "devframe:in-page:page-state:subscribe",
	/** Replace a key's value (panel mutation forwarded up). */
	set: "devframe:in-page:page-state:set",
	/** Patch a key's value (panel mutation forwarded up). */
	patch: "devframe:in-page:page-state:patch"
};
/** The page-script (authority) half of the channel shared-state layer. */
function createPageScriptStateHost(peers) {
	const states = /* @__PURE__ */ new Map();
	return {
		get: async (key, options) => {
			const existing = states.get(key);
			if (existing) return existing;
			if (options?.initialValue === void 0) throw new InPageChannelError("state-uninitialized", `in-page shared state "${key}" was accessed before initialization; the page script is the authority, so its first \`sharedState.get("${key}")\` must provide \`initialValue\``);
			const state = createSharedState({
				initialValue: options.initialValue,
				enablePatches: true
			});
			states.set(key, state);
			state.on("updated", (fullState, patches, syncId) => {
				for (const peer of peers()) {
					if (!peer.subscribedStates.has(key)) continue;
					if (patches) peer.callEventRaw(DEVFRAME_EVENTS.inPageChannel.panelStatePatch, [
						key,
						patches,
						syncId
					]);
					else peer.callEventRaw(DEVFRAME_EVENTS.inPageChannel.panelStateUpdated, [
						key,
						fullState,
						syncId
					]);
				}
			});
			return state;
		},
		createPeerHandlers(peer) {
			return {
				[IN_PAGE_STATE_RPC.subscribe]: (key) => {
					peer.subscribedStates.add(key);
					return states.get(key)?.value();
				},
				[IN_PAGE_STATE_RPC.set]: (key, fullState, syncId) => {
					const state = states.get(key);
					if (state && !state.syncIds.has(syncId)) state.mutate(() => fullState, syncId);
				},
				[IN_PAGE_STATE_RPC.patch]: (key, patches, syncId) => {
					states.get(key)?.patch(patches, syncId);
				}
			};
		}
	};
}
/** The panel (mirror) half of the channel shared-state layer. */
function createPanelStateHost(options) {
	const states = /* @__PURE__ */ new Map();
	const seeded = /* @__PURE__ */ new Set();
	const seedWaiters = /* @__PURE__ */ new Map();
	/**
	* SyncIds of snapshot adoptions. Adopting the authority's replay must not
	* echo straight back up as a `set`; the authority already has the value.
	*/
	const adoptedSyncIds = /* @__PURE__ */ new Set();
	function markSeeded(key) {
		seeded.add(key);
		const waiters = seedWaiters.get(key);
		if (waiters) {
			seedWaiters.delete(key);
			for (const resolve of waiters) resolve();
		}
	}
	function adopt(key, snapshot) {
		const state = states.get(key);
		if (state && snapshot !== void 0) {
			const syncId = nanoid();
			adoptedSyncIds.add(syncId);
			state.mutate(() => snapshot, syncId);
		}
		markSeeded(key);
	}
	function subscribeNow(key) {
		options.call(IN_PAGE_STATE_RPC.subscribe, [key]).then((snapshot) => adopt(key, snapshot)).catch((error) => {
			console.warn(`[devframe] in-page shared state "${key}": subscribe failed`, error);
		});
	}
	return {
		handlers: {
			[DEVFRAME_EVENTS.inPageChannel.panelStateUpdated]: (key, fullState, syncId) => {
				const state = states.get(key);
				if (state && !state.syncIds.has(syncId)) state.mutate(() => fullState, syncId);
				markSeeded(key);
			},
			[DEVFRAME_EVENTS.inPageChannel.panelStatePatch]: (key, patches, syncId) => {
				states.get(key)?.patch(patches, syncId);
				markSeeded(key);
			}
		},
		resubscribe() {
			for (const key of states.keys()) subscribeNow(key);
		},
		get: (key, getOptions) => {
			const existing = states.get(key);
			if (existing) return Promise.resolve(existing);
			const state = createSharedState({
				/**
				* Without an initial value the state stays empty until the
				* authority's first replay resolves the returned promise.
				*/
				initialValue: getOptions?.initialValue,
				enablePatches: true
			});
			states.set(key, state);
			state.on("updated", (fullState, patches, syncId) => {
				if (adoptedSyncIds.delete(syncId)) return;
				if (!options.isConnected()) return;
				if (patches) options.callEvent(IN_PAGE_STATE_RPC.patch, [
					key,
					patches,
					syncId
				]);
				else options.callEvent(IN_PAGE_STATE_RPC.set, [
					key,
					fullState,
					syncId
				]);
			});
			if (options.isConnected()) subscribeNow(key);
			if (getOptions?.initialValue !== void 0) return Promise.resolve(state);
			return new Promise((resolve) => {
				if (seeded.has(key)) {
					resolve(state);
					return;
				}
				const waiters = seedWaiters.get(key) ?? [];
				waiters.push(() => resolve(state));
				seedWaiters.set(key, waiters);
			});
		}
	};
}
//#endregion
//#region src/in-page-channel/page-script.ts
/**
* Create the page-script endpoint of an in-page channel.
*
* It listens for panel hellos on the host page's window and answers each
* with a dedicated `MessageChannel` port (same-origin enforced both ways),
* keeping one live peer per panel: dock iframe, popup, and Document-PiP
* panels all handshake the same way, and a panel reload is simply a new
* handshake. No server is involved at any point.
*/
function createPageScriptChannel(options) {
	const { name } = options;
	const callTimeoutMs = options.callTimeoutMs ?? 15e3;
	const win = options.window === false ? void 0 : options.window ?? (typeof window === "undefined" ? void 0 : window);
	const allowedOrigins = resolveAllowedOrigins(options.allowedOrigins, win);
	const instanceId = resolveInstanceId(win);
	const heartbeat = resolveHeartbeat(options.heartbeat);
	const codec = {
		serialize: options.serialize,
		deserialize: options.deserialize
	};
	const events = createEventEmitter();
	const peers = /* @__PURE__ */ new Map();
	let closed = false;
	let heartbeatTimer;
	const registry = createLocalFunctionRegistry(codec);
	for (const [fnName, definition] of Object.entries(options.functions)) registry.register({
		...definition,
		name: fnName
	});
	for (const [eventName, definition] of Object.entries(options.events ?? {})) registry.register({
		...definition,
		name: eventName,
		type: "event"
	});
	const disposeAgentTools = registerInPageAgentTools(name, registry);
	const stateHost = createPageScriptStateHost(function* () {
		for (const peer of peers.values()) yield {
			subscribedStates: peer.subscribedStates,
			callEventRaw: (method, args) => {
				peer.attached.rpc.$callRaw({
					method,
					args: serializeArgs(codec, args),
					event: true,
					optional: true
				}).catch(() => {});
			}
		};
	});
	function removePeer(id, disposeOptions) {
		const peer = peers.get(id);
		if (!peer) return;
		peers.delete(id);
		peer.attached.dispose(disposeOptions);
		if (peers.size === 0 && heartbeatTimer) {
			clearInterval(heartbeatTimer);
			heartbeatTimer = void 0;
		}
		events.emit("panel:disconnected", peer.peer);
	}
	function addPeer(port, id) {
		removePeer(id, { reason: "the panel re-connected" });
		const internal = {
			id,
			subscribedStates: /* @__PURE__ */ new Set()
		};
		internal.internalHandlers = stateHost.createPeerHandlers({
			subscribedStates: internal.subscribedStates,
			callEventRaw: (method, args) => {
				internal.attached.rpc.$callRaw({
					method,
					args: serializeArgs(codec, args),
					event: true,
					optional: true
				}).catch(() => {});
			}
		});
		const stateRegistry = createLocalFunctionRegistry(codec);
		for (const [method, handler] of Object.entries(internal.internalHandlers)) stateRegistry.registerInternal(method, handler);
		internal.attached = attachChannelPort(port, {
			resolveLocal: (fnName) => resolveLocalHandler(fnName, [stateRegistry.resolve, registry.resolve]),
			onControl: (kind) => {
				if (kind === "ping") internal.attached.postControl("pong");
			},
			onPeerClosed: () => removePeer(id, { reason: "the panel disconnected" })
		});
		internal.peer = {
			id,
			call: (fnName, ...args) => withCallDeadline(internal.attached.rpc.$call(channelMethod("function", fnName), ...serializeArgs(codec, args)).then((result) => deserializeResult(codec, result)), callTimeoutMs, () => `in-page channel "${name}": call "${fnName}" to panel "${id}" timed out after ${callTimeoutMs}ms`),
			close: () => removePeer(id, {
				bye: true,
				reason: "the page script closed this panel"
			})
		};
		peers.set(id, internal);
		if (heartbeat && !heartbeatTimer) heartbeatTimer = setInterval(() => {
			const now = Date.now();
			for (const peer of [...peers.values()]) if (now - peer.attached.lastActivity > heartbeat.timeoutMs) removePeer(peer.id, { reason: "the panel went silent (heartbeat timeout)" });
		}, heartbeat.intervalMs);
		events.emit("panel:connected", internal.peer);
		return internal.peer;
	}
	const onWindowMessage = (event) => {
		if (closed) return;
		const data = event.data;
		if (!isHandshakeMessage(data) || data.kind !== "hello" || data.name !== name) return;
		if (data.v !== 2) {
			warnOnce(`in-page channel "${name}": ignoring a hello with protocol version ${data.v} (this side speaks 2); align the devframe versions of the page script and the panel`);
			return;
		}
		if (!allowedOrigins.includes("*") && !allowedOrigins.includes(event.origin)) {
			warnOnce(`in-page channel "${name}": ignoring a hello from disallowed origin "${event.origin}"`);
			return;
		}
		if (data.instanceId && data.instanceId !== instanceId) return;
		const source = event.source;
		if (!source || typeof source.postMessage !== "function") return;
		const messageChannel = new MessageChannel();
		addPeer(messageChannel.port1, data.panelId);
		const grant = {
			channel: IN_PAGE_CHANNEL_TAG,
			v: 2,
			kind: "grant",
			name,
			panelId: data.panelId,
			instanceId
		};
		try {
			source.postMessage(grant, allowedOrigins.includes("*") ? "*" : event.origin, [messageChannel.port2]);
		} catch (error) {
			console.warn(`[devframe] in-page channel "${name}": failed to grant a port`, error);
			removePeer(data.panelId, { reason: "the grant could not be delivered" });
		}
	};
	win?.addEventListener("message", onWindowMessage);
	const emit = (fnName, ...args) => {
		const wireArgs = serializeArgs(codec, args);
		for (const peer of peers.values()) peer.attached.rpc.$callRaw({
			method: channelMethod("event", fnName),
			args: wireArgs,
			event: true,
			optional: true
		}).catch(() => {});
	};
	return {
		name,
		instanceId,
		get panels() {
			return [...peers.values()].map((peer) => peer.peer);
		},
		events: {
			on: events.on,
			once: events.once
		},
		emit,
		on: (fnName, listener) => registry.on(fnName, listener),
		sharedState: stateHost,
		addPanelPort: (port) => addPeer(port, `transport:${nanoid(8)}`),
		close: () => {
			if (closed) return;
			closed = true;
			disposeAgentTools();
			win?.removeEventListener("message", onWindowMessage);
			for (const id of [...peers.keys()]) removePeer(id, {
				bye: true,
				reason: "the page script closed the channel"
			});
		}
	};
}
//#endregion
//#region src/in-page-channel/panel.ts
const DEFAULT_HELLO_INTERVAL_MS = 300;
const HELLO_INTERVAL_CAP_MS = 3e3;
const DEFAULT_EVENT_BUFFER_LIMIT = 64;
/**
* Connect the panel endpoint of an in-page channel.
*
* The panel initiates: it posts a versioned hello to every window a
* page script can live in (its ancestor chain and those windows' openers),
* retrying with backoff until one answers with a dedicated port, so boot
* order never matters, and a reload of either side is just a re-handshake
* (`WindowProxy` references survive navigations). While `connecting`,
* outgoing calls and events are buffered; when no page script exists at all
* (e.g. the panel opened standalone), the endpoint stays `connecting` and
* the UI can key a fallback state off `status` / `whenConnected()`.
*/
function connectPanelChannel(options) {
	const { name } = options;
	const callTimeoutMs = options.callTimeoutMs ?? 15e3;
	const eventBufferLimit = options.eventBufferLimit ?? DEFAULT_EVENT_BUFFER_LIMIT;
	const win = options.window === false ? void 0 : options.window ?? (typeof window === "undefined" ? void 0 : window);
	const allowedOrigins = resolveAllowedOrigins(options.allowedOrigins, win);
	const heartbeat = resolveHeartbeat(options.heartbeat);
	const codec = {
		serialize: options.serialize,
		deserialize: options.deserialize
	};
	const panelId = nanoid();
	const targets = options.targets ?? (win ? defaultHandshakeTargets(win) : []);
	const canHandshake = !!win && targets.length > 0;
	const events = createEventEmitter();
	const registry = createLocalFunctionRegistry(codec);
	for (const [fnName, definition] of Object.entries(options.functions)) registry.register({
		...definition,
		name: fnName
	});
	for (const [eventName, definition] of Object.entries(options.events ?? {})) registry.register({
		...definition,
		name: eventName,
		type: "event"
	});
	const disposeAgentTools = registerInPageAgentTools(name, registry);
	let status = "connecting";
	let attached;
	let pageScriptInfo;
	let helloTimer;
	let heartbeatTimer;
	let droppedEventsWarned = false;
	const pendingCalls = [];
	const eventBuffer = [];
	const connectedWaiters = [];
	function setStatus(next) {
		if (status !== next) {
			status = next;
			events.emit("status:updated", next);
		}
	}
	const stateHost = createPanelStateHost({
		isConnected: () => status === "connected",
		callEvent: (method, args) => sendEvent(method, serializeArgs(codec, args)),
		call: (method, args) => enqueueCall(method, serializeArgs(codec, args))
	});
	const stateRegistry = createLocalFunctionRegistry(codec);
	for (const [method, handler] of Object.entries(stateHost.handlers)) stateRegistry.registerInternal(method, handler);
	function sendEventNow(method, args) {
		attached?.rpc.$callRaw({
			method,
			args,
			event: true,
			optional: true
		}).catch(() => {});
	}
	function sendEvent(method, args) {
		if (status === "closed") return;
		if (status === "connected" && attached) {
			sendEventNow(method, args);
			return;
		}
		if (eventBuffer.length >= eventBufferLimit) {
			eventBuffer.shift();
			if (!droppedEventsWarned) {
				droppedEventsWarned = true;
				console.warn(`[devframe] in-page channel "${name}": event buffer overflowed while connecting, so the oldest events are being dropped (limit ${eventBufferLimit})`);
			}
		}
		eventBuffer.push({
			method,
			args
		});
	}
	function enqueueCall(method, args) {
		if (status === "closed") return Promise.reject(new InPageChannelError("closed", `in-page channel "${name}": call "${method}" rejected because the channel is closed`));
		return withCallDeadline(new Promise((resolve, reject) => {
			const run = () => {
				attached.rpc.$call(method, ...args).then((result) => resolve(deserializeResult(codec, result)), reject);
			};
			if (status === "connected" && attached) run();
			else pendingCalls.push({
				run,
				reject
			});
		}), callTimeoutMs, () => `in-page channel "${name}": call "${method}" timed out after ${callTimeoutMs}ms (status: ${status}${status === "connecting" ? "; is the page script loaded?" : ""})`);
	}
	function adoptPort(port, info) {
		attached?.dispose({
			bye: true,
			reason: "the panel adopted a newer port"
		});
		attached = attachChannelPort(port, {
			resolveLocal: (fnName) => resolveLocalHandler(fnName, [stateRegistry.resolve, registry.resolve]),
			onControl: (kind) => {
				if (kind === "ping") attached?.postControl("pong");
			},
			onPeerClosed: () => handleDisconnect("the page script went away")
		});
		pageScriptInfo = info;
		stopTimers();
		setStatus("connected");
		if (heartbeat) heartbeatTimer = setInterval(() => {
			if (!attached) return;
			if (Date.now() - attached.lastActivity > heartbeat.timeoutMs) handleDisconnect("the page script went silent (heartbeat timeout)");
			else attached.postControl("ping");
		}, heartbeat.intervalMs);
		for (const call of pendingCalls.splice(0)) call.run();
		for (const { method, args } of eventBuffer.splice(0)) sendEventNow(method, args);
		stateHost.resubscribe();
		for (const waiter of connectedWaiters.splice(0)) waiter.resolve();
	}
	function stopTimers() {
		if (helloTimer) {
			clearTimeout(helloTimer);
			helloTimer = void 0;
		}
		if (heartbeatTimer) {
			clearInterval(heartbeatTimer);
			heartbeatTimer = void 0;
		}
	}
	function handleDisconnect(reason) {
		if (status === "closed") return;
		attached?.dispose({ reason });
		attached = void 0;
		pageScriptInfo = void 0;
		stopTimers();
		setStatus("connecting");
		if (canHandshake) startHelloLoop();
		else warnOnce(`in-page channel "${name}": transport lost (${reason}) and the panel has no handshake targets, so it stays disconnected`);
	}
	function startHelloLoop() {
		if (helloTimer || !canHandshake || status !== "connecting") return;
		let delay = options.helloIntervalMs ?? DEFAULT_HELLO_INTERVAL_MS;
		const tick = () => {
			const hello = {
				channel: IN_PAGE_CHANNEL_TAG,
				v: 2,
				kind: "hello",
				name,
				panelId,
				instanceId: options.instanceId
			};
			for (const target of targets) for (const origin of allowedOrigins) try {
				target.postMessage(hello, origin);
			} catch {}
			delay = Math.min(delay * 1.5, HELLO_INTERVAL_CAP_MS);
			helloTimer = setTimeout(tick, delay);
		};
		tick();
	}
	const onWindowMessage = (event) => {
		if (status === "closed") return;
		const data = event.data;
		if (!isHandshakeMessage(data) || data.kind !== "grant" || data.name !== name || data.panelId !== panelId) return;
		if (data.v !== 2) {
			warnOnce(`in-page channel "${name}": ignoring a grant with protocol version ${data.v} (this side speaks 2); align the devframe versions of the page script and the panel`);
			return;
		}
		if (!allowedOrigins.includes("*") && !allowedOrigins.includes(event.origin)) {
			warnOnce(`in-page channel "${name}": ignoring a grant from disallowed origin "${event.origin}"`);
			return;
		}
		if (options.instanceId && data.instanceId !== options.instanceId) return;
		const port = event.ports?.[0];
		if (port) adoptPort(port, { instanceId: data.instanceId });
	};
	win?.addEventListener("message", onWindowMessage);
	if (options.transport) adoptPort(options.transport);
	else if (canHandshake) startHelloLoop();
	else warnOnce(`in-page channel "${name}": the panel has no handshake targets (not embedded, no opener) and no transport, so calls will buffer until a transport appears or the channel is closed`);
	return {
		name,
		get status() {
			return status;
		},
		get pageScript() {
			return pageScriptInfo;
		},
		events: {
			on: events.on,
			once: events.once
		},
		whenConnected: (timeoutMs) => {
			if (status === "connected") return Promise.resolve();
			if (status === "closed") return Promise.reject(new InPageChannelError("closed", `in-page channel "${name}" is closed`));
			return new Promise((resolve, reject) => {
				const waiter = {
					resolve,
					reject
				};
				connectedWaiters.push(waiter);
				if (timeoutMs !== void 0 && timeoutMs > 0) setTimeout(() => {
					const index = connectedWaiters.indexOf(waiter);
					if (index >= 0) {
						connectedWaiters.splice(index, 1);
						reject(new InPageChannelError("timeout", `in-page channel "${name}": no page script answered within ${timeoutMs}ms; it may not be loaded in this context (render a fallback state)`));
					}
				}, timeoutMs);
			});
		},
		call: (fnName, ...args) => enqueueCall(channelMethod("function", fnName), serializeArgs(codec, args)),
		emit: (fnName, ...args) => sendEvent(channelMethod("event", fnName), serializeArgs(codec, args)),
		on: (fnName, listener) => registry.on(fnName, listener),
		sharedState: stateHost,
		close: () => {
			if (status === "closed") return;
			setStatus("closed");
			disposeAgentTools();
			stopTimers();
			win?.removeEventListener("message", onWindowMessage);
			attached?.dispose({
				bye: true,
				reason: "the panel closed the channel"
			});
			attached = void 0;
			pageScriptInfo = void 0;
			const closedError = new InPageChannelError("closed", `in-page channel "${name}" was closed`);
			for (const call of pendingCalls.splice(0)) call.reject(closedError);
			eventBuffer.length = 0;
			for (const waiter of connectedWaiters.splice(0)) waiter.reject(closedError);
		}
	};
}
//#endregion
//#region src/in-page-channel/index.ts
/**
* Define one in-page channel function, the `defineRpcFunction` authoring
* shape narrowed to the browser (see {@link InPageFunctionDefinition}).
* Pure identity: it only types the definition. Functions live in
* side-specific files and are passed to their endpoint via `functions`; the
* shared protocol file carries only the contract type and the channel-name
* constant.
*/
function defineChannelFunction(definition) {
	return definition;
}
//#endregion
export { InPageChannelError, connectPanelChannel, createPageScriptChannel, defineChannelFunction };
