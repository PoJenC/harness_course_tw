import { c as createUnhead } from './unhead.D7HkBzZn.mjs';
import { b as TagPriorityAliases } from './unhead.CGPOfp5O.mjs';
import { c as createHooks } from './unhead.Bm4Y6XQI.mjs';
import { c as createClientHeadAdapter } from './unhead.C5Bksi2B.mjs';
import { c as createDomRenderer } from './unhead.DD4N5B4k.mjs';

const tagWeight = (tag) => typeof tag.tagPriority === "number" ? tag.tagPriority : 100 + (TagPriorityAliases[tag.tagPriority] || 0);
function createHead(options = {}) {
  options.document = options.document || (typeof window !== "undefined" ? document : void 0);
  const renderer = options.render || createDomRenderer({ document: options.document });
  const core = createUnhead(renderer, { document: options.document, propResolvers: options.propResolvers, _tagWeight: tagWeight, init: [] });
  const hooks = createHooks(options.hooks);
  const head = createClientHeadAdapter(core, hooks, renderer);
  options.plugins?.forEach((p) => head.use(p));
  options.init?.forEach((e) => e && head.push(e));
  return head;
}

export { createHead as c };
