import { a as ChannelOptions } from "./index-Bia1vKjL.mjs";
import { g as RpcFunctionDefinitionAny } from "./types-BmDbfHCx.mjs";
//#region src/rpc/transports/sse-client.d.ts
interface SseRpcChannelOptions {
  /** Resolved `http(s)://` URL of the SSE endpoint. */
  url: string;
  onConnected?: () => void;
  onError?: (e: Error) => void;
  onDisconnected?: () => void;
  authToken?: string;
  /**
   * RPC function definitions (or just the `jsonSerializable` flag per
   * method) used to dispatch the per-call wire serializer, the same contract
   * as the WS channel.
   */
  definitions?: ReadonlyMap<string, Pick<RpcFunctionDefinitionAny, 'jsonSerializable'>>;
  /** Fetch implementation. Default: `globalThis.fetch`. */
  fetch?: typeof globalThis.fetch;
}
/**
 * Build a birpc `ChannelOptions` object backed by an SSE stream (server →
 * client) and HTTP `POST` (client → server): the WebSocket-free counterpart
 * to `createWsRpcChannel`, wire-compatible with `attachSseRpcTransport`.
 *
 * The stream is consumed via `fetch` streaming (not `EventSource`), so it
 * works in browsers and server runtimes alike. The server's first frame
 * (`event: session`) carries the session id; every `POST` echoes it in the
 * `x-birpc-session` header. A response to a client-initiated request comes
 * back in the `POST`'s own body and is re-injected into the channel; a
 * dropped stream terminates the channel; there is no reconnect, matching
 * the WS channel's closed-is-done semantics.
 */
declare function createSseRpcChannel(options: SseRpcChannelOptions): ChannelOptions & {
  close: () => void;
};
//#endregion
export { createSseRpcChannel as n, SseRpcChannelOptions as t };