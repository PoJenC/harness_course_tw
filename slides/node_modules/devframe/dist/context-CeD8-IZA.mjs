import { i as defineDiagnostics } from "./nostics-D0PvLZsn.mjs";
import { r as diagnostics } from "./serialization-BhuOoL80.mjs";
import { RpcFunctionsCollectorBase } from "./rpc/index.mjs";
import { defineRpcFunction } from "./index.mjs";
import { t as DEVFRAME_EVENTS } from "./events-0wDwalmL.mjs";
import { DEVFRAME_SERVICES_STATE_KEY } from "./constants.mjs";
import { t as diagnostics$1 } from "./diagnostics-Dngy7cNp.mjs";
import { r as createEventEmitter, t as DevframeAgentHost } from "./host-agent-DB1yECaG.mjs";
import { n as createDebug, t as resolveStaticAssetsSource } from "./remote-assets-DoZ1AMpq.mjs";
import { t as createStorage } from "./storage-BQy9865B.mjs";
import { a as satisfiesVersionRange, n as expandResolveFrom, r as importServicePackage, t as deepMergeOptionSets } from "./services-install-D5YUwFXW.mjs";
import { isAbsolute, join, relative } from "pathe";
import { createSharedState } from "devframe/utils/shared-state";
import { existsSync } from "node:fs";
import process from "node:process";
//#region src/node/host-diagnostics.ts
var DevframeDiagnosticsHost = class {
	context;
	_registry = {};
	logger = new Proxy({}, { get: (_, code) => this._registry[code] });
	/**
	* Already pre-wires devframe's ANSI console reporter, so no extra merging
	* needed here, the host's `defineDiagnostics` just is the shared one.
	*/
	defineDiagnostics = defineDiagnostics;
	constructor(context, initialDefinitions = []) {
		this.context = context;
		for (const d of initialDefinitions) this.register(d);
	}
	register(diagnostics) {
		Object.assign(this._registry, diagnostics);
	}
};
//#endregion
//#region src/node/client-agent.ts
const states = /* @__PURE__ */ new WeakMap();
function getState(context) {
	let state = states.get(context);
	if (state) return state;
	const sessions = /* @__PURE__ */ new Map();
	state = {
		sessions,
		notifyChanged: context.agent.registerToolProvider(() => {
			const tools = /* @__PURE__ */ new Map();
			for (const { session, tools: manifests } of sessions.values()) for (const manifest of manifests) {
				if (tools.has(manifest.id)) continue;
				tools.set(manifest.id, {
					...manifest,
					handler: (args) => session.rpc.$callRaw({
						method: "devframe:agent:invoke-client-tool",
						args: [manifest.id, args]
					})
				});
			}
			return [...tools.values()];
		}).notifyChanged
	};
	states.set(context, state);
	return state;
}
function syncClientAgentTools(context, session, clientId, tools) {
	const state = getState(context);
	state.sessions.set(session.meta, {
		session,
		clientId,
		tools
	});
	state.notifyChanged();
}
function removeClientAgentSession(context, meta) {
	const state = states.get(context);
	if (state?.sessions.delete(meta)) state.notifyChanged();
}
//#endregion
//#region src/node/rpc-shared-state.ts
const debug$2 = createDebug("devframe:rpc:state:changed");
const debugSubscribe = createDebug("devframe:rpc:state:subscribe");
function createRpcSharedStateServerHost(rpc, resolveState) {
	const sharedState = /* @__PURE__ */ new Map();
	const stateDisposers = /* @__PURE__ */ new Map();
	const keyAddedListeners = /* @__PURE__ */ new Set();
	function registerSharedState(key, state) {
		const offs = [];
		offs.push(state.on("updated", (fullState, patches, syncId) => {
			if (patches) {
				debug$2("patch", {
					key,
					syncId
				});
				rpc.broadcast({
					method: DEVFRAME_EVENTS.broadcast.clientStatePatch,
					args: [
						key,
						patches,
						syncId
					],
					filter: (client) => client.$meta.subscribedStates.has(key)
				});
			} else {
				debug$2("updated", {
					key,
					syncId
				});
				rpc.broadcast({
					method: DEVFRAME_EVENTS.broadcast.clientStateUpdated,
					args: [
						key,
						fullState,
						syncId
					],
					filter: (client) => client.$meta.subscribedStates.has(key)
				});
			}
		}));
		return () => {
			for (const off of offs) off();
		};
	}
	function addState(key, state) {
		debug$2("new-state", key);
		stateDisposers.set(key, registerSharedState(key, state));
		sharedState.set(key, state);
		for (const fn of keyAddedListeners) fn(key);
		return state;
	}
	function resolve(key) {
		const existing = sharedState.get(key);
		if (existing) return existing;
		const state = resolveState?.(key);
		return state ? addState(key, state) : void 0;
	}
	const host = {
		get: async (key, options) => {
			const existing = resolve(key);
			if (existing) return existing;
			if (options?.initialValue === void 0 && options?.sharedState === void 0) throw diagnostics$1.DF0013({ key });
			return addState(key, options.sharedState ?? createSharedState({
				initialValue: options.initialValue,
				enablePatches: false
			}));
		},
		keys() {
			return Array.from(sharedState.keys());
		},
		onKeyAdded(fn) {
			keyAddedListeners.add(fn);
			return () => {
				keyAddedListeners.delete(fn);
			};
		},
		delete(key) {
			const dispose = stateDisposers.get(key);
			if (!dispose) return false;
			dispose();
			stateDisposers.delete(key);
			sharedState.delete(key);
			return true;
		}
	};
	rpc.register({
		name: "devframe:rpc:server-state:subscribe",
		type: "event",
		handler(key) {
			const session = rpc.getCurrentRpcSession();
			if (!session) return;
			debugSubscribe("subscribe", {
				key,
				session: session.meta.id
			});
			session.meta.subscribedStates.add(key);
		}
	});
	rpc.register({
		name: "devframe:rpc:server-state:get",
		type: "query",
		handler: async (key) => {
			return resolve(key)?.value();
		},
		/**
		* Pre-compute snapshots for the build-mode static dump so the SPA
		* can read them without a live server. The `undefined` fallback makes
		* a key the build never created resolve like the live handler does
		* (returning `undefined`) instead of failing the dump lookup.
		*/
		dump: () => ({
			inputs: host.keys().map((key) => [key]),
			fallback: void 0
		})
	});
	rpc.register({
		name: "devframe:rpc:server-state:set",
		type: "query",
		handler: async (key, value, syncId) => {
			(await host.get(key, { initialValue: value })).patch([{
				op: "replace",
				path: [],
				value
			}], syncId);
		}
	});
	rpc.register({
		name: "devframe:rpc:server-state:patch",
		type: "query",
		handler: async (key, patches, syncId) => {
			resolve(key)?.patch(patches, syncId);
		}
	});
	return host;
}
//#endregion
//#region src/utils/nanoid.ts
const urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid(size = 21) {
	let id = "";
	let i = size;
	while (i--) id += urlAlphabet[Math.random() * 64 | 0];
	return id;
}
//#endregion
//#region src/utils/streaming-channel.ts
const DEFAULT_HIGH_WATER_MARK = 256;
var StreamClosedError = class extends Error {
	name = "StreamClosedError";
};
/**
* Build a server-side stream sink. RPC-agnostic; the RPC host wires
* `events.on('chunk' | 'end')` to broadcast, and reads `buffer` to replay
* for late or reconnecting subscribers.
*/
function createStreamSink(options = {}) {
	const id = options.id ?? nanoid();
	const replayWindow = Math.max(0, options.replayWindow ?? 0);
	const events = createEventEmitter();
	const controller = new AbortController();
	const buffer = [];
	let closed = false;
	let lastSeq = 0;
	function write(chunk) {
		if (closed) throw new StreamClosedError(`Cannot write to a closed stream "${id}"`);
		lastSeq += 1;
		if (replayWindow > 0) {
			buffer.push({
				seq: lastSeq,
				chunk
			});
			if (buffer.length > replayWindow) {
				if (buffer.length - replayWindow === 1) buffer.shift();
				else buffer.splice(0, buffer.length - replayWindow);
			}
		}
		events.emit("chunk", lastSeq, chunk);
	}
	function error(reason) {
		if (closed) return;
		closed = true;
		const payload = toErrorPayload(reason);
		controller.abort(reason);
		events.emit("end", payload);
	}
	function close() {
		if (closed) return;
		closed = true;
		if (!controller.signal.aborted) controller.abort("stream closed");
		events.emit("end", void 0);
	}
	function abort(reason) {
		if (closed) return;
		if (!controller.signal.aborted) controller.abort(reason ?? "aborted");
	}
	const writable = new WritableStream({
		write(chunk) {
			write(chunk);
		},
		close() {
			close();
		},
		abort(reason) {
			error(reason);
		}
	});
	return {
		id,
		signal: controller.signal,
		get closed() {
			return closed;
		},
		get lastSeq() {
			return lastSeq;
		},
		write,
		error,
		close,
		abort,
		writable,
		events,
		buffer
	};
}
/**
* Build a client-side stream reader. RPC-agnostic; the RPC host calls
* `_push(seq, chunk)` on each incoming chunk and `_end(error?)` on the
* terminal frame. Consumers iterate with `for await` or pipe `readable`.
*/
function createStreamReader(options = {}) {
	const id = options.id ?? nanoid();
	const highWaterMark = Math.max(1, options.highWaterMark ?? DEFAULT_HIGH_WATER_MARK);
	const queue = [];
	let lastSeenSeq = 0;
	let done = false;
	let cancelled = false;
	let endError;
	let pending;
	let pullController;
	let readableInstance;
	function drainNext() {
		if (!pending) return;
		if (queue.length > 0) {
			const value = queue.shift();
			const r = pending;
			pending = void 0;
			r.resolve({
				value,
				done: false
			});
			return;
		}
		if (done) {
			const r = pending;
			pending = void 0;
			if (endError) {
				const err = new Error(endError.message);
				err.name = endError.name;
				r.reject(err);
			} else r.resolve({
				value: void 0,
				done: true
			});
		}
	}
	function feedReadable() {
		if (!pullController) return;
		while (queue.length > 0) {
			const v = queue.shift();
			try {
				pullController.enqueue(v);
			} catch {
				break;
			}
		}
		if (done && pullController) {
			try {
				if (endError) {
					const err = new Error(endError.message);
					err.name = endError.name;
					pullController.error(err);
				} else pullController.close();
			} catch {}
			pullController = void 0;
		}
	}
	function push(seq, chunk) {
		if (done || cancelled) return;
		if (seq <= lastSeenSeq) return;
		lastSeenSeq = seq;
		queue.push(chunk);
		if (queue.length > highWaterMark) {
			const overflow = queue.length - highWaterMark;
			queue.splice(0, overflow);
			options.onOverflow?.(overflow);
		}
		drainNext();
		if (readableInstance) feedReadable();
	}
	function end(error) {
		if (done) return;
		done = true;
		endError = error;
		drainNext();
		if (readableInstance) feedReadable();
	}
	function cancel() {
		if (cancelled || done) return;
		cancelled = true;
		options.onCancel?.();
		end(void 0);
	}
	function getReadable() {
		if (readableInstance) return readableInstance;
		readableInstance = new ReadableStream({
			start(controller) {
				pullController = controller;
				feedReadable();
			},
			cancel() {
				cancel();
			}
		});
		return readableInstance;
	}
	return {
		id,
		get cancelled() {
			return cancelled;
		},
		get done() {
			return done;
		},
		get lastSeenSeq() {
			return lastSeenSeq;
		},
		get readable() {
			return getReadable();
		},
		cancel,
		_push: push,
		_end: end,
		[Symbol.asyncIterator]() {
			return {
				next() {
					if (queue.length > 0) return Promise.resolve({
						value: queue.shift(),
						done: false
					});
					if (done) {
						if (endError) {
							const err = new Error(endError.message);
							err.name = endError.name;
							return Promise.reject(err);
						}
						return Promise.resolve({
							value: void 0,
							done: true
						});
					}
					return new Promise((resolve, reject) => {
						pending = {
							resolve,
							reject
						};
					});
				},
				return() {
					cancel();
					return Promise.resolve({
						value: void 0,
						done: true
					});
				}
			};
		}
	};
}
function toErrorPayload(reason) {
	if (reason instanceof Error) return {
		name: reason.name || "Error",
		message: reason.message
	};
	if (typeof reason === "string") return {
		name: "Error",
		message: reason
	};
	try {
		return {
			name: "Error",
			message: JSON.stringify(reason)
		};
	} catch {
		return {
			name: "Error",
			message: String(reason)
		};
	}
}
//#endregion
//#region src/node/rpc-streaming.ts
const debug$1 = createDebug("devframe:rpc:streaming");
const STREAM_KEY_SEPARATOR = "";
function streamKey(channel, id) {
	return `${channel}${STREAM_KEY_SEPARATOR}${id}`;
}
/**
* Build the server-side streaming host. Mirrors the layout of
* `createRpcSharedStateServerHost`: registers a fixed set of internal
* RPC methods (`subscribe` / `unsubscribe` / `cancel`) once, then per-channel
* state lives in a `Map<channelName, ChannelState>`.
*/
function createRpcStreamingServerHost(rpc) {
	const channels = /* @__PURE__ */ new Map();
	function findStream(channelName, id) {
		return channels.get(channelName)?.streams.get(id);
	}
	function freeStreamNow(state, id) {
		const record = state.streams.get(id);
		if (!record) return;
		if (record.retentionTimer) {
			clearTimeout(record.retentionTimer);
			record.retentionTimer = void 0;
		}
		for (const off of record.unbinders) off();
		state.streams.delete(id);
		debug$1("freed", state.name, id);
	}
	function maybeFreeStream(state, id) {
		const record = state.streams.get(id);
		if (!record) return;
		if (!record.sink.closed || record.subscribers.size > 0) return;
		const retention = state.options.closedStreamRetention;
		if (retention <= 0) {
			freeStreamNow(state, id);
			return;
		}
		if (record.retentionTimer) return;
		record.retentionTimer = setTimeout(freeStreamNow, retention, state, id);
	}
	function cancelRetention(record) {
		if (record.retentionTimer) {
			clearTimeout(record.retentionTimer);
			record.retentionTimer = void 0;
		}
	}
	rpc.register({
		name: "devframe:streaming:subscribe",
		type: "event",
		handler(channelName, id, opts) {
			const state = channels.get(channelName);
			if (!state) {
				diagnostics$1.DF0030({
					channel: channelName,
					id
				}, { method: "error" });
				return;
			}
			const record = state.streams.get(id);
			if (!record) {
				diagnostics$1.DF0030({
					channel: channelName,
					id
				}, { method: "error" });
				return;
			}
			const session = rpc.getCurrentRpcSession();
			if (!session) return;
			const key = streamKey(channelName, id);
			session.meta.subscribedStreams ??= /* @__PURE__ */ new Set();
			session.meta.subscribedStreams.add(key);
			record.subscribers.add(session.meta);
			cancelRetention(record);
			const afterSeq = opts?.afterSeq ?? 0;
			for (const buffered of record.sink.buffer) if (buffered.seq > afterSeq) rpc.broadcast({
				method: DEVFRAME_EVENTS.broadcast.streamingChunk,
				args: [
					channelName,
					id,
					buffered.seq,
					buffered.chunk
				],
				event: true,
				optional: true,
				filter: (client) => client.$meta === session.meta
			});
			if (record.sink.closed) rpc.broadcast({
				method: DEVFRAME_EVENTS.broadcast.streamingEnd,
				args: [
					channelName,
					id,
					void 0
				],
				event: true,
				optional: true,
				filter: (client) => client.$meta === session.meta
			});
		}
	});
	rpc.register({
		name: "devframe:streaming:unsubscribe",
		type: "event",
		handler(channelName, id) {
			const state = channels.get(channelName);
			const record = state?.streams.get(id);
			const session = rpc.getCurrentRpcSession();
			if (!session) return;
			session.meta.subscribedStreams?.delete(streamKey(channelName, id));
			if (state && record) {
				record.subscribers.delete(session.meta);
				maybeFreeStream(state, id);
			}
		}
	});
	rpc.register({
		name: "devframe:streaming:cancel",
		type: "event",
		handler(channelName, id) {
			const record = findStream(channelName, id);
			if (!record) return;
			const session = rpc.getCurrentRpcSession();
			if (!session) return;
			record.subscribers.delete(session.meta);
			session.meta.subscribedStreams?.delete(streamKey(channelName, id));
			if (record.subscribers.size === 0) record.sink.abort("cancelled by client");
		}
	});
	rpc.register({
		name: "devframe:streaming:upload-chunk",
		type: "event",
		handler(channelName, id, seq, chunk) {
			const record = channels.get(channelName)?.inbound.get(id);
			if (!record) {
				diagnostics$1.DF0030({
					channel: channelName,
					id
				}, { method: "error" });
				return;
			}
			if (!record.uploaderMeta) {
				const session = rpc.getCurrentRpcSession();
				if (session) {
					record.uploaderMeta = session.meta;
					session.meta.uploadingStreams ??= /* @__PURE__ */ new Set();
					session.meta.uploadingStreams.add(streamKey(channelName, id));
				}
			}
			record.reader._push(seq, chunk);
		}
	});
	rpc.register({
		name: "devframe:streaming:upload-end",
		type: "event",
		handler(channelName, id, error) {
			const state = channels.get(channelName);
			const record = state?.inbound.get(id);
			if (!record) return;
			record.reader._end(error);
			if (record.uploaderMeta) record.uploaderMeta.uploadingStreams?.delete(streamKey(channelName, id));
			state?.inbound.delete(id);
		}
	});
	function createChannel(name, opts = {}) {
		if (channels.has(name)) throw diagnostics$1.DF0032({ channel: name });
		const replayWindow = opts.replayWindow ?? 0;
		const state = {
			name,
			options: {
				replayWindow,
				/**
				* Default to a 30-second hold when replay is enabled so late
				* subscribers can join after the producer finishes.
				*/
				closedStreamRetention: opts.closedStreamRetention ?? (replayWindow > 0 ? 3e4 : 0)
			},
			streams: /* @__PURE__ */ new Map(),
			inbound: /* @__PURE__ */ new Map()
		};
		channels.set(name, state);
		function start(startOpts = {}) {
			const sink = createStreamSink({
				id: startOpts.id,
				replayWindow: state.options.replayWindow
			});
			const record = {
				sink,
				subscribers: /* @__PURE__ */ new Set(),
				unbinders: []
			};
			state.streams.set(sink.id, record);
			record.unbinders.push(sink.events.on("chunk", (seq, chunk) => {
				rpc.broadcast({
					method: DEVFRAME_EVENTS.broadcast.streamingChunk,
					args: [
						name,
						sink.id,
						seq,
						chunk
					],
					event: true,
					optional: true,
					filter: (client) => record.subscribers.has(client.$meta)
				});
			}));
			record.unbinders.push(sink.events.on("end", (error) => {
				rpc.broadcast({
					method: DEVFRAME_EVENTS.broadcast.streamingEnd,
					args: [
						name,
						sink.id,
						error
					],
					event: true,
					optional: true,
					filter: (client) => record.subscribers.has(client.$meta)
				});
				maybeFreeStream(state, sink.id);
			}));
			return sink;
		}
		async function pipeFrom(readable, startOpts = {}) {
			const sink = start(startOpts);
			readable.pipeTo(sink.writable, { signal: sink.signal }).catch(() => {});
			return sink;
		}
		function get(id) {
			return state.streams.get(id)?.sink;
		}
		function ids() {
			return Array.from(state.streams.keys());
		}
		function openInbound(inboundOpts = {}) {
			let inboundRecord;
			const reader = createStreamReader({
				id: inboundOpts.id,
				onCancel() {
					const targetMeta = inboundRecord?.uploaderMeta;
					if (!targetMeta) return;
					rpc.broadcast({
						method: DEVFRAME_EVENTS.broadcast.streamingUploadCancel,
						args: [name, reader.id],
						event: true,
						optional: true,
						filter: (client) => client.$meta === targetMeta
					});
				}
			});
			inboundRecord = { reader };
			state.inbound.set(reader.id, inboundRecord);
			debug$1("opened-inbound", name, reader.id);
			return reader;
		}
		return {
			name,
			start,
			pipeFrom,
			get,
			ids,
			openInbound
		};
	}
	function parseKey(key) {
		const sepIdx = key.indexOf(STREAM_KEY_SEPARATOR);
		if (sepIdx < 0) return void 0;
		return {
			channelName: key.slice(0, sepIdx),
			id: key.slice(sepIdx + 1)
		};
	}
	function dropOutboundSubscriptions(meta) {
		if (!meta.subscribedStreams) return;
		for (const key of meta.subscribedStreams) {
			const parsed = parseKey(key);
			const state = parsed && channels.get(parsed.channelName);
			const record = state && parsed && state.streams.get(parsed.id);
			if (!parsed || !state || !record) continue;
			record.subscribers.delete(meta);
			if (record.subscribers.size === 0 && !record.sink.closed) record.sink.abort("all subscribers disconnected");
			maybeFreeStream(state, parsed.id);
		}
		meta.subscribedStreams.clear();
	}
	function endInboundUploads(meta) {
		if (!meta.uploadingStreams) return;
		for (const key of meta.uploadingStreams) {
			const parsed = parseKey(key);
			const state = parsed && channels.get(parsed.channelName);
			const record = state && parsed && state.inbound.get(parsed.id);
			if (!parsed || !state || !record) continue;
			record.reader._end({
				name: "UploadDisconnected",
				message: "Uploader disconnected before completing the stream"
			});
			state.inbound.delete(parsed.id);
		}
		meta.uploadingStreams.clear();
	}
	return {
		create: createChannel,
		_onSessionDisconnected(meta) {
			dropOutboundSubscriptions(meta);
			endInboundUploads(meta);
		}
	};
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
//#region src/node/settings.ts
const STORAGE_SCOPE = {
	global: "global",
	project: "project"
};
/** Resolve reserved settings keys before the sync protocol creates an in-memory state. */
function resolveSettingsState(context, key) {
	const match = /^devframe:settings:(global|project):(.+)$/.exec(key);
	if (!match) return;
	const scope = match[1];
	const namespace = match[2];
	const dir = join(context.host.getStorageDir(STORAGE_SCOPE[scope]), "settings");
	const filepath = join(dir, `${namespace}.json`);
	const path = relative(dir, filepath);
	if (namespace.includes("\0") || path === ".." || path.startsWith("../") || isAbsolute(path)) return;
	return createStorage({
		filepath,
		initialValue: {}
	});
}
function createNodeSettingsStore(context, namespace, scope) {
	const stateKey = `devframe:settings:${scope}:${namespace}`;
	let statePromise;
	function store() {
		if (!statePromise) statePromise = context.rpc.sharedState.get(stateKey);
		return statePromise;
	}
	return createSettingsStore(store);
}
/**
* Build the node-side `settings` surface for a scope namespace. `project`
* persists under the host's `project` storage dir, `global` under its
* `global` dir. Each is a file-backed, client-synced key-value store.
*/
function createNodeSettings(context, namespace) {
	return {
		global: createNodeSettingsStore(context, namespace, "global"),
		project: createNodeSettingsStore(context, namespace, "project")
	};
}
//#endregion
//#region src/node/host-functions.ts
const debugBroadcast = createDebug("devframe:rpc:broadcast");
/**
* Concrete implementation backing `ctx.rpc`. Internal: consumers should
* depend on the structural {@link RpcFunctionsHost} type, never this class.
* Its `@internal` members (`_rpcGroup`, `_asyncStorage`,
* `_emitSessionDisconnected`) are wired by `createContextRpcServer` and must not
* widen the public surface.
*
* @internal
*/
var RpcFunctionsHostImpl = class extends RpcFunctionsCollectorBase {
	/**
	* @internal
	*/
	_rpcGroup = void 0;
	_asyncStorage = void 0;
	constructor(context) {
		super(context);
		this.sharedState = createRpcSharedStateServerHost(this, (key) => resolveSettingsState(context, key));
		this.streaming = createRpcStreamingServerHost(this);
		this.register(defineRpcFunction({
			name: "devframe:rpc:cacheable-functions",
			type: "query",
			handler: () => [...this.definitions.values()].filter((fn) => fn.type === "static" || fn.type === "query" && fn.cacheable === true).map((fn) => fn.name)
		}));
		this.onChanged(() => {
			this.broadcast({
				method: DEVFRAME_EVENTS.broadcast.cacheInvalidate,
				args: []
			});
		});
	}
	sharedState;
	streaming;
	/**
	* Adapters call this from their WS `onDisconnected` hook so downstream
	* hosts (streaming, …) can free per-session state. Public-ish because
	* tests / custom adapters may want to mirror it.
	*
	* @internal
	*/
	_emitSessionDisconnected(meta) {
		this.streaming._onSessionDisconnected(meta);
		removeClientAgentSession(this.context, meta);
	}
	async invokeLocal(method, ...args) {
		if (!this.definitions.has(method)) throw diagnostics$1.DF0006({ name: String(method) });
		const handler = await this.getHandler(method);
		return await Promise.resolve(handler(...args));
	}
	async broadcast(options) {
		if (!this._rpcGroup) return;
		debugBroadcast(JSON.stringify(options.method));
		await Promise.allSettled(this._rpcGroup.clients.map((client) => {
			if (options.filter?.(client) === false) return void 0;
			return client.$callRaw({
				optional: true,
				event: true,
				...options
			});
		}));
	}
	getCurrentRpcSession() {
		if (!this._asyncStorage) throw diagnostics$1.DF0007();
		return this._asyncStorage.getStore();
	}
};
//#endregion
//#region src/node/host-services.ts
const debug = createDebug("devframe:services");
/**
* Per-RPC-host registry of the services already installed against it, keyed
* by the RPC host object. A single wire service can be declared from more
* than one devframe context that shares one RPC host (e.g. a kit that mounts
* a definition alongside another context, so both iterate `def.services`).
* The per-instance `installed` guard can't see across those sibling hosts, so
* the second context would re-run the service factory and re-register its RPC,
* hitting DF0021. Sharing the registry by RPC host makes the first install win
* across every context on that host.
*/
const installedByRpcHost = /* @__PURE__ */ new WeakMap();
function isServiceDefinition(input) {
	return typeof input.setup === "function";
}
function validateServiceInput(input) {
	if (!input || typeof input.package !== "string" || input.package.length === 0) throw diagnostics$1.DF0070({
		package: String(input?.package ?? input),
		reason: "the input has no `package` name"
	});
	if (isServiceDefinition(input)) validateServiceDefinition(input);
}
function validateServiceDefinition(def) {
	if (typeof def.version !== "string" || def.version.length === 0) throw diagnostics$1.DF0070({
		package: def.package,
		reason: "the definition has no `version`"
	});
	if (typeof def.scope !== "string" || def.scope.length === 0) throw diagnostics$1.DF0070({
		package: def.package,
		reason: "the definition has no RPC `scope` namespace"
	});
}
/**
* Merge every installer's option set in declaration order (the default
* deep-merge unions arrays and lets later scalars win; a service may override
* with its own `mergeOptions`).
*/
function mergeInstallerOptions(def, entries) {
	const sets = entries.map((entry) => entry.input.options).filter((options) => options !== void 0);
	if (def.mergeOptions) return def.mergeOptions(sets);
	return sets.length > 0 ? deepMergeOptionSets(sets) : void 0;
}
/**
* Cross-plugin service registry (see `types/services.ts` for the contract).
* Values are held per context instance; `whenAvailable` subscriptions make
* the mechanism work regardless of setup ordering between provider and
* consumer.
*
* On top of the in-process `provide`/`get` tier, this host implements the
* **wire-service** lifecycle: `install()` queues definitions/descriptors,
* `ready()` fires the collect-then-setup barrier: importing descriptor
* packages, merging option sets per service, constructing each service once,
* providing its node API under the package name, and advertising it to
* clients through the `devframe:services` shared state.
*/
var DevframeServicesHostImpl = class {
	context;
	services = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Map();
	pending = /* @__PURE__ */ new Map();
	localInstalled = /* @__PURE__ */ new Map();
	readyPromise;
	constructor(context) {
		this.context = context;
	}
	/**
	* The install-dedup registry, shared across every services host that shares
	* this host's RPC host so the first install of a package wins across sibling
	* contexts. Falls back to a per-instance map when there is no RPC host (a
	* context-less host only exercises the in-process `provide`/`get` tier).
	*/
	get installed() {
		const rpc = this.context?.rpc;
		if (!rpc) return this.localInstalled;
		let registry = installedByRpcHost.get(rpc);
		if (!registry) {
			registry = /* @__PURE__ */ new Map();
			installedByRpcHost.set(rpc, registry);
		}
		return registry;
	}
	provide(id, service) {
		const key = id;
		if (this.services.has(key)) throw diagnostics$1.DF0037({ id: key });
		this.services.set(key, service);
		for (const listener of this.listeners.get(key) ?? []) listener(service);
		return () => {
			if (this.services.get(key) === service) this.services.delete(key);
		};
	}
	get(id) {
		return this.services.get(id);
	}
	has(id) {
		return this.services.has(id);
	}
	whenAvailable(id, callback) {
		const key = id;
		if (this.services.has(key)) callback(this.services.get(key));
		let set = this.listeners.get(key);
		if (!set) {
			set = /* @__PURE__ */ new Set();
			this.listeners.set(key, set);
		}
		const listener = callback;
		set.add(listener);
		return () => {
			set.delete(listener);
		};
	}
	keys() {
		return Array.from(this.services.keys());
	}
	install(input, options) {
		validateServiceInput(input);
		const promise = new Promise((resolve, reject) => {
			const entry = {
				input,
				resolveFrom: options?.resolveFrom,
				resolve,
				reject
			};
			if (this.readyPromise) this.flushPackage(input.package, [entry]).catch(() => {});
			else {
				let entries = this.pending.get(input.package);
				if (!entries) {
					entries = [];
					this.pending.set(input.package, entries);
				}
				entries.push(entry);
			}
		});
		promise.catch(() => {});
		return promise;
	}
	ready() {
		if (this.readyPromise) return this.readyPromise;
		this.readyPromise = this.flushAll();
		return this.readyPromise;
	}
	async flushAll() {
		if (this.context) await this.advertisementState();
		const groups = Array.from(this.pending.entries());
		this.pending.clear();
		for (const [pkg, entries] of groups) await this.flushPackage(pkg, entries);
	}
	async flushPackage(pkg, entries) {
		try {
			const api = await this.installPackage(pkg, entries);
			for (const entry of entries) entry.resolve(api);
			return api;
		} catch (error) {
			for (const entry of entries) entry.reject(error);
			throw error;
		}
	}
	async installPackage(pkg, entries) {
		if (this.installed.has(pkg)) {
			const api = this.installed.get(pkg);
			if (this.services.has(pkg)) diagnostics$1.DF0066({ package: pkg });
			else this.provide(pkg, api);
			return api;
		}
		let def = entries.filter((entry) => isServiceDefinition(entry.input))[0]?.input;
		if (!def) {
			def = await this.importServiceDefinition(pkg, entries);
			if (!def) return void 0;
		}
		this.checkVersionRanges(pkg, def, entries);
		const options = mergeInstallerOptions(def, entries);
		if (!this.context) throw diagnostics$1.DF0070({
			package: pkg,
			reason: "this services host has no node context to install into"
		});
		debug("installing service %s@%s (scope %s)", def.package, def.version, def.scope);
		const scoped = this.context.scope(def.scope);
		const api = await def.setup(scoped, options === void 0 ? {} : { options });
		this.installed.set(pkg, api);
		this.provide(def.package, api);
		await this.advertise(def);
		return api;
	}
	/**
	* Import a descriptor-only package, run its factory, and validate the
	* resulting definition. Returns `undefined` when an optional package can't
	* be imported (the install is skipped); throws for a required one.
	*/
	async importServiceDefinition(pkg, entries) {
		const required = entries.map((entry) => entry.input).some((descriptor) => descriptor.required === true);
		const cwd = this.context?.cwd ?? process.cwd();
		const resolveFroms = [
			...entries.map((entry) => entry.resolveFrom && expandResolveFrom(entry.resolveFrom, cwd)),
			this.context?.workspaceRoot,
			cwd
		];
		let mod;
		try {
			mod = await importServicePackage(pkg, resolveFroms);
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			if (required) throw diagnostics$1.DF0067({
				package: pkg,
				reason,
				cause: error
			});
			debug("optional service %s not importable, skipping: %s", pkg, reason);
			return;
		}
		const factory = mod.default;
		if (typeof factory !== "function") throw diagnostics$1.DF0070({
			package: pkg,
			reason: "its default export is not a factory function"
		});
		let def = await factory();
		if (!def || typeof def.setup !== "function") throw diagnostics$1.DF0070({
			package: pkg,
			reason: "its factory did not return a definition with a `setup` function"
		});
		if (typeof def.package !== "string" || def.package.length === 0) def = {
			...def,
			package: pkg
		};
		validateServiceDefinition(def);
		return def;
	}
	/** Version-range checks against the resolved definition's real version. */
	checkVersionRanges(pkg, def, entries) {
		for (const entry of entries) {
			const descriptor = entry.input;
			if (isServiceDefinition(entry.input) || typeof descriptor.version !== "string") continue;
			if (satisfiesVersionRange(def.version, descriptor.version)) continue;
			if (descriptor.required === true) throw diagnostics$1.DF0068({
				package: pkg,
				required: descriptor.version,
				installed: def.version
			});
			diagnostics$1.DF0069({
				package: pkg,
				required: descriptor.version,
				installed: def.version
			});
		}
	}
	advertisementState() {
		return this.context.rpc.sharedState.get(DEVFRAME_SERVICES_STATE_KEY, { initialValue: {} });
	}
	async advertise(def) {
		const state = await this.advertisementState();
		const { package: pkg, version, scope, meta } = def;
		state.mutate((value) => {
			value[pkg] = {
				package: pkg,
				version,
				scope,
				...meta ? { meta } : {}
			};
		});
	}
};
//#endregion
//#region src/node/host-views.ts
var DevframeViewHost = class {
	context;
	importMetaUrl;
	/**
	* @internal
	*/
	buildStaticDirs = [];
	constructor(context, importMetaUrl) {
		this.context = context;
		this.importMetaUrl = importMetaUrl;
	}
	hostStatic(baseUrl, source, defaultResolveFrom = this.importMetaUrl) {
		const resolved = resolveStaticAssetsSource(source, this.context.host.getStorageDir("project"), defaultResolveFrom);
		if (typeof resolved === "string" && !existsSync(resolved)) throw diagnostics$1.DF0008({ distDir: resolved });
		this.buildStaticDirs.push({
			baseUrl,
			source,
			resolveFrom: defaultResolveFrom
		});
		this.context.host.mountStatic(baseUrl, resolved);
	}
};
//#endregion
//#region src/node/rpc/agent-invoke-tool.ts
const agentInvokeTool = defineRpcFunction({
	name: "devframe:agent:invoke-tool",
	type: "action",
	setup: (ctx) => {
		return { async handler(id, args) {
			return await ctx.agent.invoke(id, args);
		} };
	}
});
//#endregion
//#region src/node/rpc/agent-list-resources.ts
const agentListResources = defineRpcFunction({
	name: "devframe:agent:list-resources",
	type: "query",
	jsonSerializable: true,
	setup: (ctx) => {
		return { async handler() {
			return ctx.agent.list().resources;
		} };
	}
});
//#endregion
//#region src/node/rpc/index.ts
/**
* Built-in agent introspection RPC functions. Registered automatically
* by `createHostContext`. Not themselves agent-exposed (no `agent`
* field); they power the MCP adapter and any future agent CLI.
*/
const BUILTIN_AGENT_RPC = [
	defineRpcFunction({
		name: "devframe:agent:list-tools",
		type: "query",
		jsonSerializable: true,
		setup: (ctx) => {
			return { async handler() {
				return ctx.agent.list().tools;
			} };
		}
	}),
	agentInvokeTool,
	agentListResources,
	defineRpcFunction({
		name: "devframe:agent:read-resource",
		type: "query",
		jsonSerializable: true,
		setup: (ctx) => {
			return { async handler(id) {
				return await ctx.agent.read(id);
			} };
		}
	}),
	defineRpcFunction({
		name: "devframe:agent:sync-client-tools",
		type: "action",
		jsonSerializable: true,
		setup: (context) => ({ handler(clientId, tools) {
			const session = context.rpc.getCurrentRpcSession();
			if (session) syncClientAgentTools(context, session, clientId, tools);
		} })
	})
];
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
//#region src/node/scope.ts
function prefixDefinition(namespace, fn) {
	if (isQualifiedName(fn.name)) throw diagnostics$1.DF0034({
		namespace,
		name: fn.name
	});
	return {
		...fn,
		name: `${namespace}:${fn.name}`
	};
}
/**
* Build a namespace-scoped view of a {@link DevframeNodeContext}. Every
* RPC id, shared-state key, and streaming channel passed through the
* returned `rpc` surface is auto-namespaced with `<namespace>:`.
*/
function createScopedNodeContext(context, namespace) {
	const base = context.rpc;
	const rpc = {
		namespace,
		register(fn, force) {
			base.register(prefixDefinition(namespace, fn), force);
		},
		update(fn, force) {
			base.update(prefixDefinition(namespace, fn), force);
		},
		call: ((method, ...args) => base.invokeLocal(qualifyName(namespace, method), ...args)),
		broadcast: ((options) => base.broadcast({
			...options,
			method: qualifyName(namespace, options.method)
		})),
		sharedState: ((key, options) => base.sharedState.get(qualifyName(namespace, key), options)),
		streaming: { create: (name, opts) => base.streaming.create(qualifyName(namespace, name), opts) },
		getCurrentRpcSession: () => base.getCurrentRpcSession()
	};
	return {
		namespace,
		base: context,
		cwd: context.cwd,
		workspaceRoot: context.workspaceRoot,
		mode: context.mode,
		host: context.host,
		rpc,
		settings: createNodeSettings(context, namespace),
		views: context.views,
		diagnostics: context.diagnostics,
		agent: context.agent,
		scope: context.scope
	};
}
//#endregion
//#region src/node/context.ts
/**
* Framework- and build-tool-agnostic core of the Devframe node context.
* Wires the RPC host, view (HTTP file-serving) host, diagnostics, and
* agent subsystems. Host adapters can wrap this to augment `ctx` with
* extra surfaces; for example, `@vitejs/devtools-kit`'s
* `createKitContext` attaches `docks`, `terminals`, `messages`, and
* `commands` when mounted into Vite DevTools.
*/
async function createHostContext(options) {
	const { cwd, workspaceRoot = cwd, mode, host, importMetaUrl, builtinRpcDeclarations = [] } = options;
	const context = {
		cwd,
		workspaceRoot,
		mode,
		host,
		rpc: void 0,
		views: void 0,
		diagnostics: void 0,
		agent: void 0,
		services: void 0,
		staticConfig: {},
		scope: void 0
	};
	const rpcHost = new RpcFunctionsHostImpl(context);
	const viewsHost = new DevframeViewHost(context, importMetaUrl);
	const diagnosticsHost = new DevframeDiagnosticsHost(context, [diagnostics$1, diagnostics]);
	context.rpc = rpcHost;
	context.views = viewsHost;
	context.diagnostics = diagnosticsHost;
	context.services = new DevframeServicesHostImpl(context);
	context.agent = new DevframeAgentHost(context);
	const scopedCache = /* @__PURE__ */ new Map();
	context.scope = ((namespace) => {
		if (!namespace) return context;
		let scoped = scopedCache.get(namespace);
		if (!scoped) {
			scoped = createScopedNodeContext(context, namespace);
			scopedCache.set(namespace, scoped);
		}
		return scoped;
	});
	for (const fn of BUILTIN_AGENT_RPC) rpcHost.register(fn);
	for (const fn of builtinRpcDeclarations) rpcHost.register(fn);
	return context;
}
//#endregion
export { createHostContext as t };
