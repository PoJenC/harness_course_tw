import { C as ClientUnhead } from './shared/unhead.rPp3KxGc.mjs';
import { C as CreateClientHeadOptions, U as Unhead } from './shared/unhead.C7ofc94j.mjs';
import { HeadRenderer } from './types.mjs';
import { ResolvableHead } from './types.mjs';
import { RenderDomHeadOptions } from './types.mjs';
import 'hookable';

declare function createHead<T = ResolvableHead>(options?: CreateClientHeadOptions): ClientUnhead<T>;

declare function createDomRenderer(options?: RenderDomHeadOptions): HeadRenderer<boolean>;
/** @deprecated Use `head.render()` instead */
declare function renderDOMHead<T extends Unhead<any>>(head: T, options?: RenderDomHeadOptions): boolean;

declare function createDebouncedFn(callee: () => void, delayer: (fn: () => void) => void): () => void;

export { ClientUnhead, CreateClientHeadOptions, Unhead, createDebouncedFn, createDomRenderer, createHead, renderDOMHead };
