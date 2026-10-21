import { HeadPluginInput } from 'unhead/types';
export { InferSeoMetaPlugin } from 'unhead/plugins';

declare const DefaultCriticalTags: {
    htmlAttrs: {
        lang: string;
    };
    meta: ({
        charset: string;
        name?: undefined;
        content?: undefined;
    } | {
        name: string;
        content: string;
        charset?: undefined;
    })[];
};

/**
 * Unhead plugin that propagates source location metadata from entry options to tags.
 *
 * On the server, it also serializes the full devtools state into a
 * `<script id="unhead:devtools">` payload so the client bridge can display
 * server-only entries.
 */
declare function devtoolsPlugin(): HeadPluginInput;

export { DefaultCriticalTags, devtoolsPlugin };
