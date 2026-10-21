import { t as DevToolsRpcServerFunctions } from "./rpc-augments-DADwD0R5.js";
import { BirpcReturn } from "devframe/rpc";
import { CommandsContext, ConnectRemoteDevframeOptions as ConnectRemoteDevToolsOptions, DevframeClientContext as DevToolsClientContext, DevframeClientRpcHost as DevToolsClientRpcHost, DevframeRpcClient, DevframeRpcClientMode as DevToolsRpcClientMode, DevframeRpcClientOptions, DevframeRpcContext as DevToolsRpcContext, DockClientScriptContext, DockClientType, DockEntryState, DockEntryStateEvents, DockPanelStorage, DockRegistration, DockRenderer, DockRendererInstance, DockRendererMountOptions, DockRenderersContext, DocksContext, DocksEntriesContext, DocksPanelContext, FRAME_NAV_CHANNEL, FRAME_NAV_VERSION, FrameNavClient as DevToolsFrameNavClient, FrameNavClientOptions as DevToolsFrameNavClientOptions, FrameNavEnvelope as DevToolsFrameNavEnvelope, FrameNavFrameMessage as DevToolsFrameNavFrameMessage, FrameNavHostMessage as DevToolsFrameNavHostMessage, FrameNavHostPayload as DevToolsFrameNavHostPayload, FrameNavListenTarget as DevToolsFrameNavListenTarget, FrameTab as DevToolsFrameTab, RpcClientEvents, RpcStreamingClientHost, StreamingSubscribeOptions, WhenClauseContext, attachFrameNavClient as attachDevToolsFrameNav, connectRemoteDevframe as connectRemoteDevTools, parseRemoteConnection } from "@devframes/hub/client";
import { DevframeRpcClientFunctions } from "@devframes/hub/types";
//#region src/client/connection.d.ts
export type DevToolsRpcClientCall = BirpcReturn<DevToolsRpcServerFunctions, DevframeRpcClientFunctions>['$call'];
export type DevToolsRpcClientCallEvent = BirpcReturn<DevToolsRpcServerFunctions, DevframeRpcClientFunctions>['$callEvent'];
export type DevToolsRpcClientCallOptional = BirpcReturn<DevToolsRpcServerFunctions, DevframeRpcClientFunctions>['$callOptional'];
export type DevToolsRpcClientOptions = DevframeRpcClientOptions;
export interface DevToolsRpcClient extends Omit<DevframeRpcClient, 'call' | 'callEvent' | 'callOptional'> {
  call: DevToolsRpcClientCall;
  callEvent: DevToolsRpcClientCallEvent;
  callOptional: DevToolsRpcClientCallOptional;
}
/**
 * The Vite DevTools flavour of devframe's {@link getDevframeRpcClient}. Kept as
 * a dedicated export for naming symmetry with the kit's other `DevTools*`
 * primitives.
 *
 * Vite DevTools mounts each devframe (Terminals, the Inspector, …) as a
 * same-origin iframe at its own base (e.g. `/__devframes-plugin-terminals/`).
 * Cross-base connection-meta inheritance — a child iframe reusing the parent's
 * `__connection.json` without dialing its own base's (wrong) endpoint — is
 * handled natively by devframe's client via `ConnectionMeta.baseUrl` since
 * devframe 0.7.2 (devframes/devframe#98), so no extra rewriting is needed here.
 *
 * Vite DevTools provides its own interactive authorization view, so disable
 * devframe's native browser-prompt fallback for every kit-managed connection.
 */
export declare function getDevToolsRpcClient(options?: DevToolsRpcClientOptions): Promise<DevToolsRpcClient>;
//#endregion
//#region src/client/context.d.ts
declare const CLIENT_CONTEXT_KEY = "__VITE_DEVTOOLS_CLIENT_CONTEXT__";
/**
 * Get the global DevTools client context, or `undefined` if not yet initialized.
 */
export declare function getDevToolsClientContext(): DevToolsClientContext | undefined;
//#endregion
export { CLIENT_CONTEXT_KEY, type CommandsContext, type ConnectRemoteDevToolsOptions, type DevToolsClientContext, type DevToolsClientRpcHost, type DevToolsFrameNavClient, type DevToolsFrameNavClientOptions, type DevToolsFrameNavEnvelope, type DevToolsFrameNavFrameMessage, type DevToolsFrameNavHostMessage, type DevToolsFrameNavHostPayload, type DevToolsFrameNavListenTarget, type DevToolsFrameTab, type DevToolsRpcClientMode, type DevToolsRpcContext, type DockClientScriptContext, type DockClientType, type DockEntryState, type DockEntryStateEvents, type DockPanelStorage, type DockRegistration, type DockRenderer, type DockRendererInstance, type DockRendererMountOptions, type DockRenderersContext, type DocksContext, type DocksEntriesContext, type DocksPanelContext, FRAME_NAV_CHANNEL, FRAME_NAV_VERSION, type RpcClientEvents, type RpcStreamingClientHost, type StreamingSubscribeOptions, type WhenClauseContext, attachDevToolsFrameNav, connectRemoteDevTools, parseRemoteConnection };