import { n as WsOriginRegistry } from "../../ws-server-y2R76aSW.mjs";
import { t as ContextRpcServer } from "../../rpc-core-D6NWQW-B.mjs";
//#region src/rpc/transports/ws-bun.d.ts
export interface AttachBunWsTransportOptions {
  /** Same contract as `WsRpcTransportOptions.allowedOrigins`. */
  allowedOrigins?: readonly string[] | WsOriginRegistry | false;
}
/**
 * Structural view of the Bun `Bun.serve({ websocket })` handler object the
 * crossws Bun adapter produces, typed loosely so devframe carries no
 * dependency on Bun's own types.
 */
export interface BunWsTierWebSocket {
  open?: (ws: unknown) => unknown;
  message: (ws: unknown, message: unknown) => unknown;
  close?: (ws: unknown, code?: number, reason?: string) => unknown;
  drain?: (ws: unknown) => unknown;
}
export interface BunWsTier {
  /** Complete a WS upgrade request; `Bun.serve`'s server as 2nd argument. */
  handleUpgrade: (request: Request, server: unknown) => Promise<Response | undefined>;
  /** The handlers to spread into `Bun.serve({ websocket })`. */
  websocket: BunWsTierWebSocket;
  close: () => Promise<void>;
}
/**
 * The Bun fetch-upgrade WebSocket tier for `initDevframe` / `initHub`: the
 * same RPC peer wiring as `attachWsRpcTransport`, driven by crossws's Bun
 * adapter so upgrades complete through `handler(request, server)` on the
 * app's own origin, with no side-car server. Load it dynamically so the Bun
 * adapter never enters a Node-only bundle path.
 */
export declare function attachBunWsTransport(core: ContextRpcServer, options?: AttachBunWsTransportOptions): Promise<BunWsTier>;
//#endregion