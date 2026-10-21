//#region src/client/browser-agent.ts
const REGISTRY_KEY = Symbol.for("devframe:browser-agent-registry");
const { tools, listeners } = globalThis[REGISTRY_KEY] ??= {
	tools: /* @__PURE__ */ new Map(),
	listeners: /* @__PURE__ */ new Set()
};
function notifyChanged() {
	for (const listener of listeners) listener();
}
function registerBrowserAgentTool(tool) {
	const key = Symbol(tool.id);
	tools.set(key, tool);
	notifyChanged();
	return () => {
		if (tools.delete(key)) notifyChanged();
	};
}
function listBrowserAgentTools() {
	return [...tools.values()];
}
function onBrowserAgentToolsChanged(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
//#endregion
export { onBrowserAgentToolsChanged as n, registerBrowserAgentTool as r, listBrowserAgentTools as t };
