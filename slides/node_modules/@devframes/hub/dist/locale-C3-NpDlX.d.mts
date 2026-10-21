import { R as DevframeTitled } from "./settings-DPLPzYfX.mjs";
//#region src/locale.d.ts
/**
 * Pick the tag in `available` closest to `tag`: exact match first, then
 * the Traditional Chinese family (`zh-Hant`, `zh-HK`, `zh-MO` → `zh-TW`),
 * then the first tag sharing the language (`pt-PT` → `pt-BR`, `en-GB` → `en`).
 */
declare function matchLocale(tag: string | undefined, available: Iterable<string>): string | undefined;
/** The `title` of a dock entry, command or launcher in `locale`, else its default `title`. */
declare function resolveTitle(titled: DevframeTitled, locale: string | undefined): string;
//#endregion
export { resolveTitle as n, matchLocale as t };