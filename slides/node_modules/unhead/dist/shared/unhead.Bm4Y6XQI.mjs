import { HookableCore } from 'hookable';

function createHooks(hooks) {
  const instance = new HookableCore();
  for (const key in hooks || {}) {
    instance.hook(key, hooks[key]);
  }
  return instance;
}
function callHook(head, hook, ctx) {
  const hooks = head.hooks?._hooks?.[hook];
  if (!hooks?.length)
    return;
  return head.hooks?.callHook(hook, ctx);
}

export { callHook as a, createHooks as c };
