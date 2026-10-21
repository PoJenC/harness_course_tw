import { createStreamableHead as createStreamableHead$1, wrapStream } from 'unhead/stream/server';
export { createBootstrapScript, prepareStreamingTemplate, prepareTemplate, renderSSRHeadShell, renderSSRHeadSuspenseChunk, renderShell, renderStreamBodyTags, renderStreamEnd, wrapStream } from 'unhead/stream/server';
import { v as vueInstall } from '../shared/vue.DKb5ZKVl.mjs';
import { V as VueResolver } from '../shared/vue.D2XR8FqS.mjs';
import 'vue';

function createStreamableHead(options = {}) {
  const { head } = createStreamableHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  const vueHead = head;
  vueHead.install = vueInstall(vueHead);
  return {
    head: vueHead,
    // Use the core chunk renderer.
    wrapStream: (stream, template) => wrapStream(vueHead, stream, template)
  };
}

export { createStreamableHead };
