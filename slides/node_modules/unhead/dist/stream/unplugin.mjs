import { createHash } from 'node:crypto';
import { posix } from 'node:path';
import { createUnplugin } from 'unplugin';
import { p as parseStreamKey } from '../shared/unhead.C_7zwq8E.mjs';

const VIRTUAL_CLIENT_ID = "virtual:@unhead/streaming-client";
const VIRTUAL_IIFE_ID = "virtual:@unhead/streaming-iife.js";
const RESOLVED_ID = `\0${VIRTUAL_CLIENT_ID}`;
const RESOLVED_IIFE_ID = `\0${VIRTUAL_IIFE_ID}`;
const VIRTUAL_RE = /virtual:@unhead\/streaming/;
const RESOLVED_RE = /^\0virtual:@unhead\/streaming/;
const IIFE_AUTO_INIT_RE = /\.init\(\);?\s*$/;
let iifeCode;
let iifeCodeLoading;
async function loadIifeCode() {
  if (iifeCode)
    return;
  iifeCodeLoading ||= import('unhead/stream/iife').then((mod) => {
    iifeCode = mod.streamingIifeCode;
  });
  await iifeCodeLoading;
}
function resolveNonce(nonce) {
  if (!nonce)
    return void 0;
  return typeof nonce === "function" ? nonce() : nonce;
}
function configureIifeCode(code, streamKey) {
  if (streamKey === "__unhead__")
    return code;
  if (!IIFE_AUTO_INIT_RE.test(code))
    throw new Error("[unhead] Streaming IIFE auto-init call was not found.");
  return code.replace(IIFE_AUTO_INIT_RE, () => `.init({streamKey:${JSON.stringify(streamKey)}});`);
}
function buildClientStub(framework, streamKey, warnOnMissing) {
  const key = JSON.stringify(streamKey);
  const warnBranch = warnOnMissing ? `else{console.warn('[unhead] streaming client loaded but window['+${key}+'] is undefined; did the server call wrapStream()/renderSSRHeadShell()?')}` : "";
  return `import{createHead}from'${framework}/client'
const s=window[${key}];if(s){const q=s._q;s._q=[];const h=createHead({document});h._wrapped=!0;const p=b=>{for(const e of b){const a=h.push(e),t=h.entries.get(a._i);if(t)t._streamed=!0}};q.forEach(p);s.push=p;s._head=h}${warnBranch}`;
}
function buildStreamingPluginOptions(options, meta = {}) {
  const {
    framework,
    name,
    mode = "async",
    nonce,
    streamKey: rawStreamKey = "__unhead__",
    warnOnMissingServerBootstrap
  } = options;
  const streamKey = parseStreamKey(rawStreamKey);
  const state = {
    mode,
    isVite: meta.framework === "vite",
    isBuild: false,
    ssr: false,
    base: "/",
    assetsDir: "assets",
    warnedManifestModuleFallback: false
  };
  function isSSRCall(hookThis, opts) {
    const envName = hookThis?.environment?.name;
    return envName === "ssr" || envName === "server" || opts?.ssr === true || state.ssr;
  }
  function warnEnabled() {
    return warnOnMissingServerBootstrap ?? !state.isBuild;
  }
  function joinBase(path) {
    const rest = path.startsWith("/") ? path.slice(1) : path;
    if (!state.base)
      return rest;
    const base = state.base.endsWith("/") ? state.base : `${state.base}/`;
    return `${base}${rest}`;
  }
  function normalizeHtmlHostId(path) {
    if (!path)
      return void 0;
    const normalized = path.split(/[?#]/, 1)[0].replaceAll("\\", "/").replace(/^\/+/, "");
    if (!normalized)
      return "index.html";
    return normalized.endsWith("/") ? `${normalized}index.html` : normalized;
  }
  function resolveRelativeAssetSrc(fileName, hostId) {
    const relative = posix.relative(posix.dirname(hostId), fileName);
    return relative.startsWith(".") ? relative : `./${relative}`;
  }
  function resolveAssetSrc(fileName, htmlHostId) {
    const result = htmlHostId ? state.renderBuiltUrl?.(fileName, {
      type: "asset",
      hostId: htmlHostId,
      hostType: "html",
      ssr: state.ssr
    }) : void 0;
    const unresolvedHost = htmlHostId === void 0;
    if (typeof result === "object" && result?.runtime)
      throw new Error(`{ runtime: "${result.runtime}" } is not supported for assets in html files: ${fileName}`);
    const rawFileNameAttr = unresolvedHost ? { "data-unhead-asset": fileName } : void 0;
    if (typeof result === "string" && result.length > 0) {
      const src = result.startsWith("data:") ? result : result.replace(/^[^?#]+/, (path) => encodeURI(path));
      return { src, rawFileNameAttr };
    }
    let relative = state.base === "" || state.base === "./";
    if (typeof result === "object" && typeof result?.relative === "boolean")
      relative = result.relative;
    if (relative && !state.ssr && htmlHostId)
      return { src: resolveRelativeAssetSrc(fileName, htmlHostId), rawFileNameAttr };
    return { src: joinBase(fileName), rawFileNameAttr };
  }
  function resolveEmittedIifePath(hookThis, ctx) {
    if (state.emittedIifeFileName)
      return state.emittedIifeFileName;
    const ref = state.emittedIifeFileId;
    if (!ref)
      return void 0;
    for (const asset of Object.values(ctx?.bundle || {})) {
      if (asset?.type === "asset" && asset.fileName && (asset.name === "unhead-streaming.js" || asset.names?.includes("unhead-streaming.js")))
        return asset.fileName;
    }
    if (typeof hookThis?.getFileName === "function") {
      const fileName = hookThis.getFileName(ref);
      if (fileName && fileName !== ref)
        return fileName;
    }
    return void 0;
  }
  function warnManifestModuleFallback(hookThis) {
    if (state.warnedManifestModuleFallback)
      return;
    state.warnedManifestModuleFallback = true;
    const message = "[unhead] Vite called transformIndexHtml with no HTML. This is a manifest pass. Module mode cannot inject a dynamic import here. Falling back to the async script tag. Set mode: 'async' to remove this warning.";
    if (typeof hookThis?.warn === "function")
      hookThis.warn(message);
    else
      console.warn(message);
  }
  return {
    name: name ?? `${framework}:streaming`,
    enforce: "pre",
    async buildStart() {
      if (!state.isVite)
        return;
      if (mode === "module" && !state.isBuild)
        return;
      await loadIifeCode();
      if ((mode === "async" || mode === "module") && state.isBuild && typeof this.emitFile === "function") {
        if (!iifeCode)
          throw new Error("[unhead] Streaming IIFE not built. Run `pnpm build` in packages/unhead first.");
        const source = configureIifeCode(iifeCode, streamKey);
        const hash = createHash("sha256").update(source).digest("hex").slice(0, 8);
        const fileName = posix.join(state.assetsDir, `unhead-streaming.${hash}.js`);
        state.emittedIifeFileId = this.emitFile({
          type: "asset",
          fileName,
          source
        });
        state.emittedIifeFileName = fileName;
      }
    },
    resolveId: {
      filter: { id: VIRTUAL_RE },
      handler(id) {
        if (id === VIRTUAL_CLIENT_ID || id === `/${VIRTUAL_CLIENT_ID}`)
          return RESOLVED_ID;
        if (state.isVite && (id === VIRTUAL_IIFE_ID || id === `/${VIRTUAL_IIFE_ID}`))
          return RESOLVED_IIFE_ID;
      }
    },
    load: {
      filter: { id: RESOLVED_RE },
      handler(id, opts) {
        const isSSR = isSSRCall(this, opts);
        if (id === RESOLVED_ID) {
          if (isSSR)
            return { code: "export {}", moduleType: "js" };
          return {
            code: buildClientStub(framework, streamKey, warnEnabled()),
            moduleType: "js"
          };
        }
        if (id === RESOLVED_IIFE_ID) {
          if (!state.isVite)
            return;
          if (isSSR)
            return { code: "", moduleType: "js" };
          if (!iifeCode)
            throw new Error("[unhead] Streaming IIFE not built. Run `pnpm build` in packages/unhead first.");
          return { code: configureIifeCode(iifeCode, streamKey), moduleType: "js" };
        }
      }
    },
    ...options.transform && options.filter ? {
      transform: {
        filter: options.codeFilter ? { id: options.filter, code: options.codeFilter } : { id: options.filter },
        handler(code, id, opts) {
          return options.transform(code, id, { ssr: isSSRCall(this, opts) });
        }
      }
    } : {},
    webpack(compiler) {
      const { name: n, target } = compiler.options;
      if (n === "server" || target === "node" || target === "async-node")
        state.ssr = true;
    },
    rspack(compiler) {
      const { name: n, target } = compiler.options;
      if (n === "server" || target === "node" || target === "async-node")
        state.ssr = true;
    },
    vite: {
      apply(_config, env) {
        state.isVite = true;
        if (env.isSsrBuild)
          state.ssr = true;
        if (env.command === "build")
          state.isBuild = true;
        return true;
      },
      configResolved(config) {
        state.isVite = true;
        if (config.command === "build")
          state.isBuild = true;
        state.base = config.base ?? "/";
        state.assetsDir = config.build?.assetsDir ?? "assets";
        state.renderBuiltUrl = config.experimental?.renderBuiltUrl;
      },
      transformIndexHtml: {
        // `order: 'pre'` is separate from the plugin-level `enforce: 'pre'`:
        // it runs this HTML transform before other non-pre HTML transforms
        // so the virtual module `<script>` tags we inject go through the
        // full Vite plugin pipeline (resolveId/load) and aren't stripped or
        // rewritten by downstream HTML transforms.
        order: "pre",
        handler(html, ctx) {
          const isManifestPass = html === void 0;
          const nonceValue = isManifestPass ? void 0 : resolveNonce(nonce);
          const nonceAttr = nonceValue ? { nonce: nonceValue } : {};
          if (mode === "inline") {
            if (!iifeCode)
              throw new Error("[unhead] Streaming IIFE not built. Run `pnpm build` in packages/unhead first.");
            return [{
              tag: "script",
              attrs: nonceAttr,
              children: configureIifeCode(iifeCode, streamKey),
              injectTo: "head-prepend"
            }];
          }
          if (mode === "async" || mode === "module" && isManifestPass) {
            if (mode === "module")
              warnManifestModuleFallback(this);
            const fileName = state.isBuild ? resolveEmittedIifePath(this, ctx) : void 0;
            const htmlHostId = normalizeHtmlHostId(ctx?.path);
            const { src, rawFileNameAttr } = fileName ? resolveAssetSrc(fileName, htmlHostId) : { src: joinBase(VIRTUAL_IIFE_ID), rawFileNameAttr: void 0 };
            return [{
              tag: "script",
              attrs: { ...nonceAttr, ...rawFileNameAttr, async: true, src },
              injectTo: "head-prepend"
            }];
          }
          return [{
            tag: "script",
            attrs: nonceAttr,
            children: `import("${state.isBuild ? `/${VIRTUAL_CLIENT_ID}` : joinBase(VIRTUAL_CLIENT_ID)}")`,
            injectTo: "head-prepend"
          }];
        }
      }
    }
  };
}
const createStreamingPlugin = /* @__PURE__ */ createUnplugin(buildStreamingPluginOptions);

export { VIRTUAL_CLIENT_ID, VIRTUAL_IIFE_ID, buildStreamingPluginOptions, createStreamingPlugin };
