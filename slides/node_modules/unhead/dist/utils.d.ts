import { HeadTag } from './stream/server.js';
import { MetaFlat, UnheadMeta, TemplateParams } from './types.js';
import { Unhead } from './client.js';
import { PropResolver } from './types.js';
import 'hookable';

declare const SelfClosingTags: Set<string>;
declare const DupeableTags: Set<string>;
declare const TagsWithInnerContent: Set<string>;
declare const HasElementTags: Set<string>;
declare const ValidHeadTags: Set<string>;
declare const UniqueTags: Set<string>;
declare const TagConfigKeys: Set<string>;
declare const ScriptNetworkEvents: Set<string>;
declare const UsesMergeStrategy: Set<string>;
declare const MetaTagsArrayable: Set<string>;
declare const TagPriorityAliases: {
    readonly critical: -8;
    readonly high: -1;
    readonly low: 2;
};

declare function isMetaArrayDupeKey(v: string): boolean;
declare function dedupeKey<T extends HeadTag>(tag: T): string | undefined;
declare function hashTag(tag: HeadTag): string;

declare function hasOwn(object: object, key: PropertyKey): boolean;

type MetaKeyType = 'name' | 'property' | 'http-equiv';
declare function resolveMetaKeyType(key: string): MetaKeyType;
declare function resolveMetaKeyValue(key: string): string;
declare function resolvePackedMetaObjectValue(value: any, key: string): string;
declare function unpackMeta<T extends MetaFlat>(input: T): UnheadMeta[];

declare function normalizeProps(tag: HeadTag, input: Record<string, any>): HeadTag;
declare function normalizeEntryToTags(input: any, propResolvers: PropResolver[]): HeadTag[];

interface ResolveTagsContext {
    tagMap: Map<string, HeadTag>;
    tags: HeadTag[];
}
interface ResolveTagsOptions {
    tagWeight?: (tag: HeadTag) => number;
}
declare function dedupeTags(ctx: ResolveTagsContext): boolean;
declare function resolveTitleTemplate(ctx: ResolveTagsContext, head: Unhead<any>): void;
declare function sanitizeTags(tags: HeadTag[]): HeadTag[];
declare function resolveTags(head: Unhead<any>, options?: ResolveTagsOptions): HeadTag[];

declare function processTemplateParams(s: string, p: TemplateParams, sep?: string, isJson?: boolean): string;

declare function walkResolver(val: any, resolve?: PropResolver, key?: string): any;

export { DupeableTags, HasElementTags, MetaTagsArrayable, ScriptNetworkEvents, SelfClosingTags, TagConfigKeys, TagPriorityAliases, TagsWithInnerContent, UniqueTags, UsesMergeStrategy, ValidHeadTags, dedupeKey, dedupeTags, hasOwn, hashTag, isMetaArrayDupeKey, normalizeEntryToTags, normalizeProps, processTemplateParams, resolveMetaKeyType, resolveMetaKeyValue, resolvePackedMetaObjectValue, resolveTags, resolveTitleTemplate, sanitizeTags, unpackMeta, walkResolver };
export type { MetaKeyType, ResolveTagsContext, ResolveTagsOptions };
