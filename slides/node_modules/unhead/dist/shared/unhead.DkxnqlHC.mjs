import { u as unpackMeta } from './unhead.o8j9utSy.mjs';
import { d as defineHeadPlugin } from './unhead.CHEy9ana.mjs';
import { h as hasContent, i as isUnsafeKey } from './unhead.CGPOfp5O.mjs';

const FlatMetaPlugin = /* @__PURE__ */ defineHeadPlugin({
  key: "flatMeta",
  hooks: {
    "entries:normalize": (ctx) => {
      let hasFlatMeta = false;
      const tags = [];
      const tagsToAdd = [];
      for (const t of ctx.tags) {
        if (t.tag !== "_flatMeta") {
          tags.push(t);
          continue;
        }
        hasFlatMeta = true;
        for (const props of unpackMeta(t.props))
          tagsToAdd.push({ ...t, tag: "meta", props });
      }
      if (!hasFlatMeta)
        return;
      for (const tag of tagsToAdd) tags.push(tag);
      ctx.tags = tags;
    }
  }
});

const WhitelistAttributes = {
  htmlAttrs: /* @__PURE__ */ new Set(["class", "style", "lang", "dir"]),
  bodyAttrs: /* @__PURE__ */ new Set(["class", "style"]),
  meta: /* @__PURE__ */ new Set(["name", "property", "charset", "content", "media"]),
  noscript: /* @__PURE__ */ new Set([]),
  style: /* @__PURE__ */ new Set(["media", "nonce", "title", "blocking"]),
  script: /* @__PURE__ */ new Set(["type", "textContent", "nonce", "blocking"]),
  link: /* @__PURE__ */ new Set(["color", "crossorigin", "fetchpriority", "href", "hreflang", "imagesrcset", "imagesizes", "integrity", "media", "referrerpolicy", "rel", "sizes", "type"])
};
const BlockedLinkRels = /* @__PURE__ */ new Set(["canonical", "modulepreload", "prerender", "preload", "prefetch", "dns-prefetch", "preconnect", "manifest", "pingback"]);
const SafeDataAttrName = /^[a-z][a-z0-9-]*[a-z0-9]$/i;
const AsciiWhitespace = /[\t\n\f\r ]+/;
const HtmlEntityHex = /&#x([0-9a-f]+);?/gi;
const HtmlEntityDec = /&#(\d+);?/g;
const HtmlEntityNamed = /&(tab|newline|colon|semi|lpar|rpar|sol|bsol|comma|period|excl|num|dollar|percnt|amp|apos|ast|plus|lt|gt|equals|quest|at|lsqb|rsqb|lcub|rcub|vert|hat|grave|tilde|nbsp);?/gi;
const ControlChars = /[\x00-\x20]+/g;
const NamedEntityMap = {
  tab: "	",
  newline: "\n",
  colon: ":",
  semi: ";",
  lpar: "(",
  rpar: ")",
  sol: "/",
  bsol: "\\",
  comma: ",",
  period: ".",
  excl: "!",
  num: "#",
  dollar: "$",
  percnt: "%",
  amp: "&",
  apos: "'",
  ast: "*",
  plus: "+",
  lt: "<",
  gt: ">",
  equals: "=",
  quest: "?",
  at: "@",
  lsqb: "[",
  rsqb: "]",
  lcub: "{",
  rcub: "}",
  vert: "|",
  hat: "^",
  grave: "`",
  tilde: "~",
  nbsp: "\xA0"
};
function safeFromCodePoint(codePoint) {
  if (codePoint > 1114111 || codePoint < 0 || Number.isNaN(codePoint))
    return "";
  return String.fromCodePoint(codePoint);
}
function decodeHtmlEntities(str) {
  return str.replace(HtmlEntityHex, (_, hex) => safeFromCodePoint(Number.parseInt(hex, 16))).replace(HtmlEntityDec, (_, dec) => safeFromCodePoint(Number(dec))).replace(HtmlEntityNamed, (_, name) => NamedEntityMap[name.toLowerCase()] || "");
}
function hasDangerousProtocol(url) {
  const entityDecoded = decodeHtmlEntities(url);
  const cleaned = entityDecoded.replace(ControlChars, "");
  let decoded;
  try {
    decoded = decodeURIComponent(cleaned);
  } catch {
    decoded = cleaned;
  }
  const sanitized = decoded.replace(ControlChars, "");
  const lower = sanitized.toLowerCase();
  return lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:");
}
function stripProtoKeys(obj) {
  if (Array.isArray(obj))
    return obj.map(stripProtoKeys);
  if (obj && typeof obj === "object") {
    const clean = {};
    for (const key of Object.keys(obj)) {
      if (isUnsafeKey(key))
        continue;
      clean[key] = stripProtoKeys(obj[key]);
    }
    return clean;
  }
  return obj;
}
function acceptDataAttrs(value, allowId = true) {
  const next = {};
  if (!value)
    return next;
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isData = key.startsWith("data-");
    if ((isData || allowId && key === "id") && SafeDataAttrName.test(key))
      next[key] = value[key];
  }
  return next;
}
function hasBlockedRel(rel) {
  const tokens = rel.split(AsciiWhitespace);
  return !tokens.some(Boolean) || tokens.some((token) => BlockedLinkRels.has(token.toLowerCase()));
}
function makeTagSafe(tag) {
  let next = {};
  const { tag: type, props: prev } = tag;
  switch (type) {
    // title: textContent is escaped in rendering (tagToString), no props needed
    case "title":
      break;
    // virtual tags, not rendered to HTML — but sanitize to prevent injection if rendered
    case "titleTemplate":
    case "templateParams":
      next = prev;
      break;
    case "htmlAttrs":
    case "bodyAttrs":
      WhitelistAttributes[type].forEach((attr) => {
        if (prev[attr]) {
          next[attr] = prev[attr];
        }
      });
      delete tag.innerHTML;
      delete tag.textContent;
      tag.props = { ...acceptDataAttrs(prev, false), ...next };
      return !Object.keys(tag.props).length ? false : tag;
    case "style":
      next = acceptDataAttrs(prev);
      WhitelistAttributes.style.forEach((key) => {
        if (prev[key]) {
          next[key] = prev[key];
        }
      });
      break;
    // meta is safe, except for http-equiv
    case "meta":
      WhitelistAttributes.meta.forEach((key) => {
        if (hasContent(prev[key])) {
          next[key] = prev[key];
        }
      });
      break;
    // link tags we block preloading, prerendering, prefetching, dns-prefetch, preconnect, manifest, etc
    case "link":
      WhitelistAttributes.link.forEach((key) => {
        const val = prev[key];
        if (!val) {
          return;
        }
        if (key === "rel" && (typeof val !== "string" || hasBlockedRel(val))) {
          return;
        }
        if (key === "href" || key === "imagesrcset") {
          if (typeof val !== "string") {
            return;
          }
          const urls = key === "imagesrcset" ? val.split(",").map((s) => s.trim()) : [val];
          if (urls.some((u) => hasDangerousProtocol(u))) {
            return;
          }
          next[key] = val;
        } else if (val) {
          next[key] = val;
        }
      });
      if (!next.href && !next.imagesrcset || !next.rel) {
        return false;
      }
      break;
    case "noscript":
      WhitelistAttributes.noscript.forEach((key) => {
        if (prev[key]) {
          next[key] = prev[key];
        }
      });
      break;
    // we only allow JSON in scripts
    case "script":
      if (!tag.textContent || typeof prev.type !== "string" || !prev.type.endsWith("json")) {
        return false;
      }
      try {
        const jsonVal = typeof tag.textContent === "string" ? JSON.parse(tag.textContent) : tag.textContent;
        tag.textContent = JSON.stringify(stripProtoKeys(jsonVal), null, 0);
      } catch {
        return false;
      }
      WhitelistAttributes.script.forEach((s) => {
        if (s !== "textContent" && prev[s]) {
          next[s] = prev[s];
        }
      });
      break;
  }
  delete tag.innerHTML;
  if (type !== "title" && type !== "script") {
    delete tag.textContent;
  }
  tag.props = { ...acceptDataAttrs(prev), ...next };
  if (!Object.keys(tag.props).length && !tag.tag.endsWith("Attrs") && !tag.textContent) {
    return false;
  }
  return tag;
}
const SafeInputPlugin = /* @__PURE__ */ defineHeadPlugin({
  key: "safe",
  hooks: {
    "entries:normalize": (ctx) => {
      if (ctx.entry.options?._safe) {
        ctx.tags = ctx.tags.reduce((acc, tag) => {
          const safeTag = makeTagSafe(tag);
          if (safeTag)
            acc.push(safeTag);
          return acc;
        }, []);
      }
    },
    "tags:afterResolve": (ctx) => {
      ctx.tags = ctx.tags.reduce((acc, tag) => {
        if (!tag._safe) {
          acc.push(tag);
          return acc;
        }
        if (tag.tag === "htmlAttrs" || tag.tag === "bodyAttrs") {
          acc.push(tag);
          return acc;
        }
        const safeTag = makeTagSafe(tag);
        if (safeTag)
          acc.push(safeTag);
        return acc;
      }, []);
    }
  }
});

export { FlatMetaPlugin as F, SafeInputPlugin as S };
