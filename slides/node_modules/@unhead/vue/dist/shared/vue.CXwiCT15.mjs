import { SafeInputPlugin, FlatMetaPlugin } from 'unhead/plugins';
import { walkResolver, hasOwn } from 'unhead/utils';
import { getCurrentScope, ref, watchEffect, getCurrentInstance, onBeforeUnmount, onDeactivated, onActivated, onScopeDispose } from 'vue';
import { i as injectHead } from './vue.DKb5ZKVl.mjs';
import { V as VueResolver } from './vue.D2XR8FqS.mjs';

function useHead(input, options = {}) {
  const head = options.head || injectHead();
  return head.ssr ? head.push(input || {}, options) : clientUseHead(head, input, options);
}
function clientUseHead(head, input, options = {}) {
  const scope = getCurrentScope();
  if (scope && !scope.active) {
    return { patch() {
    }, dispose() {
    }, _i: -1 };
  }
  const deactivated = ref(false);
  if (options.onRendered && scope) {
    const _onRendered = options.onRendered;
    options = { ...options, onRendered: (ctx) => scope.run(() => _onRendered(ctx)) };
  }
  let entry;
  watchEffect(() => {
    const i = deactivated.value ? {} : walkResolver(input, VueResolver);
    if (entry) {
      entry.patch(i);
    } else {
      entry = head.push(i, options);
    }
  });
  const vm = getCurrentInstance();
  if (vm) {
    onBeforeUnmount(() => {
      entry.dispose();
    });
    onDeactivated(() => {
      deactivated.value = true;
    });
    onActivated(() => {
      deactivated.value = false;
    });
  } else if (scope) {
    onScopeDispose(() => entry.dispose());
  }
  return entry;
}
function useHeadSafe(input = {}, options = {}) {
  const head = options.head || injectHead();
  head.use(SafeInputPlugin);
  options._safe = true;
  return useHead(input, options);
}
function normalizeSeoMetaInput(input) {
  if (input._flatMeta)
    return input;
  const meta = {};
  for (const key in input) {
    if (!hasOwn(input, key) || key === "title" || key === "titleTemplate")
      continue;
    meta[key] = input[key];
  }
  return {
    title: input.title,
    titleTemplate: input.titleTemplate,
    _flatMeta: meta
  };
}
function useSeoMeta(input = {}, options = {}) {
  const head = options.head || injectHead();
  head.use(FlatMetaPlugin);
  const entry = useHead(normalizeSeoMetaInput(input), options);
  const corePatch = entry.patch;
  if (!entry.__patched) {
    entry.patch = (input2) => corePatch(normalizeSeoMetaInput(input2));
    entry.__patched = true;
  }
  return entry;
}
const useServerHead = useHead;
const useServerHeadSafe = useHeadSafe;
const useServerSeoMeta = useSeoMeta;

export { useHeadSafe as a, useSeoMeta as b, useServerHead as c, useServerHeadSafe as d, useServerSeoMeta as e, useHead as u };
