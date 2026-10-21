interface RouterContext<T = unknown> {
  /** @internal The shape of the tree may change between versions. */
  root: Node<T>;
  /** @internal The shape of the static map may change between versions. */
  static: Record<string, Node<T> | undefined>;
}
/**
 * One entry per param: its route index (`-(i + 1)` for a catch-all at `i`),
 * its name (`"0"`, `"1"`, … for a `*` or a bare `**`) or segment regex,
 * whether it may match no segment (a bare `**`; a trailing `*` is optional
 * too, see `matchesZero`), then:
 * - a catch-all: whether one that needs a segment may capture `""` (a `*`;
 *   a `:name` / `**:name` needs a value);
 * - a segment regex: whether it restricts the segment no more than a plain
 *   `:name` / `*` (`plain`: captures alone with at most one required
 *   `:name`, `*:a`, `:a:b?`), so that the from-end ranking reads it as one
 *   (`kindAt`), and the name of its in-place optional param (`*-:x?`: `x`,
 *   unset when absent), as `getParamRegexp` built it;
 * - and whether it adds to the capture of a `*` inside a segment that an
 *   earlier piece started (see `splitStar`).
 */
type ParamsIndexMap = Array<[Index: number, name: string | RegExp, optional: boolean, emptyOrPlain?: boolean, inPlace?: string, join?: boolean]>;
type MethodData<T = unknown> = {
  data: T;
  paramsMap?: ParamsIndexMap;
  paramsRegexp: RegExp[];
  /**
   * Registration identity shared by every entry one `addRoute` call creates;
   * `removeRoute` splices entries by it. Not the source pattern: a plain
   * pattern stores its rewritten segment join, an expanding one its
   * pre-expansion text (see `_add` in operations/add.ts).
   */
  route: string;
  /**
   * Set on routes with segments after `**`: the route index of the `**` and
   * how many segments follow it. Those segments are matched from the end of
   * the path.
   */
  suffix?: [wildcard: number, length: number];
  /**
   * Set on every entry (variant) of an `addRoute` call that registers several
   * (optional syntax, a `*` inside a segment): a token they share (identity
   * only, never data equality). One path may match several of them
   * (`/a/:x?/:y?`: `/a/:x` and `/a/:y`); `findAllRoutes` lists the route once.
   */
  variants?: object;
  /**
   * Breaks weight ties between same-node siblings (higher is more specific):
   * the rank of its regex segments (literal text, then constraints and
   * captures that may be `""`, see `getParamRegexp`) over 2^32, a fraction
   * of a weight point.
   */
  rank: number;
};
interface Node<T = unknown> {
  key: string;
  static?: Record<string, Node<T>>;
  param?: Node<T>;
  wildcard?: Node<T>;
  /**
   * On a wildcard node: the segments its routes have after `**`, stored
   * last segment first (a trie matched from the end of the path).
   */
  suffix?: Node<T>;
  /**
   * Set on every node on the way to a wildcard with a `suffix` trie, so lookup
   * can skip subtrees without one. Never cleared (a stale flag only costs a
   * lookup).
   */
  hasSuffix?: boolean;
  hasRegexParam?: boolean;
  methods?: Record<string, MethodData<T>[] | undefined>;
}
type MatchedRoute<T = unknown> = {
  data: T;
  params?: Record<string, string>;
};
/** A compiled single-match lookup (`compileRouter(router)`), like `findRoute`. */
export type CompiledMatch<T = unknown> = (method: string, path: string) => MatchedRoute<T> | undefined;
/** A compiled multi-match lookup (`matchAll: true`), like `findAllRoutes`. */
export type CompiledMatchAll<T = unknown> = (method: string, path: string) => MatchedRoute<T>[];
/** Options of {@link compileRouter}. */
export interface CompileRouterOptions<T = any> {
  /** Return every matching route (least to most specific) instead of the best one. */
  matchAll?: boolean;
  /** Resolve `.` and `..` segments of the path before matching. */
  normalize?: boolean;
  /**
   * Render one route's data as a JavaScript expression (raw code, emitted
   * as is). Defaults to `JSON.stringify`. Only used by
   * {@link compileRouterToString}: `compileRouter` keeps data by reference.
   */
  serialize?: (data: T) => string;
}
/** Options of {@link compileRouterToString}. */
export interface CompileRouterToStringOptions<T = any> extends CompileRouterOptions<T> {
  /**
   * Emit `const <functionName>=<matcher>;` instead of a bare expression.
   */
  functionName?: string;
}
/**
 * @deprecated Use {@link CompileRouterToStringOptions} (or
 * {@link CompileRouterOptions} for `compileRouter`).
 */
export type RouterCompilerOptions<T = any> = CompileRouterToStringOptions<T>;
/**
 * Compile the router into one fast matching function, at runtime (JIT).
 *
 * **IMPORTANT:** `compileRouter` uses `new Function()`, which a CSP without `unsafe-eval` blocks. Use `compileRouterToString` at build time there.
 *
 * The compiled function is a **snapshot**: routes added or removed afterwards aren't seen, so compile again after changing the router. Route data is kept by reference. It returns what `findRoute` returns (with `matchAll: true`, what `findAllRoutes` returns), except that `params` is a plain object instead of a null-prototype one.
 *
 * @example
 * import { createRouter, addRoute } from "rou3";
 * import { compileRouter } from "rou3/compiler";
 * const router = createRouter();
 * // [add some routes]
 * const findRoute = compileRouter(router);
 * const matchAll = compileRouter(router, { matchAll: true });
 * findRoute("GET", "/path/foo/bar");
 *
 * @param router - The router context to compile.
 */
export declare function compileRouter<T>(router: RouterContext<T>, opts: CompileRouterOptions<T> & {
  matchAll: true;
}): CompiledMatchAll<T>;
export declare function compileRouter<T>(router: RouterContext<T>, opts?: CompileRouterOptions<T> & {
  matchAll?: false;
}): CompiledMatch<T>;
export declare function compileRouter<T>(router: RouterContext<T>, opts?: CompileRouterOptions<T>): CompiledMatch<T> | CompiledMatchAll<T>;
/**
 * Compile the router into JavaScript code, ahead of time (for example into a build output).
 *
 * The output is a self-contained expression (or a `const <functionName>=…;` statement): no imports, no rou3 at runtime, and no `eval` / `new Function()`, so it runs under a strict CSP. It needs ES2018 (named capture groups, object spread). Like `compileRouter`, it is a **snapshot** of the router.
 *
 * **IMPORTANT:** The generated code is **not** stable across rou3 versions: generate it at build time with the installed rou3, and don't commit, patch or parse it.
 *
 * **IMPORTANT:** Route data is emitted with `JSON.stringify` (`toJSON()` applies at every depth). Data containing a function, symbol or bigint throws: pass `opts.serialize` to emit each route's data as your own JavaScript expression instead.
 *
 * @example
 * import { createRouter, addRoute } from "rou3";
 * import { compileRouterToString } from "rou3/compiler";
 * const router = createRouter();
 * // [add some routes with serializable data]
 * const compilerCode = compileRouterToString(router, { functionName: "findRoute" });
 * // "const findRoute=(m, p) => {}"
 *
 * // Route data as code (e.g. handler imports)
 * compileRouterToString(router, { serialize: (data) => `{handler:${data.importName}}` });
 */
export declare function compileRouterToString<T>(router: RouterContext<T>, opts?: CompileRouterToStringOptions<T>): string;
/**
 * @deprecated Pass the function name as an option instead:
 * `compileRouterToString(router, { functionName, ...opts })`.
 */
export declare function compileRouterToString<T>(router: RouterContext<T>, functionName: string | undefined, opts?: CompileRouterToStringOptions<T>): string;