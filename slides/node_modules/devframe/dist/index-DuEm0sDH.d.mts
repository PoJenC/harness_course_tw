import { C as RpcFunctionType, S as RpcFunctionSetupResult, T as RpcReturnSchema, g as RpcFunctionDefinitionAny, h as RpcFunctionDefinition, n as RpcArgsSchema, w as RpcFunctionsCollector } from "./types-BmDbfHCx.mjs";
//#region src/rpc/cache.d.ts
interface RpcCacheOptions {
  functions: string[];
  keySerializer?: (args: unknown[]) => string;
}
/**
 * @experimental API is expected to change.
 */
declare class RpcCacheManager {
  private cacheMap;
  private options;
  private keySerializer;
  constructor(options: RpcCacheOptions);
  updateOptions(options: Partial<RpcCacheOptions>): void;
  cached<T>(m: string, a: unknown[]): T | undefined;
  has(m: string, a: unknown[]): boolean;
  apply(req: {
    m: string;
    a: unknown[];
  }, res: unknown): void;
  validate(m: string): boolean;
  clear(fn?: string): void;
}
//#endregion
//#region src/rpc/collector.d.ts
declare class RpcFunctionsCollectorBase<LocalFunctions extends Record<string, any>, SetupContext> implements RpcFunctionsCollector<LocalFunctions, SetupContext> {
  readonly context: SetupContext;
  readonly definitions: Map<string, RpcFunctionDefinition<string, any, any, any, any, any, SetupContext>>;
  readonly functions: LocalFunctions;
  private readonly _onChanged;
  constructor(context: SetupContext);
  register(fnDef: RpcFunctionDefinition<string, any, any, any, any, any, SetupContext>, force?: boolean): void;
  update(fn: RpcFunctionDefinition<string, any, any, any, any, any, SetupContext>, force?: boolean): void;
  onChanged(fn: (id?: string) => void): () => void;
  getHandler<T extends keyof LocalFunctions>(name: T): Promise<LocalFunctions[T]>;
  getSchema<T extends keyof LocalFunctions>(name: T): {
    args: RpcArgsSchema | undefined;
    returns: RpcReturnSchema | undefined;
  };
  has(name: string): boolean;
  get(name: string): RpcFunctionDefinition<string, any, any, any, any, any, SetupContext> | undefined;
  list(): string[];
}
//#endregion
//#region src/rpc/define.d.ts
declare function defineRpcFunction<NAME extends string, TYPE extends RpcFunctionType, ARGS extends any[], RETURN = void, const AS extends RpcArgsSchema | undefined = undefined, const RS extends RpcReturnSchema | undefined = undefined>(definition: RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, AS, RS>): RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, AS, RS>;
declare function createDefineWrapperWithContext<CONTEXT>(): <NAME extends string, TYPE extends RpcFunctionType, ARGS extends any[], RETURN = void, const AS extends RpcArgsSchema | undefined = undefined, const RS extends RpcReturnSchema | undefined = undefined>(definition: RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, AS, RS, CONTEXT>) => RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, AS, RS, CONTEXT>;
//#endregion
//#region src/rpc/handler.d.ts
declare function getRpcResolvedSetupResult<NAME extends string, TYPE extends RpcFunctionType, ARGS extends any[], RETURN = void, CONTEXT = undefined>(definition: RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, any, any, CONTEXT>, context: CONTEXT): Promise<RpcFunctionSetupResult<ARGS, RETURN>>;
declare function getRpcHandler<NAME extends string, TYPE extends RpcFunctionType, ARGS extends any[], RETURN = void, CONTEXT = undefined>(definition: RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, any, any, CONTEXT>, context: CONTEXT): Promise<(...args: ARGS) => RETURN>;
//#endregion
//#region src/rpc/serialization.d.ts
/**
 * Wire format used by the live RPC transports (WebSocket and SSE).
 *
 * - **JSON (default, unprefixed):** payload is plain JSON text. Used when
 *   the dispatched method is declared `jsonSerializable: true`. Encoded
 *   via {@link strictJsonStringify} (rejects non-JSON values), decoded
 *   via `JSON.parse`.
 * - **Structured-clone (`s:` prefix):** payload is `s:` followed by
 *   `structured-clone-es` text. Used when the method is declared
 *   `jsonSerializable: false` (or omitted, the default). Round-trips
 *   `Map`, `Set`, `Date`, `BigInt`, cycles, and class instances.
 *
 * birpc envelopes always start with `{`, so a leading byte that is not
 * `s` is unambiguously JSON. Each direction independently chooses its
 * encoding from local definitions; request and response are not
 * coupled by a mirror rule.
 */
declare const STRUCTURED_CLONE_PREFIX = "s:";
/**
 * `JSON.stringify` with a single-pass strict replacer.
 *
 * Throws `DF0020` synchronously when the value contains a type JSON
 * cannot round-trip losslessly: `Map`, `Set`, `Date`, `BigInt`, class
 * instances, or `undefined` inside an array (silently becomes `null`).
 *
 * Native pass-throughs (no extra work needed):
 *   - circular references: `JSON.stringify` raises `TypeError`.
 *   - `BigInt` at top level: caught here for a friendlier error path.
 *
 * Lenient cases (allowed without throwing):
 *   - `undefined` as an object property: legitimate optional field;
 *     JSON.stringify just omits it.
 *   - `undefined` at the root: legitimate "action returned nothing".
 *   - `Symbol` / `Function` values: semantically "drop me" in JSON.
 *
 * `fnName` is used only for the diagnostic message; pass the RPC
 * function name when calling from a wire serializer / dump writer so
 * the error points at the offending function.
 */
declare function strictJsonStringify(value: unknown, fnName?: string): string;
//#endregion
//#region src/rpc/validate-io.d.ts
/**
 * Validate positional arguments against their declared schemas. Only
 * indices with a schema are checked; extra arguments pass through
 * untouched. Throws `DF0038` on the first failing argument.
 *
 * Validation guards the payload without rewriting it: the original values
 * are handed to the handler unchanged, so a schema that describes a subset
 * of an object never silently strips the sender's extra fields (and any
 * declared transforms stay a purely type-level concern).
 *
 * @internal
 */
declare function validateRpcArgs(name: string, argsSchema: RpcArgsSchema | undefined, args: readonly unknown[]): Promise<unknown[]>;
/**
 * Validate a handler's resolved return value against its declared schema.
 * Throws `DF0039` when the value fails the schema, otherwise returns the
 * original value unchanged (guard-only, never rewriting the payload; see
 * {@link validateRpcArgs}). Passes through when no return schema is set.
 *
 * @internal
 */
declare function validateRpcReturn(name: string, returnSchema: RpcReturnSchema | undefined, value: unknown): Promise<unknown>;
//#endregion
//#region src/rpc/validation.d.ts
/**
 * Validates RPC function definitions.
 * Action and event functions cannot have dumps (side effects should not be cached).
 *
 * @throws {Error} If an action or event function has a dump configuration
 */
declare function validateDefinitions(definitions: readonly RpcFunctionDefinitionAny[]): void;
/**
 * Validates a single RPC function definition.
 *
 * @throws {Error} If an action or event function has a dump configuration
 */
declare function validateDefinition(definition: RpcFunctionDefinitionAny): void;
//#endregion
export { STRUCTURED_CLONE_PREFIX as a, getRpcResolvedSetupResult as c, RpcFunctionsCollectorBase as d, RpcCacheManager as f, validateRpcReturn as i, createDefineWrapperWithContext as l, validateDefinitions as n, strictJsonStringify as o, RpcCacheOptions as p, validateRpcArgs as r, getRpcHandler as s, validateDefinition as t, defineRpcFunction as u };