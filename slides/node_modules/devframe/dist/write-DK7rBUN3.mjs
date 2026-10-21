import { i as hash, n as validateDefinitions, r as ensureAgentJsonSerializable } from "./validation-CMfDAti3.mjs";
import { n as strictJsonStringify, r as diagnostics } from "./serialization-BhuOoL80.mjs";
import { t as getRpcHandler } from "./handler-DmaAfpGq.mjs";
import { DEVFRAME_RPC_DUMP_DIRNAME, DEVFRAME_RPC_DUMP_MANIFEST_FILENAME } from "./constants.mjs";
import { n as structuredCloneStringify } from "./structured-clone-CbAV5rFI.mjs";
import fs from "node:fs/promises";
import { dirname, resolve } from "pathe";
//#region ../../node_modules/.pnpm/yocto-queue@1.2.2/node_modules/yocto-queue/index.js
var Node = class {
	value;
	next;
	constructor(value) {
		this.value = value;
	}
};
var Queue = class {
	#head;
	#tail;
	#size;
	constructor() {
		this.clear();
	}
	enqueue(value) {
		const node = new Node(value);
		if (this.#head) {
			this.#tail.next = node;
			this.#tail = node;
		} else {
			this.#head = node;
			this.#tail = node;
		}
		this.#size++;
	}
	dequeue() {
		const current = this.#head;
		if (!current) return;
		this.#head = this.#head.next;
		this.#size--;
		if (!this.#head) this.#tail = void 0;
		return current.value;
	}
	peek() {
		if (!this.#head) return;
		return this.#head.value;
	}
	clear() {
		this.#head = void 0;
		this.#tail = void 0;
		this.#size = 0;
	}
	get size() {
		return this.#size;
	}
	*[Symbol.iterator]() {
		let current = this.#head;
		while (current) {
			yield current.value;
			current = current.next;
		}
	}
	*drain() {
		while (this.#head) yield this.dequeue();
	}
};
//#endregion
//#region ../../node_modules/.pnpm/p-limit@7.3.3/node_modules/p-limit/index.js
function pLimit(concurrency) {
	let rejectOnClear = false;
	if (typeof concurrency === "object") ({concurrency, rejectOnClear = false} = concurrency);
	validateConcurrency(concurrency);
	if (typeof rejectOnClear !== "boolean") throw new TypeError("Expected `rejectOnClear` to be a boolean");
	const queue = new Queue();
	let activeCount = 0;
	const resumeNext = () => {
		if (activeCount < concurrency && queue.size > 0) {
			activeCount++;
			queue.dequeue().run();
		}
	};
	const next = () => {
		activeCount--;
		resumeNext();
	};
	const run = async (function_, resolve, arguments_) => {
		const result = (async () => function_(...arguments_))();
		resolve(result);
		try {
			await result;
		} catch {}
		next();
	};
	const enqueue = (function_, resolve, reject, arguments_) => {
		const queueItem = { reject };
		new Promise((internalResolve) => {
			queueItem.run = internalResolve;
			queue.enqueue(queueItem);
		}).then(run.bind(void 0, function_, resolve, arguments_));
		if (activeCount < concurrency) resumeNext();
	};
	const generator = (function_, ...arguments_) => new Promise((resolve, reject) => {
		enqueue(function_, resolve, reject, arguments_);
	});
	Object.defineProperties(generator, {
		activeCount: { get: () => activeCount },
		pendingCount: { get: () => queue.size },
		clearQueue: { value() {
			if (!rejectOnClear) {
				queue.clear();
				return;
			}
			const abortError = AbortSignal.abort().reason;
			while (queue.size > 0) queue.dequeue().reject(abortError);
		} },
		concurrency: {
			get: () => concurrency,
			set(newConcurrency) {
				validateConcurrency(newConcurrency);
				concurrency = newConcurrency;
				queueMicrotask(() => {
					while (activeCount < concurrency && queue.size > 0) resumeNext();
				});
			}
		},
		map: { async value(iterable, function_) {
			const promises = [];
			try {
				Array.from(iterable, (value, index) => {
					const promise = generator(function_, value, index);
					promises.push(promise);
					return promise;
				});
			} catch (error) {
				for (const promise of promises) promise.catch(() => {});
				throw error;
			}
			return Promise.all(promises);
		} }
	});
	return generator;
}
function validateConcurrency(concurrency) {
	if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0)) throw new TypeError("Expected `concurrency` to be a number from 1 and up");
}
//#endregion
//#region src/rpc/dump/error.ts
/**
* Normalize a thrown value into a plain object suitable for storage in
* a dump record. Preserves `message`, `name`, `cause`, and any own
* enumerable properties of an `Error` so consumers reading the dump can
* reconstruct a richer Error than just `{ message, name }`.
*
* Non-`Error` throws are wrapped as `{ name: 'Error', message: String(thrown) }`.
*/
function serializeDumpError(error) {
	return serializeWithSeen(error, /* @__PURE__ */ new WeakSet());
}
function serializeWithSeen(error, seen) {
	if (!(error instanceof Error)) return {
		name: "Error",
		message: String(error)
	};
	if (seen.has(error)) return {
		name: error.name,
		message: error.message
	};
	seen.add(error);
	const out = {
		name: error.name,
		message: error.message
	};
	const cause = error.cause;
	if (cause !== void 0) out.cause = cause instanceof Error ? serializeWithSeen(cause, seen) : cause;
	for (const [key, value] of Object.entries(error)) {
		if (key === "name" || key === "message" || key === "cause") continue;
		out[key] = value;
	}
	return out;
}
/**
* Inverse of {@link serializeDumpError}: rebuild a thrown `Error` from
* the plain object stored in a dump record. Preserves `cause`, restores
* the original `name`, and re-attaches any custom own properties.
*/
function reviveDumpError(stored) {
	const { name, message, cause: rawCause, ...extras } = stored;
	const cause = rawCause instanceof Error ? rawCause : isPlainErrorShape(rawCause) ? reviveDumpError(rawCause) : rawCause;
	const error = cause !== void 0 ? new Error(message, { cause }) : new Error(message);
	error.name = name;
	Object.assign(error, extras);
	return error;
}
function isPlainErrorShape(value) {
	return typeof value === "object" && value !== null && typeof value.message === "string" && typeof value.name === "string";
}
//#endregion
//#region src/rpc/dump/collect.ts
function getDumpRecordKey(functionName, args) {
	return `${functionName}---${hash(args)}`;
}
function getDumpFallbackKey(functionName) {
	return `${functionName}---fallback`;
}
async function resolveGetter(valueOrGetter) {
	return typeof valueOrGetter === "function" ? await valueOrGetter() : valueOrGetter;
}
/** Run tasks sequentially (`concurrency <= 1`) or through a `p-limit` pool. */
async function runDumpTasks(tasks, concurrency) {
	if (concurrency <= 1) {
		const out = [];
		for (const task of tasks) out.push(await task());
		return out;
	}
	const limit = pLimit(concurrency);
	return Promise.all(tasks.map((task) => limit(task)));
}
/**
* Resolve one definition's handler + dump config and register it in the store.
* Returns `undefined` for definitions that carry no dump.
*/
async function resolveDumpTask(definition, context, store) {
	if (definition.type === "event" || definition.type === "action") return void 0;
	const setupResult = definition.setup ? await Promise.resolve(definition.setup(context)) : {};
	const handler = setupResult.handler || definition.handler;
	if (!handler) throw diagnostics.DF0024({ name: definition.name });
	let dump = setupResult.dump ?? definition.dump;
	if (!dump && definition.type === "static") dump = { inputs: [[]] };
	if (!dump && definition.snapshot) dump = async (_ctx, h) => {
		const output = await Promise.resolve(h());
		return {
			records: [{
				inputs: [],
				output
			}],
			fallback: output
		};
	};
	if (!dump) return void 0;
	if (typeof dump === "function") dump = await Promise.resolve(dump(context, handler));
	store.definitions[definition.name] = {
		name: definition.name,
		type: definition.type
	};
	return {
		handler,
		dump,
		definition
	};
}
/**
* Write a resolved dump's pre-defined records and fallback into the store, and
* return the per-input execution tasks that fill in the rest.
*/
function collectDumpTasks(resolution, store) {
	const { definition, handler, dump } = resolution;
	const { inputs, records, fallback } = dump;
	if (records) for (const record of records) store.records[getDumpRecordKey(definition.name, record.inputs)] = record;
	if ("fallback" in dump) store.records[getDumpFallbackKey(definition.name)] = {
		inputs: [],
		output: fallback
	};
	if (!inputs) return [];
	return inputs.map((input) => async () => {
		const recordKey = getDumpRecordKey(definition.name, input);
		try {
			store.records[recordKey] = {
				inputs: input,
				output: await Promise.resolve(handler(...input))
			};
		} catch (error) {
			store.records[recordKey] = {
				inputs: input,
				error: serializeDumpError(error)
			};
		}
	});
}
async function dumpFunctions(definitions, context, options = {}) {
	validateDefinitions(definitions);
	const concurrency = options.concurrency === true ? 5 : options.concurrency === false || options.concurrency == null ? 1 : options.concurrency;
	const store = {
		definitions: {},
		records: {}
	};
	await runDumpTasks((await runDumpTasks(definitions.map((definition) => () => resolveDumpTask(definition, context, store)), concurrency)).filter((x) => !!x).flatMap((resolution) => collectDumpTasks(resolution, store)), concurrency);
	return store;
}
/**
* Creates a client that serves pre-computed results from a dump store.
* Uses argument hashing to match calls to stored records.
*
* @example
* ```ts
* const client = createClientFromDump(store)
* await client.greet('Alice')
* ```
*/
function createClientFromDump(store, options = {}) {
	const { onMiss } = options;
	return new Proxy({}, {
		get(_, functionName) {
			if (!(functionName in store.definitions)) throw diagnostics.DF0025({ name: functionName });
			return async (...args) => {
				const recordKey = getDumpRecordKey(functionName, args);
				const recordOrGetter = store.records[recordKey];
				if (recordOrGetter) {
					const record = await resolveGetter(recordOrGetter);
					if (record.error) throw reviveDumpError(record.error);
					if (typeof record.output === "function") return await record.output();
					return record.output;
				}
				onMiss?.(functionName, args);
				const fallbackKey = getDumpFallbackKey(functionName);
				if (fallbackKey in store.records) {
					const fallbackOrGetter = store.records[fallbackKey];
					const fallbackRecord = await resolveGetter(fallbackOrGetter);
					if (fallbackRecord && typeof fallbackRecord.output === "function") return await fallbackRecord.output();
					if (fallbackRecord) return fallbackRecord.output;
				}
				throw diagnostics.DF0026({
					name: functionName,
					args: JSON.stringify(args)
				});
			};
		},
		has(_, functionName) {
			return functionName in store.definitions;
		},
		ownKeys() {
			return Object.keys(store.definitions);
		},
		getOwnPropertyDescriptor(_, functionName) {
			return functionName in store.definitions ? {
				configurable: true,
				enumerable: true,
				value: void 0
			} : void 0;
		}
	});
}
/**
* Filters function definitions to only those with dump definitions.
* Note: Only checks the definition itself, not setup results.
*/
function getDefinitionsWithDumps(definitions) {
	return definitions.filter((def) => def.dump !== void 0);
}
//#endregion
//#region src/rpc/dump/static.ts
function makeDumpKey(name) {
	return encodeURIComponent(name.replaceAll(":", "~"));
}
function makeStaticPath(name) {
	return `${DEVFRAME_RPC_DUMP_DIRNAME}/${makeDumpKey(name)}.static.json`;
}
function makeQueryRecordPath(name, hash) {
	return `${DEVFRAME_RPC_DUMP_DIRNAME}/${makeDumpKey(name)}.record.${hash}.json`;
}
function makeQueryFallbackPath(name) {
	return `${DEVFRAME_RPC_DUMP_DIRNAME}/${makeDumpKey(name)}.fallback.json`;
}
async function resolveRecord(record) {
	return typeof record === "function" ? await record() : record;
}
async function collectStaticDefinition(definition, context, serialization, files) {
	const handler = await getRpcHandler(definition, context);
	const path = makeStaticPath(definition.name);
	files[path] = {
		serialization,
		fnName: definition.name,
		data: { output: await Promise.resolve(handler()) }
	};
	return {
		type: "static",
		path,
		serialization
	};
}
async function collectQueryDefinition(definition, context, serialization, files) {
	const store = await dumpFunctions([definition], context);
	if (!(definition.name in store.definitions)) return void 0;
	const queryEntry = {
		type: "query",
		records: {},
		serialization
	};
	const prefix = `${definition.name}---`;
	for (const [recordKey, recordOrGetter] of Object.entries(store.records)) {
		if (!recordKey.startsWith(prefix)) continue;
		const key = recordKey.slice(prefix.length);
		const record = await resolveRecord(recordOrGetter);
		if (key === "fallback") {
			const path = makeQueryFallbackPath(definition.name);
			files[path] = {
				serialization,
				fnName: definition.name,
				data: record
			};
			queryEntry.fallback = path;
		} else {
			const path = makeQueryRecordPath(definition.name, key);
			files[path] = {
				serialization,
				fnName: definition.name,
				data: record
			};
			queryEntry.records[key] = path;
		}
	}
	if (!Object.keys(queryEntry.records).length && !queryEntry.fallback) return void 0;
	return queryEntry;
}
async function collectStaticRpcDump(definitions, context) {
	const manifest = {};
	const files = {};
	for (const definition of definitions) {
		ensureAgentJsonSerializable(definition);
		const type = definition.type ?? "query";
		const serialization = definition.jsonSerializable === true ? "json" : "structured-clone";
		if (type === "static") {
			manifest[definition.name] = await collectStaticDefinition(definition, context, serialization, files);
			continue;
		}
		if (type !== "query") continue;
		const queryEntry = await collectQueryDefinition(definition, context, serialization, files);
		if (queryEntry) manifest[definition.name] = queryEntry;
	}
	return {
		manifest,
		files
	};
}
//#endregion
//#region src/rpc/dump/write.ts
/**
* Write a collected static RPC dump to disk: every sharded record file plus
* the `__rpc-dump/index.json` manifest, under `outDir`. Shared by the build
* adapter (`createBuild`) and `@devframes/hub`'s `buildHub`.
*/
async function writeStaticRpcDump(dump, outDir, options = {}) {
	const indent = options.pretty ? 2 : void 0;
	await fs.mkdir(resolve(outDir, DEVFRAME_RPC_DUMP_DIRNAME), { recursive: true });
	for (const [filepath, file] of Object.entries(dump.files)) {
		const fullpath = resolve(outDir, filepath);
		await fs.mkdir(dirname(fullpath), { recursive: true });
		const text = file.serialization === "structured-clone" ? structuredCloneStringify(file.data) : strictJsonStringify(file.data, file.fnName);
		await fs.writeFile(fullpath, file.serialization === "json" && indent != null ? JSON.stringify(JSON.parse(text), null, indent) : text, "utf-8");
	}
	await fs.writeFile(resolve(outDir, DEVFRAME_RPC_DUMP_MANIFEST_FILENAME), JSON.stringify(dump.manifest, null, 2), "utf-8");
}
//#endregion
export { getDefinitionsWithDumps as a, dumpFunctions as i, collectStaticRpcDump as n, reviveDumpError as o, createClientFromDump as r, serializeDumpError as s, writeStaticRpcDump as t };
