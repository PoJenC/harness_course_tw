export { A as AliasSortingPlugin, D as DeprecationsPlugin, P as PromisesPlugin, T as TemplateParamsPlugin } from './shared/unhead.D9VfQWNo.mjs';
import { d as defineHeadPlugin } from './shared/unhead.CHEy9ana.mjs';
export { F as FlatMetaPlugin, S as SafeInputPlugin } from './shared/unhead.DkxnqlHC.mjs';
import { h as hasContent } from './shared/unhead.CGPOfp5O.mjs';
import { minifyJS, minifyCSS, minifyJSON } from './minify.mjs';
import { u as unpackMeta } from './shared/unhead.o8j9utSy.mjs';
import { t as tagInputFromRuntime, u as tagPredicates, i as inputShapeFromRuntime, b as inputShapePredicates, U as URL_META_KEYS, v as titleInputFromRuntime, h as headInputPredicates } from './shared/unhead.BEmVMkeA.mjs';
import './shared/unhead.DspMpm6y.mjs';

const HTTP_SCHEME_RE = /^https?:\/\//i;
const META_TRANSFORMABLE_URL = [
  "og:url",
  "og:image",
  "og:image:url",
  "og:image:secure_url",
  "twitter:image",
  "twitter:image:src",
  "og:video",
  "og:video:url",
  "og:video:secure_url",
  "og:audio",
  "og:audio:url",
  "og:audio:secure_url",
  "twitter:player",
  "twitter:player:stream"
];
const LINK_REL_RESOLVABLE = /* @__PURE__ */ new Set([
  "canonical",
  "next",
  "prev",
  "alternate",
  "author",
  "license",
  "help",
  "search",
  "pingback"
]);
const META_CANONICAL_URL = /* @__PURE__ */ new Set([
  "og:url"
]);
function CanonicalPlugin(options) {
  return (head) => {
    let host = options.canonicalHost || (!head.ssr ? window.location.origin : "");
    if (!HTTP_SCHEME_RE.test(host) && !host.startsWith("//")) {
      host = `https://${host}`;
    }
    host = new URL(host).origin;
    const whitelist = options.queryWhitelist !== void 0 ? options.queryWhitelist : [];
    function normalizeCanonicalUrl(url) {
      try {
        const parsed = new URL(url, host);
        parsed.hash = "";
        if (whitelist !== false && parsed.search) {
          const filtered = new URLSearchParams();
          for (const key of whitelist) {
            if (parsed.searchParams.has(key)) {
              for (const value of parsed.searchParams.getAll(key)) {
                filtered.append(key, value);
              }
            }
          }
          parsed.search = filtered.toString();
        }
        if (options.trailingSlash === true && !parsed.pathname.endsWith("/")) {
          parsed.pathname = `${parsed.pathname}/`;
        } else if (options.trailingSlash === false && parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
          parsed.pathname = parsed.pathname.slice(0, -1);
        }
        return parsed.toString();
      } catch {
        return url;
      }
    }
    function resolvePath(path) {
      if (options?.customResolver) {
        return options.customResolver(path);
      }
      if (HTTP_SCHEME_RE.test(path) || path.startsWith("//"))
        return path;
      try {
        return new URL(path, host).toString();
      } catch {
        return path;
      }
    }
    return {
      key: "canonical",
      hooks: {
        "tags:resolve": (ctx) => {
          for (const tag of ctx.tags) {
            const metaKey = tag.props?.property || tag.props?.name;
            if (tag.tag === "meta" && META_TRANSFORMABLE_URL.includes(metaKey)) {
              tag.props.content = resolvePath(tag.props.content);
              if (META_CANONICAL_URL.has(metaKey)) {
                tag.props.content = normalizeCanonicalUrl(tag.props.content);
              }
            } else if (tag.tag === "link" && LINK_REL_RESOLVABLE.has(tag.props.rel)) {
              const isCanonical = tag.props.rel === "canonical";
              tag.props.href = resolvePath(tag.props.href);
              if (isCanonical) {
                tag.props.href = normalizeCanonicalUrl(tag.props.href);
              }
            }
          }
        }
      }
    };
  };
}

const IMAGE_META_KEYS = /* @__PURE__ */ new Set(["og:image", "og:image:url", "og:image:secure_url", "twitter:image", "twitter:image:src"]);
function isImageMeta(tag) {
  if (tag.tag !== "meta")
    return false;
  const content = tag.props.content;
  return IMAGE_META_KEYS.has(tag.props.property || tag.props.name) && !!hasContent(content) && String(content).trim() !== "";
}
function InferSeoMetaPlugin(options = {}) {
  return defineHeadPlugin((head) => {
    if (options.twitterCard !== false) {
      head.push({
        meta: [
          options.twitterCard ? { name: "twitter:card", content: options.twitterCard, tagPriority: "low" } : { "name": "twitter:card", "tagPriority": "low", "data-infer": "" }
        ]
      });
    }
    head.push({
      meta: [
        // content is intentionally omitted - inferred from title/description by the hook below
        {
          "property": "og:title",
          "tagPriority": "low",
          "data-infer": ""
        },
        {
          "property": "og:description",
          "tagPriority": "low",
          "data-infer": ""
        }
      ]
    });
    return {
      key: "infer-seo-meta",
      hooks: {
        "tags:beforeResolve": ({ tagMap }) => {
          let title = head._titleTemplate || head._title;
          const ogTitle = tagMap.get("meta:og:title");
          if (typeof ogTitle?.props["data-infer"] !== "undefined") {
            if (typeof title === "function") {
              title = title(head._title);
            }
            title = hasContent(title) ? String(title) : void 0;
            ogTitle.props.content = options.ogTitle ? options.ogTitle(title) : title || "";
            ogTitle.processTemplateParams = true;
          }
          const descriptionValue = tagMap.get("meta:description")?.props?.content;
          const description = hasContent(descriptionValue) ? String(descriptionValue) : void 0;
          const ogDescription = tagMap.get("meta:og:description");
          if (typeof ogDescription?.props["data-infer"] !== "undefined") {
            ogDescription.props.content = options.ogDescription ? options.ogDescription(description) : description || "";
            ogDescription.processTemplateParams = true;
          }
        },
        // after resolve so an image added or dropped by any other hook still counts
        "tags:afterResolve": (ctx) => {
          let cardIndex = -1;
          let hasImage = false;
          for (let i = 0; i < ctx.tags.length; i++) {
            const tag = ctx.tags[i];
            if (tag.tag === "meta" && tag.props.name === "twitter:card" && typeof tag.props["data-infer"] !== "undefined")
              cardIndex = i;
            else if (!hasImage && isImageMeta(tag))
              hasImage = true;
          }
          if (cardIndex === -1)
            return;
          const card = ctx.tags[cardIndex];
          const props = { ...card.props, content: hasImage ? "summary_large_image" : "summary" };
          delete props["data-infer"];
          ctx.tags[cardIndex] = { ...card, props };
        }
      }
    };
  }, "infer-seo-meta");
}

const JSON_TYPES = /* @__PURE__ */ new Set(["application/json", "application/ld+json", "speculationrules", "importmap"]);
function MinifyPlugin(options) {
  const jsMinify = options?.js === false ? false : options?.js || minifyJS;
  const cssMinify = options?.css === false ? false : options?.css || minifyCSS;
  const jsonMinify = options?.json !== false;
  const omitLineBreaks = options?.omitLineBreaks === true;
  return {
    key: "minify",
    hooks: {
      "ssr:render": (ctx) => {
        if (omitLineBreaks)
          ctx.options.omitLineBreaks = true;
        for (const tag of ctx.tags) {
          const content = tag.innerHTML;
          if (!content || content.length < 20)
            continue;
          if (tag.tag === "script") {
            const type = tag.props?.type;
            if (type && JSON_TYPES.has(type)) {
              if (jsonMinify) {
                const min = minifyJSON(content);
                if (min.length < content.length)
                  tag.innerHTML = min;
              }
              continue;
            }
            if (jsMinify) {
              const min = jsMinify(content);
              if (min.length < content.length)
                tag.innerHTML = min;
            }
          } else if (tag.tag === "style" && cssMinify) {
            const min = cssMinify(content);
            if (min.length < content.length)
              tag.innerHTML = min;
          }
        }
      }
    }
  };
}

const TEMPLATE_PARAM_RE = /%\w+(?:\.\w+)?%/;
const TEMPLATE_PARAM_TOKEN_RE = /%\w+(?:\.\w+)?/;
const AT_PREFIX_RE = /^at\s+/;
const JAVASCRIPT_TYPES = /* @__PURE__ */ new Set([
  "application/ecmascript",
  "application/javascript",
  "application/x-ecmascript",
  "application/x-javascript",
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
const SLACK_TWITTER_META_NAMES = /* @__PURE__ */ new Set([
  "twitter:data1",
  "twitter:data2",
  "twitter:label1",
  "twitter:label2"
]);
function isExecutableScript(type) {
  const value = typeof type === "boolean" ? "" : String(type ?? "");
  if (!value)
    return true;
  const normalized = value.replace(/^[\t\n\f\r ]+|[\t\n\f\r ]+$/g, "").toLowerCase();
  return normalized === "module" || JAVASCRIPT_TYPES.has(normalized);
}
const PREDICATE_SEVERITY = {
  "defer-on-module-script": "info",
  "deprecated-prop-body": "warn",
  "deprecated-prop-children": "warn",
  "deprecated-prop-hid-vmid": "warn",
  "empty-meta-content": "warn",
  "html-in-title": "warn",
  "invalid-input-shape": "warn",
  "non-absolute-canonical": "warn",
  "numeric-tag-priority": "info",
  "possible-typo": "warn",
  "preload-font-crossorigin": "warn",
  "preload-missing-as": "warn",
  "robots-conflict": "warn",
  "script-src-with-content": "warn",
  "streamed-tag-hidden-from-bots": "warn",
  "twitter-handle-missing-at": "warn",
  "viewport-user-scalable": "info"
};
function isAbsoluteUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}
function extractOrigin(url) {
  if (!isAbsoluteUrl(url))
    return void 0;
  const slash = url.indexOf("/", url.indexOf("//") + 2);
  return slash === -1 ? url : url.slice(0, slash);
}
function resolveSeverity(config, fallback) {
  if (config == null)
    return fallback;
  return Array.isArray(config) ? config[0] : config;
}
function resolveOptions(config, id, defaults) {
  const entry = config[id];
  if (Array.isArray(entry))
    return { ...defaults, ...entry[1] };
  return defaults;
}
function captureSource(root) {
  const stack = new Error("source").stack;
  if (!stack)
    return void 0;
  const lines = stack.split("\n");
  for (let i = 4; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.includes("node_modules") && !line.includes("unhead/src/")) {
      let source = line.replace(AT_PREFIX_RE, "");
      if (root) {
        const prefix = root.endsWith("/") ? root : `${root}/`;
        source = source.replace(prefix, "./");
      }
      return source;
    }
  }
  return void 0;
}
function createInputShapeObserver() {
  let remainingRootKeys;
  let resolvedValues;
  const resolver = (key, value) => {
    if (key === void 0) {
      if (value?.constructor === Object) {
        remainingRootKeys = new Set(Object.keys(value));
        resolvedValues = /* @__PURE__ */ new Map();
      } else {
        remainingRootKeys = void 0;
        resolvedValues = void 0;
      }
    } else if (remainingRootKeys?.delete(key)) {
      resolvedValues?.set(key, value);
    }
    return value;
  };
  resolver._static = true;
  return {
    resolver,
    take() {
      const input = resolvedValues ? Object.fromEntries(resolvedValues) : void 0;
      remainingRootKeys = void 0;
      resolvedValues = void 0;
      return input;
    }
  };
}
const BOT_HEAD_META_NAMES = /* @__PURE__ */ new Set(["description", "robots", "googlebot", "bingbot", "slurp", "keywords"]);
const BOT_HEAD_META_EQUIVS = /* @__PURE__ */ new Set(["refresh", "content-language"]);
const BOT_HEAD_LINK_RELS = /* @__PURE__ */ new Set(["canonical", "alternate", "amphtml", "prev", "next", "author", "license"]);
const BOT_HEAD_META_PREFIX_RE = /^(?:og|twitter|article|book|profile|fb|al|music|video|place|product):/;
const JSON_LD_TYPE_RE = /^[\t\n\f\r ]*application\/ld\+json[\t\n\f\r ]*(?:;|$)/i;
const REL_SEPARATOR_RE = /[\t\n\f\r ]+/;
const SAFE_BLOCKED_RELS = /* @__PURE__ */ new Set(["canonical", "modulepreload", "prerender", "preload", "prefetch", "dns-prefetch", "preconnect", "manifest", "pingback"]);
function relTokens(value) {
  return String(value || "").toLowerCase().split(REL_SEPARATOR_RE);
}
function* expandPendingTag(tag) {
  if (tag._safe && tag.tag === "link" && relTokens(tag.props.rel).some((rel) => SAFE_BLOCKED_RELS.has(rel)))
    return;
  if (tag.props.body)
    tag.tagPosition = "bodyClose";
  if (tag.tag !== "_flatMeta") {
    yield tag;
    return;
  }
  for (const props of unpackMeta(tag.props))
    yield { ...tag, tag: "meta", props };
}
function isHiddenFromBots(tag, writesBodyTags) {
  const props = tag.props;
  if (tag.tag === "script")
    return !writesBodyTags && JSON_LD_TYPE_RE.test(String(props.type || ""));
  if (tag.tagPosition?.startsWith("body"))
    return false;
  switch (tag.tag) {
    case "title":
    case "titleTemplate":
    case "base":
      return true;
    case "meta": {
      if (BOT_HEAD_META_NAMES.has(String(props.name || "").toLowerCase()))
        return true;
      if (BOT_HEAD_META_EQUIVS.has(String(props["http-equiv"] || "").toLowerCase()))
        return true;
      return BOT_HEAD_META_PREFIX_RE.test(String(props.property || props.name || "").toLowerCase());
    }
    case "link":
      return relTokens(props.rel).some((rel) => BOT_HEAD_LINK_RELS.has(rel));
    default:
      return false;
  }
}
function describeTag(tag) {
  const props = tag.props;
  if (tag.tag === "meta")
    return `meta[${props.property ? `property="${props.property}"` : props["http-equiv"] ? `http-equiv="${props["http-equiv"]}"` : `name="${props.name}"`}]`;
  if (tag.tag === "link")
    return `link[rel="${props.rel}"]`;
  if (tag.tag === "script")
    return 'script[type="application/ld+json"]';
  return tag.tag;
}
function ValidatePlugin(options = {}) {
  const ruleConfig = options.rules || {};
  const root = options.root;
  const only = options.only && new Set(options.only);
  const pluginKey = options.key || "validate";
  function severityFor(id, fallback) {
    if (only && !only.has(id))
      return "off";
    return resolveSeverity(ruleConfig[id], fallback);
  }
  return defineHeadPlugin((head) => {
    const stacks = /* @__PURE__ */ new Map();
    const pendingInputDiagnostics = [];
    const inputShapeObserver = createInputShapeObserver();
    head.resolvedOptions.propResolvers = [
      ...head.resolvedOptions.propResolvers || [],
      inputShapeObserver.resolver
    ];
    const hooks = head.hooks;
    if (hooks) {
      const _callHook = hooks.callHook.bind(hooks);
      let warnedAsyncHook = false;
      hooks.callHook = (name, ...args) => {
        const result = _callHook(name, ...args);
        if (result?.then && !warnedAsyncHook && !only) {
          warnedAsyncHook = true;
          console.warn(`[unhead] promise ignored: ${name}`);
        }
        return result;
      };
    }
    const _push = head.push.bind(head);
    head.push = (input, opts) => {
      if (opts?.mode && severityFor("deprecated-option-mode", "warn") !== "off") {
        console.warn(`[unhead] "mode: '${opts.mode}'" option was removed in v3. Use the appropriate createHead import (unhead/client or unhead/server) instead.`);
      }
      const source = captureSource(root);
      const active = _push(input, opts);
      if (source)
        stacks.set(active._i, source);
      const _dispose = active.dispose;
      active.dispose = () => {
        stacks.delete(active._i);
        _dispose();
      };
      return active;
    };
    function dispatch(rules, mode) {
      const head_ = head;
      head_._validationRules = mode === "replace" ? rules : [...head_._validationRules || [], ...rules];
      if (!rules.length)
        return;
      if (options.onReport) {
        options.onReport(rules);
        return;
      }
      for (const rule of rules) {
        const loc = rule.source ? ` (${rule.source})` : "";
        console.warn(`[unhead] ${rule.message}${loc}`);
      }
    }
    return {
      key: pluginKey,
      hooks: {
        "ssr:streamChunk": ({ tags }) => {
          const severity = severityFor("streamed-tag-hidden-from-bots", "warn");
          if (severity === "off")
            return;
          const rules = [];
          for (const pending of tags) {
            for (const tag of expandPendingTag(pending)) {
              if (!isHiddenFromBots(tag, !!head._stream?.writesBodyTags))
                continue;
              const entryIndex = tag._p != null ? tag._p >> 10 : void 0;
              rules.push({
                id: "streamed-tag-hidden-from-bots",
                message: `Bots will not see ${describeTag(tag)}. It arrived after the shell, so it ships as a client patch. Register it before the shell.`,
                severity,
                source: entryIndex != null ? stacks.get(entryIndex) : void 0,
                tag
              });
            }
          }
          dispatch(rules, "append");
        },
        "entries:normalize": ({ entry }) => {
          const input = inputShapeObserver.take();
          if (!input || input.constructor !== Object)
            return;
          const shape = inputShapeFromRuntime("head", input);
          for (const predicate of Object.values(inputShapePredicates)) {
            for (const diagnostic of predicate(shape))
              pendingInputDiagnostics.push({ diagnostic, entryIndex: entry._i });
          }
        },
        "tags:afterResolve": ({ tags }) => {
          const rules = [];
          function report(id, message, defaultSeverity, tag, inputEntryIndex) {
            const severity = severityFor(id, defaultSeverity);
            if (severity === "off")
              return;
            const entryIndex = inputEntryIndex ?? (tag?._p != null ? tag._p >> 10 : void 0);
            const source = entryIndex != null ? stacks.get(entryIndex) : void 0;
            rules.push({ id, message, severity, source, tag });
          }
          for (const { diagnostic, entryIndex } of pendingInputDiagnostics) {
            const severity = PREDICATE_SEVERITY[diagnostic.ruleId] ?? "warn";
            report(diagnostic.ruleId, diagnostic.message, severity, void 0, entryIndex);
          }
          pendingInputDiagnostics.length = 0;
          const metaByKey = /* @__PURE__ */ new Map();
          let canonicalHref;
          let hasOgTags = false;
          let hasTitle = false;
          let hasDescription = false;
          let isIndexable = true;
          for (const tag of tags) {
            if (tag.tag === "title")
              hasTitle = true;
            if (tag.tag === "meta") {
              const key = tag.props.property || (tag.props.name ? String(tag.props.name).toLowerCase() : void 0);
              if (key) {
                metaByKey.set(key, tag);
                if (key.startsWith("og:"))
                  hasOgTags = true;
                if (key === "description")
                  hasDescription = true;
                if (key === "robots" && String(tag.props.content ?? "").toLowerCase().includes("noindex"))
                  isIndexable = false;
              }
            }
            if (tag.tag === "link" && tag.props.rel === "canonical")
              canonicalHref = tag.props.href;
          }
          function emitFromPredicates(diagnostics, tag) {
            for (const diag of diagnostics) {
              const sev = PREDICATE_SEVERITY[diag.ruleId] ?? "warn";
              report(diag.ruleId, diag.message, sev, tag);
            }
          }
          for (const tag of tags) {
            const { props } = tag;
            const metaKey = props.property || (props.name ? String(props.name).toLowerCase() : void 0);
            const tagInput = tagInputFromRuntime(tag);
            if (tagInput) {
              for (const predicate of Object.values(tagPredicates))
                emitFromPredicates(predicate(tagInput), tag);
            }
            if (tag.tag === "htmlAttrs" || tag.tag === "bodyAttrs") {
              const inputShape = inputShapeFromRuntime(tag.tag, tag.props);
              for (const predicate of Object.values(inputShapePredicates))
                emitFromPredicates(predicate(inputShape), tag);
            }
            if (tag.tag === "meta" && typeof metaKey === "string") {
              const normalizedMetaKey = metaKey.toLowerCase();
              if (normalizedMetaKey.startsWith("twitter:") && !SLACK_TWITTER_META_NAMES.has(normalizedMetaKey))
                report("deprecated-twitter-meta", `${normalizedMetaKey} is deprecated. Use Open Graph metadata instead.`, "warn", tag);
            }
            if (tag.tag === "meta" && metaKey && URL_META_KEYS.has(metaKey)) {
              const content = String(props.content ?? "");
              if (content && !isAbsoluteUrl(content))
                report("non-absolute-og-url", `${metaKey} should be an absolute URL, received "${content}".`, "warn", tag);
            }
            if (tag.tag === "meta" && metaKey) {
              const content = String(props.content ?? "");
              if (content && TEMPLATE_PARAM_RE.test(content))
                report("unresolved-template-param", `Unresolved template param in ${metaKey}: "${content}".`, "warn", tag);
            }
            if (tag.tag === "title") {
              const titleInput = titleInputFromRuntime(tag);
              if (titleInput) {
                for (const diag of headInputPredicates["no-html-in-title"](titleInput))
                  report(diag.ruleId, diag.message, "warn", tag);
              }
              const text = String(tag.textContent ?? "");
              if (TEMPLATE_PARAM_RE.test(text))
                report("unresolved-template-param", `Unresolved template param in title: "${text}".`, "warn", tag);
              if (!text.trim())
                report("empty-title", `Title tag is empty. If using titleTemplate, ensure it produces output.`, "warn", tag);
            }
            if (tag.tag === "script" && props.src && !props.async && !props.defer && props.type !== "module" && (!tag.tagPosition || tag.tagPosition === "head"))
              report("render-blocking-script", `Script "${props.src}" is render-blocking. Add "async", "defer", or use type="module" to avoid blocking the critical rendering path.`, "warn", tag);
            if (tag.tag === "link" && props.rel === "preload" && props.fetchpriority === "low" && props.as !== "script")
              report("preload-fetchpriority-conflict", `This preload uses fetchpriority="low". Check whether the resource needs a higher priority.`, "off", tag);
            if (tag.tag === "style" && (tag.innerHTML || tag.textContent)) {
              const content = tag.innerHTML || tag.textContent || "";
              const sizeKB = new TextEncoder().encode(content).byteLength / 1024;
              const { maxKB: styleMaxKB } = resolveOptions(ruleConfig, "inline-style-size", { maxKB: 14 });
              if (sizeKB > styleMaxKB)
                report("inline-style-size", `Inline <style> is ${sizeKB.toFixed(1)}KB \u2014 exceeds ${styleMaxKB}KB critical CSS budget. Consider moving to an external stylesheet for cacheability.`, "info", tag);
            }
            if (tag.tag === "script" && isExecutableScript(props.type) && !props.src && (tag.innerHTML || tag.textContent)) {
              const content = tag.innerHTML || tag.textContent || "";
              const sizeKB = new TextEncoder().encode(content).byteLength / 1024;
              const { maxKB: scriptMaxKB } = resolveOptions(ruleConfig, "inline-script-size", { maxKB: 2 });
              if (sizeKB > scriptMaxKB)
                report("inline-script-size", `Inline <script> is ${sizeKB.toFixed(1)}KB \u2014 consider moving to an external file for cacheability.`, "info", tag);
            }
          }
          const ogUrl = metaByKey.get("og:url");
          if (canonicalHref && ogUrl?.props.content && canonicalHref !== ogUrl.props.content)
            report("canonical-og-url-mismatch", `Canonical URL "${canonicalHref}" differs from og:url "${ogUrl.props.content}".`, "warn", ogUrl);
          if (metaByKey.has("og:image") && (!metaByKey.has("og:image:width") || !metaByKey.has("og:image:height")))
            report("og-image-missing-dimensions", `og:image is set but og:image:width and/or og:image:height are missing \u2014 social platforms may not display the image.`, "warn", metaByKey.get("og:image"));
          if (hasOgTags) {
            if (!metaByKey.has("og:title"))
              report("og-missing-title", `Open Graph tags are present but og:title is missing.`, "warn");
            if (!metaByKey.has("og:description"))
              report("og-missing-description", `Open Graph tags are present but og:description is missing.`, "warn");
          }
          if (!hasTitle)
            report("missing-title", `Page is missing a <title> tag.`, "warn");
          if (!hasDescription && isIndexable)
            report("missing-description", `Page is missing a meta description and is indexable by search engines.`, "warn");
          const { max: maxPreloads } = resolveOptions(ruleConfig, "too-many-preloads", { max: 6 });
          const preloadCount = tags.filter((t) => t.tag === "link" && t.props.rel === "preload").length;
          if (preloadCount > maxPreloads)
            report("too-many-preloads", `Found ${preloadCount} preload links \u2014 more than ${maxPreloads} preloads compete for bandwidth and can hurt performance.`, "warn");
          const { max: maxPrefetches } = resolveOptions(ruleConfig, "too-many-prefetches", { max: 50 });
          const prefetchCount = tags.filter((t) => t.tag === "link" && t.props.rel === "prefetch").length;
          if (prefetchCount > maxPrefetches)
            report("too-many-prefetches", `Found ${prefetchCount} prefetch links. The configured maximum of ${maxPrefetches} is an advisory guardrail, not a standards limit. Large speculative fetch sets can consume bandwidth and cache capacity.`, "info");
          const { max: maxPreconnects } = resolveOptions(ruleConfig, "too-many-preconnects", { max: 4 });
          const preconnectCount = tags.filter((t) => t.tag === "link" && t.props.rel === "preconnect").length;
          if (preconnectCount > maxPreconnects)
            report("too-many-preconnects", `Found ${preconnectCount} preconnect links \u2014 each initiates a TCP+TLS handshake, more than ${maxPreconnects} compete for limited connections.`, "warn");
          const preconnectOrigins = /* @__PURE__ */ new Set();
          const dnsPrefetchTags = [];
          for (const tag of tags) {
            if (tag.tag === "link" && tag.props.href) {
              if (tag.props.rel === "preconnect")
                preconnectOrigins.add(tag.props.href);
              else if (tag.props.rel === "dns-prefetch")
                dnsPrefetchTags.push(tag);
            }
          }
          for (const tag of dnsPrefetchTags) {
            if (preconnectOrigins.has(tag.props.href))
              report("redundant-dns-prefetch", `dns-prefetch for "${tag.props.href}" is redundant \u2014 preconnect already includes DNS resolution.`, "info", tag);
          }
          const preloadScriptHrefs = /* @__PURE__ */ new Map();
          for (const tag of tags) {
            if (tag.tag === "link" && tag.props.rel === "preload" && tag.props.as === "script" && tag.props.href && tag.props.fetchpriority !== "low")
              preloadScriptHrefs.set(tag.props.href, tag);
          }
          for (const tag of tags) {
            if (tag.tag === "script" && tag.props.src && (tag.props.async || tag.props.defer)) {
              const preloadTag = preloadScriptHrefs.get(tag.props.src);
              if (preloadTag) {
                const attr = tag.props.async ? "async" : "defer";
                report("preload-async-defer-conflict", `Script "${tag.props.src}" is preloaded with "${attr}". Check whether early fetching is intentional.`, "off", preloadTag);
              }
            }
          }
          const preloadHrefs = /* @__PURE__ */ new Set();
          for (const tag of tags) {
            if (tag.tag === "link" && tag.props.rel === "preload" && tag.props.href)
              preloadHrefs.add(tag.props.href);
          }
          for (const tag of tags) {
            if (tag.tag === "link" && tag.props.rel === "prefetch" && tag.props.href && preloadHrefs.has(tag.props.href))
              report("prefetch-preload-conflict", `"${tag.props.href}" has both preload and prefetch \u2014 use preload for current page resources, prefetch for future navigation.`, "warn", tag);
          }
          if (!head.plugins.has("template-params")) {
            const tpTag = tags.find((t) => t.tag === "templateParams");
            if (tpTag) {
              report("missing-template-params-plugin", `templateParams are set but TemplateParamsPlugin is not registered. In v3, this plugin is opt-in. Add it to createHead({ plugins: [TemplateParamsPlugin] }).`, "warn", tpTag);
            } else {
              const tokenTag = tags.find((t) => {
                if (t.tag === "title" || t.tag === "titleTemplate")
                  return TEMPLATE_PARAM_TOKEN_RE.test(String(t.textContent ?? ""));
                if (t.tag === "meta")
                  return TEMPLATE_PARAM_TOKEN_RE.test(String(t.props.content ?? ""));
                return false;
              });
              if (tokenTag) {
                const text = String(tokenTag.tag === "meta" ? tokenTag.props.content : tokenTag.textContent);
                const token = TEMPLATE_PARAM_TOKEN_RE.exec(text)[0];
                report("missing-template-params-plugin", `A template param "${token}" is used but TemplateParamsPlugin is not registered, so it renders literally. In v3, this plugin is opt-in. Add it to createHead({ plugins: [TemplateParamsPlugin] }).`, "warn", tokenTag);
              }
            }
          }
          if (!head.plugins.has("aliasSorting")) {
            for (const tag of tags) {
              const p = typeof tag.tagPriority === "string" ? tag.tagPriority : "";
              if (p.startsWith("before:") || p.startsWith("after:")) {
                report("missing-alias-sorting-plugin", `Tag priority alias "${p}" requires AliasSortingPlugin. In v3, this plugin is opt-in. Add it to createHead({ plugins: [AliasSortingPlugin] }).`, "warn", tag);
                break;
              }
            }
          }
          const { max: maxHighPriority } = resolveOptions(ruleConfig, "too-many-fetchpriority-high", { max: 2 });
          const highPriorityCount = tags.filter((t) => t.props.fetchpriority === "high").length;
          if (highPriorityCount > maxHighPriority)
            report("too-many-fetchpriority-high", `Found ${highPriorityCount} resources with fetchpriority="high". When everything is high priority, nothing is. Limit to ${maxHighPriority} for the signal to be effective.`, "warn");
          const resourceHintsSeen = /* @__PURE__ */ new Map();
          for (const tag of tags) {
            if (tag.tag === "link" && tag.props.href && (tag.props.rel === "preload" || tag.props.rel === "prefetch" || tag.props.rel === "preconnect")) {
              const crossoriginSuffix = tag.props.rel === "preconnect" && "crossorigin" in tag.props ? ":cors" : "";
              const key = `${tag.props.rel}:${tag.props.href}${crossoriginSuffix}`;
              if (resourceHintsSeen.has(key))
                report("duplicate-resource-hint", `Duplicate ${tag.props.rel} for "${tag.props.href}".`, "warn", tag);
              else
                resourceHintsSeen.set(key, tag);
            }
          }
          if (head.ssr) {
            const { maxPosition: charsetMaxPos } = resolveOptions(ruleConfig, "charset-not-early", { maxPosition: 3 });
            const headElementTags = /* @__PURE__ */ new Set(["title", "base", "meta", "link", "style", "script", "noscript"]);
            const sortedHeadTags = tags.filter((t) => headElementTags.has(t.tag) && (!t.tagPosition || t.tagPosition === "head")).sort((a, b) => (a._w ?? 100) === (b._w ?? 100) ? (a._p ?? 0) - (b._p ?? 0) : (a._w ?? 100) - (b._w ?? 100));
            let charsetTag;
            let charsetPosition = -1;
            for (let i = 0; i < sortedHeadTags.length; i++) {
              const tag = sortedHeadTags[i];
              if (tag.tag === "meta" && ("charset" in tag.props || tag.props["http-equiv"]?.toLowerCase() === "content-type")) {
                charsetTag = tag;
                charsetPosition = i + 1;
                break;
              }
            }
            if (charsetTag && charsetPosition > charsetMaxPos)
              report("charset-not-early", `<meta charset> is at position ${charsetPosition} in <head>. It should be within the first ${charsetMaxPos} tags so the browser doesn't need to re-parse.`, "warn", charsetTag);
          }
          const moduleScriptSrcs = /* @__PURE__ */ new Set();
          for (const tag of tags) {
            if (tag.tag === "script" && tag.props.type === "module" && tag.props.src)
              moduleScriptSrcs.add(tag.props.src);
          }
          for (const tag of tags) {
            if (tag.tag === "link" && tag.props.rel === "preload" && tag.props.as === "script" && tag.props.href && moduleScriptSrcs.has(tag.props.href))
              report("preload-not-modulepreload", `"${tag.props.href}" is a module script but uses rel="preload". Use rel="modulepreload" instead to also trigger module parsing.`, "warn", tag);
          }
          const corsOrigins = /* @__PURE__ */ new Set();
          const preconnectCorsOrigins = /* @__PURE__ */ new Set();
          for (const tag of tags) {
            if (tag.tag === "link" && tag.props.href && "crossorigin" in tag.props) {
              const origin = extractOrigin(tag.props.href);
              if (origin) {
                corsOrigins.add(origin);
                if (tag.props.rel === "preconnect")
                  preconnectCorsOrigins.add(origin);
              }
            }
          }
          for (const tag of tags) {
            if (tag.tag === "link" && tag.props.rel === "preconnect" && tag.props.href && !("crossorigin" in tag.props)) {
              const origin = extractOrigin(tag.props.href);
              if (origin && corsOrigins.has(origin) && !preconnectCorsOrigins.has(origin))
                report("preconnect-missing-crossorigin", `Preconnect to "${tag.props.href}" is missing "crossorigin" but CORS resources are loaded from this origin. Without it, the browser opens a separate connection for CORS requests.`, "warn", tag);
            }
          }
          const { maxBytes: crawlerMaxBytes } = resolveOptions(ruleConfig, "meta-beyond-1mb", { maxBytes: 1048576 });
          let byteOffset = 0;
          for (const tag of tags) {
            if (tag.tagPosition && tag.tagPosition !== "head")
              continue;
            const props = Object.entries(tag.props).filter(([, v]) => v !== false && v != null).map(([k, v]) => v === true || v === "" ? ` ${k}` : ` ${k}="${v}"`).join("");
            const content = tag.innerHTML || tag.textContent || "";
            const tagSize = `<${tag.tag}${props}>${content}</${tag.tag}>
`.length;
            byteOffset += tagSize;
            if (byteOffset > crawlerMaxBytes && tag.tag === "meta") {
              const key = tag.props.property || tag.props.name || "unknown";
              report(
                "meta-beyond-1mb",
                `Meta tag "${key}" is rendered ~${(byteOffset / 1024).toFixed(0)}KB into <head>, beyond the ${(crawlerMaxBytes / 1048576).toFixed(0)}MB crawler parsing limit. Social crawlers (Facebook, Twitter) may not see it. Use \`tagPriority\` to promote it, or configure a custom \`tagWeight\` to reorder tags for bot requests.`,
                "warn",
                tag
              );
            }
          }
          dispatch(rules, "replace");
        }
      }
    };
  }, pluginKey);
}

export { CanonicalPlugin, InferSeoMetaPlugin, MinifyPlugin, ValidatePlugin, defineHeadPlugin };
