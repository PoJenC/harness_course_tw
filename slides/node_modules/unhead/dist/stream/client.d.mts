import { ClientUnhead } from '../client.mjs';
import { Unhead, CreateClientHeadOptions } from '../client.mjs';
import { SerializableHead, ResolvableHead } from '../types.mjs';
import 'hookable';

/**
 * Shape of the streaming queue written to `window[streamKey]` (default
 * `window.__unhead__`) by the server-emitted bootstrap script. The client
 * IIFE reads from it to replay queued entries, and the streaming client
 * wraps the resulting head instance.
 *
 * Both the server bootstrap (`createBootstrapScript`) and the client
 * (`createStreamableHead`, iife) must agree on this shape.
 */
interface StreamingGlobal {
    /** Queued entry batches pushed before the client IIFE took over. */
    _q: SerializableHead[][];
    /** Resolved Unhead instance, populated once the IIFE initialises. */
    _head?: Unhead<any>;
    /** Push an entry batch onto the queue (pre-init) or the head (post-init). */
    push: (entries: SerializableHead[]) => void;
}
/**
 * @deprecated Use `StreamingGlobal` instead. Kept as an alias for back-compat.
 */
type UnheadStreamQueue = StreamingGlobal;

declare const DEFAULT_STREAM_KEY = "__unhead__";
interface CreateStreamableClientHeadOptions extends Omit<CreateClientHeadOptions, 'render'> {
    streamKey?: string;
}
/**
 * Creates a client head by wrapping the core instance from the iife script.
 * Adds hooks, plugins, and dirty tracking without bundling createDomRenderer.
 */
declare function createStreamableHead<T = ResolvableHead>(options?: CreateStreamableClientHeadOptions): ClientUnhead<T> | undefined;

export { DEFAULT_STREAM_KEY, createStreamableHead };
export type { CreateStreamableClientHeadOptions, StreamingGlobal, UnheadStreamQueue };
