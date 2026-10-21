import { $ as McpSetting, V as DevframeDefinition, X as DevframeWsOptions, Y as DevframeSseOptions, jt as DevframeAuthHandler, s as DevframeNodeRpcSession } from "../context-dOWXVHc6.mjs";
import { n as DevframeRpcConnection, t as DevframeNodeRpcSessionMeta } from "../session-r6PDixP6.mjs";
import { o as StaticAssetsSource } from "../remote-assets-eBvSKZMS.mjs";
import { n as WsOriginRegistry } from "../ws-server-y2R76aSW.mjs";
import { c as StartedServer } from "../instance-shell-DrvOWxqh.mjs";
import { c as resolveMcpConnectionMeta, o as resolveDevServerPort, t as ResolveDevServerPortOptions } from "../_shared-BvDsc83f.mjs";
import { H3 } from "h3";
//#region src/adapters/dev.d.ts
export interface CreateDevServerOptions {
  /** Bind host. Default: `def.cli?.host ?? 'localhost'`. */
  host?: string;
  /**
   * Port to listen on. When omitted, falls back to
   * {@link resolveDevServerPort}, which respects `def.cli?.port` /
   * `portRange` / `random`.
   */
  port?: number;
  /**
   * Parsed flag bag forwarded to `setup(ctx, { flags })`. The dev
   * server itself only reads `flags.open` from this bag, and only when
   * {@link CreateDevServerOptions.openBrowser} is left undefined.
   */
  flags?: Record<string, unknown>;
  /**
   * Override the definition's `clientAssets`.
   * When neither this option nor the definition's client assets are set, the
   * dev server runs in **bridge mode**: only `__connection.json` and the WS
   * endpoint are mounted; the SPA is expected to be hosted elsewhere (e.g. by
   * a parent Vite/Nuxt dev server via `devframeViteBridge` from
   * `@devframes/vite`).
   */
  distDir?: StaticAssetsSource;
  /**
   * Override the SPA mount path. Defaults to
   * `resolveBasePath(def, 'standalone')` (i.e. `def.basePath` or `/`).
   */
  basePath?: string;
  /**
   * Override how the browser reaches the RPC WebSocket (`def.cli?.ws`).
   * See {@link DevframeWsOptions}: same-server route (default), a dedicated
   * port, or a remote origin. Pass `false` to serve no WebSocket at all;
   * clients connect over the SSE endpoint instead (`backend: 'sse'`).
   */
  ws?: DevframeWsOptions | false;
  /**
   * Extra origins to accept on the WS upgrade beyond the loopback default.
   * Add your LAN/tunnel origin here when reaching the tool from another
   * host. Pass `false` to disable origin checking entirely (not
   * recommended). Default: loopback-only.
   */
  allowedOrigins?: readonly string[] | WsOriginRegistry | false;
  /**
   * Override the SSE RPC endpoint control (`def.cli?.sse`), enabled by
   * default at `<base>__sse`. Pass `false` to disable, or a
   * {@link DevframeSseOptions} to rename the route.
   */
  sse?: boolean | DevframeSseOptions;
  /**
   * h3 app to mount the SPA + connection-meta routes on. When omitted
   * a fresh app is created. Pass a pre-configured app to attach custom
   * middleware (auth, logging, extra static assets) before devframe's
   * own handlers.
   */
  app?: H3;
  /**
   * Auto-open the browser. When `undefined` the resolution falls
   * through to `flags.open` (incl. string path) and finally
   * `def.cli?.open`. `false` disables the open regardless of the other
   * sources; a string opens that relative path.
   */
  openBrowser?: boolean | string;
  /**
   * Override how authentication resolves, taking precedence over
   * `def.cli?.auth`. Pass `false` to skip the gate entirely (the standard
   * choice for a **hosted** deployment where the host manages auth; see
   * {@link devframeViteBridge} from `@devframes/vite`); a {@link DevframeAuthHandler} to install a custom
   * scheme; or `true` to force devframe's interactive OTP gate on. When
   * omitted, auth resolves from `flags.auth` / `def.cli?.auth` (the standalone
   * default: gated). The `--no-auth` flag (`flags.auth === false`) still forces
   * the gate off regardless of this option.
   */
  auth?: boolean | DevframeAuthHandler;
  /**
   * Expose a route-based MCP server on the dev server (Streamable-HTTP).
   * `undefined` falls through to the `'auto'` default (mount once the agent
   * surface is non-empty). `false` disables the route regardless. See
   * {@link McpSetting}.
   */
  mcp?: McpSetting;
  /**
   * Called once per new RPC connection, right after its session is created.
   * Forwarded verbatim to the underlying transport binding.
   */
  onPeerConnect?: (connection: DevframeRpcConnection, session: DevframeNodeRpcSession) => void;
  /**
   * Called once per closed RPC connection, right after its session's
   * disconnect bookkeeping runs. Forwarded verbatim to the underlying
   * transport binding.
   */
  onPeerDisconnect?: (connection: DevframeRpcConnection, meta: DevframeNodeRpcSessionMeta) => void;
  /**
   * Called once the WS server is bound. Devframe stays headless
   * otherwise, so wire this if you want a startup banner.
   */
  onReady?: (info: {
    origin: string;
    port: number;
    app: H3;
  }) => void | Promise<void>;
  /**
   * Proceed even when the definition declares `capabilities.dev: false`.
   * `createDevServer` otherwise refuses such a definition (`DF0058`); this
   * only matters for a caller invoking it directly, bypassing the CLI.
   */
  force?: boolean;
}
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
export declare function createDevServer(def: DevframeDefinition, options?: CreateDevServerOptions): Promise<StartedServer>;
//#endregion
export { type ResolveDevServerPortOptions, resolveDevServerPort, resolveMcpConnectionMeta };