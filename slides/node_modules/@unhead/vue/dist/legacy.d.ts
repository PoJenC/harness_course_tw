import { CreateClientHeadOptions, CreateServerHeadOptions, SSRHeadPayload, HeadPluginInput } from 'unhead/types';
export { CreateClientHeadOptions } from 'unhead/types';
export { createHead as createClientHead } from './client.js';
import { V as VueHeadClient } from './shared/vue.B8YcFbNO.js';
import { UseHeadInput } from './index.js';
export { V as VueHeadMixin } from './shared/vue.DnywREVF.js';
export { renderDOMHead } from 'unhead/client';
import 'vue';

/**
 * The v2 migration plugins applied by the legacy `createHead`/`createServerHead`, including
 * Promise input resolution. Modern entrypoints require `PromisesPlugin` to be registered explicitly.
 *
 * @deprecated Will be removed in v4. Migrate call sites to the v3 API and construct
 * `createHead`/`createServerHead` from `@unhead/vue/client`/`@unhead/vue/server` without this plugin set.
 */
declare const legacyPlugins: HeadPluginInput[];
/**
 * Creates a client `VueHeadClient` with the v2 migration plugin set pre-registered so that
 * tag props (`children`, `hid`, `vmid`, `body`), Promise inputs, template params, and
 * alias sorting continue to work during the migration to v3.
 *
 * @deprecated Will be removed in v4. Use `createHead` from `@unhead/vue/client` instead; register
 * `legacyPlugins` yourself if you still need v1/v2 tag prop compatibility.
 */
declare function createHead(options?: CreateClientHeadOptions): VueHeadClient<UseHeadInput, boolean>;
/**
 * Creates a server `VueHeadClient` with the v2 migration plugin set pre-registered.
 *
 * @deprecated Will be removed in v4. Use `createHead` from `@unhead/vue/server` instead; register
 * `legacyPlugins` yourself if you still need v1/v2 tag prop compatibility.
 */
declare function createServerHead(options?: Omit<CreateServerHeadOptions, 'propResolvers'>): VueHeadClient<UseHeadInput, SSRHeadPayload>;

export { VueHeadClient, createHead, createServerHead, legacyPlugins };
