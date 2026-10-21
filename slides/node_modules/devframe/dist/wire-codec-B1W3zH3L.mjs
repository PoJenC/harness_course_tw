import { n as strictJsonStringify } from "./serialization-BhuOoL80.mjs";
import { n as structuredCloneStringify, t as structuredCloneParse } from "./structured-clone-CbAV5rFI.mjs";
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
/**
* Peek at a wire frame's birpc envelope without engaging a codec's
* request-id bookkeeping; used by the SSE transport to route a frame
* (park a POST for its response / answer with a bare 202) before it is
* handed to birpc proper.
*
* @internal
*/
function peekRpcWireFrame(raw) {
	try {
		const msg = raw.startsWith("s:") ? structuredCloneParse(raw.slice(2)) : JSON.parse(raw);
		return {
			t: msg?.t,
			i: msg?.i
		};
	} catch {
		return {};
	}
}
//#endregion
export { peekRpcWireFrame as n, createRpcWireCodec as t };
