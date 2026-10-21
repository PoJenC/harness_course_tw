function createScriptTriggerTimeout(options) {
  return (load) => {
    const timer = setTimeout(load, options.timeout);
    return () => clearTimeout(timer);
  };
}
function createScriptTriggerInteraction(options) {
  return (load) => {
    const target = typeof options.target === "function" ? options.target() : options.target || (typeof document === "undefined" ? null : document.documentElement);
    if (!target)
      return;
    let active = true;
    let onInteraction;
    const cleanup = () => {
      if (!active)
        return;
      active = false;
      for (const event of options.events)
        target.removeEventListener(event, onInteraction);
    };
    onInteraction = () => {
      cleanup();
      load();
    };
    for (const event of options.events)
      target.addEventListener(event, onInteraction, { passive: true });
    return cleanup;
  };
}
function createScriptTriggerServiceWorker(options = {}) {
  return (load) => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      load();
      return;
    }
    const serviceWorker = navigator.serviceWorker;
    if (serviceWorker.controller) {
      load();
      return;
    }
    let active = true;
    let timer;
    let onControllerChange;
    const cleanup = () => {
      if (!active)
        return;
      active = false;
      serviceWorker.removeEventListener("controllerchange", onControllerChange);
      clearTimeout(timer);
    };
    const done = () => {
      cleanup();
      load();
    };
    onControllerChange = () => done();
    serviceWorker.addEventListener("controllerchange", onControllerChange);
    timer = setTimeout(() => {
      options.onTimeout?.();
      done();
    }, options.timeout ?? 3e3);
    return cleanup;
  };
}

export { createScriptTriggerInteraction, createScriptTriggerServiceWorker, createScriptTriggerTimeout };
