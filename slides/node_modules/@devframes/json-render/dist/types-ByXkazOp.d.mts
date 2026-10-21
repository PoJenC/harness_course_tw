import { Catalog, InferCatalogComponents, InferComponentProps, Spec, UIElement } from "@json-render/core";
//#region src/view-ref.d.ts
/**
 * A view backed by **live shared state**: the client subscribes to `stateKey`
 * for the spec + state and re-renders on every update. This is what a
 * node-authored view ({@link import('./node/create-view').createJsonRenderView})
 * produces.
 */
interface JsonRenderViewStateRef {
  /** Shared-state key the client subscribes to for the live spec + state. */
  stateKey: string;
}
/**
 * A view whose spec is embedded **inline** in the reference. It carries no
 * shared-state key, so a client can synthesize a view entirely in the browser
 * and hand it straight to a renderer, with no `sharedState` round-trip. The spec is
 * rendered as-is (static: local state and bindings still work, but there is no
 * server-driven live update stream).
 */
interface JsonRenderViewInlineRef<SpecType extends DevframeJsonRenderSpec = DevframeJsonRenderSpec> {
  /** The full spec, carried in the reference itself. */
  spec: SpecType;
}
/**
 * The serializable reference to a JSON-render view that crosses process /
 * static boundaries, e.g. projected onto a hub dock entry. It carries **no
 * functions**: either a {@link JsonRenderViewStateRef.stateKey shared-state key}
 * the client subscribes through, or an {@link JsonRenderViewInlineRef.spec
 * inline spec} rendered directly.
 */
type JsonRenderViewRef<SpecType extends DevframeJsonRenderSpec = DevframeJsonRenderSpec> = JsonRenderViewStateRef | JsonRenderViewInlineRef<SpecType>;
//#endregion
//#region src/types.d.ts
/**
 * A Devframes JSON-render spec **is** an `@json-render/core` `Spec`: a flat
 * `root` key, an `elements` map, and optional initial `state`. This alias is
 * the Devframes-facing name; it does not add or remove fields.
 */
type DevframeJsonRenderSpec<Element extends UIElement = UIElement> = Omit<Spec, 'elements'> & {
  elements: Record<string, Element>;
};
/** Derive a discriminated element union from every component in a catalog. */
type CatalogUIElement<CatalogType extends Catalog> = { [ComponentName in keyof InferCatalogComponents<CatalogType> & string]: UIElement<ComponentName, InferComponentProps<CatalogType, ComponentName>>; }[keyof InferCatalogComponents<CatalogType> & string];
/**
 * A single JSON-Pointer patch to a view's `state` model. `path` is an
 * RFC 6901 JSON Pointer relative to the state root (e.g. `/count`,
 * `/user/name`). Structural spec changes replace the whole spec via
 * `update` instead.
 */
interface JsonRenderStatePatch {
  op: 'add' | 'remove' | 'replace';
  /** JSON Pointer relative to the state root, e.g. `/count`. */
  path: string;
  value?: unknown;
}
/**
 * A JSON-render view handle, returned by `createJsonRenderView`. Owns a
 * server-side shared state carrying the live spec + state, and exposes the
 * serializable {@link JsonRenderViewStateRef} that a hub dock (or any client
 * transport) uses to locate it.
 */
interface JsonRenderView<SpecType extends DevframeJsonRenderSpec = DevframeJsonRenderSpec> {
  /** Author-supplied stable id, unique within the view's scope. */
  readonly id: string;
  /** Human-facing label published in the view index (defaults to `id`). */
  readonly title: string;
  /** The serializable reference clients subscribe through. */
  readonly ref: JsonRenderViewStateRef;
  /** Replace the entire spec (a structural change replaces the whole spec). */
  update: (spec: SpecType) => void;
  /**
   * Apply JSON-Pointer patches to the view's `state`. Travels as a
   * shared-state patch (not a whole-spec snapshot), so only the changed
   * paths cross the wire.
   */
  patchState: (patches: JsonRenderStatePatch[]) => void;
  /** Read the current spec (immutable). */
  value: () => SpecType;
  /** Unregister the shared state and its listeners. */
  dispose: () => void;
}
//#endregion
export { JsonRenderViewRef as a, JsonRenderViewInlineRef as i, DevframeJsonRenderSpec as n, JsonRenderViewStateRef as o, JsonRenderView as r, CatalogUIElement as t };