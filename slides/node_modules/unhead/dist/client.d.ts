import { C as ClientUnhead } from './shared/unhead.mtk51Jux.js';
import { C as CreateClientHeadOptions, U as Unhead } from './shared/unhead.BCbtEyRi.js';
import { HeadRenderer } from './types.js';
import { ResolvableHead } from './types.js';
import { RenderDomHeadOptions } from './types.js';
import 'hookable';

declare function createHead<T = ResolvableHead>(options?: CreateClientHeadOptions): ClientUnhead<T>;

declare function createDomRenderer(options?: RenderDomHeadOptions): HeadRenderer<boolean>;
/** @deprecated Use `head.render()` instead */
declare function renderDOMHead<T extends Unhead<any>>(head: T, options?: RenderDomHeadOptions): boolean;

declare function createDebouncedFn(callee: () => void, delayer: (fn: () => void) => void): () => void;

export { ClientUnhead, CreateClientHeadOptions, Unhead, createDebouncedFn, createDomRenderer, createHead, renderDOMHead };
