import { c as createUnhead } from './unhead.D7HkBzZn.mjs';
import { I as INVALID_ATTR_NAME_RE, r as resolveTags, n as normalizeEntryToTags, d as dedupeKey, h as hashTag } from './unhead.DJuZwX9c.mjs';
import { a as callHook, c as createHooks } from './unhead.Bm4Y6XQI.mjs';
import { b as TagPriorityAliases, a as SelfClosingTags, c as TagsWithInnerContent } from './unhead.CGPOfp5O.mjs';

const isTruthy = (v) => v === "" || v === true;
function capoTagWeight(tag) {
  if (typeof tag.tagPriority === "number")
    return tag.tagPriority;
  let weight = 100;
  const offset = TagPriorityAliases[tag.tagPriority] || 0;
  if (tag.tag === "base") {
    weight = -10;
  } else if (tag.tag === "title") {
    weight = 10;
  } else if (tag.tag === "meta") {
    weight = tag.props["http-equiv"] === "content-security-policy" ? -30 : tag.props.charset ? -20 : tag.props.name === "viewport" ? -15 : weight;
  } else if (tag.tag === "link" && tag.props.rel) {
    const rel = tag.props.rel;
    weight = rel === "preconnect" ? 20 : rel === "stylesheet" ? 60 : rel === "preload" || rel === "modulepreload" ? 70 : rel === "prefetch" || rel === "dns-prefetch" || rel === "prerender" ? 90 : weight;
  } else if (tag.tag === "script") {
    const type = typeof tag.props.type === "string" ? tag.props.type : "";
    const json = type.endsWith("json");
    if (type === "importmap")
      weight = 25;
    else if (type === "speculationrules")
      weight = 90;
    else if (isTruthy(tag.props.async))
      weight = 30;
    else if (tag.props.src && !isTruthy(tag.props.defer) && type !== "module" && !json || (tag.innerHTML || tag.textContent) && !json)
      weight = 50;
    else if (isTruthy(tag.props.defer) && tag.props.src || type === "module")
      weight = 80;
  } else if (tag.tag === "style") {
    weight = tag.innerHTML && /@import/.test(tag.innerHTML) ? 40 : 60;
  }
  return (weight || 100) + offset;
}

const DOUBLE_QUOTE_RE = /"/g;
function encodeAttribute(value) {
  const s = typeof value === "string" ? value : String(value);
  return s.includes('"') ? s.replace(DOUBLE_QUOTE_RE, "&quot;") : s;
}
function propsToString(props) {
  let attrs = "";
  for (const key in props) {
    if (!Object.hasOwn(props, key) || !key || INVALID_ATTR_NAME_RE.test(key))
      continue;
    let value = props[key];
    if (typeof value !== "string") {
      if (key === "class") {
        let out = "";
        for (const c of value) out += out ? ` ${c}` : c;
        value = out;
      } else if (key === "style") {
        let out = "";
        for (const [k, v] of value) out += out ? `;${k}:${v}` : `${k}:${v}`;
        value = out;
      }
    }
    if (value !== false && value !== null) {
      attrs += value === true ? ` ${key}` : ` ${key}="${encodeAttribute(value)}"`;
    }
  }
  return attrs;
}

const ESCAPE_HTML_RE = /[&<>"'/]/g;
const CLOSE_TAG_RE = {};
const ESCAPE_HTML_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;" };
function escapeHtml(str) {
  return str.replace(ESCAPE_HTML_RE, (c) => ESCAPE_HTML_MAP[c]);
}
function tagToString(tag) {
  const attrs = propsToString(tag.props);
  const openTag = `<${tag.tag}${attrs}>`;
  if (SelfClosingTags.has(tag.tag))
    return openTag;
  if (!TagsWithInnerContent.has(tag.tag))
    return `${openTag}</${tag.tag}>`;
  let content = String(tag.textContent ?? tag.innerHTML ?? "");
  content = tag.tag === "title" ? escapeHtml(content) : content.replace(CLOSE_TAG_RE[tag.tag] ||= new RegExp(`</${tag.tag}`, "gi"), `<\\/${tag.tag}`);
  return `${openTag}${content}</${tag.tag}>`;
}

function ssrRenderTags(tags, options) {
  const schema = { htmlAttrs: {}, bodyAttrs: {}, tags: { head: "", bodyClose: "", bodyOpen: "" } };
  const lineBreaks = !options?.omitLineBreaks ? "\n" : "";
  for (const tag of tags) {
    if (tag.tag === "htmlAttrs" || tag.tag === "bodyAttrs") {
      Object.assign(schema[tag.tag], tag.props);
      continue;
    }
    const s = tagToString(tag);
    const tagPosition = tag.tagPosition || "head";
    schema.tags[tagPosition] += schema.tags[tagPosition] ? `${lineBreaks}${s}` : s;
  }
  return {
    headTags: schema.tags.head,
    bodyTags: schema.tags.bodyClose,
    bodyTagsOpen: schema.tags.bodyOpen,
    htmlAttrs: propsToString(schema.htmlAttrs),
    bodyAttrs: propsToString(schema.bodyAttrs)
  };
}

// @__NO_SIDE_EFFECTS__
function createServerRenderer(options = {}) {
  return (head) => {
    const beforeRenderCtx = { shouldRender: true };
    callHook(head, "ssr:beforeRender", beforeRenderCtx);
    if (!beforeRenderCtx.shouldRender)
      return ssrRenderTags([]);
    const ctx = {
      tags: options.resolvedTags || resolveTags(head, { tagWeight: options.tagWeight ?? capoTagWeight }),
      options: { ...options }
    };
    callHook(head, "ssr:render", ctx);
    const html = ssrRenderTags(ctx.tags, ctx.options);
    const renderCtx = { tags: ctx.tags, html };
    callHook(head, "ssr:rendered", renderCtx);
    return renderCtx.html;
  };
}
// @__NO_SIDE_EFFECTS__
function renderSSRHead(head, options) {
  return (/* @__PURE__ */ createServerRenderer(options))(head);
}

const DEFAULT_INIT = {
  htmlAttrs: {
    lang: "en"
  },
  meta: [
    {
      charset: "utf-8"
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1"
    }
  ]
};
const serverPropResolver = /* @__PURE__ */ Object.assign(
  (k, v) => {
    if (k && k.startsWith("on") && typeof v === "function") {
      return `this.dataset.${k}fired = true`;
    }
    return v;
  },
  { _static: true }
);
let defaultInitTags;
function getDefaultInitTags() {
  if (!defaultInitTags) {
    defaultInitTags = normalizeEntryToTags(DEFAULT_INIT, []);
    for (let i = 0; i < defaultInitTags.length; i++) {
      const t = defaultInitTags[i];
      t._w = capoTagWeight(t);
      t._p = (1 << 10) + i;
      t._d = dedupeKey(t);
      if (!t._d)
        t._h = hashTag(t);
    }
  }
  return defaultInitTags;
}
// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const tagWeight = options.tagWeight || capoTagWeight;
  const core = createUnhead(createServerRenderer({ tagWeight, omitLineBreaks: options.omitLineBreaks }), {
    _tagWeight: tagWeight,
    // @ts-expect-error untyped
    document: false,
    experimentalStreamKey: options.experimentalStreamKey,
    propResolvers: [
      ...options.propResolvers || [],
      serverPropResolver
    ],
    init: [
      options.disableDefaults ? void 0 : DEFAULT_INIT,
      ...options.init || []
    ]
  });
  if (!options.disableDefaults && !options.tagWeight && !options.propResolvers?.some((r) => !r._static)) {
    const defaultEntry = core.entries.get(1);
    if (defaultEntry)
      defaultEntry._precomputedTags = getDefaultInitTags();
  }
  core.hooks = createHooks(options.hooks);
  options.plugins?.forEach((p) => core.use(p));
  return core;
}

export { capoTagWeight as a, createServerRenderer as b, createHead as c, escapeHtml as e, propsToString as p, renderSSRHead as r, ssrRenderTags as s, tagToString as t };
