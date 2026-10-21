import { nanoid } from "./utils/nanoid.mjs";
import { n as onBrowserAgentToolsChanged, t as listBrowserAgentTools } from "./browser-agent-Pu-FLk6I.mjs";
//#region src/client/client-id.ts
const CLIENT_ID_STORAGE_KEY = "devframe:client-id";
let memoryClientId;
/**
* This browser tab's stable client id: one nanoid per tab, persisted in
* `sessionStorage` so it survives page reloads and RPC reconnects. The node
* side uses it to tell connected tabs apart across reconnects (see #394).
*
* Tab duplication copies `sessionStorage`, so two tabs can briefly share an id
* until per-tab disambiguation lands with the wider tab-metadata work.
*/
function resolveClientId(win = globalThis.window) {
	try {
		const storage = win?.sessionStorage;
		if (storage) {
			let id = storage.getItem(CLIENT_ID_STORAGE_KEY);
			if (!id) {
				id = nanoid();
				storage.setItem(CLIENT_ID_STORAGE_KEY, id);
			}
			return id;
		}
	} catch {}
	memoryClientId ??= nanoid();
	return memoryClientId;
}
//#endregion
//#region src/client/browser-agent-rpc.ts
/** Mirror this document's browser-agent registry over its existing RPC connection. */
function setupBrowserAgentRpcBridge(rpc) {
	rpc.client.register({
		name: "devframe:agent:invoke-client-tool",
		type: "action",
		jsonSerializable: true,
		handler: async (id, args) => {
			const tool = listBrowserAgentTools().find((tool) => tool.id === id);
			if (!tool) throw new Error(`[devframe/agent] browser tool "${id}" not found`);
			return await tool.invoke(args);
		}
	});
	let queued = false;
	let disposed = false;
	let lastSyncedCount = 0;
	const sync = () => {
		if (queued || disposed) return;
		queued = true;
		queueMicrotask(async () => {
			queued = false;
			if (disposed) return;
			const manifests = listBrowserAgentTools().map(({ invoke: _, ...manifest }) => manifest);
			if (manifests.length === 0 && lastSyncedCount === 0) return;
			lastSyncedCount = manifests.length;
			await rpc.callOptional("devframe:agent:sync-client-tools", resolveClientId(), manifests).catch(() => {});
		});
	};
	const stopTools = onBrowserAgentToolsChanged(sync);
	const stopConnection = rpc.events.on("connection:status", (status) => {
		if (status === "connected") sync();
	});
	sync();
	return () => {
		disposed = true;
		stopTools();
		stopConnection();
	};
}
//#endregion
export { setupBrowserAgentRpcBridge };
