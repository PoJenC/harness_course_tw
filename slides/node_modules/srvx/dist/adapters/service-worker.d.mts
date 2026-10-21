import { Server, ServerOptions, ServerRequest, ServiceWorkerFetchEvent } from "../_chunks/types.mjs";
export declare const FastURL: typeof globalThis.URL;
export declare const FastResponse: typeof globalThis.Response;
export type ServiceWorkerHandler = (request: ServerRequest, event: ServiceWorkerFetchEvent) => Response | Promise<Response>;
export declare function serve(options: ServerOptions): Server<ServiceWorkerHandler>;