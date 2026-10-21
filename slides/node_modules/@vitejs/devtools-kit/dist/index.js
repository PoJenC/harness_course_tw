import { createDefineWrapperWithContext } from "devframe/rpc";
import { defineCommand, defineDockEntry } from "@devframes/hub";
//#region src/define.ts
/**
* Identity helper that types a json-render spec literal. `@devframes/hub` no
* longer ships this (json-render moved to the opt-in `@devframes/json-render`
* package, whose spec is a plain `@json-render/core` `Spec`), so the kit keeps
* the convenience helper for authoring specs with inference.
*/
function defineJsonRenderSpec(spec) {
	return spec;
}
const defineRpcFunction = createDefineWrapperWithContext();
//#endregion
export { defineCommand, defineDockEntry, defineJsonRenderSpec, defineRpcFunction };
