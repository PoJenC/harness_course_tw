import "./constants.mjs";
import { r as validateOriginCandidate } from "./origin-DZit9g29.mjs";
import { t as diagnostics } from "./diagnostics-Dngy7cNp.mjs";
import { c as joinURL, d as withoutLeadingSlash, f as withoutTrailingSlash, u as withLeadingSlash } from "./_shared-B6K2DKhb.mjs";
import { t as getInternalContext } from "./context-B-2gsJ6Z.mjs";
import { n as createInteractiveAuth } from "./interactive-auth-CCZdQDy_.mjs";
import { createServer } from "node:http";
import process from "node:process";
import { isIP } from "node:net";
import { Server } from "node:tls";
import { H3, defineHandler, toNodeHandler } from "h3";
//#region src/node/runtime.ts
/**
* Detect the current server runtime from its runtime-specific global. The
* WebSocket binding branches on this: Bun and Deno expose their sockets as
* `fetch` upgrades through `Bun.serve` / `Deno.serve` (crossws's Bun/Deno
* adapters), while the `node:http` upgrade event (and crossws's Node adapter,
* which refuses to run anywhere else) is Node-only.
*/
function detectServerRuntime() {
	const g = globalThis;
	if (typeof g.Deno !== "undefined") return "deno";
	if (typeof g.Bun !== "undefined") return "bun";
	return "node";
}
//#endregion
//#region src/node/utils.ts
const NON_DIALABLE_HOSTS = /* @__PURE__ */ new Set([
	"0.0.0.0",
	"127.0.0.1",
	"::",
	"0000:0000:0000:0000:0000:0000:0000:0000",
	""
]);
/** Map a bind host to a host a client can actually connect to. */
function toDialableHost(host) {
	return NON_DIALABLE_HOSTS.has(host) ? "localhost" : host;
}
/** Format a bind host for use in a URL authority (dialable, IPv6-bracketed). */
function formatHostForUrl(host) {
	const dialable = toDialableHost(host);
	return isIP(dialable) === 6 ? `[${dialable}]` : dialable;
}
function normalizeHttpServerUrl(host, port) {
	return `http://${formatHostForUrl(host)}:${port}`;
}
//#endregion
//#region src/node/instance-shell.ts
function websocketConnectionMeta(rpcHost, path) {
	const jsonSerializableMethods = [];
	for (const def of rpcHost.definitions.values()) if (def.jsonSerializable === true) jsonSerializableMethods.push(def.name);
	return {
		backend: "websocket",
		websocket: { path },
		jsonSerializableMethods
	};
}
/**
* Compose an h3 + WebSocket RPC server for a devframe context: the low-level
* "listen on a port (or share one) + attach the WS transport" binding the
* side-car and shared-server tiers below are built on. Owns and listens on a
* fresh `node:http` server unless `server` is supplied, in which case it only
* attaches the upgrade listener and leaves that server's lifecycle to its
* owner.
*/
async function bindHttpAndWs(options) {
	const { context, port, core } = options;
	const bindHost = options.host;
	const app = new H3();
	const ownsHttpServer = !options.server;
	const httpServer = options.server ?? createServer(toNodeHandler(app));
	const rpcHost = context.rpc;
	const websocket = options.websocket !== false;
	let ws;
	let closeWs = async () => {};
	if (websocket) {
		const { attachWsRpcTransport } = await import("./rpc/transports/ws-server.mjs");
		const transport = attachWsRpcTransport(core.rpcGroup, {
			server: httpServer,
			path: options.path,
			destroyUnmatched: options.destroyUnmatched ?? ownsHttpServer,
			allowedOrigins: options.allowedOrigins,
			onConnected: core.onConnected,
			onDisconnected: core.onDisconnected
		});
		ws = transport.ws;
		closeWs = transport.close;
	}
	if (ownsHttpServer) try {
		await new Promise((resolve, reject) => {
			const onError = (error) => reject(error);
			httpServer.once("error", onError);
			httpServer.listen(port, bindHost, () => {
				httpServer.removeListener("error", onError);
				resolve();
			});
		});
	} catch (error) {
		await closeWs().catch(() => {});
		throw diagnostics.DF0052({
			host: bindHost,
			port,
			reason: error instanceof Error ? error.message : String(error),
			cause: error
		});
	}
	const address = httpServer.address();
	const resolvedPort = typeof address === "object" && address ? address.port : port;
	const origin = normalizeHttpServerUrl(bindHost, resolvedPort);
	let wsUrl;
	const publishWsEndpoint = () => {
		const bound = httpServer.address();
		if (!bound || typeof bound === "string") return;
		wsUrl = `${httpServer instanceof Server ? "wss" : "ws"}://${formatHostForUrl(bindHost)}:${bound.port}${options.path ?? ""}`;
		getInternalContext(context).setWsEndpoint({ url: wsUrl });
	};
	if (websocket) {
		if (httpServer.listening) publishWsEndpoint();
		else httpServer.once("listening", publishWsEndpoint);
	}
	return {
		origin,
		port: resolvedPort,
		app,
		ws,
		rpcGroup: core.rpcGroup,
		connectionMeta: () => websocketConnectionMeta(rpcHost, options.path),
		async close() {
			httpServer.off("listening", publishWsEndpoint);
			await closeWs();
			if (ownsHttpServer) await new Promise((r) => httpServer.close(() => r()));
			if (wsUrl && getInternalContext(context).wsEndpoint?.url === wsUrl) getInternalContext(context).setWsEndpoint(void 0);
		}
	};
}
/**
* Whether a request is a WebSocket upgrade aimed at `path`: the `fetch`-side
* equivalent of the Node transport's `upgrade`-event path filter, used by the
* native ({@link bindNativeHttpAndWs}) tiers to route only the RPC route to
* the socket and leave every other request to the h3 app.
*/
function isWsUpgradeRequest(request, path) {
	if ((request.headers.get("upgrade") ?? "").toLowerCase() !== "websocket") return false;
	if (!path) return true;
	try {
		return samePath(new URL(request.url).pathname, path);
	} catch {
		return false;
	}
}
/**
* The Bun/Deno counterpart to {@link bindHttpAndWs}: own and listen on a
* native `fetch`-upgrade server (`Bun.serve` / `Deno.serve`) with crossws's
* Bun/Deno adapter driving the RPC socket, since crossws's Node adapter (and
* the `node:http` `upgrade` event it needs) refuses to run off Node. Only the
* owns-a-server tiers reach here; a shared foreign `node:http` server can't be
* re-hosted on a native runtime, so that path falls back to SSE instead.
*/
async function bindNativeHttpAndWs(runtime, options) {
	const { context, port, core } = options;
	const bindHost = options.host;
	const app = new H3();
	const rpcHost = context.rpc;
	const wsPath = options.path;
	const fail = async (closeWs, error) => {
		await closeWs().catch(() => {});
		throw diagnostics.DF0052({
			host: bindHost,
			port,
			reason: error instanceof Error ? error.message : String(error),
			cause: error
		});
	};
	let resolvedPort;
	let closeWs;
	let closeServer;
	if (runtime === "bun") {
		const { attachBunWsTransport } = await import("./rpc/transports/ws-bun.mjs");
		const tier = await attachBunWsTransport(core, { allowedOrigins: options.allowedOrigins });
		closeWs = tier.close;
		const Bun = globalThis.Bun;
		let server;
		try {
			server = Bun.serve({
				port,
				hostname: bindHost,
				fetch: async (request, srv) => isWsUpgradeRequest(request, wsPath) ? await tier.handleUpgrade(request, srv) : await app.fetch(request),
				websocket: tier.websocket
			});
		} catch (error) {
			return await fail(closeWs, error);
		}
		resolvedPort = server.port;
		closeServer = async () => {
			await server.stop(true);
		};
	} else {
		const { attachDenoWsTransport } = await import("./rpc/transports/ws-deno.mjs");
		const tier = await attachDenoWsTransport(core, { allowedOrigins: options.allowedOrigins });
		closeWs = tier.close;
		const Deno = globalThis.Deno;
		let server;
		try {
			server = Deno.serve({
				port,
				hostname: bindHost,
				onListen: () => {}
			}, async (request, info) => isWsUpgradeRequest(request, wsPath) ? await tier.handleUpgrade(request, info) : await app.fetch(request));
		} catch (error) {
			return await fail(closeWs, error);
		}
		resolvedPort = server.addr.port;
		closeServer = async () => {
			await server.shutdown();
		};
	}
	const origin = normalizeHttpServerUrl(bindHost, resolvedPort);
	const internal = getInternalContext(context);
	const wsUrl = `ws://${formatHostForUrl(bindHost)}:${resolvedPort}${options.path ?? ""}`;
	internal.setWsEndpoint({ url: wsUrl });
	return {
		origin,
		port: resolvedPort,
		app,
		ws: void 0,
		rpcGroup: core.rpcGroup,
		connectionMeta: () => websocketConnectionMeta(rpcHost, options.path),
		async close() {
			await closeServer();
			await closeWs();
			if (getInternalContext(context).wsEndpoint?.url === wsUrl) getInternalContext(context).setWsEndpoint(void 0);
		}
	};
}
/**
* Translate the public `register?: boolean | Partial<DevframeInstanceRecord>`
* option into a shell {@link InstanceRegisterConfig}, or `undefined` when
* registration is opted out. The object form supplies record overrides on top
* of the caller-provided identity defaults.
*/
function resolveInstanceRegister(option, defaults) {
	if (!option) return void 0;
	return {
		id: defaults.id,
		...defaults.name !== void 0 ? { name: defaults.name } : {},
		...defaults.rootDir !== void 0 ? { rootDir: defaults.rootDir } : {},
		...typeof option === "object" ? { overrides: option } : {}
	};
}
/** Compare two URL paths ignoring a trailing slash. */
function samePath(a, b) {
	return withoutTrailingSlash(a) === withoutTrailingSlash(b);
}
/**
* Copy a web `Response` from a fetch-style transport handler onto the h3
* event's response and return its body, mirroring the MCP route's bridge.
* Returning the body (a `ReadableStream`, or `''` for an empty one, since h3
* middleware only falls through on `undefined`) terminates the chain with
* the status/headers set here instead of continuing to the SPA catch-all.
*/
function respondWith(event, response) {
	event.res.status = response.status;
	event.res.statusText = response.statusText;
	response.headers.forEach((value, key) => {
		event.res.headers.set(key, value);
	});
	return response.body ?? "";
}
/**
* The shared machinery behind `initDevframe` and `initHub`: one mount base,
* one h3 app, one lazily-derived public origin (which backs the auth
* banner's magic link), one WebSocket binding, and the fetch /
* connect-middleware pair that serves them. Each factory supplies only what makes it itself (its context,
* its routes, its diagnostics) through `init` / `mount`.
*
* Nothing here listens on a port unless a side-car was explicitly requested:
* the default tier leaves the socket `unbound`, so a host chains it onto its
* own server through {@link InstanceShell.attach} /
* {@link InstanceShell.handleUpgrade}.
*
* @internal
*/
function createInstanceShell(options) {
	const base = options.base;
	const baseNoSlash = withoutTrailingSlash(base);
	const app = options.app ?? new H3();
	const runtime = detectServerRuntime();
	const nativeRuntime = runtime !== "node";
	const wsDisabled = options.ws === false;
	const ws = options.ws === false ? {} : options.ws ?? {};
	const route = withoutLeadingSlash(ws.route ?? "__ws");
	/** Where an upgrade lands on the host's own origin. */
	const routePath = joinURL(base, route);
	/** What `__connection.json` advertises for a same-origin socket. */
	const advertisedPath = options.absoluteWsPath ? routePath : route;
	const sidecarRequested = ws.port != null || ws.sidecar === true;
	const tier = wsDisabled ? "disabled" : sidecarRequested ? "sidecar" : options.server ? "server" : ws.url ? "external" : "unbound";
	const sseEnabled = options.sse !== false && tier !== "external";
	const sseRoute = withoutLeadingSlash((typeof options.sse === "object" ? options.sse.route : void 0) ?? "__sse");
	const sseRoutePath = joinURL(base, sseRoute);
	const advertisedSsePath = options.absoluteWsPath ? sseRoutePath : sseRoute;
	let derivedOrigin;
	function explicitOrigin() {
		return typeof options.origin === "function" ? options.origin() : options.origin;
	}
	function currentOrigin() {
		return explicitOrigin() || derivedOrigin;
	}
	let authHandler;
	let meta;
	let registration;
	let registerPromise;
	/**
	* Publish the instance in the global registry the moment both its origin
	* and connection meta are known: at init end for a pinned origin, or on
	* the first request for a derived one. Registration never throws (the
	* registry writer degrades to a coded warning), so failures never surface.
	*/
	function maybeRegister() {
		const cfg = options.register;
		const origin = currentOrigin();
		if (!cfg || registerPromise || !origin || !meta) return;
		const resolvedMeta = meta;
		registerPromise = import("./instance-registry-B--XFmLS.mjs").then((n) => n.t).then(({ registerDevframeInstance }) => {
			let port = 0;
			try {
				const url = new URL(origin);
				port = Number(url.port) || (url.protocol === "https:" ? 443 : 80);
			} catch {}
			registration = registerDevframeInstance({
				pid: process.pid,
				port,
				origin,
				basePath: base,
				id: cfg.id,
				...cfg.name !== void 0 ? { name: cfg.name } : {},
				rootDir: cfg.rootDir ?? process.cwd(),
				mcp: resolvedMeta.mcp ? { path: joinURL(base, resolvedMeta.mcp.path) } : null,
				startedAt: Date.now(),
				...cfg.overrides
			});
		}).catch(() => {});
	}
	/**
	* Consider a request-derived origin candidate for the advertised public
	* origin (which backs the OTP magic link). {@link validateOriginCandidate}
	* adopts only a loopback host or an exact `allowedOrigins` match, so a raw
	* inbound `Host`/URL authority never redirects the credential-bearing link.
	* First-valid-origin wins: an invalid candidate leaves `derivedOrigin` unset
	* (registering nothing) so a later valid one can still be adopted.
	*/
	function noteOrigin(candidate) {
		if (derivedOrigin === void 0 && !explicitOrigin()) {
			const allowed = options.allowedOrigins;
			const accepted = validateOriginCandidate(candidate, Array.isArray(allowed) ? allowed : void 0);
			if (accepted !== void 0) derivedOrigin = accepted;
		}
		maybeRegister();
	}
	let started;
	let transport;
	let dispose;
	let ctx;
	const api = {
		base,
		app,
		origin: currentOrigin,
		connectionMeta: () => meta
	};
	/**
	* Auth resolution: gate by default, `false` opts out, a handler object
	* installs a custom scheme, a function builds one from `ctx`. The `external`
	* tier has no local transport to gate (the server behind `ws.url` owns
	* auth) so it resolves to nothing.
	*/
	function resolveAuth() {
		if (options.auth === false) return false;
		if (typeof options.auth === "function") {
			authHandler = options.auth(ctx);
			return authHandler;
		}
		if (typeof options.auth === "object") {
			authHandler = options.auth;
			return options.auth;
		}
		authHandler = createInteractiveAuth(ctx);
		return authHandler;
	}
	/**
	* The context's RPC core (birpc group, session lifecycle, auth gate) is
	* one per instance, shared by every transport binding (WS and SSE), so a
	* WS peer and an SSE session live in the same session/broadcast space.
	* Built lazily: an `unbound` host that never wires a transport pays
	* nothing for it, not even the imports. `resolvedAuth` and `ctx` are
	* assigned during `init()` before any caller can reach this.
	*/
	let resolvedAuth = false;
	let corePromise;
	function ensureCore() {
		corePromise ??= import("./rpc-core-Dl50hXG3.mjs").then((n) => n.n).then(({ createContextRpcServer }) => createContextRpcServer({
			context: ctx,
			auth: resolvedAuth,
			onPeerConnect: options.onPeerConnect,
			onPeerDisconnect: options.onPeerDisconnect
		}));
		return corePromise;
	}
	/**
	* The SSE transport, built on the first request to its route so an
	* instance nobody dials over SSE never loads it.
	*/
	let ssePromise;
	function ensureSse() {
		ssePromise ??= (async () => {
			const [core, { attachSseRpcTransport }] = await Promise.all([ensureCore(), import("./rpc/transports/sse-server.mjs")]);
			return attachSseRpcTransport(core.rpcGroup, {
				allowedOrigins: options.allowedOrigins,
				onConnected: core.onConnected,
				onDisconnected: core.onDisconnected
			});
		})();
		return ssePromise;
	}
	/**
	* A side-car server on its own port. `getPort` probes and the bind can
	* still race (or disagree across the v4/v6 duals of `localhost`), so an
	* auto-port side-car retries on a fresh random port instead of failing
	* init; a pinned `ws.port` is honored as given and fails loudly.
	*/
	async function startSidecar(core) {
		const sidecarHost = options.host ?? "localhost";
		const start = (port) => {
			const bindOptions = {
				context: ctx,
				core,
				host: sidecarHost,
				port,
				path: withLeadingSlash(route),
				allowedOrigins: options.allowedOrigins
			};
			return nativeRuntime ? bindNativeHttpAndWs(runtime, bindOptions) : bindHttpAndWs(bindOptions);
		};
		if (ws.port != null) return await start(ws.port);
		const { getPort } = await import("./dist-CZXfGEkd.mjs").then((n) => n.t);
		let lastError;
		for (let attempt = 0; attempt < 3; attempt++) {
			const port = attempt === 0 && options.resolveSidecarPort ? await options.resolveSidecarPort(sidecarHost) : await getPort({
				random: true,
				host: sidecarHost
			});
			try {
				return await start(port);
			} catch (error) {
				lastError = error;
			}
		}
		throw lastError;
	}
	async function startServerTier() {
		if (nativeRuntime && !ws.url) {
			const core = await ensureCore();
			started = {
				origin: currentOrigin() ?? "",
				port: 0,
				app,
				ws: void 0,
				rpcGroup: core.rpcGroup,
				connectionMeta: () => meta ?? options.onMetaUnavailable(),
				close: async () => {}
			};
			return { wsAvailable: false };
		}
		started = await bindHttpAndWs({
			context: ctx,
			core: await ensureCore(),
			host: options.host ?? "localhost",
			port: 0,
			server: options.server,
			path: routePath,
			allowedOrigins: options.allowedOrigins,
			destroyUnmatched: options.destroyUnmatchedUpgrades
		});
		return {
			websocketMeta: { path: advertisedPath },
			wsAvailable: !wsDisabled
		};
	}
	async function resolveWebsocketBinding() {
		if (tier === "sidecar") {
			started = await startSidecar(await ensureCore());
			return {
				websocketMeta: {
					port: started.port,
					path: route
				},
				wsAvailable: !wsDisabled
			};
		}
		if (tier === "server") return startServerTier();
		if (tier === "external") return {
			websocketMeta: ws.url,
			wsAvailable: !wsDisabled
		};
		return {
			websocketMeta: { path: advertisedPath },
			wsAvailable: !wsDisabled
		};
	}
	async function init() {
		const result = await options.init(api);
		ctx = result.context;
		dispose = result.dispose;
		resolvedAuth = tier === "external" ? false : resolveAuth();
		const binding = await resolveWebsocketBinding();
		const wsAvailable = binding.wsAvailable;
		let websocketMeta = binding.websocketMeta;
		if (!wsDisabled && ws.url) websocketMeta = ws.url;
		if (sseEnabled) app.use(sseRoutePath, defineHandler(async (event) => respondWith(event, await (await ensureSse()).handler(event.req))));
		if (!wsDisabled && !wsAvailable && !sseEnabled) diagnostics.DF0075({ runtime }, { method: "warn" });
		meta = {
			backend: !wsDisabled && wsAvailable ? "websocket" : sseEnabled ? "sse" : "none",
			...wsAvailable && websocketMeta !== void 0 ? { websocket: websocketMeta } : {},
			...sseEnabled ? { sse: { path: advertisedSsePath } } : {},
			...result.mcp ? { mcp: result.mcp } : {}
		};
		if (Object.keys(ctx.staticConfig).length > 0) meta.configs = ctx.staticConfig;
		await options.mount?.(ctx, meta, api);
		maybeRegister();
	}
	const initPromise = init();
	initPromise.catch(() => {});
	const contextPromise = initPromise.then(() => ctx);
	contextPromise.catch(() => {});
	/**
	* The `unbound` tier: the RPC core and its crossws adapter, bound to
	* nothing. Built on the first `attach` / `handleUpgrade`; a host that
	* never wires the socket (or whose runtime brings its own WS transport)
	* pays nothing for it, not even the adapter's imports.
	*/
	let transportPromise;
	function ensureTransport() {
		transportPromise ??= initPromise.then(async () => {
			const [core, { attachWsRpcTransport }] = await Promise.all([ensureCore(), import("./rpc/transports/ws-server.mjs")]);
			transport = attachWsRpcTransport(core.rpcGroup, {
				unbound: true,
				path: routePath,
				allowedOrigins: options.allowedOrigins,
				onConnected: core.onConnected,
				onDisconnected: core.onDisconnected
			});
			return transport;
		});
		return transportPromise;
	}
	async function handleRequest(request) {
		await initPromise;
		noteOrigin(new URL(request.url).origin);
		const response = await app.fetch(request);
		if (response.status === 404) return new Response(null, { status: 404 });
		return response;
	}
	let nodeHandler;
	function nodeMiddleware(req, res, next) {
		let pathname = req.url ?? "/";
		try {
			pathname = new URL(pathname, "http://localhost").pathname;
		} catch {}
		if (!(samePath(pathname, baseNoSlash) || pathname.startsWith(base))) {
			if (next) {
				next();
				return;
			}
			res.statusCode = 404;
			res.end();
			return;
		}
		initPromise.then(async () => {
			const host = req.headers.host;
			if (host) {
				const encrypted = req.socket.encrypted;
				noteOrigin(`${encrypted ? "https" : "http"}://${host}`);
			}
			if (!nodeHandler) {
				const { toNodeHandler } = await import("h3/node");
				nodeHandler = toNodeHandler(app);
			}
			return nodeHandler(req, res);
		}).catch((err) => {
			if (next) {
				next(err);
				return;
			}
			res.statusCode = 500;
			res.end();
		});
	}
	/** The `unbound` tier is the only one whose socket the host may drive. */
	function assertUnbound() {
		if (tier === "disabled") throw diagnostics.DF0057();
		if (tier === "external") throw diagnostics.DF0056({ url: ws.url });
		if (tier !== "unbound") throw diagnostics.DF0055({ tier });
		if (nativeRuntime) throw diagnostics.DF0076({ runtime });
	}
	/**
	* Publish the socket's absolute URL on the context, so surfaces that hand
	* out a complete endpoint (the hub's remote docks) work on this tier too.
	* {@link bindHttpAndWs} does the same for the tiers it owns.
	*/
	function publishWsEndpoint(server) {
		const record = () => {
			const address = server.address();
			if (typeof address !== "object" || !address) return;
			const host = options.host ?? (address.address === "::" || address.address === "0.0.0.0" ? "localhost" : address.address);
			getInternalContext(ctx).setWsEndpoint({ url: `ws://${formatHostForUrl(host)}:${address.port}${routePath}` });
		};
		if (server.listening) record();
		else server.once("listening", record);
	}
	function handleUpgrade(req, socket, head) {
		assertUnbound();
		if (transport) {
			transport.handleUpgrade(req, socket, head);
			return;
		}
		ensureTransport().then((live) => live.handleUpgrade(req, socket, head)).catch(() => socket.destroy());
	}
	function attach(server) {
		assertUnbound();
		server.on("upgrade", handleUpgrade);
		ensureTransport().then(() => publishWsEndpoint(server)).catch(() => {});
		return () => server.off("upgrade", handleUpgrade);
	}
	return {
		base,
		handler: handleRequest,
		nodeMiddleware,
		ready: initPromise,
		context: contextPromise,
		connectionMeta: () => meta ?? options.onMetaUnavailable(),
		handleUpgrade,
		attach,
		async close() {
			await initPromise.catch(() => {});
			await registerPromise?.catch(() => {});
			registration?.unregister();
			await dispose?.();
			await ssePromise?.then((live) => live.close()).catch(() => {});
			await started?.close();
			await transportPromise?.then((live) => live.close()).catch(() => {});
		},
		internals: {
			get started() {
				return started;
			},
			get authHandler() {
				return authHandler;
			}
		}
	};
}
//#endregion
export { normalizeHttpServerUrl as i, resolveInstanceRegister as n, samePath as r, createInstanceShell as t };
