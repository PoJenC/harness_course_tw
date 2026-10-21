import { WhenExpression as WhenExpression$1 } from "whenexpr";
//#region src/utils/when.d.ts
/**
 * Context object for evaluating `when` expressions.
 *
 * Built-in variables:
 * - `clientType`: `'embedded' | 'standalone'`
 * - `dockOpen`: whether the dock panel is open
 * - `paletteOpen`: whether the command palette is open
 * - `dockSelectedId`: ID of the selected dock entry (empty string if none)
 *
 * Plugins can add namespaced variables using dot or colon separators:
 * - `vite.mode`, `vite:mode`: stored as `{ 'vite.mode': 'development' }` or nested `{ vite: { mode: 'development' } }`
 *
 * Supported operators: `!`, `==`, `!=`, `===`, `!==`, `<`, `<=`, `>`, `>=`,
 * `&&`, `||`, `+`, `-`, `*`, `/`, `%`. Parentheses, number and string literals
 * are also supported.
 */
export interface WhenContext {
  clientType: 'embedded' | 'standalone';
  dockOpen: boolean;
  paletteOpen: boolean;
  dockSelectedId: string;
  /** Allow custom context variables from plugins */
  [key: string]: unknown;
}
/**
 * A statically-validated `when` expression string. Used inside `define*`
 * helpers to surface unknown context keys and syntax errors as TypeScript
 * errors at the call site.
 */
export type WhenExpression<T, S extends string> = WhenExpression$1<T, S>;
/** Options for `evaluateWhen`. */
export interface EvaluateWhenOptions {
  /**
   * Throw when the expression references a context key that does not exist.
   *
   * @default false
   */
  strict?: boolean;
}
/**
 * Evaluate a when-clause expression string against a context object.
 *
 * @example
 * evaluateWhen('dockOpen && clientType == embedded', ctx)
 */
export declare function evaluateWhen<T extends object, const E extends string>(expression: E & WhenExpression$1<T, E>, context: T, options?: EvaluateWhenOptions): boolean;
/**
 * Resolve a context value by key. Supports namespaced keys with `.` or `:`
 * separators. Returns `undefined` for unknown keys.
 */
export declare function resolveContextValue<T extends Record<string, unknown>>(key: string, context: T): unknown;
//#endregion