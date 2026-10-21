import { i as hash, n as validateDefinitions, r as ensureAgentJsonSerializable, t as validateDefinition } from "../validation-CMfDAti3.mjs";
import { n as strictJsonStringify, r as diagnostics, t as STRUCTURED_CLONE_PREFIX } from "../serialization-BhuOoL80.mjs";
import { i as validateRpcReturn, n as getRpcResolvedSetupResult, r as validateRpcArgs, t as getRpcHandler } from "../handler-DmaAfpGq.mjs";
import { n as defineRpcFunction, t as createDefineWrapperWithContext } from "../define-BLWPsH6y.mjs";
//#region src/rpc/cache.ts
/**
* @experimental API is expected to change.
*/
var RpcCacheManager = class {
	cacheMap = /* @__PURE__ */ new Map();
	options;
	keySerializer;
	constructor(options) {
		this.options = options;
		this.keySerializer = options.keySerializer || ((args) => hash(args));
	}
	updateOptions(options) {
		this.options = {
			...this.options,
			...options
		};
	}
	cached(m, a) {
		const methodCache = this.cacheMap.get(m);
		if (methodCache) return methodCache.get(this.keySerializer(a));
	}
	has(m, a) {
		return this.cacheMap.get(m)?.has(this.keySerializer(a)) ?? false;
	}
	apply(req, res) {
		const methodCache = this.cacheMap.get(req.m) || /* @__PURE__ */ new Map();
		methodCache.set(this.keySerializer(req.a), res);
		this.cacheMap.set(req.m, methodCache);
	}
	validate(m) {
		return this.options.functions.includes(m);
	}
	clear(fn) {
		if (fn) this.cacheMap.delete(fn);
		else this.cacheMap.clear();
	}
};
//#endregion
//#region src/rpc/collector.ts
var RpcFunctionsCollectorBase = class {
	context;
	definitions = /* @__PURE__ */ new Map();
	functions;
	_onChanged = [];
	constructor(context) {
		this.context = context;
		const definitions = this.definitions;
		const self = this;
		this.functions = new Proxy({}, {
			get(_, prop) {
				const definition = definitions.get(prop);
				if (!definition) return void 0;
				return getRpcHandler(definition, self.context);
			},
			has(_, prop) {
				return definitions.has(prop);
			},
			getOwnPropertyDescriptor(_, prop) {
				return {
					value: definitions.get(prop)?.handler,
					configurable: true,
					enumerable: true
				};
			},
			ownKeys() {
				return Array.from(definitions.keys());
			}
		});
	}
	register(fnDef, force = false) {
		if (this.definitions.has(fnDef.name) && !force) throw diagnostics.DF0021({ name: fnDef.name });
		ensureAgentJsonSerializable(fnDef);
		this.definitions.set(fnDef.name, fnDef);
		this._onChanged.forEach((cb) => cb(fnDef.name));
	}
	update(fn, force = false) {
		if (!this.definitions.has(fn.name) && !force) throw diagnostics.DF0022({ name: fn.name });
		ensureAgentJsonSerializable(fn);
		this.definitions.set(fn.name, fn);
		this._onChanged.forEach((cb) => cb(fn.name));
	}
	onChanged(fn) {
		this._onChanged.push(fn);
		return () => {
			const index = this._onChanged.indexOf(fn);
			if (index !== -1) this._onChanged.splice(index, 1);
		};
	}
	async getHandler(name) {
		return await getRpcHandler(this.definitions.get(name), this.context);
	}
	getSchema(name) {
		const definition = this.definitions.get(name);
		if (!definition) throw diagnostics.DF0023({ name: String(name) });
		return {
			args: definition.args,
			returns: definition.returns
		};
	}
	has(name) {
		return this.definitions.has(name);
	}
	get(name) {
		return this.definitions.get(name);
	}
	list() {
		return Array.from(this.definitions.keys());
	}
};
//#endregion
export { RpcCacheManager, RpcFunctionsCollectorBase, STRUCTURED_CLONE_PREFIX, createDefineWrapperWithContext, defineRpcFunction, getRpcHandler, getRpcResolvedSetupResult, strictJsonStringify, validateDefinition, validateDefinitions, validateRpcArgs, validateRpcReturn };
