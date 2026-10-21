import { av as RawInput, R as ResolvableHead, aJ as ResolvableValue, aC as ResolvableProperties, G as GenericLink, D as DataKeys, aL as SchemaAugmentations, a8 as MetaGeneric, t as GenericScript, b9 as UnheadHtmlAttributes, b8 as UnheadBodyAttributesWithoutEvents } from './unhead.DC0v7nqS.js';

type Base = RawInput<'base'>;
type HtmlAttributes = RawInput<'htmlAttrs'>;
type Noscript = RawInput<'noscript'>;
type Style = RawInput<'style'>;
type BodyAttributes = RawInput<'bodyAttrs'>;

type SafeBodyAttr = ResolvableProperties<Pick<UnheadBodyAttributesWithoutEvents, 'id' | 'class' | 'style'> & DataKeys & SchemaAugmentations['bodyAttrs']>;
type SafeHtmlAttr = ResolvableProperties<Pick<UnheadHtmlAttributes, 'id' | 'class' | 'style' | 'lang' | 'dir'> & DataKeys & SchemaAugmentations['htmlAttrs']>;
type SafeMeta = ResolvableProperties<Pick<MetaGeneric, 'id' | 'name' | 'property' | 'charset' | 'content' | 'media'> & DataKeys & SchemaAugmentations['meta']>;
type SafeLink = ResolvableProperties<Pick<GenericLink, 'id' | 'color' | 'crossorigin' | 'fetchpriority' | 'href' | 'hreflang' | 'imagesrcset' | 'imagesizes' | 'integrity' | 'media' | 'referrerpolicy' | 'rel' | 'sizes' | 'type'> & DataKeys & SchemaAugmentations['link']>;
type SafeScript = ResolvableProperties<Pick<GenericScript, 'id' | 'type' | 'nonce' | 'blocking'> & DataKeys & SchemaAugmentations['script']>;
type SafeNoscript = ResolvableProperties<Pick<Noscript, 'id'> & DataKeys & Omit<SchemaAugmentations['noscript'], 'innerHTML'>>;
type SafeStyle = ResolvableProperties<Pick<Style, 'id' | 'media' | 'nonce' | 'title' | 'blocking'> & DataKeys & Omit<SchemaAugmentations['style'], 'innerHTML'>>;
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

export type { Base as B, HeadSafe as H, Noscript as N, SafeBodyAttr as S, BodyAttributes as a, HtmlAttributes as b, SafeHtmlAttr as c, SafeLink as d, SafeMeta as e, SafeNoscript as f, SafeScript as g, SafeStyle as h, Style as i };
