import { WebStreamableHeadContext } from 'unhead/stream/server';
export { CreateStreamableServerHeadOptions, PreparedTemplate, StreamingTemplateParts, createBootstrapScript, prepareStreamingTemplate, prepareTemplate, renderSSRHeadShell, renderSSRHeadSuspenseChunk, renderShell, renderStreamBodyTags, renderStreamEnd, wrapStream } from 'unhead/stream/server';
import { ResolvableHead, SSRHeadPayload, CreateStreamableServerHeadOptions } from 'unhead/types';
import { V as VueHeadClient } from '../shared/vue.B8YcFbNO.js';
import 'vue';

/**
 * Vue-specific context returned by createStreamableHead.
 * Extends WebStreamableHeadContext with Vue-specific head type.
 */
interface VueStreamableHeadContext extends Omit<WebStreamableHeadContext<ResolvableHead>, 'head'> {
    /**
     * The Vue head instance to use with app.use(head)
     */
    head: VueHeadClient<any, SSRHeadPayload>;
}
/**
 * Creates a head instance configured for Vue streaming SSR.
 *
 * Vue emits resolved Suspense boundaries in document order.
 * `wrapStream()` can therefore write each head patch after its app chunk.
 * React and Solid use `<HeadStream />` for out-of-order reveals.
 *
 * @example
 * ```ts
 * export async function render(url: string, template: string) {
 *   const { app, router } = createApp()
 *   const { head, wrapStream } = createStreamableHead()
 *
 *   app.use(head)
 *   app.mixin(VueHeadMixin)
 *   router.push(url)
 *
 *   const vueStream = renderToWebStream(app)
 *   await router.isReady()
 *
 *   return wrapStream(vueStream, template)
 * }
 * ```
 */
declare function createStreamableHead(options?: Omit<CreateStreamableServerHeadOptions, 'propResolvers'>): VueStreamableHeadContext;

export { VueHeadClient, createStreamableHead };
export type { VueStreamableHeadContext };
