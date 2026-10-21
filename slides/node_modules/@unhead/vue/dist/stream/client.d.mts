import { CreateStreamableClientHeadOptions } from 'unhead/stream/client';
export { CreateStreamableClientHeadOptions, UnheadStreamQueue } from 'unhead/stream/client';
export { V as VueHeadMixin } from '../shared/vue.DnywREVF.mjs';
import { V as VueHeadClient } from '../shared/vue.B8YcFbNO.mjs';
import { UseHeadInput } from '../index.mjs';
import 'unhead/types';
import 'vue';

/**
 * Creates a client head by wrapping the core instance from the iife script.
 */
declare function createStreamableHead(options?: CreateStreamableClientHeadOptions): VueHeadClient<UseHeadInput, boolean> | undefined;

export { VueHeadClient, createStreamableHead };
