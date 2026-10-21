import { DevframeRpcServerFunctions } from "@devframes/hub/types";
//#region src/types/rpc-augments.d.ts
/**
 * Server-side RPC functions exposed by Vite DevTools integrations.
 *
 * Extend this interface with module augmentation to type `rpc.call()`.
 */
interface DevToolsRpcServerFunctions extends DevframeRpcServerFunctions {}
//#endregion
export { DevToolsRpcServerFunctions as t };