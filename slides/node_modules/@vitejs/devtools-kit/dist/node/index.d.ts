import { CreateHubContextOptions, DevframeCommandsHost as DevToolsCommandsHost, DevframeDocksHost as DevToolsDockHost, DevframeHubContext, DevframeMessagesHost as DevToolsMessagesHost, DevframeTerminalsHost as DevToolsTerminalHost } from "@devframes/hub/node";
import { CreateJsonRenderViewOptions } from "@devframes/json-render/node";
import { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { DevframeJsonRenderSpec, JsonRenderViewRef, UIElement } from "@devframes/json-render";
import { ClientScriptEntry, ConnectionMeta, DevframeCapabilities, DevframeChildProcessExecuteOptions as DevToolsChildProcessExecuteOptions, DevframeChildProcessTerminalSession as DevToolsChildProcessTerminalSession, DevframeCommandKeybinding as DevToolsCommandKeybinding, DevframeDockEntryIcon, DevframeViewIframe } from "@devframes/hub/types";
import { DevframeDefinition, DevframeHost } from "devframe/types";
import "@devframes/hub/initiate";
import "@devframes/json-render/hub";
import "devframe/rpc";
//#region src/types/json-render.d.ts
/** A json-render spec — the declarative UI description a plugin authors. */
type JsonRenderSpec<Element extends UIElement = UIElement> = DevframeJsonRenderSpec<Element>;
/**
 * The handle returned by `ctx.createJsonRenderer()`. It wraps a devframe
 * {@link JsonRenderView} (created via `@devframes/json-render`'s
 * `createJsonRenderView`) and exposes the kit's back-compat method names.
 *
 * Register a `json-render` dock entry with the handle's serializable
 * {@link JsonRenderViewRef} `view` (`docks.register({ type: 'json-render',
 * view: renderer.view, … })`); the client subscribes through its `stateKey`.
 * Drive the panel by calling `updateSpec` / `updateState` on the handle.
 */
interface JsonRenderer<SpecType extends JsonRenderSpec = JsonRenderSpec> {
  /** Replace the entire spec. */
  updateSpec: (spec: SpecType) => void;
  /** Shallow-merge values into the view's `state`. */
  updateState: (state: Record<string, unknown>) => void;
  /** Unregister the underlying view's shared state and listeners. */
  dispose: () => void;
  /** Shared-state key the client subscribes to for the live spec + state. */
  readonly _stateKey: string;
  /** The serializable reference to the underlying view. */
  readonly view: JsonRenderViewRef<SpecType>;
}
//#endregion
//#region src/node/context.d.ts
/**
 * Kit-augmented node context — the framework-neutral hub context from
 * `@devframes/hub`, plus the Vite-specific slots surfaced when kit hosts
 * the devtool inside Vite DevTools, and the kit's `createJsonRenderer`
 * factory (json-render is the opt-in `@devframes/json-render` package, so
 * the kit — not the hub — surfaces it on the context). The factory is typed
 * against `@devframes/json-render`'s `Spec` (`props` required).
 */
export interface KitNodeContext extends DevframeHubContext {
  readonly viteConfig?: ResolvedConfig;
  readonly viteServer?: ViteDevServer;
  /**
   * Create a json-render handle for building declarative, server-driven
   * panels. Register a `json-render` dock entry with the handle's `view` ref
   * (`docks.register({ type: 'json-render', view: renderer.view, … })`) and
   * call `updateSpec` / `updateState` on the handle to drive it reactively.
   */
  createJsonRenderer: <SpecType extends JsonRenderSpec>(spec: SpecType, options?: Pick<CreateJsonRenderViewOptions<SpecType>, 'schema'>) => JsonRenderer<SpecType>;
}
export interface CreateKitContextOptions extends CreateHubContextOptions {
  /** Optional Vite resolved config to surface on the context (for Vite-mounted hubs). */
  viteConfig?: ResolvedConfig;
  /** Optional Vite dev server to surface on the context. */
  viteServer?: ViteDevServer;
}
/**
 * Create a kit-level node context: wraps `@devframes/hub`'s
 * `createHubContext` (which itself wraps devframe's `createHostContext`)
 * and attaches the Vite-specific slots plus the `createJsonRenderer`
 * factory. The hub layer owns the docks/terminals/messages/commands
 * subsystems and seeds the shared-state sync the unified client UI consumes.
 */
export declare function createKitContext(options: CreateKitContextOptions): Promise<KitNodeContext>;
//#endregion
//#region src/types/vite-plugin.d.ts
interface DevToolsPluginOptions {
  capabilities?: {
    dev?: DevframeCapabilities | boolean;
    build?: DevframeCapabilities | boolean;
  };
  setup: (context: ViteDevToolsNodeContext) => void | Promise<void>;
}
/**
 * Vite-extended node context — kit-augmented context with the four hub
 * subsystems (`docks`, `terminals`, `messages`, `commands`) plus the
 * Vite-specific slots (`viteConfig`, `viteServer`). Plugins running
 * under `@vitejs/devtools` rely on this surface; portable devframe
 * apps should target {@link KitNodeContext} or the framework-neutral
 * `DevframeNodeContext` from `devframe/types`.
 */
interface ViteDevToolsNodeContext extends KitNodeContext {
  readonly viteConfig: ResolvedConfig;
  readonly viteServer?: ViteDevServer;
}
//#endregion
//#region src/types/vite-augment.d.ts
declare module 'vite' {
  interface Plugin {
    devtools?: DevToolsPluginOptions;
  }
}
interface PluginWithDevTools extends Plugin {
  devtools?: DevToolsPluginOptions;
}
//#endregion
//#region src/node/create-install-launcher.d.ts
export interface InstallLauncherOptions {
  /**
   * Dock entry id. Usually the same id the real integration registers once
   * installed, so the launcher and the mounted dock share the same rail slot.
   */
  id: string;
  /** Dock title (rail tooltip / group member label). */
  title: string;
  /** Dock + launcher icon — a served URL or an Iconify `collection:name`. */
  icon: DevframeDockEntryIcon;
  /** Dock group id, e.g. `'viteplus'`. */
  groupId?: string;
  /**
   * Friendly label for the thing being installed, used in the launcher copy.
   * Defaults to {@link InstallLauncherOptions.title}.
   */
  label?: string;
  /** Vite plugin name. Defaults to `vite:devtools:install-launcher:${id}`. */
  name?: string;
  /**
   * The canonical package this launcher installs, named in the button copy
   * (e.g. `Install @vitejs/devtools-oxc`) — concrete and greppable, unlike the
   * friendly {@link InstallLauncherOptions.label}. Defaults to the bare name
   * of the first {@link InstallLauncherOptions.install} spec.
   */
  pkg?: string;
  /**
   * npm specs to ensure are installed when the launcher is clicked, e.g.
   * `['@vitejs/devtools-rolldown@^0.4.1']`. Only the specs whose package is
   * not already present get installed, in a single install call.
   */
  install: string[];
  /**
   * Install the packages as devDependencies.
   *
   * @default true
   */
  dev?: boolean;
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
export declare function createInstallLauncher(options: InstallLauncherOptions): PluginWithDevTools;
//#endregion
//#region src/node/create-plugin-from-devframe.d.ts
export interface CreatePluginFromDevframeOptions {
  /**
   * Vite plugin name override. Defaults to `devframe:${d.id}`.
   */
  name?: string;
  /**
   * Mount path override. Defaults to `d.basePath` or `/__${d.id}/`.
   */
  base?: string;
  /**
   * Overrides for the auto-synthesized iframe dock entry. Use this to
   * customize the entry's `category`, override the icon, hide it via
   * `when`, etc. Cannot change `id`, `type`, or `url` — those are
   * derived from the devframe definition.
   */
  dock?: Partial<Omit<DevframeViewIframe, 'id' | 'type' | 'url'>>;
  /**
   * Capability flags forwarded onto the kit plugin's `devtools` slot.
   * Defaults to `d.capabilities`.
   */
  capabilities?: DevframeCapabilities | {
    dev?: DevframeCapabilities | boolean;
    build?: DevframeCapabilities | boolean;
  };
  /**
   * Additional kit-only setup hook. Runs after the devframe-level
   * `d.setup(ctx)` and after the auto-derived dock entry has been
   * registered. Use this for kit-specific behavior that should not
   * bleed into the portable {@link DevframeDefinition} — e.g.
   * registering terminals/commands/messages, or enriching the
   * synthesized dock entry.
   */
  setup?: (ctx: KitNodeContext) => void | Promise<void>;
}
/**
 * Wrap a {@link DevframeDefinition} as a Vite plugin that mounts inside
 * `@vitejs/devtools` (Vite DevTools). Delegates the mount work
 * (serving the SPA, registering the iframe dock entry, calling
 * `d.setup(ctx)`) to the hub context's `ctx.install`, then runs the
 * optional kit-only `options.setup` hook.
 */
export declare function createPluginFromDevframe(d: DevframeDefinition, options?: CreatePluginFromDevframeOptions): PluginWithDevTools;
//#endregion
//#region src/types/docks.d.ts
/**
 * A selectable launch root offered by a launcher dock entry.
 *
 * When a launcher supplies {@link DevToolsViewLauncher.launcher.roots}, the
 * viewer renders a picker above the launch button. The selected root's
 * {@link DevToolsLaunchRoot.value} is forwarded to the launch as `{ root }`,
 * where a `createProcessLauncher` uses it as the spawned process's `cwd`.
 */
interface DevToolsLaunchRoot {
  /** Absolute path forwarded as the spawn `cwd` when this root is selected. */
  value: string;
  /** Human-friendly label shown in the picker (e.g. `Workspace root`). */
  label: string;
  /** Optional secondary line, e.g. the path itself. */
  description?: string;
}
/**
 * Payload carried from the client launch action to the bound launch command.
 */
interface DevToolsLaunchPayload {
  /** The {@link DevToolsLaunchRoot.value} of the root the user selected. */
  root?: string;
}
//#endregion
//#region src/node/create-process-launcher.d.ts
type Awaitable<T> = T | Promise<T>;
export interface ProcessLauncherOptions {
  /** Dock id. Also the default terminal-session id and command-id base. */
  id: string;
  /** Dock rail title. */
  title: string;
  /** Dock + launcher icon — a served URL or an Iconify `collection:name`. */
  icon: DevframeDockEntryIcon;
  /** Dock group id */
  groupId?: string;
  /** Launcher card title. Defaults to {@link ProcessLauncherOptions.title}. */
  label?: string;
  /** Launcher card description. */
  description?: string;
  /** Launch button copy. */
  buttonStart?: string;
  buttonLoading?: string;
  /**
   * The child process spawned when the launcher is invoked. Pass a function to
   * resolve it lazily on each launch — e.g. to pick a free port and build args.
   * The function receives the launch payload, including the `root` the user
   * picked from {@link ProcessLauncherOptions.roots} (use it as the spawn `cwd`).
   */
  process: DevToolsChildProcessExecuteOptions | ((payload: DevToolsLaunchPayload) => Awaitable<DevToolsChildProcessExecuteOptions>);
  /**
   * Selectable launch roots. When provided, the launcher card renders a picker
   * above the launch button, and the chosen root's `value` is forwarded to
   * {@link ProcessLauncherOptions.process} as `payload.root`.
   */
  roots?: DevToolsLaunchRoot[];
  /**
   * Runs once per launch, before the process is spawned. Use it for on-demand
   * setup such as installing an optional dependency. Throwing here surfaces on
   * the launcher as an error (and rejects the bound command).
   */
  prepare?: () => Awaitable<void>;
  /**
   * Turn the launcher into an embedded server view. After the process spawns,
   * `onReady` runs (do your own readiness probing there) and resolves the URL
   * to embed; the dock then swaps from a launcher to an iframe at that URL. The
   * card streams the startup digest while `onReady` is pending. Omit to keep a
   * plain terminal-tailing launcher.
   */
  serve?: {
    onReady: (session: DevToolsChildProcessTerminalSession) => Awaitable<string>;
  };
  /**
   * Command binding. The launch action is registered as a command so it fires
   * from the launch button, the palette, and any keybinding. Defaults the
   * command id to `${id}:launch`.
   */
  command?: {
    id?: string;
    title?: string;
    icon?: DevframeDockEntryIcon;
    keybindings?: DevToolsCommandKeybinding[];
  };
  /** Terminal-session metadata. Session id defaults to {@link ProcessLauncherOptions.id}. */
  session?: {
    id?: string;
    title?: string;
    icon?: DevframeDockEntryIcon;
  };
  /** Vite plugin name. Defaults to `vite:devtools:process-launcher:${id}`. */
  name?: string;
}
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
export declare function createProcessLauncher(options: ProcessLauncherOptions): PluginWithDevTools;
//#endregion
//#region src/node/utils.d.ts
/** Detect Vite+ from the project directory when selecting its toolchain commands. */
export declare function isVitePlusInstalled(cwd: string): boolean;
/**
 * Create a quick `ClientScriptEntry` from an inline function or
 * stringified code. Useful for prototyping `action` / `renderer`
 * dock entries without setting up a separate importable module.
 *
 * @experimental Prefer a proper importable module for production use.
 */
export declare function createSimpleClientScript(fn: string | ((ctx: any) => void)): ClientScriptEntry;
//#endregion
//#region src/node/vite-host.d.ts
export interface CreateViteDevToolsHostOptions {
  viteConfig: ResolvedConfig;
  viteServer?: ViteDevServer;
  /**
   * Workspace root used as the parent of the per-project storage
   * directory. Threaded in by the consumer (typically resolved via
   * `searchForWorkspaceRoot`). Defaults to `viteConfig.root`.
   */
  workspaceRoot?: string;
}
/**
 * The Vite DevTools host, extended with {@link ViteDevToolsHost.provideConnectionMeta}
 * so the caller can hand the host a live connection-meta getter once the RPC/WS
 * server exists (it doesn't yet when the host is created).
 */
export interface ViteDevToolsHost extends DevframeHost {
  /**
   * Supply the getter that resolves the current RPC connection meta. The
   * `mountConnectionMeta` middleware calls it lazily (at request time), so the
   * host can be created before the WS server allocates its endpoint.
   */
  provideConnectionMeta: (getter: () => ConnectionMeta | Promise<ConnectionMeta>) => void;
}
export declare function createViteDevToolsHost(options: CreateViteDevToolsHostOptions): ViteDevToolsHost;
//#endregion
export { DevToolsCommandsHost, DevToolsDockHost, DevToolsMessagesHost, DevToolsTerminalHost };