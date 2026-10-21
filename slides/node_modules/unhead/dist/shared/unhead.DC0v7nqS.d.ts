type Booleanable = boolean | 'false' | 'true' | '';
type Stringable = string | Booleanable | number;
type Arrayable<T> = T | Array<T>;
type Never<T> = {
    [P in keyof T]?: never;
};
type Falsy = false | null | undefined;
type ResolvableValue<T> = T | Falsy | (() => (T | Falsy));
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type _ResolvablePropertiesRaw<T> = {
    [K in keyof T as {} extends Pick<T, K> ? never : K]: ResolvableValue<T[K]>;
} & {
    [K in keyof T as {} extends Pick<T, K> ? K : never]?: ResolvableValue<T[K]>;
};
type ResolvableProperties<T> = Prettify<_ResolvablePropertiesRaw<T>>;
type ResolvableUnion<T> = T extends string | number | boolean ? ResolvableValue<T> : T extends object ? DeepResolvableProperties<T> : ResolvableValue<T>;
/**
 * Recursively marks all properties and arrays as readonly.
 * Applied to `InferScript`/`InferLink` return types so that
 * `defineScript`/`defineLink` accept both mutable and `as const` inputs.
 */
type DeepReadonly<T> = T extends (...a: any[]) => any ? T : T extends ReadonlyArray<infer U> ? readonly DeepReadonly<U>[] : T extends object ? {
    readonly [K in keyof T]: DeepReadonly<T[K]>;
} : T;
type DeepResolvableProperties<T> = {
    [K in keyof T]?: T[K] extends string | object ? T[K] extends string ? ResolvableUnion<T[K]> : T[K] extends object ? DeepResolvableProperties<T[K]> : ResolvableUnion<T[K]> : ResolvableUnion<T[K]>;
};

interface DataKeys {
    [key: `data-${string}`]: Stringable;
}

interface BaseFields {
    /**
     * The base URL to be used throughout the document for relative URLs. Absolute and relative URLs are allowed.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base#attr-href
     */
    href?: string;
    /**
     * A keyword or author-defined name of the default browsing context to show the results of navigation from `<a>`,
     * `<area>`, or `<form>` elements without explicit target attributes.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base#attr-target
     */
    target?: '_blank' | '_self' | '_parent' | '_top' | (string & Record<never, never>);
}
/**
 * The `<base>` HTML element requires at least `href` or `target` to be valid.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base
 */
type Base = (BaseFields & {
    href: string;
}) | (BaseFields & {
    target: '_blank' | '_self' | '_parent' | '_top' | (string & Record<never, never>);
});

interface GlobalAttributes {
    /**
     * Provides a hint for generating a keyboard shortcut for the current element. This attribute consists of a
     * space-separated list of characters. The browser should use the first one that exists on the computer keyboard layout.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/accesskey
     */
    accesskey?: string;
    /**
     * Controls whether and how text input is automatically capitalized as it is entered/edited by the user.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize
     */
    autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
    /**
     * Indicates that an element is to be focused on page load, or as soon as the `<dialog>` it is part of is displayed.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus
     */
    autofocus?: Booleanable;
    /**
     * A space-separated list of the classes of the element. Classes allows CSS and JavaScript to select and access
     * specific elements via the class selectors or functions like the method Document.getElementsByClassName().
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class
     */
    class?: Stringable;
    /**
     * An enumerated attribute indicating if the element should be editable by the user.
     * If so, the browser modifies its widget to allow editing.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
     */
    contenteditable?: Booleanable;
    /**
     * An enumerated attribute indicating the directionality of the element's text.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir
     */
    dir?: 'ltr' | 'rtl' | 'auto';
    /**
     * An enumerated attribute indicating whether the element can be dragged, using the Drag and Drop API.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/draggable
     */
    draggable?: Booleanable;
    /**
     * Hints what action label (or icon) to present for the enter key on virtual keyboards.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint
     */
    enterkeyhint?: string;
    /**
     * Used to transitively export shadow parts from a nested shadow tree into a containing light tree.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/exportparts
     */
    exportparts?: string;
    /**
     * A Boolean attribute indicates that the element is not yet, or is no longer, relevant.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden
     */
    hidden?: Booleanable;
    /**
     * The id global attribute defines a unique identifier (ID) which must be unique in the whole document.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id
     */
    id?: string;
    /**
     * Provides a hint to browsers as to the type of virtual keyboard configuration to use when editing this element or its contents.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode
     */
    inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
    /**
     * Allows you to specify that a standard HTML element should behave like a registered custom built-in element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/is
     */
    is?: string;
    /**
     * The unique, global identifier of an item.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemid
     */
    itemid?: string;
    /**
     * Used to add properties to an item.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemprop
     */
    itemprop?: string;
    /**
     * Properties that are not descendants of an element with the itemscope attribute can be associated with the item using an itemref.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemref
     */
    itemref?: string;
    /**
     * itemscope (usually) works along with itemtype to specify that the HTML contained in a block is about a particular item.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemscope
     */
    itemscope?: string;
    /**
     * Specifies the URL of the vocabulary that will be used to define itemprops (item properties) in the data structure.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemtype
     */
    itemtype?: string;
    /**
     * Helps define the language of an element: the language that non-editable elements are in, or the language
     * that editable elements should be written in by the user.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang
     */
    lang?: 'en' | 'en-US' | 'en-GB' | 'de' | 'fr' | 'es' | 'it' | 'ja' | 'ko' | 'nl' | 'pl' | 'pt' | 'pt-BR' | 'ru' | 'zh' | 'zh-CN' | 'zh-TW' | 'ar' | 'hi' | 'id' | 'th' | 'tr' | 'uk' | 'vi' | (string & Record<never, never>);
    /**
     * A cryptographic nonce ("number used once") which can be used by Content Security Policy to determine whether or not
     * a given fetch will be allowed to proceed.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce
     */
    nonce?: string;
    /**
     * A space-separated list of the part names of the element. Part names allows CSS to select and style specific elements
     * in a shadow tree via the ::part pseudo-element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/part
     */
    part?: string;
    /**
     * Assigns a slot in a shadow DOM shadow tree to an element: An element with a slot attribute is assigned to the slot
     * created by the `<slot>` element whose name attribute's value matches that slot attribute's value.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/slot
     */
    slot?: string;
    /**
     * An enumerated attribute defines whether the element may be checked for spelling errors.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/spellcheck
     */
    spellcheck?: Booleanable;
    /**
     * Contains CSS styling declarations to be applied to the element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/style
     */
    style?: string;
    /**
     * An integer attribute indicating if the element can take input focus (is focusable),
     * if it should participate to sequential keyboard navigation, and if so, at what position.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
     */
    tabindex?: number;
    /**
     * Contains a text representing advisory information related to the element it belongs to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title
     */
    title?: string;
    /**
     * An enumerated attribute that is used to specify whether an element's attribute values and the values of its
     * Text node children are to be translated when the page is localized, or whether to leave them unchanged.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/translate
     */
    translate?: 'yes' | 'no' | '';
}

interface BodyEvents {
    /**
     * Script to be run after the document is printed
     */
    onafterprint?: string;
    /**
     * Script to be run before the document is printed
     */
    onbeforeprint?: string;
    /**
     * Script to be run when the document is about to be unloaded
     */
    onbeforeunload?: string;
    /**
     * Script to be run when an error occurs
     */
    onerror?: string;
    /**
     * Script to be run when there has been changes to the anchor part of the a URL
     */
    onhashchange?: string;
    /**
     * Fires after the page is finished loading
     */
    onload?: string;
    /**
     * Script to be run when the message is triggered
     */
    onmessage?: string;
    /**
     * Script to be run when the browser starts to work offline
     */
    onoffline?: string;
    /**
     * Script to be run when the browser starts to work online
     */
    ononline?: string;
    /**
     * Script to be run when a user navigates away from a page
     */
    onpagehide?: string;
    /**
     * Script to be run when a user navigates to a page
     */
    onpageshow?: string;
    /**
     * Script to be run when the window's history changes
     */
    onpopstate?: string;
    /**
     * Fires when the browser window is resized
     */
    onresize?: string;
    /**
     * Script to be run when a Web Storage area is updated
     */
    onstorage?: string;
    /**
     * Fires once a page has unloaded (or the browser window has been closed)
     */
    onunload?: string;
}
interface BodyAttributesWithoutEvents extends Pick<GlobalAttributes, 'class' | 'style' | 'id' | 'dir' | 'lang' | 'translate'> {
}

interface HtmlAttributes extends Pick<GlobalAttributes, 'lang' | 'dir' | 'translate' | 'class' | 'style' | 'id'> {
    /**
     * Open-graph protocol prefix.
     *
     * @see https://ogp.me/
     */
    prefix?: 'og: https://ogp.me/ns#' | (string & Record<never, never>);
    /**
     * XML namespace
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
     */
    xmlns?: string;
    /**
     * Custom XML namespace
     *
     * @See https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
     */
    [key: `xmlns:${'og' | string}`]: string;
}

interface HttpEventAttributes {
    /**
     * Script to be run on abort
     */
    onabort?: string;
    /**
     * Script to be run when an error occurs when the file is being loaded
     */
    onerror?: string;
    /**
     * Script to be run when the file is loaded
     */
    onload?: string;
    /**
     * The progress event is fired periodically when a request receives more data.
     */
    onprogress?: string;
    /**
     * Script to be run just as the file begins to load before anything is actually loaded
     */
    onloadstart?: string;
}

type ReferrerPolicy = '' | 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';

/**
 * Represents the possible blocking tokens for an element.
 */
type BlockingToken = 'render';
/**
 * Represents the blocking attribute for an element.
 * The blocking attribute must have a value that is an unordered set of unique space-separated tokens,
 * each of which are possible blocking tokens.
 */
interface Blocking {
    /**
     * The blocking attribute indicates that certain operations should be blocked on the fetching of an external resource.
     * The value is an unordered set of unique space-separated tokens, each of which are possible blocking tokens.
     *
     * @example
     * blocking: "render"
     */
    blocking?: BlockingToken | string;
}

/**
 * Events that fire on link elements (load/error)
 */
type LinkHttpEvents = Pick<HttpEventAttributes, 'onload' | 'onerror'>;
/**
 * Base properties shared by all link types
 */
interface LinkBase extends Pick<GlobalAttributes, 'nonce' | 'id'>, Blocking, DataKeys {
    /**
     * Provides a hint of the relative priority to use when fetching a preloaded resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-fetchpriority
     */
    fetchpriority?: 'high' | 'low' | 'auto';
    /**
     * A string indicating which referrer to use when fetching the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-referrerpolicy
     */
    referrerpolicy?: ReferrerPolicy;
}
/**
 * Stylesheet-specific link (fires events)
 */
interface StylesheetLink extends LinkBase, LinkHttpEvents {
    rel: 'stylesheet';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * This attribute specifies the media that the linked resource applies to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-media
     */
    media?: string;
    /**
     * Contains inline metadata — a base64-encoded cryptographic hash of the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-integrity
     */
    integrity?: string;
    /**
     * This enumerated attribute indicates whether CORS must be used when fetching the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-crossorigin
     */
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    /**
     * The title attribute has special semantics on the `<link>` element.
     * When used on a `<link rel="stylesheet">` it defines a default or an alternate stylesheet.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-title
     */
    title?: string;
    /**
     * This attribute is used to define the type of the content linked to.
     * It can be omitted; `text/css` is assumed.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-type
     */
    type?: 'text/css' | (string & Record<never, never>);
    /**
     * Whether the stylesheet is disabled.
     */
    disabled?: boolean;
}
/**
 * Base for preload links (fires events)
 */
interface PreloadLinkBase extends LinkBase, LinkHttpEvents {
    rel: 'preload';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * This enumerated attribute indicates whether CORS must be used when fetching the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-crossorigin
     */
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    /**
     * Contains inline metadata — a base64-encoded cryptographic hash of the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-integrity
     */
    integrity?: string;
    /**
     * This attribute specifies the media that the linked resource applies to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-media
     */
    media?: string;
}
/**
 * Base fields for image preload links.
 */
interface PreloadImageLinkFields extends Omit<PreloadLinkBase, 'href'> {
    as: 'image';
    /**
     * This attribute specifies the URL of the linked resource.
     * Optional for image preloads when using imagesrcset instead.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href?: string;
    type?: 'image/webp' | 'image/avif' | 'image/png' | 'image/jpeg' | 'image/gif' | 'image/svg+xml' | (string & Record<never, never>);
    /**
     * For rel="preload" and as="image" only, the imagesizes attribute indicates
     * to preload the appropriate resource used by an img element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-imagesizes
     */
    imagesizes?: string;
    /**
     * For rel="preload" and as="image" only, the imagesrcset attribute indicates
     * to preload the appropriate resource used by an img element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-imagesrcset
     */
    imagesrcset?: string;
}
/**
 * Preload: image (has imagesrcset/imagesizes).
 * Requires at least one of `href` or `imagesrcset`.
 */
type PreloadImageLink = (PreloadImageLinkFields & {
    href: string;
}) | (PreloadImageLinkFields & {
    imagesrcset: string;
});
/**
 * Preload: font
 */
interface PreloadFontLink extends PreloadLinkBase {
    as: 'font';
    type?: 'font/woff2' | 'font/woff' | 'font/ttf' | 'font/otf' | (string & Record<never, never>);
    /**
     * For fonts, crossorigin is required for CORS.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-crossorigin
     */
    crossorigin: '' | 'anonymous' | 'use-credentials';
}
/**
 * Preload: script
 */
interface PreloadScriptLink extends PreloadLinkBase {
    as: 'script';
    type?: 'text/javascript' | 'module' | (string & Record<never, never>);
}
/**
 * Preload: style
 */
interface PreloadStyleLink extends PreloadLinkBase {
    as: 'style';
    type?: 'text/css' | (string & Record<never, never>);
}
/**
 * Preload: other types
 */
interface PreloadOtherLink extends PreloadLinkBase {
    as: 'audio' | 'document' | 'embed' | 'fetch' | 'object' | 'track' | 'video' | 'worker';
    type?: string;
}
/**
 * Combined preload union
 */
type PreloadLink = PreloadImageLink | PreloadFontLink | PreloadScriptLink | PreloadStyleLink | PreloadOtherLink;
/**
 * Modulepreload-specific link (fires events)
 */
interface ModulepreloadLink extends LinkBase, LinkHttpEvents {
    rel: 'modulepreload';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * Contains inline metadata — a base64-encoded cryptographic hash of the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-integrity
     */
    integrity?: string;
    /**
     * This enumerated attribute indicates whether CORS must be used when fetching the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-crossorigin
     */
    crossorigin?: '' | 'anonymous' | 'use-credentials';
}
/**
 * Prefetch-specific link
 */
interface PrefetchLink extends LinkBase {
    rel: 'prefetch';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * This attribute is used when rel="prefetch" to specify the type of content being loaded.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-as
     */
    as?: 'audio' | 'document' | 'embed' | 'fetch' | 'font' | 'image' | 'object' | 'script' | 'style' | 'track' | 'video' | 'worker';
    /**
     * This enumerated attribute indicates whether CORS must be used when fetching the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-crossorigin
     */
    crossorigin?: '' | 'anonymous' | 'use-credentials';
}
/**
 * Icon links may be scoped to a media query, most commonly to serve
 * separate light and dark variants.
 */
interface IconLinkBase extends LinkBase {
    /**
     * This attribute specifies the media that the linked resource applies to,
     * for example `(prefers-color-scheme: dark)`.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-media
     */
    media?: string;
    /**
     * This enumerated attribute indicates whether CORS must be used when fetching the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-crossorigin
     */
    crossorigin?: '' | 'anonymous' | 'use-credentials';
}
/**
 * Favicon link.
 *
 * Prefer `rel: 'icon'` over `'shortcut icon'` — the `shortcut` keyword is non-standard
 * and was only used by older versions of Internet Explorer.
 */
interface FaviconLink extends IconLinkBase {
    rel: 'icon' | 'shortcut icon';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * This attribute defines the sizes of the icons for visual media contained in the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-sizes
     */
    sizes?: 'any' | '16x16' | '32x32' | '48x48' | '64x64' | '96x96' | '128x128' | '192x192' | '512x512' | (string & Record<never, never>);
    /**
     * This attribute is used to define the type of the content linked to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-type
     */
    type?: 'image/png' | 'image/svg+xml' | 'image/x-icon' | 'image/gif' | 'image/webp' | (string & Record<never, never>);
}
/**
 * Apple touch icon link
 */
interface AppleTouchIconLink extends IconLinkBase {
    rel: 'apple-touch-icon';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * This attribute defines the sizes of the icons for visual media contained in the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-sizes
     */
    sizes?: '180x180' | '152x152' | '120x120' | '76x76' | (string & Record<never, never>);
    /**
     * This attribute is used to define the type of the content linked to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-type
     */
    type?: 'image/png' | (string & Record<never, never>);
}
/**
 * Mask icon link (Safari pinned tab). Requires `color`.
 *
 * @see https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/pinnedTabs/pinnedTabs.html
 */
interface MaskIconLink extends IconLinkBase {
    rel: 'mask-icon';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * The color for the mask icon. Required per spec.
     *
     * @see https://html.spec.whatwg.org/multipage/semantics.html#attr-link-color
     */
    color: string;
}
/**
 * Combined icon link union
 */
type IconLink = FaviconLink | AppleTouchIconLink | MaskIconLink;
/**
 * Manifest link
 */
interface ManifestLink extends LinkBase {
    rel: 'manifest';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * This attribute is used to define the type of the content linked to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-type
     */
    type?: 'application/manifest+json' | (string & Record<never, never>);
    /**
     * This enumerated attribute indicates whether CORS must be used when fetching the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-crossorigin
     */
    crossorigin?: '' | 'anonymous' | 'use-credentials';
}
/**
 * Canonical link
 */
interface CanonicalLink extends LinkBase {
    rel: 'canonical';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
}
/**
 * DNS-prefetch link (no events, minimal props)
 */
interface DnsPrefetchLink extends LinkBase {
    rel: 'dns-prefetch';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
}
/**
 * Preconnect link (no events)
 */
interface PreconnectLink extends LinkBase {
    rel: 'preconnect';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * This enumerated attribute indicates whether CORS must be used when fetching the resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-crossorigin
     */
    crossorigin?: '' | 'anonymous' | 'use-credentials';
}
/**
 * Prerender link
 */
interface PrerenderLink extends LinkBase {
    rel: 'prerender';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
}
/**
 * Alternate language link (hreflang translations)
 */
interface AlternateLanguageLink extends LinkBase {
    rel: 'alternate';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * This attribute indicates the language of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-hreflang
     */
    hreflang: 'x-default' | 'en' | 'en-US' | 'en-GB' | 'de' | 'fr' | 'es' | 'it' | 'ja' | 'ko' | 'nl' | 'pl' | 'pt' | 'pt-BR' | 'ru' | 'zh' | 'zh-CN' | 'zh-TW' | 'ar' | 'hi' | 'id' | 'th' | 'tr' | 'uk' | 'vi' | (string & Record<never, never>);
    /**
     * The title attribute defines the title of the link.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-title
     */
    title?: string;
    /**
     * This attribute is used to define the type of the content linked to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-type
     */
    type?: string;
    /**
     * This attribute specifies the media that the linked resource applies to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-media
     */
    media?: string;
}
/**
 * Alternate feed link (RSS, Atom, JSON Feed)
 */
interface AlternateFeedLink extends LinkBase {
    rel: 'alternate';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * This attribute is used to define the type of the content linked to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-type
     */
    type: 'application/rss+xml' | 'application/atom+xml' | 'application/json' | (string & Record<never, never>);
    /**
     * The title attribute defines the title of the link.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-title
     */
    title?: string;
    /**
     * This attribute indicates the language of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-hreflang
     */
    hreflang?: 'x-default' | 'en' | 'en-US' | 'en-GB' | 'de' | 'fr' | 'es' | 'it' | 'ja' | 'ko' | 'nl' | 'pl' | 'pt' | 'pt-BR' | 'ru' | 'zh' | 'zh-CN' | 'zh-TW' | 'ar' | 'hi' | 'id' | 'th' | 'tr' | 'uk' | 'vi' | (string & Record<never, never>);
}
/**
 * Alternate media link (responsive/device-specific)
 */
interface AlternateMediaLink extends LinkBase {
    rel: 'alternate';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
    /**
     * This attribute specifies the media that the linked resource applies to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-media
     */
    media: string;
    /**
     * The title attribute defines the title of the link.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-title
     */
    title?: string;
    /**
     * This attribute is used to define the type of the content linked to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-type
     */
    type?: string;
}
/**
 * Bare alternate link without hreflang, type, or media.
 * Valid HTML, typically used as a fallback or generic alternate.
 */
interface BareAlternateLink extends LinkBase {
    rel: 'alternate';
    /**
     * This attribute specifies the URL of the linked resource.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-href
     */
    href: string;
}
/**
 * Combined alternate link union.
 * Accepts language (hreflang), feed (type), responsive (media), or bare alternate links.
 */
type AlternateLink = AlternateLanguageLink | AlternateFeedLink | AlternateMediaLink | BareAlternateLink;
/**
 * Author link
 */
interface AuthorLink extends LinkBase {
    rel: 'author';
    href: string;
}
/**
 * License link
 */
interface LicenseLink extends LinkBase {
    rel: 'license';
    href: string;
}
/**
 * Help link
 */
interface HelpLink extends LinkBase {
    rel: 'help';
    href: string;
}
/**
 * Search link
 */
interface SearchLink extends LinkBase {
    rel: 'search';
    href: string;
    type?: 'application/opensearchdescription+xml' | (string & Record<never, never>);
    title?: string;
}
/**
 * Prev/Next navigation links
 */
interface PrevLink extends LinkBase {
    rel: 'prev';
    href: string;
}
interface NextLink extends LinkBase {
    rel: 'next';
    href: string;
}
/**
 * Pingback link
 */
interface PingbackLink extends LinkBase {
    rel: 'pingback';
    href: string;
}
/**
 * Me link. Identifies the resource as representing the current user
 * (IndieWeb / rel-me verification, Mastodon profile verification).
 *
 * @see https://html.spec.whatwg.org/multipage/links.html#link-type-me
 */
interface MeLink extends LinkBase {
    rel: 'me';
    href: string;
}
/**
 * Privacy policy link.
 *
 * @see https://html.spec.whatwg.org/multipage/links.html#link-type-privacy-policy
 */
interface PrivacyPolicyLink extends LinkBase {
    rel: 'privacy-policy';
    href: string;
}
/**
 * Terms of service link.
 *
 * @see https://html.spec.whatwg.org/multipage/links.html#link-type-terms-of-service
 */
interface TermsOfServiceLink extends LinkBase {
    rel: 'terms-of-service';
    href: string;
}
/**
 * Expect link. Blocks rendering until a named element is present and ready.
 *
 * @see https://html.spec.whatwg.org/multipage/links.html#link-type-expect
 */
interface ExpectLink extends LinkBase {
    rel: 'expect';
    href: string;
    blocking?: 'render';
}
/**
 * Webmention endpoint link (IndieWeb).
 *
 * @see https://www.w3.org/TR/webmention/
 */
interface WebmentionLink extends LinkBase {
    rel: 'webmention';
    href: string;
}
/**
 * Compression dictionary link (experimental).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link#compression-dictionary
 */
interface CompressionDictionaryLink extends LinkBase {
    rel: 'compression-dictionary';
    href: string;
}
/**
 * Sitemap link. Points to a sitemap for the site.
 *
 * @see https://www.iana.org/assignments/link-relations/link-relations.xhtml
 */
interface SitemapLink extends LinkBase {
    rel: 'sitemap';
    href: string;
    type?: 'application/xml' | (string & Record<never, never>);
    title?: string;
}
/**
 * Apple touch startup image link. Specifies a splash screen image for iOS
 * when a web app is launched from the home screen.
 *
 * @see https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
 */
interface AppleTouchStartupImageLink extends LinkBase {
    rel: 'apple-touch-startup-image';
    href: string;
    media?: string;
}
/**
 * AMP HTML link. Points to the AMP version of the current document.
 *
 * @see https://amp.dev/documentation/guides-and-tutorials/start/create/prepare_for_discovery/
 */
interface AmpHtmlLink extends LinkBase {
    rel: 'amphtml';
    href: string;
}
/**
 * WebSub hub link. Points to a WebSub hub for real-time content distribution.
 *
 * @see https://www.w3.org/TR/websub/
 */
interface HubLink extends LinkBase {
    rel: 'hub';
    href: string;
}
/**
 * Alternate stylesheet link. User-selectable alternate stylesheet.
 * Requires a `title` to appear in the browser's stylesheet picker.
 *
 * @see https://html.spec.whatwg.org/multipage/semantics.html#rel-alternate-stylesheet
 */
interface AlternateStylesheetLink extends LinkBase, LinkHttpEvents {
    rel: 'alternate stylesheet';
    href: string;
    title: string;
    media?: string;
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    integrity?: string;
    type?: 'text/css' | (string & Record<never, never>);
    disabled?: boolean;
}
/**
 * Union of all `rel` values that have narrowed link type definitions.
 * Useful for building type guards or conditional logic based on `rel` values.
 */
type KnownLinkRel = 'stylesheet' | 'alternate stylesheet' | 'preload' | 'modulepreload' | 'prefetch' | 'icon' | 'shortcut icon' | 'apple-touch-icon' | 'mask-icon' | 'manifest' | 'canonical' | 'dns-prefetch' | 'preconnect' | 'prerender' | 'alternate' | 'author' | 'license' | 'help' | 'search' | 'prev' | 'next' | 'pingback' | 'me' | 'webmention' | 'privacy-policy' | 'terms-of-service' | 'expect' | 'compression-dictionary' | 'sitemap' | 'apple-touch-startup-image' | 'amphtml' | 'hub';
/**
 * Fallback for custom or unknown `rel` types.
 *
 * Not included in the {@link Link} union to prevent silent absorption of known
 * `rel` values (e.g. so `rel: 'preload'` without `as` stays an error instead of
 * collapsing into this permissive shape).
 *
 * For non-standard `rel` values not covered by {@link KnownLinkRel}, prefer
 * {@link defineLink}, which enforces strict narrowing on known rels while
 * accepting `GenericLink` for anything else:
 *
 * ```ts
 * import { defineLink } from 'unhead'
 * useHead({ link: [defineLink({ rel: 'openid2.provider', href: 'https://...' })] })
 * ```
 */
interface GenericLink extends LinkBase {
    rel: string;
    href: string;
    as?: 'audio' | 'document' | 'embed' | 'fetch' | 'font' | 'image' | 'object' | 'script' | 'style' | 'track' | 'video' | 'worker' | (string & Record<never, never>);
    sizes?: string;
    type?: string;
    media?: string;
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    integrity?: string;
    hreflang?: 'x-default' | 'en' | 'en-US' | 'en-GB' | 'de' | 'fr' | 'es' | 'it' | 'ja' | 'ko' | 'nl' | 'pl' | 'pt' | 'pt-BR' | 'ru' | 'zh' | 'zh-CN' | 'zh-TW' | 'ar' | 'hi' | 'id' | 'th' | 'tr' | 'uk' | 'vi' | (string & Record<never, never>);
    imagesizes?: string;
    imagesrcset?: string;
    color?: string;
    title?: string;
    disabled?: boolean;
    prefetch?: string;
}
/**
 * Discriminated union of all link types.
 *
 * Each named `rel` value maps to a specific interface that enforces per-`rel` required
 * attributes. For example, `rel="preload"` requires the `as` attribute (see {@link PreloadLink}),
 * and `rel="mask-icon"` requires `color` (see {@link MaskIconLink}).
 *
 * For non-standard `rel` values not covered by {@link KnownLinkRel}, use {@link defineLink}:
 * ```ts
 * import { defineLink } from 'unhead'
 * useHead({ link: [defineLink({ rel: 'openid2.provider', href: 'https://...' })] })
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel
 */
type Link = StylesheetLink | AlternateStylesheetLink | PreloadLink | ModulepreloadLink | PrefetchLink | FaviconLink | AppleTouchIconLink | MaskIconLink | ManifestLink | CanonicalLink | DnsPrefetchLink | PreconnectLink | PrerenderLink | AlternateLanguageLink | AlternateFeedLink | AlternateMediaLink | BareAlternateLink | AuthorLink | LicenseLink | HelpLink | SearchLink | PrevLink | NextLink | PingbackLink | MeLink | WebmentionLink | PrivacyPolicyLink | TermsOfServiceLink | ExpectLink | CompressionDictionaryLink | SitemapLink | AppleTouchStartupImageLink | AmpHtmlLink | HubLink;
/**
 * Pick {@link Link} union members whose `rel` accepts `R`. Distributes over `R`,
 * so a union rel like `'preconnect' | 'dns-prefetch'` returns the union of all
 * matching variants.
 *
 * Unlike `Extract<Link, { rel: R }>`, this handles members whose `rel` is itself
 * a union (e.g. {@link FaviconLink}'s `'icon' | 'shortcut icon'`).
 */
type MatchLinkByRel<R> = R extends any ? Link extends infer M ? M extends {
    rel: infer MR;
} ? R extends MR ? M : never : never : never : never;
type UnionToIntersection$1<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type IsUnion$1<T, U extends T = T> = T extends T ? ([U] extends [T] ? false : true) : never;
/**
 * For a union rel input, the structural intersection of matching variants
 * (minus their `rel` discriminator) plus the original rel union. Lets
 * {@link defineLink} accept a runtime-determined rel like
 * `cond ? 'preconnect' : 'dns-prefetch'` without losing field validation.
 */
type InferLinkUnion<R> = UnionToIntersection$1<MatchLinkByRel<R> extends infer M ? (M extends any ? Omit<M, 'rel'> : never) : never> & {
    rel: R;
};
/**
 * Resolve a single link input to either its strict {@link Link} variant (when
 * `rel` is a {@link KnownLinkRel}) or {@link GenericLink} (for custom rels).
 *
 * Union `rel` inputs (e.g. `'preconnect' | 'dns-prefetch'`) resolve to the
 * structural intersection of matching variants, so runtime-determined rels are
 * accepted without casts.
 */
type InferLink<T> = T extends {
    rel: infer R;
} ? R extends KnownLinkRel ? IsUnion$1<R> extends true ? DeepReadonly<InferLinkUnion<R>> : DeepReadonly<MatchLinkByRel<R>> : R extends string ? DeepReadonly<GenericLink> & {
    rel: R;
} : never : never;

/**
 * Known meta name values
 */
type MetaNames = 'apple-itunes-app' | 'apple-mobile-web-app-capable' | 'apple-mobile-web-app-status-bar-style' | 'apple-mobile-web-app-title' | 'application-name' | 'author' | 'color-scheme' | 'creator' | 'description' | 'fb:app_id' | 'fediverse:creator' | 'format-detection' | 'generator' | 'google-site-verification' | 'google' | 'googlebot' | 'keywords' | 'mobile-web-app-capable' | 'msapplication-Config' | 'msapplication-TileColor' | 'msapplication-TileImage' | 'publisher' | 'rating' | 'referrer' | 'robots' | 'theme-color' | 'twitter:app:id:googleplay' | 'twitter:app:id:ipad' | 'twitter:app:id:iphone' | 'twitter:app:name:googleplay' | 'twitter:app:name:ipad' | 'twitter:app:name:iphone' | 'twitter:app:url:googleplay' | 'twitter:app:url:ipad' | 'twitter:app:url:iphone' | 'twitter:card' | 'twitter:creator:id' | 'twitter:creator' | 'twitter:data:1' | 'twitter:data:2' | 'twitter:description' | 'twitter:image:alt' | 'twitter:image' | 'twitter:label:1' | 'twitter:label:2' | 'twitter:player:height' | 'twitter:player:stream' | 'twitter:player:width' | 'twitter:player' | 'twitter:site:id' | 'twitter:site' | 'twitter:title' | 'viewport';
/**
 * Known meta property values (OpenGraph, etc.)
 */
type MetaProperties = 'article:author' | 'article:expiration_time' | 'article:modified_time' | 'article:published_time' | 'article:section' | 'article:tag' | 'book:author' | 'book:isbn' | 'book:release_date' | 'book:tag' | 'fb:app:id' | 'og:audio:secure_url' | 'og:audio:type' | 'og:audio:url' | 'og:description' | 'og:determiner' | 'og:image:height' | 'og:image:secure_url' | 'og:image:type' | 'og:image:url' | 'og:image:width' | 'og:image' | 'og:locale:alternate' | 'og:locale' | 'og:site:name' | 'og:title' | 'og:type' | 'og:url' | 'og:video:height' | 'og:video:secure_url' | 'og:video:type' | 'og:video:url' | 'og:video:width' | 'og:video' | 'payment:amount' | 'payment:currency' | 'payment:description' | 'payment:expires_at' | 'payment:id' | 'payment:status' | 'payment:success_url' | 'profile:first_name' | 'profile:gender' | 'profile:last_name' | 'profile:username';
/**
 * Base properties shared by all meta types
 */
interface MetaBase extends Pick<GlobalAttributes, 'id'>, DataKeys {
    /**
     * A valid media query list that can be included to set the media the metadata applies to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/theme-color
     */
    media?: '(prefers-color-scheme: light)' | '(prefers-color-scheme: dark)' | (string & Record<never, never>);
}
/**
 * Name-based meta (description, viewport, robots, etc.)
 * Mutual exclusion: no property, no http-equiv, no charset
 */
interface NameMeta extends MetaBase {
    /**
     * The name and content attributes can be used together to provide document metadata
     * in terms of name-value pairs.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-name
     */
    'name': MetaNames | (string & Record<never, never>);
    /**
     * This attribute contains the value for the name attribute.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content
     */
    'content': string | number;
    'property'?: never;
    'http-equiv'?: never;
    'charset'?: never;
}
/**
 * Property-based meta (OpenGraph, etc.)
 * Mutual exclusion: no name, no http-equiv, no charset
 */
interface PropertyMeta extends MetaBase {
    /**
     * The property attribute is used to define a property associated with the content attribute.
     * Mainly used for og and twitter meta tags.
     */
    'property': MetaProperties | (string & Record<never, never>);
    /**
     * This attribute contains the value for the property attribute.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content
     */
    'content': string | number;
    'name'?: never;
    'http-equiv'?: never;
    'charset'?: never;
}
/**
 * HTTP-equiv meta
 * Mutual exclusion: no name, no property, no charset
 */
interface HttpEquivMeta extends MetaBase {
    /**
     * Defines a pragma directive. The attribute is named http-equiv(alent) because all
     * the allowed values are names of particular HTTP headers.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-http-equiv
     */
    'http-equiv': 'content-security-policy' | 'content-type' | 'default-style' | 'x-ua-compatible' | 'refresh' | 'accept-ch' | 'origin-trial' | (string & Record<never, never>);
    /**
     * This attribute contains the value for the http-equiv attribute.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content
     */
    'content': string | number;
    'name'?: never;
    'property'?: never;
    'charset'?: never;
}
/**
 * Charset meta (standalone, no content)
 * Mutual exclusion: no name, no property, no http-equiv, no content
 */
interface CharsetMeta extends MetaBase {
    /**
     * This attribute declares the document's character encoding.
     * If the attribute is present, its value must be an ASCII case-insensitive match for the string "utf-8".
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-charset
     */
    'charset': 'utf-8' | (string & Record<never, never>);
    'name'?: never;
    'property'?: never;
    'http-equiv'?: never;
    'content'?: never;
}
/**
 * Discriminated union of all meta types.
 * Provides mutual exclusion of name/property/http-equiv/charset.
 */
type Meta = NameMeta | PropertyMeta | HttpEquivMeta | CharsetMeta;

interface MetaFlatArticle {
    /**
     * Writers of the article.
     * @example ['https://example.com/some.html', 'https://example.com/one.html']
     */
    articleAuthor?: readonly string[];
    /**
     * When the article is out of date after.
     * @example '1970-01-01T00:00:00.000Z'
     */
    articleExpirationTime?: string;
    /**
     * When the article was last changed.
     * @example '1970-01-01T00:00:00.000Z'
     */
    articleModifiedTime?: string;
    /**
     * When the article was first published.
     * @example '1970-01-01T00:00:00.000Z'
     */
    articlePublishedTime?: string;
    /**
     * A high-level section name.
     * @example 'Technology'
     */
    articleSection?: string;
    /**
     * Tag words associated with this article.
     * @example ['Apple', 'Steve Jobs']
     */
    articleTag?: readonly string[];
}
interface MetaFlatBook {
    /**
     * Who wrote this book.
     * @example ['https://example.com/some.html', 'https://example.com/one.html']
     */
    bookAuthor?: readonly string[];
    /**
     * The ISBN.
     * @example '978-3-16-148410-0'
     */
    bookIsbn?: string;
    /**
     * The date the book was released.
     * @example '1970-01-01T00:00:00.000Z'
     */
    bookReleaseDate?: string;
    /**
     * Tag words associated with this book.
     * @example ['Apple', 'Steve Jobs']
     */
    bookTag?: readonly string[];
}
interface MetaFlatProfile {
    /**
     * A name normally given to an individual by a parent or self-chosen.
     */
    profileFirstName?: string;
    /**
     * Their gender.
     */
    profileGender?: 'male' | 'female' | string;
    /**
     * A name inherited from a family or marriage and by which the individual is commonly known.
     */
    profileLastName?: string;
    /**
     * A short unique string to identify them.
     */
    profileUsername?: string;
}
interface MetaFlatPayment {
    /**
     * Description about the payment link.
     *
     * @see https://ogp.me/ns/payment#
     */
    paymentDescription?: string;
    /**
     * The currency code ISO 4217 of the payment.
     * @example 'USD'
     *
     * @see https://ogp.me/ns/payment#
     */
    paymentCurrency?: string;
    /**
     * An amount requested on the payment link in decimal format.
     * @example 19.99
     *
     * @see https://ogp.me/ns/payment#
     */
    paymentAmount?: string | number;
    /**
     * The date and time including minutes and seconds on which the payment link expires.
     * @example '1970-01-01T00:00:00.000Z'
     *
     * @see https://ogp.me/ns/payment#
     */
    paymentExpiresAt?: string;
    /**
     * Status of the payment.
     *
     * @see https://ogp.me/ns/payment#
     */
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
    /**
     * The unique identifier associated with the payment link for a given payment gateway or service provider.
     *
     * @see https://ogp.me/ns/payment#
     */
    paymentId?: string;
    /**
     * A valid URL that gets redirected when payment is success.
     *
     * @see https://ogp.me/ns/payment#
     */
    paymentSuccessUrl?: string;
}
interface MetaFlat extends MetaFlatArticle, MetaFlatBook, MetaFlatProfile, MetaFlatPayment {
    /**
     * This attribute declares the document's character encoding.
     * If the attribute is present, its value must be an ASCII case-insensitive match for the string "utf-8",
     * because UTF-8 is the only valid encoding for HTML5 documents.
     * `<meta>` elements which declare a character encoding must be located entirely within the first 1024 bytes
     * of the document.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-charset
     */
    charset?: 'utf-8' | (string & Record<never, never>);
    /**
     * Use this tag to provide a short description of the page.
     * In some situations, this description is used in the snippet shown in search results.
     *
     * @see https://developers.google.com/search/docs/advanced/appearance/snippet#meta-descriptions
     */
    description?: string;
    /**
     * Specifies one or more color schemes with which the document is compatible.
     * The browser will use this information in tandem with the user's browser or device settings to determine what colors
     * to use for everything from background and foregrounds to form controls and scrollbars.
     * The primary use for `<meta name="color-scheme">` is to indicate compatibility with—and order of preference
     * for—light and dark color modes.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name#normal
     */
    colorScheme?: 'normal' | 'light dark' | 'dark light' | 'only light' | (string & Record<never, never>);
    /**
     * The name of the application running in the web page.
     *
     * Uses:
     * - When adding the page to the home screen.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name
     */
    applicationName?: string;
    /**
     * The name of the document's author.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name
     */
    author?: string;
    /**
     * The name of the creator of the document, such as an organization or institution.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name#other_metadata_names
     */
    creator?: string;
    /**
     * The name of the document's publisher.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name#other_metadata_names
     */
    publisher?: string;
    /**
     * The identifier of the software that generated the page.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name#standard_metadata_names_defined_in_the_html_specification
     */
    generator?: string;
    /**
     * Controls the HTTP Referer header of requests sent from the document.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name#standard_metadata_names_defined_in_the_html_specification
     */
    referrer?: ReferrerPolicy;
    /**
     * This tag tells the browser how to render a page on a mobile device.
     * Presence of this tag indicates to Google that the page is mobile friendly.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name#standard_metadata_names_defined_in_other_specifications
     */
    viewport?: 'width=device-width, initial-scale=1.0' | string | Partial<{
        /**
         * Defines the pixel width of the viewport that you want the web site to be rendered at.
         */
        width?: number | string | 'device-width';
        /**
         * Defines the height of the viewport. Not used by any browser.
         */
        height?: number | string | 'device-height';
        /**
         * Defines the ratio between the device width
         * (device-width in portrait mode or device-height in landscape mode) and the viewport size.
         *
         * @minimum 0
         * @maximum 10
         */
        initialScale?: '1.0' | number | (string & Record<never, never>);
        /**
         * Defines the maximum amount to zoom in.
         * It must be greater or equal to the minimum-scale or the behavior is undefined.
         * Browser settings can ignore this rule and iOS10+ ignores it by default.
         *
         * @minimum 0
         * @maximum 10
         */
        maximumScale?: number | string;
        /**
         * Defines the minimum zoom level. It must be smaller or equal to the maximum-scale or the behavior is undefined.
         * Browser settings can ignore this rule and iOS10+ ignores it by default.
         *
         * @minimum 0
         * @maximum 10
         */
        minimumScale?: number | string;
        /**
         * If set to no, the user is unable to zoom in the webpage.
         * The default is yes. Browser settings can ignore this rule, and iOS10+ ignores it by default.
         */
        userScalable?: 'yes' | 'no';
        /**
         * The auto value doesn't affect the initial layout viewport, and the whole web page is viewable.
         *
         * The contain value means that the viewport is scaled to fit the largest rectangle inscribed within the display.
         *
         * The cover value means that the viewport is scaled to fill the device display.
         * It is highly recommended to make use of the safe area inset variables to ensure that important content
         * doesn't end up outside the display.
         */
        viewportFit?: 'auto' | 'contain' | 'cover';
    }>;
    /**
     * Control the behavior of search engine crawling and indexing.
     *
     * @see https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
     */
    robots?: 'noindex, nofollow' | 'index, follow' | string | Partial<{
        /**
         * Allow search engines to index this page.
         *
         * Note: This is not officially supported by Google but is used widely.
         */
        index?: Booleanable;
        /**
         * Allow search engines to follow links on this page.
         *
         * Note: This is not officially supported by Google but is used widely.
         */
        follow?: Booleanable;
        /**
         * There are no restrictions for indexing or serving.
         * This directive is the default value and has no effect if explicitly listed.
         */
        all?: Booleanable;
        /**
         * Do not show this page, media, or resource in search results.
         * If you don't specify this directive, the page, media, or resource may be indexed and shown in search results.
         */
        noindex?: Booleanable;
        /**
         * Do not follow the links on this page.
         * If you don't specify this directive, Google may use the links on the page to discover those linked pages.
         */
        nofollow?: Booleanable;
        /**
         * Equivalent to noindex, nofollow.
         */
        none?: Booleanable;
        /**
         * Do not show a cached link in search results.
         * If you don't specify this directive,
         * Google may generate a cached page and users may access it through the search results.
         */
        noarchive?: Booleanable;
        /**
         * Do not show a sitelinks search box in the search results for this page.
         * If you don't specify this directive, Google may generate a search box specific to your site in search results,
         * along with other direct links to your site.
         */
        nositelinkssearchbox?: Booleanable;
        /**
         *
         * Do not show a text snippet or video preview in the search results for this page.
         * A static image thumbnail (if available) may still be visible, when it results in a better user experience.
         */
        nosnippet?: Booleanable;
        /**
         * Google is allowed to index the content of a page if it's embedded in another
         * page through iframes or similar HTML tags, in spite of a noindex directive.
         *
         * indexifembedded only has an effect if it's accompanied by noindex.
         */
        indexifembedded?: Booleanable;
        /**
         * Use a maximum of [number] characters as a textual snippet for this search result.
         */
        maxSnippet?: number | string;
        /**
         * Set the maximum size of an image preview for this page in a search results.
         */
        maxImagePreview?: 'none' | 'standard' | 'large';
        /**
         * Use a maximum of [number] seconds as a video snippet for videos on this page in search results.
         */
        maxVideoPreview?: number | string;
        /**
         * Don't offer translation of this page in search results.
         */
        notranslate?: Booleanable;
        /**
         * Do not show this page in search results after the specified date/time.
         */
        unavailable_after?: string;
        /**
         * Do not index images on this page.
         */
        noimageindex?: Booleanable;
    }>;
    /**
     * Special meta tag for controlling Google's indexing behavior.
     *
     * @see https://developers.google.com/search/docs/crawling-indexing/special-tags
     */
    google?: 
    /**
     * When users search for your site, Google Search results sometimes display a search box specific to your site,
     * along with other direct links to your site. This tag tells Google not to show the sitelinks search box.
     */
    'nositelinkssearchbox'
    /**
     * Prevents various Google text-to-speech services from reading aloud web pages using text-to-speech (TTS).
     */
     | 'nopagereadaloud';
    /**
     * Control how Google indexing works specifically for the googlebot crawler.
     *
     * @see https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
     */
    googlebot?: 
    /**
     * When Google recognizes that the contents of a page aren't in the language that the user likely wants to read,
     * Google may provide a translated title link and snippet in search results.
     */
    'notranslate' | 'noimageindex' | 'noarchive' | 'nosnippet' | 'max-snippet' | 'max-image-preview' | 'max-video-preview';
    /**
     * Control how Google indexing works specifically for the googlebot-news crawler.
     *
     * @see https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
     */
    googlebotNews?: 'noindex' | 'nosnippet' | 'notranslate' | 'noimageindex';
    /**
     * You can use this tag on the top-level page of your site to verify ownership for Search Console.
     *
     * @see https://developers.google.com/search/docs/crawling-indexing/special-tags
     */
    googleSiteVerification?: string;
    /**
     * Labels a page as containing adult content, to signal that it be filtered by SafeSearch results
     * .
     * @see https://developers.google.com/search/docs/advanced/guidelines/safesearch
     */
    rating?: 'adult';
    /**
     * The canonical URL for your page.
     *
     * This should be the undecorated URL, without session variables, user identifying parameters, or counters.
     * Likes and Shares for this URL will aggregate at this URL.
     *
     * For example?: mobile domain URLs should point to the desktop version of the URL as the canonical URL to aggregate
     * Likes and Shares across different versions of the page.
     *
     * @see https://ogp.me/#metadata
     */
    ogUrl?: string;
    /**
     * The title of your page without any branding such as your site name.
     *
     * @see https://ogp.me/#metadata
     */
    ogTitle?: string;
    /**
     * A brief description of the content, usually between 2 and 4 sentences.
     *
     * @see https://ogp.me/#optional
     */
    ogDescription?: string;
    /**
     * The type of media of your content. This tag impacts how your content shows up in Feed. If you don't specify a type,
     * the default is website.
     * Each URL should be a single object, so multiple og:type values are not possible.
     *
     * @see https://ogp.me/#metadata
     */
    ogType?: 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other' | 'payment.link';
    /**
     * The locale of the resource. Defaults to en_US.
     *
     * @see https://ogp.me/#optional
     */
    ogLocale?: string;
    /**
     * An array of other locales this page is available in.
     *
     * @see https://ogp.me/#optional
     */
    ogLocaleAlternate?: Arrayable<string>;
    /**
     * The word that appears before this object's title in a sentence.
     * An enum of (a, an, the, "", auto).
     * If auto is chosen, the consumer of your data should choose between "a" or "an".
     * Default is "" (blank).
     *
     * @see https://ogp.me/#optional
     */
    ogDeterminer?: 'a' | 'an' | 'the' | '' | 'auto';
    /**
     * If your object is part of a larger website, the name which should be displayed for the overall site. e.g., "IMDb".
     *
     * @see https://ogp.me/#optional
     */
    ogSiteName?: string;
    /**
     * The URL for the video. If you want the video to play in-line in Feed, you should use the https:// URL if possible.
     *
     * @see https://ogp.me/#type_video
     */
    ogVideo?: string | Arrayable<{
        /**
         * Equivalent to og:video
         */
        url?: string;
        /**
         *
         * Secure URL for the video. Include this even if you set the secure URL in og:video.
         */
        secureUrl?: string;
        /**
         * MIME type of the video.
         */
        type?: 'application/x-shockwave-flash' | 'video/mp4' | 'video/webm';
        /**
         * Width of video in pixels. This property is required for videos.
         */
        width?: string | number;
        /**
         * Height of video in pixels. This property is required for videos.
         */
        height?: string | number;
        /**
         * A text description of the video.
         */
        alt?: string;
    }>;
    /**
     * Equivalent to og:video
     *
     * @see https://ogp.me/#type_video
     */
    ogVideoUrl?: string;
    /**
     *
     * Secure URL for the video. Include this even if you set the secure URL in og:video.
     *
     * @see https://ogp.me/#type_video
     */
    ogVideoSecureUrl?: string;
    /**
     * MIME type of the video.
     *
     * @see https://ogp.me/#type_video
     */
    ogVideoType?: 'application/x-shockwave-flash' | 'video/mp4' | 'video/webm';
    /**
     * Width of video in pixels. This property is required for videos.
     *
     * @see https://ogp.me/#type_video
     */
    ogVideoWidth?: string | number;
    /**
     * Height of video in pixels. This property is required for videos.
     *
     * @see https://ogp.me/#type_video
     */
    ogVideoHeight?: string | number;
    /**
     * A text description of the video.
     *
     * @see https://ogp.me/#type_video
     */
    ogVideoAlt?: string;
    /**
     * The URL of the image that appears when someone shares the content.
     *
     * @see https://developers.facebook.com/docs/sharing/webmasters#images
     */
    ogImage?: string | Arrayable<{
        /**
         * Equivalent to og:image
         */
        url?: string;
        /**
         *
         * https:// URL for the image
         */
        secureUrl?: string;
        /**
         * MIME type of the image.
         */
        type?: 'image/jpeg' | 'image/gif' | 'image/png' | 'image/webp' | 'image/avif';
        /**
         * Width of image in pixels. Specify height and width for your image to ensure that the image loads properly the first time it's shared.
         */
        width?: '1200' | string | number;
        /**
         * Height of image in pixels. Specify height and width for your image to ensure that the image loads properly the first time it's shared.
         */
        height?: '630' | string | number;
        /**
         * A description of what is in the image (not a caption). If the page specifies an og:image, it should specify og:image:alt.
         */
        alt?: string;
    }>;
    /**
     * Equivalent to og:image
     *
     * @see https://developers.facebook.com/docs/sharing/webmasters#images
     */
    ogImageUrl?: string;
    /**
     *
     * https:// URL for the image
     *
     * @see https://developers.facebook.com/docs/sharing/webmasters#images
     */
    ogImageSecureUrl?: string;
    /**
     * MIME type of the image.
     *
     * @see https://developers.facebook.com/docs/sharing/webmasters#images
     */
    ogImageType?: 'image/jpeg' | 'image/gif' | 'image/png' | 'image/webp' | 'image/avif';
    /**
     * Width of image in pixels. Specify height and width for your image to ensure that the image loads properly the first time it's shared.
     *
     * @see https://developers.facebook.com/docs/sharing/webmasters#images
     */
    ogImageWidth?: '1200' | string | number;
    /**
     * Height of image in pixels. Specify height and width for your image to ensure that the image loads properly the first time it's shared.
     *
     * @see https://developers.facebook.com/docs/sharing/webmasters#images
     */
    ogImageHeight?: '630' | string | number;
    /**
     * A description of what is in the image (not a caption). If the page specifies an og:image, it should specify og:image:alt.
     *
     * @see https://developers.facebook.com/docs/sharing/webmasters#images
     */
    ogImageAlt?: string;
    /**
     * The URL for an audio file to accompany this object.
     *
     * @see https://ogp.me/#optional
     */
    ogAudio?: string | Arrayable<{
        /**
         * Equivalent to og:audio
         */
        url?: string;
        /**
         * Secure URL for the audio. Include this even if you set the secure URL in og:audio.
         */
        secureUrl?: string;
        /**
         * MIME type of the audio.
         */
        type?: 'audio/mpeg' | 'audio/ogg' | 'audio/wav';
    }>;
    /**
     * Equivalent to og:audio
     *
     * @see https://ogp.me/#optional
     */
    ogAudioUrl?: string;
    /**
     * Secure URL for the audio. Include this even if you set the secure URL in og:audio.
     *
     * @see https://ogp.me/#optional
     */
    ogAudioSecureUrl?: string;
    /**
     * MIME type of the audio.
     *
     * @see https://ogp.me/#optional
     */
    ogAudioType?: 'audio/mpeg' | 'audio/ogg' | 'audio/wav';
    /**
     * Your Facebook app ID.
     *
     * In order to use Facebook Insights you must add the app ID to your page.
     * Insights lets you view analytics for traffic to your site from Facebook. Find the app ID in your App Dashboard.
     *
     * @see https://developers.facebook.com/docs/sharing/webmasters#basic
     */
    fbAppId?: string | number;
    /**
     * The Fediverse account of the content creator.
     *
     * @example '@gargron@mastodon.social'
     * @see https://blog.joinmastodon.org/2024/07/highlighting-journalism-on-mastodon/
     */
    fediverseCreator?: string;
    /**
     * The card type
     *
     * Used with all cards
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
     */
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    /**
     * Title of content (max 70 characters)
     *
     * Used with summary, summary_large_image, player cards
     *
     * Same as `og:title`
     *
     * @deprecated Use `ogTitle` instead.
     * @maxLength 70
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
     */
    twitterTitle?: string;
    /**
     * Description of content (maximum 200 characters)
     *
     * Used with summary, summary_large_image, player cards.
     *
     * Same as `og:description`
     *
     * @deprecated Use `ogDescription` instead.
     * @maxLength 200
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
     */
    twitterDescription?: string;
    /**
     * URL of image to use in the card.
     * Images must be less than 5MB in size.
     * JPG, PNG, WEBP and GIF formats are supported.
     * Only the first frame of an animated GIF will be used. SVG is not supported.
     *
     * Used with summary, summary_large_image, player cards
     *
     * Same as `og:image`.
     *
     * @deprecated Use `ogImage` instead.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
     */
    twitterImage?: string | Arrayable<{
        /**
         * Equivalent to twitter:image
         * @deprecated Use the corresponding `ogImage.url` field instead.
         */
        url?: string;
        /**
         * MIME type of the image.
         * @deprecated Twitter removed this property from its card specification. Use the corresponding `ogImage` field instead.
         */
        type?: 'image/jpeg' | 'image/gif' | 'image/png' | 'image/webp' | 'image/avif';
        /**
         * Width of image in pixels. Specify height and width for your image to ensure that the image loads properly the first time it's shared.
         * @deprecated Twitter removed this property from its card specification. Use the corresponding `ogImage` field instead.
         */
        width?: '1200' | string | number;
        /**
         * Height of image in pixels. Specify height and width for your image to ensure that the image loads properly the first time it's shared.
         * @deprecated Twitter removed this property from its card specification. Use the corresponding `ogImage` field instead.
         */
        height?: '630' | string | number;
        /**
         * A description of what is in the image (not a caption). If the page specifies an og:image, it should specify og:image:alt.
         * @deprecated Use the corresponding `ogImage.alt` field instead.
         */
        alt?: string;
    }>;
    /**
     * The width of the image in pixels.
     *
     * Note: This is not officially documented.
     *
     * Same as `og:image:width`
     *
     * @deprecated Use `ogImageWidth` instead.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
     */
    twitterImageWidth?: string | number;
    /**
     * The height of the image in pixels.
     *
     * Note: This is not officially documented.
     *
     * Same as `og:image:height`
     *
     * @deprecated Use `ogImageHeight` instead.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
     */
    twitterImageHeight?: string | number;
    /**
     * The type of the image.
     *
     * Note: This is not officially documented.
     *
     * Same as `og:image:type`
     *
     * @deprecated Use `ogImageType` instead.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
     */
    twitterImageType?: 'image/jpeg' | 'image/gif' | 'image/png' | 'image/webp' | 'image/avif';
    /**
     * A text description of the image conveying the essential nature of an image to users who are visually impaired.
     * Maximum 420 characters.
     *
     * Used with summary, summary_large_image, player cards
     *
     * Same as `og:image:alt`.
     *
     * @deprecated Use `ogImageAlt` instead.
     * @maxLength 420
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
     */
    twitterImageAlt?: string;
    /**
     * The @username of website. Either twitter:site or twitter:site:id is required.
     *
     * Used with summary, summary_large_image, app, player cards
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @example @harlan_zw
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterSite?: string;
    /**
     * Same as twitter:site, but the user’s Twitter ID. Either twitter:site or twitter:site:id is required.
     *
     * Used with summary, summary_large_image, player cards
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @example 1296047337022742529
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterSiteId?: string | number;
    /**
     * The @username who created the pages content.
     *
     * Used with summary_large_image cards
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @example harlan_zw
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterCreator?: string;
    /**
     * Twitter user ID of content creator
     *
     * Used with summary, summary_large_image cards
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterCreatorId?: string | number;
    /**
     * HTTPS URL of player iframe
     *
     * Used with player card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterPlayer?: string;
    /**
     *
     * Width of iframe in pixels
     *
     * Used with player card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterPlayerWidth?: string | number;
    /**
     * Height of iframe in pixels
     *
     * Used with player card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterPlayerHeight?: string | number;
    /**
     * URL to raw video or audio stream
     *
     * Used with player card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterPlayerStream?: string;
    /**
     * Name of your iPhone app
     *
     * Used with app card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterAppNameIphone?: string;
    /**
     * Your app ID in the iTunes App Store
     *
     * Used with app card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterAppIdIphone?: string;
    /**
     * Your app’s custom URL scheme (you must include ”://” after your scheme name)
     *
     * Used with app card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterAppUrlIphone?: string;
    /**
     * Name of your iPad optimized app
     *
     * Used with app card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterAppNameIpad?: string;
    /**
     * Your app ID in the iTunes App Store
     *
     * Used with app card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterAppIdIpad?: string;
    /**
     * Your app’s custom URL scheme
     *
     * Used with app card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterAppUrlIpad?: string;
    /**
     * Name of your Android app
     *
     * Used with app card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterAppNameGoogleplay?: string;
    /**
     * Your app ID in the Google Play Store
     *
     * Used with app card
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterAppIdGoogleplay?: string;
    /**
     * Your app’s custom URL scheme
     *
     * @deprecated No direct Open Graph equivalent exists for this field.
     * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
     */
    twitterAppUrlGoogleplay?: string;
    /**
     * Top customizable data field, can be a relatively short string (ie “$3.99”)
     *
     * Used by Slack.
     *
     * @see https://api.slack.com/reference/messaging/link-unfurling#classic_unfurl
     */
    twitterData1?: string;
    /**
     * Customizable label or units for the information in twitter:data1 (best practice?: use all caps)
     *
     * Used by Slack.
     *
     * @see https://api.slack.com/reference/messaging/link-unfurling#classic_unfurl
     */
    twitterLabel1?: string;
    /**
     * Bottom customizable data field, can be a relatively short string (ie “Seattle, WA”)
     *
     * Used by Slack.
     *
     * @see https://api.slack.com/reference/messaging/link-unfurling#classic_unfurl
     */
    twitterData2?: string;
    /**
     * Customizable label or units for the information in twitter:data2 (best practice?: use all caps)
     *
     * Used by Slack.
     *
     * @see https://api.slack.com/reference/messaging/link-unfurling#classic_unfurl
     */
    twitterLabel2?: string;
    /**
     * Indicates a suggested color that user agents should use to customize the display of the page or
     * of the surrounding user interface.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name
     * @example `#4285f4` or `{ color?: '#4285f4', media?: '(prefers-color-scheme?: dark)'}`
     */
    themeColor?: string | Arrayable<{
        /**
         * A valid CSS color value that matches the value used for the `theme-color` CSS property.
         *
         * @example `#4285f4`
         */
        content?: string;
        /**
         * A valid media query that defines when the value should be used.
         *
         * @example `(prefers-color-scheme?: dark)`
         */
        media?: '(prefers-color-scheme?: dark)' | '(prefers-color-scheme?: light)' | string;
    }>;
    /**
     * Sets whether a web application runs in full-screen mode.
     */
    mobileWebAppCapable?: 'yes';
    /**
     * Sets whether a web application runs in full-screen mode.
     *
     * @see https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
     */
    appleMobileWebAppCapable?: 'yes';
    /**
     * Sets the style of the status bar for a web application.
     *
     * @see https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
     */
    appleMobileWebAppStatusBarStyle?: 'default' | 'black' | 'black-translucent';
    /**
     * Make the app title different from the page title.
     */
    appleMobileWebAppTitle?: string;
    /**
     * Promoting Apps with Smart App Banners
     *
     * @see https://developer.apple.com/documentation/webkit/promoting_apps_with_smart_app_banners
     */
    appleItunesApp?: string | {
        /**
         * Your app’s unique identifier.
         */
        appId?: string;
        /**
         * A URL that provides context to your native app.
         */
        appArgument?: string;
    };
    /**
     * Enables or disables automatic detection of possible phone numbers in a webpage in Safari on iOS.
     *
     * @see https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
     */
    formatDetection?: 'telephone=no';
    /**
     * Tile image for windows.
     *
     * @see https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/dn320426(v=vs.85)
     */
    msapplicationTileImage?: string;
    /**
     * Tile colour for windows
     *
     * @see https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/dn320426(v=vs.85)
     */
    msapplicationTileColor?: string;
    /**
     * URL of a config for windows tile.
     *
     * @see https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/dn320426(v=vs.85)
     */
    msapplicationConfig?: string;
    contentSecurityPolicy?: string | Partial<{
        childSrc?: string;
        connectSrc?: string;
        defaultSrc?: string;
        fontSrc?: string;
        imgSrc?: string;
        manifestSrc?: string;
        mediaSrc?: string;
        objectSrc?: string;
        prefetchSrc?: string;
        scriptSrc?: string;
        scriptSrcElem?: string;
        scriptSrcAttr?: string;
        styleSrc?: string;
        styleSrcElem?: string;
        styleSrcAttr?: string;
        workerSrc?: string;
        baseUri?: string;
        sandbox?: string;
        formAction?: string;
        frameAncestors?: string;
        reportUri?: string;
        reportTo?: string;
        requireSriFor?: string;
        requireTrustedTypesFor?: string;
        trustedTypes?: string;
        upgradeInsecureRequests?: string;
    }>;
    contentType?: 'text/html; charset=utf-8';
    defaultStyle?: string;
    xUaCompatible?: 'IE=edge';
    refresh?: string | {
        seconds?: number | string;
        url?: string;
    };
}

/**
 * Content for noscript elements - either textContent or innerHTML, not both
 */
type NoscriptContent = {
    /**
     * Sets the textContent of an element. Safer for XSS.
     */
    textContent?: string;
    innerHTML?: never;
} | {
    textContent?: never;
    /**
     * Text content of the tag.
     *
     * Warning: This is not safe for XSS. Do not use this with user input, use `textContent` instead.
     */
    innerHTML?: string;
};
type Noscript = Pick<GlobalAttributes, 'id' | 'class' | 'style'> & NoscriptContent;

/**
 * A JSON speculation rule set.
 *
 * @see https://html.spec.whatwg.org/multipage/speculative-loading.html#speculation-rules
 */
interface SpeculationRules {
    /** Identifies speculative requests through the `Sec-Speculation-Tags` header. */
    tag?: string | null;
    prefetch?: readonly SpeculationRule[];
    prerender?: readonly SpeculationRule[];
}
type SpeculationRuleEagerness = 'immediate' | 'eager' | 'moderate' | 'conservative' | (string & Record<never, never>);
type SpeculationRuleRequirement = 'anonymous-client-ip-when-cross-origin';
interface SpeculationRuleBase {
    /** A hint about when the browser should consider the speculative load. */
    eagerness?: SpeculationRuleEagerness;
    /** The referrer policy for the speculative request. */
    referrer_policy?: ReferrerPolicy;
    /** Identifies this rule through the `Sec-Speculation-Tags` header. */
    tag?: string | null;
    /** Required browser capabilities for executing the rule. */
    requires?: readonly SpeculationRuleRequirement[];
    /** Expected `No-Vary-Search` response header value. */
    expects_no_vary_search?: string;
    /** The browsing context in which a prerendered page is expected to open. */
    target_hint?: '_blank' | '_self' | '_parent' | '_top' | (string & Record<never, never>);
}
/** An explicit list of URLs to speculate. */
type SpeculationRuleList = SpeculationRuleBase & {
    source?: 'list';
    urls: readonly string[];
    where?: never;
    /** Selects the base URL used to resolve `urls`. */
    relative_to?: 'ruleset' | 'document';
};
/** A rule which selects links from the current document. */
type SpeculationRuleDocument = SpeculationRuleBase & {
    urls?: never;
    relative_to?: never;
} & ({
    source: 'document';
    where?: SpeculationRuleWhere;
} | {
    source?: never;
    where: SpeculationRuleWhere;
});
type SpeculationRule = SpeculationRuleList | SpeculationRuleDocument;
/** The object form accepted by `href_matches`, equivalent to `URLPatternInit`. */
interface SpeculationRuleUrlPattern {
    baseURL?: string;
    protocol?: string;
    username?: string;
    password?: string;
    hostname?: string;
    port?: string;
    pathname?: string;
    search?: string;
    hash?: string;
}
type SpeculationRuleUrlPatternInput = string | SpeculationRuleUrlPattern;
/**
 * A recursive document rule predicate. Exactly one predicate operator is valid
 * at each level; only `href_matches` also accepts `relative_to`.
 */
type SpeculationRuleWhere = {
    and: readonly SpeculationRuleWhere[];
    or?: never;
    not?: never;
    href_matches?: never;
    selector_matches?: never;
    relative_to?: never;
} | {
    and?: never;
    or: readonly SpeculationRuleWhere[];
    not?: never;
    href_matches?: never;
    selector_matches?: never;
    relative_to?: never;
} | {
    and?: never;
    or?: never;
    not: SpeculationRuleWhere;
    href_matches?: never;
    selector_matches?: never;
    relative_to?: never;
} | {
    and?: never;
    or?: never;
    not?: never;
    href_matches: SpeculationRuleUrlPatternInput | readonly SpeculationRuleUrlPatternInput[];
    selector_matches?: never;
    relative_to?: 'ruleset' | 'document';
} | {
    and?: never;
    or?: never;
    not?: never;
    href_matches?: never;
    selector_matches: string | readonly string[];
    relative_to?: never;
};

/**
 * Events that fire on script elements (load/error)
 */
type ScriptHttpEvents = Pick<HttpEventAttributes, 'onload' | 'onerror'>;
/**
 * Base properties shared by all script types
 */
interface ScriptBase extends Pick<GlobalAttributes, 'nonce' | 'id'>, Blocking, DataKeys {
    /**
     * Provides a hint of the relative priority to use when fetching an external script.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-fetchpriority
     */
    fetchpriority?: 'high' | 'low' | 'auto';
    /**
     * Indicates which referrer to send when fetching the script, or resources fetched by the script.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-referrerpolicy
     */
    referrerpolicy?: ReferrerPolicy;
}
/**
 * Props that are invalid on non-loadable script types (data scripts, inline scripts)
 */
interface NoLoadableScriptProps {
    src?: never;
    async?: never;
    defer?: never;
    integrity?: never;
    crossorigin?: never;
    nomodule?: never;
}
/**
 * Content for data scripts — requires exactly one of `textContent` or
 * `innerHTML`. Data scripts (JSON-LD, speculation rules, application/json) must
 * carry inline content; an empty payload is invalid.
 */
type DataScriptTextContent<T = string | Record<string, unknown>> = {
    /**
     * Sets the textContent of an element. Safer for XSS.
     * Can be a string or an object that will be serialized to JSON.
     */
    textContent: T;
    innerHTML?: never;
} | {
    textContent?: never;
    /**
     * Sets the innerHTML of an element.
     * Can be a string or an object that will be serialized to JSON.
     */
    innerHTML: T;
};
/**
 * External JavaScript (fires events)
 */
interface ExternalScript extends ScriptBase, ScriptHttpEvents {
    /**
     * This attribute specifies the URI of an external script.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-src
     */
    src: string;
    /**
     * This attribute indicates the type of script represented.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type
     */
    type?: '' | 'text/javascript';
    /**
     * For classic scripts, if the async attribute is present,
     * then the classic script will be fetched in parallel to parsing and evaluated as soon as it is available.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-async
     */
    async?: Booleanable;
    /**
     * This Boolean attribute is set to indicate to a browser that the script is meant to be executed after the document
     * has been parsed, but before firing DOMContentLoaded.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-defer
     */
    defer?: Booleanable;
    /**
     * Normal script elements pass minimal information to the window.onerror
     * for scripts which do not pass the standard CORS checks.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-crossorigin
     */
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    /**
     * This attribute contains inline metadata that a user agent can use to verify
     * that a fetched resource has been delivered free of unexpected manipulation.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-integrity
     */
    integrity?: string;
    /**
     * This Boolean attribute is set to indicate that the script should not be executed in browsers
     * that support ES modules.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-nomodule
     */
    nomodule?: Booleanable;
    /** Inline content is ignored when `src` is present. */
    textContent?: never;
    /** Inline content is ignored when `src` is present. */
    innerHTML?: never;
}
/**
 * ES Module script (fires events)
 */
interface ModuleScript extends ScriptBase, ScriptHttpEvents {
    /**
     * This attribute specifies the URI of an external script.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-src
     */
    src: string;
    /**
     * This attribute indicates the type of script represented.
     * Required discriminant for module scripts.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type
     */
    type: 'module';
    /**
     * For module scripts, if the async attribute is present then the scripts and all their dependencies
     * will be executed in the defer queue.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-async
     */
    async?: Booleanable;
    /**
     * Normal script elements pass minimal information to the window.onerror
     * for scripts which do not pass the standard CORS checks.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-crossorigin
     */
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    /**
     * This attribute contains inline metadata that a user agent can use to verify
     * that a fetched resource has been delivered free of unexpected manipulation.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-integrity
     */
    integrity?: string;
    /** Inline content is ignored when `src` is present. */
    textContent?: never;
    /** Inline content is ignored when `src` is present. */
    innerHTML?: never;
}
/**
 * Inline JavaScript (no events, no src).
 * Requires either `textContent` (recommended, XSS-safe) or `innerHTML`.
 */
type InlineScript = ScriptBase & NoLoadableScriptProps & {
    /**
     * This attribute indicates the type of script represented.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type
     */
    type?: '' | 'text/javascript';
} & ({
    /** Sets the textContent of an element. Safer for XSS. */
    textContent: string;
    innerHTML?: never;
} | {
    textContent?: never;
    /**
     * Sets the innerHTML of an element.
     *
     * Warning: not safe for XSS. Prefer `textContent` for inline scripts.
     */
    innerHTML: string | Record<string, unknown>;
});
/**
 * Inline ES Module script (no src).
 * Requires either `textContent` (recommended, XSS-safe) or `innerHTML`.
 */
type InlineModuleScript = ScriptBase & NoLoadableScriptProps & {
    /**
     * This attribute indicates the type of script represented.
     * Required discriminant for module scripts.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type
     */
    type: 'module';
} & ({
    /** Sets the textContent of an element. Safer for XSS. */
    textContent: string;
    innerHTML?: never;
} | {
    textContent?: never;
    /**
     * Sets the innerHTML of an element.
     *
     * Warning: not safe for XSS. Prefer `textContent` for inline scripts.
     */
    innerHTML: string;
});
/**
 * JSON-LD structured data (uses textContent for XSS safety)
 * Note: For full schema.org typing, use @unhead/schema-org with useSchemaOrg()
 */
type JsonLdScript = ScriptBase & NoLoadableScriptProps & DataScriptTextContent & {
    /**
     * This attribute indicates the type of script represented.
     * Required discriminant for JSON-LD scripts.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type
     */
    type: 'application/ld+json';
};
/**
 * Speculation Rules (uses textContent for safety)
 */
type SpeculationRulesScript = ScriptBase & NoLoadableScriptProps & DataScriptTextContent<string | SpeculationRules> & {
    /**
     * This attribute indicates the type of script represented.
     * Required discriminant for speculation rules scripts.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type
     */
    type: 'speculationrules';
};
/**
 * Import map configuration
 */
interface ImportMapConfig {
    imports: Record<string, string>;
    scopes?: Record<string, Record<string, string>>;
}
/**
 * Import map. Requires either `textContent` (recommended) or `innerHTML`.
 */
type ImportMapScript = ScriptBase & NoLoadableScriptProps & {
    /**
     * This attribute indicates the type of script represented.
     * Required discriminant for import map scripts.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type
     */
    type: 'importmap';
} & ({
    /** Import map content as a string or ImportMapConfig object (auto-serialized). */
    textContent: string | ImportMapConfig;
    innerHTML?: never;
} | {
    textContent?: never;
    /** Import map content as a string or ImportMapConfig object (auto-serialized). */
    innerHTML: string | ImportMapConfig;
});
/**
 * Application JSON script (generic JSON data)
 */
type ApplicationJsonScript = ScriptBase & NoLoadableScriptProps & DataScriptTextContent & {
    /**
     * This attribute indicates the type of script represented.
     * Required discriminant for JSON scripts.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type
     */
    type: 'application/json';
};
/**
 * Fallback for custom or unknown `type` values.
 *
 * Not included in the {@link Script} union to prevent silent absorption of known
 * `type` values (e.g. so `type: 'module'` without `src` or inline content stays
 * an error instead of collapsing into this permissive shape).
 *
 * For custom `type` values, prefer {@link defineScript}, which enforces strict
 * narrowing on known types while accepting `GenericScript` for anything else:
 *
 * ```ts
 * import { defineScript } from 'unhead'
 * useHead({ script: [defineScript({ type: 'text/plain', textContent: '...' })] })
 * ```
 */
interface GenericScript extends ScriptBase, ScriptHttpEvents {
    /**
     * This attribute specifies the URI of an external script.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-src
     */
    src?: string;
    /**
     * This attribute indicates the type of script represented.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type
     */
    type?: string;
    /**
     * For classic scripts, if the async attribute is present,
     * then the classic script will be fetched in parallel to parsing and evaluated as soon as it is available.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-async
     */
    async?: Booleanable;
    /**
     * This Boolean attribute is set to indicate to a browser that the script is meant to be executed after the document
     * has been parsed, but before firing DOMContentLoaded.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-defer
     */
    defer?: Booleanable;
    /**
     * Normal script elements pass minimal information to the window.onerror
     * for scripts which do not pass the standard CORS checks.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-crossorigin
     */
    crossorigin?: '' | 'anonymous' | 'use-credentials';
    /**
     * This attribute contains inline metadata that a user agent can use to verify
     * that a fetched resource has been delivered free of unexpected manipulation.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-integrity
     */
    integrity?: string;
    /**
     * This Boolean attribute is set to indicate that the script should not be executed in browsers
     * that support ES modules.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-nomodule
     */
    nomodule?: Booleanable;
    /**
     * Text content of the tag.
     *
     * Warning: This is not safe for XSS. Do not use this with user input, use `textContent` instead.
     */
    innerHTML?: string | Record<string, unknown>;
    /**
     * Sets the textContent of an element. Safer for XSS.
     */
    textContent?: string | Record<string, unknown>;
    /**
     * A custom element name
     *
     * Used by the AMP specification.
     *
     * @see https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml/#custom-elements
     */
    ['custom-element']?: 'amp-story' | 'amp-carousel' | 'amp-ad' | (string & Record<never, never>);
}
/**
 * Discriminated union of all script types.
 *
 * Each `type` value maps to a specific interface that enforces per-type constraints.
 * For example, inline scripts require `textContent` and forbid `src`/`async`/`defer`.
 *
 * For custom or non-standard `type` values, use {@link defineScript}:
 * ```ts
 * import { defineScript } from 'unhead'
 * useHead({ script: [defineScript({ type: 'text/plain', textContent: '...' })] })
 * ```
 */
type Script = ExternalScript | ModuleScript | InlineScript | InlineModuleScript | JsonLdScript | SpeculationRulesScript | ImportMapScript | ApplicationJsonScript;
/**
 * Union of all `type` values that have narrowed script type definitions.
 */
type KnownScriptType = '' | 'text/javascript' | 'module' | 'application/ld+json' | 'speculationrules' | 'importmap' | 'application/json';
/**
 * Pick {@link Script} union members whose `type` accepts `U`. Distributes over
 * `U`, so a union type like `'text/javascript' | 'module'` returns the union of
 * all matching variants.
 *
 * Handles members whose `type` is itself a union (e.g. {@link ExternalScript}'s
 * `'' | 'text/javascript'`), and members where `type` is optional.
 */
type MatchScriptByType<U> = U extends any ? Script extends infer M ? M extends {
    type?: infer MT;
} ? U extends MT ? M : never : never : never : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type IsUnion<T, U extends T = T> = T extends T ? ([U] extends [T] ? false : true) : never;
/**
 * For a union `type` input, the structural intersection of matching variants
 * (minus their `type` discriminator) plus the original type union. Lets
 * {@link defineScript} accept a runtime-determined type like
 * `cond ? 'text/javascript' : 'module'` without losing field validation.
 */
type InferScriptUnion<U> = UnionToIntersection<MatchScriptByType<U> extends infer M ? (M extends any ? Omit<M, 'type'> : never) : never> & {
    type: U;
};
/**
 * Resolve a single script input to either its strict {@link Script} variant (when
 * `type` is a {@link KnownScriptType}) or {@link GenericScript} (for custom types).
 *
 * Union `type` inputs (e.g. `'text/javascript' | 'module'`) resolve to the
 * structural intersection of matching variants, so runtime-determined types are
 * accepted without casts.
 *
 * When no `type` field is present, or `type` is non-string, the full {@link Script}
 * union is returned so discriminators like `src` vs `textContent` still apply.
 */
type InferScript<T> = T extends {
    type: infer U;
} ? U extends string ? U extends KnownScriptType ? IsUnion<U> extends true ? DeepReadonly<InferScriptUnion<U>> : DeepReadonly<MatchScriptByType<U>> : DeepReadonly<GenericScript> & {
    type: U;
} : DeepReadonly<Script> : DeepReadonly<Script>;

interface Style extends Pick<GlobalAttributes, 'nonce' | 'id'>, Blocking {
    /**
     * This attribute defines which media the style should be applied to.
     * Its value is a media query, which defaults to all if the attribute is missing.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style#attr-media
     */
    media?: string;
    /**
     * A cryptographic nonce (number used once) used to allow inline styles in a style-src Content-Security-Policy.
     * The server must generate a unique nonce value each time it transmits a policy.
     * It is critical to provide a nonce that cannot be guessed as bypassing a resource's policy is otherwise trivial.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style#attr-nonce
     */
    nonce?: string;
    /**
     * This attribute specifies alternative style sheet sets.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style#attr-title
     */
    title?: string;
}

interface TemplateParamsAugmentations {
}
interface SchemaAugmentations {
    title: TagPriority;
    titleTemplate: TagPriority;
    base: ResolvesDuplicates & TagPriority;
    htmlAttrs: ResolvesDuplicates & TagPriority;
    bodyAttrs: ResolvesDuplicates & TagPriority;
    link: TagPriority & TagPosition & ResolvesDuplicates & ProcessesTemplateParams;
    meta: TagPriority & ResolvesDuplicates & ProcessesTemplateParams;
    style: TagPriority & TagPosition & StringInnerContent & ResolvesDuplicates & ProcessesTemplateParams;
    script: TagPriority & TagPosition & InnerContent & ResolvesDuplicates & ProcessesTemplateParams;
    noscript: TagPriority & TagPosition & StringInnerContent & ResolvesDuplicates & ProcessesTemplateParams;
}
type MaybeArray<T> = T | T[];
interface UnheadBodyAttributesWithoutEvents extends Omit<BodyAttributesWithoutEvents, 'class' | 'style'> {
    /**
     * The class global attribute is a space-separated list of the case-sensitive classes of the element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class
     */
    class?: MaybeArray<ResolvableValue<Stringable>> | Record<string, ResolvableValue<boolean>>;
    /**
     * The style attribute contains CSS styling declarations to be applied to the element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/style
     */
    style?: MaybeArray<ResolvableValue<Stringable>> | Record<string, ResolvableValue<Stringable>>;
}
interface UnheadHtmlAttributes extends Omit<HtmlAttributes, 'class' | 'style'> {
    /**
     * The class global attribute is a space-separated list of the case-sensitive classes of the element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class
     */
    class?: MaybeArray<ResolvableValue<Stringable>> | Record<string, ResolvableValue<boolean>>;
    /**
     * The style attribute contains CSS styling declarations to be applied to the element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/style
     */
    style?: MaybeArray<ResolvableValue<Stringable>> | Record<string, ResolvableValue<Stringable>>;
}
/**
 * Unhead meta with support for array content values.
 * Content is required (use `null` explicitly to remove a meta tag).
 */
type UnheadMeta = (Omit<NameMeta, 'content'> & {
    content: MaybeArray<string | number> | null;
}) | (Omit<PropertyMeta, 'content'> & {
    content: MaybeArray<string | number> | null;
}) | (Omit<HttpEquivMeta, 'content'> & {
    content: MaybeArray<string | number> | null;
}) | CharsetMeta;
type MaybeEventFnHandlers<T> = {
    [key in keyof T]?: T[key] | ((e: Event) => void);
};
type ResolvableTitle = ResolvableValue<Stringable> | ResolvableProperties<({
    textContent: string;
} & SchemaAugmentations['title'])>;
type ResolvableTitleTemplate = string | ((title?: string) => string | null) | null | ({
    textContent: string | ((title?: string) => string | null);
} & SchemaAugmentations['titleTemplate']);
type ResolvableBase = DistributeResolvable<Base, SchemaAugmentations['base']>;
type DistributeResolvable<T, Aug> = T extends any ? ResolvableProperties<T & Aug> : never;
type DistributeResolvableWithEvents<T, Aug, Events> = T extends any ? T extends Events ? ResolvableProperties<Omit<T, keyof Events> & Aug> & MaybeEventFnHandlers<Events> : ResolvableProperties<T & Aug> : never;
type ResolvableLink = DistributeResolvableWithEvents<Link, SchemaAugmentations['link'], LinkHttpEvents>;
type ResolvableMeta = DistributeResolvable<UnheadMeta, SchemaAugmentations['meta']>;
type ResolvableStyle = ResolvableProperties<Style & DataKeys & SchemaAugmentations['style']> | string;
type ResolvableScript = DistributeResolvableWithEvents<Script, SchemaAugmentations['script'], ScriptHttpEvents> | string;
type ResolvableNoscript = ResolvableProperties<Noscript & DataKeys & SchemaAugmentations['noscript']> | string;
type ResolvableHtmlAttributes = ResolvableProperties<UnheadHtmlAttributes & DataKeys & SchemaAugmentations['htmlAttrs']>;
type ResolvableBodyAttributes = ResolvableProperties<UnheadBodyAttributesWithoutEvents & DataKeys & SchemaAugmentations['bodyAttrs']> & MaybeEventFnHandlers<BodyEvents>;
type ResolvableTemplateParams = {
    separator?: '|' | '-' | '·' | string;
} & Record<string, null | string | boolean | number | Record<string, string | boolean | number>> & TemplateParamsAugmentations;
interface ResolvableHead {
    /**
     * The `<title>` HTML element defines the document's title that is shown in a browser's title bar or a page's tab.
     * It only contains text; tags within the element are ignored.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title
     */
    title?: ResolvableTitle;
    /**
     * The `<base>` HTML element specifies the base URL to use for all relative URLs in a document.
     * There can be only one <base> element in a document.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base
     */
    base?: ResolvableValue<ResolvableBase>;
    /**
     * The `<link>` HTML element specifies relationships between the current document and an external resource.
     * This element is most commonly used to link to stylesheets, but is also used to establish site icons
     * (both "favicon" style icons and icons for the home screen and apps on mobile devices) among other things.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-as
     */
    link?: ResolvableValue<ResolvableValue<ResolvableLink>[]>;
    /**
     * The `<meta>` element represents metadata that cannot be expressed in other HTML elements, like `<link>` or `<script>`.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta
     */
    meta?: ResolvableValue<ResolvableValue<ResolvableMeta>[]>;
    /**
     * The `<style>` HTML element contains style information for a document, or part of a document.
     * It contains CSS, which is applied to the contents of the document containing the `<style>` element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style
     */
    style?: ResolvableValue<ResolvableValue<(ResolvableStyle)>[]>;
    /**
     * The `<script>` HTML element is used to embed executable code or data; this is typically used to embed or refer to JavaScript code.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
     */
    script?: ResolvableValue<ResolvableValue<(ResolvableScript)>[]>;
    /**
     * The `<noscript>` HTML element defines a section of HTML to be inserted if a script type on the page is unsupported
     * or if scripting is currently turned off in the browser.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript
     */
    noscript?: ResolvableValue<ResolvableValue<(ResolvableNoscript)>[]>;
    /**
     * Attributes for the `<html>` HTML element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/html
     */
    htmlAttrs?: ResolvableValue<ResolvableHtmlAttributes>;
    /**
     * Attributes for the `<body>` HTML element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body
     */
    bodyAttrs?: ResolvableValue<ResolvableBodyAttributes>;
    /**
     * Generate the title from a template.
     *
     * Should include a `%s` placeholder for the title, for example `%s - My Site`.
     */
    titleTemplate?: ResolvableTitleTemplate;
    /**
     * Variables used to substitute in the title and meta content.
     */
    templateParams?: ResolvableTemplateParams;
}
interface SerializableHead {
    title?: string;
    titleTemplate?: string;
    base?: Base & DataKeys & SchemaAugmentations['base'];
    templateParams?: Record<string, any>;
    link?: (Link & SchemaAugmentations['link'])[];
    meta?: (Meta & SchemaAugmentations['meta'])[];
    style?: (Style & DataKeys & SchemaAugmentations['style'])[];
    script?: (Script & SchemaAugmentations['script'])[];
    noscript?: (Noscript & DataKeys & SchemaAugmentations['noscript'])[];
    htmlAttrs?: HtmlAttributes & DataKeys & SchemaAugmentations['htmlAttrs'];
    bodyAttrs?: BodyAttributesWithoutEvents & DataKeys & BodyEvents & SchemaAugmentations['bodyAttrs'];
}
type RawInput<K extends keyof SerializableHead> = Required<SerializableHead>[K] extends Array<infer T> ? T : Required<SerializableHead>[K];
type UseSeoMetaInput = DeepResolvableProperties<MetaFlat> & {
    title?: ResolvableTitle;
    titleTemplate?: ResolvableTitleTemplate;
};
type UseHeadInput = ResolvableHead | SerializableHead;

/**
 * Flat meta type with all properties optional (for internal use)
 * @internal
 */
interface MetaGeneric extends MetaBase {
    'name'?: MetaNames | (string & Record<never, never>);
    'property'?: MetaProperties | (string & Record<never, never>);
    'http-equiv'?: 'content-security-policy' | 'content-type' | 'default-style' | 'x-ua-compatible' | 'refresh' | 'accept-ch' | 'origin-trial' | (string & Record<never, never>);
    'charset'?: 'utf-8' | (string & Record<never, never>);
    'content'?: string | number;
}

interface ResolvesDuplicates {
    /**
     * By default, tags which share the same unique key `name`, `property` are de-duped. To allow duplicates
     * to be made you can provide a unique key for each entry.
     */
    key?: string;
    /**
     * The strategy to use when a duplicate tag is encountered.
     *
     * - `replace` - Replace the existing tag with the new tag
     * - `merge` - Merge the existing tag with the new tag
     *
     * @default 'replace' (some tags will default to 'merge', such as htmlAttr)
     */
    tagDuplicateStrategy?: 'replace' | 'merge';
}
type ValidTagPositions = 'head' | 'bodyClose' | 'bodyOpen';
interface TagPosition {
    /**
     * Specify where to render the tag.
     *
     * @default 'head'
     */
    tagPosition?: ValidTagPositions;
}
type InnerContentVal = string | Record<string, any>;
interface InnerContent {
    /**
     * Text content of the tag.
     *
     * Warning: This is not safe for XSS. Do not use this with user input, use `textContent` instead.
     */
    innerHTML?: InnerContentVal;
    /**
     * Sets the textContent of an element. Safer for XSS.
     */
    textContent?: InnerContentVal;
}
/**
 * String-only inner content for elements that don't support object serialization (style, noscript).
 */
interface StringInnerContent {
    /**
     * Text content of the tag.
     *
     * Warning: This is not safe for XSS. Do not use this with user input, use `textContent` instead.
     */
    innerHTML?: string;
    /**
     * Sets the textContent of an element. Safer for XSS.
     */
    textContent?: string;
}
interface TagPriority {
    /**
     * The priority for rendering the tag, without this all tags are rendered as they are registered
     * (besides some special tags).
     *
     * The following special tags have default priorities:
     * -2 `<meta charset ...>`
     * -1 `<base>`
     * 0 `<meta http-equiv="content-security-policy" ...>`
     *
     * All other tags have a default priority of 10: `<meta>`, `<script>`, `<link>`, `<style>`, etc
     */
    tagPriority?: number | 'critical' | 'high' | 'low' | `before:${string}` | `after:${string}`;
}
type TagUserProperties = ResolvableProperties<TagPriority & TagPosition & InnerContent & ResolvesDuplicates & ProcessesTemplateParams>;
type TagKey = keyof ResolvableHead | InternalTagKey;
/**
 * Internal tag types used by plugins
 * @internal
 */
type InternalTagKey = '_flatMeta';
type TemplateParams = {
    separator?: '|' | '-' | '·' | string;
} & Record<string, null | string | boolean | number | Record<string, string | boolean | number>>;
interface ProcessesTemplateParams {
    processTemplateParams?: boolean;
}
interface HasTemplateParams {
    templateParams?: TemplateParams;
}
interface HeadTag extends TagPriority, TagPosition, ResolvesDuplicates, HasTemplateParams {
    tag: TagKey;
    props: Record<string, string>;
    processTemplateParams?: boolean;
    innerHTML?: string;
    textContent?: string;
    /**
     * @internal
     */
    _w?: number;
    /**
     * @internal
     */
    _p?: number;
    /**
     * Copied from the entry options: the entry came from `useHeadSafe`.
     * @internal
     */
    _safe?: boolean;
    /**
     * @internal
     */
    _d?: string;
    /**
     * @internal
     */
    _h?: string;
    /**
     * Source file:line that created this tag (devtools only).
     * @internal
     */
    _source?: string;
}
type HeadTagKeys = (keyof HeadTag)[];

export type { LinkHttpEvents as $, AlternateFeedLink as A, Booleanable as B, CanonicalLink as C, DataKeys as D, ExpectLink as E, FaviconLink as F, GenericLink as G, HeadTag as H, HubLink as I, IconLink as J, ImportMapConfig as K, ImportMapScript as L, InferLink as M, InferScript as N, InlineModuleScript as O, InlineScript as P, InnerContent as Q, ResolvableHead as R, SerializableHead as S, InnerContentVal as T, InternalTagKey as U, JsonLdScript as V, KnownLinkRel as W, KnownScriptType as X, LicenseLink as Y, Link as Z, LinkBase as _, AlternateLanguageLink as a, Stringable as a$, ManifestLink as a0, MaskIconLink as a1, MaybeArray as a2, MaybeEventFnHandlers as a3, MeLink as a4, Meta as a5, MetaBase as a6, MetaFlat as a7, MetaGeneric as a8, MetaNames as a9, ResolvableMeta as aA, ResolvableNoscript as aB, ResolvableProperties as aC, ResolvableScript as aD, ResolvableStyle as aE, ResolvableTemplateParams as aF, ResolvableTitle as aG, ResolvableTitleTemplate as aH, ResolvableUnion as aI, ResolvableValue as aJ, ResolvesDuplicates as aK, SchemaAugmentations as aL, Script as aM, ScriptBase as aN, ScriptHttpEvents as aO, SearchLink as aP, SitemapLink as aQ, SpeculationRule as aR, SpeculationRuleDocument as aS, SpeculationRuleEagerness as aT, SpeculationRuleList as aU, SpeculationRuleRequirement as aV, SpeculationRuleUrlPattern as aW, SpeculationRuleWhere as aX, SpeculationRules as aY, SpeculationRulesScript as aZ, StringInnerContent as a_, MetaProperties as aa, ModuleScript as ab, ModulepreloadLink as ac, NameMeta as ad, Never as ae, NextLink as af, PingbackLink as ag, PreconnectLink as ah, PrefetchLink as ai, PreloadFontLink as aj, PreloadImageLink as ak, PreloadLink as al, PreloadLinkBase as am, PreloadOtherLink as an, PreloadScriptLink as ao, PreloadStyleLink as ap, PrerenderLink as aq, PrevLink as ar, PrivacyPolicyLink as as, ProcessesTemplateParams as at, PropertyMeta as au, RawInput as av, ResolvableBase as aw, ResolvableBodyAttributes as ax, ResolvableHtmlAttributes as ay, ResolvableLink as az, AlternateLink as b, StylesheetLink as b0, TagKey as b1, TagPosition as b2, TagPriority as b3, TagUserProperties as b4, TemplateParams as b5, TemplateParamsAugmentations as b6, TermsOfServiceLink as b7, UnheadBodyAttributesWithoutEvents as b8, UnheadHtmlAttributes as b9, UnheadMeta as ba, UseHeadInput as bb, UseSeoMetaInput as bc, ValidTagPositions as bd, WebmentionLink as be, AlternateMediaLink as c, AlternateStylesheetLink as d, AmpHtmlLink as e, AppleTouchIconLink as f, AppleTouchStartupImageLink as g, ApplicationJsonScript as h, Arrayable as i, AuthorLink as j, BareAlternateLink as k, BodyAttributesWithoutEvents as l, BodyEvents as m, CharsetMeta as n, CompressionDictionaryLink as o, DeepReadonly as p, DeepResolvableProperties as q, DnsPrefetchLink as r, ExternalScript as s, GenericScript as t, GlobalAttributes as u, HasTemplateParams as v, HeadTagKeys as w, HelpLink as x, HttpEquivMeta as y, HttpEventAttributes as z };
