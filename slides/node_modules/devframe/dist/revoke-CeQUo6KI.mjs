import { t as DEVFRAME_EVENTS } from "./events-0wDwalmL.mjs";
//#region src/node/auth/revoke.ts
/**
* Flip `isTrusted` to false on any live WS clients connected with `token`
* and broadcast the `auth:revoked` event so they can react.
*
* Shared between persisted-auth revocation and remote-dock token revocation.
*/
async function revokeActiveConnectionsForToken(context, token) {
	const rpcHost = context.rpc;
	if (!rpcHost?._rpcGroup) return;
	const affectedSessionIds = /* @__PURE__ */ new Set();
	for (const client of rpcHost._rpcGroup.clients) if (client.$meta.clientAuthToken === token) {
		affectedSessionIds.add(client.$meta.id);
		client.$meta.isTrusted = false;
		client.$meta.clientAuthToken = void 0;
	}
	if (affectedSessionIds.size === 0) return;
	await rpcHost.broadcast({
		method: DEVFRAME_EVENTS.broadcast.authRevoked,
		args: [],
		filter: (client) => affectedSessionIds.has(client.$meta.id)
	});
}
/**
* Revoke an auth token: remove from storage and notify all connected clients
* using this token that they are no longer trusted.
*/
async function revokeAuthToken(context, storage, token) {
	storage.mutate((state) => {
		delete state.trusted[token];
	});
	await revokeActiveConnectionsForToken(context, token);
}
//#endregion
export { revokeAuthToken as n, revokeActiveConnectionsForToken as t };
