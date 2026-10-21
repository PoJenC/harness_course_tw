import { CreateServerHeadOptions, SSRHeadPayload } from 'unhead/types';
export { CreateServerHeadOptions } from 'unhead/types';
export { V as VueHeadMixin } from './shared/vue.DnywREVF.mjs';
export { PreparedTemplate, SSRHeadPayload, prepareTemplate, propsToString, renderSSRHead, transformHtmlTemplate } from 'unhead/server';
import { V as VueHeadClient } from './shared/vue.B8YcFbNO.mjs';
import { UseHeadInput } from './index.mjs';
import 'vue';

declare function createHead(options?: Omit<CreateServerHeadOptions, 'propResolvers'>): VueHeadClient<UseHeadInput, SSRHeadPayload>;

export { VueHeadClient, createHead };
