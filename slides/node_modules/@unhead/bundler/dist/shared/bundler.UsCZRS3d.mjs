import MagicString from 'magic-string';
import { parseAndWalk, ScopeTracker, ScopeTrackerImport, walk } from 'oxc-walker';
import { minifyJSON } from 'unhead/minify';
import { createUnplugin } from 'unplugin';
import { resolveMetaKeyType, resolveMetaKeyValue, resolvePackedMetaObjectValue } from 'unhead/utils';
import { createRequire } from 'node:module';

const NODE_MODULES_RE = /[\\/]node_modules[\\/]/;
function resolveBuildConsumer(ctx, fallback) {
  const consumer = ctx?.environment?.config?.consumer;
  if (consumer === "client" || consumer === "server")
    return consumer;
  return fallback;
}
const JS_EXT_RE = /\.[cm]?[jt]sx?$/;
const JS_VUE_RE = /\.(?:[cm]?[jt]sx?|vue)(?:$|\?)/;
const SOURCE_FILE_RE = /\.(?:[cm]?[jt]sx?|vue|svelte)(?:$|\?)/;
function createJsVueTransformIdFilter(include) {
  return {
    include: [
      JS_VUE_RE,
      ...include || []
    ],
    exclude: NODE_MODULES_RE
  };
}
function splitTransformId(id) {
  const queryIndex = id.indexOf("?");
  return queryIndex === -1 ? { pathname: id, query: "" } : { pathname: id.slice(0, queryIndex), query: id.slice(queryIndex + 1) };
}
function getQueryValue(query, key) {
  const keyLength = key.length;
  let start = 0;
  while (start < query.length) {
    const ampIndex = query.indexOf("&", start);
    const end = ampIndex === -1 ? query.length : ampIndex;
    const eqIndex = query.indexOf("=", start);
    if (eqIndex === -1 || eqIndex > end) {
      if (end - start === keyLength && query.startsWith(key, start))
        return "";
    } else if (eqIndex - start === keyLength && query.startsWith(key, start)) {
      return query.slice(eqIndex + 1, end);
    }
    start = end + 1;
  }
}
function isVueScriptRequest(pathname, query) {
  return pathname.endsWith(".vue") && (!query || getQueryValue(query, "type") === "script");
}

const HEAD_COMPOSABLES = ["useHead", "useSeoMeta", "useHeadSafe", "useScript"];
const HEAD_COMPOSABLE_RE = new RegExp(`\\b(?:${HEAD_COMPOSABLES.join("|")})\\b`);

const PARSER_IDS = ["rolldown/utils", "oxc-parser"];
function resolveParser(load) {
  const failures = [];
  for (const id of PARSER_IDS) {
    const loaded = load(id);
    if (loaded._tag === "error") {
      failures.push({ cause: loaded.cause, id });
      continue;
    }
    const parseSync = loaded.module?.parseSync;
    if (typeof parseSync === "function")
      return { _tag: "ok", id, parseSync };
    failures.push({
      cause: new TypeError(`${id} does not export parseSync`),
      id
    });
  }
  return { _tag: "missing", failures };
}
const require$1 = createRequire(import.meta.url);
let cachedParser;
function loadParser(id) {
  try {
    return { _tag: "ok", module: require$1(id) };
  } catch (cause) {
    return { _tag: "error", cause };
  }
}
function resolveParserOrThrow(load) {
  const resolution = resolveParser(load);
  if (resolution._tag === "missing") {
    throw Object.assign(
      new Error(
        "Unhead build transforms require a parser. Rolldown is detected automatically. If Rolldown is unavailable, install oxc-parser as a development dependency.",
        { cause: new AggregateError(resolution.failures.map((failure) => failure.cause), "Parser resolution failed") }
      ),
      { _tag: "MissingParserError" }
    );
  }
  return resolution;
}
function getParser() {
  cachedParser ||= resolveParserOrThrow(loadParser);
  return cachedParser;
}
function isMissingParserError(error) {
  return error instanceof Error && "_tag" in error && error._tag === "MissingParserError";
}
function parseAndWalkSource(code, id, options) {
  return parseAndWalk(code, id, {
    ...options,
    parseSync: getParser().parseSync
  });
}

const CREATE_HEAD_RE = /\bcreateHead\b/;
const UNHEAD_SOURCE_RE = /^(?:@unhead\/[^/]+|unhead)(?:\/[^?]*)?$/;
function createHeadTransformContext() {
  const registrations = [];
  return {
    addRuntimePlugin(reg) {
      registrations.push(reg);
    },
    getRegistrations() {
      return registrations;
    }
  };
}
function CreateHeadTransform(ctx) {
  let root = "";
  return {
    name: "@unhead/create-head-transform",
    apply: "serve",
    configResolved(config) {
      root = config.root;
    },
    transform: {
      filter: { id: SOURCE_FILE_RE, code: CREATE_HEAD_RE },
      handler(code, id) {
        const registrations = ctx.getRegistrations();
        if (!registrations.length)
          return;
        const isServer = this.environment?.config?.consumer === "server";
        const envRegistrations = registrations.filter((r) => isServer ? r.server : r.client);
        if (!envRegistrations.length)
          return;
        const rootLiteral = JSON.stringify(root);
        const statements = envRegistrations.map((r) => (isServer ? r.server : r.client).replace(/__ROOT__/g, rootLiteral)).join(",");
        const imports = envRegistrations.map((reg) => `import { ${reg.import.name} as ${reg.import.as} } from ${JSON.stringify(reg.import.source)};
`).join("");
        const s = new MagicString(code);
        let transformed = false;
        const directCreateHeadNames = /* @__PURE__ */ new Set();
        const namespaceNames = /* @__PURE__ */ new Set();
        parseAndWalkSource(code, id, {
          parseOptions: { lang: "ts" },
          enter(node) {
            if (node.type === "ImportDeclaration") {
              const source = node.source?.value;
              if (typeof source !== "string" || !UNHEAD_SOURCE_RE.test(source))
                return;
              for (const spec of node.specifiers || []) {
                if (spec.type === "ImportSpecifier" && spec.imported?.name === "createHead")
                  directCreateHeadNames.add(spec.local.name);
                else if (spec.type === "ImportNamespaceSpecifier")
                  namespaceNames.add(spec.local.name);
              }
              return;
            }
            if (node.type !== "CallExpression")
              return;
            const callee = node.callee;
            if (!callee)
              return;
            const isDirect = callee.type === "Identifier" && directCreateHeadNames.has(callee.name);
            const isNamespaced = callee.type === "MemberExpression" && callee.object?.type === "Identifier" && namespaceNames.has(callee.object.name) && callee.property?.type === "Identifier" && callee.property.name === "createHead";
            if (!isDirect && !isNamespaced)
              return;
            s.prependLeft(node.start, `((_h)=>(${statements},_h))(`);
            s.appendRight(node.end, `)`);
            transformed = true;
          }
        });
        if (!transformed)
          return;
        s.prepend(imports);
        return {
          code: s.toString(),
          map: s.generateMap({ includeContent: true, source: id })
        };
      }
    }
  };
}

const HEAD_RE = /\buse(?:Server)?Head\b/;
const JSON_TYPES = /* @__PURE__ */ new Set(["application/json", "application/ld+json", "speculationrules", "importmap"]);
const JAVASCRIPT_TYPES = /* @__PURE__ */ new Set([
  "",
  "application/ecmascript",
  "application/javascript",
  "application/x-ecmascript",
  "application/x-javascript",
  "module",
  "text/ecmascript",
  "text/javascript",
  "text/javascript1.0",
  "text/javascript1.1",
  "text/javascript1.2",
  "text/javascript1.3",
  "text/javascript1.4",
  "text/javascript1.5",
  "text/jscript",
  "text/livescript",
  "text/x-ecmascript",
  "text/x-javascript"
]);
const HEAD_FN_NAMES = /* @__PURE__ */ new Set(["useHead", "useServerHead"]);
const CONTENT_PROP_NAMES = ["innerHTML", "textContent"];
const CONTENT_PROPS = new Set(CONTENT_PROP_NAMES);
const MINIFY_CACHE_MAX = 100;
const resolvedBaselineTargets = /* @__PURE__ */ new WeakMap();
function resolveViteTransformTarget(vite, target) {
  if (target !== "baseline-widely-available")
    return Promise.resolve(target);
  let resolved = resolvedBaselineTargets.get(vite);
  if (!resolved) {
    resolved = vite.resolveConfig({
      configFile: false,
      build: { target }
    }, "build").then(async (config) => {
      if (config.build.target !== target)
        return config.build.target === false ? void 0 : config.build.target;
      const fallback = await vite.resolveConfig({
        configFile: false,
        build: { target: "modules" }
      }, "build");
      return fallback.build.target === false ? void 0 : fallback.build.target;
    });
    resolvedBaselineTargets.set(vite, resolved);
  }
  return resolved;
}
async function transformInlineScriptWithVite(vite, code, target) {
  if (target === false)
    return code;
  const resolvedTarget = await resolveViteTransformTarget(vite, target);
  if (typeof vite.transformWithOxc === "function") {
    const result2 = await vite.transformWithOxc(code, "unhead-inline-script.js", {
      lang: "js",
      sourcemap: false,
      target: resolvedTarget
    });
    return result2.code.trim();
  }
  const result = await vite.transformWithEsbuild(code, "unhead-inline-script.js", {
    loader: "js",
    target: resolvedTarget
  });
  return result.code.trim();
}
const jsonMinifier = (code) => Promise.resolve(minifyJSON(code));
function resolveMinifyTransformOptions(options) {
  const minifyOptions = options.minify !== false && typeof options.minify === "object" ? options.minify : {};
  const transpile = options.transformInlineScripts === false ? false : typeof options.transformInlineScripts === "object" ? options.transformInlineScripts : true;
  if (!minifyOptions.js && !minifyOptions.css && !transpile)
    return;
  return { ...minifyOptions, transpile };
}
const MinifyTransform = createUnplugin((options = {}, meta) => {
  const jsMinifier = options.js !== false ? options.js : void 0;
  const cssMinifier = options.css !== false ? options.css : void 0;
  const transpileOptions = typeof options.transpile === "object" ? options.transpile : void 0;
  const shouldTranspile = options.transpile === true || !!transpileOptions;
  let resolvedViteTarget;
  const jsTranspiler = shouldTranspile && meta.framework === "vite" ? async (code, target) => {
    const vite = await import('vite');
    return transformInlineScriptWithVite(vite, code, target);
  } : void 0;
  const doJS = !!jsMinifier || !!jsTranspiler;
  const doCSS = !!cssMinifier;
  const transformCache = {
    json: /* @__PURE__ */ new Map(),
    script: /* @__PURE__ */ new Map(),
    style: /* @__PURE__ */ new Map()
  };
  function shouldTransformId(id) {
    const { pathname, query } = splitTransformId(id);
    if (NODE_MODULES_RE.test(pathname))
      return false;
    if (options.filter?.exclude?.some((pattern) => id.match(pattern)))
      return false;
    if (options.filter?.include?.some((pattern) => id.match(pattern)))
      return true;
    if (isVueScriptRequest(pathname, query))
      return true;
    if (JS_EXT_RE.test(pathname))
      return true;
    return false;
  }
  return {
    name: "unhead:minify-transform",
    enforce: "post",
    vite: jsTranspiler ? {
      configResolved(config) {
        resolvedViteTarget = config.build.target;
      }
    } : void 0,
    transform: {
      filter: {
        code: HEAD_RE,
        id: createJsVueTransformIdFilter(options.filter?.include)
      },
      async handler(code, id) {
        if (!shouldTransformId(id))
          return;
        if (!CONTENT_PROP_NAMES.some((name) => code.includes(name)) && !code.includes("\\u"))
          return;
        const scopeTracker = new ScopeTracker();
        const pendingTransforms = [];
        const environmentTarget = this.environment?.config?.build?.target;
        const inlineScriptTarget = transpileOptions?.target ?? environmentTarget ?? resolvedViteTarget;
        try {
          parseAndWalkSource(code, id, {
            scopeTracker,
            enter(node, _parent) {
              if (node.type !== "CallExpression")
                return;
              if (!resolveHeadFunctionName(node.callee, scopeTracker))
                return;
              const arg = node.arguments[0];
              if (!arg || arg.type !== "ObjectExpression")
                return;
              for (const prop of arg.properties) {
                if (prop.type !== "Property")
                  continue;
                const tagType = resolveStaticPropertyName(prop);
                if (tagType !== "script" && tagType !== "style")
                  continue;
                if (tagType === "style" && !doCSS)
                  continue;
                const elements = prop.value?.type === "ArrayExpression" ? prop.value.elements : [prop.value];
                for (const element of elements) {
                  if (!element || element.type !== "ObjectExpression")
                    continue;
                  processScriptOrStyleObject(element, tagType, pendingTransforms, inlineScriptTarget);
                }
              }
            }
          });
        } catch (error) {
          if (isMissingParserError(error))
            throw error;
          return;
        }
        if (!pendingTransforms.length)
          return;
        const transformed = await Promise.all(pendingTransforms.map((pending) => pending.transformed));
        const s = new MagicString(code);
        for (let i = 0; i < pendingTransforms.length; i++) {
          const pending = pendingTransforms[i];
          const result = transformed[i];
          if (result && result !== pending.raw && (pending.replaceIfLonger || result.length < pending.raw.length))
            s.overwrite(pending.start, pending.end, JSON.stringify(result));
        }
        if (!s.hasChanged())
          return;
        return {
          code: s.toString(),
          map: s.generateMap({ includeContent: true, source: id })
        };
      }
    }
  };
  function resolveHeadFunctionName(callee, scopeTracker) {
    if (callee.type === "Identifier") {
      const decl2 = scopeTracker.getDeclaration(callee.name);
      if (decl2 instanceof ScopeTrackerImport) {
        if (decl2.node.type === "ImportSpecifier" && decl2.node.imported.type === "Identifier" && HEAD_FN_NAMES.has(decl2.node.imported.name)) {
          return decl2.node.imported.name;
        }
      } else if (!decl2 && HEAD_FN_NAMES.has(callee.name)) {
        return callee.name;
      }
      return;
    }
    if (callee.type !== "MemberExpression" || callee.computed || callee.object.type !== "Identifier" || callee.property.type !== "Identifier" || !HEAD_FN_NAMES.has(callee.property.name)) {
      return;
    }
    const decl = scopeTracker.getDeclaration(callee.object.name);
    if (decl instanceof ScopeTrackerImport && decl.node.type === "ImportNamespaceSpecifier")
      return callee.property.name;
  }
  function processScriptOrStyleObject(objectNode, tagType, pendingTransforms, inlineScriptTarget) {
    let contentType = tagType;
    if (tagType === "script") {
      const typeProp = objectNode.properties.find(
        (p) => p.type === "Property" && resolveStaticPropertyName(p) === "type"
      );
      if (typeProp) {
        if (typeProp.value?.type !== "Literal" || typeof typeProp.value.value !== "string")
          return;
        const scriptType = typeProp.value.value.toLowerCase();
        if (JSON_TYPES.has(scriptType))
          contentType = "json";
        else if (!JAVASCRIPT_TYPES.has(scriptType))
          return;
      }
      if (contentType === "script" && !doJS)
        return;
    }
    for (const prop of objectNode.properties) {
      if (prop.type !== "Property")
        continue;
      const contentProp = resolveStaticPropertyName(prop);
      if (!contentProp || !CONTENT_PROPS.has(contentProp))
        continue;
      if (prop.value?.type === "Literal") {
        const raw = prop.value.value;
        const minLength = contentType === "script" && jsTranspiler ? 0 : 20;
        if (typeof raw !== "string" || raw.length < minLength)
          continue;
        pendingTransforms.push({
          end: prop.value.end,
          replaceIfLonger: contentType === "script" && !!jsTranspiler,
          raw,
          start: prop.value.start,
          transformed: transformStringContent(raw, contentType, inlineScriptTarget)
        });
      } else if (prop.value?.type === "TemplateLiteral" && prop.value.expressions.length === 0) {
        const raw = prop.value.quasis[0]?.value?.cooked;
        const minLength = contentType === "script" && jsTranspiler ? 0 : 20;
        if (!raw || raw.length < minLength)
          continue;
        pendingTransforms.push({
          end: prop.value.end,
          replaceIfLonger: contentType === "script" && !!jsTranspiler,
          raw,
          start: prop.value.start,
          transformed: transformStringContent(raw, contentType, inlineScriptTarget)
        });
      }
    }
  }
  function resolveStaticPropertyName(prop) {
    if (prop.key?.type === "Identifier")
      return prop.key.name;
    if (prop.key?.type === "Literal" && typeof prop.key.value === "string")
      return prop.key.value;
  }
  function transformStringContent(content, contentType, inlineScriptTarget) {
    const minifier = contentType === "json" ? jsonMinifier : contentType === "script" ? jsMinifier : cssMinifier;
    const transpiler = contentType === "script" ? jsTranspiler : void 0;
    if (!minifier && !transpiler)
      return Promise.resolve(null);
    const cache = transformCache[contentType];
    const cacheKey = transpiler ? `${JSON.stringify(inlineScriptTarget)}\0${content}` : content;
    const cached = cache.get(cacheKey);
    if (cached) {
      cache.delete(cacheKey);
      cache.set(cacheKey, cached);
      return cached;
    }
    const pending = Promise.resolve().then(async () => {
      let result = content;
      if (transpiler)
        result = await transpiler(result, inlineScriptTarget) || result;
      if (minifier)
        result = await minifier(result) || result;
      return result === content ? null : result;
    }).catch((error) => {
      if (cache.get(cacheKey) === pending)
        cache.delete(cacheKey);
      throw error;
    });
    cache.set(cacheKey, pending);
    if (cache.size > MINIFY_CACHE_MAX) {
      const oldest = cache.keys().next().value;
      if (oldest !== void 0)
        cache.delete(oldest);
    }
    return pending;
  }
});

const UNHEAD_JS_MODULE_RE = /[\\/]node_modules[\\/](?:@unhead[\\/][^\\/]+|unhead)[\\/].*\.(?:c|m)?js$/;
const HEAD_SSR_FILTER_RE = /\bhead\.ssr\b/;
function isMutationTarget(parent, key) {
  if (key === "left") {
    return parent?.type === "AssignmentExpression" || parent?.type === "ForInStatement" || parent?.type === "ForOfStatement";
  }
  return key === "argument" && (parent?.type === "UpdateExpression" || parent?.type === "UnaryExpression" && parent.operator === "delete");
}
const SSRStaticReplace = createUnplugin(() => {
  let fallbackConsumer;
  return {
    name: "unhead:ssr-static-replace",
    enforce: "pre",
    transform: {
      filter: {
        code: HEAD_SSR_FILTER_RE,
        id: UNHEAD_JS_MODULE_RE
      },
      handler(code, id) {
        const consumer = resolveBuildConsumer(this, fallbackConsumer);
        if (!consumer)
          return;
        const ssr = consumer === "server";
        const s = new MagicString(code);
        let mutationTargetDepth = 0;
        parseAndWalkSource(code, id, {
          parseOptions: { lang: "js" },
          enter(node, parent, { key }) {
            if (isMutationTarget(parent, key))
              mutationTargetDepth++;
            if (mutationTargetDepth || node.type !== "MemberExpression" || node.computed || node.object?.type !== "Identifier" || node.object.name !== "head" || node.property?.type !== "Identifier" || node.property.name !== "ssr" || code.slice(node.start, node.end) !== "head.ssr") {
              return;
            }
            s.overwrite(node.start, node.end, String(ssr));
          },
          leave(_node, parent, { key }) {
            if (isMutationTarget(parent, key))
              mutationTargetDepth--;
          }
        });
        if (s.hasChanged()) {
          return {
            code: s.toString(),
            map: s.generateMap({ includeContent: true })
          };
        }
      }
    },
    webpack(ctx) {
      fallbackConsumer = ctx.name === "server" ? "server" : "client";
    },
    vite: {
      // Per-call target resolution via `this.environment` makes the plugin
      // safe to share across environments in a single build pipeline.
      sharedDuringBuild: true,
      apply(_config, env) {
        if (env.command === "serve")
          return false;
        fallbackConsumer = env.isSsrBuild ? "server" : "client";
        return true;
      }
    }
  };
});

const SERVER_COMPOSABLE_RE = /\b(?:useServerHead|useServerHeadSafe|useServerSeoMeta|useSchemaOrg)\b/;
const functionNames = /* @__PURE__ */ new Set([
  "useServerHead",
  "useServerHeadSafe",
  "useServerSeoMeta",
  // plugins
  "useSchemaOrg"
]);
function isUnheadPackage(source) {
  return typeof source === "string" && (source === "unhead" || source.startsWith("unhead/") || source.startsWith("@unhead/"));
}
const TreeshakeServerComposables = createUnplugin((options = {}) => {
  const enabled = options.enabled ?? true;
  let fallbackConsumer;
  function shouldTransformId(id) {
    if (!enabled)
      return false;
    const { pathname, query } = splitTransformId(id);
    if (NODE_MODULES_RE.test(pathname))
      return false;
    if (options.filter?.exclude?.some((pattern) => id.match(pattern)))
      return false;
    if (options.filter?.include?.some((pattern) => id.match(pattern)))
      return true;
    if (isVueScriptRequest(pathname, query))
      return true;
    if (JS_EXT_RE.test(pathname))
      return true;
    return false;
  }
  return {
    name: "unhead:remove-server-composables",
    enforce: "post",
    transform: {
      filter: {
        code: SERVER_COMPOSABLE_RE,
        id: createJsVueTransformIdFilter(options.filter?.include)
      },
      handler(code, id) {
        if (resolveBuildConsumer(this, fallbackConsumer) !== "client")
          return;
        if (!shouldTransformId(id))
          return;
        const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
        const ast = parseAndWalkSource(code, id, { scopeTracker });
        const s = new MagicString(code);
        scopeTracker.freeze();
        walk(ast.program, {
          scopeTracker,
          enter(node, parent) {
            if (parent?.type !== "ExpressionStatement" || node.type !== "CallExpression" || node.callee.type !== "Identifier") {
              return;
            }
            const decl = scopeTracker.getDeclaration(node.callee.name);
            if (decl instanceof ScopeTrackerImport) {
              if (decl.node.type === "ImportSpecifier" && decl.node.imported.type === "Identifier" && functionNames.has(decl.node.imported.name) && isUnheadPackage(decl.importNode.source.value)) {
                s.remove(parent.start, parent.end);
              }
              return;
            }
            if (decl)
              return;
            if (functionNames.has(node.callee.name))
              s.remove(parent.start, parent.end);
          }
        });
        if (s.hasChanged()) {
          return {
            code: s.toString(),
            map: s.generateMap({ includeContent: true, source: id })
          };
        }
      }
    },
    webpack(ctx) {
      fallbackConsumer = ctx.name === "server" ? "server" : "client";
    },
    vite: {
      // Per-call target resolution via `this.environment` makes the plugin
      // safe to share across environments in a single build pipeline.
      sharedDuringBuild: true,
      apply(_config, env) {
        if (env.command === "serve")
          return false;
        fallbackConsumer = env.isSsrBuild ? "server" : "client";
        return true;
      }
    }
  };
});

const SEO_META_RE = /\buse(?:Server)?SeoMeta\b/;
const SEO_META_NAMES = /* @__PURE__ */ new Set(["useSeoMeta", "useServerSeoMeta"]);
const MEDIA_KEYS = /* @__PURE__ */ new Set(["ogImage", "ogVideo", "ogAudio", "twitterImage"]);
const UseSeoMetaTransform = createUnplugin((options = {}) => {
  const rewriteImports = options.imports ?? true;
  const importPaths = options.importPaths?.length ? new Set(options.importPaths) : void 0;
  function isValidPackage(s) {
    if (s === "unhead" || s.startsWith("@unhead")) {
      return true;
    }
    return importPaths?.has(s) === true;
  }
  function shouldTransformId(id) {
    const { pathname, query } = splitTransformId(id);
    if (NODE_MODULES_RE.test(pathname))
      return false;
    if (options.filter?.exclude?.some((pattern) => id.match(pattern)))
      return false;
    if (options.filter?.include?.some((pattern) => id.match(pattern)))
      return true;
    if (isVueScriptRequest(pathname, query))
      return true;
    if (JS_EXT_RE.test(pathname))
      return true;
    return false;
  }
  return {
    name: "unhead:use-seo-meta-transform",
    enforce: "post",
    transform: {
      filter: {
        code: SEO_META_RE,
        id: createJsVueTransformIdFilter(options.filter?.include)
      },
      async handler(code, id) {
        if (!shouldTransformId(id))
          return;
        const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
        const ast = parseAndWalkSource(code, id, { scopeTracker });
        const s = new MagicString(code);
        scopeTracker.freeze();
        const importRewrites = /* @__PURE__ */ new Map();
        const valueReferenced = /* @__PURE__ */ new Set();
        const untransformedCallees = /* @__PURE__ */ new Set();
        walk(ast.program, {
          scopeTracker,
          enter(node, parent) {
            if (node.type === "Identifier" && !(parent?.type === "CallExpression" && parent.callee === node) && parent?.type !== "ImportSpecifier") {
              const decl2 = scopeTracker.getDeclaration(node.name);
              if (decl2 instanceof ScopeTrackerImport && isValidPackage(decl2.importNode.source.value) && decl2.node.type === "ImportSpecifier" && decl2.node.imported.type === "Identifier" && SEO_META_NAMES.has(decl2.node.imported.name)) {
                valueReferenced.add(decl2.node.imported.name);
              }
            }
            if (node.type !== "CallExpression" || node.callee.type !== "Identifier")
              return;
            const decl = scopeTracker.getDeclaration(node.callee.name);
            let originalName;
            let importDecl = null;
            if (decl instanceof ScopeTrackerImport) {
              if (!isValidPackage(decl.importNode.source.value) || decl.node.type !== "ImportSpecifier" || decl.node.imported.type !== "Identifier")
                return;
              originalName = decl.node.imported.name;
              importDecl = decl.importNode;
            } else if (!decl && SEO_META_NAMES.has(node.callee.name)) {
              originalName = node.callee.name;
            } else {
              return;
            }
            if (!SEO_META_NAMES.has(originalName))
              return;
            const properties = node.arguments[0]?.properties;
            if (!properties) {
              if (importDecl)
                untransformedCallees.add(originalName);
              return;
            }
            let output = [];
            const title = properties.find((property) => property.key?.name === "title");
            const titleTemplate = properties.find((property) => property.key?.name === "titleTemplate");
            const meta = properties.filter((property) => property.key?.name !== "title" && property.key?.name !== "titleTemplate");
            if (title || titleTemplate || originalName === "useSeoMeta") {
              output.push("useHead({");
              if (title) {
                output.push(`  title: ${code.substring(title.value.start, title.value.end)},`);
              }
              if (titleTemplate) {
                output.push(`  titleTemplate: ${code.substring(titleTemplate.value.start, titleTemplate.value.end)},`);
              }
            }
            if (originalName === "useServerSeoMeta") {
              if (output.length) {
                const secondArg = node.arguments[1];
                if (secondArg)
                  output.push(`}, ${code.substring(secondArg.start, secondArg.end)});`);
                else
                  output.push("});");
              }
              output.push("useServerHead({");
            }
            if (meta.length)
              output.push("  meta: [");
            meta.forEach((property) => {
              if (property.type === "SpreadElement") {
                output = false;
                return;
              }
              if (property.key.type !== "Identifier" || !property.value) {
                output = false;
                return;
              }
              if (output === false)
                return;
              const propertyKey = property.key;
              let key = resolveMetaKeyType(propertyKey.name);
              const keyValue = resolveMetaKeyValue(propertyKey.name);
              let valueKey = "content";
              if (keyValue === "charset") {
                valueKey = "charset";
                key = "charset";
              }
              let value = code.substring(property.value.start, property.value.end);
              if (MEDIA_KEYS.has(propertyKey.name)) {
                const expandObject = (objNode) => {
                  const tags = [];
                  for (const p of objNode.properties) {
                    if (p.type === "SpreadElement" || p.computed || p.method || p.kind !== "init" || p.key?.type !== "Identifier")
                      return false;
                    const name = p.key.name;
                    const suffix = name === "url" ? "" : `:${name === "secureUrl" ? "secure_url" : name}`;
                    tags.push(`    { ${key}: '${keyValue}${suffix}', ${valueKey}: ${code.substring(p.value.start, p.value.end)} },`);
                  }
                  return tags.join("\n");
                };
                if (property.value.type === "ObjectExpression") {
                  const expanded = expandObject(property.value);
                  if (expanded === false) {
                    output = false;
                    return;
                  }
                  output.push(expanded);
                  return;
                }
                if (property.value.type === "ArrayExpression") {
                  if (!property.value.elements.length)
                    return;
                  const parts = [];
                  for (const element of property.value.elements) {
                    if (!element || element.type !== "ObjectExpression") {
                      output = false;
                      return;
                    }
                    const expanded = expandObject(element);
                    if (expanded === false) {
                      output = false;
                      return;
                    }
                    parts.push(expanded);
                  }
                  output.push(parts.join("\n"));
                  return;
                }
                const v = property.value;
                const primitive = typeof v.value === "string" || typeof v.value === "number" || typeof v.value === "boolean";
                const isScalar = v.type === "TemplateLiteral" || (v.type === "Literal" || v.type === "StringLiteral" || v.type === "NumericLiteral") && primitive;
                if (!isScalar) {
                  output = false;
                  return;
                }
              }
              if (property.value.type === "ArrayExpression") {
                const elements = property.value.elements;
                if (!elements.length)
                  return;
                const metaTags = elements.map((element) => {
                  if (element.type !== "ObjectExpression")
                    return `    { ${key}: '${keyValue}', ${valueKey}: ${code.substring(element.start, element.end)} },`;
                  return element.properties.map((p) => {
                    const propKey = p.key.name;
                    const propValue = code.substring(p.value.start, p.value.end);
                    return `    { ${key}: '${keyValue}:${propKey}', ${valueKey}: ${propValue} },`;
                  }).join("\n");
                });
                output.push(metaTags.join("\n"));
                return;
              } else if (property.value.type === "ObjectExpression") {
                const staticValue = materializeStaticStringObject(property.value);
                if (!staticValue) {
                  output = false;
                  return;
                }
                try {
                  value = JSON.stringify(resolvePackedMetaObjectValue(staticValue, propertyKey.name));
                } catch {
                  output = false;
                  return;
                }
              }
              if (valueKey === "charset")
                output.push(`    { ${key}: ${value} },`);
              else
                output.push(`    { ${key}: '${keyValue}', ${valueKey}: ${value} },`);
            });
            if (output) {
              if (meta.length)
                output.push("  ]");
              if (node.arguments.length >= 2) {
                const optionsArg = code.substring(node.arguments[1].start, node.arguments[1].end);
                output.push(`}, ${optionsArg})`);
              } else {
                output.push("})");
              }
              s.overwrite(node.start, node.end, output.join("\n"));
              if (importDecl) {
                if (!importRewrites.has(importDecl))
                  importRewrites.set(importDecl, /* @__PURE__ */ new Set());
                importRewrites.get(importDecl).add(originalName);
              }
            } else if (importDecl) {
              untransformedCallees.add(originalName);
            }
          }
        });
        if (rewriteImports && importRewrites.size > 0) {
          for (const [importNode, transformedNames] of importRewrites) {
            const newSpecifiers = /* @__PURE__ */ new Set();
            for (const spec of importNode.specifiers) {
              if (spec.type !== "ImportSpecifier")
                continue;
              const importedName = spec.imported.name;
              const keepOriginal = importedName === spec.local.name ? importedName : `${importedName} as ${spec.local.name}`;
              if (transformedNames.has(importedName)) {
                newSpecifiers.add(importedName.includes("Server") ? "useServerHead" : "useHead");
                if (valueReferenced.has(importedName) || untransformedCallees.has(importedName))
                  newSpecifiers.add(keepOriginal);
              } else {
                newSpecifiers.add(keepOriginal);
              }
            }
            s.overwrite(
              importNode.specifiers[0].start,
              importNode.specifiers.at(-1).end,
              [...newSpecifiers].join(", ")
            );
          }
        }
        if (s.hasChanged()) {
          return {
            code: s.toString(),
            map: s.generateMap({ includeContent: true, source: id })
          };
        }
      }
    }
  };
});
function getStaticPropertyKey(prop) {
  if (prop.computed)
    return void 0;
  if (prop.key?.type === "Identifier")
    return prop.key.name;
  if ((prop.key?.type === "Literal" || prop.key?.type === "StringLiteral") && typeof prop.key.value === "string")
    return prop.key.value;
}
function getStaticStringValue(node) {
  if ((node?.type === "Literal" || node?.type === "StringLiteral") && typeof node.value === "string")
    return node.value;
}
function isUnsafeObjectKey(key) {
  return key === "__proto__" || key === "constructor" || key === "prototype";
}
function materializeStaticStringObject(node) {
  const out = /* @__PURE__ */ Object.create(null);
  for (const prop of node.properties) {
    if (prop.type === "SpreadElement" || prop.computed || prop.method || prop.kind !== "init")
      return false;
    const key = getStaticPropertyKey(prop);
    const value = getStaticStringValue(prop.value);
    if (!key || isUnsafeObjectKey(key) || value === void 0)
      return false;
    out[key] = value;
  }
  return out;
}

export { CreateHeadTransform as C, HEAD_COMPOSABLE_RE as H, MinifyTransform as M, SOURCE_FILE_RE as S, TreeshakeServerComposables as T, UseSeoMetaTransform as U, SSRStaticReplace as a, HEAD_COMPOSABLES as b, createHeadTransformContext as c, parseAndWalkSource as p, resolveMinifyTransformOptions as r };
