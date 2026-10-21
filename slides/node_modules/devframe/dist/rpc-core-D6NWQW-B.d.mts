import { n as BirpcGroup, o as EventOptions } from "./index-Bia1vKjL.mjs";
import { Tt as DevframeRpcServerFunctions, jt as DevframeAuthHandler, o as DevframeNodeContext, s as DevframeNodeRpcSession, wt as DevframeRpcClientFunctions } from "./context-dOWXVHc6.mjs";
import { n as DevframeRpcConnection, t as DevframeNodeRpcSessionMeta } from "./session-r6PDixP6.mjs";
import "./ws-server-y2R76aSW.mjs";
import "./index-DVGcpYm7.mjs";
//#region src/node/rpc-core.d.ts
interface CreateContextRpcServerOptions {
  context: DevframeNodeContext;
  /**
   * Auth intent: `true`/omitted gates by default, `false` opts out (auto-trust
   * handshake shim), a {@link DevframeAuthHandler} installs a custom scheme.
   */
  auth?: boolean | DevframeAuthHandler;
  /** Lower-level per-call gate by method name and session, without a full handler. */
  authorize?: (methodName: string, session: DevframeNodeRpcSession) => boolean;
  /** Called once per new RPC connection, right after its session is created. */
  onPeerConnect?: (connection: DevframeRpcConnection, session: DevframeNodeRpcSession) => void;
  /** Called once per closed RPC connection, after the transport's disconnect bookkeeping. */
  onPeerDisconnect?: (connection: DevframeRpcConnection, meta: DevframeNodeRpcSessionMeta) => void;
  /** Forwarded verbatim to birpc's `rpcOptions` so a host keeps seeing RPC failures. */
  rpcOptions?: Pick<EventOptions<DevframeRpcClientFunctions, DevframeRpcServerFunctions, false>, 'onFunctionError' | 'onGeneralError'>;
}
interface ContextRpcServer {
  rpcGroup: BirpcGroup<DevframeRpcClientFunctions, DevframeRpcServerFunctions, false>;
  /** The resolved auth handler when `auth` was passed as one. */
  authHandler?: DevframeAuthHandler;
  /**
   * Connection lifecycle handlers to wire into a transport binding
   * (`attachWsRpcTransport`'s `onConnected` / `onDisconnected`, or any other
   * crossws adapter's peer hooks via `createWsRpcPeerHooks`).
   */
  onConnected?: (connection: DevframeRpcConnection, meta: DevframeNodeRpcSessionMeta) => void;
  onDisconnected: (connection: DevframeRpcConnection, meta: DevframeNodeRpcSessionMeta) => void;
}
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
declare function createContextRpcServer(options: CreateContextRpcServerOptions): ContextRpcServer;
//#endregion
export { CreateContextRpcServerOptions as n, createContextRpcServer as r, ContextRpcServer as t };