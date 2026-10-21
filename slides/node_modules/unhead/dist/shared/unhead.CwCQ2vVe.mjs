import { h as hasOwn } from './unhead.Bf_fPVYA.mjs';
import { a as callHook } from './unhead.Bm4Y6XQI.mjs';

function NOOP() {
}
function replayRecordings(target, stack) {
  stack.forEach((recordings) => {
    let context = target;
    let prevContext = target;
    recordings.forEach(({ type, key, args }) => {
      if (type === "get") {
        prevContext = context;
        context = context[key];
      } else if (type === "apply") {
        context = context.call(prevContext, ...args);
      }
    });
  });
}
function walk(root, path) {
  let owner;
  let value = root;
  for (const key of path) {
    if (value == null) {
      return { owner: void 0, value: void 0 };
    }
    owner = value;
    value = value[key];
  }
  return { owner, value };
}
function createScriptProxy(initial = {}) {
  const stack = [];
  let instance;
  let stackIdx = -1;
  function node(path) {
    const children = /* @__PURE__ */ new Map();
    return new Proxy(NOOP, {
      get(_, prop) {
        if (instance) {
          const { value } = walk(instance, path);
          const v = value == null ? void 0 : Reflect.get(value, prop, value);
          if (typeof v !== "function") {
            return v;
          }
        } else if (!path.length) {
          const v = Reflect.get(initial, prop);
          if (typeof v !== "undefined") {
            return v;
          }
          stackIdx++;
          stack[stackIdx] = [];
          stack[stackIdx].push({ type: "get", key: prop });
        } else {
          stack[stackIdx].push({ type: "get", key: prop });
        }
        let child = children.get(prop);
        if (!child) {
          child = node([...path, prop]);
          children.set(prop, child);
        }
        return child;
      },
      apply(_, __, args) {
        if (instance) {
          const { owner, value } = walk(instance, path);
          if (typeof value === "function") {
            Reflect.apply(value, owner, args);
          }
        } else {
          stack[stackIdx].push({ type: "apply", key: "", args });
        }
        return void 0;
      }
    });
  }
  return {
    proxy: node([]),
    stack,
    resolve(api) {
      instance = api;
      replayRecordings(api, stack);
      stack.length = 0;
    }
  };
}

function createScriptScope(script) {
  const controller = new AbortController();
  const disposers = /* @__PURE__ */ new Set();
  let disposed = false;
  const track = (dispose2) => {
    const trackedDispose = () => {
      if (disposers.delete(trackedDispose))
        dispose2();
    };
    if (disposed)
      dispose2();
    else
      disposers.add(trackedDispose);
    return trackedDispose;
  };
  const dispose = () => {
    if (disposed)
      return;
    disposed = true;
    controller.abort();
    let firstError;
    for (const off of [...disposers].reverse()) {
      try {
        off();
      } catch (error) {
        firstError ||= error;
      }
    }
    if (firstError)
      queueMicrotask(() => {
        throw firstError;
      });
  };
  const onScriptAbort = () => {
    controller.abort(script.signal.reason);
    queueMicrotask(() => queueMicrotask(dispose));
  };
  if (script.signal.aborted) {
    onScriptAbort();
  } else {
    script.signal.addEventListener("abort", onScriptAbort, { once: true });
    track(() => script.signal.removeEventListener("abort", onScriptAbort));
  }
  return Object.assign(Object.create(script), {
    script,
    signal: controller.signal,
    dispose,
    setupTriggerHandler(trigger) {
      if (disposed)
        return () => {
        };
      try {
        return track(script._setupTriggerHandler(trigger, false));
      } catch (error) {
        dispose();
        throw error;
      }
    },
    onLoaded(fn, options) {
      return disposed ? () => {
      } : track(script.onLoaded(fn, options));
    },
    onError(fn, options) {
      return disposed ? () => {
      } : track(script.onError(fn, options));
    }
  });
}

function createScriptWaitFor(signal) {
  return ((setup) => new Promise((outerResolve, outerReject) => {
    let settled = false;
    let resolving = false;
    let resolution;
    let cleanup;
    let onAbort;
    const finish = (settle, value) => {
      if (settled)
        return;
      settled = true;
      signal.removeEventListener("abort", onAbort);
      const currentCleanup = cleanup;
      cleanup = void 0;
      try {
        currentCleanup?.();
      } catch (error) {
        outerReject(error);
        return;
      }
      settle(value);
    };
    const reject = (reason) => queueMicrotask(() => finish(outerReject, reason));
    const resolve = (value) => {
      resolution = value;
      if (!settled && !resolving) {
        resolving = true;
        Promise.resolve(value).then(
          (resolved) => finish(outerResolve, resolved),
          reject
        );
      }
      return value;
    };
    onAbort = () => {
      const error = new Error("Script lifecycle aborted");
      error.name = "AbortError";
      reject(typeof signal.reason === "undefined" ? error : signal.reason);
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    try {
      const result = setup(resolve, reject);
      cleanup = result !== resolution && typeof result === "function" ? result : void 0;
    } catch (error) {
      reject(error);
    }
  }));
}

function noop() {
}
function tryParseUrl(src, base) {
  try {
    return new URL(src, base);
  } catch {
    return void 0;
  }
}
function parseHttpOrigin(src, baseURI) {
  const absoluteUrl = tryParseUrl(src);
  if (absoluteUrl) {
    if (absoluteUrl.protocol !== "http:" && absoluteUrl.protocol !== "https:")
      return;
    const resolvedUrl = tryParseUrl(src, `${absoluteUrl.protocol}//${absoluteUrl.hostname === "a" ? "b" : "a"}`);
    if (resolvedUrl?.origin === absoluteUrl.origin)
      return absoluteUrl.origin;
    return baseURI && !baseURI.startsWith(absoluteUrl.protocol) ? absoluteUrl.origin : void 0;
  }
  const httpUrl = tryParseUrl(src, "http://a");
  const httpsUrl = tryParseUrl(src, "https://b");
  if (!httpUrl || !httpsUrl)
    return;
  return httpUrl.hostname === httpsUrl.hostname ? `//${httpUrl.port ? httpUrl.host : httpsUrl.host}` : void 0;
}
function useScript(head, _input, _options) {
  return _useScript(head, _input, _options, !!_options?.scope);
}
function _useScript(head, _input, _options, scoped) {
  const loaderInput = typeof _input === "object" && "loader" in _input ? _input : void 0;
  const loader = loaderInput?.loader;
  const input = typeof _input === "string" ? { src: _input } : loaderInput ? { key: loaderInput.key } : { ..._input };
  const {
    beforeInit,
    eventContext: _eventContext,
    resolve: optionResolve,
    scope: _scope,
    trigger,
    use,
    warmupStrategy: _warmupStrategy,
    ...entryOptions
  } = _options || {};
  const resolveApi = loader || optionResolve;
  const id = input.key || input.src || (typeof input.innerHTML === "string" ? input.innerHTML : "");
  const scripts = head._scripts || (head._scripts = /* @__PURE__ */ Object.create(null));
  const prevScript = hasOwn(scripts, id) ? scripts[id] : void 0;
  if (prevScript) {
    const result2 = scoped ? createScriptScope(prevScript) : prevScript;
    if (scoped)
      result2.setupTriggerHandler(trigger);
    else
      prevScript._setupTriggerHandler(trigger, false);
    return result2;
  }
  const parsedOrigin = input.src ? parseHttpOrigin(input.src, head.resolvedOptions.document?.baseURI) : void 0;
  if (parsedOrigin && input.crossorigin === void 0)
    input.crossorigin = "anonymous";
  if (parsedOrigin && input.referrerpolicy === void 0)
    input.referrerpolicy = "no-referrer";
  const lifecycleController = new AbortController();
  const useContext = {
    signal: lifecycleController.signal,
    waitFor: createScriptWaitFor(lifecycleController.signal)
  };
  const resolveUse = () => resolveApi ? resolveApi(useContext) : use?.();
  beforeInit?.();
  let initialUseResult;
  let initialUseError;
  let initialUseFailed = false;
  try {
    initialUseResult = !head.ssr && !loader && (resolveApi || use) ? resolveUse() : void 0;
  } catch (error) {
    initialUseFailed = true;
    initialUseError = error;
  }
  const initialUseIsAsync = !!initialUseResult && typeof initialUseResult.then === "function";
  const initialInstance = initialUseIsAsync ? null : initialUseResult || null;
  const initialUseOutcome = initialUseFailed ? Promise.resolve([false, initialUseError]) : initialUseIsAsync ? Promise.resolve(initialUseResult).then(
    (api) => [true, api],
    (error) => [false, error]
  ) : void 0;
  const _events = [];
  let loadError;
  let resolveLoad = noop;
  const loadPromise = new Promise((resolve) => {
    if (!head.ssr)
      resolveLoad = resolve;
  });
  const syncStatus = (s) => {
    script.status = s;
    _events.push({ type: s, timestamp: Date.now() });
    callHook(head, "script:updated", hookCtx);
  };
  const failReadiness = (reason) => {
    loadError = reason instanceof Error ? reason : new Error(String(reason));
    lifecycleController.abort(loadError);
    syncStatus("error");
    resolveLoad(false);
  };
  const emitLoaded = (api) => queueMicrotask(() => {
    resolveLoad(lifecycleController.signal.aborted || script.status === "removed" ? false : api);
  });
  let resolvingApi = false;
  const resolveLoaded = () => {
    if (resolvingApi)
      return;
    resolvingApi = true;
    if (!resolveApi && !use) {
      emitLoaded({});
      return;
    }
    const outcome = initialUseOutcome || (() => {
      try {
        return Promise.resolve(resolveUse()).then(
          (api) => [true, api],
          (error) => [false, error]
        );
      } catch (error) {
        return Promise.resolve([false, error]);
      }
    })();
    void outcome.then((result2) => {
      if (lifecycleController.signal.aborted || script.status === "removed")
        return;
      if (!result2[0]) {
        failReadiness(result2[1]);
      } else if (result2[1]) {
        if (loader)
          syncStatus("loaded");
        emitLoaded(result2[1]);
      } else {
        failReadiness(new Error(`${loader ? "loader" : "use"}() resolved without a script API`));
      }
    });
  };
  let onload = typeof input.onload === "function" ? input.onload.bind(_eventContext) : null;
  let onerror = typeof input.onerror === "function" ? input.onerror.bind(_eventContext) : null;
  const releaseEventHandlers = () => {
    onload = null;
    onerror = null;
  };
  input.onload = (e) => {
    if (lifecycleController.signal.aborted)
      return;
    try {
      syncStatus("loaded");
      resolveLoaded();
      onload?.(e);
    } finally {
      releaseEventHandlers();
    }
  };
  input.onerror = (e) => {
    if (lifecycleController.signal.aborted)
      return;
    try {
      lifecycleController.abort();
      syncStatus("error");
      resolveLoad(false);
      onerror?.(e);
    } finally {
      releaseEventHandlers();
    }
  };
  const _cbs = { loaded: [], error: [] };
  const _uniqueCbs = /* @__PURE__ */ new Set();
  const callCbs = (cbs, value) => cbs?.forEach((cb) => {
    try {
      void Promise.resolve(cb(value)).catch((error) => console.error(error));
    } catch (error) {
      console.error(error);
    }
  });
  const _registerCb = (key, cb, options) => {
    if (head.ssr) {
      return noop;
    }
    let uniqueKey;
    if (options?.key) {
      uniqueKey = `${key}:${options.key}`;
      if (_uniqueCbs.has(uniqueKey)) {
        return noop;
      }
      _uniqueCbs.add(uniqueKey);
    }
    if (_cbs[key]) {
      _cbs[key].push(cb);
      return () => {
        const idx = _cbs[key]?.indexOf(cb) ?? -1;
        if (idx !== -1)
          _cbs[key]?.splice(idx, 1);
        if (uniqueKey)
          _uniqueCbs.delete(uniqueKey);
      };
    }
    if (key === "loaded" && script.status === "loaded")
      cb(script.instance);
    else if (key === "error" && script.status === "error")
      cb(loadError);
    return () => {
      if (uniqueKey)
        _uniqueCbs.delete(uniqueKey);
    };
  };
  const script = {
    _loadPromise: loadPromise,
    _events,
    _warmupStrategy: void 0,
    instance: initialInstance,
    proxy: null,
    id,
    signal: lifecycleController.signal,
    src: input.src,
    input,
    status: "awaitingLoad",
    remove() {
      const hadEntry = !!script.entry;
      lifecycleController.abort();
      releaseEventHandlers();
      script._triggerAbortControllers?.forEach((ac) => ac.abort());
      script._triggerAbortControllers?.clear();
      script._triggerPromises = [];
      script._warmupEl?.dispose();
      script._warmupEl = void 0;
      if (script.entry) {
        script.entry.dispose();
        script.entry = void 0;
      }
      if (scripts[id] === script)
        delete scripts[id];
      if (script.status !== "removed")
        syncStatus("removed");
      resolveLoad(false);
      return hadEntry;
    },
    warmup(rel) {
      const { src } = input;
      if (!src)
        return;
      const isPreconnect = rel === "preconnect" || rel === "dns-prefetch";
      let href = src;
      if (!rel || isPreconnect && !parsedOrigin) {
        return;
      }
      if (isPreconnect)
        href = parsedOrigin;
      const link = {
        href,
        rel,
        crossorigin: input.crossorigin,
        referrerpolicy: input.referrerpolicy,
        fetchpriority: typeof input.fetchpriority !== "undefined" ? input.fetchpriority : "low",
        integrity: input.integrity,
        as: rel === "preload" ? "script" : void 0
      };
      script._warmupEl = head.push({ link: [link] }, { head, tagPriority: "high" });
      return script._warmupEl;
    },
    load(cb) {
      if (script.status === "removed")
        return loadPromise;
      script._triggerAbortControllers?.forEach((ac) => ac.abort());
      script._triggerAbortControllers?.clear();
      script._triggerPromises = [];
      if (loader && !head.ssr && script.status === "awaitingLoad") {
        syncStatus("loading");
        resolveLoaded();
      } else if (!loader && !script.entry) {
        syncStatus("loading");
        const defaults = {
          defer: true,
          fetchpriority: "low"
        };
        script.entry = head.push({
          script: [{ ...defaults, ...input }]
        }, entryOptions);
      }
      if (cb)
        _registerCb("loaded", cb);
      return loadPromise;
    },
    onLoaded(cb, options) {
      return _registerCb("loaded", cb, options);
    },
    onError(cb, options) {
      return _registerCb("error", cb, options);
    },
    setupTriggerHandler(trigger2) {
      return script._setupTriggerHandler(trigger2);
    },
    _setupTriggerHandler(trigger2, removeOnError = true) {
      if (script.status !== "awaitingLoad") {
        return noop;
      }
      if ((typeof trigger2 === "undefined" || trigger2 === "client") && !head.ssr || trigger2 === "server") {
        script.load();
        return noop;
      } else if (trigger2 instanceof Promise) {
        if (head.ssr) {
          return noop;
        }
        const abortController = new AbortController();
        script._triggerAbortControllers = script._triggerAbortControllers || /* @__PURE__ */ new Set();
        script._triggerAbortControllers.add(abortController);
        const abortPromise = new Promise((resolve) => {
          abortController.signal.addEventListener("abort", () => {
            script._triggerAbortControllers?.delete(abortController);
            resolve();
          });
        });
        script._triggerAbortController = abortController;
        script._triggerPromises = script._triggerPromises || [];
        const triggerPromise = Promise.race([
          trigger2.then((v) => typeof v === "undefined" || v ? script.load : void 0),
          abortPromise
        ]).catch((error) => {
        }).then((res) => {
          res?.();
        }).finally(() => {
          script._triggerAbortControllers?.delete(abortController);
          const idx = script._triggerPromises?.indexOf(triggerPromise) ?? -1;
          if (idx !== -1)
            script._triggerPromises?.splice(idx, 1);
        });
        script._triggerPromises.push(triggerPromise);
        return () => abortController.abort();
      } else if (typeof trigger2 === "function") {
        if (head.ssr) {
          return noop;
        }
        const abortController = new AbortController();
        script._triggerAbortControllers = script._triggerAbortControllers || /* @__PURE__ */ new Set();
        script._triggerAbortControllers.add(abortController);
        script._triggerAbortController = abortController;
        let cleanup;
        abortController.signal.addEventListener("abort", () => {
          script._triggerAbortControllers?.delete(abortController);
          if (typeof cleanup === "function")
            cleanup();
          cleanup = void 0;
        }, { once: true });
        try {
          cleanup = trigger2(script.load);
          if (abortController.signal.aborted) {
            if (typeof cleanup === "function")
              cleanup();
            cleanup = void 0;
          }
        } catch (error) {
          abortController.abort();
          if (removeOnError)
            script.remove();
          throw error;
        }
        return () => abortController.abort();
      }
      return noop;
    },
    _cbs
  };
  loadPromise.then((api) => {
    if (api !== false) {
      script.instance = api;
      const cbs = _cbs.loaded;
      _cbs.loaded = null;
      _cbs.error = null;
      callCbs(cbs, api);
    } else {
      const cbs = script.status === "error" ? _cbs.error : null;
      _cbs.loaded = null;
      _cbs.error = null;
      callCbs(cbs, loadError);
    }
  });
  const hookCtx = { script };
  const result = scoped ? createScriptScope(script) : script;
  try {
    result.setupTriggerHandler(trigger);
  } catch (error) {
    script.remove();
    throw error;
  }
  if (resolveApi || use) {
    const { proxy, resolve } = createScriptProxy(head.ssr ? {} : initialInstance || {});
    script.proxy = proxy;
    script.onLoaded(resolve);
  }
  const warmupStrategy = !loader && (_warmupStrategy || (typeof trigger === "undefined" || trigger === "client" ? "preload" : false));
  if (warmupStrategy) {
    script._warmupStrategy = warmupStrategy;
    script.warmup(warmupStrategy);
  }
  scripts[id] = script;
  return result;
}

export { useScript as u };
