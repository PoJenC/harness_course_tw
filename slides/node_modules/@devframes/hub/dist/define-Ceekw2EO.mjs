import { createDefineWrapperWithContext } from "devframe/rpc";
//#region src/define.ts
const defineHubRpcFunction = createDefineWrapperWithContext();
function defineCommand(command) {
	return command;
}
function defineDockEntry(entry) {
	return entry;
}
//#endregion
export { defineDockEntry as n, defineHubRpcFunction as r, defineCommand as t };
