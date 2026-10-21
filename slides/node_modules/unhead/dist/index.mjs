import { S as SafeInputPlugin, F as FlatMetaPlugin } from './shared/unhead.DkxnqlHC.mjs';
import { h as hasOwn } from './shared/unhead.Bf_fPVYA.mjs';
export { c as createUnhead } from './shared/unhead.D7HkBzZn.mjs';
export { u as useScript } from './shared/unhead.CwCQ2vVe.mjs';
import './shared/unhead.o8j9utSy.mjs';
import './shared/unhead.CGPOfp5O.mjs';
import './shared/unhead.CHEy9ana.mjs';
import './shared/unhead.Bm4Y6XQI.mjs';
import 'hookable';

function useHead(unhead, input, options = {}) {
  return unhead.push(input || {}, options);
}
function useHeadSafe(unhead, input = {}, options = {}) {
  unhead.use(SafeInputPlugin);
  return useHead(unhead, input, Object.assign(options, { _safe: true }));
}
function normalizeSeoMetaInput(input) {
  if (input._flatMeta) {
    return input;
  }
  const meta = {};
  for (const key in input) {
    if (!hasOwn(input, key) || key === "title" || key === "titleTemplate")
      continue;
    meta[key] = input[key];
  }
  return {
    title: input.title,
    titleTemplate: input.titleTemplate,
    _flatMeta: meta
  };
}
function useSeoMeta(unhead, input = {}, options) {
  unhead.use(FlatMetaPlugin);
  const entry = unhead.push(normalizeSeoMetaInput(input), options);
  const corePatch = entry.patch;
  if (!entry.__patched) {
    entry.patch = (input2) => corePatch(normalizeSeoMetaInput(input2));
    entry.__patched = true;
  }
  return entry;
}

function defineLink(link) {
  return link;
}
function defineScript(script) {
  return script;
}

export { defineLink, defineScript, useHead, useHeadSafe, useSeoMeta };
