import { t as isAllowedOrigin } from "../../origin-DZit9g29.mjs";
import { createWsRpcPeerHooks } from "./ws-server.mjs";
//#region src/rpc/transports/ws-bun.ts
/**
* The Bun fetch-upgrade WebSocket tier for `initDevframe` / `initHub`: the
* same RPC peer wiring as `attachWsRpcTransport`, driven by crossws's Bun
* adapter so upgrades complete through `handler(request, server)` on the
* app's own origin, with no side-car server. Load it dynamically so the Bun
* adapter never enters a Node-only bundle path.
*/
async function attachBunWsTransport(core, options = {}) {
	const { default: bunAdapter } = await import("crossws/adapters/bun");
	const { allowedOrigins } = options;
	const ws = bunAdapter({ hooks: {
		...createWsRpcPeerHooks(core.rpcGroup, {
			onConnected: core.onConnected,
			onDisconnected: core.onDisconnected
		}),
		/**
		* The same origin policy `routeUpgrades` applies for the Node
		* transport, enforced at the upgrade hook since Bun upgrades arrive
		* as fetch requests rather than `upgrade` socket events.
		*/
		upgrade(request) {
			const origin = request.headers.get("origin") ?? void 0;
			const allowed = allowedOrigins && !Array.isArray(allowedOrigins) ? allowedOrigins.isAllowed(origin) : isAllowedOrigin(origin, allowedOrigins || []);
			if (allowedOrigins !== false && !allowed) return new Response("Forbidden", { status: 403 });
		}
	} });
	return {
		handleUpgrade: (request, server) => ws.handleUpgrade(request, server),
		websocket: ws.websocket,
		close: () => ws.close()
	};
}
//#endregion
export { attachBunWsTransport };
