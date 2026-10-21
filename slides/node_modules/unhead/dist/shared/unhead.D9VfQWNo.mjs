import { d as defineHeadPlugin } from './unhead.CHEy9ana.mjs';
import { p as processTemplateParams } from './unhead.DspMpm6y.mjs';

const sortTags = (a, b) => a._w === b._w ? a._p - b._p : a._w - b._w;
const formatKey = (k) => !k.includes(":key") ? k.split(":").join(":key:") : k;
const AliasSortingPlugin = /* @__PURE__ */ defineHeadPlugin({
  key: "aliasSorting",
  hooks: {
    "tags:resolve": (ctx) => {
      let m = false;
      for (const t of ctx.tags) {
        const p = t.tagPriority;
        if (!p)
          continue;
        const s = String(p);
        if (s.startsWith("before:")) {
          const k = formatKey(s.slice(7));
          const l = ctx.tagMap.get(k);
          if (l) {
            if (typeof l.tagPriority === "number")
              t.tagPriority = l.tagPriority;
            t._p = l._p - 1;
            m = true;
          }
        } else if (s.startsWith("after:")) {
          const k = formatKey(s.slice(6));
          const l = ctx.tagMap.get(k);
          if (l) {
            if (typeof l.tagPriority === "number")
              t.tagPriority = l.tagPriority;
            t._p = l._p + 1;
            m = true;
          }
        }
      }
      if (m)
        ctx.tags = ctx.tags.sort(sortTags);
    }
  }
});

const DeprecationsPlugin = /* @__PURE__ */ defineHeadPlugin({
  key: "deprecations",
  hooks: {
    "entries:normalize": ({ tags }) => {
      for (const tag of tags) {
        if (tag.props.children) {
          tag.innerHTML = tag.props.children;
          delete tag.props.children;
        }
        if (tag.props.hid) {
          tag.key = tag.props.hid;
          delete tag.props.hid;
        }
        if (tag.props.vmid) {
          tag.key = tag.props.vmid;
          delete tag.props.vmid;
        }
        if ("body" in tag.props) {
          if (tag.props.body) {
            tag.tagPosition = "bodyClose";
          }
          delete tag.props.body;
        }
        if (tag.props.renderPriority != null) {
          tag.tagPriority = tag.props.renderPriority;
          delete tag.props.renderPriority;
        }
      }
    }
  }
});

function isThenable(v) {
  return typeof v?.then === "function";
}
const maxSyncPrefix = 256;
function walkArrayPromises(v, index) {
  if (index === v.length)
    return;
  if (index === maxSyncPrefix) {
    const values2 = new Array(v.length);
    let hasThenable = false;
    for (; index < v.length; index++) {
      const value2 = walkPromises(v[index]);
      values2[index] = value2;
      hasThenable ||= isThenable(value2);
    }
    return hasThenable ? values2 : void 0;
  }
  const value = walkPromises(v[index]);
  if (isThenable(value)) {
    const values2 = new Array(v.length);
    values2[index] = value;
    for (let rest = index + 1; rest < v.length; rest++)
      values2[rest] = walkPromises(v[rest]);
    return values2;
  }
  const values = walkArrayPromises(v, index + 1);
  if (values)
    values[index] = value;
  return values;
}
function walkObjectPromises(v, keys, index) {
  if (index === keys.length)
    return;
  if (index === maxSyncPrefix) {
    const values2 = new Array(keys.length);
    let hasThenable = false;
    for (; index < keys.length; index++) {
      const value2 = walkPromises(v[keys[index]]);
      values2[index] = value2;
      hasThenable ||= isThenable(value2);
    }
    return hasThenable ? values2 : void 0;
  }
  const value = walkPromises(v[keys[index]]);
  if (isThenable(value)) {
    const values2 = new Array(keys.length);
    values2[index] = value;
    for (let rest = index + 1; rest < keys.length; rest++)
      values2[rest] = walkPromises(v[keys[rest]]);
    return values2;
  }
  const values = walkObjectPromises(v, keys, index + 1);
  if (values)
    values[index] = value;
  return values;
}
function walkPromises(v) {
  if (typeof v === "function")
    return v;
  if (isThenable(v))
    return Promise.resolve(v).then(walkPromises);
  if (Array.isArray(v)) {
    const values = walkArrayPromises(v, 0);
    return values ? Promise.all(values) : v;
  }
  if (v?.constructor === Object) {
    const keys = Object.keys(v);
    const values = walkObjectPromises(v, keys, 0);
    if (values) {
      return Promise.all(values).then((resolved) => Object.fromEntries(
        keys.map((key, index) => [key, resolved[index]])
      ));
    }
  }
  return v;
}
const PromisesPlugin = /* @__PURE__ */ defineHeadPlugin((head) => {
  const pending = /* @__PURE__ */ new WeakMap();
  return {
    key: "promises",
    hooks: {
      "entries:resolve": (ctx) => {
        for (let index = ctx.entries.length - 1; index >= 0; index--) {
          const entry = ctx.entries[index];
          const input = entry.input;
          if (pending.get(entry) === input) {
            ctx.entries.splice(index, 1);
            continue;
          }
          const result = walkPromises(input);
          if (!isThenable(result)) {
            pending.delete(entry);
            continue;
          }
          pending.set(entry, input);
          ctx.entries.splice(index, 1);
          void Promise.resolve(result).then(
            (resolved) => {
              if (pending.get(entry) !== input)
                return;
              pending.delete(entry);
              entry.input = resolved;
              delete entry._tags;
              head.invalidate?.();
            },
            () => {
              if (pending.get(entry) === input)
                pending.delete(entry);
            }
          );
        }
      }
    }
  };
}, "promises");

const SupportedAttrs = {
  meta: "content",
  link: "href",
  htmlAttrs: "lang"
};
const contentAttrs = ["innerHTML", "textContent"];
function processIfNeeded(value, params, separator, isJson = false) {
  return typeof value === "string" && value.includes("%") ? processTemplateParams(value, params, separator, isJson) : value;
}
const TemplateParamsPlugin = /* @__PURE__ */ defineHeadPlugin((head) => {
  return {
    key: "template-params",
    hooks: {
      "tags:resolve": ({ tagMap, tags }) => {
        const params = tagMap.get("templateParams")?.props || {};
        const sep = params.separator || "|";
        delete params.separator;
        params.pageTitle = processIfNeeded(
          // find templateParams
          params.pageTitle || head._title || "",
          params,
          sep
        );
        for (const tag of tags) {
          if (tag.processTemplateParams === false) {
            continue;
          }
          const v = SupportedAttrs[tag.tag];
          if (v && typeof tag.props[v] === "string") {
            tag.props[v] = processIfNeeded(tag.props[v], params, sep);
          } else if (tag.processTemplateParams || tag.tag === "titleTemplate" || tag.tag === "title") {
            for (const p of contentAttrs) {
              if (typeof tag[p] === "string")
                tag[p] = processIfNeeded(tag[p], params, sep, tag.tag === "script" && typeof tag.props.type === "string" && tag.props.type.endsWith("json"));
            }
          }
        }
        head._templateParams = params;
        head._separator = sep;
      },
      "tags:afterResolve": ({ tagMap }) => {
        const title = tagMap.get("title");
        if (title?.textContent && title.processTemplateParams !== false) {
          title.textContent = processIfNeeded(title.textContent, head._templateParams, head._separator);
        }
      }
    }
  };
}, "template-params");

export { AliasSortingPlugin as A, DeprecationsPlugin as D, PromisesPlugin as P, TemplateParamsPlugin as T };
