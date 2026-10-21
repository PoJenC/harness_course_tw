//#region src/utils/colors.ts
function makeColor(open, close) {
	const o = `\x1B[${open}m`;
	const c = `\x1B[${close}m`;
	return ((arg, ...values) => {
		if (Array.isArray(arg) && "raw" in arg) {
			const strings = arg;
			let out = "";
			for (let i = 0; i < strings.length; i++) {
				out += strings[i];
				if (i < values.length) out += String(values[i]);
			}
			return `${o}${out}${c}`;
		}
		return `${o}${String(arg)}${c}`;
	});
}
const colors = {
	blue: makeColor(34, 39),
	cyan: makeColor(36, 39),
	gray: makeColor(90, 39),
	green: makeColor(32, 39),
	red: makeColor(31, 39),
	yellow: makeColor(33, 39),
	bold: makeColor(1, 22),
	dim: makeColor(2, 22),
	reset: makeColor(0, 0),
	underline: makeColor(4, 24)
};

//#region src/formatters/plain.ts
/**
* Renders a diagnostic into a multi-line, unicode-decorated string suitable
* for terminal output. The first line is `[<name>] <message>`; optional
* details (`fix`, `sources`, `docs`) follow with `├▶`/`╰▶` connectors.
*/
//#endregion
//#region src/utils.ts
/**
* Transforms a value or a function that returns a value to a value.
*
* @param valFn either a value or a function that returns a value
* @param args  arguments to pass to the function if `valFn` is a function
*
* @internal
*/
function toValueWithArgs(valFn, ...args) {
	return typeof valFn === "function" ? valFn(...args) : valFn;
}
const captureStackTrace = Error.captureStackTrace;
var Diagnostic = class Diagnostic extends Error {
	name;
	/**
	* The diagnostic code, e.g. `MATH_E001`.
	* Also appears as the `name` property.
	*/
	code;
	/**
	* URL to extended documentation for this diagnostic code.
	* Auto-generated from {@link DefineDiagnosticsOptions.docsBase}.
	*/
	docs;
	/**
	* Optional actionable instructions on how to resolve the problem.
	*/
	fix;
	/**
	* Locations in user code that contributed to this diagnostic, in
	* `file:line:column` format. Relevant when the stack trace doesn't reflect
	* the user's source (e.g. compilers, bundlers), otherwise redundant with the
	* stack and should be omitted.
	*/
	sources;
	/**
	* Structured information associated with this diagnostic code.
	*/
	data;
	/**
	* Alias for {@link Error.message}: the reason this diagnostic was raised.
	*/
	get why() {
		return this.message;
	}
	/**
	* @param init        structured initializer; `why` is required
	* @param captureFrom V8 stack-cutoff frame. Defaults to {@link Diagnostic}
	* so the top of the trace is the `new Diagnostic(...)` call site.
	* `defineDiagnostics` passes its action method to strip its own frames too.
	* Ignored on engines without `Error.captureStackTrace`.
	*/
	constructor(init, captureFrom = Diagnostic) {
		super(init.why, { cause: init.cause });
		this.code = this.name = init.code;
		this.fix = init.fix;
		this.docs = init.docs;
		this.sources = init.sources;
		this.data = init.data;
		captureStackTrace?.(this, captureFrom);
	}
	/**
	* Converts the diagnostic into a serializable structured object.
	*/
	toJSON() {
		return {
			name: this.name,
			why: this.why,
			fix: this.fix,
			docs: this.docs,
			sources: this.sources,
			cause: this.cause,
			data: this.data,
			stack: this.stack
		};
	}
};
/**
* Resolves the docs URL for a code from a `docsBase` (string template or
* resolver function). Shared by {@link defineDiagnostics} and
* {@link defineProdDiagnostics}. Per-code `docs` overrides are handled by the
* caller; this only covers the `docsBase`-derived case.
*
* @internal
*/
function deriveDocs(docsBase, code) {
	return typeof docsBase === "string" ? `${docsBase}/${code.toLowerCase()}` : docsBase?.(code);
}
/**
* Creates a typed diagnostics object from a set of code definitions. Each
* code becomes a callable {@link DiagnosticHandle}: invoke to report, or
* `throw` the result to raise. No `new` required, no proxy.
*/
/* @__NO_SIDE_EFFECTS__ */
function defineDiagnostics(options) {
	const reporters = options.reporters ?? [];
	const result = {};
	const { docsBase } = options;
	for (const code of Object.keys(options.codes)) {
		const def = options.codes[code];
		const docs = def.docs === false ? void 0 : def.docs || deriveDocs(docsBase, code);
		const handle = (params = {}, reporterOptions = {}) => {
			const diagnostic = new Diagnostic({
				code,
				why: toValueWithArgs(def.why, params),
				fix: toValueWithArgs(def.fix, params),
				docs,
				cause: params.cause,
				sources: params.sources,
				data: toValueWithArgs(def.data, params)
			}, handle);
			for (const reporter of reporters) reporter(diagnostic, reporterOptions);
			return diagnostic;
		};
		result[code] = handle;
	}
	return result;
}

//#region src/formatters/ansi.ts
/* @__NO_SIDE_EFFECTS__ */
function ansiFormatter(colors) {
	return (d) => {
		const header = `${colors.bold(colors.red(`[${d.name}]`))} ${d.message}`;
		const details = [];
		if (d.fix) details.push(`${colors.dim("fix:")} ${d.fix}`);
		if (d.sources?.length) details.push(`${colors.dim("sources:")} ${d.sources.join(", ")}`);
		if (d.docs) details.push(`${colors.dim("see:")} ${colors.cyan(d.docs)}`);
		if (details.length === 0) return header;
		return [header, ...details.map((detail, i) => {
			return `${colors.dim(i < details.length - 1 ? "├▶" : "╰▶")} ${detail}`;
		})].join("\n");
	};
}

//#region src/events.ts
/**
* Centralized registry of the core devframe event names: the node-side host
* bus events, the client RPC connection events, and the server→client
* broadcast notifications, so these names live in one place instead of
* scattered string literals.
*
* **Keep this in sync with [`docs/content/8.references/3.events.md`](../../../docs/content/8.references/3.events.md)**
* (the "Core devframe events" section): every name here appears in that page's
* tables, and every name there resolves to an entry here. Add, rename, or
* remove a name in both places in the same change, and reference
* `DEVFRAME_EVENTS.*` from call sites instead of re-typing a literal.
*
* This map covers **notifications** (events, broadcasts). The request/response
* RPC endpoints of the shared-state, streaming, and auth-handshake protocols
* (`devframe:rpc:server-state:*`, `devframe:streaming:subscribe`,
* `anonymous:devframe:auth`, …) are defined at their handlers and typed in
* `types/rpc-augments.ts`; they aren't events and stay out of this map.
*
* The `EventEmitter` maps (`RpcClientEvents`, `DevframeAgentHostEvents`) and the
* `DevframeRpcClientFunctions` augmentation declare these names as type-level
* keys (a literal is unavoidable in a type position); those declarations mirror
* this map and move with it.
*/
const DEVFRAME_EVENTS = {
	/**
	* In-page channel notifications the page script pushes to its panels
	* (page script → panel), `devframe:` prefix. The paired request methods
	* (`devframe:in-page:page-state:subscribe`/`set`/`patch`) are call
	* endpoints, not events, and are defined at their handlers
	* (`in-page-channel/state.ts`).
	*/
	inPageChannel: {
		panelStateUpdated: "devframe:in-page:panel-state:updated",
		panelStatePatch: "devframe:in-page:panel-state:patch"
	},
	/** `postMessage` channels the runtime posts across window boundaries. */
	postMessage: {
		inPageChannel: "devframe:in-page-channel"
	}
};
//#endregion
//#region src/utils/nostics.ts
const formatAnsi = ansiFormatter(colors);
/**
* The reporter every {@link defineDiagnostics} call below wires in ahead of
* any caller-supplied ones: prints the diagnostic through devframe's own
* ANSI colors via `console[method]` (default `'warn'`).
*/
function devframeReporter(d, { method = "warn" } = {}) {
	console[method](formatAnsi(d));
}
/**
* Drop-in replacement for `nostics`'s `defineDiagnostics()` with devframe's
* ANSI console reporter pre-wired ahead of any `reporters` passed in. Every
* `diagnostics.ts` in devframe core, `@devframes/hub`, `@devframes/json-render`,
* and the built-in plugins defines its codes through this instead of
* `nostics`'s own `defineDiagnostics`; the reporter registration lives
* here, once, so none of them need to build their own reporter (`colors`,
* `ansiFormatter`) or take a direct dependency on `nostics` themselves.
*/
function defineDiagnostics$1(options) {
	return defineDiagnostics({
		...options,
		reporters: [devframeReporter, ...options.reporters ?? []]
	});
}
//#endregion
//#region ../../node_modules/.pnpm/birpc@4.2.0/node_modules/birpc/dist/index.mjs
function createPromiseWithResolvers() {
	let resolve;
	let reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
const random = Math.random.bind(Math);
const urlAlphabet$1 = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid$1(size = 21) {
	let id = "";
	let i = size;
	while (i--) id += urlAlphabet$1[random() * 64 | 0];
	return id;
}
const DEFAULT_TIMEOUT = 6e4;
const defaultSerialize = (i) => i;
const defaultDeserialize = defaultSerialize;
const { clearTimeout: clearTimeout$1, setTimeout: setTimeout$1 } = globalThis;
function createBirpc($functions, options) {
	const { post, on, off = () => {}, eventNames = [], serialize = defaultSerialize, deserialize = defaultDeserialize, resolver, bind = "rpc", timeout = DEFAULT_TIMEOUT, proxify = true } = options;
	let $closed = false;
	const _rpcPromiseMap = /* @__PURE__ */ new Map();
	let _promiseInit;
	let rpc;
	async function _call(method, args, event, optional) {
		if ($closed) throw new Error(`[birpc] rpc is closed, cannot call "${method}"`);
		const req = {
			m: method,
			a: args,
			t: "q"
		};
		if (optional) req.o = true;
		const send = async (_req) => post(serialize(_req));
		if (event) {
			await send(req);
			return;
		}
		if (_promiseInit) try {
			await _promiseInit;
		} finally {
			_promiseInit = void 0;
		}
		let { promise, resolve, reject } = createPromiseWithResolvers();
		const id = nanoid$1();
		req.i = id;
		let timeoutId;
		async function handler(newReq = req) {
			if (timeout >= 0) {
				timeoutId = setTimeout$1(() => {
					try {
						if (options.onTimeoutError?.call(rpc, method, args) !== true) throw new Error(`[birpc] timeout on calling "${method}"`);
					} catch (e) {
						reject(e);
					}
					_rpcPromiseMap.delete(id);
				}, timeout);
				if (typeof timeoutId === "object") timeoutId = timeoutId.unref?.();
			}
			_rpcPromiseMap.set(id, {
				resolve,
				reject,
				timeoutId,
				method
			});
			await send(newReq);
			return promise;
		}
		try {
			if (options.onRequest) await options.onRequest.call(rpc, req, handler, resolve);
			else await handler();
		} catch (e) {
			if (options.onGeneralError?.call(rpc, e) !== true) throw e;
			return;
		} finally {
			clearTimeout$1(timeoutId);
			_rpcPromiseMap.delete(id);
		}
		return promise;
	}
	const builtinMethods = {
		$call: (method, ...args) => _call(method, args, false),
		$callOptional: (method, ...args) => _call(method, args, false, true),
		$callEvent: (method, ...args) => _call(method, args, true),
		$callRaw: (options) => _call(options.method, options.args, options.event, options.optional),
		$rejectPendingCalls,
		get $closed() {
			return $closed;
		},
		get $meta() {
			return options.meta;
		},
		$close,
		$functions
	};
	if (proxify) rpc = new Proxy({}, { get(_, method) {
		if (Object.hasOwn(builtinMethods, method)) return builtinMethods[method];
		if (method === "then" && !eventNames.includes("then") && !("then" in $functions)) return void 0;
		const sendEvent = (...args) => _call(method, args, true);
		if (eventNames.includes(method)) {
			sendEvent.asEvent = sendEvent;
			return sendEvent;
		}
		const sendCall = (...args) => _call(method, args, false);
		sendCall.asEvent = sendEvent;
		return sendCall;
	} });
	else rpc = builtinMethods;
	function $close(customError) {
		$closed = true;
		_rpcPromiseMap.forEach(({ reject, method }) => {
			const error = /* @__PURE__ */ new Error(`[birpc] rpc is closed, cannot call "${method}"`);
			if (customError) {
				customError.cause ??= error;
				return reject(customError);
			}
			reject(error);
		});
		_rpcPromiseMap.clear();
		off(onMessage);
	}
	function $rejectPendingCalls(handler) {
		const handlerResults = Array.from(_rpcPromiseMap.values()).map(({ method, reject }) => {
			if (!handler) return reject(/* @__PURE__ */ new Error(`[birpc]: rejected pending call "${method}".`));
			return handler({
				method,
				reject
			});
		});
		_rpcPromiseMap.clear();
		return handlerResults;
	}
	async function onMessage(data, ...extra) {
		let msg;
		try {
			msg = deserialize(data);
		} catch (e) {
			if (options.onGeneralError?.call(rpc, e) !== true) throw e;
			return;
		}
		if (msg.t === "q") {
			const { m: method, a: args, o: optional } = msg;
			let result, error;
			let fn = await (resolver ? resolver.call(rpc, method, $functions[method]) : $functions[method]);
			if (optional) fn ||= () => void 0;
			if (!fn) error = /* @__PURE__ */ new Error(`[birpc] function "${method}" not found`);
			else try {
				result = await fn.apply(bind === "rpc" ? rpc : $functions, args);
			} catch (e) {
				error = e;
			}
			if (msg.i) {
				if (error && options.onFunctionError) {
					if (options.onFunctionError.call(rpc, error, method, args) === true) return;
				}
				if (!error) try {
					await post(serialize({
						t: "s",
						i: msg.i,
						r: result
					}), ...extra);
					return;
				} catch (e) {
					error = e;
					if (options.onGeneralError?.call(rpc, e, method, args) !== true) throw e;
				}
				try {
					await post(serialize({
						t: "s",
						i: msg.i,
						e: error
					}), ...extra);
				} catch (e) {
					if (options.onGeneralError?.call(rpc, e, method, args) !== true) throw e;
				}
			}
		} else {
			const { i: ack, r: result, e: error } = msg;
			const promise = _rpcPromiseMap.get(ack);
			if (promise) {
				clearTimeout$1(promise.timeoutId);
				if (error) promise.reject(error);
				else promise.resolve(result);
			}
			_rpcPromiseMap.delete(ack);
		}
	}
	_promiseInit = on(onMessage);
	return rpc;
}
//#endregion
//#region src/agent/safety.ts
/**
* An agent tool's safety classification: the explicit `agent.safety`, else
* inferred from the function `type` (`static`/`query` are read-only, the rest
* mutate). Shared by every agent surface (MCP host, WebMCP, in-page bridge).
*/
function resolveAgentSafety(type, agent) {
	if (agent.safety) return agent.safety;
	return type === "static" || type === "query" || type == null ? "read" : "action";
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
//#region src/tool-input.ts
/**
* Convert an object-shaped tool input into positional arguments.
*
* Tool schemas expose positional parameters as `arg0`, `arg1`, and so on.
* Arrays pass through for callers that already provide positional arguments.
*/
function collectPositionalArgs(input, argumentCount) {
	if (Array.isArray(input)) return input;
	if (input === void 0 || input === null) return [];
	if (typeof input !== "object") return void 0;
	const record = input;
	if (argumentCount != null) return Array.from({ length: argumentCount }, (_, index) => record[`arg${index}`]);
	if ("arg0" in record) {
		const positional = [];
		while (`arg${positional.length}` in record) positional.push(record[`arg${positional.length}`]);
		return positional;
	}
	return Object.keys(record).length === 0 ? [] : void 0;
}
/** Convert tool input for an RPC, preserving an untyped payload as arg 0. */
function toolInputToRpcArgs(input, argumentCount) {
	return collectPositionalArgs(input, argumentCount) ?? [input];
}

//#region src/utils/events.ts
/**
* Create event emitter.
*/
function createEventEmitter() {
	const _listeners = {};
	function emit(event, ...args) {
		const callbacks = _listeners[event] || [];
		for (let i = 0, length = callbacks.length; i < length; i++) {
			const callback = callbacks[i];
			if (callback) callback(...args);
		}
	}
	function emitOnce(event, ...args) {
		emit(event, ...args);
		delete _listeners[event];
	}
	function on(event, cb) {
		(_listeners[event] ||= []).push(cb);
		return () => {
			_listeners[event] = _listeners[event]?.filter((i) => cb !== i);
		};
	}
	function once(event, cb) {
		const unsubscribe = on(event, ((...args) => {
			unsubscribe();
			return cb(...args);
		}));
		return unsubscribe;
	}
	return {
		_listeners,
		emit,
		emitOnce,
		on,
		once
	};
}

//#region src/utils/nanoid.ts
const urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid(size = 21) {
	let id = "";
	let i = size;
	while (i--) id += urlAlphabet[Math.random() * 64 | 0];
	return id;
}

//#region ../../node_modules/.pnpm/immer@11.1.18/node_modules/immer/dist/immer.mjs
var NOTHING = Symbol.for("immer-nothing");
var DRAFTABLE = Symbol.for("immer-draftable");
var DRAFT_STATE = Symbol.for("immer-state");
var errors = [
	function(plugin) {
		return `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call \`enable${plugin}()\` when initializing your application.`;
	},
	function(thing) {
		return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`;
	},
	"This object has been frozen and should not be mutated",
	function(data) {
		return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
	},
	"An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
	"Immer forbids circular references",
	"The first or second argument to `produce` must be a function",
	"The third argument to `produce` must be a function or undefined",
	"First argument to `createDraft` must be a plain object, an array, or an immerable object",
	"First argument to `finishDraft` must be a draft returned by `createDraft`",
	function(thing) {
		return `'current' expects a draft, got: ${thing}`;
	},
	"Object.defineProperty() cannot be used on an Immer draft",
	"Object.setPrototypeOf() cannot be used on an Immer draft",
	"Immer only supports deleting array indices",
	"Immer only supports setting array indices and the 'length' property",
	function(thing) {
		return `'original' expects a draft, got: ${thing}`;
	}
];
function die(error, ...args) {
	{
		const e = errors[error];
		const msg = isFunction(e) ? e.apply(null, args) : e;
		throw new Error(`[Immer] ${msg}`);
	}
}
var O = Object;
var getPrototypeOf = O.getPrototypeOf;
var CONSTRUCTOR = "constructor";
var PROTOTYPE = "prototype";
var CONFIGURABLE = "configurable";
var ENUMERABLE = "enumerable";
var WRITABLE = "writable";
var VALUE = "value";
var isDraft = (value) => !!value && !!value[DRAFT_STATE];
function isDraftable(value) {
	if (!value) return false;
	return isPlainObject(value) || isArray(value) || !!value[DRAFTABLE] || !!value[CONSTRUCTOR]?.[DRAFTABLE] || isMap(value) || isSet(value);
}
var objectCtorString = O[PROTOTYPE][CONSTRUCTOR].toString();
var cachedCtorStrings = /* @__PURE__ */ new WeakMap();
function isPlainObject(value) {
	if (!value || !isObjectish(value)) return false;
	const proto = getPrototypeOf(value);
	if (proto === null || proto === O[PROTOTYPE]) return true;
	const Ctor = O.hasOwnProperty.call(proto, CONSTRUCTOR) && proto[CONSTRUCTOR];
	if (Ctor === Object) return true;
	if (!isFunction(Ctor)) return false;
	let ctorString = cachedCtorStrings.get(Ctor);
	if (ctorString === void 0) {
		ctorString = Function.toString.call(Ctor);
		cachedCtorStrings.set(Ctor, ctorString);
	}
	return ctorString === objectCtorString;
}
function each(obj, iter, strict = true) {
	if (getArchtype(obj) === 0) (strict ? Reflect.ownKeys(obj) : O.keys(obj)).forEach((key) => {
		iter(key, obj[key], obj);
	});
	else obj.forEach((entry, index) => iter(index, entry, obj));
}
function getArchtype(thing) {
	const state = thing[DRAFT_STATE];
	return state ? state.type_ : isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
}
var has = (thing, prop, type = getArchtype(thing)) => type === 2 ? thing.has(prop) : O[PROTOTYPE].hasOwnProperty.call(thing, prop);
var get = (thing, prop, type = getArchtype(thing)) => type === 2 ? thing.get(prop) : thing[prop];
var set = (thing, propOrOldValue, value, type = getArchtype(thing)) => {
	if (type === 2) thing.set(propOrOldValue, value);
	else if (type === 3) thing.add(value);
	else thing[propOrOldValue] = value;
};
function is(x, y) {
	if (x === y) return x !== 0 || 1 / x === 1 / y;
	else return x !== x && y !== y;
}
var isArray = Array.isArray;
var isMap = (target) => target instanceof Map;
var isSet = (target) => target instanceof Set;
var isObjectish = (target) => typeof target === "object";
var isFunction = (target) => typeof target === "function";
var isBoolean = (target) => typeof target === "boolean";
function isArrayIndex(value) {
	const n = +value;
	return Number.isInteger(n) && String(n) === value;
}
var getProxyDraft = (value) => {
	if (!isObjectish(value)) return null;
	return value?.[DRAFT_STATE];
};
var latest = (state) => state.copy_ || state.base_;
var getFinalValue = (state) => state.modified_ ? state.copy_ : state.base_;
function shallowCopy(base, strict) {
	if (isMap(base)) return new Map(base);
	if (isSet(base)) return new Set(base);
	if (isArray(base)) return Array[PROTOTYPE].slice.call(base);
	const isPlain = isPlainObject(base);
	if (strict === true || strict === "class_only" && !isPlain) {
		const descriptors = O.getOwnPropertyDescriptors(base);
		delete descriptors[DRAFT_STATE];
		let keys = Reflect.ownKeys(descriptors);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const desc = descriptors[key];
			if (desc[WRITABLE] === false) {
				desc[WRITABLE] = true;
				desc[CONFIGURABLE] = true;
			}
			if (desc.get || desc.set) descriptors[key] = {
				[CONFIGURABLE]: true,
				[WRITABLE]: true,
				[ENUMERABLE]: desc[ENUMERABLE],
				[VALUE]: base[key]
			};
		}
		return O.create(getPrototypeOf(base), descriptors);
	} else {
		const proto = getPrototypeOf(base);
		if (proto !== null && isPlain) return { ...base };
		const obj = O.create(proto);
		return O.assign(obj, base);
	}
}
function freeze(obj, deep = false) {
	if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj)) return obj;
	if (getArchtype(obj) > 1) O.defineProperties(obj, {
		set: dontMutateMethodOverride,
		add: dontMutateMethodOverride,
		clear: dontMutateMethodOverride,
		delete: dontMutateMethodOverride
	});
	O.freeze(obj);
	if (deep) each(obj, (_key, value) => {
		freeze(value, true);
	}, false);
	return obj;
}
function dontMutateFrozenCollections() {
	die(2);
}
var dontMutateMethodOverride = { [VALUE]: dontMutateFrozenCollections };
function isFrozen(obj) {
	if (obj === null || !isObjectish(obj)) return true;
	return O.isFrozen(obj);
}
var PluginMapSet = "MapSet";
var PluginPatches = "Patches";
var PluginArrayMethods = "ArrayMethods";
var plugins = {};
function getPlugin(pluginKey) {
	const plugin = plugins[pluginKey];
	if (!plugin) die(0, pluginKey);
	return plugin;
}
var isPluginLoaded = (pluginKey) => !!plugins[pluginKey];
function loadPlugin(pluginKey, implementation) {
	if (!plugins[pluginKey]) plugins[pluginKey] = implementation;
}
var currentScope;
var getCurrentScope = () => currentScope;
var createScope = (parent_, immer_) => ({
	drafts_: [],
	parent_,
	immer_,
	canAutoFreeze_: true,
	unfinalizedDrafts_: 0,
	handledSet_: /* @__PURE__ */ new Set(),
	processedForPatches_: /* @__PURE__ */ new Set(),
	mapSetPlugin_: isPluginLoaded(PluginMapSet) ? getPlugin(PluginMapSet) : void 0,
	arrayMethodsPlugin_: isPluginLoaded(PluginArrayMethods) ? getPlugin(PluginArrayMethods) : void 0
});
function usePatchesInScope(scope, patchListener) {
	if (patchListener) {
		scope.patchPlugin_ = getPlugin(PluginPatches);
		scope.patches_ = [];
		scope.inversePatches_ = [];
		scope.patchListener_ = patchListener;
	}
}
function revokeScope(scope) {
	leaveScope(scope);
	scope.drafts_.forEach(revokeDraft);
	scope.drafts_ = null;
}
function leaveScope(scope) {
	if (scope === currentScope) currentScope = scope.parent_;
}
var enterScope = (immer2) => currentScope = createScope(currentScope, immer2);
function revokeDraft(draft) {
	const state = draft[DRAFT_STATE];
	if (state.type_ === 0 || state.type_ === 1) state.revoke_();
	else state.revoked_ = true;
}
function processResult(result, scope) {
	scope.unfinalizedDrafts_ = scope.drafts_.length;
	const baseDraft = scope.drafts_[0];
	if (result !== void 0 && result !== baseDraft) {
		if (baseDraft[DRAFT_STATE].modified_) {
			revokeScope(scope);
			die(4);
		}
		if (isDraftable(result)) result = finalize(scope, result);
		const { patchPlugin_ } = scope;
		if (patchPlugin_) patchPlugin_.generateReplacementPatches_(baseDraft[DRAFT_STATE].base_, result, scope);
	} else result = finalize(scope, baseDraft);
	maybeFreeze(scope, result, true);
	revokeScope(scope);
	if (scope.patches_) scope.patchListener_(scope.patches_, scope.inversePatches_);
	return result !== NOTHING ? result : void 0;
}
function finalize(rootScope, value) {
	if (isFrozen(value)) return value;
	const state = value[DRAFT_STATE];
	if (!state) return handleValue(value, rootScope.handledSet_, rootScope);
	if (!isSameScope(state, rootScope)) return value;
	if (!state.modified_) return state.base_;
	if (!state.finalized_) {
		const { callbacks_ } = state;
		if (callbacks_) while (callbacks_.length > 0) callbacks_.pop()(rootScope);
		generatePatchesAndFinalize(state, rootScope);
	}
	return state.copy_;
}
function maybeFreeze(scope, value, deep = false) {
	if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) freeze(value, deep);
}
function markStateFinalized(state) {
	state.finalized_ = true;
	state.scope_.unfinalizedDrafts_--;
}
var isSameScope = (state, rootScope) => state.scope_ === rootScope;
var EMPTY_LOCATIONS_RESULT = [];
function updateDraftInParent(parent, draftValue, finalizedValue, originalKey) {
	const parentCopy = latest(parent);
	const parentType = parent.type_;
	if (originalKey !== void 0) {
		if (get(parentCopy, originalKey, parentType) === draftValue) {
			set(parentCopy, originalKey, finalizedValue, parentType);
			return;
		}
	}
	if (!parent.draftLocations_) {
		const draftLocations = parent.draftLocations_ = /* @__PURE__ */ new Map();
		each(parentCopy, (key, value) => {
			if (isDraft(value)) {
				const keys = draftLocations.get(value) || [];
				keys.push(key);
				draftLocations.set(value, keys);
			}
		});
	}
	const locations = parent.draftLocations_.get(draftValue) ?? EMPTY_LOCATIONS_RESULT;
	for (const location of locations) set(parentCopy, location, finalizedValue, parentType);
}
function registerChildFinalizationCallback(parent, child, key) {
	parent.callbacks_.push(function childCleanup(rootScope) {
		const state = child;
		if (!state || !isSameScope(state, rootScope)) return;
		rootScope.mapSetPlugin_?.fixSetContents(state);
		const finalizedValue = getFinalValue(state);
		updateDraftInParent(parent, state.draft_ ?? state, finalizedValue, key);
		generatePatchesAndFinalize(state, rootScope);
	});
}
function generatePatchesAndFinalize(state, rootScope) {
	if (state.modified_ && !state.finalized_ && (state.type_ === 3 || state.type_ === 1 && state.allIndicesReassigned_ || (state.assigned_?.size ?? 0) > 0)) {
		const { patchPlugin_ } = rootScope;
		if (patchPlugin_) {
			const basePath = patchPlugin_.getPath(state);
			if (basePath) patchPlugin_.generatePatches_(state, basePath, rootScope);
		}
		markStateFinalized(state);
	}
}
function handleCrossReference(target, key, value) {
	const { scope_ } = target;
	if (isDraft(value)) {
		const state = value[DRAFT_STATE];
		if (isSameScope(state, scope_)) state.callbacks_.push(function crossReferenceCleanup() {
			prepareCopy(target);
			updateDraftInParent(target, value, getFinalValue(state), key);
		});
	} else if (isDraftable(value)) target.callbacks_.push(function nestedDraftCleanup() {
		const targetCopy = latest(target);
		if (target.type_ === 3) {
			if (targetCopy.has(value)) handleValue(value, scope_.handledSet_, scope_);
		} else if (get(targetCopy, key, target.type_) === value) {
			if (scope_.drafts_.length > 1 && (target.assigned_.get(key) ?? false) === true && target.copy_) handleValue(get(target.copy_, key, target.type_), scope_.handledSet_, scope_);
		}
	});
}
function handleValue(target, handledSet, rootScope) {
	if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) return target;
	if (isDraft(target) || handledSet.has(target) || !isDraftable(target) || isFrozen(target)) return target;
	handledSet.add(target);
	each(target, (key, value) => {
		if (isDraft(value)) {
			const state = value[DRAFT_STATE];
			if (isSameScope(state, rootScope)) {
				set(target, key, getFinalValue(state), target.type_);
				markStateFinalized(state);
			}
		} else if (isDraftable(value)) handleValue(value, handledSet, rootScope);
	});
	return target;
}
function createProxyProxy(base, parent) {
	const baseIsArray = isArray(base);
	const state = {
		type_: baseIsArray ? 1 : 0,
		scope_: parent ? parent.scope_ : getCurrentScope(),
		modified_: false,
		finalized_: false,
		assigned_: void 0,
		parent_: parent,
		base_: base,
		draft_: null,
		copy_: null,
		revoke_: null,
		isManual_: false,
		callbacks_: void 0
	};
	let target = state;
	let traps = objectTraps;
	if (baseIsArray) {
		target = [state];
		traps = arrayTraps;
	}
	const { revoke, proxy } = Proxy.revocable(target, traps);
	state.draft_ = proxy;
	state.revoke_ = revoke;
	return [proxy, state];
}
var objectTraps = {
	get(state, prop) {
		if (prop === DRAFT_STATE) return state;
		let arrayPlugin = state.scope_.arrayMethodsPlugin_;
		const isArrayWithStringProp = state.type_ === 1 && typeof prop === "string";
		if (isArrayWithStringProp) {
			if (arrayPlugin?.isArrayOperationMethod(prop)) return arrayPlugin.createMethodInterceptor(state, prop);
		}
		const source = latest(state);
		if (!has(source, prop, state.type_)) return readPropFromProto(state, source, prop);
		const value = source[prop];
		if (state.finalized_ || !isDraftable(value)) return value;
		if (isArrayWithStringProp && state.operationMethod && arrayPlugin?.isMutatingArrayMethod(state.operationMethod) && isArrayIndex(prop)) return value;
		if (value === peek(state.base_, prop) || isRelocatedBaseRef(state, prop, value)) {
			prepareCopy(state);
			const childKey = state.type_ === 1 ? +prop : prop;
			const childDraft = createProxy(state.scope_, value, state, childKey);
			return state.copy_[childKey] = childDraft;
		}
		return value;
	},
	has(state, prop) {
		return prop in latest(state);
	},
	ownKeys(state) {
		return Reflect.ownKeys(latest(state));
	},
	set(state, prop, value) {
		const desc = getDescriptorFromProto(latest(state), prop);
		if (desc?.set) {
			desc.set.call(state.draft_, value);
			return true;
		}
		if (!state.modified_) {
			const current2 = peek(latest(state), prop);
			const currentState = current2?.[DRAFT_STATE];
			if (currentState && currentState.base_ === value) {
				state.copy_[prop] = value;
				state.assigned_.set(prop, false);
				return true;
			}
			if (is(value, current2) && (value !== void 0 || has(state.base_, prop, state.type_))) return true;
			prepareCopy(state);
			markChanged(state);
		}
		if (state.copy_[prop] === value && (value !== void 0 || has(state.copy_, prop, state.type_)) || Number.isNaN(value) && Number.isNaN(state.copy_[prop])) return true;
		state.copy_[prop] = value;
		state.assigned_.set(prop, true);
		handleCrossReference(state, prop, value);
		return true;
	},
	deleteProperty(state, prop) {
		prepareCopy(state);
		if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
			state.assigned_.set(prop, false);
			markChanged(state);
		} else state.assigned_.delete(prop);
		if (state.copy_) delete state.copy_[prop];
		return true;
	},
	getOwnPropertyDescriptor(state, prop) {
		const owner = latest(state);
		const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
		if (!desc) return desc;
		return {
			[WRITABLE]: true,
			[CONFIGURABLE]: state.type_ !== 1 || prop !== "length",
			[ENUMERABLE]: desc[ENUMERABLE],
			[VALUE]: owner[prop]
		};
	},
	defineProperty() {
		die(11);
	},
	getPrototypeOf(state) {
		return getPrototypeOf(state.base_);
	},
	setPrototypeOf() {
		die(12);
	}
};
var arrayTraps = {};
for (let key in objectTraps) {
	let fn = objectTraps[key];
	arrayTraps[key] = function() {
		const args = arguments;
		args[0] = args[0][0];
		return fn.apply(this, args);
	};
}
arrayTraps.deleteProperty = function(state, prop) {
	if (isNaN(parseInt(prop))) die(13);
	return arrayTraps.set.call(this, state, prop, void 0);
};
arrayTraps.set = function(state, prop, value) {
	if (prop !== "length" && isNaN(parseInt(prop))) die(14);
	return objectTraps.set.call(this, state[0], prop, value, state[0]);
};
function peek(draft, prop) {
	const state = draft[DRAFT_STATE];
	return (state ? latest(state) : draft)[prop];
}
function isRelocatedBaseRef(state, prop, value) {
	if (state.type_ !== 1 || !state.allIndicesReassigned_ || state.assigned_?.get(prop) || !isDraftable(value) || value[DRAFT_STATE]) return false;
	return state.baseRefs_.has(value);
}
function readPropFromProto(state, source, prop) {
	const desc = getDescriptorFromProto(source, prop);
	return desc ? VALUE in desc ? desc[VALUE] : desc.get?.call(state.draft_) : void 0;
}
function getDescriptorFromProto(source, prop) {
	if (!(prop in source)) return void 0;
	let proto = getPrototypeOf(source);
	while (proto) {
		const desc = Object.getOwnPropertyDescriptor(proto, prop);
		if (desc) return desc;
		proto = getPrototypeOf(proto);
	}
}
function markChanged(state) {
	if (!state.modified_) {
		state.modified_ = true;
		if (state.parent_) markChanged(state.parent_);
	}
}
function prepareCopy(state) {
	if (!state.copy_) {
		state.assigned_ = /* @__PURE__ */ new Map();
		state.copy_ = shallowCopy(state.base_, state.scope_.immer_.useStrictShallowCopy_);
	}
}
var Immer2 = class {
	constructor(config) {
		this.autoFreeze_ = true;
		this.useStrictShallowCopy_ = false;
		this.useStrictIteration_ = false;
		/**
		* The `produce` function takes a value and a "recipe function" (whose
		* return value often depends on the base state). The recipe function is
		* free to mutate its first argument however it wants. All mutations are
		* only ever applied to a __copy__ of the base state.
		*
		* Pass only a function to create a "curried producer" which relieves you
		* from passing the recipe function every time.
		*
		* Only plain objects and arrays are made mutable. All other objects are
		* considered uncopyable.
		*
		* Note: This function is __bound__ to its `Immer` instance.
		*
		* @param {any} base - the initial state
		* @param {Function} recipe - function that receives a proxy of the base state as first argument and which can be freely modified
		* @param {Function} patchListener - optional function that will be called with all the patches produced here
		* @returns {any} a new state, or the initial state if nothing was modified
		*/
		this.produce = (base, recipe, patchListener) => {
			if (isFunction(base) && !isFunction(recipe)) {
				const defaultBase = recipe;
				recipe = base;
				const self = this;
				return function curriedProduce(base2 = defaultBase, ...args) {
					return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
				};
			}
			if (!isFunction(recipe)) die(6);
			if (patchListener !== void 0 && !isFunction(patchListener)) die(7);
			let result;
			if (isDraftable(base)) {
				const scope = enterScope(this);
				const proxy = createProxy(scope, base, void 0);
				let hasError = true;
				try {
					result = recipe(proxy);
					hasError = false;
				} finally {
					if (hasError) revokeScope(scope);
					else leaveScope(scope);
				}
				usePatchesInScope(scope, patchListener);
				return processResult(result, scope);
			} else if (!base || !isObjectish(base)) {
				result = recipe(base);
				if (result === void 0) result = base;
				if (result === NOTHING) result = void 0;
				if (this.autoFreeze_) freeze(result, true);
				if (patchListener) {
					const p = [];
					const ip = [];
					getPlugin(PluginPatches).generateReplacementPatches_(base, result, {
						patches_: p,
						inversePatches_: ip
					});
					patchListener(p, ip);
				}
				return result;
			} else die(1, base);
		};
		this.produceWithPatches = (base, recipe) => {
			if (isFunction(base)) return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
			let patches, inversePatches;
			return [
				this.produce(base, recipe, (p, ip) => {
					patches = p;
					inversePatches = ip;
				}),
				patches,
				inversePatches
			];
		};
		if (isBoolean(config?.autoFreeze)) this.setAutoFreeze(config.autoFreeze);
		if (isBoolean(config?.useStrictShallowCopy)) this.setUseStrictShallowCopy(config.useStrictShallowCopy);
		if (isBoolean(config?.useStrictIteration)) this.setUseStrictIteration(config.useStrictIteration);
	}
	createDraft(base) {
		if (!isDraftable(base)) die(8);
		if (isDraft(base)) base = current(base);
		const scope = enterScope(this);
		const proxy = createProxy(scope, base, void 0);
		proxy[DRAFT_STATE].isManual_ = true;
		leaveScope(scope);
		return proxy;
	}
	finishDraft(draft, patchListener) {
		const state = draft && draft[DRAFT_STATE];
		if (!state || !state.isManual_) die(9);
		const { scope_: scope } = state;
		usePatchesInScope(scope, patchListener);
		return processResult(void 0, scope);
	}
	/**
	* Pass true to automatically freeze all copies created by Immer.
	*
	* By default, auto-freezing is enabled.
	*/
	setAutoFreeze(value) {
		this.autoFreeze_ = value;
	}
	/**
	* Pass true to enable strict shallow copy.
	*
	* By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
	*/
	setUseStrictShallowCopy(value) {
		this.useStrictShallowCopy_ = value;
	}
	/**
	* Pass false to use faster iteration that skips non-enumerable properties
	* but still handles symbols for compatibility.
	*
	* By default, strict iteration is enabled (includes all own properties).
	*/
	setUseStrictIteration(value) {
		this.useStrictIteration_ = value;
	}
	shouldUseStrictIteration() {
		return this.useStrictIteration_;
	}
	applyPatches(base, patches) {
		let i;
		for (i = patches.length - 1; i >= 0; i--) {
			const patch = patches[i];
			if (patch.path.length === 0 && patch.op === "replace") {
				base = patch.value;
				break;
			}
		}
		if (i > -1) patches = patches.slice(i + 1);
		const applyPatchesImpl = getPlugin(PluginPatches).applyPatches_;
		if (isDraft(base)) return applyPatchesImpl(base, patches);
		return this.produce(base, (draft) => applyPatchesImpl(draft, patches));
	}
};
function createProxy(rootScope, value, parent, key) {
	const [draft, state] = isMap(value) ? getPlugin(PluginMapSet).proxyMap_(value, parent) : isSet(value) ? getPlugin(PluginMapSet).proxySet_(value, parent) : createProxyProxy(value, parent);
	(parent?.scope_ ?? getCurrentScope()).drafts_.push(draft);
	state.callbacks_ = parent?.callbacks_ ?? [];
	state.key_ = key;
	if (parent && key !== void 0) registerChildFinalizationCallback(parent, state, key);
	else state.callbacks_.push(function rootDraftCleanup(rootScope2) {
		rootScope2.mapSetPlugin_?.fixSetContents(state);
		const { patchPlugin_ } = rootScope2;
		if (state.modified_ && patchPlugin_) patchPlugin_.generatePatches_(state, [], rootScope2);
	});
	return draft;
}
function current(value) {
	if (!isDraft(value)) die(10, value);
	return currentImpl(value);
}
function currentImpl(value) {
	if (!isDraftable(value) || isFrozen(value)) return value;
	const state = value[DRAFT_STATE];
	let copy;
	let strict = true;
	if (state) {
		if (!state.modified_) return state.base_;
		state.finalized_ = true;
		copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
		strict = state.scope_.immer_.shouldUseStrictIteration();
	} else copy = shallowCopy(value, true);
	each(copy, (key, childValue) => {
		set(copy, key, currentImpl(childValue));
	}, strict);
	if (state) state.finalized_ = false;
	return copy;
}
function enablePatches() {
	const errorOffset = 16;
	errors.push("Sets cannot have \"replace\" patches.", function(op) {
		return "Unsupported patch operation: " + op;
	}, function(path) {
		return "Cannot apply patch, path doesn't resolve: " + path;
	}, "Patching reserved attributes like __proto__, prototype and constructor is not allowed");
	function getPath(state, path = []) {
		if (state.key_ !== void 0) {
			const parentCopy = state.parent_.copy_ ?? state.parent_.base_;
			const proxyDraft = getProxyDraft(get(parentCopy, state.key_));
			const valueAtKey = get(parentCopy, state.key_);
			if (valueAtKey === void 0) return null;
			if (valueAtKey !== state.draft_ && valueAtKey !== state.base_ && valueAtKey !== state.copy_) return null;
			if (proxyDraft != null && proxyDraft.base_ !== state.base_) return null;
			const isSet2 = state.parent_.type_ === 3;
			let key;
			if (isSet2) {
				const setParent = state.parent_;
				key = Array.from(setParent.drafts_.keys()).indexOf(state.key_);
			} else key = state.key_;
			if (!(isSet2 && parentCopy.size > key || has(parentCopy, key))) return null;
			path.push(key);
		}
		if (state.parent_) return getPath(state.parent_, path);
		path.reverse();
		try {
			resolvePath(state.copy_, path);
		} catch (e) {
			return null;
		}
		return path;
	}
	function resolvePath(base, path) {
		let current2 = base;
		for (let i = 0; i < path.length - 1; i++) {
			const key = path[i];
			current2 = get(current2, key);
			if (!isObjectish(current2) || current2 === null) throw new Error(`Cannot resolve path at '${path.join("/")}'`);
		}
		return current2;
	}
	const REPLACE = "replace";
	const ADD = "add";
	const REMOVE = "remove";
	function generatePatches_(state, basePath, scope) {
		if (state.scope_.processedForPatches_.has(state)) return;
		state.scope_.processedForPatches_.add(state);
		const { patches_, inversePatches_ } = scope;
		switch (state.type_) {
			case 0:
			case 2: return generatePatchesFromAssigned(state, basePath, patches_, inversePatches_);
			case 1: return generateArrayPatches(state, basePath, patches_, inversePatches_);
			case 3: return generateSetPatches(state, basePath, patches_, inversePatches_);
		}
	}
	function generateArrayPatches(state, basePath, patches, inversePatches) {
		let { base_, assigned_ } = state;
		let copy_ = state.copy_;
		if (copy_.length < base_.length) {
			[base_, copy_] = [copy_, base_];
			[patches, inversePatches] = [inversePatches, patches];
		}
		const allReassigned = state.allIndicesReassigned_ === true;
		for (let i = 0; i < base_.length; i++) {
			const copiedItem = copy_[i];
			const baseItem = base_[i];
			if ((allReassigned || assigned_?.get(i.toString())) && copiedItem !== baseItem) {
				const childState = copiedItem?.[DRAFT_STATE];
				if (childState && childState.modified_) continue;
				const path = basePath.concat([i]);
				patches.push({
					op: REPLACE,
					path,
					value: clonePatchValueIfNeeded(copiedItem)
				});
				inversePatches.push({
					op: REPLACE,
					path,
					value: clonePatchValueIfNeeded(baseItem)
				});
			}
		}
		for (let i = base_.length; i < copy_.length; i++) {
			const path = basePath.concat([i]);
			patches.push({
				op: ADD,
				path,
				value: clonePatchValueIfNeeded(copy_[i])
			});
		}
		for (let i = copy_.length - 1; base_.length <= i; --i) {
			const path = basePath.concat([i]);
			inversePatches.push({
				op: REMOVE,
				path
			});
		}
	}
	function generatePatchesFromAssigned(state, basePath, patches, inversePatches) {
		const { base_, copy_, type_ } = state;
		each(state.assigned_, (key, assignedValue) => {
			const origValue = get(base_, key, type_);
			const value = get(copy_, key, type_);
			const op = !assignedValue ? REMOVE : has(base_, key) ? REPLACE : ADD;
			if (origValue === value && op === REPLACE) return;
			const path = basePath.concat(key);
			patches.push(op === REMOVE ? {
				op,
				path
			} : {
				op,
				path,
				value: clonePatchValueIfNeeded(value)
			});
			inversePatches.push(op === ADD ? {
				op: REMOVE,
				path
			} : op === REMOVE ? {
				op: ADD,
				path,
				value: clonePatchValueIfNeeded(origValue)
			} : {
				op: REPLACE,
				path,
				value: clonePatchValueIfNeeded(origValue)
			});
		});
	}
	function generateSetPatches(state, basePath, patches, inversePatches) {
		let { base_, copy_ } = state;
		let i = 0;
		base_.forEach((value) => {
			if (!copy_.has(value)) {
				const path = basePath.concat([i]);
				patches.push({
					op: REMOVE,
					path,
					value
				});
				inversePatches.unshift({
					op: ADD,
					path,
					value
				});
			}
			i++;
		});
		i = 0;
		copy_.forEach((value) => {
			if (!base_.has(value)) {
				const path = basePath.concat([i]);
				patches.push({
					op: ADD,
					path,
					value
				});
				inversePatches.unshift({
					op: REMOVE,
					path,
					value
				});
			}
			i++;
		});
	}
	function generateReplacementPatches_(baseValue, replacement, scope) {
		const { patches_, inversePatches_ } = scope;
		patches_.push({
			op: REPLACE,
			path: [],
			value: replacement === NOTHING ? void 0 : replacement
		});
		inversePatches_.push({
			op: REPLACE,
			path: [],
			value: baseValue
		});
	}
	function applyPatches_(draft, patches) {
		patches.forEach((patch) => {
			const { path, op } = patch;
			let base = draft;
			for (let i = 0; i < path.length - 1; i++) {
				const parentType = getArchtype(base);
				let p = path[i];
				if (typeof p !== "string" && typeof p !== "number") p = "" + p;
				if ((parentType === 0 || parentType === 1) && (p === "__proto__" || p === CONSTRUCTOR)) die(19);
				if (isFunction(base) && p === PROTOTYPE) die(19);
				base = get(base, p);
				if (base === null || !isObjectish(base)) die(18, path.join("/"));
			}
			const type = getArchtype(base);
			const value = deepClonePatchValue(patch.value);
			const key = path[path.length - 1];
			switch (op) {
				case REPLACE: switch (type) {
					case 2: return base.set(key, value);
					case 3: die(errorOffset);
					default: return base[key] = value;
				}
				case ADD: switch (type) {
					case 1: return key === "-" ? base.push(value) : base.splice(key, 0, value);
					case 2: return base.set(key, value);
					case 3: return base.add(value);
					default: return base[key] = value;
				}
				case REMOVE: switch (type) {
					case 1: return base.splice(key, 1);
					case 2: return base.delete(key);
					case 3: return base.delete(patch.value);
					default: return delete base[key];
				}
				default: die(17, op);
			}
		});
		return draft;
	}
	function deepClonePatchValue(obj) {
		if (!isDraftable(obj)) return obj;
		if (isArray(obj)) return obj.map(deepClonePatchValue);
		if (isMap(obj)) return new Map(Array.from(obj.entries()).map(([k, v]) => [k, deepClonePatchValue(v)]));
		if (isSet(obj)) return new Set(Array.from(obj).map(deepClonePatchValue));
		const cloned = Object.create(getPrototypeOf(obj));
		for (const key in obj) cloned[key] = deepClonePatchValue(obj[key]);
		if (has(obj, DRAFTABLE)) cloned[DRAFTABLE] = obj[DRAFTABLE];
		return cloned;
	}
	function clonePatchValueIfNeeded(obj) {
		if (isDraft(obj)) return deepClonePatchValue(obj);
		else return obj;
	}
	loadPlugin(PluginPatches, {
		applyPatches_,
		generatePatches_,
		generateReplacementPatches_,
		getPath
	});
}
globalThis.Iterator?.from;
var immer = new Immer2();
var produce = immer.produce;
var produceWithPatches = /* @__PURE__ */ immer.produceWithPatches.bind(immer);
var applyPatches = /* @__PURE__ */ immer.applyPatches.bind(immer);
//#endregion
//#region src/utils/shared-state.ts
/**
* Upper bound on retained syncIds. Loop echoes arrive near-immediately, so a
* generous window preserves de-dup while capping memory on long-lived,
* frequently-mutated states (e.g. a 1s terminal poll).
*/
const MAX_SYNC_IDS = 1e3;
function rememberSyncId(syncIds, syncId) {
	syncIds.add(syncId);
	if (syncIds.size > MAX_SYNC_IDS) {
		const oldest = syncIds.values().next().value;
		if (oldest !== void 0) syncIds.delete(oldest);
	}
}
function createSharedState(options) {
	const { enablePatches: enablePatches$1 = false } = options;
	if (enablePatches$1) enablePatches();
	const events = createEventEmitter();
	let state = options.initialValue;
	const syncIds = /* @__PURE__ */ new Set();
	return {
		on: events.on,
		value: () => state,
		patch: (patches, syncId = nanoid()) => {
			if (syncIds.has(syncId)) return;
			enablePatches();
			state = applyPatches(state, patches);
			rememberSyncId(syncIds, syncId);
			events.emit("updated", state, void 0, syncId);
		},
		mutate: (fn, syncId = nanoid()) => {
			if (syncIds.has(syncId)) return;
			rememberSyncId(syncIds, syncId);
			if (enablePatches$1) {
				const [nextState, patches] = produceWithPatches(state, fn);
				if (nextState === state) return;
				state = nextState;
				events.emit("updated", state, patches, syncId);
			} else {
				const nextState = produce(state, fn);
				if (nextState === state) return;
				state = nextState;
				events.emit("updated", state, void 0, syncId);
			}
		},
		syncIds
	};
}

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

//#region src/in-page-channel/diagnostics.ts
const diagnostics = /* #__PURE__ */ defineDiagnostics$1({
	docsBase: "https://devfra.me/errors",
	codes: {
		DF0077: {
			why: (p) => `In-page channel function "${p.name}" is not registered on this endpoint.`,
			fix: "Declare the function in this endpoint's `functions` option."
		},
		DF0080: {
			why: (p) => `In-page channel function "${p.name}" has \`agent\` set but \`jsonSerializable\` is \`false\`; MCP requires JSON-serializable data.`,
			fix: "Remove `jsonSerializable: false`, or remove `agent` to keep it channel-only."
		}
	}
});
//#endregion
//#region src/in-page-channel/protocol.ts
/**
* Wire protocol of the in-page channel handshake and its port-level control
* frames. The envelope is transport-neutral by design: it identifies the
* protocol (`channel` tag + `v`), the user channel (`name`), and the peers
* (`panelId`, `instanceId`), so a future cross-tab transport (e.g. a
* `BroadcastChannel`) can reuse it unchanged.
*/
/** `postMessage` tag every handshake message carries. */
const IN_PAGE_CHANNEL_TAG = DEVFRAME_EVENTS.postMessage.inPageChannel;
function isControlFrame(data) {
	return !!data && typeof data === "object" && "__dfIpc" in data;
}
function isHandshakeMessage(data) {
	if (!data || typeof data !== "object") return false;
	const message = data;
	return message.channel === IN_PAGE_CHANNEL_TAG && typeof message.name === "string" && typeof message.panelId === "string" && (message.kind === "hello" || message.kind === "grant");
}
const INSTANCE_STORAGE_KEY = "devframe:in-page-channel:instance";
let memoryInstanceId;
/**
* The page context's instance id: one nanoid per browser tab, persisted in
* `sessionStorage` so it survives page-script reloads. It scopes handshakes
* when the same app is open in several tabs, since a panel pinned to an instance
* id ignores grants from every other tab's page script.
*/
function resolveInstanceId(win) {
	try {
		const storage = win?.sessionStorage;
		if (storage) {
			let id = storage.getItem(INSTANCE_STORAGE_KEY);
			if (!id) {
				id = nanoid();
				storage.setItem(INSTANCE_STORAGE_KEY, id);
			}
			return id;
		}
	} catch {}
	memoryInstanceId ??= nanoid();
	return memoryInstanceId;
}
/** Resolve the origins accepted during the handshake (default: same-origin). */
function resolveAllowedOrigins(allowedOrigins, win) {
	if (allowedOrigins?.length) return allowedOrigins;
	const origin = win?.location?.origin;
	return origin && origin !== "null" ? [origin] : ["*"];
}
const DEFAULT_HEARTBEAT = {
	intervalMs: 5e3,
	timeoutMs: 12e3
};
/** Resolve the heartbeat option against its defaults. */
function resolveHeartbeat(option) {
	return option === false ? void 0 : {
		...DEFAULT_HEARTBEAT,
		...option
	};
}
/** A coded in-page channel error; every failure mode carries a stable `code`. */
var InPageChannelError = class extends Error {
	code;
	name = "InPageChannelError";
	constructor(code, message, options) {
		super(message, options);
		this.code = code;
	}
};
const warned = /* @__PURE__ */ new Set();
/**
* `console.warn` once per distinct message, since handshake noise (foreign
* origins, version mismatches, missing targets) repeats on every retry tick.
*/
function warnOnce(message) {
	if (!warned.has(message)) {
		warned.add(message);
		console.warn(`[devframe] ${message}`);
	}
}
function jsonArrayViolation(value, path, seen) {
	for (let i = 0; i < value.length; i++) {
		const violation = jsonViolation(value[i], `${path}[${i}]`, seen);
		if (violation) return violation;
	}
}
function jsonObjectViolation(value, path, seen) {
	const proto = Object.getPrototypeOf(value);
	if (proto !== Object.prototype && proto !== null) return `${path} is an instance of ${value.constructor?.name ?? "an exotic class"}`;
	for (const [key, entry] of Object.entries(value)) {
		const violation = jsonViolation(entry, `${path}.${key}`, seen);
		if (violation) return violation;
	}
}
function jsonViolation(value, path, seen) {
	if (value === null || typeof value === "boolean" || typeof value === "string") return void 0;
	if (typeof value === "number") return Number.isFinite(value) ? void 0 : `${path} is ${value}`;
	if (typeof value !== "object") return `${path} is ${value === void 0 ? "`undefined`" : `a ${typeof value}`}`;
	if (seen.has(value)) return `${path} is circular`;
	seen.add(value);
	return Array.isArray(value) ? jsonArrayViolation(value, path, seen) : jsonObjectViolation(value, path, seen);
}
/**
* Enforce a `jsonSerializable: true` contract: throws code
* `not-serializable` naming the offending path when the value contains
* anything strict JSON can't represent, surfacing the bug at the offending
* call instead of a silent coercion later.
*/
function assertJsonSerializable(value, what, functionName) {
	const violation = jsonViolation(value, what, /* @__PURE__ */ new Set());
	if (violation) throw new InPageChannelError("not-serializable", `in-page function "${functionName}" is declared jsonSerializable, but ${violation}`);
}
function formatIssues(issues) {
	return issues.map((issue) => {
		const path = issue.path?.map((s) => typeof s === "object" ? s.key : s).join(".");
		return path ? `${path}: ${issue.message}` : issue.message;
	}).join("; ");
}
/**
* Validate positional arguments against their Standard Schemas (mirrors the
* RPC layer's `validateRpcArgs`): only indices with a schema are checked,
* values pass through unchanged, the first failure rejects with code
* `invalid-args`.
*/
async function validateArgs(name, schemas, args) {
	for (let index = 0; index < schemas.length; index++) {
		const schema = schemas[index];
		if (!schema) continue;
		const result = await schema["~standard"].validate(args[index]);
		if (result.issues) throw new InPageChannelError("invalid-args", `in-page function "${name}" rejected argument ${index}: ${formatIssues(result.issues)}`);
	}
}
function serializeArgs(codec, args) {
	return codec.serialize ? args.map(codec.serialize) : args;
}
function deserializeResult(codec, result) {
	return codec.deserialize && result !== void 0 ? codec.deserialize(result) : result;
}
function channelMethod(type, name) {
	return `devframe:in-page:${type === "event" ? "event" : "function"}:${name}`;
}
const FUNCTION_METHOD_PREFIX = channelMethod("function", "");
function createLocalFunctionRegistry(codec) {
	const definitions = /* @__PURE__ */ new Map();
	const listeners = /* @__PURE__ */ new Map();
	return {
		definitions,
		register(definition) {
			if ("agent" in definition && definition.agent) {
				if (definition.jsonSerializable === false) throw diagnostics.DF0080({ name: definition.name });
				definition.jsonSerializable = true;
			}
			definitions.set(channelMethod(definition.type, definition.name), definition);
		},
		registerInternal(method, handler) {
			definitions.set(method, {
				name: method,
				handler
			});
		},
		on(name, listener) {
			const key = channelMethod("event", name);
			let registered = listeners.get(key);
			if (!registered) {
				registered = /* @__PURE__ */ new Set();
				listeners.set(key, registered);
			}
			registered.add(listener);
			return () => {
				registered.delete(listener);
				if (registered.size === 0) listeners.delete(key);
			};
		},
		resolve(name) {
			const definition = definitions.get(name);
			const registered = listeners.get(name);
			if (!definition && !registered?.size) return void 0;
			return async (...rawArgs) => {
				const args = codec.deserialize ? rawArgs.map(codec.deserialize) : rawArgs;
				if (definition?.jsonSerializable) assertJsonSerializable(args, "its arguments", definition.name);
				if (definition?.args?.length) await validateArgs(definition.name, definition.args, args);
				const result = await definition?.handler?.(...args);
				for (const listener of [...listeners.get(name) ?? []]) listener(...args);
				if (definition?.type === "event") return void 0;
				if (definition?.jsonSerializable && result !== void 0) assertJsonSerializable(result, "its return value", definition.name);
				return codec.serialize && result !== void 0 ? codec.serialize(result) : result;
			};
		}
	};
}
/**
* Consult each registry in order and, only once none owns the name, fall back
* to the coded "not registered" error for a `function:` call (events stay
* silent). The fallback lives here, after every registry, so chaining a
* state registry ahead of the user registry never masks a real handler.
*/
function resolveLocalHandler(name, registries) {
	for (const registry of registries) {
		const handler = registry(name);
		if (handler) return handler;
	}
	if (name.startsWith(FUNCTION_METHOD_PREFIX)) return () => {
		throw diagnostics.DF0077({ name: name.slice(FUNCTION_METHOD_PREFIX.length) });
	};
}
/** Register an endpoint's local agent functions for browser-backed transports. */
function registerInPageAgentTools(channelName, registry) {
	const disposals = [];
	for (const definition of registry.definitions.values()) {
		if (definition.type === "event" || !("agent" in definition) || !definition.agent) continue;
		const agent = definition.agent;
		disposals.push(registerBrowserAgentTool({
			id: `${channelName}:${definition.name}`,
			title: agent.title ?? definition.name,
			description: agent.description,
			safety: resolveAgentSafety(definition.type, agent),
			tags: agent.tags,
			inputSchema: argsToJsonSchema(definition.args),
			invoke: (args) => {
				const positional = toolInputToRpcArgs(args, definition.args?.length);
				return registry.resolve(channelMethod(definition.type, definition.name))(...positional);
			}
		}));
	}
	return () => disposals.forEach((dispose) => dispose());
}
function wrapPostError(error) {
	if (error instanceof DOMException && error.name === "DataCloneError") return new InPageChannelError("not-cloneable", `a payload could not be structured-cloned across the in-page channel: ${error.message}. Strip non-cloneable values (functions, DOM nodes, framework reactivity proxies) before sending: declare the function \`jsonSerializable: true\` for a precise error, or provide a \`serialize\` hook.`, { cause: error });
	return error;
}
function attachChannelPort(port, options) {
	let birpcHandler;
	let disposed = false;
	const attached = {
		rpc: createBirpc({}, {
			post: (data) => {
				try {
					port.postMessage(data);
				} catch (error) {
					throw wrapPostError(error);
				}
			},
			on: (fn) => {
				birpcHandler = fn;
			},
			off: () => {
				birpcHandler = void 0;
			},
			/**
			* Deadlines live at the endpoint layer (`withCallDeadline`) with
			* status-aware errors; birpc's own timer stays off.
			*/
			timeout: -1,
			proxify: false,
			resolver: (name, resolved) => resolved ?? options.resolveLocal(name)
		}),
		lastActivity: Date.now(),
		postControl(kind) {
			try {
				port.postMessage({ __dfIpc: kind });
			} catch {}
		},
		dispose(disposeOptions) {
			if (disposed) return;
			disposed = true;
			if (disposeOptions?.bye) attached.postControl("bye");
			const error = new InPageChannelError("closed", `in-page channel call dropped: ${disposeOptions?.reason ?? "the in-page channel port was closed"}`);
			attached.rpc.$rejectPendingCalls(({ reject }) => reject(error));
			attached.rpc.$close();
			port.removeEventListener("message", onMessage);
			port.removeEventListener("close", onClose);
			try {
				port.close();
			} catch {}
		}
	};
	function onMessage(event) {
		attached.lastActivity = Date.now();
		const data = event.data;
		if (isControlFrame(data)) {
			if (data.__dfIpc === "bye") options.onPeerClosed();
			else options.onControl(data.__dfIpc);
			return;
		}
		birpcHandler?.(data);
	}
	function onClose() {
		options.onPeerClosed();
	}
	port.addEventListener("message", onMessage);
	port.addEventListener("close", onClose);
	port.start?.();
	return attached;
}
/**
* Race a call against its deadline, rejecting with a status-aware error
* (code `timeout`). `ms <= 0` disables the deadline.
*/
function withCallDeadline(promise, ms, describeTimeout) {
	if (ms <= 0) return promise;
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new InPageChannelError("timeout", describeTimeout())), ms);
		promise.then((value) => {
			clearTimeout(timer);
			resolve(value);
		}, (error) => {
			clearTimeout(timer);
			reject(error);
		});
	});
}
//#endregion
//#region src/in-page-channel/state.ts
/**
* The channel shared-state layer: `createSharedState` pumped over the
* in-page channel, mirroring the RPC shared-state wire design with the page
* script playing the server's role: it owns the canonical value, replays a
* snapshot to every (re)subscribing panel, and fans syncId-deduplicated
* updates out to the panels subscribed to each key.
*
* Request endpoints (panel → page script) are defined here at their
* handlers, like the RPC layer's `devframe:rpc:server-state:*`; the
* page-script → panel notifications live in `DEVFRAME_EVENTS.inPageChannel`.
*/
const IN_PAGE_STATE_RPC = {
	/** Subscribe to a key; returns the authority's current snapshot. */
	subscribe: "devframe:in-page:page-state:subscribe",
	/** Replace a key's value (panel mutation forwarded up). */
	set: "devframe:in-page:page-state:set",
	/** Patch a key's value (panel mutation forwarded up). */
	patch: "devframe:in-page:page-state:patch"
};
/** The page-script (authority) half of the channel shared-state layer. */
function createPageScriptStateHost(peers) {
	const states = /* @__PURE__ */ new Map();
	return {
		get: async (key, options) => {
			const existing = states.get(key);
			if (existing) return existing;
			if (options?.initialValue === void 0) throw new InPageChannelError("state-uninitialized", `in-page shared state "${key}" was accessed before initialization; the page script is the authority, so its first \`sharedState.get("${key}")\` must provide \`initialValue\``);
			const state = createSharedState({
				initialValue: options.initialValue,
				enablePatches: true
			});
			states.set(key, state);
			state.on("updated", (fullState, patches, syncId) => {
				for (const peer of peers()) {
					if (!peer.subscribedStates.has(key)) continue;
					if (patches) peer.callEventRaw(DEVFRAME_EVENTS.inPageChannel.panelStatePatch, [
						key,
						patches,
						syncId
					]);
					else peer.callEventRaw(DEVFRAME_EVENTS.inPageChannel.panelStateUpdated, [
						key,
						fullState,
						syncId
					]);
				}
			});
			return state;
		},
		createPeerHandlers(peer) {
			return {
				[IN_PAGE_STATE_RPC.subscribe]: (key) => {
					peer.subscribedStates.add(key);
					return states.get(key)?.value();
				},
				[IN_PAGE_STATE_RPC.set]: (key, fullState, syncId) => {
					const state = states.get(key);
					if (state && !state.syncIds.has(syncId)) state.mutate(() => fullState, syncId);
				},
				[IN_PAGE_STATE_RPC.patch]: (key, patches, syncId) => {
					states.get(key)?.patch(patches, syncId);
				}
			};
		}
	};
}
//#endregion
//#region src/in-page-channel/page-script.ts
/**
* Create the page-script endpoint of an in-page channel.
*
* It listens for panel hellos on the host page's window and answers each
* with a dedicated `MessageChannel` port (same-origin enforced both ways),
* keeping one live peer per panel: dock iframe, popup, and Document-PiP
* panels all handshake the same way, and a panel reload is simply a new
* handshake. No server is involved at any point.
*/
function createPageScriptChannel(options) {
	const { name } = options;
	const callTimeoutMs = options.callTimeoutMs ?? 15e3;
	const win = options.window === false ? void 0 : options.window ?? (typeof window === "undefined" ? void 0 : window);
	const allowedOrigins = resolveAllowedOrigins(options.allowedOrigins, win);
	const instanceId = resolveInstanceId(win);
	const heartbeat = resolveHeartbeat(options.heartbeat);
	const codec = {
		serialize: options.serialize,
		deserialize: options.deserialize
	};
	const events = createEventEmitter();
	const peers = /* @__PURE__ */ new Map();
	let closed = false;
	let heartbeatTimer;
	const registry = createLocalFunctionRegistry(codec);
	for (const [fnName, definition] of Object.entries(options.functions)) registry.register({
		...definition,
		name: fnName
	});
	for (const [eventName, definition] of Object.entries(options.events ?? {})) registry.register({
		...definition,
		name: eventName,
		type: "event"
	});
	const disposeAgentTools = registerInPageAgentTools(name, registry);
	const stateHost = createPageScriptStateHost(function* () {
		for (const peer of peers.values()) yield {
			subscribedStates: peer.subscribedStates,
			callEventRaw: (method, args) => {
				peer.attached.rpc.$callRaw({
					method,
					args: serializeArgs(codec, args),
					event: true,
					optional: true
				}).catch(() => {});
			}
		};
	});
	function removePeer(id, disposeOptions) {
		const peer = peers.get(id);
		if (!peer) return;
		peers.delete(id);
		peer.attached.dispose(disposeOptions);
		if (peers.size === 0 && heartbeatTimer) {
			clearInterval(heartbeatTimer);
			heartbeatTimer = void 0;
		}
		events.emit("panel:disconnected", peer.peer);
	}
	function addPeer(port, id) {
		removePeer(id, { reason: "the panel re-connected" });
		const internal = {
			id,
			subscribedStates: /* @__PURE__ */ new Set()
		};
		internal.internalHandlers = stateHost.createPeerHandlers({
			subscribedStates: internal.subscribedStates,
			callEventRaw: (method, args) => {
				internal.attached.rpc.$callRaw({
					method,
					args: serializeArgs(codec, args),
					event: true,
					optional: true
				}).catch(() => {});
			}
		});
		const stateRegistry = createLocalFunctionRegistry(codec);
		for (const [method, handler] of Object.entries(internal.internalHandlers)) stateRegistry.registerInternal(method, handler);
		internal.attached = attachChannelPort(port, {
			resolveLocal: (fnName) => resolveLocalHandler(fnName, [stateRegistry.resolve, registry.resolve]),
			onControl: (kind) => {
				if (kind === "ping") internal.attached.postControl("pong");
			},
			onPeerClosed: () => removePeer(id, { reason: "the panel disconnected" })
		});
		internal.peer = {
			id,
			call: (fnName, ...args) => withCallDeadline(internal.attached.rpc.$call(channelMethod("function", fnName), ...serializeArgs(codec, args)).then((result) => deserializeResult(codec, result)), callTimeoutMs, () => `in-page channel "${name}": call "${fnName}" to panel "${id}" timed out after ${callTimeoutMs}ms`),
			close: () => removePeer(id, {
				bye: true,
				reason: "the page script closed this panel"
			})
		};
		peers.set(id, internal);
		if (heartbeat && !heartbeatTimer) heartbeatTimer = setInterval(() => {
			const now = Date.now();
			for (const peer of [...peers.values()]) if (now - peer.attached.lastActivity > heartbeat.timeoutMs) removePeer(peer.id, { reason: "the panel went silent (heartbeat timeout)" });
		}, heartbeat.intervalMs);
		events.emit("panel:connected", internal.peer);
		return internal.peer;
	}
	const onWindowMessage = (event) => {
		if (closed) return;
		const data = event.data;
		if (!isHandshakeMessage(data) || data.kind !== "hello" || data.name !== name) return;
		if (data.v !== 2) {
			warnOnce(`in-page channel "${name}": ignoring a hello with protocol version ${data.v} (this side speaks 2); align the devframe versions of the page script and the panel`);
			return;
		}
		if (!allowedOrigins.includes("*") && !allowedOrigins.includes(event.origin)) {
			warnOnce(`in-page channel "${name}": ignoring a hello from disallowed origin "${event.origin}"`);
			return;
		}
		if (data.instanceId && data.instanceId !== instanceId) return;
		const source = event.source;
		if (!source || typeof source.postMessage !== "function") return;
		const messageChannel = new MessageChannel();
		addPeer(messageChannel.port1, data.panelId);
		const grant = {
			channel: IN_PAGE_CHANNEL_TAG,
			v: 2,
			kind: "grant",
			name,
			panelId: data.panelId,
			instanceId
		};
		try {
			source.postMessage(grant, allowedOrigins.includes("*") ? "*" : event.origin, [messageChannel.port2]);
		} catch (error) {
			console.warn(`[devframe] in-page channel "${name}": failed to grant a port`, error);
			removePeer(data.panelId, { reason: "the grant could not be delivered" });
		}
	};
	win?.addEventListener("message", onWindowMessage);
	const emit = (fnName, ...args) => {
		const wireArgs = serializeArgs(codec, args);
		for (const peer of peers.values()) peer.attached.rpc.$callRaw({
			method: channelMethod("event", fnName),
			args: wireArgs,
			event: true,
			optional: true
		}).catch(() => {});
	};
	return {
		name,
		instanceId,
		get panels() {
			return [...peers.values()].map((peer) => peer.peer);
		},
		events: {
			on: events.on,
			once: events.once
		},
		emit,
		on: (fnName, listener) => registry.on(fnName, listener),
		sharedState: stateHost,
		addPanelPort: (port) => addPeer(port, `transport:${nanoid(8)}`),
		close: () => {
			if (closed) return;
			closed = true;
			disposeAgentTools();
			win?.removeEventListener("message", onWindowMessage);
			for (const id of [...peers.keys()]) removePeer(id, {
				bye: true,
				reason: "the page script closed the channel"
			});
		}
	};
}

const UNHEAD_CHANNEL = "unhead:devtools";

const GLOBAL_FLAG = "__unhead_devtools_page_script__";
function extractSeoOverview(tags, title) {
  const seo = {
    title,
    description: "",
    canonical: "",
    robots: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: ""
  };
  for (const t of tags) {
    if (t.tag === "meta") {
      const name = t.props.name;
      const property = t.props.property;
      const content = t.props.content || "";
      if (name === "description")
        seo.description = content;
      else if (name === "robots")
        seo.robots = content;
      else if (property === "og:title")
        seo.ogTitle = content;
      else if (property === "og:description")
        seo.ogDescription = content;
      else if (property === "og:image")
        seo.ogImage = content;
    } else if (t.tag === "link" && t.props.rel === "canonical") {
      seo.canonical = t.props.href || "";
    }
  }
  return seo;
}
function safeSerialize(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (value === null)
    return null;
  if (value === void 0)
    return "\u2298 undefined";
  if (typeof value === "function")
    return `\u0192 ${value.name || "anonymous"}()`;
  if (typeof value === "symbol")
    return `Symbol(${value.description || ""})`;
  if (typeof value !== "object")
    return value;
  if (seen.has(value))
    return "\u2298 circular";
  seen.add(value);
  if (Array.isArray(value))
    return value.map((v) => safeSerialize(v, seen));
  const result = {};
  for (const key in value) {
    if (key === "__proto__" || key === "constructor" || key === "prototype")
      continue;
    result[key] = safeSerialize(value[key], seen);
  }
  return result;
}
function resolveEntryMode(entry, wasSSR, ssrSources, wasStreamed) {
  if (entry._devtoolsMode)
    return entry._devtoolsMode;
  if (entry._streamed)
    return "stream";
  if (wasStreamed && entry.options?._source)
    return "hydrated";
  if (!wasSSR)
    return "client";
  const source = entry.options?._source;
  if (source && ssrSources.has(source))
    return "hydrated";
  return "client";
}
function readSSRDevtoolsPayload() {
  const el = document.head.querySelector('script[id="unhead:devtools"]');
  if (!el?.innerHTML)
    return null;
  try {
    return JSON.parse(el.innerHTML);
  } catch {
    return null;
  }
}
function serializeHeadState(head, wasSSR = false, ssrPayload = null) {
  const entries = [];
  const allTags = [];
  const tagTypeCounts = {};
  const weightFn = head.resolvedOptions?._tagWeight || ((tag) => typeof tag.tagPriority === "number" ? tag.tagPriority : 100);
  const ssrSources = /* @__PURE__ */ new Set();
  if (ssrPayload?.entries) {
    for (const e of ssrPayload.entries) {
      if (e.source)
        ssrSources.add(e.source);
    }
  }
  let wasStreamed = false;
  if (head.entries) {
    for (const [, entry] of head.entries) {
      if (entry._streamed) {
        wasStreamed = true;
        break;
      }
    }
  }
  const clientEntryIds = /* @__PURE__ */ new Set();
  if (head.entries) {
    for (const [id, entry] of head.entries) {
      clientEntryIds.add(id);
      const tags = entry._tags || [];
      const mode = resolveEntryMode(entry, wasSSR, ssrSources, wasStreamed);
      entries.push({
        id,
        source: entry.options?._source,
        input: safeSerialize(entry.input || {}),
        tagCount: tags.length,
        mode
      });
      for (const tag of tags) {
        const tagName = tag.tag;
        tagTypeCounts[tagName] = (tagTypeCounts[tagName] || 0) + 1;
        const weight = tag._w ?? weightFn(tag);
        allTags.push({
          tag: tagName,
          // Props can hold non-cloneable values (event handlers); the channel uses structured clone.
          props: safeSerialize(tag.props || {}),
          innerHTML: tag.innerHTML,
          textContent: tag.textContent,
          position: tag.tagPosition,
          priority: weight,
          order: tag._p,
          dedupeKey: tag._d,
          source: tag._source || entry.options?._source,
          mode
        });
      }
    }
  }
  for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
    if (el.id === "unhead:devtools" || el.id === "unhead:payload")
      continue;
    const innerHTML = el.innerHTML;
    if (!innerHTML)
      continue;
    const dedupeKey = el.getAttribute("data-hid") || "";
    const matched = allTags.find(
      (t) => t.tag === "script" && t.props.type === "application/ld+json" && !t.innerHTML && (dedupeKey ? t.dedupeKey?.includes(dedupeKey) || t.props["data-hid"] === dedupeKey : true)
    );
    if (matched) {
      matched.innerHTML = innerHTML;
    } else {
      allTags.push({
        tag: "script",
        props: { type: "application/ld+json", ...dedupeKey ? { "data-hid": dedupeKey } : {} },
        innerHTML,
        mode: "client"
      });
      tagTypeCounts.script = (tagTypeCounts.script || 0) + 1;
    }
  }
  if (ssrPayload) {
    if (ssrPayload.entries) {
      for (const ssrEntry of ssrPayload.entries) {
        if (!clientEntryIds.has(ssrEntry.id)) {
          entries.push({
            id: ssrEntry.id,
            source: ssrEntry.source,
            input: ssrEntry.input || {},
            tagCount: ssrEntry.tagCount,
            mode: "server"
          });
        }
      }
    }
    if (ssrPayload.tags) {
      const tagFingerprint = (t) => t.dedupeKey || `${t.tag}:${JSON.stringify(t.props || {})}`;
      const clientTagKeys = new Set(allTags.map((t) => tagFingerprint(t)));
      for (const ssrTag of ssrPayload.tags) {
        if (clientTagKeys.has(tagFingerprint(ssrTag)))
          continue;
        const tagName = ssrTag.tag;
        tagTypeCounts[tagName] = (tagTypeCounts[tagName] || 0) + 1;
        allTags.push({
          tag: tagName,
          props: ssrTag.props || {},
          innerHTML: ssrTag.innerHTML,
          textContent: ssrTag.textContent,
          position: ssrTag.position,
          priority: ssrTag.priority,
          dedupeKey: ssrTag.dedupeKey,
          source: ssrTag.source,
          mode: "server"
        });
      }
    }
  }
  const plugins = [];
  if (head.plugins) {
    for (const [key] of head.plugins) {
      plugins.push(key);
    }
  }
  const scripts = [];
  if (head._scripts) {
    for (const [id, script] of Object.entries(head._scripts)) {
      const s = script;
      const src = s.src || s.input?.src || "";
      scripts.push({
        id,
        src,
        size: scriptSize(src),
        status: s.status || "unknown",
        warmupStrategy: s._warmupEl ? s._warmupStrategy || "preload" : void 0,
        events: s._events || [],
        fetchpriority: s.input?.fetchpriority,
        crossorigin: s.input?.crossorigin,
        defer: s.input?.defer,
        async: s.input?.async
      });
    }
  }
  let templateParams = null;
  if (head._templateParams) {
    try {
      templateParams = JSON.parse(JSON.stringify(head._templateParams));
    } catch {
    }
  }
  const title = head._title || document.title || "";
  const validationRules = (head._validationRules || []).map((r) => ({
    id: r.id,
    message: r.message,
    severity: r.severity,
    source: r.source,
    tagDedupeKey: r.tag?._d || r.tag?._h || void 0
  }));
  return {
    url: location.href,
    entries,
    tags: allTags.sort((a, b) => (a.priority ?? 100) === (b.priority ?? 100) ? (a.order ?? 0) - (b.order ?? 0) : (a.priority ?? 100) - (b.priority ?? 100)),
    plugins,
    title,
    scripts,
    seo: extractSeoOverview(allTags, title),
    titleTemplate: head._titleTemplate ? typeof head._titleTemplate === "function" ? String(head._titleTemplate) : head._titleTemplate : null,
    templateParams,
    separator: head._separator || "|",
    ssr: !!head.ssr,
    dirty: !!head.dirty,
    domElementCount: head._dom?._e?.size || 0,
    tagTypeCounts,
    validationRules
  };
}
function scriptSize(src) {
  if (!src || typeof performance === "undefined")
    return;
  let url;
  try {
    url = new URL(src, location.href).href;
  } catch {
    return;
  }
  const entry = performance.getEntriesByName(url).at(-1);
  return entry?.encodedBodySize || void 0;
}
function detectSSR() {
  const headEl = document.head;
  return !!(headEl.querySelector('meta[name="description"]') || headEl.querySelector("meta[property]") || headEl.querySelector('link[rel="canonical"]') || headEl.querySelector('script[id="unhead:payload"]'));
}
function connectBridge(head) {
  const wasSSR = detectSSR();
  const ssrPayload = readSSRDevtoolsPayload();
  const channel = createPageScriptChannel({ name: UNHEAD_CHANNEL, functions: {} });
  channel.sharedState.get("state", { initialValue: serializeHeadState(head, wasSSR, ssrPayload) }).then((sharedState) => {
    function syncToSharedState() {
      const newState = serializeHeadState(head, wasSSR, ssrPayload);
      sharedState.mutate((draft) => {
        Object.assign(draft, newState);
      });
    }
    if (head.hooks)
      head.hooks.hook("dom:rendered", syncToSharedState);
    setTimeout(syncToSharedState, 500);
  }).catch((err) => {
    console.error("[unhead devtools] page script init failed:", err);
  });
}
function findHead() {
  if (window.__unhead__?._head)
    return window.__unhead__._head;
  if (window.__unhead_devtools__)
    return window.__unhead_devtools__;
  return null;
}
function pollForHead() {
  let attempts = 0;
  const handle = globalThis.setInterval(() => {
    const h = findHead();
    if (h) {
      globalThis.clearInterval(handle);
      connectBridge(h);
    }
    if (++attempts > 50) {
      globalThis.clearInterval(handle);
      console.warn("[unhead bridge] gave up polling for head after 50 attempts");
    }
  }, 100);
}
function setupUnheadPageScript() {
  if (typeof window === "undefined" || window[GLOBAL_FLAG])
    return;
  window[GLOBAL_FLAG] = true;
  const head = findHead();
  if (head)
    connectBridge(head);
  else
    pollForHead();
}

export { setupUnheadPageScript as default };
