import { U as UniqueTags, c as TagsWithInnerContent, M as MetaTagsArrayable, i as isUnsafeKey, H as HasElementTags, T as TagConfigKeys, D as DupeableTags, d as UsesMergeStrategy, V as ValidHeadTags, h as hasContent } from './unhead.CGPOfp5O.mjs';
import { a as callHook } from './unhead.Bm4Y6XQI.mjs';

const META_NOREWRITE_RE = /^(?:viewport|description|keywords|robots)$/;
const META_KEY_ATTRS = ["name", "property", "http-equiv"];
function isMetaArrayDupeKey(v) {
  const i = v.indexOf(":");
  if (i === -1)
    return false;
  const key = v.slice(i + 1);
  return MetaTagsArrayable.has(key) || key.startsWith("og:image:") || key.startsWith("og:video:") || key.startsWith("og:audio:") || key.startsWith("twitter:image:");
}
function dedupeKey(tag) {
  const { props, tag: t, key } = tag;
  if (UniqueTags.has(t))
    return t;
  if (t === "link") {
    if (props.rel === "canonical")
      return "canonical";
    if (props.rel === "alternate" && props.hreflang)
      return `alternate:${props.hreflang}`;
  }
  if (props.charset)
    return "charset";
  if (t === "meta") {
    for (const n of META_KEY_ATTRS) {
      const v = props[n];
      if (v !== void 0)
        return `meta:${v}${(typeof v !== "string" || !v.includes(":")) && !META_NOREWRITE_RE.test(v) && key ? `:key:${key}` : ""}`;
    }
  }
  if (key)
    return `${t}:key:${key}`;
  if (props.id)
    return `${t}:id:${props.id}`;
  if (t === "link" && props.rel && props.href)
    return `link:${props.rel}:${props.href}`;
  return TagsWithInnerContent.has(t) && (tag.textContent || tag.innerHTML) ? `${t}:content:${tag.textContent || tag.innerHTML}` : void 0;
}
function hashTag(tag) {
  const identity = tag._h || tag._d || tag.textContent || tag.innerHTML;
  if (identity)
    return String(identity);
  const keys = Object.keys(tag.props).sort();
  let hash = `${tag.tag}:`;
  let separator = "";
  for (const key of keys) {
    hash += `${separator}${key}:${String(tag.props[key])}`;
    separator = ",";
  }
  return hash;
}

function walkResolver(val, resolve, key) {
  if (key === "_resolver")
    return val;
  if (typeof val === "function" && (!key || key !== "titleTemplate" && !key.startsWith("on")))
    val = val();
  const v = resolve ? resolve(key, val) : val;
  if (Array.isArray(v)) {
    let out;
    for (let i = 0; i < v.length; i++) {
      const r = walkResolver(v[i], resolve);
      if (out) {
        out[i] = r;
      } else if (r !== v[i]) {
        out = v.slice(0, i);
        out[i] = r;
      }
    }
    return out || v;
  }
  if (v?.constructor === Object) {
    let next;
    for (const k in v) {
      const unsafe = isUnsafeKey(k);
      const r = unsafe ? void 0 : walkResolver(v[k], resolve, k);
      if (!next && (unsafe || r !== v[k])) {
        next = {};
        for (const pk in v) {
          if (pk === k)
            break;
          next[pk] = v[pk];
        }
      }
      if (next && !unsafe)
        next[k] = r;
    }
    return next || v;
  }
  return v;
}

const INVALID_ATTR_NAME_RE = /[\s"'<>/=\x00-\x1F\x7F]/;

function normalizeStyleClassProps(key, value) {
  const isStyle = key === "style";
  const store = isStyle ? /* @__PURE__ */ new Map() : /* @__PURE__ */ new Set();
  const add = (v) => {
    if (!v)
      return;
    if (isStyle) {
      const i = v.indexOf(":");
      i > 0 && store.set(v.slice(0, i).trim(), v.slice(i + 1).trim());
    } else {
      v.split(" ").forEach((c) => c && store.add(c));
    }
  };
  if (typeof value === "string") {
    (isStyle ? value.split(";") : [value]).forEach(add);
  } else if (Array.isArray(value)) {
    value.forEach(add);
  } else if (value && typeof value === "object") {
    for (const k in value) {
      const v = value[k];
      v && v !== "false" && (isStyle ? store.set(k.trim(), String(v)) : add(k));
    }
  }
  return store;
}
function normalizeProps(tag, input) {
  tag.props = tag.props || {};
  if (!input)
    return tag;
  if (tag.tag === "templateParams") {
    tag.props = input;
    return tag;
  }
  const isHtmlTag = HasElementTags.has(tag.tag) || tag.tag === "htmlAttrs" || tag.tag === "bodyAttrs";
  for (const prop in input) {
    if (isUnsafeKey(prop))
      continue;
    const isData = prop.startsWith("data-");
    const isHtmlAttr = isHtmlTag && !TagConfigKeys.has(prop);
    const key = isHtmlAttr && !isData ? prop.toLowerCase() : prop;
    if (isHtmlAttr && (!key || INVALID_ATTR_NAME_RE.test(key)))
      continue;
    const value = input[prop];
    if (value === null) {
      tag.props[key] = null;
    } else if (prop === "class" || prop === "style") {
      tag.props[prop] = normalizeStyleClassProps(prop, value);
    } else if (TagConfigKeys.has(prop)) {
      if ((prop === "textContent" || prop === "innerHTML") && typeof value === "object") {
        const type = input.type || "application/json";
        if (type.endsWith("json") || type === "speculationrules" || type === "importmap") {
          tag.props.type = type;
          tag[prop] = JSON.stringify(value);
        }
      } else {
        tag[prop] = value;
      }
    } else if (value !== void 0) {
      const str = String(value);
      const isMeta = tag.tag === "meta" && key === "content";
      tag.props[key] = str === "true" || str === "" ? isData || isMeta ? str : true : !value && isData && str === "false" ? "false" : value;
    }
  }
  return tag;
}
function resolveHeadInput(input, propResolvers) {
  let resolve;
  if (propResolvers.length) {
    resolve = (key, val) => {
      for (let i = 0; i < propResolvers.length; i++)
        val = propResolvers[i](key, val);
      return val;
    };
    input = resolve(void 0, input);
  }
  return walkResolver(input, resolve);
}
function normalizeTag(tagName, _input) {
  const input = typeof _input === "object" && typeof _input !== "function" ? _input : { [tagName === "script" || tagName === "noscript" || tagName === "style" ? "innerHTML" : "textContent"]: _input };
  const tag = normalizeProps({ tag: tagName, props: {} }, input);
  if (tag.key && DupeableTags.has(tag.tag))
    tag.props["data-hid"] = tag._h = tag.key;
  if (tag.tag === "script" && typeof tag.innerHTML === "object") {
    tag.innerHTML = JSON.stringify(tag.innerHTML);
    tag.props.type = tag.props.type || "application/json";
  }
  if (Array.isArray(tag.props.content)) {
    const tags = [];
    for (const content of tag.props.content) {
      tags.push({ ...tag, props: { ...tag.props, content } });
    }
    return tags;
  }
  return tag;
}
function pushNormalizedTag(tags, tag) {
  if (Array.isArray(tag)) {
    for (const t of tag) tags.push(t);
  } else {
    tags.push(tag);
  }
}
function normalizeEntryToTags(input, propResolvers) {
  if (!input)
    return [];
  if (typeof input === "function")
    input = input();
  input = resolveHeadInput(input, propResolvers);
  const tags = [];
  for (const key in input) {
    const value = input[key];
    if (value !== void 0) {
      if (Array.isArray(value)) {
        for (const v of value) pushNormalizedTag(tags, normalizeTag(key, v));
      } else {
        pushNormalizedTag(tags, normalizeTag(key, value));
      }
    }
  }
  return tags;
}

const LT_RE = /</g;
const SCRIPT_END_RE = /<\/script/g;
const sortTags = (a, b) => a._w === b._w ? a._p - b._p : a._w - b._w;
const DEFAULT_TAG_WEIGHT = () => 100;
function isEmptyProps(props) {
  for (const _ in props)
    return false;
  return true;
}
const TAG_MUTATING_HOOK_RE = /^tags:|:render/;
function syncEntryHookCache(head, hooks) {
  const count = (hooks["entries:resolve"]?.length || 0) + (hooks["entries:normalize"]?.length || 0);
  if (head._h !== count) {
    head._h = count;
    for (const entry of head.entries.values())
      delete entry._tags;
  }
}
function cloneTagsInPlace(tags) {
  for (let i = 0; i < tags.length; i++) {
    const t = tags[i];
    const props = { ...t.props };
    if (props.class instanceof Set)
      props.class = new Set(props.class);
    if (props.style instanceof Map)
      props.style = new Map(props.style);
    tags[i] = { ...t, props };
  }
}
function valuesToTags(ctx, sortFlatMeta) {
  const tags = ctx.tags;
  let w = 0;
  for (const value of ctx.tagMap.values()) {
    if (Array.isArray(value)) {
      for (const tag of value) tags[w++] = tag;
    } else {
      tags[w++] = value;
    }
  }
  tags.length = w;
  if (sortFlatMeta)
    tags.sort(sortTags);
}
function dedupeTags(ctx) {
  let hasFlatMeta = false;
  for (const next of ctx.tags.sort(sortTags)) {
    const k = next._d || hashTag(next);
    if (!k)
      continue;
    const prev = ctx.tagMap.get(k);
    if (!prev) {
      ctx.tagMap.set(k, next);
      continue;
    }
    const strategy = next.tagDuplicateStrategy || (UsesMergeStrategy.has(next.tag) ? "merge" : null) || (next.key && next.key === prev.key ? "merge" : null);
    if (strategy === "merge") {
      const props = { ...prev.props };
      for (const p in next.props) {
        props[p] = p === "style" ? new Map([...prev.props.style || /* @__PURE__ */ new Map(), ...next.props[p]]) : p === "class" ? /* @__PURE__ */ new Set([...prev.props.class || [], ...next.props[p]]) : next.props[p];
      }
      ctx.tagMap.set(k, { ...next, props });
    } else if (next._p >> 10 === prev._p >> 10 && next.tag === "meta" && isMetaArrayDupeKey(k)) {
      ctx.tagMap.set(k, Object.assign([...Array.isArray(prev) ? prev : [prev], next], next));
      hasFlatMeta = true;
    } else if (next._w === prev._w ? next._p > prev._p : next._w < prev._w) {
      ctx.tagMap.set(k, next);
    }
  }
  return hasFlatMeta;
}
function resolveTitleTemplate(ctx, head) {
  const title = ctx.tagMap.get("title");
  const tpl = ctx.tagMap.get("titleTemplate");
  head._title = title?.textContent;
  if (!tpl)
    return;
  const fn = tpl.textContent;
  head._titleTemplate = fn;
  if (!fn)
    return;
  let v = typeof fn === "function" ? fn(title?.textContent) : fn;
  if (typeof v === "string" && !head.plugins.has("template-params"))
    v = v.replace("%s", title?.textContent || "");
  if (title) {
    v === null ? ctx.tagMap.delete("title") : ctx.tagMap.set("title", { ...title, textContent: v });
  } else {
    ctx.tagMap.set("titleTemplate", { ...tpl, tag: "title", textContent: v });
  }
}
function sanitizeTagsInPlace(tags) {
  let w = 0;
  for (let t of tags) {
    const { innerHTML, tag, props } = t;
    if (!ValidHeadTags.has(tag) || isEmptyProps(props) && !hasContent(innerHTML) && !hasContent(t.textContent))
      continue;
    if (tag === "meta") {
      if (!hasContent(props.content) && !props["http-equiv"] && !props.charset)
        continue;
    }
    if (tag === "script" && (innerHTML || t.textContent)) {
      const type = String(props.type);
      const isJsonLike = type.endsWith("json") || type === "importmap" || type === "speculationrules";
      const escape = (content) => isJsonLike ? (typeof content === "string" ? content : JSON.stringify(content)).replace(LT_RE, "\\u003C") : typeof content === "string" ? content.replace(SCRIPT_END_RE, "<\\/script") : content;
      t = { ...t };
      if (innerHTML)
        t.innerHTML = escape(innerHTML);
      if (t.textContent)
        t.textContent = escape(t.textContent);
      t._d = dedupeKey(t);
    }
    tags[w++] = t;
  }
  tags.length = w;
  return tags;
}
function sanitizeTags(tags) {
  return sanitizeTagsInPlace([...tags]);
}
function resolveTags(head, options) {
  const weightFn = options?.tagWeight ?? head.resolvedOptions._tagWeight ?? DEFAULT_TAG_WEIGHT;
  const ctx = { tagMap: /* @__PURE__ */ new Map(), tags: [] };
  const hooks = head.hooks?._hooks || {};
  syncEntryHookCache(head, hooks);
  for (const e of head.entries.values()) {
    if (e._pending !== void 0) {
      e.input = e._pending;
      delete e._pending;
      delete e._tags;
      delete e._precomputedTags;
    }
  }
  let entries;
  if (hooks["entries:resolve"]?.length || hooks["entries:normalize"]?.length) {
    entries = [...head.entries.values()];
    if (hooks["entries:resolve"]?.length)
      callHook(head, "entries:resolve", { entries, ...ctx });
  }
  syncEntryHookCache(head, hooks);
  for (const e of entries || head.entries.values()) {
    let tags = e._tags;
    if (!tags) {
      if (e._precomputedTags && weightFn === head.resolvedOptions._tagWeight && !hooks["entries:normalize"]?.length && !hooks["entries:resolve"]?.length && (!e.options || isEmptyProps(e.options))) {
        tags = e._precomputedTags;
      } else {
        tags = normalizeEntryToTags(e.input, head.resolvedOptions.propResolvers || []);
        if (e.options && !isEmptyProps(e.options)) {
          for (const t of tags)
            Object.assign(t, e.options);
        }
        if (hooks["entries:normalize"]?.length) {
          const normalizeCtx = { tags, entry: e };
          callHook(head, "entries:normalize", normalizeCtx);
          tags = normalizeCtx.tags;
        }
        for (let i = 0; i < tags.length; i++) {
          const t = tags[i];
          t._w = weightFn(t);
          t._p = (e._i << 10) + i;
          t._d = dedupeKey(t);
          if (!t._d)
            t._h = hashTag(t);
        }
        e._tags = tags;
      }
    }
    ctx.tags.push(...tags);
  }
  for (const name in hooks) {
    if (hooks[name]?.length && TAG_MUTATING_HOOK_RE.test(name)) {
      cloneTagsInPlace(ctx.tags);
      break;
    }
  }
  const hasFlatMeta = dedupeTags(ctx);
  resolveTitleTemplate(ctx, head);
  valuesToTags(ctx, hasFlatMeta);
  callHook(head, "tags:beforeResolve", ctx);
  callHook(head, "tags:resolve", ctx);
  callHook(head, "tags:afterResolve", ctx);
  return sanitizeTagsInPlace(ctx.tags);
}

export { INVALID_ATTR_NAME_RE as I, dedupeTags as a, normalizeProps as b, resolveTitleTemplate as c, dedupeKey as d, resolveHeadInput as e, hashTag as h, isMetaArrayDupeKey as i, normalizeEntryToTags as n, resolveTags as r, sanitizeTags as s, walkResolver as w };
