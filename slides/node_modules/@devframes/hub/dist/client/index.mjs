import { n as resolveTitle, t as matchLocale } from "../locale-BbVtoVI6.mjs";
import { i as DOCK_RENDERERS_STATE_KEY, n as DEFAULT_STATE_USER_SETTINGS, o as HUB_EVENTS, t as DEFAULT_CATEGORIES_ORDER } from "../constants-BSPQmlA1.mjs";
import { a as resolveClientModuleSpecifier, n as stripRemoteConnectionFromUrl, r as clientScriptFailureHint, t as buildRemoteConnectionUrl } from "../remote-url-UClKLQ5_.mjs";
import { DEVFRAME_EVENTS, REMOTE_CONNECTION_KEY } from "devframe/constants";
import { connectDevframe, getDevframeRpcClient, resolveWsUrl } from "devframe/client";
import { createEventEmitter } from "devframe/utils/events";
import { destr } from "destr";
export * from "devframe/client";
//#region src/client/context.ts
const CLIENT_CONTEXT_KEY = "__DEVFRAME_HUB_CLIENT_CONTEXT__";
/**
* Get the global Devframe client context, or `undefined` if not yet initialized.
*/
function getDevframeClientContext() {
	return globalThis[CLIENT_CONTEXT_KEY];
}
/**
* Publish the global Devframe client context (or clear it with `undefined`).
* Called by {@link import('./host').createDevframeClientRuntime}; a dock client
* script or a hub UI provider reads it back with {@link getDevframeClientContext}.
*/
function setDevframeClientContext(ctx) {
	globalThis[CLIENT_CONTEXT_KEY] = ctx;
}
//#endregion
//#region src/client/dock-resources.ts
const URL_SCHEME_RE = /^[a-z][a-z\d+.-]*:/i;
function resolveResourceUrl(value, connection) {
	const url = value.trim();
	if (!url || URL_SCHEME_RE.test(url) || url.startsWith("//")) return url;
	if (!url.startsWith("/") && !url.startsWith("./") && !url.startsWith("../")) return url;
	try {
		return new URL(url, connection.metaBaseUrl).href;
	} catch {
		return url;
	}
}
function resolveIconUrl(value, connection) {
	const url = value.trim();
	if (url.startsWith("mask:")) {
		const maskUrl = url.slice(5).trim();
		if (!maskUrl) return "mask:";
		try {
			return `mask:${new URL(maskUrl, connection.metaBaseUrl).href}`;
		} catch {
			return url;
		}
	}
	if (!url || URL_SCHEME_RE.test(url) || url.startsWith("//")) return url;
	if (!url.includes("/") && !url.includes(".")) return url;
	try {
		return new URL(url, connection.metaBaseUrl).href;
	} catch {
		return url;
	}
}
/**
* Resolve a dock iframe URL relative to the Devframe server that provided the
* dock entry. This keeps root-relative and dot-relative paths on the host
* server when an external viewer renders the hub.
*/
function resolveDockUrl(url, connection) {
	const resolved = resolveResourceUrl(url, connection);
	if (resolved !== url.trim()) return resolved;
	const value = url.trim();
	if (!value || URL_SCHEME_RE.test(value) || value.startsWith("//")) return /^localhost:\d/i.test(value) ? `http://${value}` : value;
	try {
		return new URL(`http://${value}`).href;
	} catch {
		return value;
	}
}
/** Resolve URL-backed dock icons while preserving Iconify names and data URLs. */
function resolveDockIcon(icon, connection) {
	if (typeof icon === "string") return resolveIconUrl(icon, connection);
	return {
		light: resolveIconUrl(icon.light, connection),
		dark: resolveIconUrl(icon.dark, connection)
	};
}
//#endregion
//#region src/client/frame-location.ts
/**
* Track a frame's location until the returned disposer is called. Disposing
* detaches every listener and restores any wrapped `history` method, leaving the
* embedded page as it was found.
*/
function watchFrameLocation(options) {
	const { iframe, onChange } = options;
	let lastReported = options.initial;
	let detach;
	let disposed = false;
	/**
	* The frame's window, or `null` when its location can't be read. Touching
	* `location.href` is the cross-origin probe, since it throws for a foreign
	* document, where there is nothing to observe.
	*/
	function readableWindow() {
		try {
			const win = iframe.contentWindow;
			return win && typeof win.location.href === "string" ? win : null;
		} catch {
			return null;
		}
	}
	function report() {
		const href = readableWindow()?.location.href;
		if (!href || href === "about:blank" || href === lastReported) return;
		lastReported = href;
		onChange(href);
	}
	function subscribe() {
		const win = readableWindow();
		if (!win) return;
		const listeners = [];
		win.addEventListener("popstate", report);
		win.addEventListener("hashchange", report);
		listeners.push(() => {
			win.removeEventListener("popstate", report);
			win.removeEventListener("hashchange", report);
		});
		const { navigation, history } = win;
		if (navigation) {
			navigation.addEventListener("currententrychange", report);
			listeners.push(() => navigation.removeEventListener("currententrychange", report));
		}
		if (history) {
			const originals = {
				pushState: history.pushState,
				replaceState: history.replaceState
			};
			for (const method of ["pushState", "replaceState"]) history[method] = function(...args) {
				originals[method].apply(this, args);
				report();
			};
			listeners.push(() => {
				history.pushState = originals.pushState;
				history.replaceState = originals.replaceState;
			});
		}
		detach = () => {
			for (const unsubscribe of listeners) try {
				unsubscribe();
			} catch {}
		};
	}
	function onLoad() {
		if (disposed) return;
		detach?.();
		detach = void 0;
		subscribe();
		report();
	}
	iframe.addEventListener("load", onLoad);
	subscribe();
	report();
	return () => {
		if (disposed) return;
		disposed = true;
		iframe.removeEventListener("load", onLoad);
		detach?.();
		detach = void 0;
	};
}
//#endregion
//#region src/client/frame-nav.ts
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
const FRAME_NAV_CHANNEL = HUB_EVENTS.postMessage.frameNav;
/** Protocol version. */
const FRAME_NAV_VERSION = 1;
/**
* Attach the frame-nav adapter to a mounted anchor iframe. Returns a handle
* exposing readiness/current state and a `dispose()` that removes every member
* dock it registered and detaches its listener.
*/
function attachFrameNavClient(options) {
	const { frameId, anchor, iframe, docks } = options;
	const listenTarget = options.window ?? globalThis;
	const expectedOrigin = options.origin ?? resolveOrigin(anchor.url);
	const timeoutMs = options.handshakeTimeoutMs ?? anchor.subTabs?.handshakeTimeoutMs ?? 3e3;
	const members = /* @__PURE__ */ new Map();
	let ready = false;
	let currentTabId = null;
	let disposed = false;
	let handshakeTimer;
	function post(message) {
		iframe.contentWindow?.postMessage({
			channel: FRAME_NAV_CHANNEL,
			v: 1,
			frameId,
			from: "host",
			...message
		}, expectedOrigin);
	}
	function onMessage(ev) {
		if (disposed) return;
		if (expectedOrigin !== "*" && ev.origin !== expectedOrigin) return;
		const data = ev.data;
		if (!data || data.channel !== FRAME_NAV_CHANNEL || data.v !== 1 || data.frameId !== frameId || data.from !== "frame") return;
		switch (data.type) {
			case "ready":
			case "manifest":
				markReady();
				reconcileManifest(data.tabs ?? [], data.current);
				break;
			case "navigated": onNavigated(data.tabId);
		}
	}
	function markReady() {
		ready = true;
		if (handshakeTimer !== void 0) {
			clearTimeout(handshakeTimer);
			handshakeTimer = void 0;
		}
	}
	function memberId(tabId) {
		return `${frameId}:${tabId}`;
	}
	function buildMemberEntry(tab) {
		const entry = {
			id: memberId(tab.id),
			type: "iframe",
			title: tab.title,
			icon: tab.icon ?? anchor.icon,
			frameId,
			url: tab.fallbackUrl ?? deriveFallbackUrl(anchor.url, tab.navTarget),
			navTarget: tab.navTarget
		};
		if (tab.badge !== void 0) entry.badge = tab.badge;
		if (tab.order !== void 0) entry.defaultOrder = tab.order;
		if (tab.category !== void 0) entry.category = tab.category;
		if (tab.when !== void 0) entry.when = tab.when;
		const groupId = tab.groupId ?? anchor.groupId;
		if (groupId !== void 0) entry.groupId = groupId;
		return entry;
	}
	function reconcileManifest(tabs, current) {
		const incoming = new Set(tabs.map((t) => t.id));
		for (const tab of tabs) {
			const entry = buildMemberEntry(tab);
			const existing = members.get(tab.id);
			if (existing) {
				existing.tab = tab;
				existing.handle.update(entry);
			} else {
				const record = {
					tab,
					handle: docks.register(entry)
				};
				record.off = docks.getStateById(entry.id)?.events.on("entry:activated", () => onMemberActivated(tab.id));
				members.set(tab.id, record);
			}
		}
		for (const [tabId, record] of [...members]) {
			if (incoming.has(tabId)) continue;
			record.off?.();
			record.handle.dispose();
			members.delete(tabId);
			if (currentTabId === tabId) currentTabId = null;
		}
		if (current !== void 0 && current !== currentTabId && members.has(current)) {
			currentTabId = current;
			docks.switchEntry(memberId(current));
		}
	}
	function onMemberActivated(tabId) {
		if (disposed || tabId === currentTabId) return;
		const record = members.get(tabId);
		if (!record) return;
		currentTabId = tabId;
		if (ready) post({
			type: "navigate",
			tabId,
			navTarget: record.tab.navTarget
		});
		else hardNav(record.tab);
	}
	function onNavigated(tabId) {
		if (disposed || !tabId || !members.has(tabId) || tabId === currentTabId) return;
		currentTabId = tabId;
		docks.switchEntry(memberId(tabId));
	}
	function hardNav(tab) {
		iframe.src = tab.fallbackUrl ?? deriveFallbackUrl(anchor.url, tab.navTarget);
	}
	listenTarget.addEventListener("message", onMessage);
	post({ type: "hello" });
	handshakeTimer = setTimeout(() => {
		handshakeTimer = void 0;
	}, timeoutMs);
	return {
		get ready() {
			return ready;
		},
		get currentTabId() {
			return currentTabId;
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			if (handshakeTimer !== void 0) clearTimeout(handshakeTimer);
			listenTarget.removeEventListener("message", onMessage);
			for (const record of members.values()) {
				record.off?.();
				record.handle.dispose();
			}
			members.clear();
		}
	};
}
/** Resolve the origin to lock `postMessage` to; `'*'` when unresolvable. */
function resolveOrigin(url) {
	const base = globalThis.location?.href;
	try {
		return new URL(url).origin;
	} catch {}
	if (base) try {
		return new URL(url, base).origin;
	} catch {}
	return "*";
}
/**
* Derive a deep-link/fallback URL from the anchor base + a nav target, using
* hash routing (the safest generic for SPA routers). `state` cannot ride a URL
* and is intentionally dropped here.
*/
function deriveFallbackUrl(base, navTarget) {
	const href = globalThis.location?.href;
	let url;
	try {
		url = new URL(base, href ?? "http://localhost");
	} catch {
		return base;
	}
	const path = navTarget.path.startsWith("#") ? navTarget.path.slice(1) : navTarget.path;
	let hash = `#${path}`;
	const qs = navTarget.query ? serializeNavQuery(navTarget.query) : "";
	if (qs) hash += (path.includes("?") ? "&" : "?") + qs;
	url.hash = hash;
	return url.toString();
}
/** Serialize a {@link NavTarget.query} into a URL query string. */
function serializeNavQuery(query) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) if (typeof value === "string") params.set(key, value);
	else for (const v of value) params.append(key, v);
	return params.toString();
}
//#endregion
//#region src/client/messages.ts
/**
* Build a browser-side {@link DevframeMessagesClient} that writes into the
* hub's messages subsystem over the `hub:messages:*` built-in RPCs. The handle
* returned by `add` proxies `update`/`dismiss` back through the same RPCs, so a
* dock client script reports into the very feed the server writes to.
*/
function createMessagesClient(rpc, options = {}) {
	if (rpc.connectionMeta?.backend === "static") return createLocalMessagesClient(options);
	const { call } = rpc;
	function makeHandle(entry) {
		let current = entry;
		return {
			get entry() {
				return current;
			},
			get id() {
				return current.id;
			},
			async update(patch) {
				const updated = await call("hub:messages:update", current.id, patch);
				if (updated) current = updated;
				return updated;
			},
			dismiss: () => call("hub:messages:remove", current.id)
		};
	}
	async function add(input) {
		return makeHandle(await call("hub:messages:add", {
			...options.defaults,
			...input
		}));
	}
	function levelShortcut(level) {
		return (message, extra) => add({
			...extra,
			message,
			level
		});
	}
	return {
		add,
		remove: (id) => call("hub:messages:remove", id),
		clear: () => call("hub:messages:clear"),
		info: levelShortcut("info"),
		warn: levelShortcut("warn"),
		error: levelShortcut("error"),
		success: levelShortcut("success"),
		debug: levelShortcut("debug")
	};
}
/** In-page-only writes for a static backend: same surface, no wire. */
function createLocalMessagesClient(options) {
	let nextId = 0;
	function makeEntry(input) {
		return {
			timestamp: Date.now(),
			...options.defaults,
			...input,
			id: input.id ?? `local-${++nextId}`,
			from: "browser"
		};
	}
	function makeHandle(entry) {
		let current = entry;
		return {
			get entry() {
				return current;
			},
			get id() {
				return current.id;
			},
			async update(patch) {
				current = {
					...current,
					...patch,
					id: current.id,
					from: current.from
				};
				return current;
			},
			dismiss: async () => {}
		};
	}
	const add = async (input) => makeHandle(makeEntry(input));
	function levelShortcut(level) {
		return (message, extra) => add({
			...extra,
			message,
			level
		});
	}
	return {
		add,
		remove: async () => {},
		clear: async () => {},
		info: levelShortcut("info"),
		warn: levelShortcut("warn"),
		error: levelShortcut("error"),
		success: levelShortcut("success"),
		debug: levelShortcut("debug")
	};
}
//#endregion
//#region src/client/renderers.ts
/**
* Build the {@link DockRenderersContext} shared by every hub-aware client.
* `createDevframeClientRuntime` and hub UI providers that assemble their own context
* (`@devframes/hub-ui`) both delegate here so local-first resolution, lazy
* manifest imports, and the typed mount result behave identically everywhere.
*/
function createDockRenderersContext(options) {
	const rendererMap = /* @__PURE__ */ new Map();
	for (const [type, renderer] of Object.entries(options.local ?? {})) rendererMap.set(type, renderer);
	const manifestImports = /* @__PURE__ */ new Map();
	const manifestEntry = (type) => options.manifest?.()[type];
	async function importManifestRenderer(type, script) {
		const renderer = (await import(
			/* @vite-ignore */
			/* webpackIgnore: true */
			/* turbopackIgnore: true */
			script.importFrom
))[script.importName ?? "default"];
		return typeof renderer === "function" ? renderer : void 0;
	}
	async function resolveRenderer(type) {
		const local = rendererMap.get(type);
		if (local) return local;
		const script = manifestEntry(type);
		if (!script) return void 0;
		let pending = manifestImports.get(type);
		if (!pending) {
			pending = importManifestRenderer(type, script);
			manifestImports.set(type, pending);
			pending.catch(() => manifestImports.delete(type));
		}
		const renderer = await pending;
		if (renderer && !rendererMap.has(type)) rendererMap.set(type, renderer);
		return renderer;
	}
	return {
		register(type, renderer) {
			rendererMap.set(type, renderer);
			return () => {
				if (rendererMap.get(type) === renderer) rendererMap.delete(type);
			};
		},
		get: (type) => rendererMap.get(type),
		has: (type) => rendererMap.has(type) || manifestEntry(type) !== void 0,
		async mount(entry, container) {
			let renderer;
			try {
				renderer = await resolveRenderer(entry.type);
			} catch (error) {
				console.error(`[@devframes/hub] failed to load the renderer module for dock type "${entry.type}"`, error);
				return {
					status: "load-error",
					error
				};
			}
			if (!renderer) {
				console.warn(`[@devframes/hub] no renderer registered for dock type "${entry.type}" (entry "${entry.id}")`);
				return { status: "missing-renderer" };
			}
			let instance;
			try {
				instance = await renderer({
					entry,
					container,
					context: options.context()
				});
			} catch (error) {
				console.error(`[@devframes/hub] renderer for dock type "${entry.type}" failed to mount (entry "${entry.id}")`, error);
				return {
					status: "load-error",
					error
				};
			}
			let disposed = false;
			let cleanup;
			const dispose = () => {
				if (disposed) return;
				disposed = true;
				cleanup?.();
				instance.dispose?.();
			};
			cleanup = options.onMounted?.(dispose, entry);
			return {
				status: "mounted",
				dispose
			};
		}
	};
}
//#endregion
//#region src/client/host.ts
const DOCKS_STATE_KEY = HUB_EVENTS.sharedState.docks;
const COMMANDS_STATE_KEY = HUB_EVENTS.sharedState.commands;
const USER_SETTINGS_STATE_KEY = HUB_EVENTS.sharedState.userSettings;
const DOCKS_ACTIVATE_EVENT = HUB_EVENTS.broadcast.docksActivate;
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
async function createDevframeClientRuntime(options = {}) {
	const clientType = options.clientType ?? "standalone";
	const rpc = options.rpc ?? await connectDevframe(options.connect);
	let mountedRenderers;
	const [docksState, commandsState, settings, renderersManifestState] = await Promise.all([
		rpc.sharedState.get(DOCKS_STATE_KEY, { initialValue: [] }),
		rpc.sharedState.get(COMMANDS_STATE_KEY, { initialValue: [] }),
		rpc.sharedState.get(USER_SETTINGS_STATE_KEY, { initialValue: DEFAULT_STATE_USER_SETTINGS() }),
		rpc.sharedState.get(DOCK_RENDERERS_STATE_KEY, { initialValue: {} })
	]);
	let selectedId = null;
	/** Bumped by every `switchEntry` call, so a stale one can tell it was superseded. */
	let switchRequest = 0;
	const entryToStateMap = /* @__PURE__ */ new Map();
	const clientDocks = /* @__PURE__ */ new Map();
	const frameNavAdapters = /* @__PURE__ */ new Map();
	const loadScriptsEnabled = options.loadClientScripts ?? true;
	const categoryOrder = {
		...DEFAULT_CATEGORIES_ORDER,
		...options.categoryOrder
	};
	const panel = createPanelContext(clientType);
	const docks = createDocksContext();
	const commands = createCommandsContext();
	const context = {
		rpc,
		clientType,
		panel,
		docks,
		commands,
		renderers: createRenderersContext(),
		when: { get context() {
			return {
				clientType,
				dockOpen: panel.session.open,
				paletteOpen: commands.paletteOpen,
				dockSelectedId: selectedId ?? ""
			};
		} },
		connection: {
			get status() {
				return rpc.status;
			},
			get error() {
				return rpc.connectionError;
			},
			events: rpc.events
		}
	};
	const disposers = [];
	reconcileEntries();
	disposers.push(docksState.on("updated", reconcileEntries));
	const activateHandler = (activation) => {
		if (activation?.dockId) switchEntry(activation.dockId).catch(() => {});
	};
	const existingActivate = rpc.client.definitions.get(DOCKS_ACTIVATE_EVENT);
	if (existingActivate) {
		const prev = existingActivate.handler;
		existingActivate.handler = (...args) => {
			activateHandler(args[0]);
			return prev?.(...args);
		};
	} else rpc.client.register({
		name: DOCKS_ACTIVATE_EVENT,
		type: "action",
		handler: (activation) => activateHandler(activation)
	});
	if (rpc.connectionMeta?.backend === "static" && typeof BroadcastChannel !== "undefined") {
		const activateChannel = new BroadcastChannel(HUB_EVENTS.broadcastChannel.docksActivate);
		activateChannel.onmessage = (event) => activateHandler(event.data);
		disposers.push(() => activateChannel.close());
	}
	if (getDevframeClientContext()) console.warn("[@devframes/hub] A client context is already published on this page; replacing it. Boot createDevframeClientRuntime() once per page (e.g. HTML injection combined with a manual import boots it twice).");
	setDevframeClientContext(context);
	let disposed = false;
	const loadedScripts = /* @__PURE__ */ new Map();
	if (loadScriptsEnabled) {
		loadClientScripts();
		disposers.push(docksState.on("updated", loadClientScripts));
		disposers.push(rpc.events.on(DEVFRAME_EVENTS.client.isTrustedUpdated, loadClientScripts));
	}
	return {
		context,
		dispose() {
			disposed = true;
			for (const off of disposers.splice(0)) off();
			for (const disposeAdapter of frameNavAdapters.values()) disposeAdapter();
			frameNavAdapters.clear();
			if (mountedRenderers) for (const disposeMount of [...mountedRenderers]) disposeMount();
			if (getDevframeClientContext() === context) setDevframeClientContext(void 0);
		}
	};
	function createDockEntryState(entryMeta) {
		return {
			entryMeta,
			get isActive() {
				return selectedId === entryMeta.id;
			},
			domElements: {},
			events: createEventEmitter()
		};
	}
	function maybeAttachFrameNav(meta, state) {
		if (meta.type !== "iframe") return;
		const anchor = meta;
		if (!anchor.subTabs) return;
		const frameId = anchor.frameId ?? anchor.id;
		const start = (iframe) => {
			if (frameNavAdapters.has(frameId)) return;
			const adapter = attachFrameNavClient({
				frameId,
				anchor,
				iframe,
				docks
			});
			frameNavAdapters.set(frameId, adapter.dispose);
		};
		if (state.domElements.iframe) start(state.domElements.iframe);
		state.events.on("dom:iframe:mounted", start);
	}
	function currentEntries() {
		const server = docksState.value();
		if (clientDocks.size === 0) return server;
		const merged = [];
		const seen = /* @__PURE__ */ new Set();
		for (const entry of server) {
			merged.push(clientDocks.get(entry.id) ?? entry);
			seen.add(entry.id);
		}
		for (const [id, entry] of clientDocks) if (!seen.has(id)) merged.push(entry);
		return merged;
	}
	function refreshEntries() {
		reconcileEntries();
		if (loadScriptsEnabled) loadClientScripts();
	}
	function reconcileEntries() {
		const entries = currentEntries();
		const seen = /* @__PURE__ */ new Set();
		for (const meta of entries) {
			seen.add(meta.id);
			const existing = entryToStateMap.get(meta.id);
			if (!existing) {
				const state = createDockEntryState(meta);
				entryToStateMap.set(meta.id, state);
				maybeAttachFrameNav(meta, state);
			} else if (existing.entryMeta !== meta) {
				existing.entryMeta = meta;
				existing.events.emit("entry:updated", meta);
			}
		}
		for (const id of [...entryToStateMap.keys()]) {
			if (seen.has(id)) continue;
			const removed = entryToStateMap.get(id);
			entryToStateMap.delete(id);
			const removedMeta = removed?.entryMeta;
			if (removedMeta?.type === "iframe" && removedMeta.subTabs) {
				const frameId = removedMeta.frameId ?? id;
				frameNavAdapters.get(frameId)?.();
				frameNavAdapters.delete(frameId);
			}
		}
		docks.entries = entries;
		docks.groupedEntries = groupByCategory(entries, categoryOrder);
		if (selectedId && !entryToStateMap.has(selectedId)) {
			selectedId = null;
			panel.session.selectedDockId = null;
			panel.session.selectedDockRoute = null;
		}
	}
	function createDocksContext() {
		return {
			get selectedId() {
				return selectedId;
			},
			set selectedId(id) {
				switchEntry(id).catch(() => {});
			},
			/**
			* A mirror of the session field, so a persisting host reads and writes the
			* selected iframe's route through the same context every hub UI provider uses.
			*/
			get selectedRoute() {
				return panel.session.selectedDockRoute;
			},
			set selectedRoute(route) {
				panel.session.selectedDockRoute = route;
			},
			get selected() {
				return selectedId && entryToStateMap.get(selectedId)?.entryMeta || null;
			},
			entries: [],
			entryToStateMap,
			groupedEntries: [],
			categoryOrder,
			settings,
			getStateById: (id) => entryToStateMap.get(id),
			switchEntry,
			toggleEntry: (id) => selectedId === id ? switchEntry(null) : switchEntry(id),
			register(entry, force) {
				if (clientDocks.has(entry.id) && !force) throw new Error(`[@devframes/hub] a client dock "${entry.id}" is already registered; pass force to overwrite`);
				clientDocks.set(entry.id, entry);
				refreshEntries();
				return {
					update: (patch) => {
						if (patch.id && patch.id !== entry.id) throw new Error(`[@devframes/hub] cannot change a dock id ("${entry.id}" → "${patch.id}")`);
						const existing = clientDocks.get(entry.id);
						if (!existing) throw new Error(`[@devframes/hub] client dock "${entry.id}" was removed; register it again to update`);
						clientDocks.set(entry.id, {
							...existing,
							...patch
						});
						refreshEntries();
					},
					dispose: () => {
						if (clientDocks.delete(entry.id)) refreshEntries();
					}
				};
			},
			update(entry) {
				if (!clientDocks.has(entry.id)) throw new Error(`[@devframes/hub] no client dock "${entry.id}" to update; register it first`);
				clientDocks.set(entry.id, entry);
				refreshEntries();
			}
		};
	}
	async function preparePageScript(entry) {
		if (!rpc.isTrusted) return false;
		if (entry.type === "iframe" && entry.clientScript) await setupClientScript(entry.id, entry.clientScript);
		return !disposed && rpc.isTrusted && entryToStateMap.get(entry.id)?.entryMeta === entry;
	}
	async function runActivationScript(entry) {
		if (entry.type === "action") await setupClientScript(entry.id, entry.action, false);
		else if (entry.type === "custom-render") await setupClientScript(entry.id, entry.renderer);
	}
	async function switchEntry(id) {
		const next = id ?? null;
		if (next === selectedId && entryToStateMap.get(next ?? "")?.entryMeta.type !== "action") return false;
		if (next !== null && !entryToStateMap.has(next)) return false;
		const entry = entryToStateMap.get(next ?? "")?.entryMeta;
		if (entry && loadScriptsEnabled && !rpc.isTrusted) return false;
		const request = ++switchRequest;
		if (entry?.type === "iframe" && entry.clientScript && loadScriptsEnabled && !await preparePageScript(entry)) return false;
		if (request !== switchRequest) return false;
		const previous = selectedId;
		selectedId = next;
		panel.session.selectedDockId = next;
		if (next === null || entryToStateMap.get(next)?.entryMeta.type !== "iframe") panel.session.selectedDockRoute = null;
		if (previous) entryToStateMap.get(previous)?.events.emit("entry:deactivated");
		if (next) entryToStateMap.get(next)?.events.emit("entry:activated");
		if (entry && loadScriptsEnabled) await runActivationScript(entry);
		return true;
	}
	function createCommandsContext() {
		const clientCommands = /* @__PURE__ */ new Map();
		function allCommands() {
			return [...commandsState.value(), ...clientCommands.values()];
		}
		function findCommand(commands, id) {
			for (const command of commands) {
				if (command.id === id) return command;
				const child = findCommand(command.children ?? [], id);
				if (child) return child;
			}
		}
		const ctx = {
			get commands() {
				return allCommands();
			},
			get paletteCommands() {
				return allCommands().filter((c) => c.showInPalette !== false);
			},
			register(input) {
				const list = Array.isArray(input) ? input : [input];
				for (const cmd of list) clientCommands.set(cmd.id, cmd);
				return () => {
					for (const cmd of list) clientCommands.delete(cmd.id);
				};
			},
			async execute(id, ...args) {
				const client = findCommand(clientCommands.values(), id);
				if (client?.source === "client" && client.action) return client.action(...args);
				return rpc.call("hub:commands:execute", id, ...args);
			},
			getKeybindings(id) {
				const override = settings.value().commandShortcuts?.[id];
				if (override) return override;
				return findCommand(allCommands(), id)?.keybindings ?? [];
			},
			settings,
			paletteOpen: false,
			paletteScopeId: null,
			openPalette(atCommandId) {
				ctx.paletteScopeId = atCommandId ?? null;
				ctx.paletteOpen = true;
			}
		};
		return ctx;
	}
	function createRenderersContext() {
		const mountedDisposers = /* @__PURE__ */ new Set();
		mountedRenderers = mountedDisposers;
		return createDockRenderersContext({
			context: () => context,
			...options.renderers ? { local: options.renderers } : {},
			manifest: () => renderersManifestState.value(),
			onMounted(dispose, entry) {
				mountedDisposers.add(dispose);
				const offDeactivate = entryToStateMap.get(entry.id)?.events.on("entry:deactivated", dispose);
				return () => {
					mountedDisposers.delete(dispose);
					offDeactivate?.();
				};
			}
		});
	}
	function loadClientScripts() {
		if (disposed || !rpc.isTrusted) return;
		for (const entry of currentEntries()) if (entry.type === "iframe") startEagerScript(entry.id, entry.clientScript);
		else if (entry.type === "action") startEagerScript(entry.id, entry.action);
	}
	function startEagerScript(entryId, script) {
		if (script?.eager) setupClientScript(entryId, script).catch(() => {});
	}
	/** Share eager and activation setup; explicit action invocations bypass the cache. */
	function setupClientScript(entryId, script, cache = true) {
		const key = JSON.stringify([
			entryId,
			script.importFrom,
			script.importName ?? "default"
		]);
		const existing = loadedScripts.get(key);
		if (cache && existing) return existing;
		const promise = runClientScript(entryId, script);
		if (!cache) return promise;
		loadedScripts.set(key, promise);
		promise.catch(() => {
			if (loadedScripts.get(key) === promise) loadedScripts.delete(key);
		});
		return promise;
	}
	async function runClientScript(entryId, script) {
		const specifier = resolveClientModuleSpecifier(script.importFrom, {
			resolveClientModule: options.resolveClientModule,
			template: rpc.connectionMeta?.configs?.dock?.clientModuleResolution,
			metaBaseUrl: rpc.connection?.metaBaseUrl
		});
		try {
			const fn = (await import(
				/* @vite-ignore */
				/* webpackIgnore: true */
				/* turbopackIgnore: true */
				specifier
))[script.importName ?? "default"];
			if (typeof fn !== "function") throw new Error(`[@devframes/hub] "${specifier}" exports no callable "${script.importName ?? "default"}"`);
			const current = entryToStateMap.get(entryId);
			if (!current || disposed) return;
			/** Reject instead of caching skipped setup so re-authentication can retry it. */
			if (!rpc.isTrusted) throw new Error("[@devframes/hub] RPC client is no longer trusted");
			const messages = createMessagesClient(rpc, { defaults: { category: entryId } });
			await fn({
				...context,
				current,
				messages
			});
		} catch (error) {
			console.error(`[@devframes/hub] failed to load client script for "${entryId}" from ${specifier}${clientScriptFailureHint(script.importFrom, specifier)}`, error);
			throw error;
		}
	}
}
function createPanelContext(clientType) {
	const store = {
		mode: "edge",
		width: 480,
		height: 360,
		top: 0,
		left: 0,
		position: "right",
		inactiveTimeout: 0
	};
	let open = clientType === "standalone";
	let selectedDockId = null;
	const events = createEventEmitter();
	let panelStateChangePending = false;
	function createDockPanelState() {
		const panelState = { state: open ? "open" : "closed" };
		if (selectedDockId !== null) panelState.selectedDockId = selectedDockId;
		return panelState;
	}
	let previousPanelState = createDockPanelState();
	function schedulePanelStateChange() {
		if (panelStateChangePending) return;
		panelStateChangePending = true;
		queueMicrotask(() => {
			panelStateChangePending = false;
			const panelState = createDockPanelState();
			if (panelState.state === previousPanelState.state && panelState.selectedDockId === previousPanelState.selectedDockId) return;
			previousPanelState = panelState;
			events.emit(HUB_EVENTS.client.docksPanelStateChanged, panelState);
		});
	}
	return {
		get state() {
			return createDockPanelState();
		},
		events,
		store,
		session: {
			get open() {
				return open;
			},
			set open(nextOpen) {
				if (nextOpen === open) return;
				open = nextOpen;
				schedulePanelStateChange();
			},
			get selectedDockId() {
				return selectedDockId;
			},
			set selectedDockId(nextSelectedDockId) {
				if (nextSelectedDockId === selectedDockId) return;
				selectedDockId = nextSelectedDockId;
				schedulePanelStateChange();
			},
			selectedDockRoute: null
		},
		isDragging: false,
		isResizing: false,
		get isVertical() {
			return store.position === "left" || store.position === "right";
		}
	};
}
function groupByCategory(entries, categoryOrder) {
	const groupsById = /* @__PURE__ */ new Map();
	for (const entry of entries) if (entry.type === "group") groupsById.set(entry.id, entry);
	const groups = /* @__PURE__ */ new Map();
	for (const entry of entries) {
		const resolvedGroup = entry.groupId ? groupsById.get(entry.groupId) : void 0;
		const category = resolvedGroup ? resolvedGroup.category ?? "default" : entry.category ?? "default";
		let list = groups.get(category);
		if (!list) {
			list = [];
			groups.set(category, list);
		}
		list.push(entry);
	}
	return [...groups.entries()].sort(([a], [b]) => (categoryOrder[a] ?? 0) - (categoryOrder[b] ?? 0));
}
//#endregion
//#region src/client/remote.ts
function base64UrlDecode(value) {
	const padLen = (4 - value.length % 4) % 4;
	const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLen);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new TextDecoder().decode(bytes);
}
/**
* Build an external viewer URL from an existing trusted Devframe connection.
* Returns the original URL if the connection has no auth token, does not use
* WebSockets, or has an invalid metadata URL.
*/
function buildRemoteDevframeUrl(url, connection) {
	if (!connection.authToken || connection.connectionMeta.backend !== "websocket") return url;
	let base;
	try {
		base = new URL(connection.metaBaseUrl);
	} catch {
		return url;
	}
	const websocket = resolveWsUrl(connection.connectionMeta.websocket, connection.metaBaseUrl, base);
	return buildRemoteConnectionUrl(url, {
		v: 1,
		backend: "websocket",
		websocket,
		authToken: connection.authToken,
		origin: base.origin
	});
}
function extractKeyFromFragment(hash) {
	if (!hash) return null;
	const raw = hash.startsWith("#") ? hash.slice(1) : hash;
	const queryIdx = raw.indexOf("?");
	if (queryIdx !== -1) {
		const value = new URLSearchParams(raw.slice(queryIdx + 1)).get(REMOTE_CONNECTION_KEY);
		if (value) return value;
	}
	for (const part of raw.split("&")) {
		const [k, v = ""] = part.split("=");
		if (k === REMOTE_CONNECTION_KEY) return decodeURIComponent(v);
	}
	return null;
}
function extractKeyFromQuery(search) {
	if (!search) return null;
	return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get(REMOTE_CONNECTION_KEY);
}
/**
* Parse a {@link RemoteConnectionInfo} descriptor from the current page's URL
* (or a provided URL/string). Checks the URL fragment first, then the query.
*
* Returns `null` if no descriptor is present.
* Throws if the descriptor is malformed or its schema version is unsupported.
*/
function parseRemoteConnection(input) {
	const parts = resolveUrlParts(input);
	if (!parts) return null;
	const encoded = extractKeyFromFragment(parts.hash) ?? extractKeyFromQuery(parts.search);
	if (!encoded) return null;
	let payload;
	try {
		payload = destr(base64UrlDecode(encoded), { strict: true });
	} catch (cause) {
		throw new Error("[@devframes/hub] Failed to decode remote connection descriptor.", { cause });
	}
	return validateConnectionDescriptor(payload);
}
/** Resolve the URL fragment/query to inspect, from an explicit input or `location`. */
function resolveUrlParts(input) {
	if (input === void 0) {
		if (typeof location === "undefined") return null;
		return {
			hash: location.hash,
			search: location.search
		};
	}
	try {
		const parsed = new URL(input, "http://_");
		return {
			hash: parsed.hash,
			search: parsed.search
		};
	} catch {
		if (input.startsWith("#")) return {
			hash: input,
			search: ""
		};
		if (input.startsWith("?")) return {
			hash: "",
			search: input
		};
		return null;
	}
}
/** Validate a decoded payload as a {@link RemoteConnectionInfo}, throwing on any mismatch. */
function validateConnectionDescriptor(payload) {
	if (!payload || typeof payload !== "object") throw new Error("[@devframes/hub] Remote connection descriptor must be an object.");
	const info = payload;
	if (info.v !== 1) throw new Error(`[@devframes/hub] Unsupported remote connection descriptor version: ${String(info.v)}`);
	if (info.backend !== "websocket" || typeof info.websocket !== "string" || !info.websocket) throw new Error("[@devframes/hub] Remote connection descriptor must carry a websocket URL.");
	if (typeof info.authToken !== "string" || !info.authToken) throw new Error("[@devframes/hub] Remote connection descriptor must carry an auth token.");
	if (typeof info.origin !== "string") throw new Error("[@devframes/hub] Remote connection descriptor must carry an origin.");
	return info;
}
/**
* One-liner for a hosted Devframe page: reads the connection descriptor from
* the current URL and returns a connected {@link DevframeRpcClient}.
*
* Pairs with `remote: true` on a `DevframeViewIframe` registered on the node
* side, where the hub injects the descriptor into the iframe URL.
*
* @throws if no descriptor is present in the URL.
*/
async function connectRemoteDevframe(options = {}) {
	const info = parseRemoteConnection();
	if (!info) throw new Error("[@devframes/hub] No remote connection descriptor found in the URL. Open this page through a hub-registered dock with `remote: true`.");
	return getDevframeRpcClient({
		...options,
		connectionMeta: info,
		authToken: info.authToken
	});
}
//#endregion
export { CLIENT_CONTEXT_KEY, FRAME_NAV_CHANNEL, FRAME_NAV_VERSION, attachFrameNavClient, buildRemoteDevframeUrl, clientScriptFailureHint, connectRemoteDevframe, createDevframeClientRuntime, createDockRenderersContext, createMessagesClient, getDevframeClientContext, matchLocale, parseRemoteConnection, resolveClientModuleSpecifier, resolveDockIcon, resolveDockUrl, resolveTitle, setDevframeClientContext, stripRemoteConnectionFromUrl, watchFrameLocation };
