import { C as Theme } from "./theme-gMSdOuKp.mjs";
import { Arrayable, CSSEntry, CSSObject, CSSValueInput, DynamicMatcher, RuleContext, StaticRule, UtilObject, VariantContext } from "@unocss/core";
export * from "@unocss/rule-utils";
//#region src/utils/constant.d.ts
export declare const PRESET_NAME = "@unocss/preset-wind4";
export declare const CONTROL_NO_NEGATIVE = "$$mini-no-negative";
export declare const SpecialColorKey: {
  transparent: string;
  current: string;
  inherit: string;
};
declare namespace handlers_d_exports {
  export { auto, bracket, bracketOfColor, bracketOfFamily, bracketOfLength, bracketOfNumber, bracketOfPosition, cssvar, degree, fraction, global, none, number, numberWithUnit, percent, position, properties, px, rem, time };
}
declare function numberWithUnit(str: string): string | undefined;
declare function auto(str: string): "auto" | undefined;
declare function rem(str: string): string | undefined;
declare function px(str: string): string | undefined;
declare function number(str: string): number | undefined;
declare function percent(str: string): string | undefined;
declare function fraction(str: string): string | undefined;
declare function bracket(str: string, theme?: Theme): string | undefined;
declare function bracketOfColor(str: string, theme?: Theme): string | undefined;
declare function bracketOfLength(str: string, theme?: Theme): string | undefined;
declare function bracketOfPosition(str: string, theme?: Theme): string | undefined;
declare function bracketOfFamily(str: string, theme?: Theme): string | undefined;
declare function bracketOfNumber(str: string, theme?: Theme): string | undefined;
declare function cssvar(str: string): string | undefined;
declare function time(str: string): string | undefined;
declare function degree(str: string): string | undefined;
declare function global(str: string): string | undefined;
declare function properties(str: string): string | undefined;
declare function position(str: string): string | undefined;
declare function none(str: string): "none" | undefined;
//#endregion
//#region src/utils/handlers/index.d.ts
export declare const handler: import("@unocss/rule-utils").ValueHandler<string, Theme>;
export declare const h: import("@unocss/rule-utils").ValueHandler<string, Theme>;
//#endregion
//#region src/utils/mappings.d.ts
export declare const directionMap: Record<string, string[]>;
export declare const insetMap: Record<string, string[]>;
export declare const cornerMap: Record<string, string[]>;
export declare const xyzMap: Record<string, string[]>;
export declare const xyzArray: string[];
export declare const positionMap: Record<string, string>;
export declare const globalKeywords: string[];
export declare const cssMathFnRE: RegExp;
export declare const cssVarFnRE: RegExp;
//#endregion
//#region src/utils/track.d.ts
/**
 * Used to track theme keys.
 *
 * eg: colors:red-100
 *
 * @internal
 */
export declare const trackedTheme: Set<string>;
export declare function themeTracking(key: string, props?: Arrayable<string>): void;
export declare function generateThemeVariable(key: string, props: Arrayable<string>): string;
export declare function detectThemeValue(value: string, theme: Theme): void;
export declare const trackedProperties: Map<string, string>;
export declare function propertyTracking(property: string, value: string): void;
//#endregion
//#region src/utils/unit-resolver.d.ts
export declare function createRemToPxProcessor(base?: number): (utilObjectOrEntry: UtilObject | CSSEntry) => void;
//#endregion
//#region src/utils/utilities.d.ts
export declare function numberResolver(size: string, defaultValue?: string | number): number | undefined;
/**
 * Returns a {@link DynamicMatcher} that generates spacing CSS properties for directional utilities.
 *
 * @param property - The base CSS property name (e.g. 'margin', 'padding').
 * @param map - Optional mapping of direction keys to property postfixes. Defaults to {@link directionMap}.
 * @param formatter - Optional function to format the final property name. Defaults to `(p, d) => \`\${p}\${d}\``.
 */
export declare function directionSize(property: string, map?: Record<string, string[]>, formatter?: (p: string, d: string) => string): DynamicMatcher<Theme>;
/**
 * Split utility shorthand delimited by / or :
 */
export declare function splitShorthand(body: string, type: string): string[] | undefined;
/**
 * Parse color string into {@link ParsedColorValue} (if possible). Color value will first be matched to theme object before parsing.
 * See also color.tests.ts for more examples.
 *
 * @example Parseable strings:
 * 'red' // From theme, if 'red' is available
 * 'red-100' // From theme, plus scale
 * 'red-100/20' // From theme, plus scale/opacity
 * '[rgb(100 2 3)]/[var(--op)]' // Bracket with rgb color and bracket with opacity
 * '[rgb(100 2 3)]/[var(--op)]/[in_oklab]' // Bracket with rgb color, bracket with opacity and bracket with interpolation method
 *
 * @param body - Color string to be parsed.
 * @param theme - {@link Theme} object.
 * @return object if string is parseable.
 */
export declare function parseColor(body: string, theme: Theme): {
  opacity: string | undefined;
  modifier: string | undefined;
  name: string;
  no: string | undefined;
  color: string;
  alpha: string | undefined;
  /**
   * Keys means the color is from theme object.
   */
  keys: string[] | undefined;
  readonly cssColor: import("@unocss/rule-utils").CSSColorValue | undefined;
} | undefined;
export declare function parseThemeColor(theme: Theme, keys: string[]): {
  color: string;
  no: string | undefined;
  keys: string[] | undefined;
} | undefined;
export declare function getThemeByKey(theme: Theme, themeKey: keyof Theme, keys: string[]): any;
export declare function colorCSSGenerator(data: ReturnType<typeof parseColor>, property: string, varName: string, ctx?: RuleContext<Theme>): [CSSObject, ...CSSValueInput[]] | undefined;
export declare function colorResolver(property: string, varName: string): ([, body]: string[], ctx: RuleContext<Theme>) => (CSSValueInput | string)[] | undefined;
export declare function colorableShadows(shadows: string | string[], colorVar: string, alpha?: string): string[];
export declare function hasParseableColor(color: string | undefined, theme: Theme): boolean;
export declare function resolveBreakpoints({ theme, generator }: Readonly<VariantContext<Theme>>, key?: 'breakpoint' | 'verticalBreakpoint'): {
  point: string;
  size: string;
}[] | undefined;
export declare function resolveVerticalBreakpoints(context: Readonly<VariantContext<Theme>>): {
  point: string;
  size: string;
}[] | undefined;
export declare function makeGlobalStaticRules(prefix: string, property?: string): StaticRule[];
export declare function defineProperty(property: string, options?: {
  syntax?: string;
  inherits?: boolean;
  initialValue?: unknown;
}): CSSValueInput;
export declare function isSize(str: string): boolean;
export declare function camelize(str: string): string;
export declare function hyphenate(str: string): string;
export declare function compressCSS(css: string, isDev?: boolean): string;
//#endregion
export { handlers_d_exports as valueHandlers };