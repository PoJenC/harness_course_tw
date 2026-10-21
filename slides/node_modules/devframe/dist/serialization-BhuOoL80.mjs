import { i as defineDiagnostics } from "./nostics-D0PvLZsn.mjs";
//#region src/rpc/diagnostics.ts
const diagnostics = defineDiagnostics({
	docsBase: "https://devfra.me/errors",
	codes: {
		DF0019: {
			why: (p) => `RPC function "${p.name}" has \`agent\` set but \`jsonSerializable\` is \`false\`; MCP requires JSON-serializable data.`,
			fix: "Remove `jsonSerializable: false`, or remove `agent` to keep it RPC-only."
		},
		DF0020: {
			why: (p) => `RPC function "${p.name}" declares \`jsonSerializable: true\` but the value at "${p.path}" is a ${p.type}.`,
			fix: "Either drop `jsonSerializable: true` (falls back to structured-clone) or change the value to a JSON-safe shape."
		},
		DF0021: {
			why: (p) => `RPC function "${p.name}" is already registered`,
			fix: "Use the `force` parameter to overwrite an existing registration."
		},
		DF0022: { why: (p) => `RPC function "${p.name}" is not registered. Use register() to add new functions.` },
		DF0023: { why: (p) => `RPC function "${p.name}" is not registered` },
		DF0024: { why: (p) => `Either handler or setup function must be provided for RPC function "${p.name}"` },
		DF0025: { why: (p) => `Function "${p.name}" not found in dump store` },
		DF0026: { why: (p) => `No dump match for "${p.name}" with args: ${p.args}` },
		DF0027: { why: (p) => `Function "${p.name}" with type "${p.type}" cannot have dump configuration. Only "static" and "query" types support dumps.` },
		DF0028: {
			why: (p) => `Function "${p.name}" with type "${p.type}" cannot use \`snapshot: true\`. Only "query" functions support this sugar; "static" functions have equivalent default behavior already.`,
			fix: "Remove `snapshot: true`, or change the function type to `query`."
		},
		DF0043: {
			why: (p) => `RPC function "${p.name}" received an invalid argument at position ${p.index}: ${p.issues}`,
			fix: "Pass a value that satisfies the `args` schema declared for this function."
		},
		DF0044: {
			why: (p) => `RPC function "${p.name}" returned a value that failed its \`returns\` schema: ${p.issues}`,
			fix: "Make the handler return a value that satisfies the `returns` schema, or relax the schema."
		}
	}
});
//#endregion
//#region src/rpc/serialization.ts
/**
* Wire format used by the live RPC transports (WebSocket and SSE).
*
* - **JSON (default, unprefixed):** payload is plain JSON text. Used when
*   the dispatched method is declared `jsonSerializable: true`. Encoded
*   via {@link strictJsonStringify} (rejects non-JSON values), decoded
*   via `JSON.parse`.
* - **Structured-clone (`s:` prefix):** payload is `s:` followed by
*   `structured-clone-es` text. Used when the method is declared
*   `jsonSerializable: false` (or omitted, the default). Round-trips
*   `Map`, `Set`, `Date`, `BigInt`, cycles, and class instances.
*
* birpc envelopes always start with `{`, so a leading byte that is not
* `s` is unambiguously JSON. Each direction independently chooses its
* encoding from local definitions; request and response are not
* coupled by a mirror rule.
*/
const STRUCTURED_CLONE_PREFIX = "s:";
/**
* `JSON.stringify` with a single-pass strict replacer.
*
* Throws `DF0020` synchronously when the value contains a type JSON
* cannot round-trip losslessly: `Map`, `Set`, `Date`, `BigInt`, class
* instances, or `undefined` inside an array (silently becomes `null`).
*
* Native pass-throughs (no extra work needed):
*   - circular references: `JSON.stringify` raises `TypeError`.
*   - `BigInt` at top level: caught here for a friendlier error path.
*
* Lenient cases (allowed without throwing):
*   - `undefined` as an object property: legitimate optional field;
*     JSON.stringify just omits it.
*   - `undefined` at the root: legitimate "action returned nothing".
*   - `Symbol` / `Function` values: semantically "drop me" in JSON.
*
* `fnName` is used only for the diagnostic message; pass the RPC
* function name when calling from a wire serializer / dump writer so
* the error points at the offending function.
*/
function strictJsonStringify(value, fnName = "") {
	return JSON.stringify(value, function strictReplacer(key, val) {
		const holder = this;
		const original = holder != null ? holder[key] : val;
		if (original === void 0) {
			if (Array.isArray(holder)) throw nonJsonAt(fnName, "undefined", holder, key);
			return val;
		}
		if (original !== null) assertJsonSafe(original, holder, key, fnName);
		return val;
	});
}
/** Throw `DF0020` when `original` is a type JSON can't round-trip losslessly. */
function assertJsonSafe(original, holder, key, fnName) {
	if (typeof original === "bigint") throw nonJsonAt(fnName, "BigInt", holder, key);
	if (typeof original !== "object") return;
	if (original instanceof Map) throw nonJsonAt(fnName, "Map", holder, key);
	if (original instanceof Set) throw nonJsonAt(fnName, "Set", holder, key);
	if (original instanceof Date) throw nonJsonAt(fnName, "Date", holder, key);
	if (Array.isArray(original)) return;
	const proto = Object.getPrototypeOf(original);
	if (proto !== null && proto !== Object.prototype) throw nonJsonAt(fnName, original.constructor?.name ?? "class instance", holder, key);
}
function nonJsonAt(fnName, type, parent, key) {
	const path = formatPath(parent, key);
	return diagnostics.DF0020({
		name: fnName || "<anonymous>",
		type,
		path
	});
}
function formatPath(parent, key) {
	if (Array.isArray(parent)) return `[${key}]`;
	if (key === "") return "<root>";
	return key;
}
//#endregion
export { strictJsonStringify as n, diagnostics as r, STRUCTURED_CLONE_PREFIX as t };
