import { FRAME_NAV_CHANNEL, FRAME_NAV_VERSION, attachFrameNavClient as attachDevToolsFrameNav, connectRemoteDevframe as connectRemoteDevTools, getDevframeRpcClient, parseRemoteConnection } from "@devframes/hub/client";
//#region src/client/connection.ts
/**
* The Vite DevTools flavour of devframe's {@link getDevframeRpcClient}. Kept as
* a dedicated export for naming symmetry with the kit's other `DevTools*`
* primitives.
*
* Vite DevTools mounts each devframe (Terminals, the Inspector, …) as a
* same-origin iframe at its own base (e.g. `/__devframes-plugin-terminals/`).
* Cross-base connection-meta inheritance — a child iframe reusing the parent's
* `__connection.json` without dialing its own base's (wrong) endpoint — is
* handled natively by devframe's client via `ConnectionMeta.baseUrl` since
* devframe 0.7.2 (devframes/devframe#98), so no extra rewriting is needed here.
*
* Vite DevTools provides its own interactive authorization view, so disable
* devframe's native browser-prompt fallback for every kit-managed connection.
*/
function getDevToolsRpcClient(options = {}) {
	return getDevframeRpcClient({
		...options,
		simpleAuth: false
	});
}
//#endregion
//#region src/client/context.ts
const CLIENT_CONTEXT_KEY = "__VITE_DEVTOOLS_CLIENT_CONTEXT__";
/**
* Get the global DevTools client context, or `undefined` if not yet initialized.
*/
function getDevToolsClientContext() {
	return globalThis[CLIENT_CONTEXT_KEY];
}
//#endregion
export { CLIENT_CONTEXT_KEY, FRAME_NAV_CHANNEL, FRAME_NAV_VERSION, attachDevToolsFrameNav, connectRemoteDevTools, getDevToolsClientContext, getDevToolsRpcClient, parseRemoteConnection };
