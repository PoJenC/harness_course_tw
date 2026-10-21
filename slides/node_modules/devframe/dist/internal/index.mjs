import { t as getMcpContent } from "../mcp-content-DN3O212x.mjs";
import { t as Diagnostic } from "../nostics-D0PvLZsn.mjs";
import { n as peekRpcWireFrame, t as createRpcWireCodec } from "../wire-codec-B1W3zH3L.mjs";
import { t as diagnostics } from "../diagnostics-Dngy7cNp.mjs";
import { n as toolInputToCommandArgs, t as DevframeAgentHost } from "../host-agent-DB1yECaG.mjs";
import { a as resolveMcpConfig, n as normalizeBasePath, r as resolveBasePath, s as importAgenticMcp, t as loadAutoMcpAdapter } from "../_shared-B6K2DKhb.mjs";
import { t as importRuntimeModule } from "../import-runtime-module-BzlEQ9PI.mjs";
import { t as createH3DevframeHost } from "../host-h3-BROI6SQ4.mjs";
import { i as registerDevframeInstance, n as listLiveDevframeInstances, r as probeDevframeOrigin } from "../instance-registry-B--XFmLS.mjs";
import { i as normalizeHttpServerUrl, n as resolveInstanceRegister, r as samePath, t as createInstanceShell } from "../instance-shell-DyVmJA6B.mjs";
import { t as createContextRpcServer } from "../rpc-core-Dl50hXG3.mjs";
//#region src/agent/stringify.ts
/**
* JSON-coercing serializer for MCP text payloads.
*
* MCP carries tool results and resource reads as plain text over a
* JSON-RPC transport, so we cannot use the `s:`-prefixed structured-clone
* format the WS RPC transport falls back to for non-JSON values. Instead,
* we coerce common non-JSON types into JSON-friendly forms so the LLM
* client sees something useful instead of `[object Object]`.
*
* Coercions:
*   - `BigInt` → `"123n"`
*   - `Date` → ISO string (via the native `toJSON`)
*   - `Map` → `{ __type: 'Map', entries: [[k, v], …] }`
*   - `Set` → `{ __type: 'Set', entries: [v, …] }`
*   - `Error` → `{ name, message, stack, cause? }` (cause recurses)
*   - `Function` → `"[Function: name]"`
*   - `Symbol` → `value.toString()`
*   - cycles → `"[Circular]"`
*/
function stringifyForMcp(value) {
	if (value === void 0) return "undefined";
	if (typeof value === "string") return value;
	const seen = /* @__PURE__ */ new WeakSet();
	return JSON.stringify(value, (_key, val) => {
		if (typeof val === "bigint") return `${val}n`;
		if (val instanceof Error) {
			const out = {
				name: val.name,
				message: val.message,
				stack: val.stack
			};
			if (val.cause !== void 0) out.cause = val.cause;
			return out;
		}
		if (val instanceof Map) return {
			__type: "Map",
			entries: [...val.entries()]
		};
		if (val instanceof Set) return {
			__type: "Set",
			entries: [...val]
		};
		if (typeof val === "function") return `[Function: ${val.name || "anonymous"}]`;
		if (typeof val === "symbol") return val.toString();
		if (val !== null && typeof val === "object") {
			if (seen.has(val)) return "[Circular]";
			seen.add(val);
		}
		return val;
	}, 2);
}
/**
* Format a thrown value for an MCP `isError` text payload.
*
* A nostics `Diagnostic` (every coded devframe error) becomes structured
* JSON (`{ error: { code, message, fix?, docs? } }`), so an agent receives
* the actionable next step (`fix`) and the docs URL instead of a bare
* message string. Other errors surface `Error.name`/`message`, plus one
* level of `cause.message` so context isn't dropped silently.
*/
function formatMcpError(error) {
	if (error instanceof Diagnostic) return JSON.stringify({ error: {
		code: error.code,
		message: error.message,
		...error.fix ? { fix: error.fix } : {},
		...error.docs ? { docs: error.docs } : {}
	} }, null, 2);
	if (!(error instanceof Error)) return String(error);
	const cause = error.cause;
	const causeText = cause instanceof Error ? ` (cause: ${cause.message})` : cause !== void 0 ? ` (cause: ${String(cause)})` : "";
	return `${error.name}: ${error.message}${causeText}`;
}
//#endregion
//#region src/agent/to-json-schema.ts
const FALLBACK_OBJECT_SCHEMA = Object.freeze({
	type: "object",
	additionalProperties: true
});
/**
* Convert a Standard Schema to JSON Schema for the agent/MCP surface.
*
* Devframe stays validator-neutral, so conversion uses the schema's own
* [Standard JSON Schema](https://standardschema.dev/) converter
* (`~standard.jsonSchema`) when the validator provides one; zod 4 does,
* for example. Validators without a native converter (e.g. valibot) degrade
* to a permissive object schema rather than pulling in a converter library.
*/
function safeToJsonSchema(schema) {
	const standard = schema["~standard"];
	if (standard.jsonSchema) try {
		return standard.jsonSchema.input({ target: "draft-2020-12" });
	} catch {
		return FALLBACK_OBJECT_SCHEMA;
	}
	return FALLBACK_OBJECT_SCHEMA;
}
/**
* JSON Schema for an RPC return value on the agent/MCP surface.
*
* Unlike args, a return value has no permissive fallback: the schema is
* advertised as an MCP `outputSchema`, which obliges the tool to return a
* matching object on every call. A validator with no native converter
* (e.g. valibot), or one whose converter cannot express the schema, yields
* no output schema rather than an unfounded object one, so array- and
* primitive-returning tools still work. Conversion uses the converter's
* `output`, since a transforming validator returns its output type.
* @internal
*/
function returnToJsonSchema(schema) {
	if (!schema) return void 0;
	const standard = schema["~standard"];
	if (!standard.jsonSchema) return void 0;
	try {
		return standard.jsonSchema.output({ target: "draft-2020-12" });
	} catch {
		return;
	}
}
/**
* JSON Schema for an RPC function's positional args on the agent/MCP
* surface. Each positional arg is advertised under `arg0` / `arg1` / …,
* matching how the agent bridge coerces the incoming object payload back
* into positional arguments.
*
* Returns `{ type: 'object', properties: {} }` when there are no args.
* @internal
*/
function argsToJsonSchema(args) {
	if (!args || args.length === 0) return {
		type: "object",
		properties: {}
	};
	const properties = {};
	const required = [];
	for (let i = 0; i < args.length; i++) {
		const key = `arg${i}`;
		properties[key] = safeToJsonSchema(args[i]);
		required.push(key);
	}
	return {
		type: "object",
		properties,
		required,
		additionalProperties: false
	};
}
//#endregion
export { DevframeAgentHost, argsToJsonSchema, createContextRpcServer, createH3DevframeHost, createInstanceShell, createRpcWireCodec, diagnostics, formatMcpError, getMcpContent, importAgenticMcp, importRuntimeModule, listLiveDevframeInstances, loadAutoMcpAdapter, normalizeBasePath, normalizeHttpServerUrl, peekRpcWireFrame, probeDevframeOrigin, registerDevframeInstance, resolveBasePath, resolveInstanceRegister, resolveMcpConfig, returnToJsonSchema, samePath, stringifyForMcp, toolInputToCommandArgs };
