import { i as BirpcReturn, r as BirpcOptions } from "../index-Bia1vKjL.mjs";
import { f as RpcCacheManager, p as RpcCacheOptions } from "../index-DuEm0sDH.mjs";
import { h as RpcFunctionDefinition, w as RpcFunctionsCollector } from "../types-BmDbfHCx.mjs";
import { St as SettingsForNamespace, Tt as DevframeRpcServerFunctions, b as StreamSink, bt as ScopedServerFunctions, d as RpcSharedStateHost, it as DevframeServiceMeta, k as SharedState, mt as DevframeSettings, ot as DevframeServiceScopeOf, qt as EventEmitter, t as ConnectionMeta, u as RpcSharedStateGetOptions, ut as DevframeServicesState, wt as DevframeRpcClientFunctions, xt as ScopedSharedStates, y as StreamReader, yt as ScopedRpcFn } from "../context-dOWXVHc6.mjs";
import { t as SseRpcChannelOptions } from "../sse-client-DNdscfu_.mjs";
import { t as WsRpcChannelOptions } from "../ws-client-6Mrz6eC4.mjs";
//#region src/client/connection.d.ts
export interface DevframeConnection {
  /** Server-advertised transport and serialization metadata. */
  connectionMeta: ConnectionMeta;
  /**
   * Absolute URL of the `__connection.json` that produced
   * {@link connectionMeta}. Relative transport paths and side-car ports are
   * resolved from this URL, rather than from an external viewer's location.
   */
  metaBaseUrl: string;
  /** Previously issued bearer token, when the connection is already trusted. */
  authToken?: string;
}
export interface SetupDevframeConnectionOptions {
  /** Reuse a complete connection prepared in another viewer or JavaScript realm. */
  connection?: DevframeConnection;
  /** Use a pre-known descriptor while deriving its source URL from `baseURL`. */
  connectionMeta?: ConnectionMeta;
  /** Base URL, or fallback list, used to locate `__connection.json`. */
  baseURL?: string | string[];
  /** Override the locally stored auth token. */
  authToken?: string;
}
/**
 * Allow an external viewer to connect by registering its browser origin with
 * the Devframe host. Returns `false` if the host did not provide an origin
 * registration token.
 */
export declare function registerDevframeViewerOrigin(connection: DevframeConnection, origin?: any): Promise<boolean>;
/**
 * Return connection information previously prepared in this window or an
 * accessible parent window.
 */
export declare function getDevframeConnection(): DevframeConnection | undefined;
/**
 * Prepare the connection information shared by a devframe client and external
 * viewers. Reuses an explicit or previously prepared connection before
 * fetching `__connection.json` from the configured base URLs.
 */
export declare function setupDevframeConnection(options?: SetupDevframeConnectionOptions): Promise<DevframeConnection>;
/**
 * The connection lifecycle of a devframe client, as a single value a UI can
 * render from. Derived from the transport (WebSocket open/close/error) and the
 * trust handshake, so a viewer never has to reason about the two dimensions
 * separately.
 *
 * - `connecting`: establishing the WebSocket / running the initial trust
 *   handshake. Calls issued here queue until the socket opens.
 * - `connected`: socket open and trusted; RPC calls will be served.
 * - `unauthorized`: socket open but the server rejected trust (no valid token,
 *   or an auth-enforcing host refused it). Calls fail fast with an auth error;
 *   the UI should prompt for re-authentication or a reload.
 * - `disconnected`: the socket closed (dropped mid-session, or never opened).
 *   Pending and new calls fail fast until the page reconnects.
 * - `error`: a fatal connection error (e.g. the WebSocket errored, or the
 *   connection meta could not be loaded).
 *
 * A `static` backend has no live socket, so it reports `connected` for its
 * whole life.
 */
export type DevframeConnectionStatus = 'connecting' | 'connected' | 'unauthorized' | 'disconnected' | 'error';
/**
 * What kind of failure a {@link DevframeConnectionError} describes:
 * - `connection`: the transport dropped, errored, or never opened.
 * - `auth`: the server rejected trust for this client.
 * - `timeout`: a call exceeded its {@link DevframeRpcClientOptions.callTimeout}.
 */
export type DevframeConnectionErrorKind = 'connection' | 'auth' | 'timeout';
/**
 * The error rejected from `rpc.call(...)` (and carried on
 * `rpc.connectionError`) when a call cannot be served because the connection is
 * down, the client is unauthorized, or a call timed out. Its `kind` lets a UI
 * tailor its message and recovery affordance without string-matching.
 */
export declare class DevframeConnectionError extends Error {
  name: string;
  readonly kind: DevframeConnectionErrorKind;
  constructor(kind: DevframeConnectionErrorKind, message: string, options?: {
    cause?: unknown;
  });
}
/**
 * Whether a status means calls can be attempted. `connecting` counts because
 * the transport queues outgoing calls until the socket opens; the terminal
 * failure states short-circuit calls so a stuck socket never hangs the UI.
 */
export declare function isCallableStatus(status: DevframeConnectionStatus): boolean;
//#endregion
//#region src/client/rpc-streaming.d.ts
export interface StreamingSubscribeOptions {
  /** Maximum buffered chunks before the oldest is dropped. Default 256. */
  highWaterMark?: number;
}
export interface RpcStreamingClientHost {
  /**
   * Subscribe to a server-side stream by channel + id. Returns a reader
   * that's both an `AsyncIterable<T>` (`for await`) and exposes
   * `readable: ReadableStream<T>` for `pipeTo`-style consumption.
   */
  subscribe: <T = unknown>(channel: string, id: string, options?: StreamingSubscribeOptions) => StreamReader<T>;
  /**
   * Open the client side of a client-to-server upload. The id is
   * typically obtained from a prior action call that ran
   * `channel.openInbound()` on the server. Returns a `StreamSink<T>`
   * that mirrors the server-side producer surface (write / close /
   * error / writable / signal).
   *
   * The sink's `signal` aborts when the server cancels the upload.
   */
  upload: <T = unknown>(channel: string, id: string) => StreamSink<T>;
}
/**
 * Client-side streaming host. Mirrors `createRpcSharedStateClientHost`:
 * registers the two `:chunk` / `:end` event handlers once, then per-stream
 * state lives in a `Map<streamKey, StreamReader>`.
 */
export declare function createRpcStreamingClientHost(rpc: DevframeRpcClient): RpcStreamingClientHost;
//#endregion
//#region src/client/scope.d.ts
type AnyRpcFn = (...args: any[]) => any;
/**
 * Client-side streaming host scoped to a namespace. Channel names are
 * auto-prefixed with `<namespace>:`.
 */
export interface DevframeScopedClientStreamingHost {
  subscribe: <T = unknown>(channel: string, id: string, options?: StreamingSubscribeOptions) => StreamReader<T>;
  upload: <T = unknown>(channel: string, id: string) => StreamSink<T>;
}
/**
 * The scoped client RPC surface exposed on
 * `client.scope('my-plugin').rpc`. IDs and keys you pass are
 * auto-namespaced with `my-plugin:`.
 */
export interface DevframeScopedClientRpc<NS extends string = string> {
  /** The namespace this surface is scoped to. */
  readonly namespace: NS;
  /**
   * Register a client (server→client) RPC function. The definition's
   * `name` must be bare (no `:`); it is stored as `<namespace>:<name>`.
   */
  register: (fn: RpcFunctionDefinition<string, any, any, any, any, any, DevframeRpcContext>) => void;
  /** Call a server RPC function. Bare names resolve within this namespace. */
  call: {
    <T extends keyof ScopedServerFunctions<NS> & string>(method: T, ...args: Parameters<ScopedRpcFn<DevframeRpcServerFunctions, NS, T>>): Promise<Awaited<ReturnType<ScopedRpcFn<DevframeRpcServerFunctions, NS, T>>>>;
    <T extends keyof DevframeRpcServerFunctions & string>(method: T, ...args: Parameters<Extract<DevframeRpcServerFunctions[T], AnyRpcFn>>): Promise<Awaited<ReturnType<Extract<DevframeRpcServerFunctions[T], AnyRpcFn>>>>;
    (method: string, ...args: any[]): Promise<any>;
  };
  /** Call a server RPC event (fire-and-forget). */
  callEvent: {
    <T extends keyof ScopedServerFunctions<NS> & string>(method: T, ...args: Parameters<ScopedRpcFn<DevframeRpcServerFunctions, NS, T>>): void;
    <T extends keyof DevframeRpcServerFunctions & string>(method: T, ...args: Parameters<Extract<DevframeRpcServerFunctions[T], AnyRpcFn>>): void;
    (method: string, ...args: any[]): void;
  };
  /** Call an optional server RPC function (no error if unregistered). */
  callOptional: {
    <T extends keyof ScopedServerFunctions<NS> & string>(method: T, ...args: Parameters<ScopedRpcFn<DevframeRpcServerFunctions, NS, T>>): Promise<Awaited<ReturnType<ScopedRpcFn<DevframeRpcServerFunctions, NS, T>>> | undefined>;
    <T extends keyof DevframeRpcServerFunctions & string>(method: T, ...args: Parameters<Extract<DevframeRpcServerFunctions[T], AnyRpcFn>>): Promise<Awaited<ReturnType<Extract<DevframeRpcServerFunctions[T], AnyRpcFn>>> | undefined>;
    (method: string, ...args: any[]): Promise<any>;
  };
  /** Resolve a namespaced shared state. Bare keys resolve within this namespace. */
  sharedState: {
    <T extends keyof ScopedSharedStates<NS> & string>(key: T, options?: RpcSharedStateGetOptions<ScopedSharedStates<NS>[T]>): Promise<SharedState<ScopedSharedStates<NS>[T]>>;
    <T extends Record<string, any> = Record<string, any>>(key: string, options?: RpcSharedStateGetOptions<T>): Promise<SharedState<T>>;
  };
  /** Streaming host scoped to this namespace. */
  streaming: DevframeScopedClientStreamingHost;
}
/**
 * A namespace-scoped view of the {@link DevframeRpcClient}. Returned by
 * `client.scope('my-plugin')`. Replaces `rpc` with the auto-namespaced
 * surface and adds a top-level `settings` store.
 */
export interface DevframeScopedClientContext<NS extends string = string, Settings extends Record<string, any> = Record<string, any>> {
  /** The namespace this context is scoped to. */
  readonly namespace: NS;
  /** The underlying unscoped client. */
  readonly base: DevframeRpcClient;
  rpc: DevframeScopedClientRpc<NS>;
  /** Persisted settings for this namespace (`global` + `project`). */
  settings: DevframeSettings<Settings>;
  /**
   * Return a new scoped client, replacing the current scope. Pass `null`
   * or `''` to un-scope and get the base client.
   */
  scope: DevframeRpcClient['scope'];
}
/**
 * Build a namespace-scoped view of a {@link DevframeRpcClient}. Every RPC
 * id, shared-state key, and streaming channel passed through the returned
 * `rpc` surface is auto-namespaced with `<namespace>:`.
 */
export declare function createScopedClientContext<NS extends string = string>(rpc: DevframeRpcClient, namespace: NS): DevframeScopedClientContext<NS>;
//#endregion
//#region src/client/rpc-services.d.ts
/**
 * A typed handle on one advertised wire service: the service's
 * advertisement meta plus an RPC surface scoped to its namespace, so
 * `handle.rpc.call('fn-name', …)` targets `<scope>:fn-name`. Service
 * packages type the calls by augmenting `DevframeRpcServerFunctions` with
 * their fully-qualified ids and `DevframeServicesScopeRegistry` with their
 * package → scope mapping.
 */
interface DevframeServiceClientHandle<NS extends string = string> extends DevframeServiceMeta {
  readonly scope: NS;
  /** RPC surface scoped to the service's namespace. */
  readonly rpc: DevframeScopedClientRpc<NS>;
}
/**
 * Client-side view of the server's wire-service registry, mirrored through
 * the reactive `devframe:services` shared state. The accessors are
 * synchronous snapshots; before the first sync lands (or on a server with
 * no services) they read as empty. For reactive UI (e.g. hiding an
 * "open in editor" button until the service appears), subscribe to the
 * shared state itself via {@link DevframeServicesClient.state}.
 */
interface DevframeServicesClient {
  /** Whether the service package is advertised as installed. */
  has: (pkg: string) => boolean;
  /**
   * A typed handle on an advertised service (its meta plus a scoped RPC
   * surface), or `undefined` while it isn't available (never throws).
   */
  get: <PKG extends string>(pkg: PKG) => DevframeServiceClientHandle<DevframeServiceScopeOf<PKG>> | undefined;
  /** Package names of every advertised service. */
  keys: () => string[];
  /**
   * The mirrored `devframe:services` shared state; subscribe to its
   * `updated` event for reactivity.
   */
  state: () => Promise<SharedState<DevframeServicesState>>;
}
//#endregion
//#region src/client/rpc.d.ts
export interface DevframeRpcContext {
  /**
   * The RPC client to interact with the server
   */
  readonly rpc: DevframeRpcClient;
}
export type DevframeClientRpcHost = RpcFunctionsCollector<DevframeRpcClientFunctions, DevframeRpcContext>;
export interface RpcClientEvents {
  'rpc:is-trusted:updated': (isTrusted: boolean) => void;
  /**
   * The connection status changed. Carries the new status and the previous one
   * so a UI can react to specific transitions (e.g. `connected` → `disconnected`).
   */
  'connection:status': (status: DevframeConnectionStatus, previous: DevframeConnectionStatus) => void;
  /**
   * A connection-level error occurred (the WebSocket errored, or trust was
   * refused). The status typically moves to `error`/`unauthorized` alongside it.
   */
  'connection:error': (error: Error) => void;
  /**
   * An RPC call rejected, either from the server, or because the connection
   * was down / timed out. Useful for a global error feed or toast surface.
   */
  'rpc:error': (error: Error, method: string) => void;
}
export interface DevframeRpcClientOptions extends SetupDevframeConnectionOptions {
  /**
   * The auth token to use for the client
   */
  authToken?: string;
  /**
   * Query-param name on the page URL carrying a one-time authentication code
   * (OTP) for "magic link" auth (e.g. a link the dev server prints). When
   * present, the client exchanges the code for a token and removes the parameter
   * from the URL. Set `false` to disable, e.g. integrations that drive their
   * own authentication via `authenticateWithUrlOtp`.
   *
   * @default 'devframe_otp'
   */
  otpParam?: string | false;
  /**
   * Fall back to a native browser `prompt()` for the one-time authentication
   * code when the server refuses trust and no other credential succeeds (a
   * stored token, an injected token, or a magic-link OTP). The prompt fires
   * only on a **top-level, unframed** page; a framed plugin (e.g. mounted in
   * a hub dock) never prompts, since a hub pre-authorizes it and browsers
   * block `prompt()` in cross-origin frames anyway.
   *
   * Set `false` to drive your own auth UI (a hub sets this on the plugin
   * connections it manages, alongside supplying the token).
   *
   * @default true
   */
  simpleAuth?: boolean;
  /**
   * Which live transport to connect over:
   *
   *  - `'auto'` (default) trusts the server's advertisement: its declared
   *    primary (`backend`), preferring the WebSocket when both endpoints are
   *    present. A server that couldn't bind a socket advertises SSE as its
   *    primary, so no client-side fallback probing is needed.
   *  - `'websocket'` / `'sse'` pins one transport; connecting fails with a
   *    clear error when the server doesn't advertise it. Reach for
   *    `transport: 'sse'` when an intermediary silently strips WS upgrades,
   *    something the server cannot detect.
   *
   * A `static` backend ignores this option (there is no live transport).
   */
  transport?: 'auto' | 'websocket' | 'sse';
  wsOptions?: Partial<WsRpcChannelOptions>;
  /** Channel overrides for the SSE transport, the `wsOptions` counterpart. */
  sseOptions?: Partial<SseRpcChannelOptions>;
  rpcOptions?: Partial<BirpcOptions<DevframeRpcServerFunctions, DevframeRpcClientFunctions, boolean>>;
  /** Cache declared static/opted-in query methods with `true`, or select an explicit function list. */
  cacheOptions?: boolean | Partial<RpcCacheOptions>;
  /**
   * Mirror `agent`-flagged client RPC functions (functions registered on
   * `rpc.client` with an `agent` field) onto the page's WebMCP model
   * context (`document.modelContext` / `navigator.modelContext`) as
   * callable tools, so in-page and browser-integrated agents can invoke
   * them; see `registerWebMcpTools`. Applies only when the browser
   * provides a model context. Set `false` to keep the browser side off
   * the WebMCP surface.
   *
   * @default true
   */
  webmcp?: boolean;
  /**
   * Reject a pending `rpc.call(...)` if the server hasn't answered within this
   * many milliseconds, with a {@link DevframeConnectionError} of kind
   * `'timeout'`. Guards against a live-but-unresponsive server hanging the UI.
   * Omit (or `0`) to wait indefinitely. Calls always fail fast, regardless of
   * this option, once the socket closes or trust is refused.
   */
  callTimeout?: number;
}
export type DevframeRpcClientCall = BirpcReturn<DevframeRpcServerFunctions, DevframeRpcClientFunctions>['$call'];
export type DevframeRpcClientCallEvent = BirpcReturn<DevframeRpcServerFunctions, DevframeRpcClientFunctions>['$callEvent'];
export type DevframeRpcClientCallOptional = BirpcReturn<DevframeRpcServerFunctions, DevframeRpcClientFunctions>['$callOptional'];
export interface DevframeRpcClient {
  /**
   * The events of the client
   */
  events: EventEmitter<RpcClientEvents>;
  /**
   * Whether the client is trusted
   */
  readonly isTrusted: boolean | null;
  /**
   * The current connection status. Drives connection/auth/error UI without the
   * consumer having to track the transport and trust handshake separately.
   * Subscribe to `events.on('connection:status', …)` to react to changes.
   */
  readonly status: DevframeConnectionStatus;
  /**
   * The most recent connection-level error (transport error, refused trust,
   * or failed connection-meta load), or `null` when the connection is healthy.
   */
  readonly connectionError: Error | null;
  /**
   * The transport this client is actually connected over: `'websocket'`,
   * `'sse'`, or `'static'`. Reflects the resolution of the `transport`
   * option against the server's advertisement.
   */
  readonly transport: 'websocket' | 'sse' | 'static';
  /**
   * The complete connection used by this client, including the metadata source
   * URL external viewers use to resolve relative resources.
   */
  readonly connection: DevframeConnection;
  /**
   * The server-advertised connection metadata.
   */
  readonly connectionMeta: ConnectionMeta;
  /**
   * Return a promise that resolves when the client is trusted
   *
   * Rejects with an error if the timeout is reached
   *
   * @param timeout - The timeout in milliseconds, default to 60 seconds
   */
  ensureTrusted: (timeout?: number) => Promise<boolean>;
  /**
   * Request trust from the server
   */
  requestTrust: () => Promise<boolean>;
  /**
   * Request trust from the server using a previously-issued auth token.
   * Updates the stored token and re-requests trust without reloading the page.
   */
  requestTrustWithToken: (token: string) => Promise<boolean>;
  /**
   * Authenticate this client by exchanging a one-time code (shown by the dev
   * server) for a node-issued auth token. On success the token is persisted for
   * future reconnections and shared with sibling tabs. Resolves `true` when
   * authenticated.
   */
  requestTrustWithCode: (code: string) => Promise<boolean>;
  /**
   * Ask the server to print its one-time code banner in the terminal, e.g.
   * when a custom auth UI is shown. Pass `reissue: true` to rotate the code
   * first (a "re-issue" button), guaranteeing a freshly-valid code; without
   * it the server prints each code at most once.
   */
  requestAuthCode: (options?: {
    reissue?: boolean;
  }) => Promise<void>;
  /**
   * Call a RPC function on the server
   */
  call: DevframeRpcClientCall;
  /**
   * Call a RPC event on the server, and does not expect a response
   */
  callEvent: DevframeRpcClientCallEvent;
  /**
   * Call a RPC optional function on the server
   */
  callOptional: DevframeRpcClientCallOptional;
  /**
   * The client RPC host
   */
  client: DevframeClientRpcHost;
  /**
   * The shared state host
   */
  sharedState: RpcSharedStateHost;
  /**
   * The server's advertised wire services (mirrored `devframe:services`
   * shared state); feature-detect a capability with
   * `rpc.services.has('@devframes/service-x')` and get a scoped, typed RPC
   * handle with `rpc.services.get(...)`. See {@link DevframeServicesClient}.
   */
  services: DevframeServicesClient;
  /**
   * The streaming channel host. Subscribe to a server-side stream by
   * channel + id; the returned reader is both `AsyncIterable<T>` and
   * exposes `.readable: ReadableStream<T>` for `pipeTo` consumption.
   */
  streaming: RpcStreamingClientHost;
  /**
   * The RPC cache manager
   */
  cacheManager: RpcCacheManager;
  /**
   * Create a namespace-scoped view of this client. The returned
   * `client.scope('my-plugin')` auto-namespaces every RPC id,
   * shared-state key, and streaming channel with `my-plugin:`, and
   * exposes a typed top-level `settings` store. This is the preferred way
   * to consume the client from a single tool's UI code.
   *
   * Pass `null` or `''` to un-scope and get the base client.
   */
  scope: {
    <NS extends string>(namespace: NS): DevframeScopedClientContext<NS, SettingsForNamespace<NS>>;
    (namespace?: null | ''): DevframeRpcClient;
  };
  /**
   * Close the connection. A `static` backend is a no-op (there is no live socket to close);
   * a `websocket` backend closes the underlying `WebSocket`, which the server observes as a
   * normal disconnect. Mirrors {@link WsRpcTransport.close} on the server side.
   *
   * There is no corresponding "reconnect"; a closed client is done. Discard it and call
   * {@link getDevframeRpcClient} again to reconnect.
   *
   * Optional so a `DevframeRpcClientMode` implemented before this method existed (a custom
   * transport, a hand-typed mock) still satisfies the interface; an absent `close` is treated
   * as nothing to close.
   */
  close?: () => void;
}
export interface DevframeRpcClientMode {
  /**
   * The transport this mode speaks. Optional so a mode implemented before
   * this field existed (a custom transport, a hand-typed mock) still
   * satisfies the interface; an absent value reads as `'websocket'`.
   */
  readonly transport?: 'websocket' | 'sse' | 'static';
  readonly isTrusted: boolean;
  readonly status: DevframeConnectionStatus;
  readonly connectionError: Error | null;
  ensureTrusted: DevframeRpcClient['ensureTrusted'];
  requestTrust: DevframeRpcClient['requestTrust'];
  requestTrustWithToken: DevframeRpcClient['requestTrustWithToken'];
  /**
   * Exchange a one-time code for a node-issued token. Resolves the minted
   * token on success (for the caller to persist), or `null` on failure.
   */
  requestTrustWithCode: (code: string) => Promise<string | null>;
  requestAuthCode: DevframeRpcClient['requestAuthCode'];
  call: DevframeRpcClient['call'];
  callEvent: DevframeRpcClient['callEvent'];
  callOptional: DevframeRpcClient['callOptional'];
  /** See {@link DevframeRpcClient.close}. */
  close?: () => void;
}
/**
 * Resolve the requested `transport` option against what the server
 * advertises. `'auto'` trusts the advertisement: the server's declared
 * primary (`backend`), preferring the WebSocket when both endpoints are
 * present; an explicit `'websocket'` / `'sse'` pins that transport and
 * throws when the server doesn't advertise it.
 */
export declare function resolveClientTransport(requested: 'auto' | 'websocket' | 'sse', meta: ConnectionMeta): 'websocket' | 'sse' | 'static';
export declare function getDevframeRpcClient(options?: DevframeRpcClientOptions): Promise<DevframeRpcClient>;
//#endregion
//#region src/client/connection-storage.d.ts
/**
 * Publish the connection on this window for same-origin frames to inherit.
 * Call again after mutating `connection.connectionMeta` so the legacy meta
 * copy below follows.
 */
export declare function storeConnection(connection: DevframeConnection): void;
//#endregion
//#region src/client/otp.d.ts
/**
 * Read a one-time authentication code (OTP) from the current page URL's
 * fragment, without side effects. Returns `undefined` when the parameter is
 * absent.
 */
export declare function readOtpFromUrl(param?: string): string | undefined;
/**
 * Read the one-time code from the page URL fragment and remove it from the
 * address bar (and the current history entry), so the single-use code isn't
 * left in the URL, browser history, or a `Referer`. Returns the code, or
 * `undefined` when absent.
 */
export declare function consumeOtpFromUrl(param?: string): string | undefined;
/**
 * Consume a one-time code from the page URL (see {@link consumeOtpFromUrl}) and
 * exchange it for a token via the client. Resolves `true` when the client is
 * authenticated (already trusted, or the exchange succeeded), and `false` when
 * no code is present or the exchange failed.
 *
 * Higher-level integrations (e.g. Vite DevTools) that want to drive their own
 * authentication UI can disable `connectDevframe`'s built-in handling with
 * `otpParam: false` and call this (or {@link consumeOtpFromUrl}) themselves.
 */
export declare function authenticateWithUrlOtp(rpc: Pick<DevframeRpcClient, 'isTrusted' | 'requestTrustWithCode'>, options?: {
  param?: string;
}): Promise<boolean>;
//#endregion
//#region src/client/rpc-ws.d.ts
/** Minimal subset of `window.location` needed to resolve a WS URL. */
interface WsUrlLocation {
  protocol: string;
  host: string;
  hostname: string;
  href: string;
}
/**
 * Resolve a {@link ConnectionMeta.websocket} descriptor into a concrete
 * `ws(s)://` URL.
 *
 * The object / relative-path forms connect to the page's own origin (only the
 * `http`→`ws` protocol swap is applied), resolving the path against where
 * `__connection.json` was loaded. This is deliberately host-agnostic so the
 * connection survives a reverse proxy that changes the domain or port, since the
 * client trusts its own location, never a server-baked hostname. An explicit
 * `port`/`host` (or a full `ws(s)://` URL string) opts into a cross-origin
 * endpoint, e.g. a side-car server on its own port.
 */
export declare function resolveWsUrl(websocket: ConnectionMeta['websocket'], metaBaseUrl: string, loc: WsUrlLocation): string;
//#endregion
//#region src/client/rpc-sse.d.ts
/**
 * Resolve a {@link ConnectionMeta.sse} descriptor into a concrete
 * `http(s)://` URL, with the same proxy-safe rules as `resolveWsUrl`: the
 * object / relative-path forms resolve against where `__connection.json`
 * was loaded (the client trusts its own location, never a server-baked
 * hostname), while an explicit `port`/`host` (or a full `http(s)://` URL
 * string) opts into a cross-origin endpoint.
 */
export declare function resolveSseUrl(sse: ConnectionMeta['sse'], metaBaseUrl: string, loc: WsUrlLocation): string;
//#endregion
//#region src/client/settings.d.ts
/**
 * Build the client-side `settings` surface for a scope namespace. Mirrors
 * the node-side stores over the shared-state sync protocol.
 */
export declare function createClientSettings<T extends Record<string, any> = Record<string, any>>(rpc: DevframeRpcClient, namespace: string): DevframeSettings<T>;
//#endregion
//#region src/client/webmcp.d.ts
/**
 * Result a WebMCP tool's `execute` resolves with; mirrors the MCP
 * `CallToolResult` text shape the [WebMCP](https://github.com/webmachinelearning/webmcp)
 * proposal adopts.
 */
export interface WebMcpToolResult {
  content: {
    type: 'text';
    text: string;
  }[];
  isError?: boolean;
}
/** A tool descriptor as passed to {@link WebMcpModelContext.registerTool}. */
export interface WebMcpToolDescriptor {
  name: string;
  description: string;
  inputSchema?: unknown;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
  };
  execute: (args: Record<string, unknown>) => Promise<WebMcpToolResult>;
}
/**
 * A tool as reported by {@link WebMcpModelContext.getTools}: the
 * serializable descriptor fields plus the registering `origin`. The
 * browser may attach more members (e.g. the owner `window`); pass the
 * object through unchanged to {@link WebMcpModelContext.executeTool}.
 */
export interface WebMcpRegisteredTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
  origin?: string;
}
/**
 * Structural subset of the experimental WebMCP model context
 * (`document.modelContext` / `navigator.modelContext`). The current draft
 * unregisters a tool by aborting the passed `AbortSignal` and returns a
 * promise; earlier drafts returned a handle with `unregister()`. Typed to
 * accept both generations. `getTools` / `executeTool` are the draft's
 * discovery/execution surface for in-page agents; absent on older drafts.
 */
export interface WebMcpModelContext {
  registerTool: (tool: WebMcpToolDescriptor, options?: {
    signal?: AbortSignal;
  }) => void | {
    unregister?: () => void;
  } | Promise<unknown>;
  getTools?: (options?: {
    fromOrigins?: string[];
  }) => Promise<WebMcpRegisteredTool[]>;
  /**
   * The spec draft takes the args as a dictionary; Chromium's current
   * build takes (and returns) JSON strings instead, hence the union.
   */
  executeTool?: (tool: WebMcpRegisteredTool, args: Record<string, unknown> | string, options?: {
    signal?: AbortSignal;
  }) => Promise<unknown>;
}
/**
 * The page's WebMCP model context, when the browser (or a polyfill)
 * provides one. Checks `document.modelContext` (current draft) first,
 * then `navigator.modelContext` (earlier drafts and polyfills).
 */
export declare function resolveWebMcpModelContext(): WebMcpModelContext | undefined;
export interface RegisterWebMcpToolsOptions {
  /**
   * Model context to register tools on. Defaults to the one the page
   * provides (see {@link resolveWebMcpModelContext}); when neither is
   * given, registration is a no-op.
   */
  modelContext?: WebMcpModelContext;
}
/**
 * Mirror the `agent`-flagged RPC functions of a browser-side collector
 * (`rpc.client`) onto the page's WebMCP model context as callable tools,
 * using the same `agent` signature, wire names, and `arg0`/`arg1`/… input
 * schema as the node-side MCP adapter. Functions without an `agent` field
 * stay unexposed (default-deny), and the tool set follows later
 * `register`/`update` calls. Returns a dispose that unregisters every tool.
 */
export declare function registerWebMcpTools<LocalFunctions, SetupContext>(clientRpc: RpcFunctionsCollector<LocalFunctions, SetupContext>, options?: RegisterWebMcpToolsOptions): () => void;
//#endregion
//#region src/client/index.d.ts
export declare const connectDevframe: typeof getDevframeRpcClient;
//#endregion
export type { DevframeServiceClientHandle, DevframeServicesClient, WsUrlLocation };