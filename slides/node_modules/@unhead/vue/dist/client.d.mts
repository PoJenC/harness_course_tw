import { CreateClientHeadOptions } from 'unhead/types';
export { CreateClientHeadOptions } from 'unhead/types';
export { V as VueHeadMixin } from './shared/vue.DnywREVF.mjs';
export { renderDOMHead } from 'unhead/client';
import { V as VueHeadClient } from './shared/vue.B8YcFbNO.mjs';
import { UseHeadInput } from './index.mjs';
import 'vue';

declare function createHead(options?: CreateClientHeadOptions): VueHeadClient<UseHeadInput, boolean>;

export { VueHeadClient, createHead };
