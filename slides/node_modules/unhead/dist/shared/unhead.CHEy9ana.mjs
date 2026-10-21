function defineHeadPlugin(plugin, key) {
  if (key && typeof plugin === "function")
    plugin.key = key;
  return plugin;
}

export { defineHeadPlugin as d };
