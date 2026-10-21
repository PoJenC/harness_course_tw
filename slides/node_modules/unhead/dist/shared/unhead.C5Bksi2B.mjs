import { r as registerPlugin } from './unhead.D7HkBzZn.mjs';

function createClientHeadAdapter(core, hooks, render) {
  const corePush = core.push;
  const head = core;
  head.ssr = false;
  head.hooks = hooks;
  head.dirty = !!head.dirty;
  head.use = (p) => registerPlugin(head, p);
  head.render = () => render(head);
  function notify() {
    hooks.callHook("entries:updated", head);
    if (!head._b)
      head.render();
  }
  head.invalidate = () => {
    for (const entry of head.entries.values())
      delete entry._tags;
    head.dirty = true;
    notify();
  };
  head.push = (input, entryOptions) => {
    const unhook = entryOptions?.onRendered ? hooks.hook("dom:rendered", entryOptions.onRendered) : void 0;
    const active = corePush(input, entryOptions);
    const entry = core.entries.get(active._i);
    if (entry)
      entry._o = input;
    head.dirty = true;
    notify();
    return {
      _i: active._i,
      patch(input2) {
        active.patch(input2);
        head.dirty = true;
        notify();
      },
      dispose() {
        unhook?.();
        if (core.entries.has(active._i)) {
          active.dispose();
          head.invalidate();
        }
      }
    };
  };
  return head;
}

export { createClientHeadAdapter as c };
