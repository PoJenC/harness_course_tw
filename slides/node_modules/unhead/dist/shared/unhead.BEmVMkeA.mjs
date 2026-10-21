const URL_META_KEYS = /* @__PURE__ */ new Set([
  "og:url",
  "og:image",
  "og:image:url",
  "og:image:secure_url",
  "og:video",
  "og:video:url",
  "og:video:secure_url",
  "og:audio",
  "og:audio:url",
  "og:audio:secure_url",
  "twitter:image",
  "twitter:image:src",
  "twitter:player",
  "twitter:player:stream",
  "payment:success_url"
]);
const KNOWN_META_PROPERTIES = /* @__PURE__ */ new Set([
  "article:author",
  "article:expiration_time",
  "article:modified_time",
  "article:published_time",
  "article:section",
  "article:tag",
  "book:author",
  "book:isbn",
  "book:release_date",
  "book:tag",
  "fb:app_id",
  "og:audio",
  "og:audio:secure_url",
  "og:audio:type",
  "og:audio:url",
  "og:description",
  "og:determiner",
  "og:image",
  "og:image:alt",
  "og:image:height",
  "og:image:secure_url",
  "og:image:type",
  "og:image:url",
  "og:image:width",
  "og:locale",
  "og:locale:alternate",
  "og:site_name",
  "og:title",
  "og:type",
  "og:url",
  "og:video",
  "og:video:alt",
  "og:video:duration",
  "og:video:height",
  "og:video:secure_url",
  "og:video:type",
  "og:video:url",
  "og:video:width",
  "payment:amount",
  "payment:currency",
  "payment:description",
  "payment:expires_at",
  "payment:id",
  "payment:status",
  "payment:success_url",
  "profile:first_name",
  "profile:gender",
  "profile:last_name",
  "profile:username"
]);
const KNOWN_META_NAMES = /* @__PURE__ */ new Set([
  "apple-itunes-app",
  "apple-mobile-web-app-capable",
  "apple-mobile-web-app-status-bar-style",
  "apple-mobile-web-app-title",
  "application-name",
  "author",
  "color-scheme",
  "creator",
  "description",
  "fb:app_id",
  "fediverse:creator",
  "format-detection",
  "generator",
  "google-site-verification",
  "google",
  "googlebot",
  "keywords",
  "mobile-web-app-capable",
  "msapplication-config",
  "msapplication-tilecolor",
  "msapplication-tileimage",
  "publisher",
  "rating",
  "referrer",
  "robots",
  "theme-color",
  "viewport",
  "twitter:app:id:googleplay",
  "twitter:app:id:ipad",
  "twitter:app:id:iphone",
  "twitter:app:name:googleplay",
  "twitter:app:name:ipad",
  "twitter:app:name:iphone",
  "twitter:app:url:googleplay",
  "twitter:app:url:ipad",
  "twitter:app:url:iphone",
  "twitter:card",
  "twitter:creator",
  "twitter:creator:id",
  "twitter:data:1",
  "twitter:data:2",
  "twitter:description",
  "twitter:image",
  "twitter:image:alt",
  "twitter:label:1",
  "twitter:label:2",
  "twitter:player",
  "twitter:player:height",
  "twitter:player:stream",
  "twitter:player:width",
  "twitter:site",
  "twitter:site:id",
  "twitter:title"
]);
const TAG_PRIORITY_ALIASES = ["critical", "high", "low"];
const DEPRECATED_PROPS = {
  children: { replacement: "innerHTML", ruleId: "deprecated-prop-children" },
  hid: { replacement: "key", ruleId: "deprecated-prop-hid-vmid" },
  vmid: { replacement: "key", ruleId: "deprecated-prop-hid-vmid" },
  body: { replacement: "tagPosition: 'bodyClose'", ruleId: "deprecated-prop-body" }
};

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    d[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = d[j];
      d[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, d[j], d[j - 1]);
      prev = tmp;
    }
  }
  return d[n];
}
function findClosestMatch(value, knownSet) {
  const threshold = value.length <= 8 ? 2 : 3;
  let best;
  let bestDist = threshold + 1;
  for (const known of knownSet) {
    if (Math.abs(known.length - value.length) > threshold)
      continue;
    const dist = levenshtein(value, known);
    if (dist < bestDist) {
      bestDist = dist;
      best = known;
    }
  }
  return best;
}

const emptyMetaContent = (tag) => {
  if (tag.tagType !== "meta")
    return [];
  if (!tag.keys.has("content"))
    return [];
  if (tag.props.content !== "")
    return [];
  const key = typeof tag.props.name === "string" && tag.props.name || typeof tag.props.property === "string" && tag.props.property || "meta";
  const diag = {
    ruleId: "empty-meta-content",
    message: `Meta tag "${key}" has empty content.`,
    at: { kind: "prop", key: "content" }
  };
  return [diag];
};

const RESOLVABLE_OBJECT = ["boolean", "function", "null", "object"];
const RESOLVABLE_TAG_LIST = ["array", "boolean", "function", "null"];
const RESOLVABLE_TITLE = ["boolean", "function", "null", "number", "object", "string"];
const ATTRIBUTE_SCALAR = ["boolean", "function", "null", "number", "string"];
const ATTRIBUTE_STRUCTURED = ["array", "boolean", "function", "null", "number", "object", "string"];
const INPUT_SHAPE_FIELDS = {
  base: {
    canonical: "base",
    contexts: { head: RESOLVABLE_OBJECT }
  },
  bodyattrs: {
    canonical: "bodyAttrs",
    contexts: { head: RESOLVABLE_OBJECT }
  },
  class: {
    canonical: "class",
    contexts: {
      bodyAttrs: ATTRIBUTE_STRUCTURED,
      htmlAttrs: ATTRIBUTE_STRUCTURED
    }
  },
  htmlattrs: {
    canonical: "htmlAttrs",
    contexts: { head: RESOLVABLE_OBJECT }
  },
  link: {
    canonical: "link",
    contexts: { head: RESOLVABLE_TAG_LIST }
  },
  meta: {
    canonical: "meta",
    contexts: { head: RESOLVABLE_TAG_LIST }
  },
  noscript: {
    canonical: "noscript",
    contexts: { head: RESOLVABLE_TAG_LIST }
  },
  script: {
    canonical: "script",
    contexts: { head: RESOLVABLE_TAG_LIST }
  },
  style: {
    canonical: "style",
    contexts: {
      bodyAttrs: ATTRIBUTE_STRUCTURED,
      head: RESOLVABLE_TAG_LIST,
      htmlAttrs: ATTRIBUTE_STRUCTURED
    }
  },
  templateparams: {
    canonical: "templateParams",
    contexts: { head: ["object"] }
  },
  title: {
    canonical: "title",
    contexts: {
      bodyAttrs: ATTRIBUTE_SCALAR,
      head: RESOLVABLE_TITLE,
      htmlAttrs: ATTRIBUTE_SCALAR,
      seoMeta: RESOLVABLE_TITLE
    }
  },
  titletemplate: {
    canonical: "titleTemplate",
    contexts: {
      head: ["function", "null", "object", "string"],
      seoMeta: ["function", "null", "object", "string"]
    }
  }
};
function includes(kinds, kind) {
  return kinds?.includes(kind) === true;
}
function formatKinds(kinds) {
  return kinds.join(", ");
}
function invalidKnownHeadField(input, key, shape, kind) {
  const expected = shape.contexts[input.context];
  if (includes(expected, kind))
    return void 0;
  if ((input.context === "htmlAttrs" || input.context === "bodyAttrs") && kind === "null")
    return void 0;
  if (input.context === "head") {
    return {
      ruleId: "invalid-input-shape",
      message: `"${shape.canonical}" in a head input must be one of: ${formatKinds(expected || [])}. Received ${kind}.`,
      at: { kind: "prop-value", key }
    };
  }
  if (includes(shape.contexts.head, kind)) {
    return {
      ruleId: "invalid-input-shape",
      message: `"${shape.canonical}" has a head input shape but appears in ${input.context}. Move it to the top-level head input.`,
      at: { kind: "prop-value", key }
    };
  }
}
function invalidAttributeField(input, key, kind) {
  if (includes(ATTRIBUTE_SCALAR, kind))
    return void 0;
  return {
    ruleId: "invalid-input-shape",
    message: `"${key}" in ${input.context} must resolve to a scalar attribute value. Received ${kind}.`,
    at: { kind: "prop-value", key }
  };
}
function validateInputShape(input) {
  const diagnostics = [];
  const isAttributes = input.context === "htmlAttrs" || input.context === "bodyAttrs";
  for (const key of input.keys) {
    const kind = input.valueKinds.get(key) ?? "unknown";
    if (kind === "unknown")
      continue;
    const shape = INPUT_SHAPE_FIELDS[key.toLowerCase()];
    const knownDiagnostic = shape ? invalidKnownHeadField(input, key, shape, kind) : void 0;
    if (knownDiagnostic) {
      diagnostics.push(knownDiagnostic);
      continue;
    }
    if (isAttributes && !shape?.contexts[input.context]) {
      const attributeDiagnostic = invalidAttributeField(input, key, kind);
      if (attributeDiagnostic)
        diagnostics.push(attributeDiagnostic);
    }
  }
  return diagnostics;
}

const noDeprecatedProps = (tag) => {
  const out = [];
  for (const key of tag.keys) {
    if (!(key in DEPRECATED_PROPS))
      continue;
    const { replacement } = DEPRECATED_PROPS[key];
    if (key === "body") {
      if (tag.props.body !== true)
        continue;
      const fix2 = tag.keys.has("tagPosition") ? void 0 : { type: "replace-prop", key: "body", newSource: `tagPosition: 'bodyClose'` };
      out.push({
        ruleId: "deprecated-prop-body",
        message: `"body" was removed in v3 of unhead. Use "${replacement}" instead.`,
        at: { kind: "prop", key },
        fix: fix2
      });
      continue;
    }
    const newKey = key === "children" ? "innerHTML" : "key";
    const fix = tag.keys.has(newKey) ? void 0 : { type: "rename-prop", key, newKey };
    out.push({
      ruleId: key === "children" ? "deprecated-prop-children" : "deprecated-prop-hid-vmid",
      message: `"${key}" was removed in v3 of unhead. Use "${replacement}" instead.`,
      at: { kind: "prop", key },
      fix
    });
  }
  return out;
};

const HTML_CHARS_RE = /[<>]/;
const noHtmlInTitle = (input) => {
  const title = input.props.title;
  if (typeof title !== "string" || !HTML_CHARS_RE.test(title))
    return [];
  const diag = {
    ruleId: "html-in-title",
    message: `Title contains HTML characters which will be escaped, not rendered: "${title}".`,
    at: { kind: "prop-value", key: "title" }
  };
  return [diag];
};

const OG_PREFIX_RE = /^(?:og|article|book|profile|fb):/;
const noUnknownMeta = (tag) => {
  if (tag.tagType !== "meta")
    return [];
  const out = [];
  const property = tag.props.property;
  if (typeof property === "string" && !KNOWN_META_PROPERTIES.has(property) && OG_PREFIX_RE.test(property)) {
    const suggestion = findClosestMatch(property, KNOWN_META_PROPERTIES);
    if (suggestion) {
      out.push({
        ruleId: "possible-typo",
        message: `Unknown meta property "${property}". Did you mean "${suggestion}"?`,
        at: { kind: "prop-value", key: "property" },
        fix: { type: "replace-prop-value", key: "property", newSource: `'${suggestion}'` }
      });
    }
  }
  const name = tag.props.name;
  if (typeof name === "string") {
    const lower = name.toLowerCase();
    if (!KNOWN_META_NAMES.has(lower) && (lower.startsWith("twitter:") || lower.startsWith("fediverse:") || !lower.includes(":"))) {
      const suggestion = findClosestMatch(lower, KNOWN_META_NAMES);
      if (suggestion) {
        out.push({
          ruleId: "possible-typo",
          message: `Unknown meta name "${name}". Did you mean "${suggestion}"?`,
          at: { kind: "prop-value", key: "name" },
          fix: { type: "replace-prop-value", key: "name", newSource: `'${suggestion}'` }
        });
      }
    }
  }
  return out;
};

function isAbsolute(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}
const nonAbsoluteCanonical = (tag) => {
  if (tag.tagType !== "link")
    return [];
  if (tag.props.rel !== "canonical")
    return [];
  const href = tag.props.href;
  if (typeof href !== "string")
    return [];
  if (isAbsolute(href))
    return [];
  const diag = {
    ruleId: "non-absolute-canonical",
    message: `Canonical URL should be absolute, received "${href}".`,
    at: { kind: "prop-value", key: "href" }
  };
  return [diag];
};

const ALIASES = ["critical", "high", "low"];
const numericTagPriority = (tag) => {
  const value = tag.props.tagPriority;
  if (typeof value !== "number")
    return [];
  const diag = {
    ruleId: "numeric-tag-priority",
    message: `Numeric tagPriority (${value}) is brittle. Prefer an alias ('critical' | 'high' | 'low') or 'before:<key>' / 'after:<key>'.`,
    at: { kind: "prop-value", key: "tagPriority" },
    suggestions: ALIASES.map((alias) => ({
      message: `Replace with '${alias}'`,
      fix: { type: "replace-prop-value", key: "tagPriority", newSource: `'${alias}'` }
    }))
  };
  return [diag];
};

const TAG_TO_HELPER = {
  link: "defineLink",
  script: "defineScript"
};
const preferDefineHelpers = (tag, ctx) => {
  if (!tag.inArray)
    return [];
  const helper = TAG_TO_HELPER[tag.tagType];
  if (!helper)
    return [];
  const localName = ctx?.importedHelpers?.get(helper);
  const imported = localName !== void 0;
  const fix = { type: "wrap-tag", wrapWith: localName ?? helper };
  const diag = {
    ruleId: "prefer-define-helpers",
    message: `Wrap this ${tag.tagType} entry in \`${helper}()\` so unhead can narrow its type.`,
    fix: imported ? fix : void 0,
    suggestions: imported ? void 0 : [{ message: `Wrap in \`${helper}()\` (you may need to import it).`, fix: { type: "wrap-tag", wrapWith: helper } }]
  };
  return [diag];
};

const preloadMissingAs = (tag) => {
  if (tag.tagType !== "link")
    return [];
  if (tag.props.rel !== "preload")
    return [];
  if (tag.keys.has("as"))
    return [];
  const diag = {
    ruleId: "preload-missing-as",
    message: 'Preload link is missing the required "as" attribute.'
  };
  return [diag];
};
const preloadFontCrossorigin = (tag) => {
  if (tag.tagType !== "link")
    return [];
  if (tag.props.rel !== "preload")
    return [];
  if (tag.props.as !== "font")
    return [];
  if (tag.keys.has("crossorigin"))
    return [];
  const diag = {
    ruleId: "preload-font-crossorigin",
    message: 'Font preload requires "crossorigin" \u2014 without it the font will be fetched twice.',
    fix: { type: "insert-after-prop", afterKey: "as", insert: `, crossorigin: 'anonymous'` }
  };
  return [diag];
};

const robotsConflict = (tag) => {
  if (tag.tagType !== "meta")
    return [];
  if (tag.props.name !== "robots")
    return [];
  const content = tag.props.content;
  if (typeof content !== "string")
    return [];
  const directives = content.toLowerCase().split(",").map((d) => d.trim());
  const out = [];
  if (directives.includes("index") && directives.includes("noindex")) {
    out.push({
      ruleId: "robots-conflict",
      message: 'Robots meta has conflicting "index" and "noindex" directives.'
    });
  }
  if (directives.includes("follow") && directives.includes("nofollow")) {
    out.push({
      ruleId: "robots-conflict",
      message: 'Robots meta has conflicting "follow" and "nofollow" directives.'
    });
  }
  return out;
};

const deferOnModuleScript = (tag) => {
  if (tag.tagType !== "script")
    return [];
  if (tag.props.type !== "module")
    return [];
  if (tag.props.defer !== true)
    return [];
  const diag = {
    ruleId: "defer-on-module-script",
    message: '"defer" is redundant on module scripts. Modules are deferred by default.',
    at: { kind: "prop", key: "defer" },
    fix: { type: "remove-prop", key: "defer" }
  };
  return [diag];
};
const scriptSrcWithContent = (tag) => {
  if (tag.tagType !== "script")
    return [];
  if (typeof tag.props.src !== "string")
    return [];
  const hasInner = tag.keys.has("innerHTML") && tag.props.innerHTML !== "" || tag.keys.has("textContent") && tag.props.textContent !== "";
  if (!hasInner)
    return [];
  const diag = {
    ruleId: "script-src-with-content",
    message: 'Script has both "src" and inline content. The browser will ignore the inline content.'
  };
  return [diag];
};

const NUMERIC_RE = /^\d+$/;
const twitterHandleMissingAt = (tag) => {
  if (tag.tagType !== "meta")
    return [];
  const name = tag.props.name;
  if (name !== "twitter:site" && name !== "twitter:creator")
    return [];
  const content = tag.props.content;
  if (typeof content !== "string")
    return [];
  if (content.startsWith("@") || NUMERIC_RE.test(content))
    return [];
  const fixedSource = JSON.stringify(`@${content}`);
  const diag = {
    ruleId: "twitter-handle-missing-at",
    message: `${name} should start with "@", received "${content}".`,
    at: { kind: "prop-value", key: "content" },
    fix: { type: "replace-prop-value", key: "content", newSource: fixedSource }
  };
  return [diag];
};

const USER_SCALABLE_NO_RE = /user-scalable\s*=\s*(?:no|0|false)(?:[\s,;]|$)/i;
const MAX_SCALE_RE = /maximum-scale\s*=\s*1(?:\.\d+)?(?:[\s,;]|$)/i;
const viewportUserScalable = (tag) => {
  if (tag.tagType !== "meta")
    return [];
  if (tag.props.name !== "viewport")
    return [];
  const content = tag.props.content;
  if (typeof content !== "string")
    return [];
  const out = [];
  if (USER_SCALABLE_NO_RE.test(content)) {
    out.push({
      ruleId: "viewport-user-scalable",
      message: 'viewport "user-scalable=no" prevents zooming and harms accessibility.'
    });
  }
  if (MAX_SCALE_RE.test(content)) {
    out.push({
      ruleId: "viewport-user-scalable",
      message: 'viewport "maximum-scale=1" limits zooming and may harm accessibility.'
    });
  }
  return out;
};

const TAG_TYPES = /* @__PURE__ */ new Set(["meta", "link", "script", "noscript", "style"]);
function valueKind(value) {
  if (value === null)
    return "null";
  if (Array.isArray(value))
    return "array";
  const kind = typeof value;
  if (kind === "boolean" || kind === "function" || kind === "number" || kind === "object" || kind === "string")
    return kind;
  return "unknown";
}
function inputShapeFromRuntime(context, input) {
  const keys = /* @__PURE__ */ new Set();
  const valueKinds = /* @__PURE__ */ new Map();
  for (const [key, value] of Object.entries(input)) {
    keys.add(key);
    valueKinds.set(key, valueKind(value));
  }
  return { context, keys, valueKinds };
}
function tagInputFromRuntime(tag) {
  if (!TAG_TYPES.has(tag.tag))
    return void 0;
  const props = {};
  const keys = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(tag.props)) {
    keys.add(k);
    if (v == null) {
      if (tag.tag === "meta" && k === "content")
        props[k] = "";
      continue;
    }
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      if (tag.tag === "meta" && k === "name" && typeof v === "string")
        props[k] = v.toLowerCase();
      else
        props[k] = v;
    } else {
      props[k] = String(v);
    }
  }
  if (tag.tag === "script" || tag.tag === "style" || tag.tag === "noscript") {
    if (tag.innerHTML != null && tag.innerHTML !== "") {
      keys.add("innerHTML");
    }
    if (tag.textContent != null && tag.textContent !== "") {
      keys.add("textContent");
    }
  }
  if (tag.tagPriority != null) {
    keys.add("tagPriority");
    if (typeof tag.tagPriority === "string" || typeof tag.tagPriority === "number")
      props.tagPriority = tag.tagPriority;
  }
  return {
    tagType: tag.tag,
    props,
    keys
  };
}
function titleInputFromRuntime(titleTag) {
  if (titleTag.tag !== "title")
    return void 0;
  const text = titleTag.textContent ?? titleTag.innerHTML ?? "";
  return {
    callee: "runtime",
    props: { title: text },
    keys: /* @__PURE__ */ new Set(["title"])
  };
}

const tagPredicates = {
  "defer-on-module-script": deferOnModuleScript,
  "empty-meta-content": emptyMetaContent,
  "no-deprecated-props": noDeprecatedProps,
  "no-unknown-meta": noUnknownMeta,
  "non-absolute-canonical": nonAbsoluteCanonical,
  "numeric-tag-priority": numericTagPriority,
  "preload-font-crossorigin": preloadFontCrossorigin,
  "preload-missing-as": preloadMissingAs,
  "robots-conflict": robotsConflict,
  "script-src-with-content": scriptSrcWithContent,
  "twitter-handle-missing-at": twitterHandleMissingAt,
  "viewport-user-scalable": viewportUserScalable
};
const inputShapePredicates = {
  "invalid-input-shape": validateInputShape
};
const migrationTagPredicates = {
  "prefer-define-helpers": preferDefineHelpers
};
const headInputPredicates = {
  "no-html-in-title": noHtmlInTitle
};

export { DEPRECATED_PROPS as D, INPUT_SHAPE_FIELDS as I, KNOWN_META_NAMES as K, TAG_PRIORITY_ALIASES as T, URL_META_KEYS as U, KNOWN_META_PROPERTIES as a, inputShapePredicates as b, noHtmlInTitle as c, deferOnModuleScript as d, emptyMetaContent as e, findClosestMatch as f, noUnknownMeta as g, headInputPredicates as h, inputShapeFromRuntime as i, nonAbsoluteCanonical as j, numericTagPriority as k, levenshtein as l, migrationTagPredicates as m, noDeprecatedProps as n, preloadFontCrossorigin as o, preferDefineHelpers as p, preloadMissingAs as q, robotsConflict as r, scriptSrcWithContent as s, tagInputFromRuntime as t, tagPredicates as u, titleInputFromRuntime as v, twitterHandleMissingAt as w, validateInputShape as x, viewportUserScalable as y };
