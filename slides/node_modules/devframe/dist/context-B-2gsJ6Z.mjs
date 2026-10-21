import { n as randomToken } from "./crypto-token-TVbGGFuj.mjs";
import { t as createStorage } from "./storage-BQy9865B.mjs";
import { n as revokeAuthToken, t as revokeActiveConnectionsForToken } from "./revoke-CeQUo6KI.mjs";
import { join } from "pathe";
//#region src/node/hub-internals/context.ts
const internalContextMap = /* @__PURE__ */ new WeakMap();
function getInternalContext(context) {
	if (!internalContextMap.has(context)) {
		const storage = createStorage({
			filepath: join(context.host.getStorageDir("global"), "auth.json"),
			initialValue: { trusted: {} }
		});
		const remoteTokens = /* @__PURE__ */ new Map();
		const wsEndpointListeners = /* @__PURE__ */ new Set();
		function revokeRemoteToken(token) {
			if (!remoteTokens.delete(token)) return;
			revokeActiveConnectionsForToken(context, token);
		}
		const internalContext = {
			storage: { auth: storage },
			revokeAuthToken: (token) => revokeAuthToken(context, storage, token),
			setWsEndpoint(endpoint) {
				internalContext.wsEndpoint = endpoint;
				for (const listener of wsEndpointListeners) listener();
			},
			onWsEndpointChange(cb) {
				wsEndpointListeners.add(cb);
				return () => wsEndpointListeners.delete(cb);
			},
			remoteTokens,
			allocateRemoteToken(dockId, origin, originLock) {
				const token = randomToken();
				remoteTokens.set(token, {
					dockId,
					origin,
					originLock
				});
				return token;
			},
			revokeRemoteToken,
			revokeRemoteTokensForDock(dockId) {
				const tokensToRevoke = [];
				for (const [token, record] of remoteTokens) if (record.dockId === dockId) tokensToRevoke.push(token);
				for (const token of tokensToRevoke) revokeRemoteToken(token);
			},
			isRemoteTokenTrusted(token, requestOrigin) {
				const record = remoteTokens.get(token);
				if (!record) return false;
				if (!record.originLock) return true;
				return !!requestOrigin && record.origin === requestOrigin;
			}
		};
		internalContextMap.set(context, internalContext);
	}
	return internalContextMap.get(context);
}
//#endregion
export { internalContextMap as n, getInternalContext as t };
