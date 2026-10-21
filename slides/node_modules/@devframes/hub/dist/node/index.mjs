import { _ as DevframeCommandsHost, a as hubMessagesAdd, c as hubMessagesUpdate, d as hubTerminalsRestart, f as hubTerminalsTerminate, g as DevframeDocksHost, h as DevframeMessagesHost, i as hubDocksActivate, l as hubTerminalsRemove, m as DevframeTerminalsHost, n as builtinHubRpcDeclarations, o as hubMessagesClear, p as hubTerminalsWrite, r as hubCommandsExecute, s as hubMessagesRemove, t as createHubContext, u as hubTerminalsResize } from "../context-DRdTViYd.mjs";
import { Buffer } from "node:buffer";
//#region src/node/utils.ts
function toDataURL(code) {
	return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
/**
* Create a quick `ClientScriptEntry` from an inline function or
* stringified code. Useful for prototyping `action` / `renderer`
* dock entries without setting up a separate importable module.
*
* @experimental Prefer a proper importable module for production use.
*/
function createSimpleClientScript(fn) {
	return {
		importFrom: toDataURL(`const fn = ${fn.toString()}; export default fn`),
		importName: "default"
	};
}
//#endregion
export { DevframeCommandsHost, DevframeDocksHost, DevframeMessagesHost, DevframeTerminalsHost, builtinHubRpcDeclarations, createHubContext, createSimpleClientScript, hubCommandsExecute, hubDocksActivate, hubMessagesAdd, hubMessagesClear, hubMessagesRemove, hubMessagesUpdate, hubTerminalsRemove, hubTerminalsResize, hubTerminalsRestart, hubTerminalsTerminate, hubTerminalsWrite };
