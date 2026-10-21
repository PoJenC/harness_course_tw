const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./browser-agent-rpc-BXhoSh1z-DpDtaiol.js","./nanoid-Chf5f3yj.js"])))=>i.map(i=>d[i]);
import { $ as shallowRef, C as onMounted, F as watch, G as isRef, H as effectScope, I as watchEffect, J as reactive, K as markRaw, Q as shallowReadonly, U as getCurrentScope$1, V as customRef, W as isReactive, X as ref, Y as readonly, et as toRaw, h as getCurrentInstance, it as unref, nt as toRefs, o as computed, q as onScopeDispose, rt as toValue, tt as toRef$1, v as hasInjectionContext, x as nextTick, y as inject } from "./runtime-core.esm-bundler-BdgYK4NT.js";
import { t as nanoid$1 } from "./nanoid-Chf5f3yj.js";
//#region node_modules/.pnpm/pinia@4.0.3_@vue+devtools-api@8.2.1_typescript@6.0.3_vue@3.5.43_typescript@6.0.3_/node_modules/pinia/dist/pinia.js
/*!
* pinia v4.0.3
* (c) 2026 Eduardo San Martin Morote
* @license MIT
*/
var IS_CLIENT = typeof window !== "undefined";
/**
* setActivePinia must be called to handle SSR at the top of functions like
* `fetch`, `setup`, `serverPrefetch` and others
*/
var activePinia;
/**
* Sets or unsets the active pinia. Used in SSR and internally when calling
* actions and getters
*
* @param pinia - Pinia instance
*/
var setActivePinia = (pinia) => activePinia = pinia;
/**
* Symbol used to provide/inject the pinia instance in the app. Used internally
* and exposed for testing purposes and edge cases like storybook. Could break
* in a minor, **USE AT YOUR OWN RISK**.
*
* For context, see:
* - https://github.com/vuejs/pinia/issues/870
* - https://github.com/vuejs/pinia/pull/2973
*
* @internal
*/
var piniaSymbol = Symbol();
function isPlainObject$1(o) {
	return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
}
var _global$1 = /*#__PURE__*/ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
function bom(blob, { autoBom = false } = {}) {
	if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
	return blob;
}
function download(url, name, opts) {
	const xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	xhr.responseType = "blob";
	xhr.onload = function() {
		saveAs(xhr.response, name, opts);
	};
	xhr.onerror = function() {
		console.error("could not download file");
	};
	xhr.send();
}
function corsEnabled(url) {
	const xhr = new XMLHttpRequest();
	xhr.open("HEAD", url, false);
	try {
		xhr.send();
	} catch (e) {}
	return xhr.status >= 200 && xhr.status <= 299;
}
function click(node) {
	try {
		node.dispatchEvent(new MouseEvent("click"));
	} catch (e) {
		const evt = new MouseEvent("click", {
			bubbles: true,
			cancelable: true,
			view: window,
			detail: 0,
			screenX: 80,
			screenY: 20,
			clientX: 80,
			clientY: 20,
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			metaKey: false,
			button: 0,
			relatedTarget: null
		});
		node.dispatchEvent(evt);
	}
}
var _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
var isMacOSWebView = /*#__PURE__*/ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
var saveAs = !IS_CLIENT ? () => {} : typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : "msSaveOrOpenBlob" in _navigator ? msSaveAs : fileSaverSaveAs;
function downloadSaveAs(blob, name = "download", opts) {
	const a = document.createElement("a");
	a.download = name;
	a.rel = "noopener";
	if (typeof blob === "string") {
		a.href = blob;
		if (a.origin !== location.origin) if (corsEnabled(a.href)) download(blob, name, opts);
		else {
			a.target = "_blank";
			click(a);
		}
		else click(a);
	} else {
		a.href = URL.createObjectURL(blob);
		setTimeout(function() {
			URL.revokeObjectURL(a.href);
		}, 4e4);
		setTimeout(function() {
			click(a);
		}, 0);
	}
}
function msSaveAs(blob, name = "download", opts) {
	if (typeof blob === "string") if (corsEnabled(blob)) download(blob, name, opts);
	else {
		const a = document.createElement("a");
		a.href = blob;
		a.target = "_blank";
		setTimeout(function() {
			click(a);
		});
	}
	else navigator.msSaveOrOpenBlob(bom(blob, opts), name);
}
function fileSaverSaveAs(blob, name, opts, popup) {
	popup = popup || open("", "_blank");
	if (popup) popup.document.title = popup.document.body.innerText = "downloading...";
	if (typeof blob === "string") return download(blob, name, opts);
	const force = blob.type === "application/octet-stream";
	const isSafari = /constructor/i.test(String(_global$1.HTMLElement)) || "safari" in _global$1;
	const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
	if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
		const reader = new FileReader();
		reader.onloadend = function() {
			let url = reader.result;
			if (typeof url !== "string") {
				popup = null;
				throw new Error("Wrong reader.result type");
			}
			url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
			if (popup) popup.location.href = url;
			else location.assign(url);
			popup = null;
		};
		reader.readAsDataURL(blob);
	} else {
		const url = URL.createObjectURL(blob);
		if (popup) popup.location.assign(url);
		else location.href = url;
		popup = null;
		setTimeout(function() {
			URL.revokeObjectURL(url);
		}, 4e4);
	}
}
var { assign: assign$1 } = Object;
/**
* Creates a Pinia instance to be used by the application
*/
function createPinia() {
	const scope = effectScope(true);
	const state = scope.run(() => ref({}));
	let _p = [];
	let toBeInstalled = [];
	const pinia = markRaw({
		install(app) {
			setActivePinia(pinia);
			pinia._a = app;
			app.provide(piniaSymbol, pinia);
			app.config.globalProperties.$pinia = pinia;
			toBeInstalled.forEach((plugin) => _p.push(plugin));
			toBeInstalled = [];
		},
		use(plugin) {
			if (!this._a) toBeInstalled.push(plugin);
			else _p.push(plugin);
			return this;
		},
		_p,
		_a: null,
		_e: scope,
		_s: /* @__PURE__ */ new Map(),
		state
	});
	return pinia;
}
var noop$1 = () => {};
function addSubscription(subscriptions, callback, detached, onCleanup = noop$1) {
	subscriptions.add(callback);
	const removeSubscription = () => {
		subscriptions.delete(callback) && onCleanup();
	};
	if (!detached && getCurrentScope$1()) onScopeDispose(removeSubscription);
	return removeSubscription;
}
function triggerSubscriptions(subscriptions, ...args) {
	subscriptions.forEach((callback) => {
		callback(...args);
	});
}
var fallbackRunWithContext = (fn) => fn();
/**
* Marks a function as an action for `$onAction`
* @internal
*/
var ACTION_MARKER = Symbol();
/**
* Action name symbol. Allows to add a name to an action after defining it
* @internal
*/
var ACTION_NAME = Symbol();
function mergeReactiveObjects(target, patchToApply) {
	if (target instanceof Map && patchToApply instanceof Map) patchToApply.forEach((value, key) => target.set(key, value));
	else if (target instanceof Set && patchToApply instanceof Set) patchToApply.forEach(target.add, target);
	for (const key in patchToApply) {
		if (!Object.hasOwn(patchToApply, key)) continue;
		const subPatch = patchToApply[key];
		const targetValue = target[key];
		if (isPlainObject$1(targetValue) && isPlainObject$1(subPatch) && Object.hasOwn(target, key) && !isRef(subPatch) && !isReactive(subPatch)) target[key] = mergeReactiveObjects(targetValue, subPatch);
		else target[key] = subPatch;
	}
	return target;
}
var skipHydrateSymbol = Symbol();
/**
* Returns whether a value should be hydrated
*
* @param obj - target variable
* @returns true if `obj` should be hydrated
*/
function shouldHydrate(obj) {
	return !obj || typeof obj !== "object" || !Object.hasOwn(obj, skipHydrateSymbol);
}
var { assign } = Object;
function isComputed(o) {
	return !!(isRef(o) && o.effect);
}
function createOptionsStore(id, options, pinia, hot) {
	const { state, actions, getters } = options;
	const initialState = pinia.state.value[id];
	let store;
	function setup() {
		if (!initialState && true)
 /* istanbul ignore if */
		pinia.state.value[id] = state ? state() : {};
		return assign(toRefs(pinia.state.value[id]), actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
			computedGetters[name] = markRaw(computed(() => {
				setActivePinia(pinia);
				const store = pinia._s.get(id);
				return getters[name].call(store, store);
			}));
			return computedGetters;
		}, {}));
	}
	store = createSetupStore(id, setup, options, pinia, hot, true);
	return store;
}
function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
	let scope;
	const optionsForPlugin = assign({ actions: {} }, options);
	const $subscribeOptions = { deep: true };
	let isListening;
	let isSyncListening;
	let subscriptions = /* @__PURE__ */ new Set();
	let actionSubscriptions = /* @__PURE__ */ new Set();
	let debuggerEvents;
	const initialState = pinia.state.value[$id];
	if (!isOptionsStore && !initialState && true)
 /* istanbul ignore if */
	pinia.state.value[$id] = {};
	let activeListener;
	function $patch(partialStateOrMutator) {
		let subscriptionMutation;
		isListening = isSyncListening = false;
		if (typeof partialStateOrMutator === "function") {
			partialStateOrMutator(pinia.state.value[$id]);
			subscriptionMutation = {
				type: "patch function",
				storeId: $id,
				events: debuggerEvents
			};
		} else {
			mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
			subscriptionMutation = {
				type: "patch object",
				payload: partialStateOrMutator,
				storeId: $id,
				events: debuggerEvents
			};
		}
		const myListenerId = activeListener = Symbol();
		nextTick().then(() => {
			if (activeListener === myListenerId) isListening = true;
		});
		isSyncListening = true;
		triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
	}
	const $reset = isOptionsStore ? function $reset() {
		const { state } = options;
		const newState = state ? state() : {};
		this.$patch(($state) => {
			assign($state, newState);
		});
	} : noop$1;
	function $dispose() {
		scope.stop();
		subscriptions.clear();
		actionSubscriptions.clear();
		pinia._s.delete($id);
	}
	/**
	* Helper that wraps function so it can be tracked with $onAction
	* @param fn - action to wrap
	* @param name - name of the action
	*/
	const action = (fn, name = "") => {
		if (ACTION_MARKER in fn) {
			fn[ACTION_NAME] = name;
			return fn;
		}
		const wrappedAction = function() {
			setActivePinia(pinia);
			const args = Array.from(arguments);
			const afterCallbackSet = /* @__PURE__ */ new Set();
			const onErrorCallbackSet = /* @__PURE__ */ new Set();
			function after(callback) {
				afterCallbackSet.add(callback);
			}
			function onError(callback) {
				onErrorCallbackSet.add(callback);
			}
			triggerSubscriptions(actionSubscriptions, {
				args,
				name: wrappedAction[ACTION_NAME],
				store,
				after,
				onError
			});
			let ret;
			try {
				ret = fn.apply(this && this.$id === $id ? this : store, args);
			} catch (error) {
				triggerSubscriptions(onErrorCallbackSet, error);
				throw error;
			}
			if (ret instanceof Promise) return ret.then((value) => {
				triggerSubscriptions(afterCallbackSet, value);
				return value;
			}).catch((error) => {
				triggerSubscriptions(onErrorCallbackSet, error);
				return Promise.reject(error);
			});
			triggerSubscriptions(afterCallbackSet, ret);
			return ret;
		};
		wrappedAction[ACTION_MARKER] = true;
		wrappedAction[ACTION_NAME] = name;
		return wrappedAction;
	};
	const partialStore = {
		_p: pinia,
		$id,
		$onAction: addSubscription.bind(null, actionSubscriptions),
		$patch,
		$reset,
		$subscribe(callback, options = {}) {
			if (subscriptions.has(callback)) return noop$1;
			const removeSubscription = addSubscription(subscriptions, callback, options.detached, () => stopWatcher());
			const stopWatcher = scope.run(() => watch(() => pinia.state.value[$id], (state) => {
				if (options.flush === "sync" ? isSyncListening : isListening) callback({
					storeId: $id,
					type: "direct",
					events: debuggerEvents
				}, state);
			}, assign({}, $subscribeOptions, options)));
			return removeSubscription;
		},
		$dispose
	};
	const store = reactive(partialStore);
	pinia._s.set($id, store);
	const setupStore = (pinia._a && pinia._a.runWithContext || fallbackRunWithContext)(() => pinia._e.run(() => (scope = effectScope()).run(() => setup({ action }))));
	for (const key in setupStore) {
		const prop = setupStore[key];
		if (isRef(prop) && !isComputed(prop) || isReactive(prop)) {
			if (!isOptionsStore) {
				if (initialState && shouldHydrate(prop)) if (isRef(prop)) prop.value = initialState[key];
				else {
					if (prop instanceof Set || prop instanceof Map) prop.clear();
					mergeReactiveObjects(prop, initialState[key]);
				}
				pinia.state.value[$id][key] = prop;
			}
		} else if (typeof prop === "function") {
			setupStore[key] = action(prop, key);
			optionsForPlugin.actions[key] = prop;
		}
	}
	/* istanbul ignore if */
	assign(store, setupStore);
	assign(toRaw(store), setupStore);
	Object.defineProperty(store, "$state", {
		get: () => pinia.state.value[$id],
		set: (state) => {
			$patch(($state) => {
				assign($state, state);
			});
		}
	});
	pinia._p.forEach((extender) => {
		const extensions = scope.run(() => extender({
			store,
			app: pinia._a,
			pinia,
			options: optionsForPlugin
		}));
		assign(store, extensions);
	});
	if (initialState && isOptionsStore && options.hydrate) options.hydrate(store.$state, initialState);
	isListening = true;
	isSyncListening = true;
	return store;
}
/*! #__NO_SIDE_EFFECTS__ */
function defineStore(id, setup, setupOptions) {
	let options;
	const isSetupStore = typeof setup === "function";
	options = isSetupStore ? setupOptions : setup;
	function useStore(pinia, hot) {
		const hasContext = hasInjectionContext();
		pinia = pinia || (hasContext ? inject(piniaSymbol, null) : null);
		if (pinia) setActivePinia(pinia);
		pinia = activePinia;
		if (!pinia._s.has(id)) {
			if (isSetupStore) createSetupStore(id, setup, options, pinia);
			else createOptionsStore(id, options, pinia);
		}
		return pinia._s.get(id);
	}
	useStore.$id = id;
	return useStore;
}
//#endregion
//#region node_modules/.pnpm/nostics@1.3.0/node_modules/nostics/dist/index.mjs
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
var captureStackTrace = Error.captureStackTrace;
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
//#endregion
//#region \0vite/preload-helper.js
var scriptRel = "modulepreload";
var assetsURL = function(dep, importerUrl) {
	return new URL(dep, importerUrl).href;
};
var seen = {};
var isCssPreloadUrl = function isCssPreloadUrl(url) {
	return url.pathname.endsWith(".css");
};
var preloadOnce = function preloadOnce(seen, href, preload) {
	if (href in seen) return seen[href];
	const promise = preload();
	if (!promise) {
		seen[href] = void 0;
		return;
	}
	const preloadPromise = promise.then(() => {
		seen[href] = void 0;
	}, (err) => {
		seen[href] = void 0;
		throw err;
	});
	seen[href] = preloadPromise;
	return preloadPromise;
};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		let preloadedHrefs;
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		function importMetaResolve(specifier) {
			if (import.meta.resolve) return new URL(import.meta.resolve(specifier));
			return new URL(
				specifier,
				/** #__KEEP__ */
				import.meta.url
			);
		}
		promise = allSettled(deps.map((depString) => {
			depString = assetsURL(depString, importerUrl);
			const dep = importMetaResolve(depString);
			const isCss = isCssPreloadUrl(dep);
			return preloadOnce(seen, dep.href, () => {
				if (preloadedHrefs === void 0) {
					preloadedHrefs = {
						all: /* @__PURE__ */ new Set(),
						styles: /* @__PURE__ */ new Set()
					};
					const links = document.getElementsByTagName("link");
					for (let i = links.length - 1; i >= 0; i--) {
						const link = links[i];
						preloadedHrefs.all.add(link.href);
						if (link.rel === "stylesheet") preloadedHrefs.styles.add(link.href);
					}
				}
				if ((isCss ? preloadedHrefs.styles : preloadedHrefs.all).has(dep.href)) return;
				const link = document.createElement("link");
				link.rel = isCss ? "stylesheet" : scriptRel;
				if (!isCss) link.as = "script";
				link.crossOrigin = "";
				link.href = dep.href;
				if (cspNonce) link.setAttribute("nonce", cspNonce);
				document.head.appendChild(link);
				if (isCss) return new Promise((res, rej) => {
					link.addEventListener("load", res);
					link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
				});
			});
		}).filter((p) => p !== void 0));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
//#endregion
//#region node_modules/.pnpm/@vueuse+shared@15.0.0_vue@3.5.43_typescript@6.0.3_/node_modules/@vueuse/shared/dist/index.js
/**
* Call onScopeDispose() if it's inside an effect scope lifecycle, if not, do nothing
*
* @param fn
*/
function tryOnScopeDispose(fn, failSilently) {
	if (getCurrentScope$1()) {
		onScopeDispose(fn, failSilently);
		return true;
	}
	return false;
}
/**
* Utility for creating event hooks
*
* @see https://vueuse.org/createEventHook
*
* @__NO_SIDE_EFFECTS__
*/
function createEventHook() {
	const fns = /* @__PURE__ */ new Set();
	const off = (fn) => {
		fns.delete(fn);
	};
	const clear = () => {
		fns.clear();
	};
	const on = (fn) => {
		fns.add(fn);
		const offFn = () => off(fn);
		tryOnScopeDispose(offFn);
		return { off: offFn };
	};
	const trigger = (...args) => {
		return Promise.all(Array.from(fns).map((fn) => fn(...args)));
	};
	return {
		on,
		off,
		trigger,
		clear
	};
}
var localProvidedStateMap = /* @__PURE__ */ new WeakMap();
/**
* On the basis of `inject`, it is allowed to directly call inject to obtain the value after call provide in the same component.
*
* @example
* ```ts
* injectLocal('MyInjectionKey', 1)
* const injectedValue = injectLocal('MyInjectionKey') // injectedValue === 1
* ```
*
* @NO_SIDE_EFFECTS
*/
var injectLocal = /* @__NO_SIDE_EFFECTS__ */ (...args) => {
	var _getCurrentInstance;
	const key = args[0];
	const instance = (_getCurrentInstance = getCurrentInstance()) === null || _getCurrentInstance === void 0 ? void 0 : _getCurrentInstance.proxy;
	const owner = instance !== null && instance !== void 0 ? instance : getCurrentScope$1();
	if (owner == null && !hasInjectionContext()) throw new Error("injectLocal must be called in setup");
	if (owner && localProvidedStateMap.has(owner) && key in localProvidedStateMap.get(owner)) return localProvidedStateMap.get(owner)[key];
	return inject(...args);
};
var isClient = typeof window !== "undefined" && typeof document !== "undefined";
typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
var toString$1 = Object.prototype.toString;
var isObject = (val) => toString$1.call(val) === "[object Object]";
var noop = () => {};
function toRef(...args) {
	if (args.length !== 1) return toRef$1(...args);
	const r = args[0];
	return typeof r === "function" ? readonly(customRef(() => ({
		get: r,
		set: noop
	}))) : ref(r);
}
function createFilterWrapper(filter, fn) {
	function wrapper(...args) {
		return new Promise((resolve, reject) => {
			Promise.resolve(filter(() => fn.apply(this, args), {
				fn,
				thisArg: this,
				args
			})).then(resolve).catch(reject);
		});
	}
	if ("cancel" in filter) Object.assign(wrapper, {
		cancel: filter.cancel,
		flush: filter.flush,
		isPending: filter.isPending
	});
	return wrapper;
}
var bypassFilter = (invoke) => {
	return invoke();
};
/**
* EventFilter that gives extra controls to pause and resume the filter
*
* @param extendFilter  Extra filter to apply when the PausableFilter is active, default to none
* @param options Options to configure the filter
*/
function pausableFilter(extendFilter = bypassFilter, options = {}) {
	const { initialState = "active" } = options;
	const isActive = toRef(initialState === "active");
	function pause() {
		isActive.value = false;
	}
	function resume() {
		isActive.value = true;
	}
	const eventFilter = (...args) => {
		if (isActive.value) extendFilter(...args);
	};
	return {
		isActive: shallowReadonly(isActive),
		pause,
		resume,
		eventFilter
	};
}
/**
* Get a px value for SSR use, do not rely on this method outside of SSR as REM unit is assumed at 16px, which might not be the case on the client
*/
function pxValue(px) {
	return px.endsWith("rem") ? Number.parseFloat(px) * 16 : Number.parseFloat(px);
}
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
function getLifeCycleTarget(target) {
	return target || getCurrentInstance();
}
function watchWithFilter(source, cb, options = {}) {
	const { eventFilter = bypassFilter, ...watchOptions } = options;
	return watch(source, createFilterWrapper(eventFilter, cb), watchOptions);
}
/** @deprecated Use Vue's built-in `watch` instead. This function will be removed in future version. */
function watchPausable(source, cb, options = {}) {
	const { eventFilter: filter, initialState = "active", ...watchOptions } = options;
	const { eventFilter, pause, resume, isActive } = pausableFilter(filter, { initialState });
	return {
		stop: watchWithFilter(source, cb, {
			...watchOptions,
			eventFilter
		}),
		pause,
		resume,
		isActive
	};
}
/**
* Call onMounted() if it's inside a component lifecycle, if not, just call the function
*
* @param fn
* @param sync if set to false, it will run in the nextTick() of Vue
* @param target
*/
function tryOnMounted(fn, sync = true, target) {
	if (getLifeCycleTarget(target)) onMounted(fn, target);
	else if (sync) fn();
	else nextTick(fn);
}
/**
* A boolean ref with a toggler
*
* @see https://vueuse.org/useToggle
* @param [initialValue]
* @param options
*
* @__NO_SIDE_EFFECTS__
*/
function useToggle(initialValue = false, options = {}) {
	const { truthyValue = true, falsyValue = false } = options;
	const valueIsRef = isRef(initialValue);
	const _value = shallowRef(initialValue);
	function toggle(value) {
		if (arguments.length) {
			_value.value = value;
			return _value.value;
		} else {
			const truthy = toValue(truthyValue);
			_value.value = _value.value === truthy ? toValue(falsyValue) : truthy;
			return _value.value;
		}
	}
	if (valueIsRef) return toggle;
	else return [_value, toggle];
}
/**
* Shorthand for watching value with {immediate: true}
*
* @see https://vueuse.org/watchImmediate
*/
function watchImmediate(source, cb, options) {
	return watch(source, cb, {
		...options,
		immediate: true
	});
}
//#endregion
//#region node_modules/.pnpm/@vueuse+core@15.0.0_vue@3.5.43_typescript@6.0.3_/node_modules/@vueuse/core/dist/index.js
var defaultWindow = isClient ? window : void 0;
isClient && window.document;
isClient && window.navigator;
isClient && window.location;
/**
* Get the dom element of a ref of element or Vue component instance
*
* @param elRef
*/
function unrefElement(elRef) {
	var _$el;
	const plain = toValue(elRef);
	return (_$el = plain === null || plain === void 0 ? void 0 : plain.$el) !== null && _$el !== void 0 ? _$el : plain;
}
function useEventListener(...args) {
	const register = (el, event, listener, options) => {
		el.addEventListener(event, listener, options);
		return () => el.removeEventListener(event, listener, options);
	};
	const firstParamTargets = computed(() => {
		const test = toArray(toValue(args[0])).filter((e) => e != null);
		return test.every((e) => typeof e !== "string") ? test : void 0;
	});
	return watchImmediate(() => {
		var _firstParamTargets$va, _firstParamTargets$va2;
		return [
			(_firstParamTargets$va = (_firstParamTargets$va2 = firstParamTargets.value) === null || _firstParamTargets$va2 === void 0 ? void 0 : _firstParamTargets$va2.map((e) => unrefElement(e))) !== null && _firstParamTargets$va !== void 0 ? _firstParamTargets$va : [defaultWindow].filter((e) => e != null),
			toArray(toValue(firstParamTargets.value ? args[1] : args[0])),
			toArray(unref(firstParamTargets.value ? args[2] : args[1])),
			toValue(firstParamTargets.value ? args[3] : args[2])
		];
	}, ([raw_targets, raw_events, raw_listeners, raw_options], _, onCleanup) => {
		if (!(raw_targets === null || raw_targets === void 0 ? void 0 : raw_targets.length) || !(raw_events === null || raw_events === void 0 ? void 0 : raw_events.length) || !(raw_listeners === null || raw_listeners === void 0 ? void 0 : raw_listeners.length)) return;
		const optionsClone = isObject(raw_options) ? { ...raw_options } : raw_options;
		const cleanups = raw_targets.flatMap((el) => raw_events.flatMap((event) => raw_listeners.map((listener) => register(el, event, listener, optionsClone))));
		onCleanup(() => {
			cleanups.forEach((fn) => fn());
		});
	}, { flush: "post" });
}
/**
* Mounted state in ref.
*
* @see https://vueuse.org/useMounted
*
* @__NO_SIDE_EFFECTS__
*/
function useMounted() {
	const isMounted = shallowRef(false);
	const instance = getCurrentInstance();
	if (instance) onMounted(() => {
		isMounted.value = true;
	}, instance);
	return isMounted;
}
/* @__NO_SIDE_EFFECTS__ */
function useSupported(callback) {
	const isMounted = useMounted();
	return computed(() => {
		isMounted.value;
		return Boolean(callback());
	});
}
function createKeyPredicate(keyFilter) {
	if (typeof keyFilter === "function") return keyFilter;
	else if (typeof keyFilter === "string") return (event) => event.key === keyFilter;
	else if (Array.isArray(keyFilter)) return (event) => keyFilter.includes(event.key);
	return () => true;
}
function onKeyStroke(...args) {
	let key;
	let handler;
	let options = {};
	if (args.length === 3) {
		key = args[0];
		handler = args[1];
		options = args[2];
	} else if (args.length === 2) {
		if (typeof args[1] === "object") {
			key = true;
			handler = args[0];
			options = args[1];
		} else {
			key = args[0];
			handler = args[1];
		}
	} else {
		key = true;
		handler = args[0];
	}
	const { target = defaultWindow, eventName = "keydown", passive = false, dedupe = false } = options;
	const predicate = createKeyPredicate(key);
	const listener = (e) => {
		if (e.repeat && toValue(dedupe)) return;
		if (predicate(e)) handler(e);
	};
	return useEventListener(target, eventName, listener, passive);
}
/**
* Listen to the keydown event of the given key.
*
* @see https://vueuse.org/onKeyStroke
* @param key
* @param handler
* @param options
*/
function onKeyDown(key, handler, options = {}) {
	return onKeyStroke(key, handler, {
		...options,
		eventName: "keydown"
	});
}
var ssrWidthSymbol = Symbol("vueuse-ssr-width");
/* @__NO_SIDE_EFFECTS__ */
function useSSRWidth() {
	const ssrWidth = hasInjectionContext() ? /* @__PURE__ */ injectLocal(ssrWidthSymbol, null) : null;
	return typeof ssrWidth === "number" ? ssrWidth : void 0;
}
/**
* Reactive Media Query.
*
* @see https://vueuse.org/useMediaQuery
* @param query
* @param options
*/
function useMediaQuery(query, options = {}) {
	const { window = defaultWindow, ssrWidth = /* @__PURE__ */ useSSRWidth() } = options;
	const isSupported = /* @__PURE__ */ useSupported(() => window && "matchMedia" in window && typeof window.matchMedia === "function");
	const ssrSupport = shallowRef(typeof ssrWidth === "number");
	const mediaQuery = shallowRef();
	const matches = shallowRef(false);
	const handler = (event) => {
		matches.value = event.matches;
	};
	watchEffect(() => {
		if (ssrSupport.value) {
			ssrSupport.value = !isSupported.value;
			const queryStrings = toValue(query).split(",");
			matches.value = queryStrings.some((queryString) => {
				const not = queryString.includes("not all");
				const minWidth = queryString.match(/\(\s*min-width:\s*(-?\d+(?:\.\d*)?[a-z]+\s*)\)/);
				const maxWidth = queryString.match(/\(\s*max-width:\s*(-?\d+(?:\.\d*)?[a-z]+\s*)\)/);
				let res = Boolean(minWidth || maxWidth);
				if (minWidth && res) res = ssrWidth >= pxValue(minWidth[1]);
				if (maxWidth && res) res = ssrWidth <= pxValue(maxWidth[1]);
				return not ? !res : res;
			});
			return;
		}
		if (!isSupported.value) return;
		mediaQuery.value = window.matchMedia(toValue(query));
		matches.value = mediaQuery.value.matches;
	});
	useEventListener(mediaQuery, "change", handler, { passive: true });
	return computed(() => matches.value);
}
var _global = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var globalKey = "__vueuse_ssr_handlers__";
var handlers = /* #__PURE__ */ getHandlers();
function getHandlers() {
	if (!(globalKey in _global)) _global[globalKey] = _global[globalKey] || {};
	return _global[globalKey];
}
function getSSRHandler(key, fallback) {
	return handlers[key] || fallback;
}
/**
* Reactive dark theme preference.
*
* @see https://vueuse.org/usePreferredDark
* @param [options]
*
* @__NO_SIDE_EFFECTS__
*/
function usePreferredDark(options) {
	return useMediaQuery("(prefers-color-scheme: dark)", options);
}
function guessSerializerType(rawInit) {
	return rawInit == null ? "any" : rawInit instanceof Set ? "set" : rawInit instanceof Map ? "map" : rawInit instanceof Date ? "date" : typeof rawInit === "boolean" ? "boolean" : typeof rawInit === "string" ? "string" : typeof rawInit === "object" ? "object" : !Number.isNaN(rawInit) ? "number" : "any";
}
var StorageSerializers = {
	boolean: {
		read: (v) => v === "true",
		write: (v) => String(v)
	},
	object: {
		read: (v) => JSON.parse(v),
		write: (v) => JSON.stringify(v)
	},
	number: {
		read: (v) => Number.parseFloat(v),
		write: (v) => String(v)
	},
	any: {
		read: (v) => v,
		write: (v) => String(v)
	},
	string: {
		read: (v) => v,
		write: (v) => String(v)
	},
	map: {
		read: (v) => new Map(JSON.parse(v)),
		write: (v) => JSON.stringify(Array.from(v.entries()))
	},
	set: {
		read: (v) => new Set(JSON.parse(v)),
		write: (v) => JSON.stringify(Array.from(v))
	},
	date: {
		read: (v) => new Date(v),
		write: (v) => v.toISOString()
	}
};
var customStorageEventName = "vueuse-storage";
/**
* Reactive LocalStorage/SessionStorage.
*
* @see https://vueuse.org/useStorage
*/
function useStorage(key, defaults, storage, options = {}) {
	var _options$serializer;
	const { flush = "pre", deep = true, listenToStorageChanges = true, writeDefaults = true, mergeDefaults = false, shallow, window = defaultWindow, eventFilter, onError = (e) => {
		console.error(e);
	}, initOnMounted } = options;
	const data = (shallow ? shallowRef : ref)(typeof defaults === "function" ? defaults() : defaults);
	const keyComputed = computed(() => toValue(key));
	if (!storage) try {
		storage = getSSRHandler("getDefaultStorage", () => defaultWindow === null || defaultWindow === void 0 ? void 0 : defaultWindow.localStorage)();
	} catch (e) {
		onError(e);
	}
	if (!storage) return data;
	const rawInit = toValue(defaults);
	const type = guessSerializerType(rawInit);
	const serializer = (_options$serializer = options.serializer) !== null && _options$serializer !== void 0 ? _options$serializer : StorageSerializers[type];
	const { pause: pauseWatch, resume: resumeWatch } = watchPausable(data, (newValue) => write(newValue), {
		flush,
		deep,
		eventFilter
	});
	watch(keyComputed, () => update(), { flush });
	let firstMounted = false;
	const onStorageEvent = (ev) => {
		if (initOnMounted && !firstMounted) return;
		update(ev);
	};
	const onStorageCustomEvent = (ev) => {
		if (initOnMounted && !firstMounted) return;
		updateFromCustomEvent(ev);
	};
	/**
	* The custom event is needed for same-document syncing when using custom
	* storage backends, but it doesn't work across different documents.
	*
	* TODO: Consider implementing a BroadcastChannel-based solution that fixes this.
	*/
	if (window && listenToStorageChanges) {
		if (storage instanceof Storage) useEventListener(window, "storage", onStorageEvent, { passive: true });
		else useEventListener(window, customStorageEventName, onStorageCustomEvent);
	}
	if (initOnMounted) tryOnMounted(() => {
		firstMounted = true;
		update();
	});
	else update();
	function dispatchWriteEvent(oldValue, newValue) {
		if (window) {
			const payload = {
				key: keyComputed.value,
				oldValue,
				newValue,
				storageArea: storage
			};
			window.dispatchEvent(storage instanceof Storage ? new StorageEvent("storage", payload) : new CustomEvent(customStorageEventName, { detail: payload }));
		}
	}
	function write(v) {
		try {
			const oldValue = storage.getItem(keyComputed.value);
			if (v == null) {
				dispatchWriteEvent(oldValue, null);
				storage.removeItem(keyComputed.value);
			} else {
				const serialized = serializer.write(v);
				if (oldValue !== serialized) {
					storage.setItem(keyComputed.value, serialized);
					dispatchWriteEvent(oldValue, serialized);
				}
			}
		} catch (e) {
			onError(e);
		}
	}
	function read(event) {
		const rawValue = event ? event.newValue : storage.getItem(keyComputed.value);
		if (rawValue == null) {
			if (writeDefaults && rawInit != null) storage.setItem(keyComputed.value, serializer.write(rawInit));
			return rawInit;
		} else if (!event && mergeDefaults) {
			const value = serializer.read(rawValue);
			if (typeof mergeDefaults === "function") return mergeDefaults(value, rawInit);
			else if (type === "object" && !Array.isArray(value)) return {
				...rawInit,
				...value
			};
			return value;
		} else if (typeof rawValue !== "string") return rawValue;
		else return serializer.read(rawValue);
	}
	function update(event) {
		if (event && event.storageArea !== storage) return;
		if (event && event.key == null) {
			data.value = rawInit;
			return;
		}
		if (event && event.key !== keyComputed.value) return;
		pauseWatch();
		try {
			const serializedData = serializer.write(data.value);
			if (event === void 0 || (event === null || event === void 0 ? void 0 : event.newValue) !== serializedData) data.value = read(event);
		} catch (e) {
			onError(e);
		} finally {
			if (event) nextTick(resumeWatch);
			else resumeWatch();
		}
	}
	function updateFromCustomEvent(event) {
		update(event.detail);
	}
	return data;
}
var CSS_DISABLE_TRANS = "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";
/**
* Reactive color mode with auto data persistence.
*
* @see https://vueuse.org/useColorMode
* @param options
*/
function useColorMode(options = {}) {
	const { selector = "html", attribute = "class", initialValue = "auto", window = defaultWindow, storage, storageKey = "vueuse-color-scheme", listenToStorageChanges = true, storageRef, emitAuto, disableTransition = true } = options;
	const modes = {
		auto: "",
		light: "light",
		dark: "dark",
		...options.modes || {}
	};
	const preferredDark = usePreferredDark({ window });
	const system = computed(() => preferredDark.value ? "dark" : "light");
	const store = storageRef || (storageKey == null ? toRef(initialValue) : useStorage(storageKey, initialValue, storage, {
		window,
		listenToStorageChanges
	}));
	const state = computed(() => store.value === "auto" ? system.value : store.value);
	const updateHTMLAttrs = getSSRHandler("updateHTMLAttrs", (selector, attribute, value) => {
		const el = typeof selector === "string" ? window === null || window === void 0 ? void 0 : window.document.querySelector(selector) : unrefElement(selector);
		if (!el) return;
		const classesToAdd = /* @__PURE__ */ new Set();
		const classesToRemove = /* @__PURE__ */ new Set();
		let attributeToChange = null;
		if (attribute === "class") {
			const current = value.split(/\s/g);
			Object.values(modes).flatMap((i) => (i || "").split(/\s/g)).filter(Boolean).forEach((v) => {
				if (current.includes(v)) classesToAdd.add(v);
				else classesToRemove.add(v);
			});
		} else attributeToChange = {
			key: attribute,
			value
		};
		if (classesToAdd.size === 0 && classesToRemove.size === 0 && attributeToChange === null) return;
		let style;
		if (disableTransition) {
			style = window.document.createElement("style");
			style.appendChild(document.createTextNode(CSS_DISABLE_TRANS));
			window.document.head.appendChild(style);
		}
		for (const c of classesToAdd) el.classList.add(c);
		for (const c of classesToRemove) el.classList.remove(c);
		if (attributeToChange) el.setAttribute(attributeToChange.key, attributeToChange.value);
		if (disableTransition) {
			window.getComputedStyle(style).opacity;
			document.head.removeChild(style);
		}
	});
	function defaultOnChanged(mode) {
		var _modes$mode;
		updateHTMLAttrs(selector, attribute, (_modes$mode = modes[mode]) !== null && _modes$mode !== void 0 ? _modes$mode : mode);
	}
	function onChanged(mode) {
		if (options.onChanged) options.onChanged(mode, defaultOnChanged);
		else defaultOnChanged(mode);
	}
	watch(state, onChanged, {
		flush: "post",
		immediate: true
	});
	tryOnMounted(() => onChanged(state.value));
	const auto = computed({
		get() {
			return emitAuto ? store.value : state.value;
		},
		set(v) {
			store.value = v;
		}
	});
	return Object.assign(auto, {
		store,
		system,
		state
	});
}
/**
* Reactive dark mode with auto data persistence.
*
* @see https://vueuse.org/useDark
* @param options
*/
function useDark(options = {}) {
	const { valueDark = "dark", valueLight = "" } = options;
	const mode = useColorMode({
		...options,
		onChanged: (mode, defaultHandler) => {
			var _options$onChanged;
			if (options.onChanged) (_options$onChanged = options.onChanged) === null || _options$onChanged === void 0 || _options$onChanged.call(options, mode === "dark", defaultHandler, mode);
			else defaultHandler(mode);
		},
		modes: {
			dark: valueDark,
			light: valueLight
		}
	});
	const system = computed(() => mode.system.value);
	return computed({
		get() {
			return mode.value === "dark";
		},
		set(v) {
			const modeVal = v ? "dark" : "light";
			if (system.value === modeVal) mode.value = "auto";
			else mode.value = modeVal;
		}
	});
}
/**
* Reports changes to the dimensions of an Element's content or the border-box
*
* @see https://vueuse.org/useResizeObserver
* @param target
* @param callback
* @param options
*/
function useResizeObserver(target, callback, options = {}) {
	const { window = defaultWindow, ...observerOptions } = options;
	let observer;
	const isSupported = /* @__PURE__ */ useSupported(() => window && "ResizeObserver" in window);
	const cleanup = () => {
		if (observer) {
			observer.disconnect();
			observer = void 0;
		}
	};
	const targets = computed(() => {
		const _targets = toValue(target);
		return Array.isArray(_targets) ? _targets.map((el) => unrefElement(el)) : [unrefElement(_targets)];
	});
	const stopWatch = watch(targets, (els) => {
		cleanup();
		if (isSupported.value && window) {
			observer = new ResizeObserver(callback);
			for (const _el of els) if (_el instanceof Element) observer.observe(_el, observerOptions);
		}
	}, {
		immediate: true,
		flush: "post"
	});
	const stop = () => {
		cleanup();
		stopWatch();
	};
	tryOnScopeDispose(stop);
	return {
		isSupported,
		stop
	};
}
/**
* Reactive size of an HTML element.
*
* @see https://vueuse.org/useElementSize
*/
function useElementSize(target, initialSize = {
	width: 0,
	height: 0
}, options = {}) {
	const { window = defaultWindow, box = "content-box" } = options;
	const isSVG = computed(() => {
		var _unrefElement;
		return (_unrefElement = unrefElement(target)) === null || _unrefElement === void 0 || (_unrefElement = _unrefElement.namespaceURI) === null || _unrefElement === void 0 ? void 0 : _unrefElement.includes("svg");
	});
	const width = shallowRef(initialSize.width);
	const height = shallowRef(initialSize.height);
	const { stop: stop1 } = useResizeObserver(target, ([entry]) => {
		const boxSize = box === "border-box" ? entry.borderBoxSize : box === "content-box" ? entry.contentBoxSize : entry.devicePixelContentBoxSize;
		if (window && isSVG.value) {
			const $elem = unrefElement(target);
			if ($elem) {
				const rect = $elem.getBoundingClientRect();
				width.value = rect.width;
				height.value = rect.height;
			}
		} else if (boxSize) {
			const formatBoxSize = toArray(boxSize);
			width.value = formatBoxSize.reduce((acc, { inlineSize }) => acc + inlineSize, 0);
			height.value = formatBoxSize.reduce((acc, { blockSize }) => acc + blockSize, 0);
		} else {
			width.value = entry.contentRect.width;
			height.value = entry.contentRect.height;
		}
	}, options);
	tryOnMounted(() => {
		const ele = unrefElement(target);
		if (ele && "offsetWidth" in ele) {
			if (box === "content-box" && window) {
				const cs = window.getComputedStyle(ele);
				const padX = Number.parseFloat(cs.paddingLeft) + Number.parseFloat(cs.paddingRight);
				const padY = Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom);
				const bdX = Number.parseFloat(cs.borderLeftWidth) + Number.parseFloat(cs.borderRightWidth);
				const bdY = Number.parseFloat(cs.borderTopWidth) + Number.parseFloat(cs.borderBottomWidth);
				width.value = ele.offsetWidth - padX - bdX;
				height.value = ele.offsetHeight - padY - bdY;
			} else {
				width.value = ele.offsetWidth;
				height.value = ele.offsetHeight;
			}
		} else if (ele) {
			width.value = initialSize.width;
			height.value = initialSize.height;
		}
	});
	const stop2 = watch(() => unrefElement(target), (ele) => {
		width.value = ele ? initialSize.width : 0;
		height.value = ele ? initialSize.height : 0;
	});
	function stop() {
		stop1();
		stop2();
	}
	return {
		width,
		height,
		stop
	};
}
/**
* Reactive LocalStorage.
*
* @see https://vueuse.org/useLocalStorage
* @param key
* @param initialValue
* @param options
*/
function useLocalStorage(key, initialValue, options = {}) {
	const { window = defaultWindow } = options;
	return useStorage(key, initialValue, window === null || window === void 0 ? void 0 : window.localStorage, options);
}
/**
* Please consider using [`vue-virtual-scroller`](https://github.com/Akryum/vue-virtual-scroller) if you are looking for more features.
*/
function useVirtualList(list, options) {
	const { containerStyle, wrapperProps, scrollTo, calculateRange, currentList, containerRef } = "itemHeight" in options ? useVerticalVirtualList(options, list) : useHorizontalVirtualList(options, list);
	return {
		list: currentList,
		scrollTo,
		containerProps: {
			ref: containerRef,
			onScroll: () => {
				calculateRange();
			},
			style: containerStyle
		},
		wrapperProps
	};
}
function useVirtualListResources(list) {
	const containerRef = shallowRef(null);
	const size = useElementSize(containerRef);
	const currentList = ref([]);
	const source = shallowRef(list);
	return {
		state: ref({
			start: 0,
			end: 10
		}),
		source,
		currentList,
		size,
		containerRef
	};
}
function createGetViewCapacity(state, source, itemSize) {
	return (containerSize) => {
		if (typeof itemSize === "number") return Math.ceil(containerSize / itemSize);
		const { start = 0 } = state.value;
		let sum = 0;
		let capacity = 0;
		for (let i = start; i < source.value.length; i++) {
			const size = itemSize(i);
			sum += size;
			capacity = i;
			if (sum > containerSize) break;
		}
		return capacity - start;
	};
}
function createGetOffset(source, itemSize) {
	return (scrollDirection) => {
		if (typeof itemSize === "number") return Math.floor(scrollDirection / itemSize) + 1;
		let sum = 0;
		let offset = 0;
		for (let i = 0; i < source.value.length; i++) {
			const size = itemSize(i);
			sum += size;
			if (sum >= scrollDirection) {
				offset = i;
				break;
			}
		}
		return offset + 1;
	};
}
function createCalculateRange(type, overscan, getOffset, getViewCapacity, { containerRef, state, currentList, source }) {
	return () => {
		const element = containerRef.value;
		if (element) {
			const offset = getOffset(type === "vertical" ? element.scrollTop : element.scrollLeft);
			const viewCapacity = getViewCapacity(type === "vertical" ? element.clientHeight : element.clientWidth);
			const from = offset - overscan;
			const to = offset + viewCapacity + overscan;
			state.value = {
				start: from < 0 ? 0 : from,
				end: to > source.value.length ? source.value.length : to
			};
			currentList.value = source.value.slice(state.value.start, state.value.end).map((ele, index) => ({
				data: ele,
				index: index + state.value.start
			}));
		}
	};
}
function createGetDistance(itemSize, source) {
	return (index) => {
		if (typeof itemSize === "number") return index * itemSize;
		return source.value.slice(0, index).reduce((sum, _, i) => sum + itemSize(i), 0);
	};
}
function useWatchForSizes(size, listRef, totalSize, containerRef, calculateRange) {
	watch([
		size.width,
		size.height,
		listRef,
		totalSize,
		containerRef
	], () => {
		calculateRange();
	});
}
function createComputedTotalSize(itemSize, source) {
	return computed(() => {
		if (typeof itemSize === "number") return source.value.length * itemSize;
		return source.value.reduce((sum, _, index) => sum + itemSize(index), 0);
	});
}
var scrollToDictionaryForElementScrollKey = {
	horizontal: "scrollLeft",
	vertical: "scrollTop"
};
var scrollToDictionaryForElementScrollToKey = {
	horizontal: "left",
	vertical: "top"
};
var defaultScrollToOptions = {
	behavior: "auto",
	block: "start",
	inline: "nearest"
};
function createScrollTo(type, calculateRange, getDistance, containerRef, itemSize) {
	return (index, options = defaultScrollToOptions) => {
		if (!containerRef.value) return;
		options = {
			...defaultScrollToOptions,
			...options
		};
		let offset = 0;
		const axisToCheck = options[type === "horizontal" ? "inline" : "block"];
		if (axisToCheck) {
			const containerSize = type === "horizontal" ? containerRef.value.clientWidth : containerRef.value.clientHeight;
			const fullItemSize = typeof itemSize === "number" ? itemSize : itemSize(index);
			if (axisToCheck === "center") offset = containerSize / 2 - fullItemSize / 2;
			else if (axisToCheck === "end") offset = containerSize - fullItemSize;
			else if (axisToCheck === "nearest") {
				const containerScrollPosition = containerRef.value[scrollToDictionaryForElementScrollKey[type]];
				if (getDistance(index) > containerScrollPosition + containerSize / 2) offset = containerSize - fullItemSize;
			}
		}
		containerRef.value.scrollTo({
			[scrollToDictionaryForElementScrollToKey[type]]: getDistance(index) - offset,
			behavior: options.behavior
		});
		calculateRange();
	};
}
function useHorizontalVirtualList(options, list) {
	const resources = useVirtualListResources(list);
	const { state, source, currentList, size, containerRef } = resources;
	const containerStyle = { overflowX: "auto" };
	const { itemWidth, overscan = 5 } = options;
	const getViewCapacity = createGetViewCapacity(state, source, itemWidth);
	const calculateRange = createCalculateRange("horizontal", overscan, createGetOffset(source, itemWidth), getViewCapacity, resources);
	const getDistanceLeft = createGetDistance(itemWidth, source);
	const offsetLeft = computed(() => getDistanceLeft(state.value.start));
	const totalWidth = createComputedTotalSize(itemWidth, source);
	useWatchForSizes(size, source, totalWidth, containerRef, calculateRange);
	return {
		scrollTo: createScrollTo("horizontal", calculateRange, getDistanceLeft, containerRef, itemWidth),
		calculateRange,
		wrapperProps: computed(() => {
			return { style: {
				height: "100%",
				width: `${totalWidth.value - offsetLeft.value}px`,
				marginLeft: `${offsetLeft.value}px`,
				display: "flex"
			} };
		}),
		containerStyle,
		currentList,
		containerRef
	};
}
function useVerticalVirtualList(options, list) {
	const resources = useVirtualListResources(list);
	const { state, source, currentList, size, containerRef } = resources;
	const containerStyle = { overflowY: "auto" };
	const { itemHeight, overscan = 5 } = options;
	const getViewCapacity = createGetViewCapacity(state, source, itemHeight);
	const calculateRange = createCalculateRange("vertical", overscan, createGetOffset(source, itemHeight), getViewCapacity, resources);
	const getDistanceTop = createGetDistance(itemHeight, source);
	const offsetTop = computed(() => getDistanceTop(state.value.start));
	const totalHeight = createComputedTotalSize(itemHeight, source);
	useWatchForSizes(size, source, totalHeight, containerRef, calculateRange);
	return {
		calculateRange,
		scrollTo: createScrollTo("vertical", calculateRange, getDistanceTop, containerRef, itemHeight),
		containerStyle,
		wrapperProps: computed(() => {
			return { style: {
				width: "100%",
				height: `${totalHeight.value - offsetTop.value}px`,
				marginTop: `${offsetTop.value}px`
			} };
		}),
		currentList,
		containerRef
	};
}
//#endregion
//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/utils/url.mjs
/**
* URL path-joining and slash-normalization helpers shared by the adapters,
* the RPC clients, and the hub's mount-path plumbing. In-house replacements
* for the handful of `ufo` functions devframe used, kept dependency-free and
* browser-safe (pure string operations, no `node:` imports).
*/
/** Matches an explicit protocol prefix: `http://`, `wss://`, `file://`, … */
var PROTOCOL_RE = /^[\w+.-]{2,}:\/\//;
/** `input` with a trailing `/` added when missing. */
function withTrailingSlash(input) {
	return input.endsWith("/") ? input : `${input}/`;
}
/** `input` with a trailing `/` removed; a bare `/` stays `/`. */
function withoutTrailingSlash(input) {
	return (input.endsWith("/") ? input.slice(0, -1) : input) || "/";
}
/**
* Joins path segments onto `base` with exactly one `/` at each seam.
* A segment's leading `/` or `./` is dropped; empty and bare-`/` segments
* are skipped; the last segment's trailing slash is preserved.
*/
function joinURL(base, ...segments) {
	let url = base;
	for (const segment of segments) {
		if (!segment || segment === "/") continue;
		url = url ? withTrailingSlash(url) + segment.replace(/^\.?\//, "") : segment;
	}
	return url;
}
/**
* Prefixes `input` with `base` unless it already carries the prefix or is an
* absolute URL with a protocol. An empty or `/` base is a no-op.
*/
function withBase(input, base) {
	if (!base || base === "/" || PROTOCOL_RE.test(input)) return input;
	const prefix = withoutTrailingSlash(base);
	return input.startsWith(prefix) ? input : joinURL(prefix, input);
}
/** Replaces (or adds) the protocol of `input`: `withProtocol(url, 'ws://')`. */
function withProtocol(input, protocol) {
	const match = input.match(PROTOCOL_RE);
	return protocol + (match ? input.slice(match[0].length) : input);
}
//#endregion
//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/utils/colors.mjs
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
var colors = {
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
//#endregion
//#region node_modules/.pnpm/nostics@1.3.0/node_modules/nostics/dist/formatters/ansi.mjs
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
//#endregion
//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/tool-input-BAQXvvqL.mjs
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
var DEVFRAME_EVENTS = {
	/**
	* Node-side host `EventEmitter` events. The agent host (`ctx.agent.events`)
	* emits these as its tool/resource surface changes; protocol adapters (e.g.
	* MCP) subscribe to re-publish their manifest.
	*/
	bus: {
		agentManifestChanged: "agent:manifest:changed",
		agentToolRegistered: "agent:tool:registered",
		agentToolUnregistered: "agent:tool:unregistered",
		agentResourceRegistered: "agent:resource:registered",
		agentResourceUnregistered: "agent:resource:unregistered"
	},
	/**
	* Client-side RPC connection `EventEmitter` events (`rpc.events`) a UI
	* subscribes to for connection lifecycle and error surfacing.
	*/
	client: {
		isTrustedUpdated: "rpc:is-trusted:updated",
		error: "rpc:error",
		connectionStatus: "connection:status",
		connectionError: "connection:error"
	},
	/**
	* Broadcast notifications the server pushes to clients (server → client),
	* `devframe:` prefix. The paired request methods (subscribe/get/set/…) are
	* RPC endpoints, not events, and are omitted deliberately.
	*/
	broadcast: {
		authRevoked: "devframe:auth:revoked",
		clientStateUpdated: "devframe:rpc:client-state:updated",
		clientStatePatch: "devframe:rpc:client-state:patch",
		streamingChunk: "devframe:streaming:chunk",
		streamingEnd: "devframe:streaming:end",
		streamingUploadCancel: "devframe:streaming:upload-cancel"
	},
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
		remoteAssetsError: "devframe:remote-assets-error",
		inPageChannel: "devframe:in-page-channel"
	}
};
var formatAnsi = /* @__PURE__ */ ansiFormatter(colors);
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
	return /* @__PURE__ */ defineDiagnostics({
		...options,
		reporters: [devframeReporter, ...options.reporters ?? []]
	});
}
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
var random = Math.random.bind(Math);
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid(size = 21) {
	let id = "";
	let i = size;
	while (i--) id += urlAlphabet[random() * 64 | 0];
	return id;
}
var DEFAULT_TIMEOUT = 6e4;
var defaultSerialize = (i) => i;
var defaultDeserialize = defaultSerialize;
var { clearTimeout: clearTimeout$1, setTimeout: setTimeout$1 } = globalThis;
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
		const id = nanoid();
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
/**
* An agent tool's safety classification: the explicit `agent.safety`, else
* inferred from the function `type` (`static`/`query` are read-only, the rest
* mutate). Shared by every agent surface (MCP host, WebMCP, in-page bridge).
*/
function resolveAgentSafety(type, agent) {
	if (agent.safety) return agent.safety;
	return type === "static" || type === "query" || type == null ? "read" : "action";
}
var FALLBACK_OBJECT_SCHEMA = Object.freeze({
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
//#endregion
//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/hash-DdPnc4k3.mjs
function serialize$1(input) {
	if (typeof input === "string") return `'${input}'`;
	return new Serializer().serialize(input);
}
var asciiOrder = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz";
var asciiWeights = /*@__PURE__*/ (function() {
	const weights = /* @__PURE__ */ new Uint8Array(128);
	for (let i = 0; i < 69; i++) weights[asciiOrder.charCodeAt(i)] = i + 1;
	for (let code = 65; code <= 90; code++) weights[code] = weights[code + 32];
	return weights;
})();
function compareStrings(a, b) {
	if (a === b) return 0;
	const length = Math.min(a.length, b.length);
	let tieBreaker = 0;
	for (let i = 0; i < length; i++) {
		const codeA = a.charCodeAt(i);
		const codeB = b.charCodeAt(i);
		if (codeA === codeB) continue;
		const weightA = codeA < 128 && asciiWeights[codeA] ? asciiWeights[codeA] : codeA + 128;
		const weightB = codeB < 128 && asciiWeights[codeB] ? asciiWeights[codeB] : codeB + 128;
		if (weightA !== weightB) return weightA < weightB ? -1 : 1;
		if (tieBreaker === 0) tieBreaker = codeA > codeB ? -1 : 1;
	}
	if (a.length !== b.length) return a.length < b.length ? -1 : 1;
	return tieBreaker;
}
var Serializer = /*@__PURE__*/ (function() {
	class Serializer {
		#context = /* @__PURE__ */ new Map();
		compare(a, b) {
			const typeA = typeof a;
			const typeB = typeof b;
			if (typeA === "string" && typeB === "string") return compareStrings(a, b);
			if (typeA === "number" && typeB === "number") return a - b;
			return compareStrings(this.serialize(a, true), this.serialize(b, true));
		}
		serialize(value, noQuotes) {
			if (value === null) return "null";
			switch (typeof value) {
				case "string": return noQuotes ? value : `'${value}'`;
				case "bigint": return `${value}n`;
				case "object": return this.$object(value);
				case "function": return this.$function(value);
			}
			return String(value);
		}
		serializeObject(object) {
			const objString = Object.prototype.toString.call(object);
			if (objString !== "[object Object]") return this.serializeBuiltInType(objString.length < 10 ? `unknown:${objString}` : objString.slice(8, -1), object);
			const constructor = object.constructor;
			const objName = constructor === Object || constructor === void 0 ? "" : constructor.name;
			if (objName !== "" && globalThis[objName] === constructor) return this.serializeBuiltInType(objName, object);
			if ("toJSON" in object && typeof object.toJSON === "function") {
				const json = object.toJSON();
				return objName + (json !== null && typeof json === "object" ? this.$object(json) : `(${this.serialize(json)})`);
			}
			const keys = Object.keys(object).sort(compareStrings);
			let content = `${objName}{`;
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				content += `${key}:${this.serialize(object[key])}`;
				if (i < keys.length - 1) content += ",";
			}
			return content + "}";
		}
		serializeBuiltInType(type, object) {
			const handler = this["$" + type];
			if (handler) return handler.call(this, object);
			if (typeof object.entries === "function") return this.serializeObjectEntries(type, object.entries());
			throw new Error(`Cannot serialize ${type}`);
		}
		serializeObjectEntries(type, entries) {
			const sortedEntries = Array.from(entries).sort((a, b) => this.compare(a[0], b[0]));
			let content = `${type}{`;
			for (let i = 0; i < sortedEntries.length; i++) {
				const [key, value] = sortedEntries[i];
				content += `${this.serialize(key, true)}:${this.serialize(value)}`;
				if (i < sortedEntries.length - 1) content += ",";
			}
			return content + "}";
		}
		$object(object) {
			let content = this.#context.get(object);
			if (content === void 0) {
				this.#context.set(object, `#${this.#context.size}`);
				content = this.serializeObject(object);
				this.#context.set(object, content);
			}
			return content;
		}
		$function(fn) {
			const fnStr = Function.prototype.toString.call(fn);
			if (fnStr.slice(-15) === "[native code] }") return `${fn.name || ""}()[native]`;
			return `${fn.name}(${fn.length})${fnStr.replace(/\s*\n\s*/g, "")}`;
		}
		$Array(arr) {
			let content = "[";
			for (let i = 0; i < arr.length; i++) {
				content += this.serialize(arr[i]);
				if (i < arr.length - 1) content += ",";
			}
			return content + "]";
		}
		$Date(date) {
			try {
				return `Date(${date.toISOString()})`;
			} catch {
				return `Date(null)`;
			}
		}
		$ArrayBuffer(arr) {
			return `ArrayBuffer[${new Uint8Array(arr).join(",")}]`;
		}
		$Set(set) {
			return `Set${this.$Array(Array.from(set).sort((a, b) => this.compare(a, b)))}`;
		}
		$Map(map) {
			return this.serializeObjectEntries("Map", map.entries());
		}
	}
	for (const type of [
		"Error",
		"RegExp",
		"URL"
	]) Serializer.prototype["$" + type] = function(val) {
		return `${type}(${val})`;
	};
	for (const type of [
		"Int8Array",
		"Uint8Array",
		"Uint8ClampedArray",
		"Int16Array",
		"Uint16Array",
		"Int32Array",
		"Uint32Array",
		"Float32Array",
		"Float64Array"
	]) Serializer.prototype["$" + type] = function(arr) {
		return `${type}[${arr.join(",")}]`;
	};
	for (const type of ["BigInt64Array", "BigUint64Array"]) Serializer.prototype["$" + type] = function(arr) {
		return `${type}[${arr.join("n,")}${arr.length > 0 ? "n" : ""}]`;
	};
	return Serializer;
})();
var H = [
	1779033703,
	-1150833019,
	1013904242,
	-1521486534,
	1359893119,
	-1694144372,
	528734635,
	1541459225
];
var K = [
	1116352408,
	1899447441,
	-1245643825,
	-373957723,
	961987163,
	1508970993,
	-1841331548,
	-1424204075,
	-670586216,
	310598401,
	607225278,
	1426881987,
	1925078388,
	-2132889090,
	-1680079193,
	-1046744716,
	-459576895,
	-272742522,
	264347078,
	604807628,
	770255983,
	1249150122,
	1555081692,
	1996064986,
	-1740746414,
	-1473132947,
	-1341970488,
	-1084653625,
	-958395405,
	-710438585,
	113926993,
	338241895,
	666307205,
	773529912,
	1294757372,
	1396182291,
	1695183700,
	1986661051,
	-2117940946,
	-1838011259,
	-1564481375,
	-1474664885,
	-1035236496,
	-949202525,
	-778901479,
	-694614492,
	-200395387,
	275423344,
	430227734,
	506948616,
	659060556,
	883997877,
	958139571,
	1322822218,
	1537002063,
	1747873779,
	1955562222,
	2024104815,
	-2067236844,
	-1933114872,
	-1866530822,
	-1538233109,
	-1090935817,
	-965641998
];
var base64KeyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var W = [];
var SHA256 = class {
	_data = new WordArray();
	_hash = new WordArray([...H]);
	_nDataBytes = 0;
	_minBufferSize = 0;
	finalize(messageUpdate) {
		if (messageUpdate) this._append(messageUpdate);
		const nBitsTotal = this._nDataBytes * 8;
		const nBitsLeft = this._data.sigBytes * 8;
		this._data.words[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
		this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
		this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
		this._data.sigBytes = this._data.words.length * 4;
		this._process();
		return this._hash;
	}
	_doProcessBlock(M, offset) {
		const H = this._hash.words;
		let a = H[0];
		let b = H[1];
		let c = H[2];
		let d = H[3];
		let e = H[4];
		let f = H[5];
		let g = H[6];
		let h = H[7];
		for (let i = 0; i < 64; i++) {
			if (i < 16) W[i] = M[offset + i] | 0;
			else {
				const gamma0x = W[i - 15];
				const gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
				const gamma1x = W[i - 2];
				const gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
				W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
			}
			const ch = e & f ^ ~e & g;
			const maj = a & b ^ a & c ^ b & c;
			const sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
			const sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
			const t1 = h + sigma1 + ch + K[i] + W[i];
			const t2 = sigma0 + maj;
			h = g;
			g = f;
			f = e;
			e = d + t1 | 0;
			d = c;
			c = b;
			b = a;
			a = t1 + t2 | 0;
		}
		H[0] = H[0] + a | 0;
		H[1] = H[1] + b | 0;
		H[2] = H[2] + c | 0;
		H[3] = H[3] + d | 0;
		H[4] = H[4] + e | 0;
		H[5] = H[5] + f | 0;
		H[6] = H[6] + g | 0;
		H[7] = H[7] + h | 0;
	}
	_append(data) {
		if (typeof data === "string") data = WordArray.fromUtf8(data);
		this._data.concat(data);
		this._nDataBytes += data.sigBytes;
	}
	_process(doFlush) {
		let processedWords;
		let nBlocksReady = this._data.sigBytes / 64;
		if (doFlush) nBlocksReady = Math.ceil(nBlocksReady);
		else nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
		const nWordsReady = nBlocksReady * 16;
		const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);
		if (nWordsReady) {
			for (let offset = 0; offset < nWordsReady; offset += 16) this._doProcessBlock(this._data.words, offset);
			processedWords = this._data.words.splice(0, nWordsReady);
			this._data.sigBytes -= nBytesReady;
		}
		return new WordArray(processedWords, nBytesReady);
	}
};
var WordArray = class WordArray {
	words;
	sigBytes;
	constructor(words, sigBytes) {
		words = this.words = words || [];
		this.sigBytes = sigBytes === void 0 ? words.length * 4 : sigBytes;
	}
	static fromUtf8(input) {
		const str = unescape(encodeURIComponent(input));
		const strlen = str.length;
		const words = [];
		for (let i = 0; i < strlen; i++) words[i >>> 2] |= (str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
		return new WordArray(words, strlen);
	}
	toBase64() {
		const base64Chars = [];
		for (let i = 0; i < this.sigBytes; i += 3) {
			const byte1 = this.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
			const byte2 = this.words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
			const byte3 = this.words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
			const triplet = byte1 << 16 | byte2 << 8 | byte3;
			for (let j = 0; j < 4 && i * 8 + j * 6 < this.sigBytes * 8; j++) base64Chars.push(base64KeyStr.charAt(triplet >>> 6 * (3 - j) & 63));
		}
		return base64Chars.join("");
	}
	concat(wordArray) {
		this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8;
		this.words.length = Math.ceil(this.sigBytes / 4);
		if (this.sigBytes % 4) for (let i = 0; i < wordArray.sigBytes; i++) {
			const thatByte = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
			this.words[this.sigBytes + i >>> 2] |= thatByte << 24 - (this.sigBytes + i) % 4 * 8;
		}
		else for (let j = 0; j < wordArray.sigBytes; j += 4) this.words[this.sigBytes + j >>> 2] = wordArray.words[j >>> 2];
		this.sigBytes += wordArray.sigBytes;
	}
};
function digest(message) {
	return new SHA256().finalize(message).toBase64();
}
function hash$1(input) {
	return digest(serialize$1(input));
}
/**
* Stable, deterministic hash of any structured-cloneable value.
*/
function hash(value) {
	return hash$1(value);
}
//#endregion
//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/utils/events.mjs
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
//#endregion
//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/shared-state-Cow3u-_m.mjs
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
				state.assigned_.delete(prop);
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
/**
* Upper bound on retained syncIds. Loop echoes arrive near-immediately, so a
* generous window preserves de-dup while capping memory on long-lived,
* frequently-mutated states (e.g. a 1s terminal poll).
*/
var MAX_SYNC_IDS = 1e3;
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
		patch: (patches, syncId = nanoid$1()) => {
			if (syncIds.has(syncId)) return;
			enablePatches();
			state = applyPatches(state, patches);
			rememberSyncId(syncIds, syncId);
			events.emit("updated", state, void 0, syncId);
		},
		mutate: (fn, syncId = nanoid$1()) => {
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
//#endregion
//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/structured-clone-CgtQ61SA.mjs
var env = typeof self === "object" ? self : globalThis;
var SAFE_ERROR_NAMES = /* @__PURE__ */ new Set([
	"Error",
	"EvalError",
	"RangeError",
	"ReferenceError",
	"SyntaxError",
	"TypeError",
	"URIError",
	"AggregateError"
]);
var SAFE_CONSTRUCTOR_NAMES = /* @__PURE__ */ new Set([
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
var EMPTY = "";
var { toString } = {};
var { keys } = Object;
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
var { parse: $parse, stringify: $stringify } = JSON;
var options = {
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
//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/utils/streaming-channel.mjs
var DEFAULT_HIGH_WATER_MARK = 256;
var StreamClosedError = class extends Error {
	name = "StreamClosedError";
};
/**
* Build a server-side stream sink. RPC-agnostic; the RPC host wires
* `events.on('chunk' | 'end')` to broadcast, and reads `buffer` to replay
* for late or reconnecting subscribers.
*/
function createStreamSink(options = {}) {
	const id = options.id ?? nanoid$1();
	const replayWindow = Math.max(0, options.replayWindow ?? 0);
	const events = createEventEmitter();
	const controller = new AbortController();
	const buffer = [];
	let closed = false;
	let lastSeq = 0;
	function write(chunk) {
		if (closed) throw new StreamClosedError(`Cannot write to a closed stream "${id}"`);
		lastSeq += 1;
		if (replayWindow > 0) {
			buffer.push({
				seq: lastSeq,
				chunk
			});
			if (buffer.length > replayWindow) {
				if (buffer.length - replayWindow === 1) buffer.shift();
				else buffer.splice(0, buffer.length - replayWindow);
			}
		}
		events.emit("chunk", lastSeq, chunk);
	}
	function error(reason) {
		if (closed) return;
		closed = true;
		const payload = toErrorPayload(reason);
		controller.abort(reason);
		events.emit("end", payload);
	}
	function close() {
		if (closed) return;
		closed = true;
		if (!controller.signal.aborted) controller.abort("stream closed");
		events.emit("end", void 0);
	}
	function abort(reason) {
		if (closed) return;
		if (!controller.signal.aborted) controller.abort(reason ?? "aborted");
	}
	const writable = new WritableStream({
		write(chunk) {
			write(chunk);
		},
		close() {
			close();
		},
		abort(reason) {
			error(reason);
		}
	});
	return {
		id,
		signal: controller.signal,
		get closed() {
			return closed;
		},
		get lastSeq() {
			return lastSeq;
		},
		write,
		error,
		close,
		abort,
		writable,
		events,
		buffer
	};
}
/**
* Build a client-side stream reader. RPC-agnostic; the RPC host calls
* `_push(seq, chunk)` on each incoming chunk and `_end(error?)` on the
* terminal frame. Consumers iterate with `for await` or pipe `readable`.
*/
function createStreamReader(options = {}) {
	const id = options.id ?? nanoid$1();
	const highWaterMark = Math.max(1, options.highWaterMark ?? DEFAULT_HIGH_WATER_MARK);
	const queue = [];
	let lastSeenSeq = 0;
	let done = false;
	let cancelled = false;
	let endError;
	let pending;
	let pullController;
	let readableInstance;
	function drainNext() {
		if (!pending) return;
		if (queue.length > 0) {
			const value = queue.shift();
			const r = pending;
			pending = void 0;
			r.resolve({
				value,
				done: false
			});
			return;
		}
		if (done) {
			const r = pending;
			pending = void 0;
			if (endError) {
				const err = new Error(endError.message);
				err.name = endError.name;
				r.reject(err);
			} else r.resolve({
				value: void 0,
				done: true
			});
		}
	}
	function feedReadable() {
		if (!pullController) return;
		while (queue.length > 0) {
			const v = queue.shift();
			try {
				pullController.enqueue(v);
			} catch {
				break;
			}
		}
		if (done && pullController) {
			try {
				if (endError) {
					const err = new Error(endError.message);
					err.name = endError.name;
					pullController.error(err);
				} else pullController.close();
			} catch {}
			pullController = void 0;
		}
	}
	function push(seq, chunk) {
		if (done || cancelled) return;
		if (seq <= lastSeenSeq) return;
		lastSeenSeq = seq;
		queue.push(chunk);
		if (queue.length > highWaterMark) {
			const overflow = queue.length - highWaterMark;
			queue.splice(0, overflow);
			options.onOverflow?.(overflow);
		}
		drainNext();
		if (readableInstance) feedReadable();
	}
	function end(error) {
		if (done) return;
		done = true;
		endError = error;
		drainNext();
		if (readableInstance) feedReadable();
	}
	function cancel() {
		if (cancelled || done) return;
		cancelled = true;
		options.onCancel?.();
		end(void 0);
	}
	function getReadable() {
		if (readableInstance) return readableInstance;
		readableInstance = new ReadableStream({
			start(controller) {
				pullController = controller;
				feedReadable();
			},
			cancel() {
				cancel();
			}
		});
		return readableInstance;
	}
	return {
		id,
		get cancelled() {
			return cancelled;
		},
		get done() {
			return done;
		},
		get lastSeenSeq() {
			return lastSeenSeq;
		},
		get readable() {
			return getReadable();
		},
		cancel,
		_push: push,
		_end: end,
		[Symbol.asyncIterator]() {
			return {
				next() {
					if (queue.length > 0) return Promise.resolve({
						value: queue.shift(),
						done: false
					});
					if (done) {
						if (endError) {
							const err = new Error(endError.message);
							err.name = endError.name;
							return Promise.reject(err);
						}
						return Promise.resolve({
							value: void 0,
							done: true
						});
					}
					return new Promise((resolve, reject) => {
						pending = {
							resolve,
							reject
						};
					});
				},
				return() {
					cancel();
					return Promise.resolve({
						value: void 0,
						done: true
					});
				}
			};
		}
	};
}
function toErrorPayload(reason) {
	if (reason instanceof Error) return {
		name: reason.name || "Error",
		message: reason.message
	};
	if (typeof reason === "string") return {
		name: "Error",
		message: reason
	};
	try {
		return {
			name: "Error",
			message: JSON.stringify(reason)
		};
	} catch {
		return {
			name: "Error",
			message: String(reason)
		};
	}
}
//#endregion
//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/utils/agent-tool-name.mjs
/**
* Maximum tool-name length several MCP clients enforce (the Anthropic API
* pattern is `^[a-zA-Z0-9_-]{1,128}$`).
*/
var MAX_TOOL_NAME_LENGTH = 128;
/**
* Derive the wire-safe agent tool name for an internal tool id.
*
* Devframe tool ids are colon-namespaced: `devframe:<area>:<fn>` for
* built-ins, `devframes:plugin:<slug>:<fn>` for plugin RPCs, and hub
* command ids for command-derived tools. MCP clients constrain tool names
* to `^[a-zA-Z0-9_-]{1,128}$`, so the agent/MCP boundary derives the wire
* name automatically: every run of characters outside `[a-zA-Z0-9_-]`
* becomes a single `_`, truncated to 128 characters. Internal ids never
* change; resolution back to the id happens at the boundary.
*
* ```
* devframe:state:read          → devframe_state_read
* devframes:plugin:git:status  → devframes_plugin_git_status
* ```
*
* A plain string transform with no node dependency, so browser-side UIs
* that display a tool's id (e.g. the inspect plugin's agent view) can
* import it too and show the name a client actually calls.
*/
function toAgentToolName(id) {
	return id.replace(/[^\w-]+/g, "_").slice(0, MAX_TOOL_NAME_LENGTH);
}
//#endregion
//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/client/index.mjs
/** Devframe runtime routes and static output conventions. */
var DEVFRAME_CONNECTION_META_FILENAME = "__connection.json";
/**
* Global key holding the serializable connection prepared by
* `setupDevframeConnection()`. External viewers can use this key to read the
* connection from another JavaScript realm.
*/
var DEVFRAME_CONNECTION_KEY = "__DEVFRAME_CONNECTION__";
/**
* Request header carrying the SSE session id on every RPC `POST`. The
* server mints the id as the stream's first event (`event: session`);
* the client echoes it here so the POST joins that stream's birpc
* channel. Mirrors birpc's own SSE helpers for wire compatibility.
*/
var DEVFRAME_SSE_SESSION_HEADER = "x-birpc-session";
var DEVFRAME_RPC_DUMP_MANIFEST_FILENAME = "__rpc-dump/index.json";
/**
* Shared-state key carrying the wire-service advertisements (package name →
* `DevframeServiceMeta`). Written by the node services host; mirrored to
* clients for feature-detection via `client.services`.
*/
var DEVFRAME_SERVICES_STATE_KEY = "devframe:services";
/**
* Page-URL **fragment** parameter carrying a one-time authentication code (OTP)
* for "magic link" auth. A host can print a link like
* `<origin>/#devframe_otp=<code>`; the client reads the code, exchanges it for a
* token, and strips the parameter from the URL. The code rides the fragment
* (never the query string) so the browser never transmits it to the server,
* keeping it out of access logs and `Referer` headers. See `buildOtpAuthUrl`
* (node) and the `authenticateWithUrlOtp` / `consumeOtpFromUrl` client utilities
* (or `connectDevframe`'s `otpParam`).
*/
var DEVFRAME_OTP_URL_PARAM = "devframe_otp";
/**
* WS upgrade-URL query parameter carrying a previously-issued bearer token.
* Set by `createWsRpcChannel` (browser transport) whenever `authToken` is
* passed; read at connect time by a host's connect-time trust hook (see
* `recipes/interactive-auth`'s `onConnect`) so a returning client can be
* trusted before its own `anonymous:devframe:auth` handshake call arrives.
*/
var DEVFRAME_AUTH_TOKEN_QUERY_PARAM = "devframe_auth_token";
DEVFRAME_EVENTS.postMessage.remoteAssetsError;
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
var diagnostics = defineDiagnostics$1({
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
/**
* Prevents using a coding-agent-exposed RPC function that is explicitly
* marked as non-serializable, and marks these functions as serializable by
* default.
*
* @internal
*/
function ensureAgentJsonSerializable(fnDef) {
	if (fnDef.agent && fnDef.jsonSerializable === false) throw diagnostics.DF0019({ name: fnDef.name });
	if (fnDef.agent && !fnDef.jsonSerializable) fnDef.jsonSerializable = true;
}
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
var CONNECTION_META_KEY = "__DEVFRAME_CONNECTION_META__";
var CONNECTION_AUTH_TOKEN_KEY = "__DEVFRAME_CONNECTION_AUTH_TOKEN__";
function readFromWindows(key) {
	const getters = [
		() => window?.[key],
		() => globalThis?.[key],
		() => parent.window?.[key]
	];
	for (const getter of getters) try {
		const value = getter();
		if (value) return value;
	} catch {}
}
function readStoredConnection() {
	return readFromWindows(DEVFRAME_CONNECTION_KEY);
}
function readStoredConnectionMeta() {
	return readFromWindows(CONNECTION_META_KEY);
}
function readStoredAuthToken(userAuthToken) {
	if (userAuthToken) return userAuthToken;
	try {
		const token = localStorage.getItem(CONNECTION_AUTH_TOKEN_KEY);
		if (token) return token;
	} catch {}
	return readFromWindows(CONNECTION_AUTH_TOKEN_KEY);
}
/**
* Publish the connection on this window for same-origin frames to inherit.
* Call again after mutating `connection.connectionMeta` so the legacy meta
* copy below follows.
*/
function storeConnection(connection) {
	globalThis[DEVFRAME_CONNECTION_KEY] = connection;
	globalThis[CONNECTION_META_KEY] = {
		...connection.connectionMeta,
		baseUrl: connection.metaBaseUrl
	};
	if (connection.authToken) storeAuthToken(connection.authToken);
}
function storeAuthToken(token) {
	try {
		localStorage.setItem(CONNECTION_AUTH_TOKEN_KEY, token);
	} catch {}
	globalThis[CONNECTION_AUTH_TOKEN_KEY] = token;
	const connection = readStoredConnection();
	if (connection) globalThis[DEVFRAME_CONNECTION_KEY] = {
		...connection,
		authToken: token
	};
}
function resolveMetaBaseUrl(baseURL) {
	const metaPath = withBase(DEVFRAME_CONNECTION_META_FILENAME, baseURL);
	try {
		return new URL(metaPath, globalThis.location?.href).href;
	} catch {
		return metaPath;
	}
}
function withAuthToken(connection, authToken) {
	return authToken && authToken !== connection.authToken ? {
		...connection,
		authToken
	} : connection;
}
/**
* Return connection information previously prepared in this window or an
* accessible parent window.
*/
function getDevframeConnection() {
	const connection = readStoredConnection();
	if (connection) return withAuthToken(connection, readStoredAuthToken() ?? connection.authToken ?? connection.connectionMeta.authToken);
	const connectionMeta = readStoredConnectionMeta();
	if (!connectionMeta) return void 0;
	return {
		connectionMeta,
		metaBaseUrl: connectionMeta.baseUrl ?? resolveMetaBaseUrl("./"),
		authToken: readStoredAuthToken(connectionMeta.authToken)
	};
}
/**
* Prepare the connection information shared by a devframe client and external
* viewers. Reuses an explicit or previously prepared connection before
* fetching `__connection.json` from the configured base URLs.
*/
async function setupDevframeConnection(options = {}) {
	if (options.connection) {
		const connection = withAuthToken(options.connection, readStoredAuthToken(options.authToken ?? options.connection.authToken ?? options.connection.connectionMeta.authToken));
		storeConnection(connection);
		return connection;
	}
	const bases = Array.isArray(options.baseURL) ? options.baseURL : [options.baseURL ?? "./"];
	if (options.connectionMeta) {
		const connection = {
			connectionMeta: options.connectionMeta,
			/**
			* Preserve the established connectionMeta behavior: an explicitly
			* supplied descriptor resolves from the caller's explicit base.
			*/
			metaBaseUrl: resolveMetaBaseUrl(bases[0] ?? "./"),
			authToken: readStoredAuthToken(options.authToken ?? options.connectionMeta.authToken)
		};
		storeConnection(connection);
		return connection;
	}
	const existing = getDevframeConnection();
	if (existing) {
		const connection = withAuthToken(existing, readStoredAuthToken(options.authToken ?? existing.authToken ?? existing.connectionMeta.authToken));
		storeConnection(connection);
		return connection;
	}
	const errors = [];
	for (const base of bases) {
		const metaPath = withBase(DEVFRAME_CONNECTION_META_FILENAME, base);
		const metaUrl = resolveMetaBaseUrl(base);
		try {
			const response = await fetch(metaPath);
			if (!response.ok) throw new Error(`Failed to fetch connection meta from ${metaUrl}: ${response.status}`);
			const connectionMeta = await response.json();
			const loadedFrom = response.url || metaUrl;
			const connection = {
				connectionMeta,
				/**
				* A served `baseUrl` re-points relative resolution (RPC dump shards,
				* transport paths) at the meta that owns them: a static hub build's
				* per-frame meta directs each frame SPA at the hub's own dump.
				*/
				metaBaseUrl: connectionMeta.baseUrl ? new URL(connectionMeta.baseUrl, loadedFrom).href : loadedFrom,
				authToken: readStoredAuthToken(options.authToken ?? connectionMeta.authToken)
			};
			storeConnection(connection);
			return connection;
		} catch (error) {
			errors.push(error);
		}
	}
	throw new Error(`Failed to get connection meta from ${bases.join(", ")}`, { cause: errors });
}
/**
* The error rejected from `rpc.call(...)` (and carried on
* `rpc.connectionError`) when a call cannot be served because the connection is
* down, the client is unauthorized, or a call timed out. Its `kind` lets a UI
* tailor its message and recovery affordance without string-matching.
*/
var DevframeConnectionError = class extends Error {
	name = "DevframeConnectionError";
	kind;
	constructor(kind, message, options) {
		super(message, options);
		this.kind = kind;
	}
};
/**
* Read a one-time authentication code (OTP) from the current page URL's
* fragment, without side effects. Returns `undefined` when the parameter is
* absent.
*/
function readOtpFromUrl(param = DEVFRAME_OTP_URL_PARAM) {
	try {
		const hash = globalThis.location?.hash?.replace(/^#/, "") ?? "";
		return new URLSearchParams(hash).get(param) || void 0;
	} catch {
		return;
	}
}
function stripParamFromUrl(param) {
	try {
		const url = new URL(globalThis.location.href);
		const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));
		if (!fragment.has(param)) return;
		fragment.delete(param);
		url.hash = fragment.toString();
		globalThis.history?.replaceState(globalThis.history.state, "", url.href);
	} catch {}
}
/**
* Read the one-time code from the page URL fragment and remove it from the
* address bar (and the current history entry), so the single-use code isn't
* left in the URL, browser history, or a `Referer`. Returns the code, or
* `undefined` when absent.
*/
function consumeOtpFromUrl(param = DEVFRAME_OTP_URL_PARAM) {
	const code = readOtpFromUrl(param);
	if (code) stripParamFromUrl(param);
	return code;
}
/**
* Consume a one-time code from the page URL (see {@link consumeOtpFromUrl}) and
* exchange it for a token via the client. Resolves `true` when the client is
* authenticated (already trusted, or the exchange succeeded), and `false` when
* no code is present or the exchange failed.
*
* Higher-level integrations (e.g. Vite DevTools) that want to drive their own
* authentication UI can disable `connectDevframe`'s built-in handling with
* `otpParam: false` and call this (or {@link consumeOtpFromUrl}) themselves.
*/
async function authenticateWithUrlOtp(rpc, options = {}) {
	const code = consumeOtpFromUrl(options.param ?? "devframe_otp");
	if (!code) return false;
	if (rpc.isTrusted) return true;
	return rpc.requestTrustWithCode(code);
}
/** @internal */
function createDevframeServicesClient(rpc) {
	let current = {};
	const handles = /* @__PURE__ */ new WeakMap();
	let statePromise;
	const state = () => {
		statePromise ??= rpc.sharedState.get(DEVFRAME_SERVICES_STATE_KEY, { initialValue: {} }).then((shared) => {
			current = shared.value();
			shared.on("updated", (value) => {
				current = value;
			});
			return shared;
		});
		return statePromise;
	};
	state();
	return {
		state,
		has: (pkg) => pkg in current,
		keys: () => Object.keys(current),
		get: (pkg) => {
			const entry = current[pkg];
			if (!entry) return void 0;
			let handle = handles.get(entry);
			if (!handle) {
				handle = {
					...entry,
					rpc: rpc.scope(entry.scope).rpc
				};
				handles.set(entry, handle);
			}
			return handle;
		}
	};
}
function createRpcSharedStateClientHost(rpc) {
	const sharedState = /* @__PURE__ */ new Map();
	const stateDisposers = /* @__PURE__ */ new Map();
	const initialValues = /* @__PURE__ */ new Map();
	const keyAddedListeners = /* @__PURE__ */ new Set();
	const isStaticBackend = rpc.connectionMeta.backend === "static";
	function mergeWithInitialValue(key, serverState) {
		const initial = initialValues.get(key);
		if (initial && typeof initial === "object" && !Array.isArray(initial) && typeof serverState === "object" && !Array.isArray(serverState)) return {
			...initial,
			...serverState
		};
		return serverState;
	}
	rpc.client.register({
		name: DEVFRAME_EVENTS.broadcast.clientStateUpdated,
		type: "event",
		handler: (key, fullState, syncId) => {
			const state = sharedState.get(key);
			if (!state || state.syncIds.has(syncId)) return;
			state.mutate(() => mergeWithInitialValue(key, fullState), syncId);
		}
	});
	rpc.client.register({
		name: DEVFRAME_EVENTS.broadcast.clientStatePatch,
		type: "event",
		handler: (key, patches, syncId) => {
			const state = sharedState.get(key);
			if (!state || state.syncIds.has(syncId)) return;
			state.patch(patches, syncId);
		}
	});
	function registerSharedState(key, state) {
		const offs = [];
		offs.push(state.on("updated", (fullState, patches, syncId) => {
			if (isStaticBackend) return;
			if (patches) rpc.callEvent("devframe:rpc:server-state:patch", key, patches, syncId);
			else rpc.callEvent("devframe:rpc:server-state:set", key, fullState, syncId);
		}));
		return () => {
			for (const off of offs) off();
		};
	}
	return {
		keys: () => Array.from(sharedState.keys()),
		onKeyAdded(fn) {
			keyAddedListeners.add(fn);
			return () => {
				keyAddedListeners.delete(fn);
			};
		},
		delete(key) {
			const dispose = stateDisposers.get(key);
			stateDisposers.delete(key);
			const existed = sharedState.delete(key);
			initialValues.delete(key);
			dispose?.();
			return existed;
		},
		get: async (key, options) => {
			if (options?.initialValue !== void 0) initialValues.set(key, options.initialValue);
			if (sharedState.has(key)) return sharedState.get(key);
			const state = createSharedState({
				initialValue: options?.initialValue,
				enablePatches: false
			});
			async function initSharedState() {
				if (!isStaticBackend) rpc.callEvent("devframe:rpc:server-state:subscribe", key);
				if (options?.initialValue !== void 0) {
					sharedState.set(key, state);
					for (const fn of keyAddedListeners) fn(key);
					rpc.call("devframe:rpc:server-state:get", key).then((serverState) => {
						if (serverState !== void 0) state.mutate(() => mergeWithInitialValue(key, serverState));
					}).catch((error) => {
						console.error("Error getting server state", error);
					});
					stateDisposers.set(key, registerSharedState(key, state));
					return state;
				} else {
					const serverValue = await rpc.call("devframe:rpc:server-state:get", key);
					state.mutate(() => mergeWithInitialValue(key, serverValue));
					sharedState.set(key, state);
					for (const fn of keyAddedListeners) fn(key);
					stateDisposers.set(key, registerSharedState(key, state));
					return state;
				}
			}
			return new Promise((resolve) => {
				if (!rpc.isTrusted) {
					resolve(state);
					let initialized = false;
					rpc.events.on(DEVFRAME_EVENTS.client.isTrustedUpdated, (isTrusted) => {
						if (isTrusted && !initialized) {
							initialized = true;
							initSharedState();
						}
					});
				} else initSharedState().then(resolve);
			});
		}
	};
}
var EMPTY_WIRE_DEFS = /* @__PURE__ */ new Map();
/**
* Build the per-connection wire codec every live transport (WS server, WS
* client, SSE server, SSE client) shares: per-method dispatch between strict
* JSON (methods declared `jsonSerializable: true`) and `s:`-prefixed
* structured-clone (everything else, including all error envelopes), with a
* request-id → method map so a response independently picks the same
* encoder as its request. One codec per connection; request-id spaces
* don't collide across connections.
*
* @internal
*/
function createRpcWireCodec(definitions = EMPTY_WIRE_DEFS) {
	const pendingRequestMethods = /* @__PURE__ */ new Map();
	return {
		serialize: (msg) => {
			let method;
			if (msg.t === "q") method = msg.m;
			else {
				method = pendingRequestMethods.get(msg.i);
				pendingRequestMethods.delete(msg.i);
			}
			if (!(msg.t === "s" && "e" in msg) && !!method && definitions.get(method)?.jsonSerializable === true) return strictJsonStringify(msg, method ?? "");
			return `s:${structuredCloneStringify(msg)}`;
		},
		deserialize: (raw) => {
			const msg = raw.startsWith("s:") ? structuredCloneParse(raw.slice(2)) : JSON.parse(raw);
			if (msg.t === "q" && msg.i && msg.m) pendingRequestMethods.set(msg.i, msg.m);
			return msg;
		}
	};
}
function NOOP$1() {}
/** Split the next complete SSE frame (up to a blank line) off the buffer. */
function takeFrame(buffer) {
	const boundary = buffer.search(/\n\n|\r\n\r\n/);
	if (boundary < 0) return void 0;
	return {
		frame: buffer.slice(0, boundary),
		rest: buffer.slice(boundary + (buffer[boundary] === "\r" ? 4 : 2))
	};
}
/** Parse one SSE frame's lines into its event name and data lines. */
function parseFrame(frame) {
	let event = "message";
	const data = [];
	for (const rawLine of frame.split(/\r?\n/)) {
		if (rawLine.startsWith(":")) continue;
		if (rawLine.startsWith("event:")) event = rawLine.slice(6).trimStart();
		else if (rawLine.startsWith("data:")) data.push(rawLine.slice(5).replace(/^ /, ""));
	}
	return {
		event,
		data
	};
}
/**
* Build a birpc `ChannelOptions` object backed by an SSE stream (server →
* client) and HTTP `POST` (client → server): the WebSocket-free counterpart
* to `createWsRpcChannel`, wire-compatible with `attachSseRpcTransport`.
*
* The stream is consumed via `fetch` streaming (not `EventSource`), so it
* works in browsers and server runtimes alike. The server's first frame
* (`event: session`) carries the session id; every `POST` echoes it in the
* `x-birpc-session` header. A response to a client-initiated request comes
* back in the `POST`'s own body and is re-injected into the channel; a
* dropped stream terminates the channel; there is no reconnect, matching
* the WS channel's closed-is-done semantics.
*/
function createSseRpcChannel(options) {
	const { onConnected = NOOP$1, onError = NOOP$1, onDisconnected = NOOP$1, definitions, fetch: fetchImpl = globalThis.fetch.bind(globalThis) } = options;
	let url = options.url;
	if (options.authToken) url = `${url}${url.includes("?") ? "&" : "?"}${DEVFRAME_AUTH_TOKEN_QUERY_PARAM}=${encodeURIComponent(options.authToken)}`;
	const codec = createRpcWireCodec(definitions);
	const abort = new AbortController();
	let closed = false;
	let onMessage;
	let activeReader;
	let resolveSession;
	let rejectSession;
	const sessionReady = new Promise((resolve, reject) => {
		resolveSession = resolve;
		rejectSession = reject;
	});
	sessionReady.catch(() => {});
	function fail(error) {
		if (closed) return;
		closed = true;
		rejectSession(error);
		onError(error);
		onDisconnected();
	}
	function end() {
		if (closed) return;
		closed = true;
		rejectSession(/* @__PURE__ */ new Error("Devframe SSE stream closed"));
		onDisconnected();
	}
	function dispatch(event, data) {
		if (event === "session") {
			resolveSession(data);
			onConnected();
			return;
		}
		onMessage?.(data);
	}
	/** Parse the SSE byte stream frame by frame and dispatch each event. */
	async function consume(stream) {
		const reader = stream.getReader();
		activeReader = reader;
		const decoder = new TextDecoder();
		let buffer = "";
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			for (;;) {
				const taken = takeFrame(buffer);
				if (!taken) break;
				buffer = taken.rest;
				const { event, data } = parseFrame(taken.frame);
				if (data.length > 0) dispatch(event, data.join("\n"));
			}
		}
		end();
	}
	(async () => {
		try {
			const response = await fetchImpl(url, {
				headers: { accept: "text/event-stream" },
				signal: abort.signal
			});
			if (!response.ok || !response.body) throw new Error(`Devframe SSE stream request failed: ${response.status}`);
			await consume(response.body);
		} catch (error) {
			if (abort.signal.aborted) {
				end();
				return;
			}
			fail(error instanceof Error ? error : new Error(String(error)));
		}
	})();
	return {
		close: () => {
			closed = true;
			abort.abort();
			activeReader?.cancel().catch(() => {});
		},
		on: (handler) => {
			onMessage = handler;
		},
		post: async (data) => {
			let sessionId;
			try {
				sessionId = await sessionReady;
			} catch {
				return;
			}
			if (closed) {
				onError(/* @__PURE__ */ new Error("Devframe SSE channel is closed; message dropped"));
				return;
			}
			try {
				const response = await fetchImpl(url, {
					method: "POST",
					headers: {
						"content-type": "text/plain; charset=utf-8",
						[DEVFRAME_SSE_SESSION_HEADER]: sessionId
					},
					body: data
				});
				if (response.status === 200) {
					const body = await response.text();
					if (body) onMessage?.(body);
					return;
				}
				if (!response.ok) throw new Error(`Devframe SSE POST failed: ${response.status}`);
			} catch (error) {
				onError(error instanceof Error ? error : new Error(String(error)));
			}
		},
		serialize: codec.serialize,
		deserialize: codec.deserialize
	};
}
function createRpcClient(functions, options) {
	const { channel, rpcOptions = {} } = options;
	return createBirpc(functions, {
		...channel,
		timeout: -1,
		...rpcOptions,
		proxify: false
	});
}
/**
* The transport-independent half of a live RPC client mode (connection
* status, pending-call guarding, and the trust handshake), shared by the
* WebSocket and SSE modes. Each transport supplies only its channel.
*/
function createLiveRpcClientMode(options) {
	const { transport, authToken, connectionMeta, events, clientRpc, rpcOptions = {}, callTimeout = 0 } = options;
	let isTrusted = false;
	let status = "connecting";
	let connectionError = null;
	const trustedPromise = Promise.withResolvers();
	function setStatus(next, error = null) {
		if (error) connectionError = error;
		else if (next === "connected") connectionError = null;
		if (next === status) return;
		const previous = status;
		status = next;
		events.emit(DEVFRAME_EVENTS.client.connectionStatus, next, previous);
	}
	const pending = /* @__PURE__ */ new Set();
	function rejectAllPending(error) {
		for (const entry of [...pending]) entry.reject(error);
	}
	function terminalError() {
		if (status === "disconnected" || status === "error") return new DevframeConnectionError("connection", "[devframe] Not connected to the devframe server", { cause: connectionError ?? void 0 });
		if (status === "unauthorized") return new DevframeConnectionError("auth", "[devframe] Not authorized by the devframe server", { cause: connectionError ?? void 0 });
		return null;
	}
	/**
	* Wrap an in-flight call promise so it settles on server response, on an
	* optional wall-clock timeout, or when the connection drops, so it never hangs.
	*/
	function guardCall(promise, method) {
		return new Promise((resolve, reject) => {
			let settled = false;
			let timer;
			const entry = { reject(error) {
				if (settled) return;
				finish();
				events.emit(DEVFRAME_EVENTS.client.error, error, method);
				reject(error);
			} };
			function finish() {
				settled = true;
				pending.delete(entry);
				if (timer) clearTimeout(timer);
			}
			pending.add(entry);
			if (callTimeout > 0) timer = setTimeout(() => {
				entry.reject(new DevframeConnectionError("timeout", `[devframe] RPC call "${method}" timed out after ${callTimeout}ms`));
			}, callTimeout);
			promise.then((value) => {
				if (settled) return;
				finish();
				resolve(value);
			}, (error) => {
				if (settled) return;
				finish();
				const err = error instanceof Error ? error : new Error(String(error));
				events.emit(DEVFRAME_EVENTS.client.error, err, method);
				reject(err);
			});
		});
	}
	const definitions = /* @__PURE__ */ new Map();
	for (const name of connectionMeta.jsonSerializableMethods ?? []) definitions.set(name, { jsonSerializable: true });
	const channel = options.createChannel({
		definitions,
		onError(error) {
			setStatus("error", error);
			events.emit(DEVFRAME_EVENTS.client.connectionError, error);
			rejectAllPending(new DevframeConnectionError("connection", "[devframe] Connection to the devframe server failed", { cause: error }));
		},
		onDisconnected() {
			if (status !== "error") setStatus("disconnected");
			rejectAllPending(new DevframeConnectionError("connection", "[devframe] Disconnected from the devframe server", { cause: connectionError ?? void 0 }));
		}
	});
	const serverRpc = createRpcClient(clientRpc.functions, {
		channel,
		rpcOptions
	});
	clientRpc.register({
		name: DEVFRAME_EVENTS.broadcast.authRevoked,
		type: "event",
		handler: () => {
			isTrusted = false;
			const authError = new DevframeConnectionError("auth", "[devframe] The devframe server revoked this client's trust");
			setStatus("unauthorized", authError);
			events.emit(DEVFRAME_EVENTS.client.connectionError, authError);
			rejectAllPending(authError);
			events.emit(DEVFRAME_EVENTS.client.isTrustedUpdated, false);
		}
	});
	let currentAuthToken = authToken;
	async function requestTrustWithToken(token) {
		currentAuthToken = token;
		const result = await serverRpc.$call("anonymous:devframe:auth", {
			authToken: token,
			/**
			* Sent raw; the server parses it into a display label (see
			* `describeUA` in `node/auth/state.ts`) so `ua-parser-modern` stays
			* out of the browser bundle.
			*/
			ua: navigator.userAgent,
			origin: location.origin
		});
		isTrusted = result.isTrusted;
		if (isTrusted) {
			trustedPromise.resolve(true);
			setStatus("connected");
		} else {
			const authError = new DevframeConnectionError("auth", "[devframe] The devframe server refused this client's credentials");
			setStatus("unauthorized", authError);
			events.emit(DEVFRAME_EVENTS.client.connectionError, authError);
		}
		events.emit(DEVFRAME_EVENTS.client.isTrustedUpdated, isTrusted);
		return result.isTrusted;
	}
	async function requestTrustWithCode(code) {
		const token = (await serverRpc.$call("anonymous:devframe:auth:exchange", {
			code,
			ua: navigator.userAgent,
			origin: location.origin
		}))?.authToken ?? null;
		if (token) {
			currentAuthToken = token;
			isTrusted = true;
			trustedPromise.resolve(true);
			setStatus("connected");
			events.emit(DEVFRAME_EVENTS.client.isTrustedUpdated, true);
		}
		return token;
	}
	async function requestAuthCode(options = {}) {
		await serverRpc.$call("anonymous:devframe:auth:request-code", {
			ua: navigator.userAgent,
			origin: location.origin,
			...options.reissue ? { reissue: true } : {}
		});
	}
	async function requestTrust() {
		if (isTrusted) return true;
		return requestTrustWithToken(currentAuthToken ?? "");
	}
	async function ensureTrusted(timeout = 6e4) {
		if (isTrusted) trustedPromise.resolve(true);
		if (timeout <= 0) return trustedPromise.promise;
		let timer;
		try {
			await Promise.race([trustedPromise.promise, new Promise((_, reject) => {
				timer = setTimeout(() => {
					reject(/* @__PURE__ */ new Error("[devframe] Timeout waiting for rpc to be trusted"));
				}, timeout);
			})]);
			return isTrusted;
		} finally {
			clearTimeout(timer);
		}
	}
	return {
		transport,
		get isTrusted() {
			return isTrusted;
		},
		get status() {
			return status;
		},
		get connectionError() {
			return connectionError;
		},
		requestTrust,
		requestTrustWithToken,
		requestTrustWithCode,
		requestAuthCode,
		ensureTrusted,
		call: (...args) => {
			const method = String(args[0]);
			const failFast = terminalError();
			if (failFast) {
				events.emit(DEVFRAME_EVENTS.client.error, failFast, method);
				return Promise.reject(failFast);
			}
			return guardCall(serverRpc.$call(...args), method);
		},
		callEvent: (...args) => {
			const failFast = terminalError();
			if (failFast) {
				events.emit(DEVFRAME_EVENTS.client.error, failFast, String(args[0]));
				return;
			}
			return serverRpc.$callEvent(...args);
		},
		callOptional: (...args) => {
			const method = String(args[0]);
			const failFast = terminalError();
			if (failFast) {
				events.emit(DEVFRAME_EVENTS.client.error, failFast, method);
				return Promise.reject(failFast);
			}
			return guardCall(serverRpc.$callOptional(...args), method);
		},
		close: () => {
			channel.close();
		}
	};
}
/**
* Resolve a {@link ConnectionMeta.sse} descriptor into a concrete
* `http(s)://` URL, with the same proxy-safe rules as `resolveWsUrl`: the
* object / relative-path forms resolve against where `__connection.json`
* was loaded (the client trusts its own location, never a server-baked
* hostname), while an explicit `port`/`host` (or a full `http(s)://` URL
* string) opts into a cross-origin endpoint.
*/
function resolveSseUrl(sse, metaBaseUrl, loc) {
	const base = (() => {
		try {
			return new URL(metaBaseUrl, loc.href);
		} catch {
			return new URL(loc.href);
		}
	})();
	if (sse && typeof sse === "object") {
		if (sse.host != null || sse.port != null) {
			const host = sse.host ?? `${base.hostname}:${sse.port}`;
			return new URL(sse.path ?? "/", `${base.protocol}//${host}`).href;
		}
		return new URL(sse.path ?? "", base).href;
	}
	const str = sse ?? "";
	if (/^https?:\/\//i.test(str)) return str;
	return new URL(str, base).href;
}
/**
* The SSE-backed live client mode, picked by `connectDevframe` when the
* server advertises SSE as its primary transport (`backend: 'sse'`) or when
* the caller pins `transport: 'sse'`. Same status machine, call guarding,
* and trust handshake as the WebSocket mode, over `createSseRpcChannel`.
*/
function createSseRpcClientMode(options) {
	const { authToken, connectionMeta, metaBaseUrl, events, clientRpc, rpcOptions = {}, sseOptions = {}, callTimeout = 0 } = options;
	const url = resolveSseUrl(connectionMeta.sse, metaBaseUrl ?? "./", location);
	return createLiveRpcClientMode({
		transport: "sse",
		authToken,
		connectionMeta,
		events,
		clientRpc,
		rpcOptions,
		callTimeout,
		createChannel: (handlers) => createSseRpcChannel({
			url,
			authToken,
			definitions: handlers.definitions,
			...sseOptions,
			onConnected() {
				sseOptions.onConnected?.();
			},
			onError(error) {
				handlers.onError(error);
				sseOptions.onError?.(error);
			},
			onDisconnected() {
				handlers.onDisconnected();
				sseOptions.onDisconnected?.();
			}
		})
	});
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
function isStaticEntry(value) {
	return typeof value === "object" && value !== null && value.type === "static" && typeof value.path === "string";
}
function isQueryEntry(value) {
	return typeof value === "object" && value !== null && value.type === "query" && typeof value.records === "object" && value.records !== null;
}
function isRecord(value) {
	return typeof value === "object" && value !== null && ("output" in value || "error" in value);
}
function resolveRecordOutput(record) {
	if (record.error) throw reviveDumpError(record.error);
	return record.output;
}
function hasMeaningfulArgs(args) {
	return args.some((arg) => arg !== null && arg !== void 0);
}
function unwrapEnvelope(raw) {
	if (raw !== null && typeof raw === "object" && "serialization" in raw && "data" in raw) return raw.data;
	return raw;
}
function createStaticRpcCaller(manifest, fetchJson) {
	const staticCache = /* @__PURE__ */ new Map();
	const queryRecordCache = /* @__PURE__ */ new Map();
	function reviveIfStructuredClone(value, serialization) {
		if (serialization === "structured-clone" && Array.isArray(value)) return structuredCloneDeserialize(value);
		return value;
	}
	function decode(raw, serialization) {
		return reviveIfStructuredClone(unwrapEnvelope(raw), serialization);
	}
	async function loadStatic(entry) {
		if (!staticCache.has(entry.path)) staticCache.set(entry.path, fetchJson(entry.path).then((raw) => decode(raw, entry.serialization)));
		const data = await staticCache.get(entry.path);
		if (isRecord(data)) return resolveRecordOutput(data);
		return data;
	}
	async function loadQueryRecord(path, serialization) {
		if (!queryRecordCache.has(path)) queryRecordCache.set(path, fetchJson(path).then((raw) => decode(raw, serialization)));
		return await queryRecordCache.get(path);
	}
	async function call(functionName, args) {
		if (!(functionName in manifest)) throw new Error(`[devframe-rpc] Function "${functionName}" not found in dump store`);
		const entry = manifest[functionName];
		if (isStaticEntry(entry)) {
			if (hasMeaningfulArgs(args)) throw new Error(`[devframe-rpc] No dump match for "${functionName}" with args: ${JSON.stringify(args)}`);
			return await loadStatic(entry);
		}
		if (isQueryEntry(entry)) {
			const argsHash = hash(args);
			const recordPath = entry.records[argsHash];
			if (recordPath) return resolveRecordOutput(await loadQueryRecord(recordPath, entry.serialization));
			if (entry.fallback) return resolveRecordOutput(await loadQueryRecord(entry.fallback, entry.serialization));
			throw new Error(`[devframe-rpc] No dump match for "${functionName}" with args: ${JSON.stringify(args)}`);
		}
		if (!hasMeaningfulArgs(args)) return entry;
		throw new Error(`[devframe-rpc] No dump match for "${functionName}" with args: ${JSON.stringify(args)}`);
	}
	return {
		call: async (functionName, args) => await call(functionName, args),
		callOptional: async (functionName, args) => {
			if (!(functionName in manifest)) return void 0;
			return await call(functionName, args);
		},
		callEvent: async (_functionName, _args) => {}
	};
}
async function createStaticRpcClientMode(options) {
	const staticCaller = createStaticRpcCaller(await options.fetchJsonFromBases(DEVFRAME_RPC_DUMP_MANIFEST_FILENAME), options.fetchJsonFromBases);
	return {
		transport: "static",
		isTrusted: true,
		/**
		* A static backend has no live socket; every call is a local fetch, so it
		* is "connected" for its whole life.
		*/
		status: "connected",
		connectionError: null,
		requestTrust: async () => true,
		requestTrustWithToken: async () => true,
		/** Static backends are always trusted, so there's nothing to exchange. */
		requestTrustWithCode: async () => null,
		/** No server terminal to print a code in. */
		requestAuthCode: async () => {},
		ensureTrusted: async () => true,
		call: (...args) => staticCaller.call(args[0], args.slice(1)),
		callEvent: (...args) => staticCaller.callEvent(args[0], args.slice(1)),
		callOptional: (...args) => staticCaller.callOptional(args[0], args.slice(1)),
		/** No live socket to close; every call is a local fetch. */
		close: () => {}
	};
}
var STREAM_KEY_SEPARATOR = "";
function streamKey(channel, id) {
	return `${channel}${STREAM_KEY_SEPARATOR}${id}`;
}
/**
* Client-side streaming host. Mirrors `createRpcSharedStateClientHost`:
* registers the two `:chunk` / `:end` event handlers once, then per-stream
* state lives in a `Map<streamKey, StreamReader>`.
*/
function createRpcStreamingClientHost(rpc) {
	const readers = /* @__PURE__ */ new Map();
	const uploads = /* @__PURE__ */ new Map();
	rpc.client.register({
		name: DEVFRAME_EVENTS.broadcast.streamingChunk,
		type: "event",
		handler(channel, id, seq, chunk) {
			readers.get(streamKey(channel, id))?._push(seq, chunk);
		}
	});
	rpc.client.register({
		name: DEVFRAME_EVENTS.broadcast.streamingEnd,
		type: "event",
		handler(channel, id, error) {
			const key = streamKey(channel, id);
			const reader = readers.get(key);
			if (!reader) return;
			reader._end(error);
			readers.delete(key);
		}
	});
	rpc.client.register({
		name: DEVFRAME_EVENTS.broadcast.streamingUploadCancel,
		type: "event",
		handler(channel, id) {
			const key = streamKey(channel, id);
			const sink = uploads.get(key);
			if (!sink) return;
			sink.abort("server cancelled upload");
			uploads.delete(key);
		}
	});
	rpc.events.on(DEVFRAME_EVENTS.client.isTrustedUpdated, (isTrusted) => {
		if (!isTrusted) return;
		for (const [key, reader] of readers) {
			if (reader.cancelled || reader.done) continue;
			const sepIdx = key.indexOf(STREAM_KEY_SEPARATOR);
			if (sepIdx < 0) continue;
			const channel = key.slice(0, sepIdx);
			const id = key.slice(sepIdx + 1);
			rpc.callEvent("devframe:streaming:subscribe", channel, id, { afterSeq: reader.lastSeenSeq });
		}
	});
	function subscribe(channel, id, options = {}) {
		const key = streamKey(channel, id);
		const existing = readers.get(key);
		if (existing) return existing;
		const reader = createStreamReader({
			id,
			highWaterMark: options.highWaterMark,
			onOverflow(dropped) {
				console.warn(`[devframe] DF0029: Stream "${channel}#${id}" dropped ${dropped} chunk(s) after exceeding the client high-water mark.`);
			},
			onCancel() {
				rpc.callEvent("devframe:streaming:cancel", channel, id);
				readers.delete(key);
			}
		});
		readers.set(key, reader);
		if (rpc.isTrusted) rpc.callEvent("devframe:streaming:subscribe", channel, id, { afterSeq: 0 });
		else {
			const off = rpc.events.on(DEVFRAME_EVENTS.client.isTrustedUpdated, (trusted) => {
				if (trusted) {
					off();
					if (readers.has(key) && !reader.cancelled && !reader.done) rpc.callEvent("devframe:streaming:subscribe", channel, id, { afterSeq: reader.lastSeenSeq });
				}
			});
		}
		return reader;
	}
	function upload(channel, id) {
		const key = streamKey(channel, id);
		const existing = uploads.get(key);
		if (existing) return existing;
		const sink = createStreamSink({ id });
		sink.events.on("chunk", (seq, chunk) => {
			rpc.callEvent("devframe:streaming:upload-chunk", channel, id, seq, chunk);
		});
		sink.events.on("end", (error) => {
			rpc.callEvent("devframe:streaming:upload-end", channel, id, error);
			uploads.delete(key);
		});
		uploads.set(key, sink);
		return sink;
	}
	return {
		subscribe,
		upload
	};
}
function NOOP() {}
var EMPTY_DEFS = /* @__PURE__ */ new Map();
/**
* Build a birpc `ChannelOptions` object backed by a browser `WebSocket`.
* Pass the result straight to `createRpcClient`'s `channel` option.
*
* Also returns `close()`, closing the underlying socket, mirroring the server transport's
* existing `WsRpcTransport.close()`. `birpc`'s own `ChannelOptions` has no teardown of its own.
*/
function createWsRpcChannel(options) {
	let url = options.url;
	if (options.authToken) url = `${url}?${DEVFRAME_AUTH_TOKEN_QUERY_PARAM}=${encodeURIComponent(options.authToken)}`;
	const ws = new WebSocket(url);
	const { onConnected = NOOP, onError = NOOP, onDisconnected = NOOP, definitions = EMPTY_DEFS } = options;
	ws.addEventListener("open", (e) => {
		onConnected(e);
	});
	ws.addEventListener("error", (e) => {
		const _e = e instanceof Error ? e : new Error(e.type);
		onError(_e);
	});
	ws.addEventListener("close", (e) => {
		onDisconnected(e);
	});
	const codec = createRpcWireCodec(definitions);
	return {
		close: () => {
			ws.close();
		},
		on: (handler) => {
			ws.addEventListener("message", (e) => {
				handler(e.data);
			});
		},
		post: (data) => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(data);
				return;
			}
			if (ws.readyState === WebSocket.CONNECTING) {
				const onOpen = () => {
					cleanup();
					if (ws.readyState === WebSocket.OPEN) ws.send(data);
				};
				const onClose = () => cleanup();
				function cleanup() {
					ws.removeEventListener("open", onOpen);
					ws.removeEventListener("close", onClose);
				}
				ws.addEventListener("open", onOpen);
				ws.addEventListener("close", onClose);
				return;
			}
			onError(/* @__PURE__ */ new Error("Devframe WebSocket is not open; message dropped"));
		},
		serialize: codec.serialize,
		deserialize: codec.deserialize
	};
}
/**
* Resolve a {@link ConnectionMeta.websocket} descriptor into a concrete
* `ws(s)://` URL.
*
* The object / relative-path forms connect to the page's own origin (only the
* `http`→`ws` protocol swap is applied), resolving the path against where
* `__connection.json` was loaded. This is deliberately host-agnostic so the
* connection survives a reverse proxy that changes the domain or port, since the
* client trusts its own location, never a server-baked hostname. An explicit
* `port`/`host` (or a full `ws(s)://` URL string) opts into a cross-origin
* endpoint, e.g. a side-car server on its own port.
*/
function resolveWsUrl(websocket, metaBaseUrl, loc) {
	const base = (() => {
		try {
			return new URL(metaBaseUrl, loc.href);
		} catch {
			return new URL(loc.href);
		}
	})();
	const wsProtocol = base.protocol === "https:" ? "wss:" : "ws:";
	if (websocket && typeof websocket === "object") {
		if (websocket.host != null || websocket.port != null) {
			const host = websocket.host ?? `${base.hostname}:${websocket.port}`;
			const target = new URL(websocket.path ?? "/", `${wsProtocol}//${host}`);
			target.protocol = wsProtocol;
			return target.href;
		}
		const target = new URL(websocket.path ?? "", base);
		target.protocol = wsProtocol;
		return target.href;
	}
	if (typeof websocket === "number") return `${wsProtocol}//${base.hostname}:${websocket}`;
	const str = websocket ?? "";
	if (/^wss?:\/\//i.test(str)) return str;
	if (/^https?:\/\//i.test(str)) return withProtocol(str, /^https/i.test(str) ? "wss://" : "ws://");
	const target = new URL(str, base);
	target.protocol = wsProtocol;
	return target.href;
}
function createWsRpcClientMode(options) {
	const { authToken, connectionMeta, metaBaseUrl, events, clientRpc, rpcOptions = {}, wsOptions = {}, callTimeout = 0 } = options;
	const url = resolveWsUrl(connectionMeta.websocket, metaBaseUrl ?? "./", location);
	return createLiveRpcClientMode({
		transport: "websocket",
		authToken,
		connectionMeta,
		events,
		clientRpc,
		rpcOptions,
		callTimeout,
		createChannel: (handlers) => createWsRpcChannel({
			url,
			authToken,
			definitions: handlers.definitions,
			...wsOptions,
			onConnected(event) {
				wsOptions.onConnected?.(event);
			},
			onError(error) {
				handlers.onError(error);
				wsOptions.onError?.(error);
			},
			onDisconnected(event) {
				handlers.onDisconnected();
				wsOptions.onDisconnected?.(event);
			}
		})
	});
}
/** Whether a name is already namespaced (contains a `:` separator). */
function isQualifiedName(name) {
	return name.includes(":");
}
/**
* Prefix a bare name with `<namespace>:`. Names that already contain a
* `:` are returned unchanged, so callers can reference another scope's
* ids explicitly (e.g. `ctx.rpc.call('other-plugin:fn')`).
*/
function qualifyName(namespace, name) {
	return isQualifiedName(name) ? name : `${namespace}:${name}`;
}
/**
* The key-value store surface over a lazily-resolved shared state, shared by
* the node-side (file-backed) and client-side (RPC-mirrored) settings stores.
* Each side supplies its own `store()` resolver; the read/write/subscribe
* behavior on top of it is identical.
*/
function createSettingsStore(store) {
	return {
		async get(key) {
			return (await store()).value()[key];
		},
		async set(key, value) {
			(await store()).mutate((draft) => {
				draft[key] = value;
			});
		},
		async delete(key) {
			(await store()).mutate((draft) => {
				delete draft[key];
			});
		},
		async all() {
			return (await store()).value();
		},
		async onChange(fn) {
			return (await store()).on("updated", (full) => fn(full));
		}
	};
}
function createClientSettingsStore(rpc, namespace, scope) {
	const stateKey = `devframe:settings:${scope}:${namespace}`;
	let statePromise;
	function store() {
		if (!statePromise) statePromise = rpc.sharedState.get(stateKey, { initialValue: {} });
		return statePromise;
	}
	return createSettingsStore(store);
}
/**
* Build the client-side `settings` surface for a scope namespace. Mirrors
* the node-side stores over the shared-state sync protocol.
*/
function createClientSettings(rpc, namespace) {
	return {
		global: createClientSettingsStore(rpc, namespace, "global"),
		project: createClientSettingsStore(rpc, namespace, "project")
	};
}
/**
* Build a namespace-scoped view of a {@link DevframeRpcClient}. Every RPC
* id, shared-state key, and streaming channel passed through the returned
* `rpc` surface is auto-namespaced with `<namespace>:`.
*/
function createScopedClientContext(rpc, namespace) {
	return {
		namespace,
		base: rpc,
		rpc: {
			namespace,
			register(fn) {
				if (isQualifiedName(fn.name)) throw new Error(`[devframe] Scoped client RPC registration for namespace "${namespace}" received an already-namespaced function name "${fn.name}". Pass a bare name without a ":" separator.`);
				rpc.client.register({
					...fn,
					name: `${namespace}:${fn.name}`
				});
			},
			call: ((method, ...args) => rpc.call(qualifyName(namespace, method), ...args)),
			callEvent: ((method, ...args) => rpc.callEvent(qualifyName(namespace, method), ...args)),
			callOptional: ((method, ...args) => rpc.callOptional(qualifyName(namespace, method), ...args)),
			sharedState: ((key, options) => rpc.sharedState.get(qualifyName(namespace, key), options)),
			streaming: {
				subscribe: (channel, id, options) => rpc.streaming.subscribe(qualifyName(namespace, channel), id, options),
				upload: (channel, id) => rpc.streaming.upload(qualifyName(namespace, channel), id)
			}
		},
		settings: createClientSettings(rpc, namespace),
		scope: rpc.scope
	};
}
/**
* The page's WebMCP model context, when the browser (or a polyfill)
* provides one. Checks `document.modelContext` (current draft) first,
* then `navigator.modelContext` (earlier drafts and polyfills).
*/
function resolveWebMcpModelContext() {
	if (typeof document !== "undefined") {
		const context = document.modelContext;
		if (context) return context;
	}
	if (typeof navigator !== "undefined") {
		const context = navigator.modelContext;
		if (context) return context;
	}
}
/**
* Mirror the `agent`-flagged RPC functions of a browser-side collector
* (`rpc.client`) onto the page's WebMCP model context as callable tools,
* using the same `agent` signature, wire names, and `arg0`/`arg1`/… input
* schema as the node-side MCP adapter. Functions without an `agent` field
* stay unexposed (default-deny), and the tool set follows later
* `register`/`update` calls. Returns a dispose that unregisters every tool.
*/
function registerWebMcpTools(clientRpc, options = {}) {
	const resolved = options.modelContext ?? resolveWebMcpModelContext();
	if (!resolved) return () => {};
	const modelContext = resolved;
	/** Unregister callbacks keyed by definition name. */
	const registered = /* @__PURE__ */ new Map();
	/** Wire name → definition name, to detect sanitization collisions. */
	const wireNames = /* @__PURE__ */ new Map();
	function register(def, agent) {
		const name = toAgentToolName(def.name);
		const owner = wireNames.get(name);
		if (owner && owner !== def.name) {
			console.warn(`[devframe] WebMCP tool name "${name}" (from "${def.name}") collides with "${owner}"; keeping the first registration.`);
			return;
		}
		const controller = new AbortController();
		const safety = resolveAgentSafety(def.type, agent);
		const result = modelContext.registerTool({
			name,
			description: agent.description,
			inputSchema: argsToJsonSchema(def.args),
			annotations: {
				title: agent.title ?? def.name,
				readOnlyHint: safety === "read",
				destructiveHint: safety === "destructive"
			},
			execute: (args) => executeRpcTool(def, clientRpc.context, args)
		}, { signal: controller.signal });
		if (result && "then" in result) result.then(() => {}, () => {});
		wireNames.set(name, def.name);
		registered.set(def.name, () => {
			controller.abort();
			if (result && "unregister" in result && typeof result.unregister === "function") result.unregister();
			wireNames.delete(name);
		});
	}
	function sync(id) {
		const names = id ? [id] : [...clientRpc.definitions.keys()];
		for (const name of names) {
			registered.get(name)?.();
			registered.delete(name);
			const def = clientRpc.definitions.get(name);
			const agent = def?.agent;
			if (def && agent) register(def, agent);
		}
	}
	sync();
	const unsubscribe = clientRpc.onChanged((id) => sync(id));
	return () => {
		unsubscribe();
		for (const unregister of registered.values()) unregister();
		registered.clear();
	};
}
async function executeRpcTool(def, context, args) {
	try {
		const positional = toolInputToRpcArgs(args, def.args?.length);
		return { content: [{
			type: "text",
			text: stringifyResult(await (await getRpcHandler(def, context))(...positional))
		}] };
	} catch (error) {
		return {
			isError: true,
			content: [{
				type: "text",
				text: formatError(error)
			}]
		};
	}
}
/**
* Agent-exposed functions are strict-JSON by contract (`jsonSerializable:
* true` is enforced at registration), so plain `JSON.stringify` suffices.
*/
function stringifyResult(value) {
	if (value === void 0) return "undefined";
	if (typeof value === "string") return value;
	return JSON.stringify(value, null, 2);
}
function formatError(error) {
	if (!(error instanceof Error)) return String(error);
	const cause = error.cause instanceof Error ? ` (cause: ${error.cause.message})` : "";
	return `${error.name}: ${error.message}${cause}`;
}
/**
* Resolve the requested `transport` option against what the server
* advertises. `'auto'` trusts the advertisement: the server's declared
* primary (`backend`), preferring the WebSocket when both endpoints are
* present; an explicit `'websocket'` / `'sse'` pins that transport and
* throws when the server doesn't advertise it.
*/
function resolveClientTransport(requested, meta) {
	if (meta.backend === "static") return "static";
	const hasWebsocket = meta.websocket !== void 0;
	const hasSse = meta.sse !== void 0;
	if (requested === "websocket") {
		if (!hasWebsocket) throw new Error("[devframe] transport: 'websocket' was requested, but this server does not advertise a WebSocket endpoint");
		return "websocket";
	}
	if (requested === "sse") {
		if (!hasSse) throw new Error("[devframe] transport: 'sse' was requested, but this server does not advertise an SSE endpoint");
		return "sse";
	}
	if (meta.backend === "sse" && hasSse) return "sse";
	if (hasWebsocket) return "websocket";
	if (hasSse) return "sse";
	throw new Error("[devframe] This server advertises no RPC transport (backend \"none\"), so there is nothing to connect to. Enable the WebSocket or SSE endpoint on the server, or use its static/MCP surfaces instead.");
}
async function getDevframeRpcClient(options = {}) {
	const { baseURL = "./", rpcOptions = {}, cacheOptions = false } = options;
	const events = createEventEmitter();
	const bases = Array.isArray(baseURL) ? baseURL : [baseURL];
	let connection = await setupDevframeConnection(options);
	const { connectionMeta, metaBaseUrl, authToken } = connection;
	let resolvedBaseURL = bases[0] ?? "./";
	try {
		resolvedBaseURL = new URL(".", metaBaseUrl).href;
	} catch {}
	const cacheManager = new RpcCacheManager({
		functions: [],
		...typeof options.cacheOptions === "object" ? options.cacheOptions : {}
	});
	const context = { rpc: void 0 };
	const clientRpc = new RpcFunctionsCollectorBase(context);
	const disposeWebMcp = options.webmcp === false ? void 0 : registerWebMcpTools(clientRpc);
	let disposeBrowserAgentBridge;
	let closed = false;
	async function fetchJsonFromBases(path) {
		const candidates = [resolvedBaseURL, ...bases.filter((base) => base !== resolvedBaseURL)].filter((x) => x != null);
		const errors = [];
		for (const base of candidates) try {
			return await fetch(withBase(path, base)).then((r) => {
				if (!r.ok) throw new Error(`Failed to fetch ${path} from ${base}: ${r.status}`);
				return r.json();
			});
		} catch (error) {
			errors.push(error);
		}
		throw new Error(`Failed to load ${path} from ${candidates.join(", ")}`, { cause: errors });
	}
	const liveModeOptions = {
		authToken,
		connectionMeta,
		metaBaseUrl,
		events,
		clientRpc,
		callTimeout: options.callTimeout,
		rpcOptions: {
			...rpcOptions,
			async onRequest(req, next, resolve) {
				await rpcOptions.onRequest?.call(this, req, next, resolve);
				if (cacheOptions && cacheManager?.validate(req.m)) {
					if (cacheManager.has(req.m, req.a)) return resolve(cacheManager.cached(req.m, req.a));
					const res = await next(req);
					cacheManager.apply(req, res);
				} else await next(req);
			}
		}
	};
	const transport = resolveClientTransport(options.transport ?? "auto", connectionMeta);
	const mode = transport === "static" ? await createStaticRpcClientMode({ fetchJsonFromBases }) : transport === "sse" ? createSseRpcClientMode({
		...liveModeOptions,
		sseOptions: options.sseOptions
	}) : createWsRpcClientMode({
		...liveModeOptions,
		wsOptions: options.wsOptions
	});
	let authChannel;
	try {
		authChannel = new BroadcastChannel("devframe-auth");
	} catch {}
	let bootstrapAuthPromise;
	let bootstrapAuthSettled = false;
	function gateOnBootstrapAuth(fn) {
		return ((...args) => {
			if (bootstrapAuthSettled || !bootstrapAuthPromise) return fn(...args);
			return bootstrapAuthPromise.then(() => fn(...args));
		});
	}
	/** Release authentication and transport resources even if another disposer fails. */
	function closeRpcClient() {
		closed = true;
		try {
			disposeBrowserAgentBridge?.();
			disposeWebMcp?.();
		} finally {
			try {
				authChannel?.close();
			} finally {
				mode.close?.();
			}
		}
	}
	const rpc = {
		events,
		get isTrusted() {
			return mode.isTrusted;
		},
		get status() {
			return mode.status;
		},
		get connectionError() {
			return mode.connectionError;
		},
		get transport() {
			return mode.transport ?? transport;
		},
		get connection() {
			return connection;
		},
		connectionMeta,
		ensureTrusted: mode.ensureTrusted,
		requestTrust: mode.requestTrust,
		requestTrustWithToken: async (token) => {
			storeAuthToken(token);
			connection = {
				...connection,
				authToken: token
			};
			return mode.requestTrustWithToken(token);
		},
		requestTrustWithCode: async (code) => {
			const token = await mode.requestTrustWithCode(code);
			if (!token) return false;
			storeAuthToken(token);
			connection = {
				...connection,
				authToken: token
			};
			try {
				authChannel?.postMessage({
					type: "auth-update",
					authToken: token
				});
			} catch {}
			return true;
		},
		requestAuthCode: (options) => mode.requestAuthCode(options),
		call: gateOnBootstrapAuth(mode.call),
		callEvent: gateOnBootstrapAuth(mode.callEvent),
		callOptional: gateOnBootstrapAuth(mode.callOptional),
		client: clientRpc,
		sharedState: void 0,
		services: void 0,
		streaming: void 0,
		cacheManager,
		scope: void 0,
		close: closeRpcClient
	};
	rpc.sharedState = createRpcSharedStateClientHost(rpc);
	rpc.streaming = createRpcStreamingClientHost(rpc);
	rpc.services = createDevframeServicesClient(rpc);
	const scopedCache = /* @__PURE__ */ new Map();
	rpc.scope = ((namespace) => {
		if (!namespace) return rpc;
		let scoped = scopedCache.get(namespace);
		if (!scoped) {
			scoped = createScopedClientContext(rpc, namespace);
			scopedCache.set(namespace, scoped);
		}
		return scoped;
	});
	context.rpc = rpc;
	function isTopLevelUnframed() {
		try {
			return typeof window !== "undefined" && window.self === window.top;
		} catch {
			return false;
		}
	}
	async function runSimpleAuthPrompt() {
		if (options.simpleAuth === false || !isTopLevelUnframed()) return;
		if (typeof globalThis.prompt !== "function") return;
		await rpc.requestAuthCode().catch(() => {});
		while (!rpc.isTrusted) {
			const code = globalThis.prompt("devframe: enter the authentication code shown in your terminal");
			if (code == null) return;
			const trimmed = code.trim();
			if (!trimmed) continue;
			if (await rpc.requestTrustWithCode(trimmed)) return;
		}
	}
	async function bootstrapAuth() {
		const trusted = await mode.requestTrust();
		const otpParam = options.otpParam ?? "devframe_otp";
		const viaOtp = otpParam ? await authenticateWithUrlOtp(rpc, { param: otpParam }) : false;
		if (trusted || viaOtp || rpc.isTrusted) return;
		await runSimpleAuthPrompt();
	}
	bootstrapAuthPromise = bootstrapAuth().then(() => {
		bootstrapAuthSettled = true;
	}, () => {
		bootstrapAuthSettled = true;
	});
	if (connectionMeta.mcp) __vitePreload(async () => {
		const { setupBrowserAgentRpcBridge } = await import("./browser-agent-rpc-BXhoSh1z-DpDtaiol.js");
		return { setupBrowserAgentRpcBridge };
	}, __vite__mapDeps([0,1]), import.meta.url).then(({ setupBrowserAgentRpcBridge }) => {
		if (!closed) disposeBrowserAgentBridge = setupBrowserAgentRpcBridge(rpc);
	}).catch(() => {});
	if (authChannel) authChannel.onmessage = (event) => {
		if (event.data?.type === "auth-update" && event.data.authToken) rpc.requestTrustWithToken(event.data.authToken);
	};
	return rpc;
}
//#endregion
//#region node_modules/.pnpm/@vitejs+devtools-kit@0.7.6_@devframes+agentic@1.2.3_cac@7.0.0_crossws@0.4.15_srvx@1.0.5__srvx@1.0.5_vite@8.3.4/node_modules/@vitejs/devtools-kit/dist/client.js
/**
* The Vite DevTools flavour of devframe's {@link getDevframeRpcClient}. Kept as
* a dedicated export for naming symmetry with the kit's other `DevTools*`
* primitives.
*
* Vite DevTools mounts each devframe (Terminals, the Inspector, …) as a
* same-origin iframe at its own base (e.g. `/__devframes-plugin-terminals/`).
* Cross-base connection-meta inheritance — a child iframe reusing the parent's
* `__connection.json` without dialing its own base's (wrong) endpoint — is
* handled natively by devframe's client via `ConnectionMeta.baseUrl` since
* devframe 0.7.2 (devframes/devframe#98), so no extra rewriting is needed here.
*
* Vite DevTools provides its own interactive authorization view, so disable
* devframe's native browser-prompt fallback for every kit-managed connection.
*/
function getDevToolsRpcClient(options = {}) {
	return getDevframeRpcClient({
		...options,
		simpleAuth: false
	});
}
//#endregion
//#region node_modules/.pnpm/@vitejs+devtools-kit@0.7.6_@devframes+agentic@1.2.3_cac@7.0.0_crossws@0.4.15_srvx@1.0.5__srvx@1.0.5_vite@8.3.4/node_modules/@vitejs/devtools-kit/dist/constants.js
var DEVTOOLS_MOUNT_PATH = "/__devtools/";
`${DEVTOOLS_MOUNT_PATH}`;
//#endregion
//#region src/client/logic/rpc.ts
var onModuleUpdated = createEventHook();
var client = await getDevToolsRpcClient({ baseURL: DEVTOOLS_MOUNT_PATH });
var isStaticMode = client.connectionMeta.backend === "static";
client.client.register({
	name: "vite-plugin-inspect:on-module-updated",
	type: "action",
	handler: () => {
		onModuleUpdated.trigger();
	}
});
var rpc = client;
//#endregion
//#region src/client/stores/payload.ts
var usePayloadStore = defineStore("payload", () => {
	const isLoading = ref(false);
	const metadata = shallowRef({ instances: [] });
	const query = useLocalStorage("vite-inspect-v1-query", {
		vite: "",
		env: ""
	}, { mergeDefaults: true });
	const modules = shallowRef([]);
	const queryCache = /* @__PURE__ */ new Map();
	async function init() {
		metadata.value = await rpc.call("vite-plugin-inspect:get-metadata");
		if (!metadata.value.instances.some((i) => i.vite === query.value.vite)) query.value.vite = metadata.value.instances[0].vite;
		if (!metadata.value.instances.some((i) => i.vite === query.value.vite && i.environments.includes(query.value.env))) {
			const instance = metadata.value.instances.find((i) => i.vite === query.value.vite);
			if (instance) query.value.env = instance.environments[0] || "client";
			else query.value.env = metadata.value.instances[0].environments[0] || "client";
		}
		await doQuery();
		watch(query, async () => {
			await doQuery();
		}, { deep: true });
		onModuleUpdated.on(() => refetch());
	}
	async function doQuery() {
		const key = `${query.value.vite}-${query.value.env}`;
		if (!queryCache.has(key)) queryCache.set(key, rpc.call("vite-plugin-inspect:get-modules-list", query.value));
		isLoading.value = true;
		modules.value = [];
		try {
			modules.value = Object.freeze(await queryCache.get(key));
		} finally {
			isLoading.value = false;
		}
	}
	async function refetch(force = false) {
		queryCache.clear();
		if (force) metadata.value = await rpc.call("vite-plugin-inspect:get-metadata");
		await doQuery();
	}
	const instance = computed(() => metadata.value.instances.find((i) => i.vite === query.value.vite));
	return {
		init,
		metadata,
		query,
		modules,
		instance,
		root: computed(() => instance.value.root),
		isLoading,
		refetch
	};
});
//#endregion
export { onKeyDown as a, useVirtualList as c, __vitePreload as d, createPinia as f, rpc as i, tryOnScopeDispose as l, isStaticMode as n, useDark as o, defineStore as p, onModuleUpdated as r, useLocalStorage as s, usePayloadStore as t, useToggle as u };
