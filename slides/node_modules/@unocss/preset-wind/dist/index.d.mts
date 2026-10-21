import { PresetWind3Options, Theme } from "@unocss/preset-wind3";
//#region src/index.d.ts
export interface PresetWindOptions extends PresetWind3Options {}
/**
 * @deprecated Use `presetWind3` from `@unocss/preset-wind3` instead
 */
export declare const presetWind: import("@unocss/core").PresetFactory<Theme, PresetWindOptions>;
//#endregion
export { type Theme, presetWind as default };