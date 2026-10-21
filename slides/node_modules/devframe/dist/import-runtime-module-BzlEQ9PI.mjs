import { i as resolveServicePackage, r as importServicePackage } from "./services-install-D5YUwFXW.mjs";
//#region src/node/import-runtime-module.ts
/**
* Resolve and import a package at runtime without adding it to a consumer's
* bundle graph. First-party adapters use this for modules whose code is
* needed only when the matching feature is enabled (optional peers, and the
* MCP adapter with the SDK behind it).
*
* @internal
*/
async function importRuntimeModule(specifier) {
	return await importServicePackage(specifier, [import.meta.url]);
}
/**
* Whether {@link importRuntimeModule} would resolve `specifier`, without
* importing anything. The zero-cost probe behind optional-peer decisions.
*
* @internal
*/
function isRuntimeModuleResolvable(specifier) {
	return resolveServicePackage(specifier, [import.meta.url]) !== void 0;
}
//#endregion
export { isRuntimeModuleResolvable as n, importRuntimeModule as t };
