import { cleanDoubleSlashes, withLeadingSlash, withTrailingSlash } from "devframe/utils/url";
//#region src/events.ts
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
const HUB_EVENTS = {
	/**
	* Internal node `EventEmitter` events on `ctx.<subsystem>.events`. Emitted
	* and consumed inside the node process (chiefly by `createHubContext`, which
	* fans them out onto the wire); they never cross to the browser.
	*/
	bus: {
		docksEntryUpdated: "docks:entry:updated",
		docksActivate: "docks:activate",
		terminalsSessionUpdated: "terminals:session:updated",
		messagesAdded: "messages:added",
		messagesUpdated: "messages:updated",
		messagesRemoved: "messages:removed",
		messagesCleared: "messages:cleared",
		commandsRegistered: "commands:registered",
		commandsUnregistered: "commands:unregistered"
	},
	/** Server RPC methods a connected client calls (client → server), `hub:` prefix. */
	rpc: {
		docksActivate: "hub:docks:activate",
		commandsExecute: "hub:commands:execute",
		messagesAdd: "hub:messages:add",
		messagesUpdate: "hub:messages:update",
		messagesRemove: "hub:messages:remove",
		messagesClear: "hub:messages:clear",
		terminalsWrite: "hub:terminals:write",
		terminalsResize: "hub:terminals:resize",
		terminalsTerminate: "hub:terminals:terminate",
		terminalsRestart: "hub:terminals:restart",
		terminalsRemove: "hub:terminals:remove"
	},
	/** Client-context events emitted inside the host page. */
	client: { docksPanelStateChanged: "panel:state:changed" },
	/** Broadcast notifications the server pushes to clients (server → client), `devframe:` prefix. */
	broadcast: {
		docksActivate: "devframe:docks:activate",
		terminalsUpdated: "devframe:terminals:updated",
		messagesUpdated: "devframe:messages:updated"
	},
	/** Shared-state slot keys a hub-aware client reads (server → client), `devframe:` prefix. */
	sharedState: {
		docks: "devframe:docks",
		docksActive: "devframe:docks:active",
		commands: "devframe:commands",
		userSettings: "devframe:user-settings",
		dockRenderers: "devframe:dock-renderers"
	},
	/** Streaming channel ids (server → client), `devframe:` prefix. */
	stream: { terminals: "devframe:terminals" },
	/** `postMessage` channels for host ↔ iframe protocols, `devframe:` prefix. */
	postMessage: { frameNav: "devframe:frame-nav" },
	/**
	* Same-origin `BroadcastChannel` names, `devframe:` prefix. Used on a
	* `static` backend, where no live server can relay a client's request to
	* its sibling browsing contexts (e.g. a panel iframe steering the host
	* page's dock selection).
	*/
	broadcastChannel: { docksActivate: "devframe:docks:activate" }
};
//#endregion
//#region src/constants.ts
/** Default mount base for a hub instance: one namespace, one catch-all. */
const DEVFRAMES_HUB_BASE = "/__devframes/";
/**
* Normalize a hub mount base to an absolute path with leading and trailing
* slashes (e.g. `devframes` → `/devframes/`), collapsing any doubled
* slashes the input introduced. The one implementation every hub-aware
* host (`@devframes/hub` itself, and the Vite/Nuxt/Next adapters) resolves
* `options.base` through.
*/
function normalizeHubBase(base) {
	return cleanDoubleSlashes(withTrailingSlash(withLeadingSlash(base)));
}
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
const DEFAULT_CATEGORIES_ORDER = {
	"framework": -100,
	"default": 0,
	"app": 100,
	"ui": 150,
	"data": 250,
	"web": 300,
	"performance": 350,
	"advanced": 400,
	"docs": 500,
	"~builtin": 1e3
};
/**
* Shared-state slot carrying the hub's renderer manifest: one
* {@link import('./client/renderers').DockRendererManifest} entry per dock
* `type`, published by `initHub({ renderers })` and consumed by every
* hub-aware client (the headless client host and viewers alike).
*/
const DOCK_RENDERERS_STATE_KEY = HUB_EVENTS.sharedState.dockRenderers;
const DEFAULT_STATE_USER_SETTINGS = () => ({
	docksHidden: [],
	docksCategoriesHidden: [],
	docksPinned: [],
	docksCustomOrder: {},
	commandShortcuts: {}
});
//#endregion
export { normalizeHubBase as a, DOCK_RENDERERS_STATE_KEY as i, DEFAULT_STATE_USER_SETTINGS as n, HUB_EVENTS as o, DEVFRAMES_HUB_BASE as r, DEFAULT_CATEGORIES_ORDER as t };
