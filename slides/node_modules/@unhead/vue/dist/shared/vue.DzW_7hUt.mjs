import { useScript as useScript$1 } from 'unhead/scripts';
import { getCurrentInstance, getCurrentScope, onMounted, isRef, watch, onScopeDispose, ref } from 'vue';
import { i as injectHead } from './vue.DKb5ZKVl.mjs';

function useScript(_input, _options) {
  const input = typeof _input === "string" ? { src: _input } : _input;
  const options = { ..._options };
  const head = options?.head || injectHead();
  options.head = head;
  const vm = getCurrentInstance();
  const scope = getCurrentScope();
  options.eventContext = vm;
  if (vm && typeof options.trigger === "undefined") {
    options.trigger = onMounted;
  } else if (isRef(options.trigger) || typeof options.trigger === "function" && options.trigger.length === 0) {
    const trigger = options.trigger;
    let off;
    options.trigger = new Promise((resolve) => {
      off = watch(trigger, (val) => {
        if (val) {
          resolve(true);
        }
      }, {
        immediate: true
      });
      onScopeDispose(() => resolve(false), true);
    }).then((val) => {
      off?.();
      return val;
    });
  }
  head._scriptStatusWatcher = head._scriptStatusWatcher || head.hooks.hook("script:updated", ({ script: s }) => {
    if (s._statusRef) {
      s._statusRef.value = s.status;
    }
  });
  const scoped = options.scope === true;
  const ownsTrigger = !scoped && !!scope && !head.ssr && (options.trigger instanceof Promise || typeof options.trigger === "function");
  const coreOptions = ownsTrigger ? { ...options, trigger: "manual" } : options;
  const script = useScript$1(head, input, coreOptions);
  const sharedScript = scoped ? script.script : script;
  sharedScript._statusRef = sharedScript._statusRef || ref(sharedScript.status);
  const disposeTrigger = ownsTrigger ? sharedScript._setupTriggerHandler(options.trigger, false) : void 0;
  let onLoaded = script.onLoaded;
  let onError = script.onError;
  if (scope) {
    if (scoped) {
      onScopeDispose(script.dispose);
    } else {
      const bind = (base) => (...args) => {
        if (!scope.active)
          return () => {
          };
        const off = base(...args);
        scope.run(() => onScopeDispose(off));
        return off;
      };
      onLoaded = bind(script.onLoaded);
      onError = bind(script.onError);
      if (disposeTrigger)
        onScopeDispose(disposeTrigger);
    }
  }
  return new Proxy(script, {
    get(_, key, a) {
      if (key === "status")
        return sharedScript._statusRef;
      if (key === "onLoaded")
        return onLoaded;
      if (key === "onError")
        return onError;
      return Reflect.get(_, key, a);
    }
  });
}

export { useScript as u };
