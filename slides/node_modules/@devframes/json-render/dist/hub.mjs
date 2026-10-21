//#region src/hub.ts
/**
* Build a `json-render` dock entry from a {@link JsonRenderView} and the dock
* metadata (id, title, icon, …). Projects the view down to its serializable
* {@link JsonRenderViewRef} so it survives dock projection into shared state.
*/
function toJsonRenderDockEntry(view, meta) {
	return {
		...meta,
		type: "json-render",
		view: view.ref
	};
}
//#endregion
export { toJsonRenderDockEntry };
