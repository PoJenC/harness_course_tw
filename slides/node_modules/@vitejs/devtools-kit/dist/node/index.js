import { DevframeCommandsHost as DevToolsCommandsHost, DevframeDocksHost as DevToolsDockHost, DevframeMessagesHost as DevToolsMessagesHost, DevframeTerminalsHost as DevToolsTerminalHost, createHubContext } from "@devframes/hub/node";
import { createJsonRenderView } from "@devframes/json-render/node";
import { nanoid } from "devframe/utils/nanoid";
import process from "node:process";
import { isPackageExists } from "local-pkg";
import { resolveCommand } from "package-manager-detector/commands";
import { detect } from "package-manager-detector/detect";
import { createConsoleReporter, defineDiagnostics } from "nostics";
import { Buffer } from "node:buffer";
import { homedir } from "node:os";
import { join, posix } from "node:path";
import { serveStaticNodeMiddleware } from "devframe/utils/serve-static";
import "@devframes/hub/constants";
import { DEVFRAME_CONNECTION_META_FILENAME as DEVTOOLS_CONNECTION_META_FILENAME } from "devframe/constants";
//#region src/node/context.ts
/**
* Create a kit-level node context: wraps `@devframes/hub`'s
* `createHubContext` (which itself wraps devframe's `createHostContext`)
* and attaches the Vite-specific slots plus the `createJsonRenderer`
* factory. The hub layer owns the docks/terminals/messages/commands
* subsystems and seeds the shared-state sync the unified client UI consumes.
*/
async function createKitContext(options) {
	const context = await createHubContext(options);
	if (options.viteConfig) Object.defineProperty(context, "viteConfig", {
		value: options.viteConfig,
		enumerable: true
	});
	if (options.viteServer) Object.defineProperty(context, "viteServer", {
		value: options.viteServer,
		enumerable: true
	});
	Object.defineProperty(context, "createJsonRenderer", {
		value: (spec, rendererOptions) => createJsonRenderer(context, spec, rendererOptions),
		enumerable: true
	});
	return context;
}
/**
* Build a kit {@link JsonRenderer} handle over a devframe json-render view.
* The handle's methods are defined non-enumerably so the whole object stays
* serializable when carried on a dock entry's `ui` field — the docks
* shared-state projection walks only enumerable own keys, so the live
* closures never reach the wire while `_stateKey` does.
*/
function createJsonRenderer(context, spec, options = {}) {
	const view = createJsonRenderView(context, {
		id: `kit-${nanoid()}`,
		spec,
		...options
	});
	const handle = {
		_stateKey: view.ref.stateKey,
		view: view.ref
	};
	Object.defineProperties(handle, {
		updateSpec: {
			value: (next) => view.update(next),
			enumerable: false
		},
		updateState: {
			value: (state) => {
				view.patchState(Object.entries(state).map(([key, value]) => ({
					op: "add",
					path: `/${key}`,
					value
				})));
			},
			enumerable: false
		},
		dispose: {
			value: () => view.dispose(),
			enumerable: false
		}
	});
	return handle;
}
//#endregion
//#region src/node/diagnostics.ts
const diagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase: "https://devtools.vite.dev/errors",
	reporters: [createConsoleReporter()],
	codes: {
		DTK0050: {
			why: (p) => `Failed to install ${p.packages}.`,
			fix: "Install the package(s) manually with your package manager, then restart the dev server."
		},
		DTK0051: {
			why: (p) => `Failed to serve the RPC connection meta at "${p.base}".`,
			fix: "The devframe SPA mounted at this base cannot discover the RPC endpoint. Check the dev server logs for the underlying cause and reload."
		},
		DTK0052: {
			why: (p) => `The "${p.id}" launcher process exited with code ${p.exitCode ?? "null"} before its server was ready.`,
			fix: "Check the launcher's terminal session output for the failure, then use Retry."
		}
	}
});
//#endregion
//#region src/node/create-install-launcher.ts
/** Extract the bare package name from an npm spec (`name`, `name@range`, `@scope/name@range`). */
function specToName(spec) {
	const at = spec.lastIndexOf("@");
	return at > 0 ? spec.slice(0, at) : spec;
}
/**
* Build a Vite plugin that surfaces a **discovery / install launcher** dock for
* an optional integration that is not installed yet.
*
* The launcher renders in the dock rail (making the integration discoverable);
* clicking it runs the install as a tracked terminal session — the card streams
* its progress and offers a "View in Terminal" link (the same primitives
* `createProcessLauncher` uses for e.g. the Vitest UI launcher) — then swaps to
* a "restart to activate" message. Because the integration's own Vite plugin
* has to be present at config-resolution time to mount, activation happens on
* the next dev-server restart (or `vite-devtools` re-run), when the host
* re-detects the now-installed package and mounts the real dock.
*/
function createInstallLauncher(options) {
	const { id, title, icon, groupId, label = title, name, install, pkg = specToName(install[0] ?? title), dev = true } = options;
	const sessionId = `${id}:install`;
	return {
		name: name ?? `vite:devtools:install-launcher:${id}`,
		devtools: { setup(ctx) {
			const installRoot = ctx.workspaceRoot ?? ctx.cwd ?? process.cwd();
			let session;
			const commandId = `vite:devtools:install:${id}`;
			function entry(status, extras = {}) {
				return {
					id,
					title,
					groupId,
					icon,
					type: "launcher",
					launcher: {
						icon,
						title: label,
						description: extras.description ?? `Install ${label} to view it inside DevTools.`,
						buttonStart: extras.buttonStart ?? `Install ${pkg}`,
						buttonLoading: "Installing…",
						status,
						error: extras.error,
						command: commandId,
						...extras.tracking ? { terminalSessionId: sessionId } : {},
						...extras.progress ? { digest: extras.progress } : {}
					}
				};
			}
			ctx.commands.register({
				id: commandId,
				title: `Install ${pkg}`,
				icon,
				handler: launch
			});
			ctx.docks.register(entry("idle"));
			async function disposeSession() {
				if (session) await session.terminate().catch(() => {});
				session = void 0;
				ctx.terminals.sessions.delete(sessionId);
			}
			async function launch() {
				const missing = install.filter((spec) => !isPackageExists(specToName(spec), { paths: [installRoot] }));
				if (missing.length) try {
					await disposeSession();
					const agent = (await detect({ cwd: installRoot }))?.agent ?? "npm";
					const addArgs = dev ? ["-D", ...missing] : missing;
					const { command, args } = resolveCommand(agent, "add", addArgs);
					const commandLine = [command, ...args].join(" ");
					ctx.docks.update(entry("loading", {
						tracking: true,
						progress: "Installing…"
					}));
					session = await ctx.terminals.startChildProcess({
						command,
						args,
						cwd: installRoot
					}, {
						id: sessionId,
						title: `Install ${label}`,
						icon: "ph:terminal-window-duotone"
					});
					const result = await session.getResult();
					if (result.exitCode !== 0) throw new Error(`\`${commandLine}\` exited with code ${result.exitCode ?? "null"}.`);
				} catch (error) {
					const cause = error instanceof Error ? error : new Error(String(error));
					ctx.docks.update(entry("error", {
						tracking: true,
						error: cause.message
					}));
					throw diagnostics.DTK0050({
						packages: missing.join(", "),
						cause
					});
				}
				const restartHint = ctx.viteServer ? "Restart your dev server to activate it." : "Re-run `vite-devtools` to activate it.";
				ctx.docks.update(entry("success", {
					tracking: Boolean(session),
					progress: session ? "Installed" : void 0,
					description: `${label} installed. ${restartHint}`,
					buttonStart: "Installed"
				}));
			}
		} }
	};
}
//#endregion
//#region src/node/create-plugin-from-devframe.ts
/**
* Wrap a {@link DevframeDefinition} as a Vite plugin that mounts inside
* `@vitejs/devtools` (Vite DevTools). Delegates the mount work
* (serving the SPA, registering the iframe dock entry, calling
* `d.setup(ctx)`) to the hub context's `ctx.install`, then runs the
* optional kit-only `options.setup` hook.
*/
function createPluginFromDevframe(d, options = {}) {
	return {
		name: options.name ?? `devframe:${d.id}`,
		devtools: {
			capabilities: options.capabilities ?? d.capabilities,
			async setup(rawCtx) {
				const ctx = rawCtx;
				await ctx.install(d, {
					base: options.base,
					dock: options.dock
				});
				if (options.setup) await options.setup(ctx);
			}
		}
	};
}
//#endregion
//#region src/node/create-process-launcher.ts
/**
* Build a launcher dock for a child process — the composed form of the launcher
* primitives. It registers the launcher, binds a command to the launch action,
* runs an optional `prepare` step, spawns the process into a terminal session,
* reflects the process's progress/status on the card, and exposes the session
* so the card's "View in Terminal" action can jump to its full output.
*
* Two shapes, one call:
*
* - **Terminal launcher** (no `serve`): the launcher *stays* a launcher while a
*   long-running process runs (dev servers, watchers, builds), tailing its
*   output as a digest.
* - **Server launcher** (`serve.onReady`): run some commands, start a server,
*   then replace the card with an iframe embedding the server — the digest
*   streams startup logs until `onReady` resolves the URL, then the dock swaps
*   to the iframe.
*
* ```ts
* // Terminal launcher
* createProcessLauncher({
*   id: 'my-app',
*   title: 'My App',
*   icon: 'ph:rocket-launch-duotone',
*   process: { command: 'vite', args: ['dev'], cwd: process.cwd() },
* })
*
* // Server launcher (spawn → wait → embed)
* let url: string
* createProcessLauncher({
*   id: 'my-ui',
*   title: 'My UI',
*   icon: 'ph:browser-duotone',
*   process: async () => {
*     const port = await getPort()
*     url = `http://localhost:${port}/`
*     return { command: 'my-ui', args: ['--port', String(port)], cwd: process.cwd() }
*   },
*   serve: { onReady: async () => { await waitForServer(url); return url } },
* })
* ```
*/
function createProcessLauncher(options) {
	const { id, title, icon, groupId, label = title, description, buttonStart, buttonLoading, process: executeOptions, prepare, serve, roots, name } = options;
	const sessionId = options.session?.id ?? id;
	const commandId = options.command?.id ?? `${id}:launch`;
	return {
		name: name ?? `vite:devtools:process-launcher:${id}`,
		devtools: { setup(ctx) {
			let session;
			let servedUrl;
			function entry(status, extras = {}) {
				return {
					id,
					title,
					groupId,
					icon,
					type: "launcher",
					launcher: {
						title: label,
						description,
						icon,
						buttonStart,
						buttonLoading,
						status,
						error: extras.error,
						command: commandId,
						...roots ? { roots } : {},
						...extras.tracking ? { terminalSessionId: sessionId } : {},
						...extras.progress ? { digest: extras.progress } : {}
					}
				};
			}
			function swapToIframe(url) {
				const iframe = {
					id,
					title,
					groupId,
					icon,
					type: "iframe",
					url
				};
				ctx.docks.update(iframe);
			}
			async function disposeSession() {
				if (session) await session.terminate().catch(() => {});
				session = void 0;
				servedUrl = void 0;
				ctx.terminals.sessions.delete(sessionId);
			}
			ctx.commands.register({
				id: commandId,
				title: options.command?.title ?? label,
				icon: options.command?.icon ?? icon,
				keybindings: options.command?.keybindings,
				handler: launch
			});
			ctx.docks.register(entry("idle"));
			async function launch(payload = {}) {
				if (ctx.terminals.sessions.get(sessionId)?.status === "running") {
					if (serve && servedUrl) swapToIframe(servedUrl);
					return;
				}
				try {
					await prepare?.();
					await disposeSession();
					const execute = typeof executeOptions === "function" ? await executeOptions(payload) : executeOptions;
					session = await ctx.terminals.startChildProcess(execute, {
						id: sessionId,
						title: options.session?.title ?? label,
						icon: options.session?.icon ?? "ph:terminal-window-duotone"
					});
					if (serve) {
						ctx.docks.update(entry("loading", {
							tracking: true,
							progress: "Waiting for the server…"
						}));
						const activeSession = session;
						const resultPromise = (async () => activeSession.getResult())();
						const readyPromise = (async () => serve.onReady(activeSession))();
						const exitPromise = (async () => {
							const result = await resultPromise;
							throw diagnostics.DTK0052({
								id,
								exitCode: result.exitCode
							});
						})();
						readyPromise.catch(() => {});
						exitPromise.catch(() => {});
						const url = await Promise.race([readyPromise, exitPromise]);
						servedUrl = url;
						swapToIframe(url);
						resultPromise.then(() => {
							if (session !== activeSession) return;
							servedUrl = void 0;
							ctx.docks.update(entry("idle"));
						}, () => {});
						return;
					}
					ctx.docks.update(entry("success", {
						tracking: true,
						progress: "Running"
					}));
					session.getResult().then((result) => {
						ctx.docks.update(result.exitCode === 0 ? entry("success", {
							tracking: true,
							progress: "Finished"
						}) : entry("error", {
							tracking: true,
							error: `Process exited with code ${result.exitCode ?? "null"}.`
						}));
					}, () => {});
				} catch (error) {
					ctx.docks.update(entry("error", {
						tracking: true,
						error: error instanceof Error ? error.message : String(error)
					}));
					throw error;
				}
			}
		} }
	};
}
//#endregion
//#region src/node/utils.ts
/** Detect Vite+ from the project directory when selecting its toolchain commands. */
function isVitePlusInstalled(cwd) {
	return isPackageExists("vite-plus", { paths: [cwd] });
}
function toDataURL(code) {
	return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
/**
* Create a quick `ClientScriptEntry` from an inline function or
* stringified code. Useful for prototyping `action` / `renderer`
* dock entries without setting up a separate importable module.
*
* @experimental Prefer a proper importable module for production use.
*/
function createSimpleClientScript(fn) {
	return {
		importFrom: toDataURL(`const fn = ${fn.toString()}; export default fn`),
		importName: "default"
	};
}
const DEVTOOLS_WS_PATH = `/__devtools/__ws`;
//#endregion
//#region src/node/vite-host.ts
/**
* Rewrite a route-bound (relative-`__ws`) connection meta so it stays dialable
* when served from a devframe's own base (e.g. `/__devframes-plugin-terminals/`)
* instead of `/__devtools/`. The client resolves `websocket.path` against the
* URL it fetched `__connection.json` from, so a bare `__ws` would resolve to the
* devframe's base, not the shared WS route. Recomputing it as a base-relative
* path keeps the endpoint pointing at `/__devtools/__ws` while staying
* proxy-safe (no server-baked origin).
*/
function rewriteWebsocketForBase(meta, base) {
	const ws = meta.websocket;
	if (ws && typeof ws === "object" && ws.path != null && ws.host == null && ws.port == null) return {
		...meta,
		websocket: {
			...ws,
			path: posix.relative(base, DEVTOOLS_WS_PATH)
		}
	};
	return meta;
}
function createViteDevToolsHost(options) {
	const { viteConfig, viteServer } = options;
	const workspaceRoot = options.workspaceRoot ?? viteConfig.root;
	let connectionMetaGetter;
	return {
		mountStatic(base, distDir) {
			if (viteConfig.command !== "serve") return;
			if (!viteServer) throw new Error("viteServer is required to mount static assets in dev mode");
			viteServer.middlewares.use(base, serveStaticNodeMiddleware(distDir));
		},
		mountConnectionMeta(base) {
			if (viteConfig.command !== "serve" || !viteServer) return;
			const route = `${base.replace(/\/$/, "")}/${DEVTOOLS_CONNECTION_META_FILENAME}`;
			viteServer.middlewares.use(route, async (_req, res) => {
				try {
					const meta = connectionMetaGetter ? await connectionMetaGetter() : { backend: "static" };
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(rewriteWebsocketForBase(meta, base)));
				} catch (error) {
					res.statusCode = 500;
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify({ error: "Failed to resolve connection meta" }));
					diagnostics.DTK0051({
						base,
						cause: error
					});
				}
			});
		},
		provideConnectionMeta(getter) {
			connectionMetaGetter = getter;
		},
		resolveOrigin() {
			const resolved = viteServer?.resolvedUrls?.local?.[0];
			if (resolved) return new URL(resolved).origin;
			const https = !!viteConfig.server.https;
			const host = typeof viteConfig.server.host === "string" ? viteConfig.server.host : "localhost";
			const port = viteConfig.server.port ?? (https ? 443 : 80);
			return `${https ? "https" : "http"}://${host === "0.0.0.0" || host === "::" || !host ? "localhost" : host}:${port}`;
		},
		getStorageDir(scope) {
			return scope === "workspace" ? join(workspaceRoot, "node_modules/.vite/devtools") : join(homedir(), ".vite/devtools");
		}
	};
}
//#endregion
export { DevToolsCommandsHost, DevToolsDockHost, DevToolsMessagesHost, DevToolsTerminalHost, createInstallLauncher, createKitContext, createPluginFromDevframe, createProcessLauncher, createSimpleClientScript, createViteDevToolsHost, isVitePlusInstalled };
