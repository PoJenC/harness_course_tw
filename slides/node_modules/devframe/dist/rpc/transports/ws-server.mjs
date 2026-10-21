import "../../constants.mjs";
import { t as createRpcWireCodec } from "../../wire-codec-B1W3zH3L.mjs";
import { n as isLoopbackHostname, t as isAllowedOrigin } from "../../origin-DZit9g29.mjs";
import { t as createRpcSessionMeta } from "../../session-DPfj6zQG.mjs";
import { n as randomToken, r as timingSafeEqual } from "../../crypto-token-TVbGGFuj.mjs";
import { createServer } from "node:http";
import { createServer as createServer$1 } from "node:https";
import crossws from "crossws/adapters/node";
//#region src/rpc/transports/ws-server.ts
/**
* Create a live, token-protected origin allowlist for external browser
* viewers. Pass it to {@link WsRpcTransportOptions.allowedOrigins}, then use
* `registerFromUrl()` in the connection metadata handler to authorize a
* viewer without sharing a mutable array or disabling DNS-rebinding protection.
*/
function createWsOriginRegistry(options = {}) {
	const token = randomToken();
	const origins = new Set(options.allowedOrigins ?? []);
	function normalizeOrigin(origin) {
		if (!origin) return;
		try {
			const url = new URL(origin);
			const normalized = url.origin === "null" ? `${url.protocol}//${url.host}` : url.origin;
			return origin === normalized ? normalized : void 0;
		} catch {}
	}
	function registerOrigin(origin, candidateToken) {
		const normalized = normalizeOrigin(origin);
		if (!normalized || !candidateToken || !timingSafeEqual(token, candidateToken)) return false;
		if (options.validateOrigin && !options.validateOrigin(normalized)) return false;
		origins.add(normalized);
		return true;
	}
	return {
		token,
		registerFromUrl(url) {
			let parsed;
			try {
				parsed = new URL(url, "http://localhost");
			} catch {
				return;
			}
			const origin = parsed.searchParams.get("devframe_viewer_origin") ?? void 0;
			return registerOrigin(origin, parsed.searchParams.get("devframe_viewer_origin_token") ?? void 0) ? origin : void 0;
		},
		isAllowed(origin) {
			return isAllowedOrigin(origin, [...origins]);
		}
	};
}
const EMPTY_DEFS = /* @__PURE__ */ new Map();
function NOOP() {}
function listen(server, port, host) {
	return new Promise((resolve, reject) => {
		const onError = (error) => reject(error);
		server.once("error", onError);
		try {
			server.listen(port, host, () => {
				server.off("error", onError);
				resolve();
			});
		} catch (error) {
			server.off("error", onError);
			reject(error);
		}
	});
}
/** Compare two URL paths ignoring a trailing slash. */
function pathMatches(a, b) {
	const strip = (p) => p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
	return strip(a) === strip(b);
}
function isWsOriginRegistry(value) {
	return !!value && !Array.isArray(value);
}
/**
* Build the `upgrade` listener that hands a request to the crossws adapter,
* optionally filtered to a single `path`. Non-matching requests are left
* untouched so other upgrade listeners (e.g. a Vite dev server's HMR socket)
* can claim them, unless `destroyUnmatched` is set.
*/
function createUpgradeListener(ws, path, destroyUnmatched, allowedOrigins) {
	return (req, socket, head) => {
		socket.on("error", () => {});
		if (path) {
			let pathname = req.url ?? "/";
			try {
				pathname = new URL(req.url ?? "/", "http://localhost").pathname;
			} catch {}
			if (!pathMatches(pathname, path)) {
				if (destroyUnmatched) {
					socket.write("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
					socket.destroy();
				}
				return;
			}
		}
		const originAllowed = isWsOriginRegistry(allowedOrigins) ? allowedOrigins.isAllowed(req.headers.origin) : isAllowedOrigin(req.headers.origin, allowedOrigins || []);
		if (allowedOrigins !== false && !originAllowed) {
			socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
			socket.destroy();
			return;
		}
		ws.handleUpgrade(req, socket, head);
	};
}
/**
* The per-peer lifecycle hooks driving a devframe RPC WebSocket, shaped for
* any [crossws](https://crossws.h3.dev) adapter. {@link attachWsRpcTransport}
* feeds them to the Node adapter; runtime-specific attachments (e.g. Bun's
* fetch-upgrade adapter) reuse the same hooks so every transport speaks the
* identical wire protocol: one birpc channel per peer, per-method
* `jsonSerializable` dispatch between strict JSON and structured-clone.
*/
function createWsRpcPeerHooks(rpcGroup, options = {}) {
	const { onConnected = NOOP, onDisconnected = NOOP, definitions = EMPTY_DEFS, serialize: serializeOverride, deserialize: deserializeOverride } = options;
	const states = /* @__PURE__ */ new WeakMap();
	return {
		open: (peer) => {
			const meta = createRpcSessionMeta();
			meta.peer = peer;
			const connection = {
				id: meta.id,
				transport: "websocket",
				request: peer.request,
				send: (data) => peer.send(data),
				close: (code, reason) => peer.close(code, reason),
				peer
			};
			const codec = createRpcWireCodec(definitions);
			const state = {
				meta,
				connection
			};
			const channel = {
				post: (data) => {
					peer.send(data);
				},
				on: (fn) => {
					state.onMessage = fn;
				},
				serialize: serializeOverride ?? codec.serialize,
				deserialize: deserializeOverride ?? codec.deserialize,
				meta
			};
			state.channel = channel;
			states.set(peer, state);
			rpcGroup.updateChannels((channels) => {
				channels.push(channel);
			});
			onConnected(connection, meta);
		},
		message: (peer, message) => {
			states.get(peer)?.onMessage?.(message.text());
		},
		close: (peer) => {
			const state = states.get(peer);
			if (!state) return;
			states.delete(peer);
			rpcGroup.updateChannels((channels) => {
				const index = state.channel ? channels.indexOf(state.channel) : -1;
				if (index >= 0) channels.splice(index, 1);
			});
			onDisconnected(state.connection, state.meta);
		}
	};
}
/**
* Attach a WebSocket transport to an existing RPC group, powered by
* [crossws](https://crossws.h3.dev). Either attach to an existing HTTP(S)
* `server` (sharing its port, optionally scoped to a `path`), or let this
* helper create a standalone server from `port` / `host` / `https`.
*
* Returns the crossws node adapter, standalone-server readiness/address
* accessors, `detach` (remove the upgrade listener from a shared `server`),
* and `close` (full deterministic teardown).
*/
function attachWsRpcTransport(rpcGroup, options = {}) {
	const { server, port, host = "localhost", path, destroyUnmatched = false, unbound, https, allowedOrigins } = options;
	const ws = crossws({ hooks: createWsRpcPeerHooks(rpcGroup, options) });
	const sharedUpgradeListener = createUpgradeListener(ws, path, destroyUnmatched, allowedOrigins);
	const ownedUpgradeListener = createUpgradeListener(ws, path, true, allowedOrigins);
	/** Bind a server's `upgrade` events, tracked so `close()` detaches them. */
	const attachments = /* @__PURE__ */ new Set();
	function attachTo(target, listener) {
		target.on("upgrade", listener);
		const detachOne = () => {
			target.off("upgrade", listener);
			attachments.delete(detachOne);
		};
		attachments.add(detachOne);
		return detachOne;
	}
	let ready = Promise.resolve();
	let ownedServer;
	if (unbound) {} else if (server) attachTo(server, sharedUpgradeListener);
	else if (https) {
		ownedServer = createServer$1(https);
		attachTo(ownedServer, ownedUpgradeListener);
		ready = listen(ownedServer, port ?? 0, host);
	} else {
		ownedServer = createServer((_req, res) => {
			res.writeHead(426, { "content-type": "text/plain" });
			res.end("Upgrade Required");
		});
		attachTo(ownedServer, ownedUpgradeListener);
		ready = listen(ownedServer, port ?? 0, host);
	}
	const activeServer = server ?? ownedServer;
	function detachAll() {
		for (const detachOne of [...attachments]) detachOne();
	}
	return {
		ws,
		ready,
		address: () => activeServer?.address() ?? null,
		handleUpgrade: sharedUpgradeListener,
		attach: (target) => attachTo(target, sharedUpgradeListener),
		detach: detachAll,
		async close() {
			detachAll();
			ws.closeAll(void 0, void 0, true);
			if (ownedServer) {
				const srv = ownedServer;
				await ready.catch(() => {});
				if (!srv.listening) return;
				await new Promise((r) => srv.close(() => r()));
			}
		}
	};
}
//#endregion
export { attachWsRpcTransport, createWsOriginRegistry, createWsRpcPeerHooks, isAllowedOrigin, isLoopbackHostname };
