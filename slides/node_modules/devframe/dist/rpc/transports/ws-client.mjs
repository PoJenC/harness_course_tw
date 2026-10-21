import { DEVFRAME_AUTH_TOKEN_QUERY_PARAM } from "../../constants.mjs";
import { t as createRpcWireCodec } from "../../wire-codec-B1W3zH3L.mjs";
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
export { createWsRpcChannel };
