import { H as HEAD_COMPOSABLE_RE, S as SOURCE_FILE_RE, a as SSRStaticReplace, C as CreateHeadTransform, T as TreeshakeServerComposables, U as UseSeoMetaTransform, r as resolveMinifyTransformOptions, M as MinifyTransform, c as createHeadTransformContext } from './shared/bundler.UsCZRS3d.mjs';
import 'magic-string';
import 'oxc-walker';
import 'unhead/minify';
import 'unplugin';
import 'unhead/utils';
import 'node:module';

const DEVTOOLS_KIT_PACKAGE = "@vitejs/devtools-kit";
function getHookHandler(hook) {
  if (!hook)
    return;
  return typeof hook === "function" ? hook : hook.handler;
}
function isViteDevtoolsPlugin(plugin) {
  return !!plugin.name?.startsWith("vite:devtools");
}
function isViteDevtoolsEnabled(config) {
  return config.devtools && config.devtools.enabled === true || config.plugins.some(isViteDevtoolsPlugin);
}
function isMissingDevtoolsKit(error) {
  let current = error;
  while (current instanceof Error) {
    if (current.message.includes(DEVTOOLS_KIT_PACKAGE))
      return true;
    current = current.cause;
  }
  return false;
}
function handleDevtoolsLoadError(error) {
  if (isMissingDevtoolsKit(error)) {
    throw new Error(
      "Install @vitejs/devtools and @vitejs/devtools-kit to enable Unhead DevTools. For example: pnpm add -D @vitejs/devtools @vitejs/devtools-kit",
      { cause: error }
    );
  }
  throw error;
}
function lazyUnheadDevtools(options) {
  let enabled = false;
  let plugin;
  let pluginPromise;
  let resolvedConfig;
  let configForwarded = false;
  async function resolvePlugin() {
    if (plugin)
      return plugin;
    pluginPromise ||= import('./chunks/vite.mjs').catch(handleDevtoolsLoadError).then((mod) => {
      plugin = mod.unheadDevtools(options);
      return plugin;
    });
    return pluginPromise;
  }
  async function callHook(name, thisArg, args) {
    const resolved = await resolvePlugin();
    const hook = resolved[name];
    return getHookHandler(hook)?.apply(thisArg, args);
  }
  async function callEnabledHook(name, thisArg, args) {
    if (!enabled)
      return;
    return callHook(name, thisArg, args);
  }
  const lazyPlugin = {
    name: "@unhead/devtools",
    apply: "serve",
    async configResolved(config) {
      resolvedConfig = config;
      enabled = isViteDevtoolsEnabled(config);
      if (!enabled)
        return;
      configForwarded = true;
      return callHook("configResolved", this, [config]);
    },
    transform: {
      filter: { id: SOURCE_FILE_RE, code: HEAD_COMPOSABLE_RE },
      async handler(code, id, options2) {
        return callEnabledHook("transform", this, [code, id, options2]);
      }
    },
    devtools: {
      async setup(ctx) {
        enabled = true;
        const resolved = await resolvePlugin();
        if (!configForwarded && resolvedConfig) {
          configForwarded = true;
          await callHook("configResolved", this, [resolvedConfig]);
        }
        await resolved.devtools?.setup?.(ctx);
      }
    }
  };
  return lazyPlugin;
}

function resolveCoreDefs(options) {
  const defs = [];
  const common = { filter: options.filter, sourcemap: options.sourcemap };
  if (options.treeshake !== false) {
    const treeshakeOpts = typeof options.treeshake === "object" ? options.treeshake : {};
    defs.push({ instance: TreeshakeServerComposables, options: { ...common, ...treeshakeOpts } });
  }
  if (options.transformSeoMeta !== false) {
    const seoMetaOpts = typeof options.transformSeoMeta === "object" ? options.transformSeoMeta : {};
    defs.push({ instance: UseSeoMetaTransform, options: { ...common, ...seoMetaOpts } });
  }
  const minifyTransformOptions = resolveMinifyTransformOptions(options);
  if (minifyTransformOptions) {
    defs.push({
      instance: MinifyTransform,
      options: { ...common, ...minifyTransformOptions }
    });
  }
  return defs;
}
function dispatch(bundler, defs) {
  const out = [];
  for (const { instance, options } of defs) {
    if (bundler !== "vite" && options.transpile && !options.js && !options.css)
      continue;
    const bundlerOptions = bundler === "vite" ? options : { ...options, transpile: false };
    const plugin = instance[bundler](bundlerOptions);
    if (Array.isArray(plugin))
      out.push(...plugin);
    else out.push(plugin);
  }
  return out;
}
function resolveStreamingOpts(streaming) {
  return streaming && typeof streaming === "object" ? streaming : void 0;
}
function pushPlugin(out, value) {
  if (Array.isArray(value))
    out.push(...value);
  else out.push(value);
}
function createFrameworkPlugin({ framework, streamingPlugin }) {
  return (options = {}) => {
    const { streaming, validate, devtools, ...coreOpts } = options;
    const defs = resolveCoreDefs(coreOpts);
    const streamOpts = resolveStreamingOpts(streaming);
    const wantStreaming = !!streaming;
    return {
      vite: () => {
        const plugins = dispatch("vite", defs);
        const ctx = createHeadTransformContext();
        if (validate !== false) {
          ctx.addRuntimePlugin({
            import: { name: "ValidatePlugin", source: `${framework}/plugins`, as: "__unhead_validate" },
            client: "_h.use(__unhead_validate({ root: __ROOT__ }))",
            server: "_h.use(__unhead_validate({ root: __ROOT__ }))"
          });
        }
        if (devtools !== false) {
          const devtoolsOpts = typeof devtools === "object" ? devtools : {};
          plugins.push(lazyUnheadDevtools({ ...devtoolsOpts, _ctx: ctx }));
        }
        plugins.push(SSRStaticReplace.vite({}));
        plugins.push(CreateHeadTransform(ctx));
        if (wantStreaming)
          pushPlugin(plugins, streamingPlugin.vite(streamOpts));
        return plugins;
      },
      webpack: () => {
        const plugins = dispatch("webpack", defs);
        plugins.push(SSRStaticReplace.webpack({}));
        if (wantStreaming)
          pushPlugin(plugins, streamingPlugin.webpack(streamOpts));
        return plugins;
      },
      rspack: () => {
        const plugins = dispatch("rspack", defs);
        plugins.push(SSRStaticReplace.rspack({}));
        if (wantStreaming)
          pushPlugin(plugins, streamingPlugin.rspack(streamOpts));
        return plugins;
      },
      rollup: () => {
        const plugins = dispatch("rollup", defs);
        plugins.push(SSRStaticReplace.rollup({}));
        if (wantStreaming)
          pushPlugin(plugins, streamingPlugin.rollup(streamOpts));
        return plugins;
      }
    };
  };
}

export { createFrameworkPlugin };
