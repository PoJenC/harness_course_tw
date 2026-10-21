import { t as createBirpc } from "../dist-CO98PBnQ.mjs";
//#region src/rpc/client.ts
function createRpcClient(functions, options) {
	const { channel, rpcOptions = {} } = options;
	return createBirpc(functions, {
		...channel,
		timeout: -1,
		...rpcOptions,
		proxify: false
	});
}
//#endregion
export { createRpcClient };
