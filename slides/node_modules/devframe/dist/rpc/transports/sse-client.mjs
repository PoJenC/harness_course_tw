import { DEVFRAME_AUTH_TOKEN_QUERY_PARAM, DEVFRAME_SSE_SESSION_HEADER } from "../../constants.mjs";
import { t as createRpcWireCodec } from "../../wire-codec-B1W3zH3L.mjs";
//#region src/rpc/transports/sse-client.ts
function NOOP() {}
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
	const { onConnected = NOOP, onError = NOOP, onDisconnected = NOOP, definitions, fetch: fetchImpl = globalThis.fetch.bind(globalThis) } = options;
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
export { createSseRpcChannel };
