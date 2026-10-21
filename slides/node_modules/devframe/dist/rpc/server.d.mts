import { n as BirpcGroup, o as EventOptions } from "../index-Bia1vKjL.mjs";
//#region src/rpc/server.d.ts
export declare function createRpcServer<ClientFunctions extends object = Record<string, never>, ServerFunctions extends object = Record<string, never>>(functions: ServerFunctions, options?: {
  rpcOptions?: EventOptions<ClientFunctions, ServerFunctions, false>;
}): BirpcGroup<ClientFunctions, ServerFunctions, false>;
//#endregion