import { a as JsonRenderViewRef, r as JsonRenderView } from "./types-ByXkazOp.mjs";
import { DockRenderer, DockRendererMountOptions } from "@devframes/hub/client";
import { DevframeDockEntryBase } from "@devframes/hub/types";
//#region src/hub.d.ts
/**
 * A `json-render` dock entry. Contributed to the hub's **open** dock union
 * (`DevframeDockEntryRegistry`) by this opt-in integration, since the hub itself
 * hard-codes no json-render variant. Carries only the serializable
 * {@link JsonRenderViewRef}; no functions cross the wire.
 */
export interface DevframeJsonRenderDockEntry extends DevframeDockEntryBase {
  type: 'json-render';
  /** Serializable reference the client subscribes through. */
  view: JsonRenderViewRef;
}
declare module '@devframes/hub/types' {
  interface DevframeDockEntryRegistry {
    'json-render': DevframeJsonRenderDockEntry;
  }
}
/**
 * The mount options a hub viewer hands a json-render dock renderer: the
 * hub's `DockRendererMountOptions` narrowed to the `'json-render'` entry.
 * This protocol package owns the renderer contract so every frontend
 * (`@devframes/json-render-ui`, a community renderer, a host page's own)
 * implements one shared shape instead of re-declaring it.
 */
export type JsonRenderDockMountOptions = DockRendererMountOptions<DevframeJsonRenderDockEntry>;
/**
 * The renderer contract for `'json-render'` docks: a hub `DockRenderer`
 * narrowed to {@link DevframeJsonRenderDockEntry}. Implement it to replace
 * the reference frontend: register the implementation locally
 * (`createDevframeClientRuntime({ renderers })`) or ship it as a prebuilt
 * module registered through the hub's renderer manifest
 * (`initHub({ renderers })`).
 */
export type JsonRenderDockRenderer = DockRenderer<DevframeJsonRenderDockEntry>;
/**
 * Build a `json-render` dock entry from a {@link JsonRenderView} and the dock
 * metadata (id, title, icon, …). Projects the view down to its serializable
 * {@link JsonRenderViewRef} so it survives dock projection into shared state.
 */
export declare function toJsonRenderDockEntry(view: JsonRenderView, meta: Omit<DevframeJsonRenderDockEntry, 'type' | 'view'>): DevframeJsonRenderDockEntry;
//#endregion