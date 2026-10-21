import { MatchResult, MatchedRouteRule, MatchedRouteRules, NormalizedRouteRules, RuleHandlers } from "./h3.mjs";

interface PreMergedRouteRules {
  /** The pattern this layer is registered at (params lookup key). */
  route: string;
  /**
   * Containment depth of {@link route}: how many patterns of the rule set
   * strictly subsume it. Any set of simultaneously matched patterns is a
   * containment chain (partial overlaps are rejected below), and depth
   * strictly increases along a chain — if `a` subsumes `b` then every subsumer
   * of `a` also subsumes `b`, plus `a` itself — so the most specific matched
   * layer is the one with the highest rank.
   *
   * Layer *position* cannot be used for this — see {@link RouteRuleEntry.rank}
   * for rou3's documented optional-syntax carve-out and what taking the last
   * layer costs. The chain-cleanliness check below cannot catch that case
   * either: those pairs are `subset`, not `partial`, so nothing throws and the
   * compiler's fail-safe fallback never fires.
   */
  rank: number;
  rules: PreMergedRouteRuleEntry[];
  /**
   * Rule names this chain reset with `false`, when any. The reset itself is
   * applied here at build time, so the resolved `rules` cannot show it — but the
   * cross-reading union has to tell "reset by this path" apart from "never
   * matched" to stop a broader alternate reading resurrecting a permission
   * (`mergeMatchedRouteRules`). Plain mode reads the same information off the
   * `false` entries it merges per request; recording it keeps both modes — and
   * the compiled table — resolving alike. The pattern that reset a rule is not
   * kept: the union records the reset at this layer's {@link route}, which is
   * inside every pattern of its chain, so only a pattern at least that specific
   * may reinstate the rule — never more than plain mode allows.
   */
  resets?: string[];
}
interface PreMergedRouteRuleEntry extends RouteRuleEntry {
  /**
   * Patterns whose layers contributed to this rule (chain order), when different
   * from `[route]` — used to merge exact per-rule `params` from only the layers
   * that carried the rule.
   */
  paramRoutes?: string[];
}
/** Decide whether an alternate path reading may override a matched rule. */
type RouteOverridePredicate = (currentRoute: string, incomingRoute: string) => boolean;
/** One normalized rule registered for a route pattern. */
export interface RouteRuleEntry {
  name: string;
  route: string;
  options: unknown;
  handler?: MatchedRouteRule["handler"];
  /**
   * Pattern-containment depth. Required because rou3 result order is not
   * containment order for optional/modifier parameters.
   */
  rank?: number;
}
/** A matched route layer containing rule data and route parameters. */
export interface RouteRuleLayer {
  data: RouteRuleEntry[] | PreMergedRouteRules;
  params?: Record<string, string>;
}
/**
 * Merge served-path and alternate-reading layers. Alternate readings may add
 * rules but override existing ones only when `canOverride` permits it.
 */
export declare function mergeMatchedRouteRules(rawLayers: RouteRuleLayer[] | undefined, altLayers?: readonly (RouteRuleLayer[] | undefined)[], canOverride?: RouteOverridePredicate): MatchedRouteRules;
export interface RouteRulesMatcherOptions {
  /**
   * Base URL prefix for all rule patterns (trailing slash trimmed).
   */
  baseURL?: string;
  /**
   * Add or override rule handler constructors by name.
   * Registry defaults are `headers`, `redirect`, `cors`; `cache` and
   * `proxy` are opt-in (register them from `h3/rules/cache` / `h3/rules/proxy`).
   * Setting a name to `undefined` makes that rule data-only.
   */
  handlers?: RuleHandlers;
  /**
   * Pre-merge compatible pattern chains at startup. Throws for partial overlaps
   * or patterns that cannot be analyzed, such as regex parameters.
   */
  preMerge?: boolean;
}
export interface MatcherMemoizeOptions {
  /**
   * Maximum number of memoized `method + pathname` entries. On overflow the
   * oldest entry not hit since the eviction hand last passed it is evicted
   * (SIEVE). `0` (or negative) disables memoization.
   * @default 1024
   */
  max?: number;
}
export type RouteRulesMatcher = (method: string, pathname: string) => MatchResult;
/** A `findAllRoutes`-compatible lookup, as produced by `rou3/compiler` codegen. */
export type FindRouteRules = (method: string, pathname: string) => RouteRuleLayer[];
/**
 * Create a route-rules matcher from a **normalized** rule set (see {@link normalizeRouteRules}).
 * Returns `(method, pathname) => { routeRules, matchedRules, routeRuleMiddleware }`.
 */
export declare function createRouteRulesMatcher(rules: Record<string, NormalizedRouteRules>, opts?: RouteRulesMatcherOptions): RouteRulesMatcher;
/**
 * Create a matcher from a `findAllRoutes`-compatible lookup, typically generated
 * by `h3/rules/compiler`.
 *
 * Results are not memoized. The default override guard fails closed when route
 * specificity is ambiguous.
 */
export declare function createMatcherFromFind(findRouteRules: FindRouteRules, canOverride?: RouteOverridePredicate): RouteRulesMatcher;
/**
 * Memoize matches by method and pathname with a 1024-entry cap by default.
 * Returned objects are shared and must be treated as immutable.
 *
 * Eviction is SIEVE: insertion-ordered like a FIFO, but an entry hit since the
 * hand last passed it survives that pass. Plain FIFO evicts a hot static path
 * on the same schedule as the one-shot dynamic paths that displaced it, so a
 * mixed workload (a small hot set plus high-cardinality `/:id` traffic) loses
 * cached entries it is about to ask for again. Unlike LRU this costs no map
 * mutation on a hit — only a boolean store — which keeps the hot path the
 * single lookup the memo exists to provide.
 */
export declare function memoizeRouteRulesMatcher(matcher: RouteRulesMatcher, opts?: MatcherMemoizeOptions): RouteRulesMatcher;
export {};