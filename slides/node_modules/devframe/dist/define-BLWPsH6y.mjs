//#region src/rpc/define.ts
function defineRpcFunction(definition) {
	return definition;
}
function createDefineWrapperWithContext() {
	return function defineRpcFunctionWithContext(definition) {
		return definition;
	};
}
//#endregion
export { defineRpcFunction as n, createDefineWrapperWithContext as t };
