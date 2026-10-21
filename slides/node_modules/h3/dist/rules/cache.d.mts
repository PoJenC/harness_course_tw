import { RuleHandler } from "../h3.mjs";
import { CachedEventHandlerOptions, StorageOption } from "ocache";

export interface OcacheRuleHandlerOptions {
  /**
   * ocache storage instance, or a factory resolved on first use. Shared by every
   * cache rule this handler serves. Defaults to one lazily created memory store.
   */
  storage?: StorageOption;
  /**
   * Default ocache options. Rule options take precedence.
   *
   * A `shouldBypassCache` hook passed here is resolved inside the cache, so a
   * request it bypasses is still dispatched by the rule and does not continue
   * the middleware chain the way an uncacheable method or `Range` request does.
   */
  defaults?: CachedEventHandlerOptions;
  /** Stable cache-key scope. Set this when sharing persistent storage across processes. */
  id?: string;
}
/**
 * Create an ocache-backed `cache` rule handler.
 *
 * Every rule this handler serves shares one storage instance: the supplied
 * `storage`, or a memory store shared by every handler with the same `id`.
 */
export declare function createOcacheRuleHandler(opts?: OcacheRuleHandlerOptions): RuleHandler<"cache">;
/** Shared default handler imported by compiled matchers and registered explicitly at runtime. */
export declare const cache: RuleHandler<"cache">;