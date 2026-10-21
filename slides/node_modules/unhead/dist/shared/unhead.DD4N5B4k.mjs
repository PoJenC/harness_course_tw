import { H as HasElementTags } from './unhead.CGPOfp5O.mjs';
import { r as resolveTags, i as isMetaArrayDupeKey, b as normalizeProps, d as dedupeKey, h as hashTag } from './unhead.DJuZwX9c.mjs';
import { a as callHook } from './unhead.Bm4Y6XQI.mjs';

const WHITESPACE_RE = /\s+/;
// @__NO_SIDE_EFFECTS__
function createDomRenderer(options = {}) {
  return (head) => _renderDOMHead(head, options);
}
function renderDOMHead(head, options = {}) {
  return _renderDOMHead(head, options);
}
function hasPendingEntries(head) {
  for (const entry of head.entries.values()) {
    if (entry._pending !== void 0)
      return true;
  }
  return false;
}
function createDomState(head, dom) {
  const state = { _d: dom, _t: dom.title, _e: /* @__PURE__ */ new Map([["htmlAttrs", dom.documentElement], ["bodyAttrs", dom.body]]), _p: {}, _s: {}, _l: /* @__PURE__ */ new Map() };
  for (const entry of head.entries.values()) {
    if (entry._o !== void 0) {
      const orig = entry._o;
      for (const t of ["bodyAttrs", "htmlAttrs"]) {
        const cls = orig[t]?.class;
        if (typeof cls === "string") {
          const $el = state._e.get(t);
          for (const c of cls.split(WHITESPACE_RE)) {
            if (c)
              state._p[`${t}:attr:class:${c}`] = () => $el.classList.remove(c);
          }
        }
      }
    }
  }
  return state;
}
function _renderDOMHead(head, options = {}) {
  const dom = options.document || head.resolvedOptions.document;
  const activeState = head._dom;
  if (!dom || head._du || activeState && activeState._d === dom && !head.dirty && !hasPendingEntries(head))
    return false;
  const defaultView = dom.defaultView;
  head._du = true;
  let didRender = false;
  try {
    let track = function(key, fn, fresh) {
      renderState._s[key] = !fresh && previous[key] || fn;
      delete previous[key];
    }, trackEvent = function(id, k, ev, source, $el, target) {
      const key = `${id}:event:${k}`;
      const prev = renderState._l.get(key);
      if (prev && prev[0] === target && prev[1] === ev && prev[2] === source) {
        track(key, prev[4]);
        return;
      }
      prev?.[4]();
      const dk = `data-${k}`;
      const handler = ((e) => source.call($el, e));
      const cleanup = () => {
        target.removeEventListener(ev, handler);
        if ($el.getAttribute(dk) === "")
          $el.removeAttribute(dk);
        if (renderState._l.get(key)?.[3] === handler)
          renderState._l.delete(key);
      };
      target.addEventListener(ev, handler);
      renderState._l.set(key, [target, ev, source, handler, cleanup]);
      $el.setAttribute(dk, "");
      track(key, cleanup, true);
    }, trackCtx = function({ id, $el, tag }) {
      renderState._e.set(id, $el);
      if (!tag.tag.endsWith("Attrs")) {
        const text = tag.textContent;
        if (text != null && text !== "") {
          if (text !== $el.textContent)
            $el.textContent = text;
          track(`${id}:text`, () => {
            if ($el.textContent === text)
              $el.textContent = "";
          }, true);
        }
        const html = tag.innerHTML;
        if (html != null && html !== "") {
          if (html !== $el.innerHTML)
            $el.innerHTML = html;
          track(`${id}:html`, () => {
            if ($el.innerHTML === html)
              $el.innerHTML = "";
          }, true);
        }
        const elKey = `${id}:el`;
        track(elKey, previous[elKey] || (() => {
          $el?.remove();
          renderState._e.delete(id);
        }));
      }
      for (const k in tag.props) {
        const v = tag.props[k];
        if (k[0] === "o" && k[1] === "n" && typeof v === "function") {
          const ev = k.slice(2);
          if ($el?.dataset?.[`${k}fired`])
            v.call($el, new (defaultView?.Event || Event)(ev));
          trackEvent(id, k, ev, v, $el, tag.tag === "bodyAttrs" && defaultView ? defaultView : $el);
          continue;
        }
        const ck = `${id}:attr:${k}`;
        if (k === "class" && v) {
          for (const c of v) {
            const key = `${ck}:${c}`;
            track(key, previous[key] || (() => $el.classList.remove(c)));
            if (!$el.classList.contains(c))
              $el.classList.add(c);
          }
        } else if (k === "style" && v) {
          for (const [sk, sv] of v) {
            const key = `${ck}:${sk}`;
            track(key, previous[key] || (() => $el.style.removeProperty(sk)));
            $el.style.setProperty(sk, sv);
          }
        } else if (v !== false && v !== null) {
          if ($el.getAttribute(k) !== v)
            $el.setAttribute(k, v === true ? "" : String(v));
          track(ck, previous[ck] || (() => $el.removeAttribute(k)));
        }
      }
    };
    const beforeRenderCtx = { shouldRender: true, tags: [] };
    callHook(head, "dom:beforeRender", beforeRenderCtx);
    if (!beforeRenderCtx.shouldRender)
      return false;
    let state = activeState;
    if (state?._d !== dom) {
      if (state) {
        for (const k in state._s) state._s[k]();
        for (const k in state._p) state._p[k]();
        state._s = state._p = {};
        state._e.clear();
        state._l.clear();
      }
      state = void 0;
    }
    if (!state) {
      state = createDomState(head, dom);
    } else {
      state._p = state._s;
    }
    state._s = {};
    const renderState = state;
    const previous = renderState._p;
    const pending = [];
    const frag = {};
    head.dirty = false;
    const rawTags = resolveTags(head, options.tagWeight ? { tagWeight: options.tagWeight } : void 0);
    const tags = [];
    const dupeKeyCounter = {};
    for (const tag of rawTags) {
      const count = dupeKeyCounter[tag._d] || 0;
      const id = (count ? `${tag._d}:${count}` : tag._d) || tag._h;
      const ctx = { tag, id, shouldRender: true };
      if (tag.tag === "meta" && tag._d && isMetaArrayDupeKey(tag._d))
        dupeKeyCounter[tag._d] = count + 1;
      tags.push(ctx);
      if (tag.tag === "title") {
        dom.title = tag.textContent;
        track("title:", () => dom.title = renderState._t);
        continue;
      }
      ctx.$el = renderState._e.get(id);
      if (ctx.$el)
        trackCtx(ctx);
      else if (HasElementTags.has(tag.tag))
        pending.push(ctx);
    }
    if (pending.length) {
      const tracked = new Set(renderState._e.values());
      for (const el of [...dom.body.children, ...dom.head.children]) {
        const elTag = el.tagName.toLowerCase();
        if (!HasElementTags.has(elTag) || tracked.has(el))
          continue;
        const props = { innerHTML: el.innerHTML };
        for (const n of el.getAttributeNames())
          props[n] = el.getAttribute(n);
        const next = normalizeProps({ tag: elTag, props: {} }, props);
        next.key = el.getAttribute("data-hid") || void 0;
        const dedupe = dedupeKey(next) || hashTag(next);
        let k = dedupe;
        let c = 1;
        while (renderState._e.has(k))
          k = `${dedupe}:${c++}`;
        renderState._e.set(k, el);
      }
    }
    for (const ctx of pending) {
      const found = renderState._e.get(ctx.id);
      ctx.$el = found || dom.createElement(ctx.tag.tag);
      trackCtx(ctx);
      if (!found)
        (frag[ctx.tag.tagPosition || "head"] ??= dom.createDocumentFragment()).appendChild(ctx.$el);
    }
    if (frag.head)
      dom.head.appendChild(frag.head);
    if (frag.bodyOpen)
      dom.body.insertBefore(frag.bodyOpen, dom.body.firstChild);
    if (frag.bodyClose)
      dom.body.appendChild(frag.bodyClose);
    for (const k in previous)
      previous[k]();
    head._dom = renderState;
    didRender = true;
    callHook(head, "dom:rendered", { renders: tags });
  } catch (e) {
    head.dirty = true;
    throw e;
  } finally {
    head._du = false;
  }
  if (didRender && (head.dirty || hasPendingEntries(head)))
    _renderDOMHead(head, options);
  return didRender;
}

export { createDomRenderer as c, renderDOMHead as r };
