import { A as DevframeViewIframe, C as DevframeDockUserEntry, F as RemoteConnectionInfo, P as NavTarget, S as DevframeDockPanelState, _ as DevframeDockEntry, a as DevframeCommandEntry, b as DevframeDockEntryIcon, g as DevframeDockEntriesGrouped, n as DevframeClientCommand, p as ClientScriptEntry, s as DevframeCommandKeybinding, t as DevframeDocksUserSettings } from "../settings-DPLPzYfX.mjs";
import { n as resolveTitle, t as matchLocale } from "../locale-C3-NpDlX.mjs";
import { k as DevframeMessagesClient, w as DevframeMessageEntryInput } from "../context-BK50aJ-F.mjs";
import "../index-BvEO3eOd.mjs";
import { DevframeClientRpcHost, DevframeConnection, DevframeConnectionStatus, DevframeRpcClient, DevframeRpcClientOptions, DevframeRpcContext, RpcClientEvents, RpcClientEvents as RpcClientEvents$1 } from "devframe/client";
import { EventEmitter } from "devframe/types";
import { SharedState } from "devframe/utils/shared-state";
import { WhenContext } from "devframe/utils/when";
export * from "devframe/client";
//#region src/client-modules.d.ts
/**
 * Resolve a dock client script's `importFrom` to the URL to import. URL
 * specifiers pass through untouched; a **bare** specifier resolves through
 * the explicit `resolveClientModule` callback (a viewer's own policy), then
 * the host-advertised `template` (`ConnectionMeta.configs.dock.clientModuleResolution`,
 * its `{specifier}` token replaced, e.g. Vite's `'/@id/{specifier}'`),
 * resolved against `metaBaseUrl` so it targets the host's origin from any
 * viewer. With neither, it stays unchanged, since a page import map may
 * still cover it.
 */
export declare function resolveClientModuleSpecifier(specifier: string, options?: {
  resolveClientModule?: (specifier: string) => string | undefined;
  template?: string;
  metaBaseUrl?: string;
}): string;
/**
 * Diagnose a failed client-script import: name the likely cause instead of
 * leaving only the browser's opaque `TypeError`. `importFrom` is the entry's
 * declared specifier, `specifier` what was actually imported (after
 * {@link resolveClientModuleSpecifier}).
 */
export declare function clientScriptFailureHint(importFrom: string, specifier: string): string;
//#endregion
//#region src/client/renderers.d.ts
/**
 * Options handed to a dock renderer when the client host mounts a dock entry.
 */
export interface DockRendererMountOptions<Entry extends DevframeDockEntry = DevframeDockEntry> {
  /** The dock entry being rendered (carries the entry's serializable payload). */
  entry: Entry;
  /**
   * The DOM element the renderer should mount into. It may live inside a
   * **shadow root** (the reference viewer isolates dock content that way), so
   * a renderer must deliver its own styles into `container.getRootNode()`
   * rather than assume a page-level stylesheet. The viewer mirrors a live
   * `dark` class onto this element (the theme contract), and CSS custom
   * properties inherit across the shadow boundary for brand theming.
   */
  container: HTMLElement;
  /** The assembled client host context (rpc, docks, commands, …). */
  context: DevframeClientContext;
}
/** A mounted renderer instance the host can tear down. */
export interface DockRendererInstance {
  /** Tear down the mounted UI and release its subscriptions. */
  dispose?: () => void;
}
/**
 * A renderer for a dock `type`. The headless hub is renderer-agnostic: a
 * host registers renderers at boot (e.g. injecting `@devframes/json-render-ui`
 * for the `'json-render'` type) or serves them as prebuilt modules through the
 * hub's renderer manifest (`initHub({ renderers })`). The renderer owns its
 * framework (Vue, React, …); the hub only routes a dock type to it and
 * disposes it on deactivation.
 *
 * Integration packages narrow `Entry` to export a precisely-typed contract,
 * e.g. `@devframes/json-render/hub` exports
 * `JsonRenderDockRenderer = DockRenderer<DevframeJsonRenderDockEntry>`.
 */
export type DockRenderer<Entry extends DevframeDockEntry = DevframeDockEntry> = (options: DockRendererMountOptions<Entry>) => DockRendererInstance | Promise<DockRendererInstance>;
/**
 * The outcome of {@link DockRenderersContext.mount}. A missing renderer is an
 * expected, non-exceptional state: a viewer renders its "no renderer for this
 * dock type" fallback from `missing-renderer`, and its error variant (with a
 * retry affordance) from `load-error`.
 */
export type DockRendererMountResult = {
  status: 'mounted';
  dispose: () => void;
} | {
  status: 'missing-renderer';
} | {
  status: 'load-error';
  error: unknown;
};
/**
 * The dock-renderer registry surfaced on the client host context. A viewer
 * calls {@link DockRenderersContext.mount} to render a dock whose `type` has a
 * renderer (registered locally at boot, or served as a prebuilt module by the
 * hub's renderer manifest) into a container it owns; the host tracks the
 * instance and disposes it when the entry deactivates.
 */
export interface DockRenderersContext {
  /**
   * Register a renderer for a dock `type`. Returns an unregister function.
   * Accepts a renderer narrowed to any specific entry variant (e.g. a
   * {@link DockRenderer}<DevframeJsonRenderDockEntry> from an integration
   * package); the type routes only its own entries to it.
   */
  register: (type: string, renderer: DockRenderer<any>) => () => void;
  /** Look up the locally-registered renderer for a dock `type`, if any. */
  get: (type: string) => DockRenderer | undefined;
  /**
   * Whether a renderer is available for a dock `type`, registered locally
   * **or** provided by the hub's renderer manifest. A viewer checks this
   * before mounting to render its missing-renderer fallback declaratively.
   */
  has: (type: string) => boolean;
  /**
   * Mount the entry's renderer into `container` and resolve the
   * {@link DockRendererMountResult}. A local registration wins; otherwise the
   * manifest module for the entry's type is imported (lazily, cached) and
   * registered. The mounted instance is also disposed automatically when the
   * entry deactivates. Resolves `missing-renderer` (with a `console.warn`)
   * when neither source has the type, and `load-error` when the module import
   * or the renderer itself fails. A failed import is not cached, so a retry
   * re-imports.
   */
  mount: (entry: DevframeDockEntry, container: HTMLElement) => Promise<DockRendererMountResult>;
}
/**
 * The renderer manifest published by the hub at the
 * `devframe:dock-renderers` shared-state slot: one {@link ClientScriptEntry}
 * per dock `type`, whose `importFrom` is a URL path the hub serves
 * (`<base>__renderers/<type>.mjs`). Mirrors the dock client-script
 * convention: the module's `importName` export (default `'default'`) is a
 * ready {@link DockRenderer}.
 */
export type DockRendererManifest = Record<string, ClientScriptEntry>;
/** Options for {@link createDockRenderersContext}. */
export interface CreateDockRenderersContextOptions {
  /** The assembled client context handed to renderers at mount. */
  context: () => DevframeClientContext;
  /** Renderers registered locally at boot; these win over manifest modules. */
  local?: Record<string, DockRenderer<any>>;
  /** The current {@link DockRendererManifest} (live getter). */
  manifest?: () => DockRendererManifest;
  /**
   * Called with each successful mount's disposer so the caller can tie
   * disposal to its own lifecycle (entry deactivation, host teardown). An
   * optional returned cleanup runs exactly once when the mount is disposed,
   * whichever side (caller or viewer) triggers it first.
   */
  onMounted?: (dispose: () => void, entry: DevframeDockEntry) => (() => void) | void;
}
/**
 * Build the {@link DockRenderersContext} shared by every hub-aware client.
 * `createDevframeClientRuntime` and hub UI providers that assemble their own context
 * (`@devframes/hub-ui`) both delegate here so local-first resolution, lazy
 * manifest imports, and the typed mount result behave identically everywhere.
 */
export declare function createDockRenderersContext(options: CreateDockRenderersContextOptions): DockRenderersContext;
//#endregion
//#region src/client/docks.d.ts
export interface DockPanelStorage {
  mode: 'float' | 'edge';
  width: number;
  height: number;
  top: number;
  left: number;
  position: 'left' | 'right' | 'bottom' | 'top';
  inactiveTimeout: number;
}
/**
 * Per-tab UI state of the dock panel, distinct from the browser-shared geometry
 * in {@link DockPanelStorage}. A hub UI provider persists this to `sessionStorage` so a
 * reload (or the RPC auth handshake that follows one) restores the panel to
 * exactly where the developer left it: which dock was open, and the
 * address-bar route of that dock's iframe. Kept `sessionStorage`-scoped (not
 * `localStorage`) because it is per-tab navigation state: two tabs open against
 * the same dev server each keep their own selection rather than fighting over a
 * shared one. Every field is serializable.
 */
export interface DockSessionStorage {
  /** Whether the dock panel is open. */
  open: boolean;
  /** The currently selected dock entry id, or `null` when nothing is open. */
  selectedDockId: string | null;
  /**
   * The live address-bar URL of the selected iframe dock, restored as that
   * iframe's boot `src` on the next load so the deep-linked route survives a
   * reload. `null` when the selected dock has no iframe route to remember.
   */
  selectedDockRoute: string | null;
  /**
   * The dock entry most recently selected from beyond the float bar's inline
   * capacity, whether from the overflow popover or from inside a dock group. A hub UI
   * provider raises this entry into a dedicated slot between the bar's visible
   * items and the overflow button, so deselecting it (or selecting a visible
   * neighbour) keeps it one click away instead of folding it straight back
   * into the overflow. `null` (or absent, for stores persisted before this
   * field existed) when no entry has been raised.
   */
  recentDockId?: string | null;
  /**
   * The member most recently opened in each dock group, keyed by group id.
   * Recorded whenever a grouped member is selected (from the group popover,
   * the group sidebar, the command palette, or an RPC activation), and read
   * back when the group is activated again: the remembered member reopens
   * directly, taking precedence over the group's own
   * {@link import('../types/docks').DevframeViewGroup.defaultChildId defaultChildId}.
   * A group is only listed once one of its members has been opened this tab
   * (absent for stores persisted before this field existed).
   */
  groupLastChildIds?: Record<string, string>;
}
export type DockClientType = 'embedded' | 'standalone';
export interface DocksContext extends DevframeRpcContext {
  /**
   * Type of the client environment
   *
   * 'embedded' - running inside an embedded floating panel
   * 'standalone' - running inside a standalone window (no user app)
   */
  readonly clientType: 'embedded' | 'standalone';
  /**
   * The panel context
   */
  readonly panel: DocksPanelContext;
  /**
   * The docks entries context
   */
  readonly docks: DocksEntriesContext;
  /**
   * The commands context for command palette and shortcuts
   */
  readonly commands: CommandsContext;
  /**
   * The when-clause context for conditional visibility
   */
  readonly when: WhenClauseContext;
  /**
   * The live connection status of the underlying RPC client, so a hub UI provider
   * can render one central connection indicator for every docked plugin
   * instead of each plugin surfacing its own.
   */
  readonly connection: DocksConnectionContext;
  /**
   * The dock-renderer registry. Routes a dock `type` to a host-registered
   * renderer (e.g. `@devframes/json-render-ui` for `'json-render'`). The hub
   * itself ships no renderers.
   */
  readonly renderers: DockRenderersContext;
}
export interface DocksConnectionContext {
  /** The current connection status. */
  readonly status: DevframeConnectionStatus;
  /** The most recent connection-level error, or `null` when healthy. */
  readonly error: Error | null;
  /**
   * The client's event emitter. Subscribe to `connection:status`,
   * `connection:error`, and `rpc:error` to react to changes.
   */
  readonly events: EventEmitter<RpcClientEvents$1>;
}
export interface WhenClauseContext {
  /**
   * Get the current when-clause context snapshot.
   * Returns a reactive object with built-in variables and any custom plugin variables.
   */
  readonly context: WhenContext;
}
export type DevframeClientContext = DocksContext;
export interface DocksPanelEvents {
  'panel:state:changed': (panelState: DevframeDockPanelState) => void;
}
export interface DocksPanelContext {
  /** The current panel state snapshot. */
  readonly state: DevframeDockPanelState;
  /** Subscribe to panel state changes after the current snapshot. */
  readonly events: EventEmitter<DocksPanelEvents>;
  store: DockPanelStorage;
  /**
   * Per-tab session UI state: whether the panel is open, which dock is
   * selected, and that dock's iframe route. Restored across reloads (and the
   * auth handshake that follows one) by a hub UI provider that persists it to
   * `sessionStorage`.
   */
  session: DockSessionStorage;
  isDragging: boolean;
  isResizing: boolean;
  readonly isVertical: boolean;
  /**
   * Claim the persisted {@link DockSessionStorage.selectedDockRoute boot route} for a dock
   * id, once. Returns the saved address-bar URL only for the dock that was
   * selected before the last reload (and only on the first call for it), so a
   * restored iframe boots deep-linked while a later switch to a different dock
   * (whose live route isn't reflected in {@link DockSessionStorage.selectedDockRoute} yet)
   * doesn't reuse the stale value. Returns `null` otherwise.
   */
  consumeBootRoute?: (id: string) => string | null;
}
export interface DocksEntriesContext {
  selectedId: string | null;
  selectedRoute: string | null;
  readonly selected: DevframeDockEntry | null;
  entries: DevframeDockEntry[];
  entryToStateMap: Map<string, DockEntryState>;
  groupedEntries: DevframeDockEntriesGrouped;
  /**
   * The resolved top-level category ordering: `DEFAULT_CATEGORIES_ORDER`,
   * overridden by every installed devframe's own `dock.categoryOrder`
   * (`ConnectionMeta.configs.dock.categoryOrder`), overridden again by the
   * host page's own `createDevframeClientRuntime({ categoryOrder })`. Fixed
   * for the life of the session, resolved once at boot.
   */
  readonly categoryOrder: Record<string, number>;
  settings: SharedState<DevframeDocksUserSettings>;
  /**
   * Get the state of a dock entry by its ID
   */
  getStateById: (id: string) => DockEntryState | undefined;
  /**
   * Switch to the selected dock entry, pass `null` to clear the selection
   *
   * @returns Whether the selection was changed successfully
   */
  switchEntry: (id?: string | null) => Promise<boolean>;
  /**
   * Toggle the selected dock entry
   *
   * @returns Whether the selection was changed successfully
   */
  toggleEntry: (id: string) => Promise<boolean>;
  /**
   * Register a **client-only** dock entry, live in this page and merged with
   * the server-provided docks (`devframe:docks` shared state) into
   * {@link entries}. Unlike a dock registered on the node
   * {@link import('../types/docks').DevframeDocksHost}, it never flows into
   * shared state, so it stays local to this client instead of syncing to the
   * hub or other hub UI providers, suiting a view the client runtime synthesizes itself.
   *
   * Throws when `id` already names a client dock, unless `force` is set. A
   * client dock sharing an id with a server dock overrides it in the local
   * merge. Returns a handle to {@link DockRegistration.update patch} or
   * {@link DockRegistration.dispose remove} it.
   */
  register: <T extends DevframeDockEntry>(entry: T, force?: boolean) => DockRegistration<T>;
  /**
   * Replace a previously {@link register client-registered} dock entry, keyed
   * by `id`. Throws when no client dock owns that id.
   */
  update: (entry: DevframeDockUserEntry) => void;
}
export interface DockRegistration<T extends DevframeDockEntry = DevframeDockEntry> {
  /**
   * Patch the registered client dock in place. The `id` is immutable, so passing
   * a differing `id` throws.
   */
  update: (patch: Partial<T>) => void;
  /** Remove the client dock from the local merge. */
  dispose: () => void;
}
export interface DockEntryState {
  entryMeta: DevframeDockEntry;
  readonly isActive: boolean;
  domElements: {
    iframe?: HTMLIFrameElement | null;
    panel?: HTMLDivElement | null;
  };
  events: EventEmitter<DockEntryStateEvents>;
}
export interface DockEntryStateEvents {
  'entry:activated': () => void;
  'entry:deactivated': () => void;
  'entry:updated': (newMeta: DevframeDockUserEntry) => void;
  'dom:panel:mounted': (panel: HTMLDivElement) => void;
  'dom:iframe:mounted': (iframe: HTMLIFrameElement) => void;
}
export interface CommandsContext {
  /**
   * All commands (server + client)
   */
  readonly commands: DevframeCommandEntry[];
  /**
   * Palette-visible commands only (filtered by `showInPalette !== false`)
   */
  readonly paletteCommands: DevframeCommandEntry[];
  /**
   * Register client-side command(s). Returns cleanup function.
   */
  register: (cmd: DevframeClientCommand | DevframeClientCommand[]) => () => void;
  /**
   * Execute a command by ID. Delegates to RPC for server commands.
   */
  execute: (id: string, ...args: any[]) => Promise<unknown>;
  /**
   * Get effective keybindings for a command (defaults merged with overrides)
   */
  getKeybindings: (id: string) => DevframeCommandKeybinding[];
  /**
   * User settings store (persisted, includes command shortcuts)
   */
  settings: SharedState<DevframeDocksUserSettings>;
  /**
   * Whether the command palette is open
   */
  paletteOpen: boolean;
  /**
   * The command whose children the palette should open drilled into, or `null`
   * for the root list. Set by {@link CommandsContext.openPalette}; the palette
   * reads it when it opens and clears it when it closes.
   */
  paletteScopeId: string | null;
  /**
   * Open the command palette, optionally scoped to one command's children:
   * e.g. a dock group with no `defaultChildId` opens the palette listing just
   * that group's members instead of guessing one for the user.
   *
   * Passing no id opens the root list, the same as setting `paletteOpen` true.
   */
  openPalette: (atCommandId?: string) => void;
}
//#endregion
//#region src/client/client-script.d.ts
/**
 * Context for client scripts running in dock entries
 */
export interface DockClientScriptContext extends DocksContext {
  /**
   * The state of the current dock entry
   */
  current: DockEntryState;
  /**
   * Messages client scoped to this dock entry. Messages it adds default
   * their `category` to the entry id, so the feed can attribute them.
   */
  messages: DevframeMessagesClient;
}
//#endregion
//#region src/client/context.d.ts
declare const CLIENT_CONTEXT_KEY = "__DEVFRAME_HUB_CLIENT_CONTEXT__";
/**
 * Get the global Devframe client context, or `undefined` if not yet initialized.
 */
export declare function getDevframeClientContext(): DevframeClientContext | undefined;
/**
 * Publish the global Devframe client context (or clear it with `undefined`).
 * Called by {@link import('./host').createDevframeClientRuntime}; a dock client
 * script or a hub UI provider reads it back with {@link getDevframeClientContext}.
 */
export declare function setDevframeClientContext(ctx: DevframeClientContext | undefined): void;
//#endregion
//#region src/client/dock-resources.d.ts
/**
 * Resolve a dock iframe URL relative to the Devframe server that provided the
 * dock entry. This keeps root-relative and dot-relative paths on the host
 * server when an external viewer renders the hub.
 */
export declare function resolveDockUrl(url: string, connection: DevframeConnection): string;
/** Resolve URL-backed dock icons while preserving Iconify names and data URLs. */
export declare function resolveDockIcon(icon: DevframeDockEntryIcon, connection: DevframeConnection): DevframeDockEntryIcon;
//#endregion
//#region src/client/frame-location.d.ts
/**
 * Live location tracking for an iframe dock.
 *
 * An iframe dock's address bar (and the route persisted from it into
 * `DockSessionStorage.selectedDockRoute`) has to follow wherever the embedded
 * app actually goes. The `load` event only covers whole-document navigations, so
 * an SPA router moving between routes with `history.pushState()` leaves both
 * showing the URL the frame booted with.
 *
 * {@link watchFrameLocation} closes that gap for a same-origin frame, reporting
 * `location.href` on every navigation it can observe:
 *
 * - `popstate` / `hashchange`: back/forward and hash routing;
 * - `history.pushState`/`replaceState`, wrapped in place (and restored on
 *   dispose) because those two fire no event of their own;
 * - the [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)'s
 *   `currententrychange` where it exists, which reports post-commit and so also
 *   catches what a wrapper structurally cannot: a router holding a reference to
 *   `pushState` captured before this watch attached;
 * - `load`, which also re-subscribes: a document navigation swaps the frame's
 *   `history`/`navigation` objects, so the previous subscription dies with them.
 *
 * These sources overlap deliberately rather than being chosen between, since a
 * report is deduped against the last href, so the cost of hearing the same
 * navigation twice is nothing, and the cost of missing one is a stale route.
 *
 * A cross-origin frame reports nothing, because its location is unreadable by design,
 * so the caller keeps the last URL it knew.
 */
/** The minimal `history` surface the watcher wraps. Injectable for tests. */
export interface FrameLocationHistory {
  pushState: (...args: any[]) => void;
  replaceState: (...args: any[]) => void;
}
/** The minimal frame-window surface the watcher reads and subscribes to. */
export interface FrameLocationWindow {
  readonly location: {
    readonly href: string;
  };
  readonly history?: FrameLocationHistory;
  /** Present only where the Navigation API ships. */
  readonly navigation?: {
    addEventListener: (type: 'currententrychange', listener: () => void) => void;
    removeEventListener: (type: 'currententrychange', listener: () => void) => void;
  };
  addEventListener: (type: 'popstate' | 'hashchange', listener: () => void) => void;
  removeEventListener: (type: 'popstate' | 'hashchange', listener: () => void) => void;
}
/** The minimal iframe surface the watcher needs. Injectable for tests. */
export interface FrameLocationTarget {
  readonly contentWindow: FrameLocationWindow | null;
  addEventListener: (type: 'load', listener: () => void) => void;
  removeEventListener: (type: 'load', listener: () => void) => void;
}
export interface WatchFrameLocationOptions {
  /** The live iframe whose location is tracked. */
  iframe: FrameLocationTarget;
  /** Called with the frame's `location.href` on each observed change. */
  onChange: (href: string) => void;
  /**
   * The href the caller already shows, so an initial report is only made when
   * the frame is somewhere else (a frame re-attached mid-session, say).
   */
  initial?: string;
}
/**
 * Track a frame's location until the returned disposer is called. Disposing
 * detaches every listener and restores any wrapped `history` method, leaving the
 * embedded page as it was found.
 */
export declare function watchFrameLocation(options: WatchFrameLocationOptions): () => void;
//#endregion
//#region src/client/frame-nav.d.ts
/**
 * Shared-iframe soft navigation: the hub-UI-provider-side half of a host-page↔iframe
 * `postMessage` protocol.
 *
 * An {@link DevframeViewIframe.subTabs anchor} iframe dock owns one live iframe
 * (its {@link DevframeViewIframe.frameId frameId}); the embedded app ships a
 * tiny **nav shim** that announces its tabs and answers navigation over
 * `postMessage`. This adapter, auto-attached by the client host when the anchor
 * iframe mounts, runs the ready handshake, turns the reported tab manifest into
 * **client-only** member docks (via {@link DocksEntriesContext.register}), and
 * drives the bidirectional nav loop:
 *
 * - selecting a member dock posts a `navigate` (client-side, no reload);
 * - the app posts `navigated` on any internal navigation, moving the dock
 *   highlight to match.
 *
 * The protocol is server-free (works cross-origin and in static builds) and
 * decoupled, so the embedded app takes no hub/RPC dependency, only the shim.
 */
/** `postMessage` channel tag shared by both halves of the protocol. */
export declare const FRAME_NAV_CHANNEL: string;
/** Protocol version. */
export declare const FRAME_NAV_VERSION = 1;
/** Envelope every frame-nav message carries. */
export interface FrameNavEnvelope {
  channel: typeof FRAME_NAV_CHANNEL;
  v: typeof FRAME_NAV_VERSION;
  frameId: string;
  /** Direction tag; each side ignores messages with its own `from`. */
  from: 'host' | 'frame';
}
/**
 * One tab in the manifest the shim reports. Maps directly onto a dock entry, so
 * a materialized member dock is first-class.
 */
export interface FrameTab {
  /** Unique within the frame. The member dock id becomes `<frameId>:<id>`. */
  id: string;
  title: string;
  icon?: DevframeDockEntryIcon;
  /** Soft-nav target the app maps to its own router. */
  navTarget: NavTarget;
  /**
   * Absolute or anchor-relative URL used for the boot deep-link and the
   * hard-nav fallback. When omitted, one is derived from the anchor URL +
   * `navTarget.path` (hash routing).
   */
  fallbackUrl?: string;
  badge?: string;
  order?: number;
  category?: string;
  when?: string;
  groupId?: string;
}
/** Host → frame message payloads (without the {@link FrameNavEnvelope}). */
export type FrameNavHostPayload = {
  type: 'hello';
} | {
  type: 'navigate';
  tabId: string;
  navTarget: NavTarget;
};
/** Host → frame messages. */
export type FrameNavHostMessage = FrameNavEnvelope & {
  from: 'host';
} & FrameNavHostPayload;
/** Frame → host messages. */
export type FrameNavFrameMessage = FrameNavEnvelope & {
  from: 'frame';
} & ({
  type: 'ready';
  tabs: FrameTab[];
  current?: string;
} | {
  type: 'manifest';
  tabs: FrameTab[];
  current?: string;
} | {
  type: 'navigated';
  tabId?: string;
  navTarget?: NavTarget;
});
/** Minimal window surface the adapter listens on (injectable for tests). */
export interface FrameNavListenTarget {
  addEventListener: (type: 'message', listener: (ev: MessageEvent) => void) => void;
  removeEventListener: (type: 'message', listener: (ev: MessageEvent) => void) => void;
}
export interface FrameNavClientOptions {
  /** The shared frame id (defaults to the anchor's, else the anchor id). */
  frameId: string;
  /** The anchor iframe dock entry, supplying url/icon/groupId defaults. */
  anchor: DevframeViewIframe;
  /** The live iframe element hosting the embedded app. */
  iframe: Pick<HTMLIFrameElement, 'contentWindow' | 'src'>;
  /** Client docks context, used to register members and drive selection. */
  docks: Pick<DocksEntriesContext, 'register' | 'switchEntry' | 'getStateById'>;
  /**
   * Window to receive the frame's `message` events on (the host page window).
   * Defaults to `globalThis`.
   */
  window?: FrameNavListenTarget;
  /** Expected origin for `postMessage`; derived from the anchor URL otherwise. */
  origin?: string;
  /** @default 3000 */
  handshakeTimeoutMs?: number;
}
export interface FrameNavClient {
  /** Whether the shim has completed its `ready` handshake. */
  readonly ready: boolean;
  /** The tab id currently shown in the frame, or `null`. */
  readonly currentTabId: string | null;
  dispose: () => void;
}
/**
 * Attach the frame-nav adapter to a mounted anchor iframe. Returns a handle
 * exposing readiness/current state and a `dispose()` that removes every member
 * dock it registered and detaches its listener.
 */
export declare function attachFrameNavClient(options: FrameNavClientOptions): FrameNavClient;
//#endregion
//#region src/client/host.d.ts
export interface DevframeClientRuntimeOptions {
  /**
   * An already-connected RPC client. When omitted, one is created via
   * `connectDevframe(connect)`, so pass `connect.baseURL` to point at the hub's
   * connection-meta mount (e.g. `/__hub/`).
   */
  rpc?: DevframeRpcClient;
  /** Options forwarded to `connectDevframe` when `rpc` is not supplied. */
  connect?: DevframeRpcClientOptions;
  /**
   * Environment the host runs in.
   * - `'standalone'` (default): the runtime owns the whole page (a hub UI).
   * - `'embedded'`: the runtime lives inside a user app alongside a panel.
   */
  clientType?: DockClientType;
  /**
   * Import and run the client scripts declared on dock entries (`action`,
   * `custom-render`, and iframe `clientScript`). Default `true`.
   */
  loadClientScripts?: boolean;
  /**
   * Resolve a **bare-specifier** client script (`importFrom` naming an npm
   * module) to a URL this page can import, a hub UI provider's own policy that wins
   * over the host-advertised `ConnectionMeta.configs.dock.clientModuleResolution`
   * template (return `undefined` to fall through to it). URL specifiers never
   * reach this hook. E.g. on a Vite-served page:
   * `resolveClientModule: s => `/@id/${s}``.
   */
  resolveClientModule?: (specifier: string) => string | undefined;
  /**
   * Dock renderers to register at boot, keyed by dock `type`. The host
   * application injects the ones it wants (e.g.
   * `{ 'json-render': createJsonRenderDockRenderer() }` from
   * `@devframes/json-render-ui`). The hub ships none by default.
   *
   * Local registrations take precedence over the hub's renderer manifest
   * (`initHub({ renderers })`), since explicit local code beats wire config.
   */
  renderers?: Record<string, DockRenderer<any>>;
  /**
   * Hub-wide override of the top-level dock-bar category ordering: a map of
   * category id → ordering weight (lower sorts earlier), mirroring the shape
   * of {@link import('../constants').DEFAULT_CATEGORIES_ORDER}.
   *
   * This is the OUTER bucket ordering: it governs every ungrouped entry's own
   * `category` and every group's `category` (see
   * {@link import('../types/docks').DevframeDockEntryBase.category}). It is
   * distinct from {@link import('../types/docks').DevframeViewGroup.categoryOrder},
   * which only reorders the IN-GROUP sub-categories of one specific group.
   *
   * Keys are merged over `DEFAULT_CATEGORIES_ORDER`, so the host app only
   * lists the categories it wants to move; any category absent from the map
   * keeps its default weight.
   *
   * @example
   * ```ts
   * // Surface `data` tools ahead of `app` tools, hub-wide.
   * createDevframeClientRuntime({ categoryOrder: { data: 50 } })
   * ```
   */
  categoryOrder?: Record<string, number>;
}
export interface DevframeClientRuntime {
  /** The assembled, globally-registered client context. */
  context: DevframeClientContext;
  /** Tear down listeners and stop tracking newly-registered client scripts. */
  dispose: () => void;
}
/**
 * Boot the client runtime: connect RPC, assemble the full
 * {@link DevframeClientContext} (panel, docks, commands, when) from the hub's
 * shared state, publish it at `__DEVFRAME_HUB_CLIENT_CONTEXT__`, and load every
 * dock entry's client script into this page, the devframe equivalent of the
 * runtime `@vitejs/devtools-kit` injects into a host app.
 *
 * A hub UI provider keeps rendering its own dock UI (reading the same shared state); this
 * runtime is what gives plugin client scripts a live host context to run in.
 */
export declare function createDevframeClientRuntime(options?: DevframeClientRuntimeOptions): Promise<DevframeClientRuntime>;
//#endregion
//#region src/client/messages.d.ts
export interface MessagesClientOptions {
  /**
   * Default fields merged beneath every `add()` input. The client host passes
   * `{ category: entry.id }` to scope a dock client script's messages to its
   * entry. Fields set on the input itself win.
   */
  defaults?: Partial<DevframeMessageEntryInput>;
}
/**
 * Build a browser-side {@link DevframeMessagesClient} that writes into the
 * hub's messages subsystem over the `hub:messages:*` built-in RPCs. The handle
 * returned by `add` proxies `update`/`dismiss` back through the same RPCs, so a
 * dock client script reports into the very feed the server writes to.
 */
export declare function createMessagesClient(rpc: DevframeRpcClient, options?: MessagesClientOptions): DevframeMessagesClient;
//#endregion
//#region src/remote-url.d.ts
/** Remove the remote connection descriptor from a URL before displaying or copying it. */
export declare function stripRemoteConnectionFromUrl(input: string): string;
//#endregion
//#region src/client/remote.d.ts
export type ConnectRemoteDevframeOptions = Omit<DevframeRpcClientOptions, 'connectionMeta' | 'authToken'>;
/**
 * Build an external viewer URL from an existing trusted Devframe connection.
 * Returns the original URL if the connection has no auth token, does not use
 * WebSockets, or has an invalid metadata URL.
 */
export declare function buildRemoteDevframeUrl(url: string, connection: DevframeConnection): string;
/**
 * Parse a {@link RemoteConnectionInfo} descriptor from the current page's URL
 * (or a provided URL/string). Checks the URL fragment first, then the query.
 *
 * Returns `null` if no descriptor is present.
 * Throws if the descriptor is malformed or its schema version is unsupported.
 */
export declare function parseRemoteConnection(input?: string): RemoteConnectionInfo | null;
/**
 * One-liner for a hosted Devframe page: reads the connection descriptor from
 * the current URL and returns a connected {@link DevframeRpcClient}.
 *
 * Pairs with `remote: true` on a `DevframeViewIframe` registered on the node
 * side, where the hub injects the descriptor into the iframe URL.
 *
 * @throws if no descriptor is present in the URL.
 */
export declare function connectRemoteDevframe(options?: ConnectRemoteDevframeOptions): Promise<DevframeRpcClient>;
//#endregion
export { CLIENT_CONTEXT_KEY, type DevframeClientRpcHost, type RpcClientEvents, matchLocale, resolveTitle };