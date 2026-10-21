//#region src/utils/simple-schema.ts
function ok(value) {
	return { value };
}
function fail(message, path) {
	return { issues: [path ? {
		message,
		path
	} : { message }] };
}
function make(type, validate, extra) {
	return {
		type,
		...extra,
		"~standard": {
			version: 1,
			vendor: "devframe",
			validate
		}
	};
}
/** Run a Standard Schema synchronously, rejecting async validators. */
function runSync(schema, value) {
	const result = schema["~standard"].validate(value);
	if (result instanceof Promise) throw new TypeError("[devframe/utils/simple-schema] async validators are not supported inside object()/optional()/nullable()");
	return result;
}
/** Any string. */
function string() {
	return make("string", (v) => typeof v === "string" ? ok(v) : fail("Expected a string"));
}
/** A finite number (rejects `NaN`). */
function number() {
	return make("number", (v) => typeof v === "number" && !Number.isNaN(v) ? ok(v) : fail("Expected a number"));
}
/** A boolean. */
function boolean() {
	return make("boolean", (v) => typeof v === "boolean" ? ok(v) : fail("Expected a boolean"));
}
/** `undefined`, mirroring valibot's `void`. */
function voidType() {
	return make("void", (v) => v === void 0 ? ok(void 0) : fail("Expected undefined"));
}
/** `null`. */
function nullType() {
	return make("null", (v) => v === null ? ok(null) : fail("Expected null"));
}
/** One of a fixed set of literal values. */
function picklist(values) {
	const set = new Set(values);
	return make("picklist", (v) => set.has(v) ? ok(v) : fail(`Expected one of: ${values.join(", ")}`), { values });
}
/** A single literal value (string / number / boolean). */
function literal(value) {
	return make("literal", (v) => v === value ? ok(v) : fail(`Expected ${JSON.stringify(value)}`), { value });
}
/** A value matching any one of the given schemas. */
function union(options) {
	return make("union", (v) => {
		const issues = [];
		for (const option of options) {
			const result = runSync(option, v);
			if (!result.issues) return ok(v);
			issues.push(...result.issues);
		}
		return { issues };
	}, { options });
}
/** A record with string keys whose values each satisfy the value schema. */
function record(_key, value) {
	return make("record", (v) => {
		if (typeof v !== "object" || v === null || Array.isArray(v)) return fail("Expected an object");
		const obj = v;
		const issues = [];
		for (const key of Object.keys(obj)) {
			const result = runSync(value, obj[key]);
			if (result.issues) for (const issue of result.issues) issues.push({
				message: issue.message,
				path: [key, ...issue.path ?? []]
			});
		}
		return issues.length ? { issues } : ok(v);
	});
}
/** An array whose every element satisfies the item schema. */
function array(item) {
	return make("array", (v) => {
		if (!Array.isArray(v)) return fail("Expected an array");
		const issues = [];
		for (let i = 0; i < v.length; i++) {
			const result = runSync(item, v[i]);
			if (result.issues) for (const issue of result.issues) issues.push({
				message: issue.message,
				path: [i, ...issue.path ?? []]
			});
		}
		return issues.length ? { issues } : ok(v);
	});
}
/** An object whose known keys each satisfy their schema (extra keys are kept). */
function object(shape) {
	const entries = Object.entries(shape);
	return make("object", (v) => {
		if (typeof v !== "object" || v === null || Array.isArray(v)) return fail("Expected an object");
		const obj = v;
		const issues = [];
		for (const [key, schema] of entries) {
			const result = runSync(schema, obj[key]);
			if (result.issues) for (const issue of result.issues) issues.push({
				message: issue.message,
				path: [key, ...issue.path ?? []]
			});
		}
		return issues.length ? { issues } : ok(v);
	});
}
/** Allow `undefined` in addition to the inner schema. */
function optional(inner) {
	return make("optional", (v) => v === void 0 ? ok(void 0) : runSync(inner, v), { wrapped: inner });
}
/** Allow `null` in addition to the inner schema. */
function nullable(inner) {
	return make("nullable", (v) => v === null ? ok(null) : runSync(inner, v), { wrapped: inner });
}
/** Attach a human-readable description (used for CLI option help). */
function describe(schema, description) {
	return {
		...schema,
		description
	};
}
/**
* Grouped access to every builder: `s.string()`, `s.object({ ... })`,
* `s.void()`, etc. Handy for a valibot-like `import { s } from
* 'devframe/utils/simple-schema'` call site.
*/
const s = {
	string,
	number,
	boolean,
	void: voidType,
	null: nullType,
	literal,
	picklist,
	union,
	record,
	array,
	object,
	optional,
	nullable,
	describe
};
//#endregion
export { array, boolean, describe, literal, nullType, nullable, number, object, optional, picklist, record, s, string, union, voidType };
