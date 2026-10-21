import { r as defineHubRpcFunction } from "./define-Ceekw2EO.mjs";
import { n as DEFAULT_STATE_USER_SETTINGS, o as HUB_EVENTS } from "./constants-BSPQmlA1.mjs";
import { i as isBareModuleSpecifier, t as buildRemoteConnectionUrl } from "./remote-url-UClKLQ5_.mjs";
import { joinURL, withTrailingSlash } from "devframe/utils/url";
import { createEventEmitter } from "devframe/utils/events";
import { existsSync } from "node:fs";
import process from "node:process";
import { toolInputToCommandArgs } from "devframe/internal";
import { basename, dirname, isAbsolute, join, resolve } from "pathe";
import { defineDiagnostics } from "devframe/utils/nostics";
import { getInternalContext, resolveBasePath } from "devframe/node/hub-internals";
import { createHostContext, createStorage } from "devframe/node";
import { debounce } from "devframe/utils/debounce";
import { nanoid } from "devframe/utils/nanoid";
//#region src/node/diagnostics.ts
/**
* Hub-side diagnostics for docks, terminals, messages, and commands.
* Shares the `DF` prefix with devframe core; the hub reserves the
* `DF8xxx` range so the unified surface stays collision-free.
* Sub-ranges:
* DF8000-DF8099: hub context / lifecycle
* DF8100-DF8199: docks
* DF8200-DF8299: terminals
* DF8300-DF8399: messages
* DF8400-DF8499: commands
*/
const diagnostics = defineDiagnostics({
	docsBase: "https://devfra.me/errors",
	codes: {
		DF8000: {
			why: (p) => `Devframe id "${p.id}" collides with a reserved hub path, so it cannot be mounted directly under the hub base.`,
			fix: "The filenames directly under the hub base (`__connection.json`, `__ws`, `__index.json`, `__client-imports.js`, `__mcp`, `embedded.js`) are reserved for the hub protocol. Rename the devframe id, or override its mount with a non-colliding `basePath`."
		},
		DF8002: {
			why: "`initHub`/`buildHub` received both `devframes` and `context`; the two assembly modes are mutually exclusive.",
			fix: "Pass `devframes` to let it create the hub context and mount each frame itself, or pass a pre-built `context` (your host already mounted the frames), but never both."
		},
		DF8003: {
			why: "connectionMeta() was called before initHub finished initializing.",
			fix: "Await `instance.ready` (or any request through `instance.handler`) before reading `connectionMeta()`, since the WebSocket binding it describes is only known once initialization completes."
		},
		DF8004: {
			why: (p) => `Devframe id "${p.id}" is not a mountable URL segment, and the hub mounts each frame at \`<base><id>/\`.`,
			fix: "Ids become route segments, so they may only contain letters, digits, `_`, `-`, and `.`; `:` and `*` are route-pattern markers to the underlying router, and `/` would escape the segment. Set a route-safe `id` on the definition (e.g. `my_plugin` instead of `my:plugin`)."
		},
		DF8006: {
			why: (p) => `A static hub build writes each mount either under its base ("${p.base}") or as an absolute-path sibling of it, but "${p.urlBase}" is neither.`,
			fix: "buildHub maps a mount under the hub base into its `outDir`, and any other mount to the deploy root (`outDir`'s parent) by its absolute path. Give the mount an absolute base (starting with `/`) so it resolves to one of those."
		},
		DF8100: {
			why: (p) => `Dock with id "${p.id}" is already registered`,
			fix: "Use the `force` parameter to overwrite an existing registration."
		},
		DF8101: {
			why: (p) => `Cannot change the id of dock "${p.id}" to "${p.attempted}". Dock ids are immutable once registered`,
			fix: (p) => `Remove \`id\` from the patch to keep updating "${p.id}", or call register() with the full entry to add "${p.attempted}" as a new dock.`
		},
		DF8102: {
			why: (p) => `Dock with id "${p.id}" is not registered and cannot be updated`,
			fix: (p) => `Call register() to add "${p.id}" as a new dock, or check the id for typos.`
		},
		DF8103: {
			why: (p) => `Dock entry "${p.id}" cannot set groupId to its own id`,
			fix: "Point groupId at a different group entry, or omit it."
		},
		DF8104: {
			why: (p) => `Dock group "${p.id}" cannot itself belong to a group (nested groups are unsupported)`,
			fix: "Remove groupId from the group entry; nest members one level only."
		},
		DF8105: {
			why: (p) => `Devframe "${p.name}" (id "${p.id}") is already mounted on this hub`,
			fix: "Each devframe is deduplicated by id. Set `duplicationStrategy: \"duplicate\"` on the definition to let instances coexist, `\"silent\"` to drop duplicates quietly, or `\"throw\"` to surface them as errors."
		},
		DF8106: {
			why: (p) => `The host cannot serve the RPC connection meta for devframe "${p.name}" (id "${p.id}") at "${p.base}"; its \`DevframeHost\` does not implement \`mountConnectionMeta\`.`,
			fix: "Implement `mountConnectionMeta(base)` on your DevframeHost so it serves `__connection.json` at each mounted base. Without it, the devframe SPA connects only when it shares an origin with the hub UI (same-origin window inheritance); cross-origin, sandboxed, or directly-opened iframes stay disconnected. Static-snapshot hosts that bake the meta into the served files can implement it as a no-op to acknowledge this intentionally."
		},
		DF8107: {
			why: (p) => `Dock activation requested for unknown dock id "${p.id}"`,
			fix: "Pass a `dockId` that matches a registered dock entry. The activation is still broadcast, but no hub UI provider will switch to it. Ids are case-sensitive, so check for typos, and ensure the target dock is registered before activating it."
		},
		DF8108: {
			why: (p) => `A renderer module is already registered for dock type "${p.type}"`,
			fix: "Each dock type resolves to exactly one renderer module in the hub's renderer manifest. Remove the duplicate `renderers` registration, or give the second renderer its own dock type."
		},
		DF8109: {
			why: (p) => `The renderer module registered for dock type "${p.type}" does not exist at "${p.file}"`,
			fix: "Point the registration's `file` at the prebuilt browser ES module (build the renderer package first, or check the path). Registration helpers like `jsonRenderUiRenderer()` resolve the path for you."
		},
		DF8110: {
			why: (p) => `Dock type "${p.type}" is not a servable renderer-module name; the hub serves each module at \`<base>__renderers/<type>.mjs\``,
			fix: "Renderer types become URL segments, so they may only contain letters, digits, `_`, `-`, and `.`. Use a route-safe dock type (e.g. `json-render`)."
		},
		DF8111: {
			why: (p) => `Dock "${p.id}" declares the bare-specifier client script "${p.specifier}", but this host advertises no client-module resolution, and the browser cannot resolve a bare npm specifier natively, so the script will fail to load.`,
			fix: "Run under a host framework that declares `initHub({ clientModuleResolution })` (e.g. Vite's `'/@id/{specifier}'`), ship the script as a self-contained bundle served by URL, or resolve it in the hub UI provider via `createDevframeClientRuntime({ resolveClientModule })` (then disregard this warning)."
		},
		DF8200: { why: (p) => `Terminal session with id "${p.id}" already registered` },
		DF8201: { why: (p) => `Terminal session with id "${p.id}" not registered` },
		DF8202: {
			why: (p) => `Terminal session "${p.id}" does not accept input`,
			fix: "Spawn it via ctx.terminals.startPtySession() to get an interactive, writable session."
		},
		DF8203: { why: (p) => `Failed to spawn PTY session for "${p.command}": ${p.reason}` },
		DF8204: {
			why: (p) => `Terminal session "${p.id}" cannot be controlled (no lifecycle handle)`,
			fix: "Spawn it via ctx.terminals.startChildProcess() or startPtySession(); sessions added with a bare register() expose no terminate/restart handle."
		},
		DF8205: {
			why: (p) => `Terminal session "${p.id}" is not restartable`,
			fix: "It was registered with `restartable: false`; restart it through its owner's controls, or spawn it with `restartable: true` (the default) to allow in-place restarts."
		},
		DF8206: {
			why: (p) => `Terminal session "${p.id}" cannot be restarted because its output stream is already closed`,
			fix: "The session already exited (or was terminated) and its stream is spent. Drop it with `ctx.terminals.remove(session)`, then spawn a replacement via `ctx.terminals.startChildProcess()` or `ctx.terminals.startPtySession()` with a fresh id."
		},
		DF8400: { why: (p) => `Command "${p.id}" is already registered` },
		DF8401: { why: "Cannot change the id of a command. Use register() to add new commands" },
		DF8402: { why: (p) => `Command "${p.id}" is not registered` },
		DF8403: {
			why: (p) => `Command id "${p.id}" is already used by another command or child command`,
			fix: "Use globally unique command ids for top-level commands and all child commands."
		},
		DF8404: {
			why: (p) => `Command "${p.id}" declares agent exposure but has no handler`,
			fix: "Agent-exposed commands must be executable server-side. Add a `handler` to the command, or move the `agent` field to an executable child command."
		}
	}
});
//#endregion
//#region src/node/install-devframe.ts
/**
* Find the next free dock id derived from `baseId`. Returns `baseId`
* when it is unused, otherwise appends `-2`, `-3`, … until a free slot
* is found. Used by the `'duplicate'` strategy so co-existing instances
* never collide in the dock registry.
*/
function nextAvailableDockId(views, baseId) {
	if (!views.has(baseId)) return baseId;
	let n = 2;
	while (views.has(`${baseId}-${n}`)) n++;
	return `${baseId}-${n}`;
}
/**
* When a dock's `clientScript.importFrom` is an absolute filesystem path, serve
* its directory under `<base>__page-script/` and rewrite `importFrom` to that
* URL. A URL or bare specifier (not existing on disk) passes through untouched.
*/
async function resolvePageScriptClientScript(ctx, clientScript, base) {
	if (!clientScript?.importFrom) return clientScript;
	const { importFrom } = clientScript;
	if (!isAbsolute(importFrom) || !existsSync(importFrom)) return clientScript;
	const scriptBase = withTrailingSlash(joinURL(base, "__page-script"));
	ctx.views.hostStatic(scriptBase, dirname(importFrom));
	return {
		...clientScript,
		importFrom: joinURL(scriptBase, basename(importFrom))
	};
}
/**
* Serve a devframe's SPA (and the hub's connection meta) under `base`, if the
* definition ships client assets.
*/
async function serveDevframeAssets(ctx, d, id, base) {
	const clientAssets = d.clientAssets;
	if (!clientAssets) return;
	if (ctx.host.mountConnectionMeta) await ctx.host.mountConnectionMeta(base);
	else diagnostics.DF8106({
		id,
		name: d.name,
		base
	});
	ctx.views.hostStatic(base, typeof clientAssets === "string" ? resolve(clientAssets) : clientAssets, d.importMetaUrl);
}
/**
* Whether a devframe stays out of a static hub build: `capabilities.build:
* false` declares its value inherently live (a terminal, a process proxy),
* so `buildHub` never mounts it, registers its dock, or bakes its RPCs.
*/
function skippedInStaticBuild(ctx, d) {
	return ctx.mode === "build" && d.capabilities?.build === false;
}
async function prepareDevframe(ctx, d, options = {}) {
	if (skippedInStaticBuild(ctx, d)) return null;
	const strategy = d.duplicationStrategy ?? "warn";
	const isDuplicate = ctx.docks.views.has(d.id);
	if (isDuplicate && strategy !== "duplicate") {
		if (strategy === "throw") throw diagnostics.DF8105({
			id: d.id,
			name: d.name
		});
		if (strategy === "warn") diagnostics.DF8105({
			id: d.id,
			name: d.name
		});
		return null;
	}
	const id = isDuplicate ? nextAvailableDockId(ctx.docks.views, d.id) : d.id;
	const base = options.base ?? (id === d.id ? resolveBasePath(d, "hosted") : resolveBasePath({
		...d,
		id,
		basePath: void 0
	}, "hosted"));
	const dockDefaults = {
		...d.dock,
		...options.dock
	};
	const clientScript = await resolvePageScriptClientScript(ctx, dockDefaults.clientScript, base);
	if (clientScript) dockDefaults.clientScript = clientScript;
	await serveDevframeAssets(ctx, d, id, base);
	ctx.frames.push({
		id,
		base,
		title: d.name
	});
	ctx.docks.register({
		id,
		title: d.name,
		icon: d.icon,
		...dockDefaults,
		type: "iframe",
		url: base
	});
	for (const input of d.services ?? []) ctx.services.install(input, { resolveFrom: d.importMetaUrl });
	return () => Promise.resolve(d.setup(ctx));
}
/**
* Install a {@link DevframeDefinition} into a hub in one call: serve its SPA,
* register its dock, ready its services, and run `setup(ctx)`. The imperative
* counterpart to the hub's declarative `devframes` list (which batches the
* phases via {@link prepareDevframe}); use it from `configure(ctx)` or
* wherever you hold the context to plug in an extra devframe after startup.
*/
async function installDevframe(ctx, d, options = {}) {
	const run = await prepareDevframe(ctx, d, options);
	if (!run) return;
	await ctx.services.ready();
	await run();
}
//#endregion
//#region src/node/host-commands.ts
function findChildCommand(command, id) {
	for (const child of command.children ?? []) {
		if (child.id === id) return child;
		const nested = findChildCommand(child, id);
		if (nested) return nested;
	}
}
function collectCommandIds(command, ids = []) {
	ids.push(command.id);
	for (const child of command.children ?? []) collectCommandIds(child, ids);
	return ids;
}
function validateCommandIds(commands, command, ignoreTopLevelId) {
	const ids = collectCommandIds(command);
	const seen = /* @__PURE__ */ new Set();
	for (const id of ids) {
		if (seen.has(id)) throw diagnostics.DF8403({ id });
		seen.add(id);
	}
	for (const [registeredId, registered] of commands) {
		if (registeredId === ignoreTopLevelId) continue;
		const registeredIds = new Set(collectCommandIds(registered));
		for (const id of ids) if (registeredIds.has(id)) throw diagnostics.DF8403({ id });
	}
}
var DevframeCommandsHost = class {
	context;
	commands = /* @__PURE__ */ new Map();
	events = createEventEmitter();
	/**
	* Lazy agent projection: `ctx.agent` queries this provider at list/invoke
	* time, deriving tools from {@link commands} on demand, so the commands map
	* stays the single source of truth, nothing is mirrored or kept in sync.
	*/
	agentProvider;
	constructor(context) {
		this.context = context;
		this.agentProvider = context.agent?.registerToolProvider(() => this.collectAgentTools());
	}
	register(command) {
		if (this.commands.has(command.id)) throw diagnostics.DF8400({ id: command.id });
		validateCommandIds(this.commands, command);
		this.validateAgentExposure(command);
		this.commands.set(command.id, command);
		this.events.emit(HUB_EVENTS.bus.commandsRegistered, this.toSerializable(command));
		this.agentProvider?.notifyChanged();
		return {
			id: command.id,
			update: (patch) => {
				if ("id" in patch) throw diagnostics.DF8401();
				const existing = this.commands.get(command.id);
				if (!existing) throw diagnostics.DF8402({ id: command.id });
				const next = {
					...existing,
					...patch,
					id: existing.id
				};
				validateCommandIds(this.commands, next, existing.id);
				this.validateAgentExposure(next);
				Object.assign(existing, patch);
				this.events.emit(HUB_EVENTS.bus.commandsRegistered, this.toSerializable(existing));
				this.agentProvider?.notifyChanged();
			},
			unregister: () => this.unregister(command.id)
		};
	}
	unregister(id) {
		const deleted = this.commands.delete(id);
		if (deleted) {
			this.events.emit(HUB_EVENTS.bus.commandsUnregistered, id);
			this.agentProvider?.notifyChanged();
		}
		return deleted;
	}
	async execute(id, ...args) {
		const found = this.findCommand(id);
		if (!found) throw diagnostics.DF8402({ id });
		if (!found.handler) throw new Error(`Command "${id}" has no handler (group-only command)`);
		return found.handler(...args);
	}
	list() {
		return Array.from(this.commands.values()).map((cmd) => this.toSerializable(cmd));
	}
	findCommand(id) {
		const topLevel = this.commands.get(id);
		if (topLevel) return topLevel;
		for (const cmd of this.commands.values()) {
			const child = findChildCommand(cmd, id);
			if (child) return child;
		}
	}
	toSerializable(cmd) {
		const { handler: _, agent: __, children, ...rest } = cmd;
		return {
			...rest,
			source: "server",
			...children ? { children: children.map((c) => this.toSerializable(c)) } : {}
		};
	}
	/** Reject `agent` on handler-less commands anywhere in the tree, up front. */
	validateAgentExposure(command) {
		if (command.agent && !command.handler) throw diagnostics.DF8404({ id: command.id });
		for (const child of command.children ?? []) this.validateAgentExposure(child);
	}
	/**
	* Derive the agent-tool projection of the current command trees: every
	* agent-flagged, handler-bearing command (children included) becomes a
	* callable tool. Queried lazily by the provider registered in the
	* constructor. `when` clauses evaluate client-side only and are not
	* enforced here; opting in a `when`-gated command is a deliberate author
	* decision (documented on `DevframeCommandAgentOptions`).
	*/
	collectAgentTools() {
		const tools = [];
		const walk = (command) => {
			const agent = command.agent;
			if (agent && command.handler) tools.push({
				id: command.id,
				title: agent.title ?? command.title,
				description: agent.description,
				safety: agent.safety ?? "action",
				tags: agent.tags,
				/** The agent host derives the tool's JSON-Schema input from these. */
				args: agent.args,
				/**
				* A command handler's positional parameters come solely from its
				* declared `agent.args` schemas; undeclared payload is dropped.
				*/
				handler: async (args) => this.execute(command.id, ...toolInputToCommandArgs(args, agent.args?.length))
			});
			for (const child of command.children ?? []) walk(child);
		};
		for (const command of this.commands.values()) walk(command);
		return tools;
	}
};
//#endregion
//#region src/node/host-docks.ts
function normaliseRemoteOptions(remote) {
	const opts = remote === true ? {} : remote;
	return {
		transport: opts.transport ?? "fragment",
		originLock: opts.originLock ?? true
	};
}
var DevframeDocksHost = class {
	context;
	views = /* @__PURE__ */ new Map();
	events = createEventEmitter();
	userSettings = void 0;
	/** Dock-id → allocated remote token + resolved options. */
	remoteDocks = /* @__PURE__ */ new Map();
	constructor(context) {
		this.context = context;
	}
	async init() {
		this.userSettings = await this.context.rpc.sharedState.get(HUB_EVENTS.sharedState.userSettings, { sharedState: createStorage({
			/** Personal dock layout/preferences: per-checkout private state. */
			filepath: join(this.context.host.getStorageDir("project"), "settings.json"),
			initialValue: DEFAULT_STATE_USER_SETTINGS()
		}) });
	}
	values() {
		return Array.from(this.views.values(), (view) => this.projectView(view));
	}
	projectView(view) {
		if (view.type !== "iframe" || !view.remote) return view;
		const record = this.remoteDocks.get(view.id);
		const endpoint = getInternalContext(this.context).wsEndpoint;
		if (!record || !endpoint) return view;
		const payload = {
			v: 1,
			backend: "websocket",
			websocket: endpoint.url,
			authToken: record.token,
			origin: this.resolveDevServerOrigin()
		};
		return {
			...view,
			url: buildRemoteConnectionUrl(view.url, payload, record.options.transport)
		};
	}
	resolveDevServerOrigin() {
		return this.context.host.resolveOrigin();
	}
	register(view, force) {
		if (this.views.has(view.id) && !force) throw diagnostics.DF8100({ id: view.id });
		this.validateGroupMembership(view);
		this.warnUnresolvableClientScript(view);
		this.prepareRemoteRegistration(view);
		this.views.set(view.id, view);
		this.events.emit(HUB_EVENTS.bus.docksEntryUpdated, view);
		return { update: (patch) => {
			if (patch.id && patch.id !== view.id) throw diagnostics.DF8101({
				id: view.id,
				attempted: patch.id
			});
			this.update({
				...this.views.get(view.id),
				...patch
			});
		} };
	}
	update(view) {
		if (!this.views.has(view.id)) throw diagnostics.DF8102({ id: view.id });
		this.validateGroupMembership(view);
		this.prepareRemoteRegistration(view);
		this.views.set(view.id, view);
		this.events.emit(HUB_EVENTS.bus.docksEntryUpdated, view);
	}
	activate(dockId, params) {
		if (!this.views.has(dockId)) diagnostics.DF8107({ id: dockId });
		this.events.emit(HUB_EVENTS.bus.docksActivate, {
			dockId,
			params
		});
	}
	/**
	* Warn (don't throw, since a client-runtime `resolveClientModule` override may still cover
	* it) when a dock declares a **bare-specifier** client script on a host
	* that advertises no `staticConfig.dock.clientModuleResolution`: the
	* browser cannot resolve a bare npm specifier natively, so the script is
	* doomed to fail there.
	*/
	warnUnresolvableClientScript(view) {
		if (this.context.staticConfig?.dock?.clientModuleResolution) return;
		const script = view.clientScript ?? view.action ?? view.renderer;
		if (script?.importFrom && isBareModuleSpecifier(script.importFrom)) diagnostics.DF8111({
			id: view.id,
			specifier: script.importFrom
		});
	}
	validateGroupMembership(view) {
		if (view.groupId === void 0) return;
		if (view.groupId === view.id) throw diagnostics.DF8103({ id: view.id });
		if (view.type === "group") throw diagnostics.DF8104({ id: view.id });
	}
	prepareRemoteRegistration(view) {
		const internal = getInternalContext(this.context);
		internal.revokeRemoteTokensForDock(view.id);
		this.remoteDocks.delete(view.id);
		if (view.type !== "iframe" || !view.remote) return;
		const options = normaliseRemoteOptions(view.remote);
		let dockOrigin;
		try {
			dockOrigin = new URL(view.url).origin;
		} catch {
			dockOrigin = this.resolveDevServerOrigin();
		}
		const token = internal.allocateRemoteToken(view.id, dockOrigin, options.originLock);
		this.remoteDocks.set(view.id, {
			token,
			options
		});
	}
};
//#endregion
//#region src/node/host-messages.ts
const MAX_ENTRIES = 1e3;
const MAX_REMOVALS = 1e3;
var DevframeMessagesHost = class {
	context;
	entries = /* @__PURE__ */ new Map();
	events = createEventEmitter();
	/** Tracks when each entry was last added or updated (monotonic) */
	lastModified = /* @__PURE__ */ new Map();
	/** Tracks recently removed entry IDs with their removal time */
	removals = [];
	_autoDeleteTimers = /* @__PURE__ */ new Map();
	_clock = 0;
	/**
	* The tick of the newest removal record dropped from the capped
	* `removals` log; cursors older than this can't get a reliable delta
	* and fall back to a full snapshot in {@link listSince}.
	*/
	_removalsTrimmedAt = 0;
	_tick() {
		return ++this._clock;
	}
	_recordRemoval(id, time) {
		this.removals.push({
			id,
			time
		});
		if (this.removals.length > MAX_REMOVALS) {
			const dropped = this.removals.splice(0, this.removals.length - MAX_REMOVALS);
			this._removalsTrimmedAt = dropped[dropped.length - 1].time;
		}
	}
	constructor(context) {
		this.context = context;
	}
	async add(input) {
		if (input.id && this.entries.has(input.id)) {
			await this.update(input.id, input);
			return this._createHandle(input.id);
		}
		const entry = {
			...input,
			id: input.id ?? nanoid(),
			timestamp: input.timestamp ?? Date.now(),
			from: input.from ?? "server"
		};
		if (this.entries.size >= MAX_ENTRIES) {
			const oldest = this.entries.keys().next().value;
			await this.remove(oldest);
		}
		this.entries.set(entry.id, entry);
		this.lastModified.set(entry.id, this._tick());
		this.events.emit(HUB_EVENTS.bus.messagesAdded, entry);
		if (entry.autoDelete) this._autoDeleteTimers.set(entry.id, setTimeout(() => {
			this.remove(entry.id);
		}, entry.autoDelete));
		return this._createHandle(entry.id);
	}
	async update(id, patch) {
		const existing = this.entries.get(id);
		if (!existing) return void 0;
		const updated = {
			...existing,
			...patch,
			id: existing.id,
			from: existing.from,
			timestamp: existing.timestamp
		};
		this.entries.set(id, updated);
		this.lastModified.set(id, this._tick());
		this.events.emit(HUB_EVENTS.bus.messagesUpdated, updated);
		if (patch.autoDelete !== void 0) {
			const timer = this._autoDeleteTimers.get(id);
			if (timer) {
				clearTimeout(timer);
				this._autoDeleteTimers.delete(id);
			}
			if (patch.autoDelete) this._autoDeleteTimers.set(id, setTimeout(() => {
				this.remove(id);
			}, patch.autoDelete));
		}
		return updated;
	}
	async remove(id) {
		const timer = this._autoDeleteTimers.get(id);
		if (timer) {
			clearTimeout(timer);
			this._autoDeleteTimers.delete(id);
		}
		this.entries.delete(id);
		this.lastModified.delete(id);
		this._recordRemoval(id, this._tick());
		this.events.emit(HUB_EVENTS.bus.messagesRemoved, id);
	}
	info(message, extra) {
		return this.add({
			...extra,
			message,
			level: "info"
		});
	}
	warn(message, extra) {
		return this.add({
			...extra,
			message,
			level: "warn"
		});
	}
	error(message, extra) {
		return this.add({
			...extra,
			message,
			level: "error"
		});
	}
	success(message, extra) {
		return this.add({
			...extra,
			message,
			level: "success"
		});
	}
	debug(message, extra) {
		return this.add({
			...extra,
			message,
			level: "debug"
		});
	}
	async clear() {
		for (const timer of this._autoDeleteTimers.values()) clearTimeout(timer);
		this._autoDeleteTimers.clear();
		const tick = this._tick();
		for (const id of this.entries.keys()) this._recordRemoval(id, tick);
		this.entries.clear();
		this.lastModified.clear();
		this.events.emit(HUB_EVENTS.bus.messagesCleared);
	}
	listSince(since) {
		const version = this._clock;
		if (since == null || since < this._removalsTrimmedAt || since > version) return {
			entries: Array.from(this.entries.values()),
			removedIds: [],
			version,
			full: true
		};
		const entries = [];
		for (const [id, entry] of this.entries) {
			const mod = this.lastModified.get(id);
			if (mod != null && mod > since) entries.push(entry);
		}
		const removedIds = [];
		for (const removal of this.removals) if (removal.time > since) removedIds.push(removal.id);
		return {
			entries,
			removedIds,
			version,
			full: false
		};
	}
	_createHandle(id) {
		const host = this;
		return {
			get entry() {
				return host.entries.get(id);
			},
			get id() {
				return id;
			},
			update: (patch) => host.update(id, patch),
			dismiss: () => host.remove(id)
		};
	}
};
//#endregion
//#region src/node/host-terminals.ts
/**
* Channel name used for terminal stream output. Stable, well-known so
* hub-aware clients can subscribe by name.
*/
const TERMINAL_STREAM_CHANNEL = HUB_EVENTS.stream.terminals;
const TERMINAL_REPLAY_WINDOW = 1e3;
/** Max chunks retained in the per-session scrollback buffer (bounded like the replay window). */
const TERMINAL_BUFFER_LIMIT = 1e3;
/** TERM handed to spawned PTYs; also used to reject fallback process labels. */
const PTY_TERM_NAME = "xterm-256color";
/**
* Kill a `startChildProcess()` run together with everything it spawned.
*
* On Windows, tinyexec runs anything that isn't a `.exe`/`.com` - including
* the `node_modules/.bin/*.cmd` shims package managers generate - through
* `cmd.exe /d /s /c`, so the pid held here is the wrapper's. Killing a process
* on Windows doesn't reach its descendants, so `cp.kill()` alone would leave
* the real program running (and holding its ports). `taskkill /T /F` ends the
* whole tree; `cp.kill()` stays the fallback and the POSIX path.
*/
async function killProcessTree(cp) {
	const child = cp.process;
	const pid = child?.pid;
	if (process.platform !== "win32" || !child || pid === void 0 || child.exitCode !== null || child.signalCode !== null) {
		cp.kill();
		return;
	}
	const { exec } = await import("tinyexec");
	try {
		const { exitCode } = await exec("taskkill", [
			"/pid",
			String(pid),
			"/T",
			"/F"
		]);
		if (exitCode === 0) return;
	} catch {}
	cp.kill();
}
var DevframeTerminalsHost = class {
	context;
	sessions = /* @__PURE__ */ new Map();
	events = createEventEmitter();
	_boundStreams = /* @__PURE__ */ new Map();
	_channel;
	constructor(context) {
		this.context = context;
	}
	/**
	* Lazily acquire the streaming channel, since `context.rpc` isn't assigned
	* until after every host is constructed, so we can't grab it in the
	* constructor.
	*/
	getStreamingChannel() {
		if (this._channel) return this._channel;
		if (!this.context.rpc?.streaming) return void 0;
		this._channel = this.context.rpc.streaming.create(TERMINAL_STREAM_CHANNEL, { replayWindow: TERMINAL_REPLAY_WINDOW });
		return this._channel;
	}
	/**
	* Per-run stream lifecycle shared by the child-process and PTY paths: guards
	* the single-close/error transition and keeps the session's `status` in step
	* with the process lifecycle (a hub-aware client sees `running` →
	* `stopped`/`error` instead of a value frozen at spawn time).
	*/
	createStreamLifecycle() {
		const state = { streamClosed: false };
		const markStatus = (next) => {
			const session = state.session;
			if (session.status === next) return;
			session.status = next;
			this.events.emit(HUB_EVENTS.bus.terminalsSessionUpdated, session);
		};
		const closeStream = () => {
			if (state.streamClosed) return;
			state.streamClosed = true;
			try {
				state.controller?.close();
			} catch {}
		};
		const errorStream = (error) => {
			if (state.streamClosed) return;
			state.streamClosed = true;
			try {
				state.controller?.error(error);
			} catch {}
		};
		return {
			state,
			markStatus,
			closeStream,
			errorStream
		};
	}
	register(session) {
		if (this.sessions.has(session.id)) throw diagnostics.DF8200({ id: session.id });
		this.sessions.set(session.id, session);
		this.bindStream(session);
		this.events.emit(HUB_EVENTS.bus.terminalsSessionUpdated, session);
		return session;
	}
	update(patch) {
		if (!this.sessions.has(patch.id)) throw diagnostics.DF8201({ id: patch.id });
		const session = this.sessions.get(patch.id);
		Object.assign(session, patch);
		this.sessions.set(patch.id, session);
		this.bindStream(session);
		this.events.emit(HUB_EVENTS.bus.terminalsSessionUpdated, session);
	}
	remove(session) {
		this._boundStreams.get(session.id)?.dispose();
		this.sessions.delete(session.id);
		this.events.emit(HUB_EVENTS.bus.terminalsSessionUpdated, session);
		this._boundStreams.delete(session.id);
	}
	/** Drain a session's output stream into its scrollback buffer and streaming sink. */
	async pumpStream(reader, sessionBuffer, sink, isDisposed) {
		try {
			while (!isDisposed()) {
				const result = await reader.read();
				if (isDisposed() || result.done) break;
				sessionBuffer.push(result.value);
				if (sessionBuffer.length === 1001) sessionBuffer.shift();
				else if (sessionBuffer.length > TERMINAL_BUFFER_LIMIT) sessionBuffer.splice(0, sessionBuffer.length - TERMINAL_BUFFER_LIMIT);
				sink?.write(result.value);
			}
			if (!isDisposed() && sink && !sink.closed) sink.close();
		} catch (error) {
			if (!isDisposed() && sink && !sink.closed) sink.error(error);
		} finally {
			try {
				reader.releaseLock();
			} catch {}
		}
	}
	bindStream(session) {
		if (this._boundStreams.has(session.id) && this._boundStreams.get(session.id)?.stream === session.stream) return;
		this._boundStreams.get(session.id)?.dispose();
		this._boundStreams.delete(session.id);
		if (!session.stream) return;
		session.buffer ||= [];
		const sessionBuffer = session.buffer;
		const sink = this.getStreamingChannel()?.start({ id: session.id });
		const reader = session.stream.getReader();
		let disposed = false;
		this.pumpStream(reader, sessionBuffer, sink, () => disposed);
		this._boundStreams.set(session.id, {
			dispose: () => {
				disposed = true;
				reader.cancel("terminal stream disposed").catch(() => {});
				if (sink && !sink.closed) sink.close();
			},
			stream: session.stream
		});
	}
	async startChildProcess(executeOptions, terminal) {
		if (this.sessions.has(terminal.id)) throw diagnostics.DF8200({ id: terminal.id });
		const { exec } = await import("tinyexec");
		const { state, markStatus, closeStream, errorStream } = this.createStreamLifecycle();
		let cp;
		let currentResult;
		let runId = 0;
		const hostKilled = /* @__PURE__ */ new WeakSet();
		const killRun = (target) => {
			if (!target) return Promise.resolve();
			hostKilled.add(target);
			return killProcessTree(target);
		};
		const stream = new ReadableStream({
			start(_controller) {
				state.controller = _controller;
			},
			cancel() {
				const target = cp;
				cp = void 0;
				closeStream();
				return killRun(target);
			}
		});
		function createChildProcess() {
			const currentRun = ++runId;
			let runErrored = false;
			const cp = exec(executeOptions.command, executeOptions.args || [], { nodeOptions: {
				env: {
					COLORS: "true",
					FORCE_COLOR: "true",
					...executeOptions.env || {}
				},
				cwd: executeOptions.cwd ?? process.cwd(),
				stdio: "pipe"
			} });
			const stdoutChunks = [];
			const stderrChunks = [];
			let settled = false;
			let resolveOutput;
			const outputPromise = new Promise((resolve) => {
				resolveOutput = resolve;
			});
			const settle = (exitCode) => {
				if (settled || currentRun !== runId) return;
				settled = true;
				resolveOutput({
					stdout: stdoutChunks.join(""),
					stderr: stderrChunks.join(""),
					exitCode
				});
			};
			cp.process?.stdout?.on("data", (chunk) => {
				if (currentRun !== runId) return;
				const text = chunk.toString();
				stdoutChunks.push(text);
				if (!state.streamClosed) state.controller?.enqueue(text);
			});
			cp.process?.stderr?.on("data", (chunk) => {
				if (currentRun !== runId) return;
				const text = chunk.toString();
				stderrChunks.push(text);
				if (!state.streamClosed) state.controller?.enqueue(text);
			});
			cp.process?.once("error", (error) => {
				if (currentRun !== runId) return;
				runErrored = true;
				settle(cp.process?.exitCode ?? void 0);
				errorStream(error);
				markStatus("error");
			});
			cp.process?.once("close", (code) => {
				const killed = hostKilled.has(cp);
				settle(killed ? void 0 : code ?? void 0);
				if (currentRun !== runId) return;
				closeStream();
				if (!runErrored) markStatus(!killed && typeof code === "number" && code !== 0 ? "error" : "stopped");
			});
			currentResult = {
				get pid() {
					return cp.process?.pid;
				},
				get exitCode() {
					return hostKilled.has(cp) ? void 0 : cp.process?.exitCode ?? void 0;
				},
				get killed() {
					return hostKilled.has(cp) || cp.process?.killed === true;
				},
				kill: (signal) => cp.kill(signal),
				then: (onfulfilled, onrejected) => outputPromise.then(onfulfilled, onrejected)
			};
			return cp;
		}
		cp = createChildProcess();
		const restart = async () => {
			if (state.streamClosed) throw diagnostics.DF8206({ id: terminal.id });
			await killRun(cp);
			cp = createChildProcess();
			markStatus("running");
		};
		const terminate = async () => {
			const target = cp;
			cp = void 0;
			await killRun(target);
			closeStream();
			markStatus("stopped");
		};
		const session = {
			...terminal,
			status: "running",
			stream,
			type: "child-process",
			executeOptions,
			getChildProcess: () => cp?.process,
			getResult: () => currentResult,
			terminate,
			restart
		};
		state.session = session;
		this.register(session);
		return Promise.resolve(session);
	}
	async startPtySession(executeOptions, terminal) {
		if (this.sessions.has(terminal.id)) throw diagnostics.DF8200({ id: terminal.id });
		const { spawn } = await import("zigpty");
		const cols = executeOptions.cols ?? 80;
		const rows = executeOptions.rows ?? 24;
		const { state, markStatus, closeStream, errorStream } = this.createStreamLifecycle();
		let pty;
		let currentResult;
		let killCurrentRun;
		let runId = 0;
		const stream = new ReadableStream({
			start(_controller) {
				state.controller = _controller;
			},
			cancel() {
				killCurrentRun?.();
				pty = void 0;
				closeStream();
			}
		});
		const spawnPty = () => {
			const currentRun = ++runId;
			const ptyProcess = spawn(executeOptions.command, executeOptions.args ?? [], {
				name: PTY_TERM_NAME,
				cols,
				rows,
				cwd: executeOptions.cwd ?? process.cwd(),
				env: {
					...process.env,
					TERM: PTY_TERM_NAME,
					COLORTERM: "truecolor",
					FORCE_COLOR: "1",
					...executeOptions.env ?? {}
				}
			});
			const outputChunks = [];
			let killed = false;
			let settled = false;
			let settledExitCode;
			let resolveOutput;
			const outputPromise = new Promise((resolve) => {
				resolveOutput = resolve;
			});
			const settle = (exitCode, signal) => {
				if (settled) return;
				settled = true;
				killed ||= signal !== 0;
				settledExitCode = killed ? void 0 : exitCode;
				resolveOutput({
					output: outputChunks.join(""),
					exitCode: settledExitCode,
					signal: signal === 0 ? void 0 : signal
				});
			};
			ptyProcess.onData((data) => {
				const text = typeof data === "string" ? data : data.toString("utf8");
				outputChunks.push(text);
				if (!state.streamClosed && currentRun === runId) state.controller?.enqueue(text);
			});
			ptyProcess.onExit(({ exitCode, signal }) => {
				settle(exitCode, signal);
				if (currentRun !== runId) return;
				closeStream();
				/**
				* Killed runs and clean exits are stopped. Only a non-killed non-zero exit
				* code is a crash, matching the child-process path.
				*/
				markStatus(!killed && exitCode !== 0 ? "error" : "stopped");
			});
			currentResult = {
				get pid() {
					return ptyProcess.pid;
				},
				get exitCode() {
					return killed ? void 0 : ptyProcess.exitCode ?? settledExitCode;
				},
				get killed() {
					return killed;
				},
				then: (onfulfilled, onrejected) => outputPromise.then(onfulfilled, onrejected)
			};
			killCurrentRun = () => {
				if (ptyProcess.exitCode !== null) return;
				killed = true;
				ptyProcess.kill();
			};
			return ptyProcess;
		};
		try {
			pty = spawnPty();
		} catch (error) {
			errorStream(error);
			throw diagnostics.DF8203({
				command: executeOptions.command,
				reason: error instanceof Error ? error.message : String(error)
			});
		}
		const session = {
			...terminal,
			status: "running",
			interactive: true,
			stream,
			type: "pty",
			executeOptions,
			write: (data) => {
				try {
					pty?.write(data);
				} catch {}
			},
			resize: (nextCols, nextRows) => {
				try {
					pty?.resize(Math.max(1, nextCols), Math.max(1, nextRows));
				} catch {}
			},
			getProcessName: () => {
				try {
					const name = pty?.process;
					return name && name !== PTY_TERM_NAME ? name : void 0;
				} catch {
					return;
				}
			},
			getResult: () => currentResult,
			terminate: async () => {
				killCurrentRun?.();
				pty = void 0;
				closeStream();
				markStatus("stopped");
			},
			restart: async () => {
				if (state.streamClosed) throw diagnostics.DF8206({ id: terminal.id });
				killCurrentRun?.();
				killCurrentRun = void 0;
				pty = void 0;
				try {
					pty = spawnPty();
				} catch (error) {
					markStatus("error");
					throw diagnostics.DF8203({
						command: executeOptions.command,
						reason: error instanceof Error ? error.message : String(error)
					});
				}
				markStatus("running");
			}
		};
		state.session = session;
		this.register(session);
		return session;
	}
};
//#endregion
//#region src/node/rpc-builtins.ts
/**
* Resolve an interactive (PTY) terminal session by id, or throw. Sessions
* spawned via `startChildProcess` are output-only and are rejected here.
*/
function resolveInteractiveSession(sessions, id) {
	const session = sessions.get(id);
	if (!session) throw diagnostics.DF8201({ id });
	if (typeof session.write !== "function") throw diagnostics.DF8202({ id });
	return session;
}
/**
* Resolve a session that can be terminated/restarted (spawned via
* `startChildProcess` or `startPtySession`), or throw. Sessions added with a
* bare `register()` carry no lifecycle handle and are rejected.
*/
function resolveControllableSession(sessions, id) {
	const session = sessions.get(id);
	if (!session) throw diagnostics.DF8201({ id });
	if (typeof session.terminate !== "function") throw diagnostics.DF8204({ id });
	return session;
}
/**
* `hub:commands:execute`: Invoke a registered server command by id. The
* arguments after `id` are forwarded to the command's `handler(...)`.
* Returns whatever the handler returns.
*
* Pairs with the `devframe:commands` shared state: clients read the list
* from the shared state and dispatch by id via this RPC.
*/
const hubCommandsExecute = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.commandsExecute,
	type: "action",
	setup: (context) => ({ async handler(id, ...args) {
		return context.commands.execute(id, ...args);
	} })
});
/**
* `hub:messages:add`: Add a message from a browser client into the hub's
* messages subsystem. Marked `from: 'browser'`. Returns the serializable
* entry (the mutation handle stays server-side).
*
* Pairs with the client-side {@link import('../client').createDevframeClientRuntime}
* context, whose `messages` client dispatches through these built-ins so a
* dock client script can report into the same feed the server writes to.
*/
const hubMessagesAdd = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.messagesAdd,
	type: "action",
	jsonSerializable: true,
	setup: (context) => ({ async handler(input) {
		return (await context.messages.add({
			...input,
			from: "browser"
		})).entry;
	} })
});
/** `hub:messages:update`: Patch a message by id; returns the updated entry (or `undefined`). */
const hubMessagesUpdate = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.messagesUpdate,
	type: "action",
	jsonSerializable: true,
	setup: (context) => ({ async handler(id, patch) {
		return context.messages.update(id, patch);
	} })
});
/** `hub:messages:remove`: Remove a message by id. */
const hubMessagesRemove = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.messagesRemove,
	type: "action",
	setup: (context) => ({ async handler(id) {
		await context.messages.remove(id);
	} })
});
/** `hub:messages:clear`: Remove every message. */
const hubMessagesClear = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.messagesClear,
	type: "action",
	setup: (context) => ({ async handler() {
		await context.messages.clear();
	} })
});
/**
* `hub:terminals:write`: Send input to an interactive PTY session spawned
* via `ctx.terminals.startPtySession`. Lets a hub-aware terminal UI (e.g. the
* terminals plugin) drive a session owned by another plugin.
*/
const hubTerminalsWrite = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.terminalsWrite,
	type: "action",
	setup: (context) => ({ async handler(id, data) {
		resolveInteractiveSession(context.terminals.sessions, id).write(data);
	} })
});
/** `hub:terminals:resize`: Resize an interactive PTY session by id. */
const hubTerminalsResize = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.terminalsResize,
	type: "action",
	setup: (context) => ({ async handler(id, cols, rows) {
		resolveInteractiveSession(context.terminals.sessions, id).resize(cols, rows);
	} })
});
/**
* `hub:terminals:terminate`: Kill a session's process while keeping the
* session registered (its output/scrollback stays). Works for both read-only
* child-process and interactive PTY sessions, letting a hub-aware terminal UI
* force-kill a session owned by another plugin.
*/
const hubTerminalsTerminate = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.terminalsTerminate,
	type: "action",
	setup: (context) => ({ async handler(id) {
		await resolveControllableSession(context.terminals.sessions, id).terminate();
	} })
});
/**
* `hub:terminals:restart`: Re-run a session's command in place. Rejected for
* sessions registered with `restartable: false`, whose lifecycle is owned
* elsewhere.
*/
const hubTerminalsRestart = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.terminalsRestart,
	type: "action",
	setup: (context) => ({ async handler(id) {
		const session = resolveControllableSession(context.terminals.sessions, id);
		if (session.restartable === false) throw diagnostics.DF8205({ id });
		await session.restart();
	} })
});
/**
* `hub:terminals:remove`: Kill a session's process (when it still owns one)
* and drop it from the registry, disposing its output stream. Lets a hub-aware
* terminal UI discard a stopped aggregated session.
*/
const hubTerminalsRemove = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.terminalsRemove,
	type: "action",
	setup: (context) => ({ async handler(id) {
		const session = context.terminals.sessions.get(id);
		if (!session) throw diagnostics.DF8201({ id });
		const controllable = session;
		if (typeof controllable.terminate === "function") await controllable.terminate();
		context.terminals.remove(session);
	} })
});
/**
* `hub:docks:activate`: Ask the active viewer to switch its focused dock to
* `dockId`, optionally carrying `params` for the target dock to interpret
* (e.g. `{ sessionId }` for the terminals dock to focus a session).
*
* Any connected client may call it, which is the point: a mounted devframe
* running in its own iframe (on its own RPC client) can steer the host shell's
* dock selection, client-local state it otherwise can't reach. The hub
* broadcasts the request live to connected clients (the host shell switches)
* and mirrors it into the `devframe:docks:active` shared state (a dock that
* mounts in response still converges on it).
*/
const hubDocksActivate = defineHubRpcFunction({
	name: HUB_EVENTS.rpc.docksActivate,
	type: "action",
	setup: (context) => ({ async handler(input) {
		context.docks.activate(input.dockId, input.params);
	} })
});
/**
* Framework-neutral RPC declarations auto-registered by
* {@link createHubContext}. Provide additional RPCs by passing your own
* array via `CreateHubContextOptions.builtinRpcDeclarations`; the hub's
* list is prepended automatically.
*/
const builtinHubRpcDeclarations = [
	hubCommandsExecute,
	hubDocksActivate,
	hubMessagesAdd,
	hubMessagesUpdate,
	hubMessagesRemove,
	hubMessagesClear,
	hubTerminalsWrite,
	hubTerminalsResize,
	hubTerminalsTerminate,
	hubTerminalsRestart,
	hubTerminalsRemove
];
//#endregion
//#region src/node/context.ts
/**
* Create a hub-level node context: wraps devframe's `createHostContext`,
* attaches the hub hosts (`docks`, `terminals`, `messages`, `commands`),
* registers the hub's built-in RPC commands, and wires the shared-state
* synchronization that powers a hub-aware client UI.
*/
async function createHubContext(options) {
	const context = await createHostContext({
		...options,
		builtinRpcDeclarations: [...builtinHubRpcDeclarations, ...options.builtinRpcDeclarations ?? []]
	});
	const docks = new DevframeDocksHost(context);
	const terminals = new DevframeTerminalsHost(context);
	const messages = new DevframeMessagesHost(context);
	const commands = new DevframeCommandsHost(context);
	context.docks = docks;
	context.terminals = terminals;
	context.messages = messages;
	context.commands = commands;
	context.frames = [];
	context.install = (devframe, options) => installDevframe(context, devframe, options);
	await docks.init();
	const debounceMs = options.mode === "build" ? 0 : 10;
	const docksSharedState = await context.rpc.sharedState.get(HUB_EVENTS.sharedState.docks, { initialValue: [] });
	const refreshDocks = debounce(() => {
		docksSharedState.mutate(() => docks.values());
	}, debounceMs);
	docks.events.on(HUB_EVENTS.bus.docksEntryUpdated, refreshDocks);
	getInternalContext(context).onWsEndpointChange(refreshDocks);
	docksSharedState.mutate(() => docks.values());
	const activeDockSharedState = await context.rpc.sharedState.get(HUB_EVENTS.sharedState.docksActive, { initialValue: { activation: null } });
	docks.events.on(HUB_EVENTS.bus.docksActivate, (activation) => {
		activeDockSharedState.mutate((state) => {
			state.activation = activation;
		});
		context.rpc.broadcast({
			method: HUB_EVENTS.broadcast.docksActivate,
			args: [activation]
		});
	});
	const broadcastTerminals = debounce(() => {
		context.rpc.broadcast({
			method: HUB_EVENTS.broadcast.terminalsUpdated,
			args: []
		});
		docksSharedState.mutate(() => docks.values());
	}, debounceMs);
	terminals.events.on(HUB_EVENTS.bus.terminalsSessionUpdated, broadcastTerminals);
	const broadcastMessages = debounce(() => {
		context.rpc.broadcast({
			method: HUB_EVENTS.broadcast.messagesUpdated,
			args: []
		});
		docksSharedState.mutate(() => docks.values());
	}, debounceMs);
	messages.events.on(HUB_EVENTS.bus.messagesAdded, broadcastMessages);
	messages.events.on(HUB_EVENTS.bus.messagesUpdated, broadcastMessages);
	messages.events.on(HUB_EVENTS.bus.messagesRemoved, broadcastMessages);
	messages.events.on(HUB_EVENTS.bus.messagesCleared, broadcastMessages);
	const commandsSharedState = await context.rpc.sharedState.get(HUB_EVENTS.sharedState.commands, { initialValue: [] });
	const syncCommands = debounce(() => {
		commandsSharedState.mutate(() => commands.list());
	}, debounceMs);
	commands.events.on(HUB_EVENTS.bus.commandsRegistered, syncCommands);
	commands.events.on(HUB_EVENTS.bus.commandsUnregistered, syncCommands);
	commandsSharedState.mutate(() => commands.list());
	return context;
}
//#endregion
export { DevframeCommandsHost as _, hubMessagesAdd as a, hubMessagesUpdate as c, hubTerminalsRestart as d, hubTerminalsTerminate as f, DevframeDocksHost as g, DevframeMessagesHost as h, hubDocksActivate as i, hubTerminalsRemove as l, DevframeTerminalsHost as m, builtinHubRpcDeclarations as n, hubMessagesClear as o, hubTerminalsWrite as p, hubCommandsExecute as r, hubMessagesRemove as s, createHubContext as t, hubTerminalsResize as u, prepareDevframe as v, diagnostics as y };
