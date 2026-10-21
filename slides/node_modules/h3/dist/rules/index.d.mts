import { BuiltinRouteRules, CacheRuleOptions, EventHandler, H3Event, HTTPStatus, MatchResult, MatchedRouteRule, MatchedRouteRules, Middleware, NormalizedRouteRules, ProxyRuleOptions, RedirectRuleOptions, ResolvedRouteRules, RouteRuleConfig, RouteRules, RuleHandler, RuleHandlers } from "../h3.mjs";
import { FindRouteRules, MatcherMemoizeOptions, RouteRuleEntry, RouteRuleLayer, RouteRulesMatcher, RouteRulesMatcherOptions, createMatcherFromFind, createRouteRulesMatcher, memoizeRouteRulesMatcher, mergeMatchedRouteRules } from "../match.mjs";

interface RouteRulesOptions extends RouteRulesMatcherOptions {
  /**
   * Memoize matches by method and pathname. Enabled by default with a 1024-entry
   * cap; shared results must be treated as read-only.
   * @default true
   */
  memoize?: boolean | MatcherMemoizeOptions;
}
/**
 * Match route rules, expose merged options on `event.context.routeRules`, and
 * run their middleware before the route handler.
 *
 * Results are memoized and shared by default; treat exposed rule options as
 * read-only or disable memoization.
 */
export declare function routeRules(config: Record<string, RouteRuleConfig>, opts?: RouteRulesOptions): Middleware;
/**
 * Normalize authored route rules by expanding shortcuts, canonicalizing keys,
 * and validating built-in options. Custom rules pass through unchanged.
 */
export declare function normalizeRouteRules(config: Record<string, RouteRuleConfig>): Record<string, NormalizedRouteRules>;
/**
 * Default handler registry. Cache and proxy handlers are opt-in from their
 * subpath exports; set either to `undefined` explicitly for data-only rules.
 */
export declare const ruleHandlers: RuleHandlers;
export declare const headers: RuleHandler<"headers">;
export declare const redirect: RuleHandler<"redirect">;
export declare const cors: RuleHandler<"cors">;
/** Wrap an event handler with an injected cache implementation. */
type DefineCachedHandler = (handler: EventHandler, opts: CacheRuleOptions) => EventHandler;
/** Options for {@link createCacheRuleHandler}. */
interface CacheRuleHandlerOptions {
  /** Creates the cached wrapper for a matched route handler. */
  defineCachedHandler: DefineCachedHandler;
  /**
   * Requests the implementation never reads or writes a cache entry for.
   * The rule continues the middleware chain for them instead of dispatching the
   * matched route itself, so an uncacheable request reaches the rest of the app
   * the way a CDN passes one through to its origin. Without it, *every* request
   * to a matched route terminates the chain, whether or not it is cached.
   */
  shouldBypass?: (event: H3Event) => boolean;
  /** Default options merged into every cache rule (rule options win). */
  defaults?: CacheRuleOptions;
  /**
   * Stable cache-key scope. By default, a process-unique scope isolates apps
   * but prevents persistent cache sharing across processes.
   */
  id?: string;
}
/**
 * Create a `cache` rule handler from an injected cache wrapper.
 *
 * Cache keys are isolated by handler, method, and route unless `id` or an
 * explicit cache `name` opts into sharing.
 *
 * Registering `routeRules()` as *route* middleware puts this rule inside the
 * handler it dispatches; the re-entrant pass falls through (see {@link dispatching}).
 *
 * Register `routeRules()` after every global middleware that must run for a
 * cached route: this handler dispatches the matched route handler itself rather
 * than calling `next()`, so global middleware registered after `routeRules()` is
 * skipped on *every* cacheable request to a `cache`-matched route — misses
 * included, not only hits. Per-route middleware is unaffected (it is part of the
 * dispatched `~composed` pair).
 *
 * Requests the implementation reports as uncacheable through
 * {@link CacheRuleHandlerOptions.shouldBypass} continue down the chain instead
 * of being dispatched from inside the rule, so which global middleware runs for
 * a matched route can depend on the request.
 */
export declare function createCacheRuleHandler(opts: CacheRuleHandlerOptions): RuleHandler<"cache">;
export { type BuiltinRouteRules, type CacheRuleHandlerOptions, type CacheRuleOptions, type DefineCachedHandler, type FindRouteRules, type HTTPStatus, type MatchResult, type MatchedRouteRule, type MatchedRouteRules, type MatcherMemoizeOptions, type NormalizedRouteRules, type ProxyRuleOptions, type RedirectRuleOptions, type ResolvedRouteRules, type RouteRuleConfig, type RouteRuleEntry, type RouteRuleLayer, type RouteRules, type RouteRulesMatcher, type RouteRulesMatcherOptions, type RouteRulesOptions, type RuleHandler, type RuleHandlers, createMatcherFromFind, createRouteRulesMatcher, memoizeRouteRulesMatcher, mergeMatchedRouteRules };