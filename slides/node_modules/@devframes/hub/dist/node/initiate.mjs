import { a as normalizeHubBase, i as DOCK_RENDERERS_STATE_KEY, r as DEVFRAMES_HUB_BASE } from "../constants-BSPQmlA1.mjs";
import { t as createHubContext, y as diagnostics } from "../context-DRdTViYd.mjs";
import { i as resolveRendererRegistrations, n as renderClientImportsModule, r as resolveDevframesInput, t as mountDevframes } from "../assemble-CK2TX0FM.mjs";
import { joinURL, withoutLeadingSlash } from "devframe/utils/url";
import { DEVFRAME_CONNECTION_META_FILENAME, DEVFRAME_DOCK_IMPORTS_FILENAME, DEVFRAME_MCP_ROUTE } from "devframe/constants";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { createH3DevframeHost, createInstanceShell, importAgenticMcp, loadAutoMcpAdapter, resolveInstanceRegister, resolveMcpConfig } from "devframe/internal";
import { resolve } from "pathe";
import { createInteractiveAuth } from "devframe/recipes/interactive-auth";
import { mountStaticHandler } from "devframe/utils/serve-static";
import { H3 } from "h3";
//#region src/node/initiate.ts
/** Content-type for a UI asset key, inferred from its file extension. */
function assetContentType(key) {
	if (key.endsWith(".json")) return "application/json; charset=utf-8";
	if (key.endsWith(".js") || key.endsWith(".mjs")) return "text/javascript; charset=utf-8";
	if (key.endsWith(".css")) return "text/css; charset=utf-8";
	if (key.endsWith(".svg")) return "image/svg+xml";
	if (key.endsWith(".html")) return "text/html; charset=utf-8";
	return "application/octet-stream";
}
/**
* Resolve the shared hub context: reuse a caller-supplied one, or build an
* h3-backed context that serves the hub's connection meta under every frame.
*/
async function resolveHubContext(options, app, cwd, api) {
	if (options.context && options.devframes?.length) throw diagnostics.DF8002();
	if (options.context) return options.context;
	const host = {
		...createH3DevframeHost({
			origin: () => api.origin() ?? "http://localhost",
			appName: "devframes",
			workspaceRoot: cwd,
			mount: (mountBase, dir) => {
				mountStaticHandler(app, mountBase, dir);
			}
		}),
		...options.getStorageDir ? { getStorageDir: options.getStorageDir } : {},
		/**
		* Serve the hub's own connection meta under every mounted frame's
		* base, so each SPA discovers the shared RPC endpoint via its
		* relative `./__connection.json` fetch; the meta's WS path is
		* hub-base-absolute, so it resolves to the one shared socket no
		* matter how deep the frame base is.
		*/
		mountConnectionMeta: (frameBase) => {
			app.use(joinURL(frameBase, DEVFRAME_CONNECTION_META_FILENAME), () => api.connectionMeta());
		}
	};
	return createHubContext({
		cwd,
		workspaceRoot: cwd,
		mode: "dev",
		host,
		...options.rpcDeclarations ? { builtinRpcDeclarations: options.rpcDeclarations } : {}
	});
}
/**
* Initiate a hub instance: the whole multi-devframe devtools surface
* behind one framework-agnostic, web-standard handler. Every mounted
* devframe shares one context (merged RPC registry, shared state, docks /
* terminals / messages / commands), one WebSocket transport, and one Auth;
* the instance serves each frame's SPA at `<base><id>/`, the discovery
* endpoints (`__connection.json`, `__index.json`, `__client-imports.js`),
* the aggregate MCP route, and whatever the {@link DevframeHubUi} slot
* provides, while the hub itself stays headless.
*
* The factory is synchronous and initializes eagerly, and binds no port of
* its own: the WebSocket follows `server` / `ws` (see
* {@link InitHubOptions.ws}), or waits for the host to hand upgrades over
* through {@link HubInstance.attach}.
*/
function initHub(options) {
	const base = normalizeHubBase(options.base);
	const baseNoSlash = base.slice(0, -1);
	const app = new H3();
	const cwd = options.cwd ?? process.cwd();
	const rendererRegistrations = resolveRendererRegistrations(options.renderers ?? []);
	const shell = createInstanceShell({
		base,
		app,
		host: options.host,
		origin: options.origin,
		/**
		* `false`/an explicit handler are the caller's own call, passed through
		* as-is; `true`/unset both mean "gate with the defaults", so the handler
		* is built lazily from `ctx` either way, taking the UI slot's
		* `authBanner` (e.g. `createUi()`'s branded box) without the caller
		* wiring `auth` themselves.
		*/
		auth: options.auth === false || typeof options.auth === "object" ? options.auth : (ctx) => createInteractiveAuth(ctx, { banner: options.ui?.authBanner }),
		server: options.server,
		ws: options.ws,
		sse: options.sse,
		allowedOrigins: options.allowedOrigins,
		destroyUnmatchedUpgrades: options.destroyUnmatchedUpgrades,
		register: resolveInstanceRegister(options.register, {
			id: options.name ?? "devframes-hub",
			...options.name !== void 0 ? { name: options.name } : {},
			rootDir: cwd
		}),
		/**
		* One meta document is served from the hub base *and* from every frame
		* base, so the advertised WS path has to be base-absolute to resolve to
		* the same socket from any depth.
		*/
		absoluteWsPath: true,
		resolveSidecarPort: async (sidecarHost) => {
			const { getPort } = await import("../dist-Q6-t0oIv.mjs");
			return getPort({
				port: 9777,
				portRange: [9777, 9877],
				host: sidecarHost
			});
		},
		onMetaUnavailable: () => {
			throw diagnostics.DF8003();
		},
		async init(api) {
			const ctx = await resolveHubContext(options, app, cwd, api);
			if (options.clientModuleResolution) ctx.staticConfig.dock = {
				...ctx.staticConfig.dock,
				clientModuleResolution: options.clientModuleResolution
			};
			const devframes = await resolveDevframesInput(options.devframes ?? []);
			for (const input of options.services ?? []) ctx.services.install(input);
			const setups = await mountDevframes(ctx, devframes, base);
			await ctx.services.ready();
			for (const run of setups) await run();
			await options.configure?.(ctx);
			await options.ui?.setup?.(ctx);
			const manifest = {};
			for (const registration of rendererRegistrations) manifest[registration.type] = {
				importFrom: joinURL(base, "__renderers", `${registration.type}.mjs`),
				...registration.importName ? { importName: registration.importName } : {}
			};
			(await ctx.rpc.sharedState.get(DOCK_RENDERERS_STATE_KEY, { initialValue: {} })).mutate(() => manifest);
			const mcpSetting = options.mcp ?? "auto";
			let mcpModule;
			let mcpConfig;
			if (mcpSetting === "auto") {
				mcpModule = await loadAutoMcpAdapter(ctx.agent);
				if (mcpModule) mcpConfig = { authorization: false };
			} else mcpConfig = resolveMcpConfig(mcpSetting);
			if (!mcpConfig) return { context: ctx };
			const mcpRoute = withoutLeadingSlash(mcpConfig.path ?? DEVFRAME_MCP_ROUTE);
			mcpModule ??= await importAgenticMcp();
			const mounted = mcpModule.mountMcpHttp(app, ctx, joinURL(base, mcpRoute), {
				serverName: options.name ?? "devframes-hub",
				serverVersion: options.version ?? "0.0.0",
				exposeSharedState: mcpConfig.exposeSharedState ?? true,
				instructions: mcpConfig.instructions,
				authorization: mcpConfig.authorization,
				allowedOrigins: mcpConfig.allowedOrigins
			});
			return {
				context: ctx,
				mcp: { path: mcpRoute },
				dispose: mounted.dispose
			};
		},
		mount(ctx, meta) {
			app.use(joinURL(base, DEVFRAME_CONNECTION_META_FILENAME), () => meta);
			const indexDocument = () => ({
				name: options.name,
				version: options.version,
				base,
				frames: ctx.frames.map(({ id, base, title }) => ({
					id,
					base,
					title
				})),
				endpoints: {
					connection: DEVFRAME_CONNECTION_META_FILENAME,
					clientImports: DEVFRAME_DOCK_IMPORTS_FILENAME,
					index: "__index.json",
					websocket: meta.websocket,
					...meta.mcp ? { mcp: meta.mcp.path } : {},
					...options.ui?.embedded ? { embedded: "embedded.js" } : {}
				}
			});
			app.use(joinURL(base, "__index.json"), () => indexDocument());
			app.use(joinURL(base, DEVFRAME_DOCK_IMPORTS_FILENAME), (event) => {
				event.res.headers.set("Content-Type", "text/javascript; charset=utf-8");
				event.res.headers.set("Cache-Control", "no-store");
				return renderClientImportsModule(ctx);
			});
			if (options.ui?.embedded) {
				const entry = resolve(options.ui.embedded.entry);
				app.use(joinURL(base, "embedded.js"), async (event) => {
					event.res.headers.set("Content-Type", "text/javascript; charset=utf-8");
					event.res.headers.set("Cache-Control", "no-store");
					return await readFile(entry);
				});
			}
			for (const registration of rendererRegistrations) app.use(joinURL(base, "__renderers", `${registration.type}.mjs`), async (event) => {
				event.res.headers.set("Content-Type", "text/javascript; charset=utf-8");
				event.res.headers.set("Cache-Control", "no-store");
				return await readFile(registration.file);
			});
			for (const [key, produce] of Object.entries(options.ui?.assets ?? {})) app.use(joinURL(base, key), (event) => {
				event.res.headers.set("Content-Type", assetContentType(key));
				event.res.headers.set("Cache-Control", "no-store");
				return produce();
			});
			if (options.ui?.viewer) mountStaticHandler(app, base, resolve(options.ui.viewer.distDir));
			else {
				app.use(baseNoSlash, () => indexDocument());
				app.use(base, () => indexDocument());
			}
		}
	});
	return {
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
}
//#endregion
export { DEVFRAMES_HUB_BASE, initHub };
