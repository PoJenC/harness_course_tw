import { b as basePropSchemas, t as JSON_RENDER_INDEX_KEY } from "../view-index-De3Gt127.mjs";
import { createSharedState } from "devframe/utils/shared-state";
import { defineDiagnostics } from "devframe/utils/nostics";
/**
* `@devframes/json-render` protocol/runtime diagnostics share the `DF`
* prefix and use the next globally available core codes. Browser-only render
* failures keep `console.*` in the UI package.
*
* Annotated with {@link DevframeDiagnostics} so the public type resolves
* through the `devframe/utils/nostics` peer rather than inlining `nostics`.
*/
const diagnostics = defineDiagnostics({
	docsBase: "https://devfra.me/errors",
	codes: {
		DF0038: {
			why: (p) => `JSON-render view "${p.id}" received invalid props on element "${p.key}": ${p.issues}`,
			fix: "Match the element props to the base catalog's prop schema for that component. See the component reference for the expected shape."
		},
		DF0039: {
			why: (p) => `A JSON-render view with id "${p.id}" already exists in scope "${p.scope}".`,
			fix: "Give each view a stable id unique within its scope, or dispose the previous view before recreating it."
		},
		DF0040: {
			why: (p) => `JSON-render view "${p.id}" was used after it was disposed.`,
			fix: "Create a fresh view with `createJsonRenderView` instead of reusing a disposed handle."
		},
		DF0041: {
			why: (p) => `JSON-render view "${p.id}" spec is not JSON-serializable: ${p.reason}`,
			fix: "Specs and state travel as strict JSON, so remove functions, symbols, class instances, Map/Set, or circular references."
		},
		DF0073: {
			why: (p) => `JSON-render view "${p.id}" does not match its configured schema: ${p.issues}`,
			fix: "Match the authored spec to the Standard Schema passed to `createJsonRenderView`."
		},
		DF0074: {
			why: (p) => `JSON-render view "${p.id}" uses an asynchronous Standard Schema.`,
			fix: "Use a synchronous Standard Schema so initial creation and updates remain synchronous."
		}
	}
});
//#endregion
//#region src/node/create-view.ts
function isScoped(ctx) {
	return "base" in ctx && "namespace" in ctx;
}
const registries = /* @__PURE__ */ new WeakMap();
function registryFor(ctx) {
	let set = registries.get(ctx);
	if (!set) {
		set = /* @__PURE__ */ new Set();
		registries.set(ctx, set);
	}
	return set;
}
const indexStates = /* @__PURE__ */ new WeakMap();
function indexStateFor(ctx) {
	let state = indexStates.get(ctx);
	if (!state) {
		state = createSharedState({ initialValue: {} });
		indexStates.set(ctx, state);
		ctx.rpc.sharedState.get(JSON_RENDER_INDEX_KEY, { sharedState: state });
	}
	return state;
}
/** Parse an RFC 6901 JSON Pointer into path segments. */
function parsePointer(pointer) {
	if (pointer === "" || pointer === "/") return [];
	return pointer.replace(/^\//, "").split("/").map((seg) => seg.replace(/~1/g, "/").replace(/~0/g, "~"));
}
function assertJsonSerializable(id, spec) {
	try {
		JSON.stringify(spec);
	} catch (error) {
		throw diagnostics.DF0041({
			id,
			reason: error.message
		});
	}
}
function validateElementProps(id, spec) {
	for (const [key, element] of Object.entries(spec.elements ?? {})) {
		const schema = basePropSchemas[element.type];
		if (!schema) continue;
		const result = schema.safeParse(element.props ?? {});
		if (!result.success) {
			const issues = result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
			throw diagnostics.DF0038({
				id,
				key,
				issues
			});
		}
	}
}
function formatStandardSchemaIssues(issues) {
	return issues.map((issue) => {
		return `${issue.path?.map((segment) => typeof segment === "object" ? String(segment.key) : String(segment)).join(".") || "(root)"}: ${issue.message}`;
	}).join("; ");
}
function isPromise(value) {
	return typeof value.then === "function";
}
function validateSpec(id, spec, schema) {
	if (schema === false) return;
	if (!schema) {
		validateElementProps(id, spec);
		return;
	}
	const result = schema["~standard"].validate(spec);
	if (isPromise(result)) throw diagnostics.DF0074({ id });
	if (result.issues) throw diagnostics.DF0073({
		id,
		issues: formatStandardSchemaIssues(result.issues)
	});
}
function normalizeSpec(spec) {
	return spec.state ? spec : {
		...spec,
		state: {}
	};
}
/**
* Create a JSON-render view bound to a devframe context. Registers a
* server-side shared state (patches enabled) carrying the live spec + state,
* validates element props at ingress against the base catalog, and returns a
* handle plus the serializable {@link JsonRenderView.ref} a client subscribes
* through.
*
* @example
* ```ts
* const view = createJsonRenderView(ctx, { id: 'metrics', spec })
* view.update(nextSpec)
* view.patchState([{ op: 'replace', path: '/count', value: 3 }])
* view.dispose()
* ```
*/
function createJsonRenderView(ctx, options) {
	const scoped = isScoped(ctx);
	const baseCtx = scoped ? ctx.base : ctx;
	const scope = options.scope ?? (scoped ? ctx.namespace : "global");
	const { id } = options;
	const title = options.title ?? id;
	const stateKey = `devframe:json-render:${scope}:${id}`;
	const registry = registryFor(baseCtx);
	if (registry.has(stateKey)) throw diagnostics.DF0039({
		id,
		scope
	});
	const initial = normalizeSpec(options.spec);
	validateSpec(id, initial, options.schema);
	assertJsonSerializable(id, initial);
	const state = createSharedState({
		initialValue: initial,
		enablePatches: true
	});
	registry.add(stateKey);
	baseCtx.rpc.sharedState.get(stateKey, { sharedState: state });
	const index = indexStateFor(baseCtx);
	index.mutate((idx) => {
		idx[stateKey] = {
			id,
			scope,
			stateKey,
			title
		};
	});
	let disposed = false;
	function assertLive() {
		if (disposed) throw diagnostics.DF0040({ id });
	}
	return {
		id,
		title,
		ref: { stateKey },
		value: () => state.value(),
		update(spec) {
			assertLive();
			const next = normalizeSpec(spec);
			validateSpec(id, next, options.schema);
			assertJsonSerializable(id, next);
			state.mutate(() => next);
		},
		patchState(patches) {
			assertLive();
			const prefixed = patches.map((p) => ({
				op: p.op,
				path: ["state", ...parsePointer(p.path)],
				value: p.value
			}));
			state.patch(prefixed);
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			registry.delete(stateKey);
			index.mutate((idx) => {
				delete idx[stateKey];
			});
			baseCtx.rpc.sharedState.delete(stateKey);
		}
	};
}
//#endregion
export { createJsonRenderView, diagnostics as jsonRenderDiagnostics };
