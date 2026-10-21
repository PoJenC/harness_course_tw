import { Extractor, VariantObject } from "@unocss/core";
//#region src/types.d.ts
export interface TagifyOptions {
  /**
   * The prefix to use for the tagify variant.
   */
  prefix?: string;
  /**
   * Tags excluded from processing.
   * @default ['b', /^h\d+$/, 'table']
   */
  excludedTags?: (string | RegExp)[];
  /**
   * Extra CSS properties to apply to matched rules
   */
  extraProperties?: Record<string, string> | ((matched: string) => Partial<Record<string, string>>);
  /**
   * Enable default extractor
   * @default true
   */
  defaultExtractor?: boolean;
}
//#endregion
//#region src/extractor.d.ts
export declare const MARKER = "__TAGIFY__";
export declare const htmlTagRE: RegExp;
export declare function extractorTagify(options: TagifyOptions): Extractor;
//#endregion
//#region src/variant.d.ts
export declare function variantTagify(options: TagifyOptions): VariantObject;
//#endregion
//#region src/index.d.ts
/**
 * @see https://unocss.dev/presets/tagify
 */
export declare const presetTagify: import("@unocss/core").PresetFactory<object, TagifyOptions>;
//#endregion
export { presetTagify as default };