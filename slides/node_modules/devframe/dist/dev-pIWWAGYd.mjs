import { DEVFRAME_CONNECTION_META_FILENAME } from "./constants.mjs";
import { t as diagnostics } from "./diagnostics-Dngy7cNp.mjs";
import { t as createHostContext } from "./context-CeD8-IZA.mjs";
import { t as resolveStaticAssetsSource } from "./remote-assets-DoZ1AMpq.mjs";
import { a as resolveMcpConfig, c as joinURL, d as withoutLeadingSlash, i as resolveDevServerPort, l as withBase, n as normalizeBasePath, r as resolveBasePath, s as importAgenticMcp, t as loadAutoMcpAdapter } from "./_shared-B6K2DKhb.mjs";
import { t as createH3DevframeHost } from "./host-h3-BROI6SQ4.mjs";
import { i as normalizeHttpServerUrl, n as resolveInstanceRegister, t as createInstanceShell } from "./instance-shell-DyVmJA6B.mjs";
import { open } from "./utils/open.mjs";
import { mountStaticHandler } from "./utils/serve-static.mjs";
import { resolve } from "pathe";
import { createServer } from "node:http";
import process from "node:process";
import { H3, toNodeHandler } from "h3";
//#region src/adapters/initiate.ts
const INSTANCE_INTERNALS = /* @__PURE__ */ new WeakMap();
/** @internal */
function getInstanceInternals(handler) {
	return INSTANCE_INTERNALS.get(handler) ?? {};
}
/**
* Serve a devframe through one framework-agnostic, web-standard handler:
* the SPA, `__connection.json` discovery, the WebSocket RPC endpoint, the
* auth gate, and the optional MCP route, all under a single mount base.
* Mount `handler` on any framework's catch-all route (or `nodeMiddleware` on
* a connect stack) and the devframe is live inside that app.
*
* The factory is synchronous and kicks off initialization eagerly;
* `handler`/`nodeMiddleware` await readiness internally. Nothing binds a port
* on its own: the WebSocket resolves in precedence order: `ws.port` (pinned
* side-car) > `server` (shared upgrade at `<base>__ws`) > `ws.sidecar`
* (auto-port side-car) > the host driving upgrades itself through
* {@link DevframeInstance.attach}. Meanwhile `ws.url`, when set, overrides the
* advertised* endpoint (the tunnel pattern) and on its own hands the whole
* transport to an external server. `__connection.json` reflects whichever
* combination is active.
*/
function initDevframe(def, options) {
	const base = normalizeBasePath(options.base);
	const distDir = options.distDir === false ? void 0 : options.distDir ?? def.clientAssets;
	const app = options.app ?? new H3();
	const host = options.host ?? def.cli?.host ?? "localhost";
	const shell = createInstanceShell({
		base,
		app,
		host,
		origin: options.origin,
		/**
		* Auth resolution mirrors `createDevServer`: gate by default, explicit
		* `false` opts out, a handler object installs a custom scheme.
		*/
		auth: options.auth !== void 0 ? options.auth : def.cli?.auth,
		server: options.server,
		ws: options.ws ?? def.cli?.ws,
		sse: options.sse ?? def.cli?.sse,
		allowedOrigins: options.allowedOrigins,
		destroyUnmatchedUpgrades: options.destroyUnmatchedUpgrades,
		onPeerConnect: options.onPeerConnect,
		onPeerDisconnect: options.onPeerDisconnect,
		register: resolveInstanceRegister(options.register, {
			id: def.id,
			name: def.name
		}),
		resolveSidecarPort: (sidecarHost) => resolveDevServerPort(def, { host: sidecarHost }),
		onMetaUnavailable: () => {
			throw diagnostics.DF0054({ id: def.id });
		},
		async init(api) {
			const h3Host = createH3DevframeHost({
				origin: () => api.origin() ?? "http://localhost",
				appName: def.id,
				mount: (mountBase, dir) => {
					mountStaticHandler(app, mountBase, dir);
				}
			});
			const hostImpl = options.getStorageDir ? {
				...h3Host,
				getStorageDir: options.getStorageDir
			} : h3Host;
			const context = await createHostContext({
				cwd: process.cwd(),
				mode: "dev",
				host: hostImpl,
				importMetaUrl: def.importMetaUrl
			});
			const setupInfo = { flags: options.flags ?? {} };
			for (const input of def.services ?? []) context.services.install(input, { resolveFrom: def.importMetaUrl });
			await context.services.ready();
			await def.setup(context, setupInfo);
			const mcp = await mountMcpRoute(app, context, def, base, options.mcp ?? "auto");
			return {
				context,
				...mcp?.meta ? { mcp: mcp.meta } : {},
				...mcp?.dispose ? { dispose: mcp.dispose } : {}
			};
		},
		mount(context, meta) {
			app.use(joinURL(base, DEVFRAME_CONNECTION_META_FILENAME), () => meta);
			if (distDir) {
				const source = resolveStaticAssetsSource(distDir, context.host.getStorageDir("project"), def.importMetaUrl);
				mountStaticHandler(app, base, typeof source === "string" ? resolve(source) : source);
			}
		}
	});
	const instance = {
		base: shell.base,
		handler: shell.handler,
		nodeMiddleware: shell.nodeMiddleware,
		attach: shell.attach,
		handleUpgrade: shell.handleUpgrade,
		ready: shell.ready,
		context: shell.context,
		connectionMeta: shell.connectionMeta,
		close: shell.close
	};
	INSTANCE_INTERNALS.set(instance, shell.internals);
	return instance;
}
/**
* Mount the route-based MCP server at `<base>__mcp`, before the SPA static
* catch-all so the exact route wins. The adapter (from the optional
* `@devframes/agentic` peer) is pulled in dynamically only when the route
* mounts, keeping it and the MCP SDK out of consumer bundles: `'auto'`
* mounts once `setup()` left a non-empty agent surface AND the peer is
* installed (an empty surface loads no MCP code; a non-empty one without the
* peer warns once and mounts nothing); an explicit setting mounts
* unconditionally, throwing DF0079 when the peer is absent. The resolved
* config is origin-only unless it opts into a bearer/callback.
*/
async function mountMcpRoute(app, context, def, base, setting) {
	let module;
	let config;
	if (setting === "auto") {
		module = await loadAutoMcpAdapter(context.agent);
		if (module) config = { authorization: false };
	} else config = resolveMcpConfig(setting);
	if (!config) return void 0;
	const route = withoutLeadingSlash(config.path ?? "__mcp");
	module ??= await importAgenticMcp();
	const mounted = module.mountMcpHttp(app, context, joinURL(base, route), {
		serverName: `${def.id} (devframe)`,
		serverVersion: def.version ?? "0.0.0",
		exposeSharedState: config.exposeSharedState ?? true,
		instructions: config.instructions,
		authorization: config.authorization,
		allowedOrigins: config.allowedOrigins
	});
	return {
		meta: { path: route },
		dispose: mounted.dispose
	};
}
//#endregion
//#region src/adapters/dev.ts
/**
* Start a devframe dev server for a {@link DevframeDefinition}:
* h3 + WebSocket RPC + (optionally) the author's SPA mounted at the
* resolved base path.
*
* When `distDir` is omitted (and the definition's client assets are unset) the
* server runs in **bridge mode**: only `__connection.json` and the WS
* endpoint are mounted, with no SPA mount. The SPA is expected to be
* hosted elsewhere (e.g. by a parent Vite/Nuxt dev server); see
* `devframeViteBridge` from `@devframes/vite`.
*
* Returns the underlying {@link StartedServer} handle so callers can
* close it gracefully (SIGINT, hot-reload, test teardown).
*
* Use this directly when integrating devframe into an existing CLI
* framework (commander, yargs, hand-rolled CAC). For the all-in-one
* `dev` / `build` / `mcp` shell, reach for {@link createCac} instead.
*/
async function createDevServer(def, options = {}) {
	if (def.capabilities?.dev === false && !options.force) throw diagnostics.DF0058({ id: def.id });
	const host = options.host ?? def.cli?.host ?? "localhost";
	const requestedPort = options.port ?? await resolveDevServerPort(def, { host });
	const flags = options.flags ?? {};
	const basePath = options.basePath ? normalizeBasePath(options.basePath) : resolveBasePath(def, "standalone");
	const app = options.app ?? new H3();
	const server = createServer(toNodeHandler(app));
	try {
		await new Promise((resolveListen, rejectListen) => {
			const onError = (error) => rejectListen(error);
			server.once("error", onError);
			server.listen(requestedPort, host, () => {
				server.removeListener("error", onError);
				resolveListen();
			});
		});
	} catch (error) {
		throw diagnostics.DF0052({
			host,
			port: requestedPort,
			reason: error instanceof Error ? error.message : String(error),
			cause: error
		});
	}
	const address = server.address();
	const port = typeof address === "object" && address ? address.port : requestedPort;
	const origin = normalizeHttpServerUrl(host, port);
	const devframe = initDevframe(def, {
		base: basePath,
		distDir: options.distDir,
		app,
		server,
		host,
		origin,
		ws: options.ws,
		allowedOrigins: options.allowedOrigins,
		sse: options.sse,
		/**
		* The `--no-auth` flag forces the gate off regardless of the `auth`
		* option / definition default (which the instance resolves itself).
		*/
		auth: flags.auth === false ? false : options.auth,
		mcp: options.mcp,
		flags,
		onPeerConnect: options.onPeerConnect,
		onPeerDisconnect: options.onPeerDisconnect,
		/**
		* Publish in the global registry so discovery tooling (`devframe connect`)
		* finds the server without port guessing. The instance owns the record's
		* lifecycle, written once its (pinned) origin resolves, removed on close.
		*/
		register: true,
		/**
		* This server is devframe's own, and nothing else handles its upgrades, so
		* off-route upgrade attempts are rejected promptly.
		*/
		destroyUnmatchedUpgrades: true
	});
	try {
		await devframe.ready;
	} catch (error) {
		await new Promise((resolveClose) => server.close(() => resolveClose()));
		throw error;
	}
	const internals = getInstanceInternals(devframe);
	const transport = internals.started;
	await options.onReady?.({
		origin,
		port,
		app
	});
	await maybeOpenBrowser(def, flags, `${origin}${basePath}`, options.openBrowser, internals.authHandler);
	return {
		origin,
		port,
		app,
		ws: transport.ws,
		rpcGroup: transport.rpcGroup,
		connectionMeta: transport.connectionMeta,
		async close() {
			await devframe.close();
			await new Promise((resolveClose) => server.close(() => resolveClose()));
		}
	};
}
async function maybeOpenBrowser(def, flags, origin, override, authHandler) {
	const flagsOpen = flags.open;
	const cliOpen = def.cli?.open;
	const resolved = override ?? flagsOpen ?? cliOpen;
	if (resolved === void 0 || resolved === false) return;
	const target = typeof resolved === "string" ? withBase(resolved, origin) : origin;
	const authorizedTarget = authHandler?.buildOpenUrl?.(target) ?? target;
	try {
		await open(authorizedTarget);
	} catch {}
}
//#endregion
export { getInstanceInternals as n, initDevframe as r, createDevServer as t };
