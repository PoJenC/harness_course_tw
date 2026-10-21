import { r as diagnostics } from "./serialization-BhuOoL80.mjs";
//#region src/rpc/validate-io.ts
/**
* Run a single [Standard Schema](https://standardschema.dev) validator,
* awaiting the result when the validator is asynchronous.
*/
async function runStandardSchema(schema, value) {
	const result = schema["~standard"].validate(value);
	return result instanceof Promise ? await result : result;
}
/**
* Render Standard Schema issues into a single human-readable line for a
* diagnostic message, prefixing each with its dotted path when present.
*/
function formatIssues(issues) {
	return issues.map((issue) => {
		const path = issue.path?.map((segment) => typeof segment === "object" ? segment.key : segment).join(".");
		return path ? `${path}: ${issue.message}` : issue.message;
	}).join("; ");
}
/**
* Validate positional arguments against their declared schemas. Only
* indices with a schema are checked; extra arguments pass through
* untouched. Throws `DF0038` on the first failing argument.
*
* Validation guards the payload without rewriting it: the original values
* are handed to the handler unchanged, so a schema that describes a subset
* of an object never silently strips the sender's extra fields (and any
* declared transforms stay a purely type-level concern).
*
* @internal
*/
async function validateRpcArgs(name, argsSchema, args) {
	const original = args.slice();
	if (!argsSchema || argsSchema.length === 0) return original;
	for (let index = 0; index < argsSchema.length; index++) {
		const schema = argsSchema[index];
		if (!schema) continue;
		const result = await runStandardSchema(schema, args[index]);
		if (result.issues) throw diagnostics.DF0043({
			name,
			index,
			issues: formatIssues(result.issues)
		});
	}
	return original;
}
/**
* Validate a handler's resolved return value against its declared schema.
* Throws `DF0039` when the value fails the schema, otherwise returns the
* original value unchanged (guard-only, never rewriting the payload; see
* {@link validateRpcArgs}). Passes through when no return schema is set.
*
* @internal
*/
async function validateRpcReturn(name, returnSchema, value) {
	if (!returnSchema) return value;
	const result = await runStandardSchema(returnSchema, value);
	if (result.issues) throw diagnostics.DF0044({
		name,
		issues: formatIssues(result.issues)
	});
	return value;
}
//#endregion
//#region src/rpc/handler.ts
async function getRpcResolvedSetupResult(definition, context) {
	if (!definition.setup) return {};
	if (typeof context === "object" && context !== null) {
		definition.__cache ??= /* @__PURE__ */ new WeakMap();
		const cache = definition.__cache;
		let promise = cache.get(context);
		if (!promise) {
			promise = Promise.resolve(definition.setup(context));
			promise.catch(() => {
				if (cache.get(context) === promise) cache.delete(context);
			});
			cache.set(context, promise);
		}
		return await promise;
	}
	if (!definition.__promise) {
		const promise = Promise.resolve(definition.setup(context));
		promise.catch(() => {
			if (definition.__promise === promise) definition.__promise = void 0;
		});
		definition.__promise = promise;
	}
	return await definition.__promise;
}
async function getRpcHandler(definition, context) {
	let handler = definition.handler;
	if (!handler) {
		const result = await getRpcResolvedSetupResult(definition, context);
		if (!result.handler) throw diagnostics.DF0024({ name: definition.name });
		handler = result.handler;
	}
	const argsSchema = definition.args;
	const returnSchema = definition.returns;
	if (!argsSchema && !returnSchema) return handler;
	const inner = handler;
	const validating = async (...args) => {
		const validatedArgs = await validateRpcArgs(definition.name, argsSchema, args);
		const output = await inner(...validatedArgs);
		return await validateRpcReturn(definition.name, returnSchema, output);
	};
	return validating;
}
//#endregion
export { validateRpcReturn as i, getRpcResolvedSetupResult as n, validateRpcArgs as r, getRpcHandler as t };
