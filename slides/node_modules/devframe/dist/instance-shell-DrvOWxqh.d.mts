import { n as BirpcGroup } from "./index-Bia1vKjL.mjs";
import { Tt as DevframeRpcServerFunctions, X as DevframeWsOptions, Y as DevframeSseOptions, jt as DevframeAuthHandler, o as DevframeNodeContext, s as DevframeNodeRpcSession, t as ConnectionMeta, wt as DevframeRpcClientFunctions } from "./context-dOWXVHc6.mjs";
import { n as DevframeRpcConnection, t as DevframeNodeRpcSessionMeta } from "./session-r6PDixP6.mjs";
import { n as WsOriginRegistry } from "./ws-server-y2R76aSW.mjs";
import "./index-DVGcpYm7.mjs";
import { H3 } from "h3";
import { NodeAdapter } from "crossws/adapters/node";
import { Buffer } from "node:buffer";
import { IncomingMessage, Server, ServerResponse } from "node:http";
import { Duplex } from "node:stream";
//#region src/node/instance-registry.d.ts
/**
 * One running devframe instance, as recorded in the instance registry.
 * Records are self-describing JSON, so additive fields are safe.
 */
interface DevframeInstanceRecord {
  /** Process id of the dev server. */
  pid: number;
  /** Listening port. */
  port: number;
  /** Dialable HTTP origin, e.g. `http://127.0.0.1:9876`. */
  origin: string;
  /** Base path the devframe is mounted at (trailing slash). */
  basePath: string;
  /** Definition id. */
  id: string;
  /** Definition display name. */
  name?: string;
  /** Working directory the instance was started from. */
  rootDir: string;
  /**
   * Absolute URL path of the MCP Streamable-HTTP endpoint on `origin`, or
   * `null` when the instance runs without an MCP route.
   */
  mcp: {
    path: string;
  } | null;
  /** Epoch-ms timestamp of registration. */
  startedAt: number;
}
/**
 * Handle returned by {@link registerDevframeInstance}.
 */
interface DevframeInstanceRegistration {
  /** The registry file backing this registration. */
  readonly file: string;
  /** Remove the record (idempotent). Call on server close. */
  unregister: () => void;
}
/**
 * Record a running devframe instance in the global instance registry so
 * discovery tooling (`devframe connect`, editor integrations) can find it
 * without port guessing.
 *
 * `createDevServer` registers automatically; custom hosts that serve a
 * devframe in-process (e.g. `@devframes/next`'s host inside a Next dev
 * server) call this explicitly with the origin they are reachable at.
 *
 * The record is written atomically to `<dir>/<pid>-<port>.json` and removed
 * by {@link DevframeInstanceRegistration.unregister}. Records surviving a
 * crash are pruned by readers whose liveness probe fails. Registration never
 * throws; a write failure degrades to a coded warning (`DF0045`), since a
 * dev server must not die over discovery metadata.
 */
declare function registerDevframeInstance(record: DevframeInstanceRecord, options?: {
  instancesDir?: string;
}): DevframeInstanceRegistration;
/**
 * A successful `__connection.json` probe: the dialable origin that
 * answered plus the parsed connection meta it served.
 *
 * @internal
 */
interface ProbedDevframeOrigin {
  /** The origin that answered (may be an explicit address family for a `localhost` bind). */
  origin: string;
  /** The parsed `__connection.json` payload (always a JSON object). */
  meta: {
    mcp?: {
      path: string;
      port?: number;
    };
  };
}
/**
 * Probe `<origin><basePath>__connection.json`, trying each dialable
 * candidate for the origin (see {@link originCandidates}). The single
 * probe primitive behind both registry liveness checks and the
 * connector's explicit `--port` probes. A candidate counts only when it
 * answers `2xx` with a JSON object; anything else (an HTML SPA fallback, a
 * JSON array, an unparseable body) is treated as "no devframe here".
 *
 * @internal
 */
declare function probeDevframeOrigin(origin: string, basePath: string, timeoutMs?: number): Promise<ProbedDevframeOrigin | null>;
/**
 * Read the registry and split records into live and dead by probing each
 * one's `__connection.json`, deleting dead records (prune-on-read). Live
 * records carry the dialable origin the probe confirmed (a `localhost`
 * record may come back as `127.0.0.1` / `[::1]`).
 *
 * A liveness probe only proves *something* answers on the record's port, so
 * records left behind by killed processes shadow the server currently bound
 * there: per `(port, basePath)` only the newest record survives, older
 * ghosts are pruned with the dead.
 */
declare function listLiveDevframeInstances(options?: {
  instancesDir?: string;
  timeoutMs?: number;
}): Promise<{
  live: DevframeInstanceRecord[];
  pruned: DevframeInstanceRecord[];
}>;
//#endregion
//#region src/node/instance-shell.d.ts
/**
 * The live handle for a bound HTTP + WebSocket RPC server: what the
 * side-car / shared-server tiers produce and what {@link createDevServer}
 * re-exposes through its own return contract.
 */
interface StartedServer {
  /** Listening origin, e.g. `http://localhost:9999`. */
  origin: string;
  port: number;
  app: H3;
  /**
   * The crossws node adapter driving the RPC socket (connected peers,
   * pub/sub). Absent when the WebSocket transport is disabled (`ws: false`).
   */
  ws?: NodeAdapter;
  rpcGroup: BirpcGroup<DevframeRpcClientFunctions, DevframeRpcServerFunctions, false>;
  /**
   * The {@link ConnectionMeta} descriptor for this server, the same shape a
   * `__connection.json` route should serve so a devframe client's
   * `resolveWsUrl` can dial back in.
   */
  connectionMeta: () => ConnectionMeta;
  close: () => Promise<void>;
}
/**
 * How the instance's RPC socket is bound:
 *
 * - `sidecar`: its own HTTP+WS server on a dedicated port (`ws.port` /
 *   `ws.sidecar`), advertised with that port.
 * - `server`: a shared upgrade route on the host's `node:http` server.
 * - `external`: no local transport; `ws.url` alone names a server that owns
 *   both the socket and its auth.
 * - `unbound`: the transport exists but nothing is bound to it yet; the host
 *   drives it through {@link InstanceShell.handleUpgrade} /
 *   {@link InstanceShell.attach}.
 * - `disabled` (`ws: false`): no WebSocket at all; clients connect over the
 *   SSE endpoint instead (`backend: 'sse'`).
 */
type InstanceWsTier = 'sidecar' | 'server' | 'external' | 'unbound' | 'disabled';
/** The live shell surface an `init` / `mount` callback can reach. */
interface InstanceShellApi {
  /** The normalized mount base, with leading and trailing slash. */
  base: string;
  /** The h3 app every route is mounted on. */
  app: H3;
  /** The public origin, once known (pinned, or derived from the first request). */
  origin: () => string | undefined;
  /** The connection meta, once the transport has resolved. */
  connectionMeta: () => ConnectionMeta | undefined;
}
/** What an instance's own initialization contributes to the shell. */
interface InstanceShellInit<TContext extends DevframeNodeContext> {
  /** The context every mounted surface shares. */
  context: TContext;
  /** The `mcp` entry to advertise, when an MCP route was mounted. */
  mcp?: ConnectionMeta['mcp'];
  /** Torn down before the transport on `close()` (e.g. MCP sessions). */
  dispose?: () => Promise<void>;
}
interface CreateInstanceShellOptions<TContext extends DevframeNodeContext> {
  /** Normalized mount base (leading and trailing slash). */
  base: string;
  /** h3 app to mount on. A fresh one is created when omitted. */
  app?: H3;
  /** Public origin, or a getter. Derived from the first request when omitted. */
  origin?: string | (() => string);
  /**
   * Resolved auth intent: `undefined`/`true` gates with {@link createInteractiveAuth}'s
   * defaults, `false` opts out, a handler installs a custom scheme outright.
   * A function gates too, but builds the handler itself from the now-ready
   * `ctx` - the seam a wrapping host (e.g. `@devframes/hub`'s UI slot) uses to
   * hand `createInteractiveAuth` a branded `banner` while still leaving `auth`
   * itself unset for the caller.
   */
  auth?: boolean | DevframeAuthHandler | ((ctx: TContext) => DevframeAuthHandler);
  /** Host `node:http` server to share the WS upgrade with. */
  server?: Server;
  /** Explicit WebSocket control; see {@link DevframeWsOptions}. `false` disables the socket (SSE-only). */
  ws?: DevframeWsOptions | false;
  /** SSE endpoint control, enabled by default; `false` disables, an object renames the route. */
  sse?: boolean | DevframeSseOptions;
  /** Bind host for a side-car WebSocket server. Default: `localhost`. */
  host?: string;
  /** Extra WS-upgrade origins beyond the loopback default; `false` disables the gate. */
  allowedOrigins?: readonly string[] | WsOriginRegistry | false;
  /** Destroy off-route upgrades on a shared `server`. */
  destroyUnmatchedUpgrades?: boolean;
  onPeerConnect?: (connection: DevframeRpcConnection, session: DevframeNodeRpcSession) => void;
  onPeerDisconnect?: (connection: DevframeRpcConnection, meta: DevframeNodeRpcSessionMeta) => void;
  /**
   * Advertise the WS and SSE routes as base-absolute paths (`<base>__ws` /
   * `<base>__sse`) instead of the base-relative default. A hub serves one
   * meta document from several bases, so its clients need the absolute form
   * to resolve the same endpoints.
   */
  absoluteWsPath?: boolean;
  /** Pick the first port a `ws.sidecar` server tries. Default: a random free port. */
  resolveSidecarPort?: (host: string) => Promise<number>;
  /**
   * Publish this instance in the global registry (`~/.devframe/instances/`)
   * once its public origin is known, via a dynamic import so the registry code
   * stays out of instances that opt out. Omit to skip registration.
   */
  register?: InstanceRegisterConfig;
  /** Create the context and mount everything that must precede the transport. */
  init: (api: InstanceShellApi) => Promise<InstanceShellInit<TContext>>;
  /** Mount the routes that describe the resolved transport (discovery, SPA). */
  mount?: (context: TContext, meta: ConnectionMeta, api: InstanceShellApi) => void | Promise<void>;
  /** Throw the instance's own diagnostic for `connectionMeta()` before readiness. */
  onMetaUnavailable: () => never;
}
/**
 * The identity a shell needs to publish itself in the global instance
 * registry: the parts it can't derive on its own. The shell fills in
 * `pid` / `origin` / `port` / `basePath` / `mcp` / `startedAt` once the
 * origin resolves, then merges {@link InstanceRegisterConfig.overrides} last.
 */
interface InstanceRegisterConfig {
  /** Definition id (or a synthetic one for a hub). */
  id: string;
  /** Display name. */
  name?: string;
  /** Working directory the instance runs from. Default: `process.cwd()`. */
  rootDir?: string;
  /** Fields overriding the shell-derived record (from the public option's object form). */
  overrides?: Partial<DevframeInstanceRecord>;
}
/**
 * Translate the public `register?: boolean | Partial<DevframeInstanceRecord>`
 * option into a shell {@link InstanceRegisterConfig}, or `undefined` when
 * registration is opted out. The object form supplies record overrides on top
 * of the caller-provided identity defaults.
 */
declare function resolveInstanceRegister(option: boolean | Partial<DevframeInstanceRecord> | undefined, defaults: {
  id: string;
  name?: string;
  rootDir?: string;
}): InstanceRegisterConfig | undefined;
/** Live internals the first-party adapters read off an instance. */
interface InstanceShellInternals {
  readonly started?: StartedServer;
  readonly authHandler?: DevframeAuthHandler;
}
interface InstanceShell<TContext extends DevframeNodeContext> {
  base: string;
  handler: (request: Request) => Promise<Response>;
  nodeMiddleware: (req: IncomingMessage, res: ServerResponse, next?: (err?: unknown) => void) => void;
  ready: Promise<void>;
  context: Promise<TContext>;
  connectionMeta: () => ConnectionMeta;
  /** Complete a host server's `upgrade` event on the instance's socket. */
  handleUpgrade: (req: IncomingMessage, socket: Duplex, head: Buffer) => void;
  /** Route a host server's `upgrade` events to the instance's socket. */
  attach: (server: Server) => () => void;
  close: () => Promise<void>;
  internals: InstanceShellInternals;
}
/** Compare two URL paths ignoring a trailing slash. */
declare function samePath(a: string, b: string): boolean;
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
declare function createInstanceShell<TContext extends DevframeNodeContext>(options: CreateInstanceShellOptions<TContext>): InstanceShell<TContext>;
//#endregion
export { InstanceShellInit as a, StartedServer as c, samePath as d, DevframeInstanceRecord as f, registerDevframeInstance as g, probeDevframeOrigin as h, InstanceShellApi as i, createInstanceShell as l, listLiveDevframeInstances as m, InstanceRegisterConfig as n, InstanceShellInternals as o, DevframeInstanceRegistration as p, InstanceShell as r, InstanceWsTier as s, CreateInstanceShellOptions as t, resolveInstanceRegister as u };