import { existsSync, readFileSync } from 'node:fs';
import { relative, dirname, resolve } from 'node:path';
import { createPluginFromDevframe } from '@vitejs/devtools-kit/node';
import MagicString from 'magic-string';
import { H as HEAD_COMPOSABLE_RE, S as SOURCE_FILE_RE, p as parseAndWalkSource, b as HEAD_COMPOSABLES } from '../shared/bundler.UsCZRS3d.mjs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineRpcFunction } from '@vitejs/devtools-kit';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import 'oxc-walker';
import 'unhead/minify';
import 'unplugin';
import 'unhead/utils';

function createGetConfigRpc(version) {
  return defineRpcFunction({
    name: "get-config",
    type: "static",
    jsonSerializable: true,
    setup: (ctx) => ({
      handler: () => ({
        cwd: ctx.cwd,
        mode: ctx.mode,
        version: version()
      })
    })
  });
}

const DIST_TAGS_URL = "https://registry.npmjs.org/-/package/unhead/dist-tags";
const getDistTagsRpc = defineRpcFunction({
  name: "get-dist-tags",
  type: "query",
  jsonSerializable: true,
  setup: () => {
    let tags;
    return {
      // The panel can't fetch this itself: the registry's dist-tags endpoint sends no CORS headers.
      handler: () => {
        tags ??= fetch(DIST_TAGS_URL).then((res) => {
          if (!res.ok)
            throw new Error(`npm registry responded ${res.status}`);
          return res.json();
        }).catch(() => {
          tags = void 0;
          return null;
        });
        return tags;
      }
    };
  }
});

const PATTERNS = ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue,svelte}"];
const IGNORE = ["**/node_modules/**", "**/dist/**", "**/.output/**", "**/.nuxt/**"];
const SEVERITY = { error: "error", warning: "warn", info: "info" };
async function loadCli() {
  const mod = await import('@unhead/cli').catch(() => {
    return null;
  });
  return typeof mod?.runAudit === "function" ? mod : null;
}
const runLintRpc = defineRpcFunction({
  name: "run-lint",
  // Each run reads the current files, and `migrate` rewrites them, so never cache it.
  type: "action",
  setup: (ctx) => ({
    handler: async (args = {}) => {
      const cli = await loadCli();
      if (!cli) {
        return {
          available: false,
          message: "Install or update @unhead/cli to audit your source files."
        };
      }
      const start = Date.now();
      const mode = args.mode === "migrate" ? "migrate" : "audit";
      const dryRun = mode === "migrate" && args.dryRun === true;
      const cwd = ctx.cwd;
      const results = await cli.runAudit({ patterns: PATTERNS, mode, cwd, ignore: IGNORE });
      const allowed = args.files ? new Map(args.files.map((file) => [file.filePath, file.fingerprint])) : void 0;
      const files = [];
      for (const r of results) {
        const fingerprint = typeof r.output === "string" ? createHash("sha256").update(await readFile(r.filePath)).update(r.output).digest("hex") : void 0;
        const fixed = typeof r.output === "string" && (!allowed || allowed.get(r.filePath) === fingerprint);
        if (fixed && mode === "migrate" && !dryRun)
          await writeFile(r.filePath, r.output);
        const messages = r.diagnostics.map((d) => ({
          ruleId: d.ruleId ?? null,
          message: d.message,
          severity: SEVERITY[d.severity] ?? "info",
          line: d.line,
          column: d.column
        }));
        if (!messages.length && !fixed)
          continue;
        files.push({
          filePath: r.filePath,
          relativePath: relative(cwd, r.filePath),
          errorCount: messages.filter((m) => m.severity === "error").length,
          warningCount: messages.filter((m) => m.severity === "warn").length,
          messages,
          fixed,
          fingerprint
        });
      }
      return {
        available: true,
        mode,
        dryRun,
        files,
        errorCount: files.reduce((n, f) => n + f.errorCount, 0),
        warningCount: files.reduce((n, f) => n + f.warningCount, 0),
        filesFixed: files.filter((f) => f.fixed).length,
        durationMs: Date.now() - start
      };
    }
  })
});

const UNHEAD_DEVFRAME_ID = "unhead";
const UNHEAD_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FBBF24'/%3E%3Cstop offset='100%25' stop-color='%23f0db4f'/%3E%3C/linearGradient%3E%3Cmask id='m'%3E%3Crect width='100%25' height='100%25' fill='white'/%3E%3Cpath d='M12 32 L1 32 L15 15 Z' fill='black'/%3E%3C/mask%3E%3C/defs%3E%3Cpath fill='none' stroke='url(%23g)' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 4v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4' mask='url(%23m)'/%3E%3C/svg%3E`;
function findPkgRoot(fromUrl) {
  let dir = dirname(fileURLToPath(fromUrl));
  while (dir !== dirname(dir)) {
    if (existsSync(resolve(dir, "package.json")))
      return dir;
    dir = dirname(dir);
  }
  return dir;
}
function readVersion(pkgDir) {
  return JSON.parse(readFileSync(resolve(pkgDir, "package.json"), "utf-8")).version || "";
}
function resolveUnheadVersion() {
  try {
    const unheadEntry = createRequire(import.meta.url).resolve("unhead");
    return readVersion(findPkgRoot(pathToFileURL(unheadEntry).href));
  } catch {
    return "";
  }
}
function createUnheadDevframe() {
  const pkgDir = findPkgRoot(import.meta.url);
  const panelDir = resolve(pkgDir, "dist/devtools-ui");
  const pageScript = resolve(pkgDir, "dist/devtools/bridge.mjs");
  let unheadVersion;
  const getConfigRpc = createGetConfigRpc(() => unheadVersion ??= resolveUnheadVersion());
  return {
    id: UNHEAD_DEVFRAME_ID,
    name: "Unhead",
    version: readVersion(pkgDir),
    packageName: "@unhead/bundler",
    importMetaUrl: import.meta.url,
    homepage: "https://unhead.unjs.io",
    description: "Inspect head tags, entries, scripts, and SEO metadata of the current page.",
    icon: UNHEAD_ICON,
    basePath: `/__${UNHEAD_DEVFRAME_ID}/`,
    clientAssets: existsSync(panelDir) ? panelDir : void 0,
    dock: existsSync(pageScript) ? { clientScript: { importFrom: pageScript, eager: true } } : void 0,
    setup(ctx) {
      const unhead = ctx.scope(UNHEAD_DEVFRAME_ID);
      unhead.rpc.register(getConfigRpc);
      unhead.rpc.register(getDistTagsRpc);
      unhead.rpc.register(runLintRpc);
    }
  };
}

const LEADING_SLASH_RE = /^\//;
const BACKSLASH_RE = /\\/g;
function isViteDevtoolsPlugin(plugin) {
  return !!plugin.name?.startsWith("vite:devtools");
}
function isViteDevtoolsEnabled(config) {
  return config.devtools && config.devtools.enabled === true || config.plugins.some(isViteDevtoolsPlugin);
}
function resolveRuntimeEntry(pkgDir) {
  const candidates = [
    resolve(pkgDir, "dist/index.mjs"),
    // running from source (repo tests, unbuilt workspace)
    resolve(pkgDir, "src/index.ts")
  ];
  return (candidates.find(existsSync) ?? candidates[0]).replace(BACKSLASH_RE, "/");
}
function transformSourceLocations(code, id, root) {
  const s = new MagicString(code);
  let transformed = false;
  const relativePath = id.startsWith(root) ? id.slice(root.length).replace(LEADING_SLASH_RE, "") : id;
  parseAndWalkSource(code, id, {
    parseOptions: { lang: "ts" },
    enter(node) {
      if (node.type !== "CallExpression")
        return;
      const callee = node.callee;
      if (!callee)
        return;
      const name = callee.type === "Identifier" ? callee.name : callee.type === "MemberExpression" && callee.property?.type === "Identifier" ? callee.property.name : null;
      if (!name || !HEAD_COMPOSABLES.includes(name))
        return;
      const args = node.arguments;
      if (!args || args.length === 0)
        return;
      const lineNumber = code.slice(0, node.start).split("\n").length;
      const sourceValue = `${relativePath}:${lineNumber}`;
      if (args.length === 1) {
        const argEnd = args[0].end;
        s.appendRight(argEnd, `, { _source: ${JSON.stringify(sourceValue)} }`);
        transformed = true;
      } else if (args.length >= 2 && args[1].type === "ObjectExpression") {
        const objStart = args[1].start + 1;
        s.appendRight(objStart, ` _source: ${JSON.stringify(sourceValue)},`);
        transformed = true;
      }
    }
  });
  if (!transformed)
    return;
  return {
    code: s.toString(),
    map: s.generateMap({ includeContent: true, source: id })
  };
}
function unheadDevtools(options) {
  let root = "";
  let enabled = false;
  let runtimePluginRegistered = false;
  const pkgDir = findPkgRoot(import.meta.url);
  return {
    name: "@unhead/devtools",
    apply: "serve",
    configResolved(config) {
      root = config.root;
      enabled = isViteDevtoolsEnabled(config);
      if (!enabled)
        return;
      if (options?._ctx && !runtimePluginRegistered) {
        options._ctx.addRuntimePlugin({
          import: { name: "devtoolsPlugin", source: resolveRuntimeEntry(pkgDir), as: "__unhead_devtoolsPlugin" },
          client: "window.__unhead_devtools__=_h",
          server: "_h.use(__unhead_devtoolsPlugin())"
        });
        runtimePluginRegistered = true;
      }
    },
    transform: {
      filter: { id: SOURCE_FILE_RE, code: HEAD_COMPOSABLE_RE },
      handler(code, id) {
        if (!enabled)
          return;
        return transformSourceLocations(code, id, root);
      }
    },
    // Mounts the panel, the page script (dock client script), and the RPC.
    devtools: createPluginFromDevframe(createUnheadDevframe()).devtools
  };
}

export { unheadDevtools as default, unheadDevtools };
