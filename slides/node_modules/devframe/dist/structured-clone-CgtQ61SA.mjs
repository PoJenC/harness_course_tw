//#region ../../node_modules/.pnpm/structured-clone-es@2.0.1/node_modules/structured-clone-es/dist/index.mjs
const env = typeof self === "object" ? self : globalThis;
const SAFE_ERROR_NAMES = /* @__PURE__ */ new Set([
	"Error",
	"EvalError",
	"RangeError",
	"ReferenceError",
	"SyntaxError",
	"TypeError",
	"URIError",
	"AggregateError"
]);
const SAFE_CONSTRUCTOR_NAMES = /* @__PURE__ */ new Set([
	"Boolean",
	"Number",
	"String",
	"Int8Array",
	"Uint8Array",
	"Uint8ClampedArray",
	"Int16Array",
	"Uint16Array",
	"Int32Array",
	"Uint32Array",
	"Float16Array",
	"Float32Array",
	"Float64Array",
	"BigInt64Array",
	"BigUint64Array"
]);
function deserializer($, _) {
	const as = (out, index) => {
		$.set(index, out);
		return out;
	};
	const unpair = (index) => {
		if ($.has(index)) return $.get(index);
		const [type, value] = _[index];
		switch (type) {
			case 0:
			case -1: return as(value, index);
			case 1: {
				const arr = as([], index);
				for (const index of value) arr.push(unpair(index));
				return arr;
			}
			case 2: {
				const object = as({}, index);
				for (const [key, index] of value) object[unpair(key)] = unpair(index);
				return object;
			}
			case 3: return as(new Date(value), index);
			case 4: {
				const { source, flags } = value;
				return as(new RegExp(source, flags), index);
			}
			case 5: {
				const map = as(/* @__PURE__ */ new Map(), index);
				for (const [key, index] of value) map.set(unpair(key), unpair(index));
				return map;
			}
			case 6: {
				const set = as(/* @__PURE__ */ new Set(), index);
				for (const index of value) set.add(unpair(index));
				return set;
			}
			case 7: {
				const { name, message } = value;
				const Ctor = SAFE_ERROR_NAMES.has(name) ? env[name] : void 0;
				return as(new (Ctor ?? env.Error)(message), index);
			}
			case 8: return as(BigInt(value), index);
			case "BigInt": return as(Object(BigInt(value)), index);
			case "ArrayBuffer": return as(new Uint8Array(value).buffer, value);
			case "DataView": {
				const { buffer } = new Uint8Array(value);
				return as(new DataView(buffer), value);
			}
		}
		if (typeof type === "string" && SAFE_CONSTRUCTOR_NAMES.has(type)) return as(new env[type](value), index);
		throw new TypeError(`unable to deserialize unsafe or unknown type: ${String(type)}`);
	};
	return unpair;
}
/**
* Returns a deserialized value from a serialized array of Records.
* @param serialized a previously serialized value.
*/
function deserialize(serialized) {
	return deserializer(/* @__PURE__ */ new Map(), serialized)(0);
}
const EMPTY = "";
const { toString } = {};
const { keys } = Object;
function typeOf(value) {
	const type = typeof value;
	if (type !== "object" || !value) return [0, type];
	const asString = toString.call(value).slice(8, -1);
	switch (asString) {
		case "Array": return [1, EMPTY];
		case "Object": return [2, EMPTY];
		case "Date": return [3, EMPTY];
		case "RegExp": return [4, EMPTY];
		case "Map": return [5, EMPTY];
		case "Set": return [6, EMPTY];
		case "DataView": return [1, asString];
	}
	if (asString.includes("Array")) return [1, asString];
	if (asString.includes("Error")) return [7, asString];
	return [2, asString];
}
function shouldSkip([TYPE, type]) {
	return TYPE === 0 && (type === "function" || type === "symbol");
}
function serializer(strict, json, $, _) {
	const as = (out, value) => {
		const index = _.push(out) - 1;
		$.set(value, index);
		return index;
	};
	const pair = (value) => {
		if ($.has(value)) return $.get(value);
		let [TYPE, type] = typeOf(value);
		switch (TYPE) {
			case 0: {
				let entry = value;
				switch (type) {
					case "bigint":
						TYPE = 8;
						entry = value.toString();
						break;
					case "function":
					case "symbol":
						if (strict) throw new TypeError(`unable to serialize ${type}`);
						entry = null;
						break;
					case "undefined": return as([-1], value);
				}
				return as([TYPE, entry], value);
			}
			case 1: {
				if (type) {
					let spread = value;
					if (type === "DataView") spread = new Uint8Array(value.buffer);
					else if (type === "ArrayBuffer") spread = new Uint8Array(value);
					return as([type, [...spread]], value);
				}
				const arr = [];
				const index = as([TYPE, arr], value);
				for (const entry of value) arr.push(pair(entry));
				return index;
			}
			case 2: {
				if (type) switch (type) {
					case "BigInt": return as([type, value.toString()], value);
					case "Boolean":
					case "Number":
					case "String": return as([type, value.valueOf()], value);
				}
				if (json && "toJSON" in value) return pair(value.toJSON());
				const entries = [];
				const index = as([TYPE, entries], value);
				for (const key of keys(value)) if (strict || !shouldSkip(typeOf(value[key]))) entries.push([pair(key), pair(value[key])]);
				return index;
			}
			case 3: return as([TYPE, value.toISOString()], value);
			case 4: {
				const { source, flags } = value;
				return as([TYPE, {
					source,
					flags
				}], value);
			}
			case 5: {
				const entries = [];
				const index = as([TYPE, entries], value);
				for (const [key, entry] of value) if (strict || !(shouldSkip(typeOf(key)) || shouldSkip(typeOf(entry)))) entries.push([pair(key), pair(entry)]);
				return index;
			}
			case 6: {
				const entries = [];
				const index = as([TYPE, entries], value);
				for (const entry of value) if (strict || !shouldSkip(typeOf(entry))) entries.push(pair(entry));
				return index;
			}
		}
		const { message } = value;
		return as([TYPE, {
			name: type,
			message
		}], value);
	};
	return pair;
}
/**
* Returns an array of serialized Records.
*/
function serialize(value, options = {}) {
	const _ = [];
	serializer(!(options.json || options.lossy), !!options.json, /* @__PURE__ */ new Map(), _)(value);
	return _;
}
const { parse: $parse, stringify: $stringify } = JSON;
const options = {
	json: true,
	lossy: true
};
/**
* Revive a previously stringified structured clone.
* @param str previously stringified data as string.
*/
function parse(str) {
	return deserialize($parse(str));
}
/**
* Represent a structured clone value as string.
* @param any some clone-able value to stringify.
*/
function stringify(any) {
	return $stringify(serialize(any, options));
}
//#endregion
//#region src/utils/structured-clone.ts
/**
* Serialize a structured-cloneable value (`Map`, `Set`, `Date`, `BigInt`,
* cycles, class instances, …) into a JSON-safe records array.
*/
function structuredCloneSerialize(value) {
	return serialize(value);
}
/**
* Inverse of {@link structuredCloneSerialize}.
*/
function structuredCloneDeserialize(value) {
	return deserialize(value);
}
/**
* Serialize a structured-cloneable value to a single string. Equivalent
* to `JSON.stringify(structuredCloneSerialize(value))`.
*/
function structuredCloneStringify(value) {
	return stringify(value);
}
/**
* Inverse of {@link structuredCloneStringify}.
*/
function structuredCloneParse(value) {
	return parse(value);
}
//#endregion
export { structuredCloneStringify as i, structuredCloneParse as n, structuredCloneSerialize as r, structuredCloneDeserialize as t };
