import { join } from "pathe";
import process from "node:process";
import { homedir } from "node:os";
//#region src/node/host-h3.ts
/**
* h3-backed {@link DevframeHost}, used by the standalone CLI adapter.
*/
function createH3DevframeHost(options) {
	const workspaceRoot = options.workspaceRoot ?? process.cwd();
	return {
		mountStatic(base, source) {
			return options.mount?.(base, source);
		},
		resolveOrigin() {
			return typeof options.origin === "function" ? options.origin() : options.origin;
		},
		getStorageDir(scope) {
			const namespace = `.${options.appName}/devframe`;
			if (scope === "workspace") return join(workspaceRoot, ".devframe");
			if (scope === "project") return join(workspaceRoot, "node_modules", namespace);
			return join(homedir(), namespace);
		}
	};
}
//#endregion
export { createH3DevframeHost as t };
