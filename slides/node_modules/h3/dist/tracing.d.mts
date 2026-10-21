import { EventHandler, H3Event, H3Plugin } from "./h3.mjs";

export interface TracingRequestEvent {
  type: "middleware" | "route";
  event: H3Event;
}
/**
 * Options for the tracing plugin.
 */
export interface TracingPluginOptions {
  /**
   * Whether to trace middleware executions.
   */
  traceMiddleware?: boolean;
  /**
   * Whether to trace route executions.
   */
  traceRoutes?: boolean;
}
/**
 * Enables tracing for H3 apps.
 */
export declare function tracingPlugin(traceOpts?: TracingPluginOptions): H3Plugin;
/**
 * Wraps an event handler so its execution is traced via the `h3.request`
 * diagnostics channel with `type: "route"`. Intended to be called once per
 * handler at initialization time (e.g. during codegen or module load), not
 * per request.
 *
 * Returns the handler unchanged when `diagnostics_channel` is unavailable
 * or the handler is already traced.
 */
export declare function wrapHandlerWithTracing(handler: EventHandler): EventHandler;