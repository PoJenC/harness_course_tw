//#region src/events.d.ts
/**
 * Centralized registry of the core devframe event names: the node-side host
 * bus events, the client RPC connection events, and the server→client
 * broadcast notifications, so these names live in one place instead of
 * scattered string literals.
 *
 * **Keep this in sync with [`docs/content/8.references/3.events.md`](../../../docs/content/8.references/3.events.md)**
 * (the "Core devframe events" section): every name here appears in that page's
 * tables, and every name there resolves to an entry here. Add, rename, or
 * remove a name in both places in the same change, and reference
 * `DEVFRAME_EVENTS.*` from call sites instead of re-typing a literal.
 *
 * This map covers **notifications** (events, broadcasts). The request/response
 * RPC endpoints of the shared-state, streaming, and auth-handshake protocols
 * (`devframe:rpc:server-state:*`, `devframe:streaming:subscribe`,
 * `anonymous:devframe:auth`, …) are defined at their handlers and typed in
 * `types/rpc-augments.ts`; they aren't events and stay out of this map.
 *
 * The `EventEmitter` maps (`RpcClientEvents`, `DevframeAgentHostEvents`) and the
 * `DevframeRpcClientFunctions` augmentation declare these names as type-level
 * keys (a literal is unavoidable in a type position); those declarations mirror
 * this map and move with it.
 */
export declare const DEVFRAME_EVENTS: {
  /**
   * Node-side host `EventEmitter` events. The agent host (`ctx.agent.events`)
   * emits these as its tool/resource surface changes; protocol adapters (e.g.
   * MCP) subscribe to re-publish their manifest.
   */
  readonly bus: {
    readonly agentManifestChanged: "agent:manifest:changed";
    readonly agentToolRegistered: "agent:tool:registered";
    readonly agentToolUnregistered: "agent:tool:unregistered";
    readonly agentResourceRegistered: "agent:resource:registered";
    readonly agentResourceUnregistered: "agent:resource:unregistered";
  };
  /**
   * Client-side RPC connection `EventEmitter` events (`rpc.events`) a UI
   * subscribes to for connection lifecycle and error surfacing.
   */
  readonly client: {
    readonly isTrustedUpdated: "rpc:is-trusted:updated";
    readonly error: "rpc:error";
    readonly connectionStatus: "connection:status";
    readonly connectionError: "connection:error";
  };
  /**
   * Broadcast notifications the server pushes to clients (server → client),
   * `devframe:` prefix. The paired request methods (subscribe/get/set/…) are
   * RPC endpoints, not events, and are omitted deliberately.
   */
  readonly broadcast: {
    readonly authRevoked: "devframe:auth:revoked";
    readonly cacheInvalidate: "devframe:rpc:cache:invalidate";
    readonly clientStateUpdated: "devframe:rpc:client-state:updated";
    readonly clientStatePatch: "devframe:rpc:client-state:patch";
    readonly streamingChunk: "devframe:streaming:chunk";
    readonly streamingEnd: "devframe:streaming:end";
    readonly streamingUploadCancel: "devframe:streaming:upload-cancel";
  };
  /**
   * In-page channel notifications the page script pushes to its panels
   * (page script → panel), `devframe:` prefix. The paired request methods
   * (`devframe:in-page:page-state:subscribe`/`set`/`patch`) are call
   * endpoints, not events, and are defined at their handlers
   * (`in-page-channel/state.ts`).
   */
  readonly inPageChannel: {
    readonly panelStateUpdated: "devframe:in-page:panel-state:updated";
    readonly panelStatePatch: "devframe:in-page:panel-state:patch";
  };
  /** `postMessage` channels the runtime posts across window boundaries. */
  readonly postMessage: {
    readonly remoteAssetsError: "devframe:remote-assets-error";
    readonly inPageChannel: "devframe:in-page-channel";
  };
};
//#endregion
//#region src/constants.d.ts
/** Devframe runtime routes and static output conventions. */
export declare const DEVFRAME_CONNECTION_META_FILENAME = "__connection.json";
/**
 * Global key holding the serializable connection prepared by
 * `setupDevframeConnection()`. External viewers can use this key to read the
 * connection from another JavaScript realm.
 */
export declare const DEVFRAME_CONNECTION_KEY = "__DEVFRAME_CONNECTION__";
/**
 * Route the WebSocket RPC endpoint is bound to, relative to a devframe's
 * base path. Sits next to `__connection.json` so the deployed SPA can reach
 * it on the same origin it loaded from: the dev server shares one port for
 * both HTTP and WS, and a host server (Vite, etc.) can mount the WS upgrade
 * handler here without colliding with its own routes (HMR, asset serving).
 */
export declare const DEVFRAME_WS_ROUTE = "__ws";
/**
 * Route the SSE RPC endpoint is bound to, relative to a devframe's base
 * path. A single method-dispatched route: `GET` opens the event stream
 * (server→client), `POST` carries RPC frames (client→server). Sits next to
 * `__connection.json` so the deployed SPA reaches it on the same origin it
 * loaded from; the transport for hosts and proxies where the WebSocket
 * upgrade isn't available.
 */
export declare const DEVFRAME_SSE_ROUTE = "__sse";
/**
 * Request header carrying the SSE session id on every RPC `POST`. The
 * server mints the id as the stream's first event (`event: session`);
 * the client echoes it here so the POST joins that stream's birpc
 * channel. Mirrors birpc's own SSE helpers for wire compatibility.
 */
export declare const DEVFRAME_SSE_SESSION_HEADER = "x-birpc-session";
/**
 * Route the Streamable-HTTP MCP endpoint is bound to, relative to a
 * devframe's base path. Sits next to `__connection.json` and the WS route
 * so an MCP client reaches it on the same origin the SPA loaded from; the
 * dev server shares one port for HTTP, WS, and MCP. Opt-in via the host's
 * `mcp` setting.
 */
export declare const DEVFRAME_MCP_ROUTE = "__mcp";
export declare const DEVFRAME_RPC_DUMP_MANIFEST_FILENAME = "__rpc-dump/index.json";
export declare const DEVFRAME_DOCK_IMPORTS_FILENAME = "__client-imports.js";
export declare const DEVFRAME_RPC_DUMP_DIRNAME = "__rpc-dump";
/**
 * Shared-state key carrying the wire-service advertisements (package name →
 * `DevframeServiceMeta`). Written by the node services host; mirrored to
 * clients for feature-detection via `client.services`.
 */
export declare const DEVFRAME_SERVICES_STATE_KEY = "devframe:services";
/**
 * URL fragment / query parameter name carrying the remote dock
 * connection descriptor (defined as `RemoteConnectionInfo` in
 * `@vitejs/devtools-kit`) injected into remote-UI iframe dock URLs.
 */
export declare const REMOTE_CONNECTION_KEY = "devframe-remote-connection";
/**
 * Page-URL **fragment** parameter carrying a one-time authentication code (OTP)
 * for "magic link" auth. A host can print a link like
 * `<origin>/#devframe_otp=<code>`; the client reads the code, exchanges it for a
 * token, and strips the parameter from the URL. The code rides the fragment
 * (never the query string) so the browser never transmits it to the server,
 * keeping it out of access logs and `Referer` headers. See `buildOtpAuthUrl`
 * (node) and the `authenticateWithUrlOtp` / `consumeOtpFromUrl` client utilities
 * (or `connectDevframe`'s `otpParam`).
 */
export declare const DEVFRAME_OTP_URL_PARAM = "devframe_otp";
/**
 * WS upgrade-URL query parameter carrying a previously-issued bearer token.
 * Set by `createWsRpcChannel` (browser transport) whenever `authToken` is
 * passed; read at connect time by a host's connect-time trust hook (see
 * `recipes/interactive-auth`'s `onConnect`) so a returning client can be
 * trusted before its own `anonymous:devframe:auth` handshake call arrives.
 */
export declare const DEVFRAME_AUTH_TOKEN_QUERY_PARAM = "devframe_auth_token";
/** External viewer origin requested during connection bootstrap. */
export declare const DEVFRAME_VIEWER_ORIGIN_QUERY_PARAM = "devframe_viewer_origin";
/** Token that authorizes an external viewer origin registration. */
export declare const DEVFRAME_VIEWER_ORIGIN_TOKEN_QUERY_PARAM = "devframe_viewer_origin_token";
/**
 * `postMessage` type the remote-assets fallback page posts to `window.parent`
 * on load. That page is what a devframe serves (with a 502) when its client
 * assets can be reached neither locally nor through their CDN provider; the
 * message lets an embedding viewer replace the bare page with its own UI
 * (`@devframes/hub-ui` does, in its iframe view). Payload shape:
 * `RemoteAssetsErrorMessage` (`devframe/types`).
 */
export declare const DEVFRAME_REMOTE_ASSETS_ERROR_MESSAGE_TYPE: string;
/**
 * Prefix that marks an RPC method as callable before a connection is
 * trusted. This is the *only* rule the pre-trust gate applies; there is no
 * per-method allowlist. Any handshake method a host adapter needs to reach
 * before authentication must be named `anonymous:<rest>` (e.g.
 * `anonymous:devframe:auth`).
 */
export declare const ANONYMOUS_RPC_PREFIX = "anonymous:";
/**
 * Whether `name` is callable before a connection is trusted, i.e. it starts
 * with {@link ANONYMOUS_RPC_PREFIX}. Used by the resolver gate in
 * the RPC server binding (via an `authorize` function) and by host adapters that
 * implement their own transport.
 */
export declare function isAnonymousRpcMethod(name: string): boolean;
//#endregion