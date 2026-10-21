//#region src/rpc/transports/session.ts
let sessionId = 0;
/**
* Mint the per-connection session meta every transport binding shares:
* one id space across transports, so session bookkeeping (streaming
* subscriptions, shared-state sync, auth trust) never collides between a
* WS peer and an SSE session on the same server.
*/
function createRpcSessionMeta() {
	return {
		id: sessionId++,
		subscribedStates: /* @__PURE__ */ new Set()
	};
}
//#endregion
export { createRpcSessionMeta as t };
