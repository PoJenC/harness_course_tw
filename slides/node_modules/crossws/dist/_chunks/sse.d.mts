import { Adapter, AdapterInstance, AdapterOptions } from "./adapter.mjs";
export interface SSEAdapter extends AdapterInstance {
  fetch(req: Request): Promise<Response>;
}
export interface SSEOptions extends AdapterOptions {
  bidir?: boolean;
}
declare const sseAdapter: Adapter<SSEAdapter, SSEOptions>;
export { sseAdapter };