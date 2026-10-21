import { HookableCore } from 'hookable';
import { R as ResolvableHead } from './unhead.DC0v7nqS.js';
import { U as Unhead, e as ClientHeadHooks } from './unhead.BCbtEyRi.js';

interface ClientUnhead<T = ResolvableHead> extends Unhead<T, boolean> {
    hooks: HookableCore<ClientHeadHooks>;
    dirty: boolean;
    invalidate: () => void;
}

export type { ClientUnhead as C };
