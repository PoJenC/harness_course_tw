import { Adapter, AdapterHookable, AdapterInstance, Peer, PeerContext, SyncDriver } from "../_chunks/adapter.mjs";
import { BunOptions } from "../_chunks/_options.mjs";
import { Server, ServerWebSocket, WebSocketHandler } from "bun";
export interface BunAdapter extends AdapterInstance {
  websocket: WebSocketHandler<ContextData>;
  handleUpgrade(req: Request, server: Server<ContextData>): Promise<Response | undefined>;
}
type ContextData = {
  peer?: BunPeer;
  namespace: string;
  request: Request;
  server?: Server<ContextData>;
  context: PeerContext;
};
declare const bunAdapter: Adapter<BunAdapter, BunOptions>;
declare class BunPeer extends Peer<{
  ws: ServerWebSocket<ContextData>;
  namespace: string;
  request: Request;
  peers: Set<BunPeer>;
  sync?: SyncDriver;
  hooks: AdapterHookable;
}> {
  get remoteAddress(): string;
  get context(): PeerContext;
  get bufferedAmount(): number;
  send(data: unknown, options?: {
    compress?: boolean;
  }): number;
  _publish(topic: string, data: unknown, options?: {
    compress?: boolean;
  }): number;
  subscribe(topic: string): void;
  unsubscribe(topic: string): void;
  close(code?: number, reason?: string): void;
  terminate(): void;
  ping(data?: unknown): number;
}
export { type BunOptions, bunAdapter as default };