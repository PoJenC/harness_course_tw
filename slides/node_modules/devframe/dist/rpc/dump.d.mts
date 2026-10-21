import { i as BirpcReturn } from "../index-Bia1vKjL.mjs";
import { c as RpcDumpCollectionOptions, f as RpcDumpRecordError, g as RpcFunctionDefinitionAny, i as RpcDefinitionsToFunctions, p as RpcDumpStore, s as RpcDumpClientOptions } from "../types-BmDbfHCx.mjs";
//#region src/rpc/dump/collect.d.ts
export declare function dumpFunctions<T extends readonly RpcFunctionDefinitionAny[]>(definitions: T, context?: any, options?: RpcDumpCollectionOptions): Promise<RpcDumpStore<RpcDefinitionsToFunctions<T>>>;
/**
 * Creates a client that serves pre-computed results from a dump store.
 * Uses argument hashing to match calls to stored records.
 *
 * @example
 * ```ts
 * const client = createClientFromDump(store)
 * await client.greet('Alice')
 * ```
 */
export declare function createClientFromDump<T extends Record<string, any>>(store: RpcDumpStore<T>, options?: RpcDumpClientOptions): BirpcReturn<T>;
/**
 * Filters function definitions to only those with dump definitions.
 * Note: Only checks the definition itself, not setup results.
 */
export declare function getDefinitionsWithDumps<T extends readonly RpcFunctionDefinitionAny[]>(definitions: T): RpcFunctionDefinitionAny[];
//#endregion
//#region src/rpc/dump/error.d.ts
/**
 * Normalize a thrown value into a plain object suitable for storage in
 * a dump record. Preserves `message`, `name`, `cause`, and any own
 * enumerable properties of an `Error` so consumers reading the dump can
 * reconstruct a richer Error than just `{ message, name }`.
 *
 * Non-`Error` throws are wrapped as `{ name: 'Error', message: String(thrown) }`.
 */
export declare function serializeDumpError(error: unknown): RpcDumpRecordError;
/**
 * Inverse of {@link serializeDumpError}: rebuild a thrown `Error` from
 * the plain object stored in a dump record. Preserves `cause`, restores
 * the original `name`, and re-attaches any custom own properties.
 */
export declare function reviveDumpError(stored: RpcDumpRecordError): Error;
//#endregion
//#region src/rpc/dump/static.d.ts
export type StaticRpcDumpSerialization = 'json' | 'structured-clone';
export interface StaticRpcDumpManifestStaticEntry {
  type: 'static';
  path: string;
  /** Encoder used when this entry's file was written. Default: `'json'`. */
  serialization?: StaticRpcDumpSerialization;
}
export interface StaticRpcDumpManifestQueryEntry {
  type: 'query';
  records: Record<string, string>;
  fallback?: string;
  /** Encoder used when each record/fallback file was written. Default: `'json'`. */
  serialization?: StaticRpcDumpSerialization;
}
export type StaticRpcDumpManifestValue = StaticRpcDumpManifestStaticEntry | StaticRpcDumpManifestQueryEntry | any;
export type StaticRpcDumpManifest = Record<string, StaticRpcDumpManifestValue>;
export interface StaticRpcDumpFile {
  /** Whether this file was written via `JSON.stringify` or `structured-clone-es.stringify`. */
  serialization: StaticRpcDumpSerialization;
  /** Function name the file belongs to, used to scope `DF0019` errors during write. */
  fnName: string;
  /** Payload to encode. */
  data: unknown;
}
export interface StaticRpcDumpCollection {
  manifest: StaticRpcDumpManifest;
  files: Record<string, StaticRpcDumpFile>;
}
export declare function collectStaticRpcDump(definitions: Iterable<RpcFunctionDefinitionAny>, context: any): Promise<StaticRpcDumpCollection>;
//#endregion
//#region src/rpc/dump/write.d.ts
export interface WriteStaticRpcDumpOptions {
  /**
   * Pretty-print RPC dump JSON files. Defaults to `false` so payload
   * shards (which can be multiple MB for graph-heavy tools) ship
   * minified. Set `true` when you need to diff / read the dumps by hand.
   */
  pretty?: boolean;
}
/**
 * Write a collected static RPC dump to disk: every sharded record file plus
 * the `__rpc-dump/index.json` manifest, under `outDir`. Shared by the build
 * adapter (`createBuild`) and `@devframes/hub`'s `buildHub`.
 */
export declare function writeStaticRpcDump(dump: StaticRpcDumpCollection, outDir: string, options?: WriteStaticRpcDumpOptions): Promise<void>;
//#endregion