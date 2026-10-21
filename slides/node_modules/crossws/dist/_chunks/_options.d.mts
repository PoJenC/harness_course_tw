import { AdapterOptions } from "./adapter.mjs";
export interface BunOptions extends AdapterOptions {}
export interface DenoOptions extends AdapterOptions {}
/**
 * Cloudflare Workers execution context (`ExecutionContext`).
 */
interface CloudflareExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
  props?: any;
}
/**
 * Durable Object stub (`DurableObjectStub`) handling the WebSocket upgrade.
 */
interface CloudflareDurableStub {
  fetch(input: any, init?: any): Promise<any>;
  webSocketPublish?: (topic: string, data: unknown, opts: any) => Promise<void>;
}
export interface CloudflareOptions extends AdapterOptions {
  /**
   * Durable Object binding name from environment.
   *
   * **Note:** This option will be ignored if `resolveDurableStub` is provided.
   *
   * @default "$DurableObject"
   */
  bindingName?: string;
  /**
   * Durable Object instance name.
   *
   * **Note:** This option will be ignored if `resolveDurableStub` is provided.
   *
   * @default "crossws"
   */
  instanceName?: string;
  /**
   * Custom function that resolves Durable Object binding to handle the WebSocket upgrade.
   *
   * **Note:** This option will override `bindingName` and `instanceName`.
   */
  resolveDurableStub?(req: Request | undefined, env: unknown, context: CloudflareExecutionContext | undefined): CloudflareDurableStub | undefined | Promise<CloudflareDurableStub | undefined>;
}