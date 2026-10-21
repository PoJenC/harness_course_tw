import { n as BirpcGroup } from "../../index-Bia1vKjL.mjs";
import { g as RpcFunctionDefinitionAny } from "../../types-BmDbfHCx.mjs";
import { n as DevframeRpcConnection, t as DevframeNodeRpcSessionMeta } from "../../session-r6PDixP6.mjs";
import { n as WsOriginRegistry } from "../../ws-server-y2R76aSW.mjs";
//#region src/rpc/transports/sse-server.d.ts
export interface SseRpcTransportOptions {
  /**
   * Same contract as `WsRpcTransportOptions.allowedOrigins`: extra origins
   * to accept beyond the loopback default, a live origin registry, or
   * `false` to disable the gate. Applied to the stream `GET`, the RPC
   * `POST`, and the CORS preflight alike.
   */
  allowedOrigins?: readonly string[] | WsOriginRegistry | false;
  /**
   * RPC function definitions, used by the per-call wire serializer to
   * dispatch between strict-JSON and structured-clone encoding based on
   * each function's `jsonSerializable` flag. When omitted, all messages
   * fall back to structured-clone, the same contract as the WS transport.
   */
  definitions?: ReadonlyMap<string, Pick<RpcFunctionDefinitionAny, 'jsonSerializable'>>;
  onConnected?: (connection: DevframeRpcConnection, meta: DevframeNodeRpcSessionMeta) => void;
  onDisconnected?: (connection: DevframeRpcConnection, meta: DevframeNodeRpcSessionMeta) => void;
  /**
   * Milliseconds between keep-alive comment frames (`: ping`) written to
   * every open stream, so intermediaries (reverse proxies, tunnels) don't
   * drop an idle connection. `0` disables. Default: `30_000`.
   */
  keepAliveInterval?: number;
  /** Mint a session id. Default: `crypto.randomUUID`. */
  generateSessionId?: () => string;
}
export interface SseRpcTransport {
  /**
   * Web-standard handler for the SSE route: `GET` opens the event stream,
   * `POST` carries RPC frames (session id in the `x-birpc-session` header),
   * `OPTIONS` answers the CORS preflight for registered cross-origin
   * viewers. Mount it on the route the connection meta advertises.
   */
  handler: (request: Request) => Promise<Response> | Response;
  /** Number of currently connected SSE sessions. */
  sessionCount: () => number;
  /** Terminate every open stream and detach their birpc channels. */
  close: () => void;
}
/**
 * Attach an SSE + HTTP POST transport to an existing RPC group: the
 * WebSocket-free counterpart to `attachWsRpcTransport`, for hosts and
 * proxies where the upgrade isn't available. Speaks the same birpc wire
 * protocol (one channel per session, per-method `jsonSerializable`
 * dispatch) over a half-duplex pair, mirroring birpc's own SSE helpers:
 *
 *  - the server mints a session id as the stream's first frame
 *    (`event: session`);
 *  - every client `POST` echoes it in the `x-birpc-session` header;
 *  - a client-initiated request's response comes back in that `POST`'s
 *    own body (parked until the handler answers);
 *  - server-initiated calls/events stream down as `event: message`
 *    frames, and the client's replies up via `POST` get a bare `202`.
 */
export declare function attachSseRpcTransport<ClientFunctions extends object, ServerFunctions extends object>(rpcGroup: BirpcGroup<ClientFunctions, ServerFunctions, false>, options?: SseRpcTransportOptions): SseRpcTransport;
//#endregion