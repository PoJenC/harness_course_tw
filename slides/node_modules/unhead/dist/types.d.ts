export { A as ActiveHeadEntry, h as AsVoidFunctions, e as ClientHeadHooks, i as CoreHeadHooks, C as CreateClientHeadOptions, c as CreateHeadOptions, a as CreateServerHeadOptions, f as CreateStreamableServerHeadOptions, D as DOMHeadHooks, j as DomBeforeRenderCtx, k as DomRenderTagContext, l as DomState, E as EntryResolveCtx, m as EventHandlerOptions, n as HeadEntry, o as HeadEntryOptions, p as HeadHooks, q as HeadPlugin, H as HeadPluginInput, r as HeadPluginOptions, b as HeadRenderer, s as HookResult, P as PropResolver, R as RecordingEntry, t as RenderSSRHeadOptions, u as SSRHeadHooks, S as SSRHeadPayload, v as SSRRenderContext, w as ScriptInstance, x as ScriptScope, g as ServerHeadHooks, y as ShouldRenderContext, z as SideEffectsRecord, B as SyncHookResult, U as Unhead, F as UseFunctionType, G as UseScriptContext, I as UseScriptContextOptions, J as UseScriptInput, K as UseScriptLoader, L as UseScriptLoaderInput, M as UseScriptLoaderOptions, N as UseScriptOptions, O as UseScriptResolvedInput, Q as UseScriptResolver, T as UseScriptReturn, V as UseScriptScopeReturn, W as UseScriptStatus, d as UseScriptTrigger, X as UseScriptWaitFor, Y as UseScriptWaitForResolve, Z as UseScriptWaitForSetup, _ as WarmupStrategy } from './shared/unhead.BCbtEyRi.js';
export { R as RenderDomHeadOptions } from './shared/unhead.D0NMhe69.js';
export { B as Base, a as BodyAttributes, H as HeadSafe, b as HtmlAttributes, N as Noscript, S as SafeBodyAttr, c as SafeHtmlAttr, d as SafeLink, e as SafeMeta, f as SafeNoscript, g as SafeScript, h as SafeStyle, i as Style } from './shared/unhead.DiHEHi7R.js';
import { B as Booleanable } from './shared/unhead.DC0v7nqS.js';
export { A as AlternateFeedLink, a as AlternateLanguageLink, b as AlternateLink, c as AlternateMediaLink, d as AlternateStylesheetLink, e as AmpHtmlLink, f as AppleTouchIconLink, g as AppleTouchStartupImageLink, h as ApplicationJsonScript, i as Arrayable, j as AuthorLink, k as BareAlternateLink, l as BodyAttributesWithoutEvents, m as BodyEvents, C as CanonicalLink, n as CharsetMeta, o as CompressionDictionaryLink, D as DataKeys, p as DeepReadonly, q as DeepResolvableProperties, r as DnsPrefetchLink, E as ExpectLink, s as ExternalScript, F as FaviconLink, G as GenericLink, t as GenericScript, u as GlobalAttributes, v as HasTemplateParams, H as HeadTag, w as HeadTagKeys, x as HelpLink, y as HttpEquivMeta, z as HttpEventAttributes, I as HubLink, J as IconLink, K as ImportMapConfig, L as ImportMapScript, M as InferLink, N as InferScript, O as InlineModuleScript, P as InlineScript, Q as InnerContent, T as InnerContentVal, U as InternalTagKey, V as JsonLdScript, W as KnownLinkRel, X as KnownScriptType, Y as LicenseLink, Z as Link, _ as LinkBase, $ as LinkHttpEvents, a0 as ManifestLink, a1 as MaskIconLink, a2 as MaybeArray, a3 as MaybeEventFnHandlers, a4 as MeLink, a5 as Meta, a6 as MetaBase, a7 as MetaFlat, a8 as MetaGeneric, a9 as MetaNames, aa as MetaProperties, ab as ModuleScript, ac as ModulepreloadLink, ad as NameMeta, ae as Never, af as NextLink, ag as PingbackLink, ah as PreconnectLink, ai as PrefetchLink, aj as PreloadFontLink, ak as PreloadImageLink, al as PreloadLink, am as PreloadLinkBase, an as PreloadOtherLink, ao as PreloadScriptLink, ap as PreloadStyleLink, aq as PrerenderLink, ar as PrevLink, as as PrivacyPolicyLink, at as ProcessesTemplateParams, au as PropertyMeta, av as RawInput, aw as ResolvableBase, ax as ResolvableBodyAttributes, R as ResolvableHead, ay as ResolvableHtmlAttributes, az as ResolvableLink, aA as ResolvableMeta, aB as ResolvableNoscript, aC as ResolvableProperties, aD as ResolvableScript, aE as ResolvableStyle, aF as ResolvableTemplateParams, aG as ResolvableTitle, aH as ResolvableTitleTemplate, aI as ResolvableUnion, aJ as ResolvableValue, aK as ResolvesDuplicates, aL as SchemaAugmentations, aM as Script, aN as ScriptBase, aO as ScriptHttpEvents, aP as SearchLink, S as SerializableHead, aQ as SitemapLink, aR as SpeculationRule, aS as SpeculationRuleDocument, aT as SpeculationRuleEagerness, aU as SpeculationRuleList, aV as SpeculationRuleRequirement, aW as SpeculationRuleUrlPattern, aX as SpeculationRuleWhere, aY as SpeculationRules, aZ as SpeculationRulesScript, a_ as StringInnerContent, a$ as Stringable, b0 as StylesheetLink, b1 as TagKey, b2 as TagPosition, b3 as TagPriority, b4 as TagUserProperties, b5 as TemplateParams, b6 as TemplateParamsAugmentations, b7 as TermsOfServiceLink, b8 as UnheadBodyAttributesWithoutEvents, b9 as UnheadHtmlAttributes, ba as UnheadMeta, bb as UseHeadInput, bc as UseSeoMetaInput, bd as ValidTagPositions, be as WebmentionLink } from './shared/unhead.DC0v7nqS.js';
export { createSpyProxy } from './scripts.js';
export { u as useScript } from './shared/unhead.COtviqoG.js';
import 'hookable';

interface AriaAttributes {
    /**
     * Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change
     * notifications defined by the aria-relevant attribute.
     */
    'role'?: 'alert' | 'alertdialog' | 'application' | 'article' | 'banner' | 'button' | 'checkbox' | 'columnheader' | 'combobox' | 'complementary' | 'contentinfo' | 'definition' | 'dialog' | 'directory' | 'document' | 'feed' | 'figure' | 'form' | 'grid' | 'gridcell' | 'group' | 'heading' | 'img' | 'link' | 'list' | 'listbox' | 'listitem' | 'log' | 'main' | 'marquee' | 'math' | 'menu' | 'menubar' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' | 'navigation' | 'note' | 'option' | 'presentation' | 'progressbar' | 'radio' | 'radiogroup' | 'region' | 'row' | 'rowgroup' | 'rowheader' | 'scrollbar' | 'search' | 'searchbox' | 'separator' | 'slider' | 'spinbutton' | 'status' | 'switch' | 'tab' | 'table' | 'tablist' | 'tabpanel' | 'textbox' | 'timer' | 'toolbar' | 'tooltip' | 'tree' | 'treegrid' | 'treeitem';
    /**
     * Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application.
     */
    'aria-activedescendant'?: string;
    /**
     * Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change
     * notifications defined by the aria-relevant attribute.
     */
    'aria-atomic'?: Booleanable;
    /**
     * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for
     * an input and specifies how predictions would be presented if they are made.
     */
    'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
    /**
     * Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are
     * complete before exposing them to the user.
     */
    'aria-busy'?: Booleanable;
    /**
     * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
     */
    'aria-checked'?: Booleanable | 'mixed';
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     */
    'aria-colcount'?: number;
    /**
     * Defines an element's column index or position with respect to the total number of columns within a table, grid, or
     * treegrid.
     */
    'aria-colindex'?: number;
    /**
     * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
     */
    'aria-colspan'?: number;
    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     */
    'aria-controls'?: string;
    /**
     * Indicates the element that represents the current item within a container or set of related elements.
     */
    'aria-current'?: Booleanable | 'page' | 'step' | 'location' | 'date' | 'time';
    /**
     * Identifies the element (or elements) that describes the object.
     */
    'aria-describedby'?: string;
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     */
    'aria-details'?: string;
    /**
     * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
     */
    'aria-disabled'?: Booleanable;
    /**
     * Indicates what functions can be performed when a dragged object is released on the drop target.
     */
    'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
    /**
     * Identifies the element that provides an error message for the object.
     */
    'aria-errormessage'?: string;
    /**
     * Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed.
     */
    'aria-expanded'?: Booleanable;
    /**
     * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
     * allows assistive technology to override the general default of reading in document source order.
     */
    'aria-flowto'?: string;
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     */
    'aria-grabbed'?: Booleanable;
    /**
     * Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by
     * an element.
     */
    'aria-haspopup'?: Booleanable | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    /**
     * Indicates whether the element is exposed to an accessibility API.
     */
    'aria-hidden'?: Booleanable;
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     */
    'aria-invalid'?: Booleanable | 'grammar' | 'spelling';
    /**
     * Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element.
     */
    'aria-keyshortcuts'?: string;
    /**
     * Defines a string value that labels the current element.
     */
    'aria-label'?: string;
    /**
     * Identifies the element (or elements) that labels the current element.
     */
    'aria-labelledby'?: string;
    /**
     * Defines the hierarchical level of an element within a structure.
     */
    'aria-level'?: number;
    /**
     * Indicates that an element will be updated, and describes the types of updates the user agents, assistive
     * technologies, and user can expect from the live region.
     */
    'aria-live'?: 'off' | 'assertive' | 'polite';
    /**
     * Indicates whether an element is modal when displayed.
     */
    'aria-modal'?: Booleanable;
    /**
     * Indicates whether a text box accepts multiple lines of input or only a single line.
     */
    'aria-multiline'?: Booleanable;
    /**
     * Indicates that the user may select more than one item from the current selectable descendants.
     */
    'aria-multiselectable'?: Booleanable;
    /**
     * Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous.
     */
    'aria-orientation'?: 'horizontal' | 'vertical';
    /**
     * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
     */
    'aria-owns'?: string;
    /**
     * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no
     * value. A hint could be a sample value or a brief description of the expected format.
     */
    'aria-placeholder'?: string;
    /**
     * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements
     * in the set are present in the DOM.
     */
    'aria-posinset'?: number;
    /**
     * Indicates the current "pressed" state of toggle buttons.
     */
    'aria-pressed'?: Booleanable | 'mixed';
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     */
    'aria-readonly'?: Booleanable;
    /**
     * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
     */
    'aria-relevant'?: 'additions' | 'additions text' | 'all' | 'removals' | 'text';
    /**
     * Indicates that user input is required on the element before a form may be submitted.
     */
    'aria-required'?: Booleanable;
    /**
     * Defines a human-readable, author-localized description for the role of an element.
     */
    'aria-roledescription'?: string;
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     */
    'aria-rowcount'?: number;
    /**
     * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
     */
    'aria-rowindex'?: number;
    /**
     * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
     */
    'aria-rowspan'?: number;
    /**
     * Indicates the current "selected" state of various widgets.
     */
    'aria-selected'?: Booleanable;
    /**
     * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     */
    'aria-setsize'?: number;
    /**
     * Indicates if items in a table or grid are sorted in ascending or descending order.
     */
    'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
    /**
     * Defines the maximum allowed value for a range widget.
     */
    'aria-valuemax'?: number;
    /**
     * Defines the minimum allowed value for a range widget.
     */
    'aria-valuemin'?: number;
    /**
     * Defines the current value for a range widget.
     */
    'aria-valuenow'?: number;
    /**
     * Defines the human readable text alternative of aria-valuenow for a range widget.
     */
    'aria-valuetext'?: string;
}

export { Booleanable };
export type { AriaAttributes };
