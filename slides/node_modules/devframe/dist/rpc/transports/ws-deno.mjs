import { t as isAllowedOrigin } from "../../origin-DZit9g29.mjs";
import { createWsRpcPeerHooks } from "./ws-server.mjs";
//#region src/rpc/transports/ws-deno.ts
/**
* The Deno fetch-upgrade WebSocket tier for `initDevframe` / `initHub`: the
* same RPC peer wiring as `attachWsRpcTransport`, driven by crossws's Deno
* adapter so upgrades complete through `handleUpgrade(request, info)` on the
* app's own origin, with no side-car server. Load it dynamically so the Deno
* adapter never enters a Node-only bundle path.
*/
async function attachDenoWsTransport(core, options = {}) {
	const { default: denoAdapter } = await import("crossws/adapters/deno");
	const { allowedOrigins } = options;
	const ws = denoAdapter({ hooks: {
		...createWsRpcPeerHooks(core.rpcGroup, {
			onConnected: core.onConnected,
			onDisconnected: core.onDisconnected
		}),
		/**
		* The same origin policy `routeUpgrades` applies for the Node
		* transport, enforced at the upgrade hook since Deno upgrades arrive
		* as fetch requests rather than `upgrade` socket events.
		*/
		upgrade(request) {
			const origin = request.headers.get("origin") ?? void 0;
			const allowed = allowedOrigins && !Array.isArray(allowedOrigins) ? allowedOrigins.isAllowed(origin) : isAllowedOrigin(origin, allowedOrigins || []);
			if (allowedOrigins !== false && !allowed) return new Response("Forbidden", { status: 403 });
		}
	} });
	return {
		handleUpgrade: (request, info) => ws.handleUpgrade(request, info),
		close: () => ws.close()
	};
}
//#endregion
export { attachDenoWsTransport };
