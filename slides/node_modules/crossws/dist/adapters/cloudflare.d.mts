import { Adapter, AdapterInstance } from "../_chunks/adapter.mjs";
import { WebSocket as WebSocket$1, web_d_exports } from "../_chunks/web.mjs";
import { CloudflareOptions } from "../_chunks/_options.mjs";
import { DurableObject } from "cloudflare:workers";
import * as CF from "@cloudflare/workers-types";
declare const cloudflareAdapter: Adapter<CloudflareDurableAdapter, CloudflareOptions>;
export interface CloudflareDurableAdapter extends AdapterInstance {
  handleUpgrade(req: Request | CF.Request, env: unknown, context: CF.ExecutionContext): Promise<Response>;
  handleDurableInit(obj: DurableObject, state: DurableObjectState, env: unknown): void;
  handleDurableUpgrade(obj: DurableObject, req: Request | CF.Request): Promise<Response>;
  handleDurableMessage(obj: DurableObject, ws: WebSocket | CF.WebSocket | WebSocket$1, message: ArrayBuffer | string): Promise<void>;
  handleDurablePublish: (obj: DurableObject, topic: string, data: unknown, opts: any) => Promise<void>;
  handleDurableClose(obj: DurableObject, ws: WebSocket | CF.WebSocket | WebSocket$1, code: number, reason: string, wasClean: boolean): Promise<void>;
}
export { type CloudflareOptions, cloudflareAdapter as default };