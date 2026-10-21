import { ActiveHeadEntry } from 'unhead/types';
export { ActiveHeadEntry, AriaAttributes, BodyAttributesWithoutEvents, BodyEvents, DataKeys, GenericLink, GenericScript, GlobalAttributes, HeadEntryOptions, HeadTag, HttpEventAttributes, MetaFlat, MetaFlat as MetaFlatInput, RawInput, RenderSSRHeadOptions, ResolvableHead, SerializableHead, SpeculationRules, Unhead } from 'unhead/types';
import { V as VueHeadClient, U as UseHeadInput, o as UseHeadOptions, p as UseSeoMetaInput } from './shared/vue.B8YcFbNO.mjs';
export { B as BodyAttr, D as DeepResolvableProperties, b as Head, H as HtmlAttr, M as MaybeFalsy, b as ReactiveHead, c as ResolvableArray, d as ResolvableBase, e as ResolvableBodyAttributes, f as ResolvableHtmlAttributes, g as ResolvableLink, h as ResolvableMeta, i as ResolvableNoscript, a as ResolvableProperties, j as ResolvableScript, k as ResolvableStyle, l as ResolvableTitle, m as ResolvableTitleTemplate, n as ResolvableUnion, R as ResolvableValue } from './shared/vue.B8YcFbNO.mjs';
import { UseHeadSafeInput } from './types.mjs';
export { Base, BodyAttributes, HeadSafe, HtmlAttributes, Link, MergeHead, Meta, Noscript, SafeBodyAttr, SafeHtmlAttr, SafeLink, SafeMeta, SafeNoscript, SafeScript, SafeStyle, Script, Style } from './types.mjs';
export { AsVoidFunctions, EventHandlerOptions, RecordingEntry, ScriptInstance, UseFunctionType, UseScriptContextOptions, UseScriptLoader, UseScriptLoaderInput, UseScriptResolvedInput, UseScriptResolver, UseScriptStatus, UseScriptTrigger, WarmupStrategy, createSpyProxy } from 'unhead/scripts';
export { UseScriptContext, UseScriptInput, UseScriptLoaderOptions, UseScriptOptions, UseScriptReturn, UseScriptScopeReturn, VueScriptInstance, VueScriptScope, useScript } from './scripts.mjs';
export { resolveUnrefHeadInput } from './utils.mjs';
export { V as VueHeadMixin } from './shared/vue.DnywREVF.mjs';
export { createUnhead, defineLink, defineScript } from 'unhead';
import 'vue';
import 'unhead/utils';

declare const unheadVueComposablesImports: {
    '@unhead/vue': string[];
};

declare const headSymbol = "usehead";
declare function injectHead(): VueHeadClient;

declare function useHead<I = UseHeadInput>(input?: UseHeadInput, options?: UseHeadOptions): ActiveHeadEntry<I>;
declare function useHeadSafe(input?: UseHeadSafeInput, options?: UseHeadOptions): ActiveHeadEntry<UseHeadSafeInput>;
declare function useSeoMeta(input?: UseSeoMetaInput, options?: UseHeadOptions): ActiveHeadEntry<UseSeoMetaInput>;

/** @deprecated Use `useHead` instead. */
declare const useServerHead: typeof useHead;
/** @deprecated Use `useHeadSafe` instead. */
declare const useServerHeadSafe: typeof useHeadSafe;
/** @deprecated Use `useSeoMeta` instead. */
declare const useServerSeoMeta: typeof useSeoMeta;

export { UseHeadInput, UseHeadOptions, UseHeadSafeInput, UseSeoMetaInput, VueHeadClient, headSymbol, injectHead, unheadVueComposablesImports, useHead, useHeadSafe, useSeoMeta, useServerHead, useServerHeadSafe, useServerSeoMeta };
