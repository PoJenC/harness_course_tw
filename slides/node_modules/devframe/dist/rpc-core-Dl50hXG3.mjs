import { n as __exportAll } from "./rolldown-runtime-B4iAMlE-.mjs";
import { n as getRpcResolvedSetupResult, t as getRpcHandler } from "./handler-DmaAfpGq.mjs";
import { createRpcServer } from "./rpc/server.mjs";
import { t as diagnostics } from "./diagnostics-Dngy7cNp.mjs";
import { AsyncLocalStorage } from "node:async_hooks";
//#region src/node/rpc-core.ts
var rpc_core_exports = /* @__PURE__ */ __exportAll({ createContextRpcServer: () => createContextRpcServer });
/**
* Bind a devframe context's registered RPC functions to a birpc group,
* transport-agnostically: the shared core under the instance shell's own
* HTTP+WS binding (Node http + WS) and the Bun fetch-upgrade tier of
* `createHandler`.
*
* Owns everything about serving RPC that is independent of *how* peers
* connect: the auth handler's function registration, the
* `AsyncLocalStorage`-based session resolver (so
* `ctx.rpc.getCurrentRpcSession()` works inside handlers), the
* `authorize` gate, and the `auth: false` auto-trust handshake shim.
*/
function createContextRpcServer(options) {
	const { context } = options;
	const rpcHost = context.rpc;
	const asyncStorage = new AsyncLocalStorage();
	const authHandler = typeof options.auth === "object" ? options.auth : void 0;
	const effectiveAuthorize = options.authorize ?? authHandler?.authorize;
	if (authHandler) {
		for (const fn of authHandler.rpcFunctions) if (!rpcHost.definitions.has(fn.name)) rpcHost.register(fn);
	}
	const rpcGroup = createRpcServer({}, { rpcOptions: {
		/**
		* Forwarded as-is so a host with its own structured diagnostics
		* keeps seeing RPC failures.
		*/
		onFunctionError: options.rpcOptions?.onFunctionError,
		onGeneralError: options.rpcOptions?.onGeneralError,
		/**
		* Wrap each RPC handler in an AsyncLocalStorage context so
		* `ctx.rpc.getCurrentRpcSession()` works inside handlers (used
		* by streaming subscribe/unsubscribe/cancel and shared-state
		* sync), and (when an `authorize` gate is configured) reject
		* the call before it ever reaches the handler. Mirrors
		* `packages/core/src/node/ws.ts`'s resolver.
		*/
		resolver(name) {
			const rpc = this;
			const definition = rpcHost.definitions.get(name);
			if (!definition) return void 0;
			return async function(...args) {
				const meta = rpc.$meta;
				if (effectiveAuthorize && !effectiveAuthorize(name, {
					meta,
					rpc
				})) throw diagnostics.DF0036({ name });
				const inner = definition.handler ?? (await getRpcResolvedSetupResult(definition, context)).handler;
				return (await getRpcHandler(inner ? {
					...definition,
					handler: (...handlerArgs) => asyncStorage.run({
						rpc,
						meta
					}, () => inner.apply(this, handlerArgs))
				} : definition, context))(...args);
			};
		}
	} });
	rpcHost._rpcGroup = rpcGroup;
	rpcHost._asyncStorage = asyncStorage;
	rpcHost._authDisabled = options.auth === false;
	if (options.auth === false && !rpcHost.definitions.has("anonymous:devframe:auth")) rpcHost.register({
		name: "anonymous:devframe:auth",
		type: "action",
		handler: () => {
			const session = rpcHost.getCurrentRpcSession();
			if (session) session.meta.isTrusted = true;
			return { isTrusted: true };
		}
	});
	const onConnected = authHandler || options.onPeerConnect ? (connection, meta) => {
		const session = {
			meta,
			rpc: rpcGroup.clients.find((client) => client.$meta === meta)
		};
		authHandler?.onConnect(connection, session);
		options.onPeerConnect?.(connection, session);
	} : void 0;
	const onDisconnected = (connection, meta) => {
		options.onPeerDisconnect?.(connection, meta);
		rpcHost._emitSessionDisconnected(meta);
	};
	return {
		rpcGroup,
		authHandler,
		onConnected,
		onDisconnected
	};
}
//#endregion
export { rpc_core_exports as n, createContextRpcServer as t };
