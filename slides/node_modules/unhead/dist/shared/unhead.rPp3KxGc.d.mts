import { HookableCore } from 'hookable';
import { R as ResolvableHead } from './unhead.DC0v7nqS.mjs';
import { U as Unhead, e as ClientHeadHooks } from './unhead.C7ofc94j.mjs';

interface ClientUnhead<T = ResolvableHead> extends Unhead<T, boolean> {
    hooks: HookableCore<ClientHeadHooks>;
    dirty: boolean;
    invalidate: () => void;
}

export type { ClientUnhead as C };
