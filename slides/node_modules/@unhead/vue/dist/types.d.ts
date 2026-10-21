import { ResolvableHead, GenericLink, DataKeys, SchemaAugmentations, MetaGeneric, Style as Style$1, GenericScript, TagPriority, TagPosition, ResolvesDuplicates, ProcessesTemplateParams, Noscript as Noscript$1, HtmlAttributes as HtmlAttributes$1, BodyAttributesWithoutEvents, RawInput } from 'unhead/types';
export { ActiveHeadEntry, AriaAttributes, BodyAttributesWithoutEvents, BodyEvents, DataKeys, GenericLink, GenericScript, GlobalAttributes, HeadEntryOptions, HeadTag, HttpEventAttributes, MetaFlat, MetaFlat as MetaFlatInput, RawInput, RenderSSRHeadOptions, ResolvableHead, SerializableHead, SpeculationRules, Unhead } from 'unhead/types';
import { R as ResolvableValue, a as ResolvableProperties } from './shared/vue.B8YcFbNO.js';
export { B as BodyAttr, D as DeepResolvableProperties, b as Head, H as HtmlAttr, M as MaybeFalsy, b as ReactiveHead, c as ResolvableArray, d as ResolvableBase, e as ResolvableBodyAttributes, f as ResolvableHtmlAttributes, g as ResolvableLink, h as ResolvableMeta, i as ResolvableNoscript, j as ResolvableScript, k as ResolvableStyle, l as ResolvableTitle, m as ResolvableTitleTemplate, n as ResolvableUnion, U as UseHeadInput, o as UseHeadOptions, p as UseSeoMetaInput, V as VueHeadClient } from './shared/vue.B8YcFbNO.js';
import 'vue';

type SafeBodyAttr = ResolvableProperties<Pick<BodyAttributesWithoutEvents, 'id' | 'class' | 'style'> & DataKeys & SchemaAugmentations['bodyAttrs']>;
type SafeHtmlAttr = ResolvableProperties<Pick<HtmlAttributes$1, 'id' | 'class' | 'style' | 'lang' | 'dir'> & DataKeys & SchemaAugmentations['htmlAttrs']>;
type SafeMeta = ResolvableProperties<Pick<MetaGeneric, 'id' | 'name' | 'property' | 'charset' | 'content' | 'media'> & DataKeys & SchemaAugmentations['meta']>;
type SafeLink = ResolvableProperties<Pick<GenericLink, 'id' | 'color' | 'crossorigin' | 'fetchpriority' | 'href' | 'hreflang' | 'imagesrcset' | 'imagesizes' | 'integrity' | 'media' | 'referrerpolicy' | 'rel' | 'sizes' | 'type'> & DataKeys & SchemaAugmentations['link']>;
type SafeScript = ResolvableProperties<Pick<GenericScript, 'id' | 'type' | 'nonce' | 'blocking'> & DataKeys & {
    textContent?: string;
} & TagPriority & TagPosition & ResolvesDuplicates & ProcessesTemplateParams>;
type SafeNoscript = ResolvableProperties<Pick<Noscript$1, 'id'> & DataKeys & Omit<SchemaAugmentations['noscript'], 'innerHTML'>>;
type SafeStyle = ResolvableProperties<Pick<Style$1, 'id' | 'media' | 'nonce' | 'title' | 'blocking'> & DataKeys & Omit<SchemaAugmentations['style'], 'innerHTML'>>;
interface HeadSafe extends Pick<ResolvableHead, 'title' | 'titleTemplate' | 'templateParams'> {
    /**
     * The `<link>` HTML element specifies relationships between the current document and an external resource.
     * This element is most commonly used to link to stylesheets, but is also used to establish site icons
     * (both "favicon" style icons and icons for the home screen and apps on mobile devices) among other things.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-as
     */
    link?: ResolvableValue<ResolvableValue<SafeLink[]>>;
    /**
     * The `<meta>` element represents metadata that cannot be expressed in other HTML elements, like `<link>` or `<script>`.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta
     */
    meta?: ResolvableValue<ResolvableValue<SafeMeta>[]>;
    /**
     * The `<style>` HTML element contains style information for a document, or part of a document.
     * It contains CSS, which is applied to the contents of the document containing the `<style>` element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style
     */
    style?: ResolvableValue<ResolvableValue<(SafeStyle | string)>[]>;
    /**
     * The `<script>` HTML element is used to embed executable code or data; this is typically used to embed or refer to JavaScript code.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
     */
    script?: ResolvableValue<ResolvableValue<(SafeScript | string)>[]>;
    /**
     * The `<noscript>` HTML element defines a section of HTML to be inserted if a script type on the page is unsupported
     * or if scripting is currently turned off in the browser.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript
     */
    noscript?: ResolvableValue<ResolvableValue<(SafeNoscript | string)>[]>;
    /**
     * Attributes for the `<html>` HTML element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/html
     */
    htmlAttrs?: ResolvableValue<SafeHtmlAttr>;
    /**
     * Attributes for the `<body>` HTML element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body
     */
    bodyAttrs?: ResolvableValue<SafeBodyAttr>;
}
type UseHeadSafeInput = ResolvableValue<HeadSafe>;

/** @deprecated */
type MergeHead = object;

type Base = RawInput<'base'>;
type HtmlAttributes = RawInput<'htmlAttrs'>;
type Noscript = RawInput<'noscript'>;
type Style = RawInput<'style'>;
type Meta = RawInput<'meta'>;
type Script = RawInput<'script'>;
type Link = RawInput<'link'>;
type BodyAttributes = RawInput<'bodyAttrs'>;

export { ResolvableProperties, ResolvableValue };
export type { Base, BodyAttributes, HeadSafe, HtmlAttributes, Link, MergeHead, Meta, Noscript, SafeBodyAttr, SafeHtmlAttr, SafeLink, SafeMeta, SafeNoscript, SafeScript, SafeStyle, Script, Style, UseHeadSafeInput };
