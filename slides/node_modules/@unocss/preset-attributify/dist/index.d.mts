import { AutoCompleteExtractor, Extractor, PresetOptions, VariantObject } from "@unocss/core";
//#region src/types.d.ts
export interface AttributifyOptions extends PresetOptions {
  /**
   * Only generate CSS for attributify or class
   *
   * @default false
   */
  strict?: boolean;
  /**
   * @default 'un-'
   */
  prefix?: string;
  /**
   * Only match for prefixed attributes
   *
   * @default false
   */
  prefixedOnly?: boolean;
  /**
   * Support matching non-valued attributes
   *
   * For example
   * ```html
   * <div mt-2 />
   * ```
   *
   * @default true
   */
  nonValuedAttribute?: boolean;
  /**
   * A list of attributes to be ignored from extracting.
   */
  ignoreAttributes?: string[];
  /**
   * Non-valued attributes will also match if the actual value represented in DOM is `true`.
   * This option exists for supporting frameworks that encodes non-valued attributes as `true`.
   * Enabling this option will break rules that ends with `true`.
   *
   * @default false
   */
  trueToNonValued?: boolean;
}
//#endregion
//#region src/autocomplete.d.ts
export declare function autocompleteExtractorAttributify(options?: AttributifyOptions): AutoCompleteExtractor;
//#endregion
//#region src/extractor.d.ts
export declare const defaultIgnoreAttributes: string[];
export declare function extractorAttributify(options?: AttributifyOptions): Extractor;
//#endregion
//#region src/jsx.d.ts
export type TwoStringsCompositionPrefix = 'm' | 'p';
export type TwoStringsCompositionSuffix = 'r' | 'b' | 'l' | 't' | 'a' | 'x' | 'y';
/** Some words can compose with two strings to become a complete unocss rule such as ha, mr, mb */
export type TwoStringsComposition = `${TwoStringsCompositionPrefix}${TwoStringsCompositionSuffix}` | 'ha' | 'wa';
/** Some words can be a complete unocss rule by itself */
export type SpecialSingleWord = 'container' | 'flex' | 'block' | 'inline' | 'table' | 'isolate' | 'absolute' | 'relative' | 'fixed' | 'sticky' | 'static' | 'visible' | 'invisible' | 'grow' | 'shrink' | 'antialiased' | 'italic' | 'ordinal' | 'overline' | 'underline' | 'uppercase' | 'lowercase' | 'capitalize' | 'truncate' | 'border' | 'rounded' | 'outline' | 'ring' | 'shadow' | 'blur' | 'grayscale' | 'invert' | 'sepia' | 'transition' | 'resize' | 'transform' | 'filter';
export type PseudoPrefix = 'active' | 'before' | 'after' | 'dark' | 'light' | 'first' | 'last' | 'focus' | 'hover' | 'link' | 'print' | 'root' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'enabled' | 'disabled' | 'all' | 'children';
/** Some words can be used to separate utilities, such as font="mono light", text="sm white" */
export type SeparateEnabled = 'align' | 'animate' | 'backdrop' | 'bg' | 'blend' | 'border' | 'box' | 'container' | 'content' | 'cursor' | 'display' | 'divide' | 'filter' | 'flex' | 'font' | 'fw' | 'gap' | 'gradient' | 'grid' | 'h' | 'icon' | 'items' | 'justify' | 'list' | 'm' | 'op' | 'opacity' | 'order' | 'outline' | 'overflow' | 'p' | 'place' | 'pos' | 'position' | 'ring' | 'select' | 'shadow' | 'size' | 'space' | 'table' | 'text' | 'transform' | 'transition' | 'underline' | 'w' | 'z' | PseudoPrefix;
export type BasicAttributes = SpecialSingleWord | TwoStringsComposition | SeparateEnabled;
export type AttributifyNames<Prefix extends string = ''> = `${Prefix}${BasicAttributes}` | `${Prefix}${PseudoPrefix}:${BasicAttributes}`;
export interface AttributifyAttributes extends Partial<Record<AttributifyNames, string | boolean>> {}
//#endregion
//#region src/variant.d.ts
export declare const variantsRE: RegExp;
export declare function variantAttributify(options?: AttributifyOptions): VariantObject;
//#endregion
//#region src/index.d.ts
/**
 * This enables the attributify mode for other presets.
 *
 * @example
 *
 * ```html
 * <button
 *   bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
 *   text="sm white"
 *   font="mono light"
 *   p="y-2 x-4"
 *   border="2 rounded blue-200"
 * >
 *   Button
 * </button>
 * ```
 *
 * @see https://unocss.dev/presets/attributify
 */
export declare const presetAttributify: import("@unocss/core").PresetFactory<object, AttributifyOptions>;
//#endregion
export { presetAttributify as default };