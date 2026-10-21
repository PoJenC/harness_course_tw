import { a as InstallDevframeOptions, n as DevframeHubContext, t as CreateHubContextOptions } from "../context-BK50aJ-F.mjs";
import { r as DEVFRAMES_HUB_BASE } from "../constants-C7cDDASI.mjs";
import { DevframeInstanceRecord } from "devframe/internal";
import { Buffer } from "node:buffer";
import { AuthBannerFunction } from "devframe/recipes/interactive-auth";
import { ConnectionMeta, DevframeDefinition, DevframeServiceInput, DevframeSseOptions, DevframeStorageScope, DevframeWsOptions, McpSetting } from "devframe/types";
import { DevframeAuthHandler } from "devframe/node/auth";
import { WsOriginRegistry } from "devframe/rpc/transports/ws-server";
import { IncomingMessage, Server, ServerResponse } from "node:http";
import { Duplex } from "node:stream";
//#region src/node/initiate.d.ts
/** A `devframes` entry with per-mount dock customization. */
export interface HubDevframeEntry {
  devframe: DevframeDefinition;
  /** Per-mount overrides for the auto-synthesized iframe dock entry. */
  dock?: InstallDevframeOptions['dock'];
}
type Thenable<T> = T | Promise<T>;
type Arrayable<T> = T | readonly T[];
/**
 * One dock-type → prebuilt renderer-module registration for
 * {@link InitHubOptions.renderers}. The hub serves the module at
 * `<base>__renderers/<type>.mjs` and publishes it in the renderer manifest
 * (the `devframe:dock-renderers` shared-state slot), so any viewer (the
 * reference UI, a community viewer, a hand-rolled host page) lazily imports
 * it the first time a dock of that `type` needs rendering.
 *
 * The module must be a **self-contained browser ES module** (its framework
 * and styles bundled in) whose {@link DockRendererRegistration.importName}
 * export is a ready `DockRenderer`. Renderer packages ship a node helper
 * returning this shape, e.g. `jsonRenderUiRenderer()` from
 * `@devframes/json-render-ui/hub`.
 */
export interface DockRendererRegistration {
  /** Dock `type` this renderer handles (e.g. `'json-render'`). */
  type: string;
  /** Absolute path of the prebuilt, self-contained browser ES module. */
  file: string;
  /**
   * Named export carrying the renderer.
   *
   * @default 'default'
   */
  importName?: string;
}
/**
 * The UI slot of a hub instance: pure data, zero policy. The hub itself is
 * headless: whoever fills this slot decides what a viewer looks like.
 * `@devframes/hub-ui` ships the reference implementation (`createUi()`);
 * Vite DevTools or any community viewer supplies its own object to the same
 * slot and reuses all the infrastructure.
 */
export interface DevframeHubUi {
  /**
   * A standalone viewer SPA (built with relative asset paths) served at the
   * hub base itself; open `<base>` in a tab and the devtools are there.
   */
  viewer?: {
    /** Directory of the prebuilt viewer SPA. */
    distDir: string;
  };
  /**
   * A prebuilt, self-contained script served at `<base>embedded.js`: the
   * floating-devtools bootstrap a host page loads with one
   * `<script type="module" src="<base>embedded.js">` tag. Visibility policy
   * (always-on, keyboard-summoned, …) belongs entirely to this entry.
   */
  embedded?: {
    /** File path of the prebuilt single-file module. */
    entry: string;
  };
  /**
   * Extra UI-owned files the hub serves at `<base><key>`, each produced lazily
   * from memory. Keys are base-relative paths; the content-type is inferred
   * from the key's extension. A generic seam a viewer uses to publish
   * arbitrary runtime documents without teaching the hub anything about
   * their meaning.
   */
  assets?: Record<string, () => string | Uint8Array>;
  /**
   * A setup hook run once during hub init with the hub context, giving the UI
   * slot a chance to publish its own static, boot-time config through the
   * generic `ctx.staticConfig` (serialized into `ConnectionMeta.configs`).
   * The reference UI's `createUi()` uses it to set
   * `ctx.staticConfig.ui = { branding, … }`, reaching every mounted frame and
   * the standalone viewer through the one connection handshake they perform.
   * The hub stays policy-free about what the UI writes.
   */
  setup?: (ctx: DevframeHubContext) => void | Promise<void>;
  /**
   * The interactive OTP banner (auth code + magic-link URL) to print when
   * {@link InitHubOptions.auth} is left at its default. A node-side
   * counterpart to `setup`'s browser-facing branding: the reference UI's
   * `createUi()` derives one from its own `branding.productName` via
   * `createAuthBanner` (see `devframe/recipes/interactive-auth`), so the
   * printed code matches the rebranded viewer without the caller wiring
   * `auth` themselves. Ignored once `auth` is set explicitly - a `false` or
   * a full {@link DevframeAuthHandler} both mean the caller owns the banner.
   */
  authBanner?: AuthBannerFunction;
}
export type DevframesInput = Array<DevframeDefinition | HubDevframeEntry | Thenable<Arrayable<DevframeDefinition | HubDevframeEntry | null | undefined>> | (() => Thenable<Arrayable<DevframeDefinition | HubDevframeEntry | null | undefined>>)>;
export interface InitHubOptions {
  /**
   * Name for the hub instance, used in logs and diagnostics, and mcp server.
   */
  name?: string;
  /**
   * Version for the hub instance, used in logs and diagnostics, and mcp server.
   */
  version?: string;
  /**
   * Mount base the hub answers under, required so the mount path is
   * explicit at the call site (pass the exported {@link DEVFRAMES_HUB_BASE}
   * for the conventional `/__devframes/`). Every mounted devframe lives at
   * `<base><id>/`, so the host app needs exactly one catch-all route. The
   * resolved value is echoed back as {@link HubInstance.base} so route and
   * middleware code references it instead of repeating the string.
   */
  base: string;
  /**
   * Devframes to mount: each runs its `setup()` against the shared hub
   * context (one merged RPC registry, one WebSocket, one auth gate), serves
   * its SPA at `<base><id>/`, and is auto-registered as an iframe dock.
   * Wrap an entry in `{ devframe, dock }` to customize its synthesized dock
   * (category, icon, a `clientScript` to run in the host page, …).
   */
  devframes?: DevframesInput;
  /**
   * Host-level wire services to install, on top of whatever the mounted
   * devframes declare. Constructed (option sets merged) at the pre-setup
   * barrier, so every devframe's `setup` sees them ready. Reach for this to
   * configure a shared service centrally, e.g.
   * `services: [createShikiService({ themes })]`.
   */
  services?: DevframeServiceInput[];
  /**
   * Extra RPC declarations registered at context creation, alongside the
   * hub built-ins, forwarded to `createHubContext`'s
   * `builtinRpcDeclarations`. Declarative mode only (a pre-built `context`
   * already made this choice).
   */
  rpcDeclarations?: CreateHubContextOptions['builtinRpcDeclarations'];
  /**
   * Bring your own hub context instead of `devframes`, for hosts that
   * assemble `createHubContext` + `ctx.install` themselves (with their own
   * `DevframeHost` serving the frames). The instance then serves only the
   * hub-level endpoints (`__connection.json`, `__index.json`,
   * `__client-imports.js`, the WS transport, MCP, and the `ui` slot);
   * serve each frame's meta yourself from {@link HubInstance.connectionMeta}.
   */
  context?: DevframeHubContext;
  /**
   * Runs once the context exists and every `devframes` entry is mounted;
   * register docks, commands, terminals, and messages surfaces here.
   */
  configure?: (ctx: DevframeHubContext) => void | Promise<void>;
  /** See {@link DevframeHubUi}; omitted, the hub stays fully headless. */
  ui?: DevframeHubUi;
  /**
   * Prebuilt dock-renderer modules to serve and advertise: the composition
   * seam that hands a renderer package (e.g. `@devframes/json-render-ui`) to
   * a prebuilt viewer. Each {@link DockRendererRegistration} is served at
   * `<base>__renderers/<type>.mjs` and published in the renderer manifest;
   * clients import a module lazily the first time a dock of its `type`
   * mounts. Renderers registered directly in client code
   * (`createDevframeClientRuntime({ renderers })`) take precedence.
   *
   * ```ts
   * import { jsonRenderUiRenderer } from '@devframes/json-render-ui/hub'
   *
   * initHub({ ui: createUi(), renderers: [jsonRenderUiRenderer()] })
   * ```
   */
  renderers?: readonly DockRendererRegistration[];
  /**
   * Share the host's `node:http` server for the WebSocket RPC endpoint
   * (upgrade bound at `<base>__ws`). Hosts whose handlers never see upgrades
   * (Next.js route handlers, Nitro, Rsbuild) ask for a side-car instead with
   * `ws: { sidecar: true }`; hosts that get their server later wire
   * {@link HubInstance.attach} / {@link HubInstance.handleUpgrade}.
   */
  server?: Server;
  /**
   * Explicit WebSocket control, same contract as `initDevframe`: the local
   * binding resolves `ws.port` (pinned side-car) > `server` (shared upgrade)
   * > `ws.sidecar` (auto-port side-car) > the host driving upgrades itself,
   * while `url` overrides the advertisement (tunnel pattern) and `route`
   * renames the upgrade segment (default `__ws`). Pass `false` to serve no
   * WebSocket at all, so clients connect over SSE instead (`backend: 'sse'`).
   */
  ws?: DevframeWsOptions | false;
  /**
   * SSE RPC endpoint control, same contract as `initDevframe`, enabled by
   * default at `<base>__sse` as the more portable transport alongside the
   * WebSocket. Pass `false` to disable, or a {@link DevframeSseOptions} to
   * rename the route.
   */
  sse?: boolean | DevframeSseOptions;
  /** Bind host for a side-car WebSocket server. Default: `localhost`. */
  host?: string;
  /**
   * The hub's **single Auth**: one gate at the one shared transport covers
   * every mounted frame, the MCP route, and the hub built-ins. Gates by
   * default (devframe's interactive OTP); `false` opts out; a
   * {@link DevframeAuthHandler} installs a custom scheme.
   */
  auth?: boolean | DevframeAuthHandler;
  /**
   * Expose the **aggregate** MCP endpoint at `<base>__mcp`: one
   * Streamable-HTTP server over the shared context's whole tool registry
   * (ids are already namespaced per plugin). Defaults to `'auto'`: the route
   * mounts once any mounted devframe (or an agent-flagged hub command)
   * exposes an agent surface. `true` mounts it
   * unconditionally with the loopback origin gate (trusting same-machine
   * callers), an object opts into an {@link McpRouteOptions.authorization}
   * identity check, `false` keeps it off. The hub's aggregate route covers
   * every mounted devframe's tools.
   */
  mcp?: McpSetting;
  /**
   * Public origin the host app is reachable at, or a getter. Derived lazily
   * from the first request when omitted.
   */
  origin?: string | (() => string);
  /**
   * Publish this hub in the global instance registry
   * (`~/.devframe/instances/`) so discovery tooling (`devframe connect`, the
   * inspect plugin's Instances tab) lists it like any standalone devframe.
   * Registration is a dynamic import that fires once the public origin
   * resolves and is torn down on {@link HubInstance.close}. Defaults to off;
   * pass `true` to enable, or an object to override individual record fields
   * (`id`, `name`, `basePath`, …).
   */
  register?: boolean | Partial<DevframeInstanceRecord>;
  /**
   * Advertise that this host runtime resolves **bare-specifier** client
   * scripts (`ClientScriptEntry.importFrom` naming an npm module): a URL
   * template whose `{specifier}` token is replaced with the specifier,
   * published as `ConnectionMeta.configs.dock.clientModuleResolution` and
   * applied by every client-script loader. Declare it only when the host can
   * actually serve npm modules to the browser; a Vite host passes
   * `'/@id/{specifier}'` to route imports through its own module graph
   * (`@devframes/vite/hub` does). Left undeclared, registering a
   * bare-specifier client script warns `DF8111`; ship a self-contained
   * bundle and pass its URL instead.
   */
  clientModuleResolution?: string;
  /** Working directory for the hub context. Default: `process.cwd()`. */
  cwd?: string;
  /** Override where persisted devframe state lives. */
  getStorageDir?: (scope: DevframeStorageScope) => string;
  /** Extra WS-upgrade origins beyond the loopback default; `false` disables the gate. */
  allowedOrigins?: readonly string[] | WsOriginRegistry | false;
  /** Destroy off-route upgrades on a shared `server` devframe's adapter owns outright. */
  destroyUnmatchedUpgrades?: boolean;
}
export interface HubInstance {
  /**
   * The normalized mount base this hub answers under (leading and trailing
   * slash, e.g. `/__devframes/`). Reference it when wiring the mount (route
   * guards, middleware path checks) instead of repeating the string literal.
   */
  base: string;
  /**
   * Web-standard request handler for the whole hub; mount it on one
   * catch-all route under {@link HubInstance.base}.
   */
  handler: (request: Request) => Promise<Response>;
  /** Connect/Express-style middleware over the same surface; `next()`s outside the base. */
  nodeMiddleware: (req: IncomingMessage, res: ServerResponse, next?: (err?: unknown) => void) => void;
  /**
   * Route a host server's `upgrade` events to the shared RPC socket,
   * returning a detach function, the manual counterpart to the `server`
   * option, for hosts that get their `node:http` server only after the hub
   * exists. Available on the default tier; a configured transport (`server`,
   * `ws.port`, `ws.sidecar`, `ws.url`) already owns the socket and reports
   * `DF0055` / `DF0056` instead.
   */
  attach: (server: Server) => () => void;
  /**
   * Complete a single `upgrade` event on the shared RPC socket, for hosts
   * that already own an `upgrade` listener. Same availability as
   * {@link HubInstance.attach}.
   */
  handleUpgrade: (req: IncomingMessage, socket: Duplex, head: Buffer) => void;
  /** Resolves once every frame is mounted and the WebSocket binding is live. */
  ready: Promise<void>;
  /** The shared hub context, once initialized. */
  context: Promise<DevframeHubContext>;
  /** The `ConnectionMeta` served at `<base>__connection.json` (and every frame base). */
  connectionMeta: () => ConnectionMeta;
  /** Tear down: WS transport/side-car, MCP handler. */
  close: () => Promise<void>;
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
export declare function initHub(options: InitHubOptions): HubInstance;
//#endregion
export { DEVFRAMES_HUB_BASE };