import { g as RpcFunctionDefinitionAny } from "../types-BmDbfHCx.mjs";
import { Dt as DevframeHost, k as SharedState, l as RpcFunctionsHost, o as DevframeNodeContext } from "../context-dOWXVHc6.mjs";
//#region src/node/context.d.ts
export interface CreateHostContextOptions {
  cwd: string;
  workspaceRoot?: string;
  mode: 'dev' | 'build';
  host: DevframeHost;
  /**
   * `import.meta.url` of the module that defines the devframe this context
   * serves (from `DevframeDefinition.importMetaUrl`). Supplies the default
   * `resolveFrom` base for remote {@link DevframeViewHost.hostStatic} sources
   * that don't set one, so a locally installed copy of an assets package is
   * served with zero network. An internal plumbing detail; it isn't part of
   * the public {@link DevframeNodeContext} surface.
   */
  importMetaUrl?: string;
  /**
   * Built-in RPC declarations to register on the host. Framework
   * adapters (vite, rolldown, cli) can pass the ones they need; the
   * host itself has no opinions about the built-in set.
   */
  builtinRpcDeclarations?: readonly RpcFunctionDefinitionAny[];
}
/**
 * Framework- and build-tool-agnostic core of the Devframe node context.
 * Wires the RPC host, view (HTTP file-serving) host, diagnostics, and
 * agent subsystems. Host adapters can wrap this to augment `ctx` with
 * extra surfaces; for example, `@vitejs/devtools-kit`'s
 * `createKitContext` attaches `docks`, `terminals`, `messages`, and
 * `commands` when mounted into Vite DevTools.
 */
export declare function createHostContext(options: CreateHostContextOptions): Promise<DevframeNodeContext>;
//#endregion
//#region src/node/storage.d.ts
export interface CreateStorageOptions<T extends object> {
  filepath: string;
  initialValue: T;
  mergeInitialValue?: false | ((initialValue: T, savedValue: T) => T);
  debounce?: number;
}
export declare function createStorage<T extends object>(options: CreateStorageOptions<T>): SharedState<T>;
//#endregion
export type { RpcFunctionsHost };