import { a as ChannelOptions } from "./index-Bia1vKjL.mjs";
import { g as RpcFunctionDefinitionAny } from "./types-BmDbfHCx.mjs";
//#region src/rpc/transports/ws-client.d.ts
interface WsRpcChannelOptions {
  url: string;
  onConnected?: (e: Event) => void;
  onError?: (e: Error) => void;
  onDisconnected?: (e: CloseEvent) => void;
  authToken?: string;
  /**
   * RPC function definitions (or just the `jsonSerializable` flag per
   * method) used to dispatch the per-call wire serializer. Pass an
   * empty / partial map on clients that don't have the full registry;
   * encoding falls back to structured-clone (the safer superset) and
   * decoding still routes correctly via the wire prefix.
   */
  definitions?: ReadonlyMap<string, Pick<RpcFunctionDefinitionAny, 'jsonSerializable'>>;
}
/**
 * Build a birpc `ChannelOptions` object backed by a browser `WebSocket`.
 * Pass the result straight to `createRpcClient`'s `channel` option.
 *
 * Also returns `close()`, closing the underlying socket, mirroring the server transport's
 * existing `WsRpcTransport.close()`. `birpc`'s own `ChannelOptions` has no teardown of its own.
 */
declare function createWsRpcChannel(options: WsRpcChannelOptions): ChannelOptions & {
  close: () => void;
};
//#endregion
export { createWsRpcChannel as n, WsRpcChannelOptions as t };