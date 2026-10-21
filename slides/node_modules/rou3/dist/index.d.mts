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
type ExtractWildcards<TPath extends string, Count extends readonly unknown[] = [], Acc = never, Opt extends boolean = false, S extends boolean = false> = TPath extends `${infer A}${infer B}${infer C}${infer D}${infer E}${infer F}${infer G}${infer H}${infer Rest}` ? `${A}${B}${C}${D}${E}${F}${G}${H}` extends `${string}${"\\" | "(" | "*" | "{" | "}"}${string}` ? ScanWildcard<TPath, Count, Acc, Opt, S> : ExtractWildcards<Rest, Count, Acc, Opt, H extends "/" ? true : false> : ScanWildcard<TPath, Count, Acc, Opt, S>;
type ScanWildcard<TPath extends string, Count extends readonly unknown[], Acc, Opt extends boolean, S extends boolean> = TPath extends `${infer C}${infer Rest}` ? C extends "\\" ? ExtractWildcards<Rest extends `${string}${infer R}` ? R : Rest, Count, Acc, Opt> : C extends "(" ? ExtractWildcards<SkipGroup<TPath>, [...Count, unknown], Acc | [`${Count["length"]}`, S extends true ? EndingStar<TPath, Opt> : Opt, false], Opt> : C extends "{" ? ExtractWildcards<Rest, Count, Acc, TPath extends `{${string}}?${string}` ? GroupOptional<TPath> : false, S> : C extends "}" ? ExtractWildcards<Rest, Count, Acc, false> : C extends "*" ? Rest extends `*:${infer Named}` ? ExtractWildcards<Named, Count, Acc, Opt> : Rest extends `*${infer Tail}` ? ExtractWildcards<Tail, [...Count, unknown], Acc | (Tail extends "" | `${"/" | "{" | "}"}${string}` ? [`${Count["length"]}`, true, true] : [`${Count["length"]}`, Opt, false]), Opt> : ExtractWildcards<Rest, [...Count, unknown], Acc | [`${Count["length"]}`, S extends true ? Rest extends "" | "/" | `{${string}}?` ? true : Opt : Opt, false], Opt> : ExtractWildcards<Rest, Count, Acc, Opt, C extends "/" ? true : false> : Acc;
type EndingStar<S extends string, Otherwise extends boolean> = S extends `(.*)${"" | "/" | `{${string}}?`}` ? true : Otherwise;
type GroupOptional<TPath extends string> = TPath extends `{${string}}${infer After}` ? After extends `?${string}` ? true : false : false;
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Lower = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m";
type Lower2 = "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
type WordChar = Digit | Lower | Lower2 | Uppercase<Lower | Lower2> | "_";
type NameRun<S extends string, Name extends string = ""> = S extends `${infer C}${infer Rest}` ? C extends WordChar | "$" ? NameRun<Rest, `${Name}${C}`> : Name : Name;
type ValidName<Name extends string> = Name extends "" | `${Digit}${string}` | `${string}$${string}` ? never : Name;
type SkipGroup<S extends string, Depth extends unknown[] = []> = S extends `${infer C}${infer Rest}` ? C extends "\\" ? SkipGroup<Rest extends `${string}${infer R}` ? R : Rest, Depth> : C extends "(" ? SkipGroup<Rest, [...Depth, C]> : C extends ")" ? Depth extends [unknown, ...infer D] ? D extends [] ? Rest : SkipGroup<Rest, D> : SkipGroup<Rest, Depth> : SkipGroup<Rest, Depth> : S;
type ExtractParams<TPath extends string, Start extends boolean = true> = TPath extends `${infer Pre}:${infer Rest}` ? Pre extends `${string}${"\\" | "(?"}` ? ExtractParams<Rest, false> : ParamAt<Rest, NameRun<Rest>, Pre extends "" ? Start : Pre extends `${string}/` ? true : false> : never;
type ParamAt<Rest extends string, Name extends string, Segment extends boolean> = Rest extends `${Name}${infer After}` ? AfterConstraint<After> extends (infer Tail extends string) ? (Name extends ValidName<Name> ? [Name, OptionalParam<Tail> extends true ? true : Segment extends true ? EndingStar<After, false> : false] : never) | ExtractParams<Tail, false> : never : never;
type AfterConstraint<S extends string> = S extends `(${string}` ? SkipGroup<S> : S;
type OptionalParam<Tail extends string> = Tail extends `${"?" | "*"}${"" | `/${string}`}` | `}?${string}` ? true : false;
type StripParams<TPath extends string> = TPath extends `${infer Prefix}**:${infer Rest}` ? Rest extends `${infer Name}/${infer Tail}` ? `${StripParams<Prefix>}**:${Name}/${StripParams<Tail>}` : `${StripParams<Prefix>}**:${Rest}` : TPath extends `${infer Prefix}:${infer Rest}` ? Prefix extends `${string}${"\\" | "(?"}` ? `${Prefix}:${StripParams<Rest>}` : `${Prefix}:${StripParams<StripModifier<AfterConstraint<AfterName<Rest>>>>}` : TPath;
type AfterName<S extends string> = S extends `${NameRun<S>}${infer After}` ? After : S;
type StripModifier<S extends string> = S extends `${"?" | "+" | "*"}${infer After}` ? After : S;
type InferRouteParams<TPath extends string> = { [Param in ExtractParams<TPath> as Param[0]]: Param[1] extends true ? string | undefined : string; } & { [Wildcard in ExtractWildcards<StripParams<TPath>> as Wildcard[0]]: Wildcard[1] extends true ? string | undefined : string; } & (true extends ExtractWildcards<StripParams<TPath>>[2] ? DoubleStarAlias : unknown) extends (infer Params) ? { [K in keyof Params]: Params[K]; } : never;
/** The deprecated `_` alias of a bare `**` capture. */
interface DoubleStarAlias {
  /**
   * The bare `**` capture, also under its numbered key (`"0"`, `"1"`, …).
   *
   * @deprecated Kept for 0.x compatibility: read the numbered key.
   */
  _?: string;
}
/**
 * Create a new router. `T` is the type of the route data.
 */
export declare function createRouter<T = unknown>(): RouterContext<T>;
/**
 * Add a route to the router. `data` is returned when the route matches.
 *
 * `method` is an HTTP method (upper-cased), or `""` for every method. `path` is
 * a route pattern (see README "Route patterns"):
 *
 * - `:name` matches one segment, `:name(regex)` one the regex matches, and an
 *   unnamed `(regex)` captures into a numbered key (`"0"`, `"1"`, …).
 * - `:name?`, `:name+` and `:name*` match zero or one, one or more, and zero or
 *   more segments.
 * - `*` (or `(.*)`) matches the rest of the path, `/` included, and is optional
 *   at the end of a route. `**` matches zero or more segments, `**:name` one or
 *   more into `name`.
 * - `{...}` groups text, and `{...}?` makes it optional.
 *
 * Literal text is percent-encoded (`/café` is `/caf%C3%A9`), and a pattern
 * without a leading `/` gets one.
 *
 * `.` / `..` segments are resolved like `new URL()` resolves a path
 * (`/foo/../bar` is `/bar`, see docs/reference.md "Dot segments").
 *
 * @throws a `rou3:` error quoting the pattern when its syntax has no meaning
 * (see docs/reference.md "Invalid patterns"): for example an unclosed `(` or `{`, a
 * misplaced modifier (`*?`, `/foo?`), an invalid or repeated param name (`/:0`,
 * `/a/:x/:x`), a second catch-all (`/*\/x/*`), a capturing group, anchor,
 * look-around or backreference in a regex constraint, a raw tab, LF or CR
 * (URLPattern drops it; write `%09`, `%0A`, `%0D`), or a `.` / `..` segment
 * next to a param, catch-all or group (`/:id/..`, `/a/../:id`).
 */
export declare function addRoute<T>(ctx: RouterContext<T>, method: string | undefined, path: string, data?: T): void;
/**
 * Find the most specific route that matches `path`.
 *
 * `method` must be uppercase; routes added for `""` match every method. `path`
 * must start with `/` and be percent-encoded, as `new URL().pathname` gives it:
 * lookup paths are never decoded. One trailing slash is ignored.
 *
 * Options: `params: false` skips building `params`, and `normalize: true`
 * resolves `.` and `..` segments first.
 *
 * @returns the route's `data` and `params` (no `params` for a static route), or
 * `undefined` when no route matches.
 */
export declare function findRoute<T = unknown>(ctx: RouterContext<T>, method: string | undefined, path: string, opts?: {
  params?: boolean;
  normalize?: boolean;
}): MatchedRoute<T> | undefined;
/**
 * Remove the route added by `addRoute(ctx, method, path)`.
 *
 * It removes everything that call added (every variant of an optional pattern,
 * and duplicate registrations), and leaves other routes alone, even ones on the
 * same tree node (`/a/:id` and `/a/:name`). Pass the pattern as it was added:
 * only spellings the router can't tell apart are equivalent (`/a/` and `/a`,
 * `/docs/../api` and `/api`).
 *
 * @throws the `addRoute` error for a reserved group or modifier (`{...}+`,
 * `/a/pre-:x+`, `/:id/..`). Other malformed patterns remove nothing.
 */
export declare function removeRoute<T>(ctx: RouterContext<T>, method: string | undefined, path: string): void;
/**
 * Find every route that matches `path`, from the least to the most specific.
 * This order is part of the public API (see README "Result ordering").
 *
 * Takes the same `method`, `path` and options as {@link findRoute}.
 */
export declare function findAllRoutes<T>(ctx: RouterContext<T>, method: string | undefined, path: string, opts?: {
  params?: boolean;
  normalize?: boolean;
}): MatchedRoute<T>[];
/**
 * How the match-sets of two route patterns relate. See {@link compareRoutes}.
 */
type RouteComparison = "disjoint" | "equal" | "superset" | "subset" | "partial";
/**
 * Whether at least one path matches both patterns.
 *
 * Patterns are read the same way `addRoute` reads them, so the answer agrees
 * with `findRoute`. Two dynamic segments where at least one has a regex
 * constraint are assumed to overlap (`/u/:id(\d+)` and `/u/:s([a-z]+)` give
 * `true`), so `true` can be a false positive, but `false` is always exact.
 *
 * @example
 * routesOverlap("/**", "/protected/feed/**"); // true
 * routesOverlap("/a/**", "/b/**"); // false
 * routesOverlap("/a/**", "/a"); // true (`**` matches zero segments)
 */
export declare function routesOverlap(patternA: string, patternB: string): boolean;
/**
 * Compare the sets of paths two patterns match. Reads as "`patternA` is … of
 * `patternB`":
 *
 * - `"equal"`: both match the same paths (param names don't matter).
 * - `"superset"`: `patternA` matches every path `patternB` matches, and more.
 * - `"subset"`: `patternB` matches every path `patternA` matches, and more.
 * - `"disjoint"`: no path matches both.
 * - `"partial"`: none of the above could be proven. The patterns may share
 *   some paths.
 *
 * Every other verdict is proven. When something can't be decided, the answer
 * is a weaker verdict, never a wrong one: two different regex constraints
 * compare as `"partial"` even when they are equivalent (`/u/:id(\d+)` and
 * `/u/:id([0-9]+)`), and an equal pair that is provable in one direction only
 * is a `"superset"` or `"subset"` (`/u/:id(42)` and `/u/42`).
 *
 * Patterns are read the same way `addRoute` reads them, so the answer agrees
 * with `findRoute`: `/a/*` is `"equal"` to `/a/**`, and `/a/:x*` is a
 * `"subset"` of `/a/**` (only `**` takes the empty segment of `/a//`).
 *
 * @example
 * compareRoutes("/api/**", "/api/admin/**"); // "superset"
 * compareRoutes("/a/:x/c", "/a/b/*"); // "partial"
 * compareRoutes("/a/**", "/b/**"); // "disjoint"
 */
export declare function compareRoutes(patternA: string, patternB: string): RouteComparison;
/**
 * Find every registered route that can match a path `pattern` matches. Like
 * {@link findAllRoutes}, but takes a pattern instead of a path.
 *
 * Results are in the same least to most specific order, with the same method
 * handling, and follow the overlap rules of {@link routesOverlap}. A route with
 * segments after a `**` comes right after the bare `**` it follows.
 *
 * Matches only have `data` (there is no single path to read params from). A
 * route added with optional syntax, or added again with the same data, is
 * reported once. Different routes (another pattern or method) are always
 * reported separately, even when they share the same `data`.
 */
export declare function findOverlappingRoutes<T>(ctx: RouterContext<T>, method: string | undefined, pattern: string): MatchedRoute<T>[];
/**
 * The route-tree nodes a pattern lands on, each named by a pattern.
 *
 * Routes on the same node compete: for a given path, `findRoute` returns at most
 * one of them. `/users/:id` and `/users/:name` share a node, and so do
 * `/users/*` and `/users/**:rest`. Key per-route metadata by these keys instead
 * of the pattern text to group it per node.
 *
 * - `routeNodeKeys(a)` and `routeNodeKeys(b)` share a key if and only if `a`
 *   and `b` share a node.
 * - A param segment is keyed `:_0`, `:_1`, …, and a catch-all `**`.
 * - A pattern with optional syntax (`:x?`, `:x*`, `{...}?`) lands on several
 *   nodes, so the result is an array (deduplicated, outermost first).
 * - Each key is a valid pattern for its own node: `routeNodeKeys(key)` is
 *   `[key]`.
 * - Invalid patterns throw like `addRoute`.
 *
 * Sharing a node doesn't mean matching the same paths: keys drop regex
 * constraints, so `/u/:id(\d+)` and `/u/:slug([a-z]+)` share `/u/:_0` but never
 * match the same path. Use {@link compareRoutes} to compare matched paths.
 *
 * @example
 * routeNodeKeys("/users/:id"); // ["/users/:_0"]
 * routeNodeKeys("/users/:name"); // ["/users/:_0"] (same node)
 * routeNodeKeys("/admin/*"); // ["/admin/**"] (the node of `/admin/**`)
 * routeNodeKeys("/**:path/_payload.json"); // ["/**\/_payload.json"]
 * routeNodeKeys("/a/:x?"); // ["/a", "/a/:_0"]
 */
export declare function routeNodeKeys(pattern: string): string[];
/**
 * Convert a route pattern into an anchored {@link RegExp}, with a named group
 * per param (`_0`, `_1`, … for unnamed captures).
 *
 * The regex matches exactly the paths `findRoute` matches on a router holding
 * only `route`, including its tolerances (one trailing slash, empty segments
 * for `*` and `**`, an optional trailing `*`), so it can guard a scope outside
 * the router. The one exception is a regex constraint that can match `/`
 * (`(.+)`): the router applies it to one segment, while the regex lets it span
 * several, so the regex matches more paths, never fewer. `.` and `..` in the
 * path (`normalize`) and the empty path are not modeled; in `route` they are
 * resolved, as in `addRoute`.
 *
 * The output is PCRE-compatible (`grep -P`, PHP `preg_*`, Perl), and most routes
 * also work in RE2-family engines (RE2, Go, Rust `regex`). Some optional
 * combinations (several groups, `/media/*{.webp}?`) compile to an alternation
 * with duplicate named groups, which needs a JS engine that supports them (V8
 * 12.5+) or `PCRE2_DUPNAMES`. Without them (Node.js 22), `routeToRegExp` throws
 * a `rou3:` `SyntaxError` for these routes.
 *
 * Params sharing a segment are spelled out where their split is forced
 * (`/:a-:b` is `(?<a>[^/][^/-]*)-(?<b>[^/]+?)`), so the regex fails a path in
 * linear time instead of retrying every split; a few shapes still backtrack
 * quadratically in a long failing segment (see docs/reference.md "Backtracking").
 *
 * @throws the `addRoute` error for an invalid pattern, and a `rou3:` error for
 * a pattern that declares the same param name twice in one variant
 * (`/files/:path/**:path`, `/a/:x{/b/:x}?`).
 *
 * @example
 * routeToRegExp("/users/:id(\\d+)"); // /^\/users\/(?<id>\d+)\/?$/
 * routeToRegExp("/blog/:id(\\d+){-:title}?"); // /^\/blog\/(?<id>\d+)(?:-(?<title>[^/]+?))?\/?$/
 * routeToRegExp("/v:version?"); // /^\/v(?:(?<version>[^/]+?))?\/?$/
 */
export declare function routeToRegExp(route?: string): RegExp;
/**
 * Convert a {@link RegExp} (or its source) from {@link routeToRegExp} back into
 * a route pattern. Every regex `routeToRegExp` emits round-trips:
 * `routeToRegExp(regExpToRoute(re)).source === re.source`. Looser forms that
 * older versions emitted are read too.
 *
 * @throws a `rou3:` error for anything it can't convert exactly: a regex not
 * anchored with `^` and `$`, the flags `i`, `m`, `s`, `u` and `v` (`g`, `y` and
 * `d` are ignored), and constructs `routeToRegExp` doesn't emit.
 *
 * @example
 * regExpToRoute(/^\/users\/(?<id>\d+)\/?$/); // "/users/:id(\\d+)"
 * regExpToRoute(/^\/path\/(?<param>[^/]+)\/?$/); // "/path/:param"
 * regExpToRoute(/^\/path(?:\/(?<_0>(?:[\s\S]*[^/])?\/*?))??\/?$/); // "/path/**"
 * regExpToRoute(/^\/path\/(?<_0>(?:[\s\S]*[^/])?\/*?)\/?$/); // "/path/*"
 * regExpToRoute(/^\/path(?:\/(?<p>(?:[\s\S]*[^/])?\/*?))?\/?$/); // "/path/:p(.*)"
 */
export declare function regExpToRoute(regexp: RegExp | string): string;
export declare const NullProtoObj: {
  new (): any;
};
export type { InferRouteParams, MatchedRoute, RouteComparison, RouterContext };