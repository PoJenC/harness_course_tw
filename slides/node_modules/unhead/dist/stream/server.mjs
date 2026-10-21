import { parseHtmlForIndexes, applyHeadToHtml } from '../parser.mjs';
export { prepareTemplate } from '../parser.mjs';
import { c as createHead } from '../shared/unhead.DGl9jcjg.mjs';
import { e as resolveHeadInput, h as hashTag, n as normalizeEntryToTags, b as normalizeProps, d as dedupeKey } from '../shared/unhead.DJuZwX9c.mjs';
import { a as callHook } from '../shared/unhead.Bm4Y6XQI.mjs';
import { DEFAULT_STREAM_KEY } from './client.mjs';
import { p as parseStreamKey } from '../shared/unhead.C_7zwq8E.mjs';
import '../shared/unhead.Bf_fPVYA.mjs';
import '../shared/unhead.D7HkBzZn.mjs';
import '../shared/unhead.CGPOfp5O.mjs';
import 'hookable';
import '../shared/unhead.C5Bksi2B.mjs';

const LT_RE = /</g;
const GT_RE = />/g;
const AMP_RE = /&/g;
const SSR_OUTLET_RE = /<!--\s*(?:app-html|ssr-outlet)\s*-->/;
let encoder;
let preparedStreamingLayouts;
// @__NO_SIDE_EFFECTS__
function createStreamableHead(options = {}) {
  const { streamKey, writesBodyTags, nonce, ...rest } = options;
  const parsedStreamKey = streamKey === void 0 ? void 0 : parseStreamKey(streamKey);
  const head = createHead({
    ...rest,
    experimentalStreamKey: parsedStreamKey
  });
  if (writesBodyTags)
    streamState(head).writesBodyTags = true;
  if (nonce)
    streamState(head).nonce = nonce;
  let resolveShellReady;
  const shellReady = new Promise((resolve) => {
    resolveShellReady = resolve;
  });
  return {
    head,
    onShellReady: () => resolveShellReady(),
    shellReady
  };
}
function getStreamKey(head) {
  const key = head.resolvedOptions.experimentalStreamKey || DEFAULT_STREAM_KEY;
  return parseStreamKey(key);
}
function createBootstrapScript(streamKey = DEFAULT_STREAM_KEY, nonce) {
  const parsedStreamKey = parseStreamKey(streamKey);
  const nonceAttr = renderNonceAttribute(nonce);
  return `<script${nonceAttr}>window.${parsedStreamKey}||(window.${parsedStreamKey}={_q:[],push(e){this._q.push(e)}})<\/script>`;
}
function renderNonceAttribute(nonce) {
  return nonce ? ` nonce="${nonce.replace(AMP_RE, "&amp;").replace(/"/g, "&quot;")}"` : "";
}
function renderShell(head) {
  const result = head.render();
  rememberShellBodyTags(head);
  head.entries.clear();
  streamState(head).shellRendered = true;
  return result;
}
function renderSSRHeadShell(head, template) {
  const parsed = typeof template === "string" ? parseHtmlForIndexes(template) : template;
  const result = applyShellToTemplate(head, head.render(), parsed);
  rememberShellBodyTags(head);
  head.entries.clear();
  streamState(head).shellRendered = true;
  return result;
}
function applyShellToTemplate(head, ssr, parsed) {
  return applyHeadToHtml(parsed, {
    htmlAttrs: ssr.htmlAttrs,
    headTags: createBootstrapScript(getStreamKey(head), head._stream?.nonce) + ssr.headTags,
    bodyAttrs: ssr.bodyAttrs,
    bodyTagsOpen: ssr.bodyTagsOpen,
    bodyTags: ssr.bodyTags
  });
}
function normalizePendingTags(head) {
  const propResolvers = head.resolvedOptions.propResolvers || [];
  const tags = [];
  const entries = /* @__PURE__ */ new Map();
  for (const entry of head.entries.values()) {
    const resolved = resolveHeadInput(unwrapEntryInput(entry.input), propResolvers);
    entries.set(entry._i, { input: entry.input, resolved });
    let index = 0;
    for (const tag of normalizeEntryToTags(resolved, [])) {
      if (entry.options)
        Object.assign(tag, entry.options);
      tag._p = (entry._i << 10) + index++;
      if (tag.tag === "templateParams")
        tag.props = { ...tag.props };
      tags.push(tag);
    }
  }
  return { tags, entries };
}
const JSON_LD_TYPE_RE = /\bld\+json\b/i;
function streamState(head) {
  return head._stream ||= {};
}
function isStreamedBodyTag(tagName, tag, entryPosition) {
  if (!tag || typeof tag !== "object")
    return false;
  if (tagName === "noscript")
    return true;
  const position = tag.tagPosition ?? entryPosition;
  if (position === "bodyClose" || position === "bodyOpen")
    return true;
  const type = tag.type ?? tag.props?.type;
  return tagName === "script" && typeof type === "string" && JSON_LD_TYPE_RE.test(type);
}
function streamedBodyTagIdentity(tagName, tag) {
  const normalized = normalizeProps({ tag: tagName, props: {} }, tag);
  const content = hashTag(normalized);
  return { slot: dedupeKey(normalized) || content, content };
}
function unwrapEntryInput(input) {
  return typeof input === "function" ? input() : input;
}
function rememberShellBodyTags(head) {
  const state = streamState(head);
  let seen = state.seen;
  for (const entry of head.entries.values()) {
    const entryPosition = entry.options?.tagPosition;
    for (const tag of entry._tags || entry._precomputedTags || []) {
      if (!isStreamedBodyTag(tag.tag, tag, entryPosition))
        continue;
      seen ||= state.seen = /* @__PURE__ */ new Set();
      if (tag.textContent || tag.innerHTML)
        seen.add(String(tag.textContent || tag.innerHTML));
      seen.add(tag._d || tag._h || hashTag(tag));
    }
  }
}
function hasStreamedBodyTags(input, entryPosition) {
  if (input && typeof input === "object") {
    for (const key in input) {
      const value = input[key];
      if (Array.isArray(value)) {
        for (const tag of value) {
          if (isStreamedBodyTag(key, tag, entryPosition))
            return true;
        }
      }
    }
  }
  return false;
}
function splitStreamedBodyTags(input, seen, entryPosition) {
  let patch;
  let bodyTags;
  for (const key in input) {
    const value = input[key];
    if (!Array.isArray(value) || !value.some((tag) => isStreamedBodyTag(key, tag, entryPosition)))
      continue;
    const rest = [];
    const carried = [];
    for (const tag of value) {
      if (!isStreamedBodyTag(key, tag, entryPosition)) {
        rest.push(tag);
        continue;
      }
      const id = streamedBodyTagIdentity(key, tag);
      if (seen.has(id.content))
        continue;
      if (seen.has(id.slot)) {
        rest.push(tag);
        continue;
      }
      seen.add(id.content);
      carried.push({ ...tag, tagPosition: "bodyClose" });
    }
    patch ||= { ...input };
    if (rest.length)
      patch[key] = rest;
    else
      delete patch[key];
    if (carried.length)
      (bodyTags ||= {})[key] = carried;
  }
  const hasPatch = Object.keys(patch).some((k) => patch[k] !== void 0);
  return { patch: hasPatch ? patch : void 0, bodyTags };
}
function renderStreamBodyTags(head) {
  const bodyTagInputs = streamState(head).bodyTags;
  if (!bodyTagInputs?.length) {
    return "";
  }
  const restore = new Map(head.entries);
  head.entries.clear();
  try {
    for (const input of bodyTagInputs)
      head.push(input);
    const bodyTags = head.render().bodyTags;
    streamState(head).bodyTags = void 0;
    return bodyTags;
  } finally {
    head.entries.clear();
    for (const [k, v] of restore)
      head.entries.set(k, v);
  }
}
function renderStreamEnd(head, parts) {
  const bodyTags = renderStreamBodyTags(head);
  if (!bodyTags)
    return parts.end;
  const at = parts.bodyTagsAt ?? parts.end.length;
  return parts.end.slice(0, at) + bodyTags + parts.end.slice(at);
}
function renderSSRHeadSuspenseChunk(head) {
  if (!head.entries.size)
    return "";
  const streamKey = getStreamKey(head);
  const propResolvers = head.resolvedOptions.propResolvers || [];
  let normalizedEntries;
  let serialized;
  let patchCount = 0;
  try {
    if (head.hooks?._hooks?.["ssr:streamChunk"]?.length) {
      const normalized = normalizePendingTags(head);
      normalizedEntries = normalized.entries;
      callHook(head, "ssr:streamChunk", { tags: normalized.tags });
    }
    const state = streamState(head);
    let nextSeen;
    const inputs = [];
    let bodyTags;
    for (const entry of head.entries.values()) {
      const normalized = normalizedEntries?.get(entry._i);
      const input = normalized && normalized.input === entry.input ? normalized.resolved : resolveHeadInput(unwrapEntryInput(entry.input), propResolvers);
      const entryPosition = entry.options?.tagPosition;
      if (!state.writesBodyTags || !hasStreamedBodyTags(input, entryPosition)) {
        inputs.push(input);
        continue;
      }
      const split = splitStreamedBodyTags(input, nextSeen ||= new Set(state.seen), entryPosition);
      if (split.patch)
        inputs.push(split.patch);
      if (split.bodyTags)
        (bodyTags ||= []).push(split.bodyTags);
    }
    serialized = safeJsonStringify(inputs);
    patchCount = inputs.length;
    if (nextSeen)
      state.seen = nextSeen;
    if (bodyTags)
      (state.bodyTags ||= []).push(...bodyTags);
  } catch (error) {
    for (const [key, entry] of head.entries) {
      try {
        safeJsonStringify(resolveHeadInput(unwrapEntryInput(entry.input), propResolvers));
      } catch {
        head.entries.delete(key);
      }
    }
    throw error;
  }
  head.entries.clear();
  if (!patchCount)
    return "";
  return `window.${streamKey}.push(${serialized})`;
}
function safeJsonStringify(obj) {
  return JSON.stringify(obj).replace(LT_RE, "\\u003c").replace(GT_RE, "\\u003e").replace(AMP_RE, "\\u0026");
}
function wrapStream(head, stream, template, preRenderedState, options) {
  streamState(head).writesBodyTags = true;
  const flushChunk = options?.flushChunk ?? (() => {
    let chunk;
    try {
      chunk = renderSSRHeadSuspenseChunk(head);
    } catch {
      return "";
    }
    if (!chunk)
      return "";
    return `<script${renderNonceAttribute(head._stream?.nonce)}>window.${getStreamKey(head)}&&(${chunk});document.currentScript.remove()<\/script>`;
  });
  const enc = encoder ??= new TextEncoder();
  let reader;
  let parts;
  return new ReadableStream({
    // Async so a failure here rejects into an errored stream instead of
    // throwing synchronously out of the constructor. The reader is acquired
    // before rendering (and released if rendering fails) so a failure at
    // either step leaves `head.entries` intact and the upstream unlocked
    // for retry.
    async start(controller) {
      const activeReader = stream.getReader();
      let prepared;
      try {
        prepared = prepareStreamingTemplate(head, template, preRenderedState);
      } catch (error) {
        activeReader.releaseLock();
        throw error;
      }
      reader = activeReader;
      parts = prepared;
      controller.enqueue(enc.encode(prepared.shell));
    },
    // Read at most one upstream chunk per downstream request so backpressure
    // propagates instead of eagerly draining the app stream.
    async pull(controller) {
      const activeReader = reader;
      if (!activeReader)
        return;
      const result = await activeReader.read().then(
        (value) => ({ ok: true, value }),
        (error) => ({ ok: false, error })
      );
      if (activeReader !== reader)
        return;
      if (!result.ok) {
        reader = void 0;
        activeReader.releaseLock();
        controller.error(result.error);
        return;
      }
      if (result.value.done) {
        reader = void 0;
        activeReader.releaseLock();
        const extra2 = flushChunk?.();
        if (extra2)
          controller.enqueue(enc.encode(extra2));
        const closing = parts ? renderStreamEnd(head, parts) : "";
        if (closing)
          controller.enqueue(enc.encode(closing));
        controller.close();
        return;
      }
      controller.enqueue(result.value.value);
      const extra = flushChunk?.();
      if (extra)
        controller.enqueue(enc.encode(extra));
    },
    async cancel(reason) {
      const activeReader = reader;
      reader = void 0;
      if (activeReader) {
        try {
          await activeReader.cancel(reason);
        } catch {
        }
        activeReader.releaseLock();
      }
    }
  });
}
function createStreamingTemplateLayout(parsed) {
  const html = parsed.html;
  const bodyEnd = parsed.indexes.bodyTagEnd;
  const bodyCloseStart = parsed.indexes.bodyCloseTagStart;
  if (bodyEnd < 0 || bodyCloseStart < 0)
    return;
  const bodyInterior = html.substring(bodyEnd, bodyCloseStart);
  const markerMatch = bodyInterior.match(SSR_OUTLET_RE);
  let beforeStream;
  let afterStream;
  if (markerMatch) {
    beforeStream = bodyInterior.substring(0, markerMatch.index);
    afterStream = bodyInterior.substring(markerMatch.index + markerMatch[0].length);
  } else {
    beforeStream = "";
    afterStream = bodyInterior;
  }
  const shellPart = html.substring(0, bodyEnd) + beforeStream;
  const endPart = html.substring(bodyCloseStart);
  let shellTemplate;
  if (bodyCloseStart >= bodyEnd) {
    const shellLen = shellPart.length;
    const { htmlTagStart, headTagEnd, bodyTagStart } = parsed.indexes;
    const shellHtmlTagStart = htmlTagStart >= 0 && htmlTagStart + 5 <= shellLen ? htmlTagStart : -1;
    let shellHtmlTagEnd = -1;
    if (shellHtmlTagStart >= 0) {
      const gt = shellPart.indexOf(">", shellHtmlTagStart);
      shellHtmlTagEnd = gt >= 0 ? gt + 1 : shellLen + 7;
    }
    shellTemplate = {
      html: `${shellPart}</body></html>`,
      input: parsed.input,
      indexes: {
        htmlTagStart: shellHtmlTagStart,
        htmlTagEnd: shellHtmlTagEnd,
        headTagEnd: headTagEnd >= 0 && headTagEnd + 7 <= shellLen ? headTagEnd : -1,
        // <body> is always fully inside the prefix in this branch.
        bodyTagStart,
        bodyTagEnd: bodyEnd,
        bodyCloseTagStart: bodyCloseStart + 7 <= shellLen ? bodyCloseStart : shellLen
      }
    };
  } else {
    shellTemplate = parseHtmlForIndexes(`${shellPart}</body></html>`);
  }
  return {
    shellTemplate,
    endBeforeBodyTags: afterStream,
    endAfterBodyTags: endPart
  };
}
function getPreparedStreamingLayout(template) {
  const cache = preparedStreamingLayouts ||= /* @__PURE__ */ new WeakMap();
  let layout = cache.get(template);
  if (layout === void 0) {
    layout = createStreamingTemplateLayout(template) || null;
    if (layout) {
      Object.freeze(layout.shellTemplate.indexes);
      Object.freeze(layout.shellTemplate);
      Object.freeze(layout);
    }
    cache.set(template, layout);
  }
  return layout || void 0;
}
function prepareStreamingTemplate(head, template, preRenderedState) {
  const ssr = preRenderedState ?? head.render();
  const parsed = typeof template === "string" ? parseHtmlForIndexes(template) : template;
  const layout = typeof template === "string" ? createStreamingTemplateLayout(parsed) : getPreparedStreamingLayout(template);
  let parts;
  if (layout) {
    const shell = applyHeadToHtml(layout.shellTemplate, {
      htmlAttrs: ssr.htmlAttrs,
      headTags: createBootstrapScript(getStreamKey(head), head._stream?.nonce) + ssr.headTags,
      bodyAttrs: ssr.bodyAttrs,
      bodyTagsOpen: ssr.bodyTagsOpen,
      bodyTags: ""
    }).replace("</body></html>", "");
    parts = {
      shell,
      end: layout.endBeforeBodyTags + ssr.bodyTags + layout.endAfterBodyTags,
      bodyTagsAt: layout.endBeforeBodyTags.length
    };
  } else {
    parts = {
      shell: applyShellToTemplate(head, ssr, parsed),
      end: ""
    };
  }
  if (!preRenderedState) {
    rememberShellBodyTags(head);
    head.entries.clear();
  }
  streamState(head).shellRendered = true;
  return parts;
}

export { createBootstrapScript, createStreamableHead, prepareStreamingTemplate, renderSSRHeadShell, renderSSRHeadSuspenseChunk, renderShell, renderStreamBodyTags, renderStreamEnd, wrapStream };
