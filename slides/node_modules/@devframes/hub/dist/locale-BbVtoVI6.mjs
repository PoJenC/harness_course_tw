//#region src/locale.ts
/**
* Pick the tag in `available` closest to `tag`: exact match first, then
* the Traditional Chinese family (`zh-Hant`, `zh-HK`, `zh-MO` → `zh-TW`),
* then the first tag sharing the language (`pt-PT` → `pt-BR`, `en-GB` → `en`).
*/
function matchLocale(tag, available) {
	if (!tag) return void 0;
	const tags = [...available];
	const wanted = tag.toLowerCase();
	const exact = tags.find((code) => code.toLowerCase() === wanted);
	if (exact) return exact;
	const [language, ...rest] = wanted.split("-");
	if (language === "zh" && rest.some((part) => part === "hant" || part === "hk" || part === "mo" || part === "tw")) {
		const traditional = tags.find((code) => code.toLowerCase() === "zh-tw");
		if (traditional) return traditional;
	}
	return tags.find((code) => code.toLowerCase().split("-")[0] === language);
}
/** The `title` of a dock entry, command or launcher in `locale`, else its default `title`. */
function resolveTitle(titled, locale) {
	const locales = titled.titleLocales;
	if (!locales) return titled.title;
	const matched = matchLocale(locale, Object.keys(locales));
	return matched ? locales[matched] : titled.title;
}
//#endregion
export { resolveTitle as n, matchLocale as t };
