import { t as DevframeDocksUserSettings } from "./settings-DPLPzYfX.mjs";
//#region src/events.d.ts
/**
 * Centralized registry of every event, broadcast, RPC method, shared-state
 * key, and channel name the hub uses: the single source of truth that keeps
 * these names out of scattered string literals.
 *
 * **Keep this in sync with [`docs/content/8.references/3.events.md`](../../../docs/content/8.references/3.events.md)**
 * (the Hub Events Reference): every name here appears in that page's tables, and
 * every name there resolves to an entry here. Add, rename, or remove a name in
 * both places in the same change, and reference `HUB_EVENTS.*` from call sites
 * instead of re-typing a literal.
 *
 * The `.events` EventEmitter maps and RPC augmentation interfaces declare these
 * same names as type-level keys (a literal is unavoidable in a type position);
 * those declarations mirror this map and move with it.
 */
declare const HUB_EVENTS: {
  /**
   * Internal node `EventEmitter` events on `ctx.<subsystem>.events`. Emitted
   * and consumed inside the node process (chiefly by `createHubContext`, which
   * fans them out onto the wire); they never cross to the browser.
   */
  readonly bus: {
    readonly docksEntryUpdated: "docks:entry:updated";
    readonly docksActivate: "docks:activate";
    readonly terminalsSessionUpdated: "terminals:session:updated";
    readonly messagesAdded: "messages:added";
    readonly messagesUpdated: "messages:updated";
    readonly messagesRemoved: "messages:removed";
    readonly messagesCleared: "messages:cleared";
    readonly commandsRegistered: "commands:registered";
    readonly commandsUnregistered: "commands:unregistered";
  };
  /** Server RPC methods a connected client calls (client → server), `hub:` prefix. */
  readonly rpc: {
    readonly docksActivate: "hub:docks:activate";
    readonly commandsExecute: "hub:commands:execute";
    readonly messagesAdd: "hub:messages:add";
    readonly messagesUpdate: "hub:messages:update";
    readonly messagesRemove: "hub:messages:remove";
    readonly messagesClear: "hub:messages:clear";
    readonly terminalsWrite: "hub:terminals:write";
    readonly terminalsResize: "hub:terminals:resize";
    readonly terminalsTerminate: "hub:terminals:terminate";
    readonly terminalsRestart: "hub:terminals:restart";
    readonly terminalsRemove: "hub:terminals:remove";
  };
  /** Client-context events emitted inside the host page. */
  readonly client: {
    readonly docksPanelStateChanged: "panel:state:changed";
  };
  /** Broadcast notifications the server pushes to clients (server → client), `devframe:` prefix. */
  readonly broadcast: {
    readonly docksActivate: "devframe:docks:activate";
    readonly terminalsUpdated: "devframe:terminals:updated";
    readonly messagesUpdated: "devframe:messages:updated";
  };
  /** Shared-state slot keys a hub-aware client reads (server → client), `devframe:` prefix. */
  readonly sharedState: {
    readonly docks: "devframe:docks";
    readonly docksActive: "devframe:docks:active";
    readonly commands: "devframe:commands";
    readonly userSettings: "devframe:user-settings";
    readonly dockRenderers: "devframe:dock-renderers";
  };
  /** Streaming channel ids (server → client), `devframe:` prefix. */
  readonly stream: {
    readonly terminals: "devframe:terminals";
  };
  /** `postMessage` channels for host ↔ iframe protocols, `devframe:` prefix. */
  readonly postMessage: {
    readonly frameNav: "devframe:frame-nav";
  };
  /**
   * Same-origin `BroadcastChannel` names, `devframe:` prefix. Used on a
   * `static` backend, where no live server can relay a client's request to
   * its sibling browsing contexts (e.g. a panel iframe steering the host
   * page's dock selection).
   */
  readonly broadcastChannel: {
    readonly docksActivate: "devframe:docks:activate";
  };
};
//#endregion
//#region src/constants.d.ts
/** Default mount base for a hub instance: one namespace, one catch-all. */
declare const DEVFRAMES_HUB_BASE = "/__devframes/";
/**
 * Normalize a hub mount base to an absolute path with leading and trailing
 * slashes (e.g. `devframes` → `/devframes/`), collapsing any doubled
 * slashes the input introduced. The one implementation every hub-aware
 * host (`@devframes/hub` itself, and the Vite/Nuxt/Next adapters) resolves
 * `options.base` through.
 */
declare function normalizeHubBase(base: string): string;
/**
 * The default ordering weight for each known dock category, where lower sorts
 * earlier. Downstream viewers (e.g. `@vitejs/devtools-kit`) import this as the
 * single source of truth so the hub and its viewers agree on category order.
 * `framework` sorts first; `~builtin` (the viewer's own built-in views) last.
 *
 * The buckets read from "closest to your app" → "platform / analysis" →
 * "peripheral". Gaps between the weights are intentional: a kit can interleave
 * its own categories (or override these) without editing this table.
 */
declare const DEFAULT_CATEGORIES_ORDER: Record<string, number>;
/**
 * Shared-state slot carrying the hub's renderer manifest: one
 * {@link import('./client/renderers').DockRendererManifest} entry per dock
 * `type`, published by `initHub({ renderers })` and consumed by every
 * hub-aware client (the headless client host and viewers alike).
 */
declare const DOCK_RENDERERS_STATE_KEY: string;
declare const DEFAULT_STATE_USER_SETTINGS: () => DevframeDocksUserSettings;
//#endregion
export { normalizeHubBase as a, DOCK_RENDERERS_STATE_KEY as i, DEFAULT_STATE_USER_SETTINGS as n, HUB_EVENTS as o, DEVFRAMES_HUB_BASE as r, DEFAULT_CATEGORIES_ORDER as t };