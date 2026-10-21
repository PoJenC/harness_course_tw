import { parseHtmlForUnheadExtraction, applyHeadToHtml, parseHtmlForIndexes } from './parser.mjs';
export { prepareTemplate } from './parser.mjs';
import { a as capoTagWeight } from './shared/unhead.DGl9jcjg.mjs';
export { c as createHead, b as createServerRenderer, e as escapeHtml, p as propsToString, r as renderSSRHead, s as ssrRenderTags, t as tagToString } from './shared/unhead.DGl9jcjg.mjs';
import { n as normalizeEntryToTags, d as dedupeKey, h as hashTag } from './shared/unhead.DJuZwX9c.mjs';
import './shared/unhead.Bf_fPVYA.mjs';
import './shared/unhead.D7HkBzZn.mjs';
import './shared/unhead.Bm4Y6XQI.mjs';
import 'hookable';
import './shared/unhead.CGPOfp5O.mjs';

let extractedTemplates;
function cloneExtractedInput(value) {
  if (Array.isArray(value))
    return value.map(cloneExtractedInput);
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const clone = {};
    for (const key of Object.keys(value))
      clone[key] = cloneExtractedInput(value[key]);
    return clone;
  }
  return value;
}
function freezeExtractedInput(value) {
  if (Array.isArray(value)) {
    for (const item of value)
      freezeExtractedInput(item);
  } else if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    for (const key of Object.keys(value))
      freezeExtractedInput(value[key]);
  }
  return value && typeof value === "object" ? Object.freeze(value) : value;
}
function hasHooks(head) {
  const hooks = head.hooks?._hooks || {};
  for (const key in hooks) {
    if (hooks[key]?.length)
      return true;
  }
  return false;
}
function precomputeExtractedTags(input) {
  const tags = normalizeEntryToTags(input, []);
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    tag._w = capoTagWeight(tag);
    tag._p = i;
    tag._d = dedupeKey(tag);
    if (!tag._d)
      tag._h = hashTag(tag);
  }
  return tags;
}
function extractPreparedTemplate(prepared) {
  const cache = extractedTemplates ||= /* @__PURE__ */ new WeakMap();
  let extracted = cache.get(prepared);
  if (!extracted) {
    const template = parseHtmlForUnheadExtraction(prepared.html);
    freezeExtractedInput(template.input);
    Object.freeze(template.indexes);
    Object.freeze(template);
    const tags = precomputeExtractedTags(template.input);
    freezeExtractedInput(tags);
    extracted = Object.freeze({
      template,
      tags
    });
    cache.set(prepared, extracted);
  }
  return extracted;
}
// @__NO_SIDE_EFFECTS__
function transformHtmlTemplate(head, html) {
  let cached;
  let template;
  if (typeof html === "string") {
    template = parseHtmlForUnheadExtraction(html);
  } else {
    cached = extractPreparedTemplate(html);
    template = cached.template;
  }
  const hooked = cached ? hasHooks(head) : false;
  const hasDynamicResolver = cached ? head.resolvedOptions.propResolvers?.some((resolver) => !resolver._static) || false : false;
  const input = cached && (hooked || hasDynamicResolver) ? cloneExtractedInput(template.input) : template.input;
  head.push(input, { _index: 0 });
  if (cached && !hooked && head.resolvedOptions._tagWeight === capoTagWeight && !hasDynamicResolver) {
    const entry = head.entries.get(0);
    if (entry)
      entry._precomputedTags = cached.tags;
  }
  return applyHeadToHtml(template, head.render());
}
// @__NO_SIDE_EFFECTS__
function transformHtmlTemplateRaw(head, html) {
  const template = typeof html === "string" ? parseHtmlForIndexes(html) : html;
  return applyHeadToHtml(template, head.render());
}

export { capoTagWeight, transformHtmlTemplate, transformHtmlTemplateRaw };
