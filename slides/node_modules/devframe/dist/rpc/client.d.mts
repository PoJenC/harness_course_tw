import { a as ChannelOptions, i as BirpcReturn, r as BirpcOptions } from "../index-Bia1vKjL.mjs";
//#region src/rpc/client.d.ts
export declare function createRpcClient<ServerFunctions extends object = Record<string, never>, ClientFunctions extends object = Record<string, never>>(functions: ClientFunctions, options: {
  channel: ChannelOptions;
  rpcOptions?: Partial<BirpcOptions<ServerFunctions, ClientFunctions, boolean>>;
}): BirpcReturn<ServerFunctions, ClientFunctions, false>;
//#endregion