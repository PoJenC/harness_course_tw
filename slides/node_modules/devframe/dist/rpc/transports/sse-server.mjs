import { DEVFRAME_SSE_SESSION_HEADER } from "../../constants.mjs";
import { n as peekRpcWireFrame, t as createRpcWireCodec } from "../../wire-codec-B1W3zH3L.mjs";
import { t as isAllowedOrigin } from "../../origin-DZit9g29.mjs";
import { t as createRpcSessionMeta } from "../../session-DPfj6zQG.mjs";
//#region src/rpc/transports/sse-server.ts
const SSE_STREAM_HEADERS = {
	"content-type": "text/event-stream",
	"cache-control": "no-cache, no-transform",
	/** Tell buffering reverse proxies (nginx) to pass frames through as-is. */
	"x-accel-buffering": "no"
};
function NOOP() {}
/**
* Attach an SSE + HTTP POST transport to an existing RPC group: the
* WebSocket-free counterpart to `attachWsRpcTransport`, for hosts and
* proxies where the upgrade isn't available. Speaks the same birpc wire
* protocol (one channel per session, per-method `jsonSerializable`
* dispatch) over a half-duplex pair, mirroring birpc's own SSE helpers:
*
*  - the server mints a session id as the stream's first frame
*    (`event: session`);
*  - every client `POST` echoes it in the `x-birpc-session` header;
*  - a client-initiated request's response comes back in that `POST`'s
*    own body (parked until the handler answers);
*  - server-initiated calls/events stream down as `event: message`
*    frames, and the client's replies up via `POST` get a bare `202`.
*/
function attachSseRpcTransport(rpcGroup, options = {}) {
	const { allowedOrigins, definitions, onConnected = NOOP, onDisconnected = NOOP, keepAliveInterval = 3e4, generateSessionId = () => crypto.randomUUID() } = options;
	const sessions = /* @__PURE__ */ new Map();
	const encoder = new TextEncoder();
	function originAllowed(request) {
		if (allowedOrigins === false) return true;
		const origin = request.headers.get("origin") ?? void 0;
		return allowedOrigins && !Array.isArray(allowedOrigins) ? allowedOrigins.isAllowed(origin) : isAllowedOrigin(origin, allowedOrigins ?? []);
	}
	/**
	* CORS headers for a browser on another (allowed) origin: the side-car /
	* registered-viewer case. Same-origin requests carry no `Origin` (or their
	* own), where these headers are inert.
	*/
	function corsHeaders(request) {
		const origin = request.headers.get("origin");
		if (!origin) return {};
		return {
			"access-control-allow-origin": origin,
			"vary": "origin"
		};
	}
	function openStream(request) {
		const meta = createRpcSessionMeta();
		const id = generateSessionId();
		const codec = createRpcWireCodec(definitions);
		let controller;
		let keepAlive;
		let closeSession = () => {};
		function write(text) {
			try {
				controller?.enqueue(encoder.encode(text));
			} catch {
				closeSession();
			}
		}
		function writeEvent(event, data) {
			write(`event: ${event}\n${data.split("\n").map((line) => `data: ${line}`).join("\n")}\n\n`);
		}
		const session = {
			id,
			meta,
			parked: /* @__PURE__ */ new Map(),
			closed: false,
			close: () => {
				if (session.closed) return;
				session.closed = true;
				if (keepAlive) clearInterval(keepAlive);
				sessions.delete(id);
				for (const resolve of session.parked.values()) resolve(null);
				session.parked.clear();
				try {
					controller?.close();
				} catch {}
				rpcGroup.updateChannels((channels) => {
					const index = session.channel ? channels.indexOf(session.channel) : -1;
					if (index >= 0) channels.splice(index, 1);
				});
				onDisconnected(session.connection, meta);
			}
		};
		closeSession = session.close;
		const connection = {
			id: meta.id,
			transport: "sse",
			request,
			send: (data) => writeEvent("message", data),
			close: () => session.close()
		};
		session.connection = connection;
		const channel = {
			post: (data) => {
				const { t, i } = peekRpcWireFrame(data);
				if (t === "s" && i) {
					const resolve = session.parked.get(i);
					if (resolve) {
						session.parked.delete(i);
						resolve(data);
						return;
					}
				}
				writeEvent("message", data);
			},
			on: (fn) => {
				session.onMessage = fn;
			},
			serialize: codec.serialize,
			deserialize: codec.deserialize,
			meta
		};
		session.channel = channel;
		const body = new ReadableStream({
			start(c) {
				controller = c;
				sessions.set(id, session);
				rpcGroup.updateChannels((channels) => {
					channels.push(channel);
				});
				write(`event: session\ndata: ${id}\n\n`);
				if (keepAliveInterval > 0) {
					keepAlive = setInterval(write, keepAliveInterval, ": ping\n\n");
					keepAlive.unref?.();
				}
				onConnected(connection, meta);
			},
			cancel() {
				session.close();
			}
		});
		return new Response(body, {
			status: 200,
			headers: {
				...SSE_STREAM_HEADERS,
				...corsHeaders(request)
			}
		});
	}
	async function handlePost(request) {
		const id = request.headers.get(DEVFRAME_SSE_SESSION_HEADER);
		const session = id ? sessions.get(id) : void 0;
		if (!session || session.closed) return new Response("Unknown SSE session", {
			status: 400,
			headers: corsHeaders(request)
		});
		const frame = await request.text();
		const { t, i } = peekRpcWireFrame(frame);
		if (t === "q" && i) {
			const parked = new Promise((resolve) => {
				session.parked.set(i, resolve);
			});
			session.onMessage?.(frame);
			const responseBody = await parked;
			if (responseBody == null) return new Response("SSE session closed before the response settled", {
				status: 409,
				headers: corsHeaders(request)
			});
			return new Response(responseBody, {
				status: 200,
				headers: {
					"content-type": "text/plain; charset=utf-8",
					...corsHeaders(request)
				}
			});
		}
		session.onMessage?.(frame);
		return new Response(null, {
			status: 202,
			headers: corsHeaders(request)
		});
	}
	function handlePreflight(request) {
		return new Response(null, {
			status: 204,
			headers: {
				"access-control-allow-methods": "GET, POST, OPTIONS",
				"access-control-allow-headers": `content-type, ${DEVFRAME_SSE_SESSION_HEADER}`,
				"access-control-max-age": "86400",
				...corsHeaders(request)
			}
		});
	}
	return {
		handler: (request) => {
			if (!originAllowed(request)) return new Response("Forbidden", { status: 403 });
			switch (request.method) {
				case "GET": return openStream(request);
				case "POST": return handlePost(request);
				case "OPTIONS": return handlePreflight(request);
				default: return new Response("Method Not Allowed", {
					status: 405,
					headers: { allow: "GET, POST, OPTIONS" }
				});
			}
		},
		sessionCount: () => sessions.size,
		close: () => {
			for (const session of [...sessions.values()]) session.close();
		}
	};
}
//#endregion
export { attachSseRpcTransport };
