import { n as WsOriginRegistry } from "../../ws-server-y2R76aSW.mjs";
import { t as ContextRpcServer } from "../../rpc-core-D6NWQW-B.mjs";
//#region src/rpc/transports/ws-deno.d.ts
export interface AttachDenoWsTransportOptions {
  /** Same contract as `WsRpcTransportOptions.allowedOrigins`. */
  allowedOrigins?: readonly string[] | WsOriginRegistry | false;
}
export interface DenoWsTier {
  /**
   * Complete a WS upgrade request; `Deno.serve`'s handler info as the 2nd
   * argument. Unlike Bun, Deno's adapter attaches the socket to the returned
   * `Response` itself, so there is no `websocket` handler object to register.
   */
  handleUpgrade: (request: Request, info: unknown) => Promise<Response>;
  close: () => Promise<void>;
}
/**
 * The Deno fetch-upgrade WebSocket tier for `initDevframe` / `initHub`: the
 * same RPC peer wiring as `attachWsRpcTransport`, driven by crossws's Deno
 * adapter so upgrades complete through `handleUpgrade(request, info)` on the
 * app's own origin, with no side-car server. Load it dynamically so the Deno
 * adapter never enters a Node-only bundle path.
 */
export declare function attachDenoWsTransport(core: ContextRpcServer, options?: AttachDenoWsTransportOptions): Promise<DenoWsTier>;
//#endregion