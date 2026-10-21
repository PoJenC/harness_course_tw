import { i as BirpcReturn } from "./index-Bia1vKjL.mjs";
import { d as RpcFunctionsCollectorBase } from "./index-DuEm0sDH.mjs";
import { t as StandardSchemaV1 } from "./index-CeEtxDmK.mjs";
import { g as RpcFunctionDefinitionAny, h as RpcFunctionDefinition } from "./types-BmDbfHCx.mjs";
import { n as DevframeRpcConnection, t as DevframeNodeRpcSessionMeta } from "./session-r6PDixP6.mjs";
import { a as RemoteAssetsStore, o as StaticAssetsSource } from "./remote-assets-eBvSKZMS.mjs";
import { h as defineDiagnostics } from "./nostics-DWvukRwa.mjs";
import { CAC } from "cac";
//#region src/types/events.d.ts
interface EventsMap {
  [event: string]: any;
}
interface EventUnsubscribe {
  (): void;
}
interface EventEmitter<Events extends EventsMap> {
  /**
   * Calls each of the listeners registered for a given event.
   *
   * ```js
   * ee.emit('tick', tickType, tickDuration)
   * ```
   *
   * @param event The event name.
   * @param args The arguments for listeners.
   */
  emit: <K extends keyof Events>(event: K, ...args: Parameters<Events[K]>) => void;
  /**
   * Calls the listeners for a given event once and then removes the listener.
   *
   * @param event The event name.
   * @param args The arguments for listeners.
   */
  emitOnce: <K extends keyof Events>(event: K, ...args: Parameters<Events[K]>) => void;
  /**
   * Event names in keys and arrays with listeners in values.
   *
   * @internal
   */
  _listeners: Partial<{ [E in keyof Events]: Events[E][]; }>;
  /**
   * Add a listener for a given event.
   *
   * ```js
   * const unbind = ee.on('tick', (tickType, tickDuration) => {
   *   count += 1
   * })
   *
   * disable () {
   *   unbind()
   * }
   * ```
   *
   * @param event The event name.
   * @param cb The listener function.
   * @returns Unbind listener from event.
   */
  on: <K extends keyof Events>(event: K, cb: Events[K]) => EventUnsubscribe;
  /**
   * Add a listener for a given event once.
   *
   * ```js
   * const unbind = ee.once('tick', (tickType, tickDuration) => {
   *   count += 1
   * })
   *
   * disable () {
   *   unbind()
   * }
   * ```
   *
   * @param event The event name.
   * @param cb The listener function.
   * @returns Unbind listener from event.
   */
  once: <K extends keyof Events>(event: K, cb: Events[K]) => EventUnsubscribe;
}
//#endregion
//#region src/types/agent.d.ts
/**
 * Serializable description of an agent-exposed tool. This is the shape
 * returned by the agent host manifest and surfaced over the wire by
 * the `devframe:agent:list-tools` introspection RPC.
 */
interface AgentTool {
  /** Stable identifier. For RPC-backed tools, matches the RPC name. */
  id: string;
  /** `'rpc'` when backed by a registered RPC function, `'tool'` when registered via `ctx.agent.registerTool()`. */
  kind: 'rpc' | 'tool';
  /** Display title (falls back to `id`). */
  title: string;
  /** Human-readable description shown to the agent. */
  description: string;
  /** Safety classification; drives MCP hint annotations downstream. */
  safety: 'read' | 'action' | 'destructive';
  /** Free-form tags for grouping/filtering. */
  tags?: readonly string[];
  /** Present for `kind === 'rpc'`; points to the RPC function name. */
  rpcName?: string;
  /**
   * Positional Standard Schemas describing a `kind: 'tool'` entry's
   * arguments, carried on the tool itself (mirroring how `rpcName` defers
   * an RPC-backed tool's schemas to `ctx.rpc.definitions`) so consumers
   * (e.g. the MCP adapter) convert Standard Schema → JSON Schema on demand,
   * same as RPC `args`.
   */
  args?: readonly StandardSchemaV1[];
  /** JSON Schema describing the input (positional args synthesized to an object). */
  inputSchema?: unknown;
  /** JSON Schema describing the output. */
  outputSchema?: unknown;
  /** Example invocations shown to agents. */
  examples?: readonly {
    args: unknown[];
    description?: string;
  }[];
}
/**
 * Input accepted by `DevframeAgentHost.registerTool()`. Handler is
 * stripped from the serializable `AgentTool` projection.
 */
interface AgentToolInput {
  id: string;
  title?: string;
  description: string;
  safety?: 'read' | 'action' | 'destructive';
  tags?: readonly string[];
  /**
   * Positional Standard Schemas describing the tool's arguments, the same
   * shape RPC definitions carry (any [Standard Schema](https://standardschema.dev/)
   * validator: valibot, zod, arktype, devframe's built-in `s` builder, …).
   * Each is advertised under `arg0` / `arg1` / … on the tool's JSON-Schema
   * input, matching how the agent bridge coerces the incoming payload back
   * into positional arguments. Purely descriptive: the handler still
   * receives the caller's args object as-is.
   */
  args?: readonly StandardSchemaV1[];
  /** Raw JSON-Schema input override. Prefer {@link args}. */
  inputSchema?: unknown;
  outputSchema?: unknown;
  examples?: readonly {
    args: unknown[];
    description?: string;
  }[];
  /** Invoked when the tool is called. Receives args as provided by the caller. */
  handler: (args: any) => unknown | Promise<unknown>;
}
/**
 * Serializable description of an agent-readable resource. Resources
 * surface structured or textual snapshots of devframe state.
 */
interface AgentResource {
  id: string;
  /** URI used by MCP clients. Defaults to `devframe://resource/<id>`. */
  uri: string;
  name: string;
  description?: string;
  /** Defaults to `application/json`. */
  mimeType?: string;
}
/**
 * Input accepted by `DevframeAgentHost.registerResource()`.
 */
interface AgentResourceInput {
  id: string;
  name: string;
  description?: string;
  mimeType?: string;
  /** Optional URI override; if omitted, a `devframe://resource/<id>` URI is generated. */
  uri?: string;
  /** Snapshot reader. Called on each read. */
  read: () => Promise<AgentResourceContent> | AgentResourceContent;
}
/**
 * Payload returned by `AgentResourceInput.read`. Either `text` or `json` must be set.
 */
interface AgentResourceContent {
  text?: string;
  json?: unknown;
  /** Override the resource's declared mimeType for this read. */
  mimeType?: string;
}
/**
 * Unified view of the agent-exposed surface.
 */
interface AgentManifest {
  tools: readonly AgentTool[];
  resources: readonly AgentResource[];
}
/**
 * Handle returned by `registerTool` / `registerResource`.
 */
interface AgentHandle {
  unregister: () => void;
}
/**
 * A lazy source of agent tools, queried at `list()` / `getTool()` /
 * `invoke()` time, the same on-demand projection the host applies to
 * `agent`-flagged RPC definitions. Use a provider when tools *derive from*
 * other state (a command registry, a plugin catalog): the underlying state
 * stays the single source of truth and nothing needs to be kept in sync.
 *
 * Providers should namespace tool ids like any other tool; on an id
 * collision the earlier source wins (registered tools, then RPC tools,
 * then providers in registration order).
 */
type AgentToolProvider = () => readonly AgentToolInput[];
/**
 * Handle returned by `registerToolProvider`.
 */
interface AgentToolProviderHandle extends AgentHandle {
  /**
   * Signal that the provider's tool set changed. Fires
   * `agent:manifest:changed` so protocol adapters (e.g. MCP) emit
   * `tools/list_changed`.
   */
  notifyChanged: () => void;
}
/**
 * Events emitted by `DevframeAgentHost`.
 */
interface DevframeAgentHostEvents {
  'agent:tool:registered': (tool: AgentTool) => void;
  'agent:tool:unregistered': (id: string) => void;
  'agent:resource:registered': (resource: AgentResource) => void;
  'agent:resource:unregistered': (id: string) => void;
  /**
   * Fires when the unified manifest changes, including when a new
   * RPC function with an `agent` field is registered on `ctx.rpc`.
   */
  'agent:manifest:changed': () => void;
}
/**
 * Host that aggregates the agent-exposed surface of a devtool: both
 * RPC functions flagged with `agent` and plugin-registered tools /
 * resources. Consumed by protocol adapters such as the devframe MCP
 * adapter.
 */
interface DevframeAgentHost {
  readonly events: EventEmitter<DevframeAgentHostEvents>;
  /**
   * Register a tool not backed by an RPC function. Use this when you
   * want a plain agent action (e.g. a synthesized summary) that
   * shouldn't exist as a full RPC.
   */
  registerTool: (tool: AgentToolInput) => AgentHandle;
  /** Unregister a previously registered tool by id. */
  unregisterTool: (id: string) => boolean;
  /**
   * Register a lazy tool source, queried on demand; see
   * {@link AgentToolProvider}.
   */
  registerToolProvider: (provider: AgentToolProvider) => AgentToolProviderHandle;
  /** Register a readable resource. */
  registerResource: (resource: AgentResourceInput) => AgentHandle;
  /** Unregister a previously registered resource by id. */
  unregisterResource: (id: string) => boolean;
  /**
   * Unified snapshot of agent-exposed surface: RPC functions with an
   * `agent` field (auto-discovered from `ctx.rpc.definitions`) plus
   * tools/resources registered on the host.
   */
  list: () => AgentManifest;
  /**
   * Whether the devframe exposes anything to agents: an `agent`-flagged RPC
   * function, a registered tool or resource, or a provider currently
   * yielding at least one tool. The `mcp: 'auto'` default consults this to
   * decide whether a route is worth mounting.
   */
  hasSurface: () => boolean;
  /**
   * Invoke any tool by id. Routes to the underlying RPC handler for
   * `kind === 'rpc'`, or to the registered handler for `kind === 'tool'`.
   */
  invoke: (id: string, args: unknown) => Promise<unknown>;
  /** Read a resource by id. */
  read: (id: string) => Promise<AgentResourceContent>;
  /** Look up a tool by id (returns the serializable projection). */
  getTool: (id: string) => AgentTool | undefined;
  /** Look up a resource by id. */
  getResource: (id: string) => AgentResource | undefined;
}
//#endregion
//#region src/adapters/flags.d.ts
/**
 * Schema map for typed CLI flags. Keys are flag names in camelCase, so
 * this matches CAC's parsed-flag output ( `--no-open` → `noOpen` ). Each
 * value is any [Standard Schema](https://standardschema.dev/) validator
 * (valibot, zod, arktype, devframe's built-in `s`, …) used to both (a)
 * derive the CAC option type when the flag is registered and (b) validate
 * the parsed value before it's forwarded to `setup(ctx, { flags })`.
 */
type CliFlagsSchema = Record<string, StandardSchemaV1>;
/**
 * Identity helper that preserves the literal schema-map type; use this
 * so `InferCliFlags<typeof myFlags>` resolves to the right object shape.
 *
 * ```ts
 * const appFlags = defineCliFlags({
 *   depth: v.pipe(v.number(), v.integer()),
 *   config: v.optional(v.string()),
 * })
 *
 * defineDevframe({
 *   cli: { flags: appFlags },
 *   setup(ctx, info) {
 *     const flags = info.flags as InferCliFlags<typeof appFlags>
 *     flags.depth // number
 *     flags.config // string | undefined
 *   },
 * })
 * ```
 */
declare function defineCliFlags<T extends CliFlagsSchema>(flags: T): T;
/** Extract the parsed-output type from a {@link CliFlagsSchema}. */
type InferCliFlags<T extends CliFlagsSchema> = { [K in keyof T]: StandardSchemaV1.InferOutput<T[K]>; };
/** Validate the raw cac-parsed bag against a {@link CliFlagsSchema}. */
declare function parseCliFlags(schema: CliFlagsSchema, raw: Record<string, unknown>): {
  flags: Record<string, unknown>;
  issues?: string[];
};
//#endregion
//#region src/node/auth/handler.d.ts
/**
 * A ready-made pre-auth RPC handler, as produced by
 * `devframe/recipes/interactive-auth`'s `createInteractiveAuth`. Bundles
 * everything a host adapter needs to wire an authenticated server:
 * the handshake RPC functions, the resolver gate, the connect-time trust
 * hook, and the startup banner.
 *
 * `initDevframe` / `initHub` accept one of these directly via their `auth` option
 * (see {@link https://devfra.me | devframe}'s server docs), or a host can
 * wire the four pieces itself against a lower-level transport.
 */
interface DevframeAuthHandler {
  /**
   * `anonymous:devframe:auth` + `anonymous:devframe:auth:exchange` (the
   * handshake), `anonymous:devframe:auth:request-code` (client-requested
   * banner print), and `devframe:auth:revoke` (self-revoke); register these
   * on the RPC host (e.g. `rpcHost.register(fn)` for each).
   */
  rpcFunctions: RpcFunctionDefinitionAny[];
  /**
   * Resolver gate: whether `methodName` is callable given `session`'s
   * current trust state. Defaults to allowing any `anonymous:`-prefixed
   * method (see `isAnonymousRpcMethod`) plus anything once the session is
   * trusted.
   */
  authorize: (methodName: string, session: DevframeNodeRpcSession) => boolean;
  /**
   * Connect-time trust: reads a bearer token off the connection's initial
   * request (a static/pre-shared token from `clientAuthTokens`, or a token
   * minted by the code exchange) and, when valid, marks the session
   * trusted immediately, before the client's own handshake call.
   */
  onConnect: (connection: DevframeRpcConnection, session: DevframeNodeRpcSession) => void;
  /**
   * Print the current one-time code and its magic-link URL. An untrusted
   * browser client triggers this itself over
   * `anonymous:devframe:auth:request-code`; call it directly when the host
   * wants the code on screen without waiting for a client. Safe to call
   * repeatedly; it only prints once per code.
   */
  printBanner: () => void;
  /**
   * Rewrite a URL the CLI is about to open in the browser (`--open`) so the
   * tab lands already authenticated, e.g. appending the current OTP as a
   * query param. Called with the fully-resolved target URL; return it
   * unchanged to opt out. Optional: a handler that doesn't need this (e.g.
   * one gated by a pre-shared bearer token instead of an interactive code)
   * can omit it and the URL opens as-is.
   */
  buildOpenUrl?: (url: string) => string;
}
//#endregion
//#region src/types/diagnostics.d.ts
/**
 * The shared diagnostics lookup exposed by the host. A `Proxy` that resolves
 * any registered code name to its `nostics` handle (a callable that builds
 * a diagnostic and routes it through registered reporters). Typed loosely
 * because it spans heterogeneous definitions registered by different
 * integrations.
 */
type DevframeDiagnosticsLogger = Record<string, any>;
/**
 * Host for structured diagnostics: a thin layer over `nostics` that lets
 * integrations register their own coded errors/warnings into a shared
 * registry without taking a direct dependency on `nostics`.
 *
 * Typical usage from a plugin's `setup(ctx)`:
 *
 * ```ts
 * const myDiagnostics = ctx.diagnostics.defineDiagnostics({
 *   docsBase: 'https://example.com/errors',
 *   codes: {
 *     MYP0001: { why: 'Something went wrong' },
 *   },
 * })
 * ctx.diagnostics.register(myDiagnostics)
 *
 * // Through the shared lookup (loose typing):
 * throw ctx.diagnostics.logger.MYP0001()
 *
 * // Or directly on the typed handle returned from `defineDiagnostics`:
 * throw myDiagnostics.MYP0001()
 * ```
 */
interface DevframeDiagnosticsHost {
  /**
   * Proxy-backed lookup of every registered diagnostic handle by code name.
   * Resolves to a `nostics` `DiagnosticHandle`: a callable that builds a
   * diagnostic and routes it through registered reporters; prefix with
   * `throw` to raise. Loosely typed; for autocompletion, keep a reference
   * to the typed result of `defineDiagnostics()` instead.
   */
  readonly logger: DevframeDiagnosticsLogger;
  /**
   * Register additional diagnostic definitions with this host. After
   * registration, codes from the new definition are reachable via
   * `host.logger.CODE`. Plugins that want shared output formatting should
   * build their diagnostics via `host.defineDiagnostics()` first; that
   * factory pre-wires the host's ANSI console reporter.
   */
  register: (definitions: Record<string, unknown>) => void;
  /**
   * Build a typed diagnostics object with the host's ANSI console reporter
   * pre-wired. The same `devframe/utils/nostics` `defineDiagnostics` every
   * built-in plugin's module-level `diagnostics.ts` uses, so integrations
   * don't need to take a direct dependency on `nostics`.
   */
  defineDiagnostics: typeof defineDiagnostics;
}
//#endregion
//#region src/types/host.d.ts
interface DevframeHost {
  /**
   * Serve static assets at the given URL base: a local directory, or a
   * resolved {@link RemoteAssetsStore} back-proxy. Called by
   * `DevframeViewHost.hostStatic` (which normalizes `RemoteAssets`
   * declarations into stores first). Implementations map this to whatever
   * the underlying runtime expects (Vite middleware, h3 handler, no-op
   * for build snapshots); the shared engine in
   * `devframe/utils/serve-static` accepts either shape.
   */
  mountStatic: (base: string, source: string | RemoteAssetsStore) => void | Promise<void>;
  /**
   * Serve the host's connection meta (`__connection.json`) at the given URL
   * base, so a devframe SPA mounted there can discover the RPC/WS endpoint
   * via `connectDevframe()`'s relative `./__connection.json` fetch.
   *
   * Called by `ctx.install` for each mounted devframe (alongside
   * `mountStatic`). Without it, an embedded SPA can only discover the
   * endpoint by inheriting it from a same-origin parent window, which fails
   * for cross-origin or sandboxed iframes. Implementations serve the same
   * meta they expose at the hub's own base.
   *
   * Optional in the type, but a host that mounts a devframe with servable
   * `clientAssets` yet omits this hook triggers a `DF8106` diagnostic, since the
   * SPA's `./__connection.json` fetch would otherwise fall through and break
   * silently. A static-snapshot host that bakes the meta into its served files
   * can implement it as a no-op to acknowledge this intentionally.
   */
  mountConnectionMeta?: (base: string) => void | Promise<void>;
  /**
   * Return the public origin the host is reachable at, e.g.
   * `http://localhost:5173`. Used by the dock host to enrich remote
   * iframe URLs with a full `origin`. Called only when a dock needs an
   * absolute URL; hosts that never serve remote docks can return any
   * reasonable value.
   */
  resolveOrigin: () => string;
  /**
   * Resolve a directory the host owns for persisted devframe state.
   * Each host picks its own app-name namespace so storage doesn't
   * collide between, say, the Vite host (`.vite/devframe`) and a
   * standalone CLI host (`.<appName>/devframe`).
   *
   *   - `workspace`: state shared with the whole team through version
   *     control (saved queries, shared presets). Conventionally
   *     `${workspaceRoot}/.devframe/`; hosts must place it somewhere
   *     committable.
   *   - `project`:   per-checkout private state (caches, personal
   *     settings). Typically under
   *     `${cwd}/node_modules/.<appName>/devframe/`, which version
   *     control ignores.
   *   - `global`:    per-user state (auth tokens, machine-wide
   *     preferences). Typically under
   *     `${homedir()}/.<appName>/devframe/`.
   *
   * Implementations should ensure the directory exists or be safe to
   * pass to a downstream `createStorage(...)` call that creates it
   * lazily.
   */
  getStorageDir: (scope: DevframeStorageScope) => string;
}
/**
 * Storage placement classes for {@link DevframeHost.getStorageDir}:
 * `workspace` is committable and team-shared, `project` is per-checkout
 * private, `global` is per-user.
 */
type DevframeStorageScope = 'workspace' | 'project' | 'global';
//#endregion
//#region src/client/browser-agent.d.ts
interface BrowserAgentToolManifest {
  id: string;
  title?: string;
  description: string;
  safety: 'read' | 'action' | 'destructive';
  tags?: readonly string[];
  inputSchema?: unknown;
}
//#endregion
//#region src/types/rpc-augments.d.ts
/**
 * To be extended
 */
interface DevframeRpcClientFunctions {
  /** Clear cached RPC results and refresh cache eligibility. */
  'devframe:rpc:cache:invalidate': () => Promise<void>;
  /** Invoke a tool registered in this browser document. @internal */
  'devframe:agent:invoke-client-tool': (id: string, args: Record<string, unknown>) => Promise<unknown>;
  /**
   * Server→client notification that this connection's auth token has been
   * revoked. The client drops to untrusted on receipt. Broadcast by
   * `revokeActiveConnectionsForToken`.
   *
   * @internal
   */
  'devframe:auth:revoked': () => Promise<void>;
  /**
   * Streaming chunk pushed from server to subscribed clients. Wired by
   * `RpcStreamingHost`; do not register manually.
   *
   * @internal
   */
  'devframe:streaming:chunk': (channel: string, id: string, seq: number, chunk: any) => Promise<void>;
  /**
   * Streaming terminator pushed from server to subscribed clients. Wired by
   * `RpcStreamingHost`; do not register manually.
   *
   * @internal
   */
  'devframe:streaming:end': (channel: string, id: string, error?: {
    name: string;
    message: string;
  }) => Promise<void>;
  /**
   * Server→client cancel for an in-flight upload. Wired by
   * `RpcStreamingHost`; do not register manually.
   *
   * @internal
   */
  'devframe:streaming:upload-cancel': (channel: string, id: string) => Promise<void>;
  /**
   * Full shared-state snapshot pushed from server to subscribed clients.
   * Wired by `RpcSharedStateHost`; do not register manually.
   *
   * @internal
   */
  'devframe:rpc:client-state:updated': (key: string, fullState: any, syncId: string) => Promise<void>;
  /**
   * Incremental shared-state patch pushed from server to subscribed clients.
   * Wired by `RpcSharedStateHost`; do not register manually.
   *
   * @internal
   */
  'devframe:rpc:client-state:patch': (key: string, patches: any[], syncId: string) => Promise<void>;
}
/**
 * To be extended
 */
interface DevframeRpcServerFunctions {
  /** Methods eligible for automatic client caching. @internal */
  'devframe:rpc:cacheable-functions': () => Promise<string[]>;
  /** Replace this connection's browser-agent tool manifest, tagged with the calling tab's stable client id. @internal */
  'devframe:agent:sync-client-tools': (clientId: string, tools: BrowserAgentToolManifest[]) => Promise<void>;
  /**
   * Authenticate a connection with a previously-issued bearer token; resolves
   * whether the connection is now trusted. The interactive handler is provided
   * by the host adapter (e.g. Vite DevTools); the standalone server registers
   * an auto-trust noop when `auth: false`.
   *
   * Named with the `anonymous:` prefix (see `isAnonymousRpcMethod`) so it is
   * reachable before the connection is trusted; this is the *only* rule the
   * pre-trust gate applies, no per-method allowlist.
   *
   * @internal
   */
  'anonymous:devframe:auth': (params: {
    authToken: string;
    ua: string;
    origin: string;
  }) => Promise<{
    isTrusted: boolean;
  }>;
  /**
   * Exchange a one-time authentication code (shown by the dev server) for a fresh,
   * node-issued bearer token, returning the token on success or `null`. The
   * handler is provided by the host adapter on top of `exchangeTempAuthCode`.
   *
   * Named with the `anonymous:` prefix (see `isAnonymousRpcMethod`) so it is
   * reachable before the connection is trusted.
   *
   * @internal
   */
  'anonymous:devframe:auth:exchange': (params: {
    code: string;
    ua: string;
    origin: string;
  }) => Promise<{
    authToken: string | null;
  }>;
  /**
   * Ask the server to print its auth banner (code + magic link) for this
   * client, e.g. when an auth UI first shows; `reissue: true` rotates the code
   * first (the manual "re-issue" action). Registered by
   * `recipes/interactive-auth`; a repeat request for an already-printed code
   * is a no-op.
   *
   * Named with the `anonymous:` prefix (see `isAnonymousRpcMethod`) so it is
   * reachable before the connection is trusted.
   *
   * @internal
   */
  'anonymous:devframe:auth:request-code': (params: {
    ua: string;
    origin: string;
    reissue?: boolean;
  }) => Promise<void>;
  /**
   * Self-revoke: the caller asks the server to revoke its own bearer token
   * (if any) and drop to untrusted. Requires an already-trusted caller, so
   * unlike the two handshake methods above it does **not** carry the
   * `anonymous:` prefix. Registered by `recipes/interactive-auth`.
   *
   * @internal
   */
  'devframe:auth:revoke': () => Promise<void>;
  /**
   * Subscribe a client to a shared-state key. Wired by
   * `RpcSharedStateHost`; do not register manually.
   *
   * @internal
   */
  'devframe:rpc:server-state:subscribe': (key: string) => Promise<void>;
  /**
   * Read the current value for a shared-state key. Wired by
   * `RpcSharedStateHost`; do not register manually.
   *
   * @internal
   */
  'devframe:rpc:server-state:get': (key: string) => Promise<any>;
  /**
   * Replace a shared-state value (from the client). Wired by
   * `RpcSharedStateHost`; do not register manually.
   *
   * @internal
   */
  'devframe:rpc:server-state:set': (key: string, value: any, syncId: string) => Promise<void>;
  /**
   * Apply a patch to a shared-state value (from the client). Wired by
   * `RpcSharedStateHost`; do not register manually.
   *
   * @internal
   */
  'devframe:rpc:server-state:patch': (key: string, patches: any[], syncId: string) => Promise<void>;
  /**
   * Client→server streaming subscription with optional replay cursor.
   * Wired by `RpcStreamingHost`; do not register manually.
   *
   * @internal
   */
  'devframe:streaming:subscribe': (channel: string, id: string, opts?: {
    afterSeq?: number;
  }) => Promise<void>;
  /**
   * Client→server streaming unsubscribe. Wired by `RpcStreamingHost`;
   * do not register manually.
   *
   * @internal
   */
  'devframe:streaming:unsubscribe': (channel: string, id: string) => Promise<void>;
  /**
   * Client→server streaming cancellation request. Wired by
   * `RpcStreamingHost`; do not register manually.
   *
   * @internal
   */
  'devframe:streaming:cancel': (channel: string, id: string) => Promise<void>;
  /**
   * Client→server upload chunk. Wired by `RpcStreamingHost`; do not
   * register manually.
   *
   * @internal
   */
  'devframe:streaming:upload-chunk': (channel: string, id: string, seq: number, chunk: any) => Promise<void>;
  /**
   * Client→server upload terminator. Wired by `RpcStreamingHost`; do not
   * register manually.
   *
   * @internal
   */
  'devframe:streaming:upload-end': (channel: string, id: string, error?: {
    name: string;
    message: string;
  }) => Promise<void>;
}
/**
 * To be extended
 */
interface DevframeRpcSharedStates {
  /**
   * Wire-service advertisements: package name → `{ package, version,
   * scope, meta }` for every installed {@link import('./services').DevframeServiceDefinition}.
   * Written by the node services host at the `ready()` barrier; clients read
   * it through `client.services` (or subscribe to it directly for
   * reactivity). Read-only from the browser.
   */
  'devframe:services': DevframeServicesState;
}
//#endregion
//#region src/types/views.d.ts
interface DevframeViewHost {
  /**
   * Static mounts registered through {@link DevframeViewHost.hostStatic}, each
   * carrying the `resolveFrom` base it was mounted with so a build step that
   * copies these itself (rather than serving them live) re-resolves a remote
   * source to the same locally-installed copy it would serve live.
   *
   * @internal
   */
  buildStaticDirs: {
    baseUrl: string;
    source: StaticAssetsSource;
    resolveFrom?: string | null;
  }[];
  /**
   * Helper to host static files
   * - In `dev` mode, it will register middleware to `viteServer.middlewares` to host the static files
   * - In `build` mode, it will copy the static files to the dist directory
   *
   * Accepts a local dist directory, or a {@link StaticAssetsSource} remote
   * declaration served through devframe's caching CDN back-proxy.
   *
   * `defaultResolveFrom` overrides, for this call only, the context's own
   * `importMetaUrl` as the default `resolveFrom` for a remote source that
   * doesn't set one. A shared host that mounts assets on behalf of another
   * devframe (a hub installing a plugin) passes that plugin's `importMetaUrl`
   * so the assets resolve against the plugin's dependency graph rather than
   * the host's.
   */
  hostStatic: (baseUrl: string, source: StaticAssetsSource, defaultResolveFrom?: string | null) => void;
}
//#endregion
//#region src/types/scope.d.ts
type AnyRpcFn = (...args: any[]) => any;
/**
 * Resolve a scoped bare name `T` back to its fully-qualified entry in
 * `Registry` (`<NS>:<T>`). Indexing the plain registry behind a `keyof`
 * guard keeps TypeScript from rejecting a generic index into the
 * key-remapped `Scoped*Functions<NS>` maps (TS2536) once a plugin augments
 * the registry, while preserving each name's argument/return typing.
 */
type ScopedRpcFn<Registry, NS extends string, T extends string> = `${NS}:${T}` extends keyof Registry ? Extract<Registry[`${NS}:${T}`], AnyRpcFn> : AnyRpcFn;
/**
 * Augmentable registry mapping a scope namespace to the shape of its
 * persisted settings. Tools augment it so `ctx.scope('my-plugin')`
 * gets a fully-typed `settings.global` / `settings.project`:
 *
 * ```ts
 * declare module 'devframe' {
 *   interface DevframeSettingsRegistry {
 *     'my-plugin': { theme: 'light' | 'dark', recentFiles: string[] }
 *   }
 * }
 * ```
 */
interface DevframeSettingsRegistry {}
/**
 * Resolve the settings shape for a namespace from
 * {@link DevframeSettingsRegistry}, falling back to an open record when
 * the namespace hasn't been augmented.
 */
type SettingsForNamespace<NS extends string> = NS extends keyof DevframeSettingsRegistry ? DevframeSettingsRegistry[NS] extends Record<string, any> ? DevframeSettingsRegistry[NS] : Record<string, any> : Record<string, any>;
/**
 * A persisted key-value settings store for one scope (`global` or
 * `project`). Backed by a file on the node side and by the shared-state
 * sync protocol on the client, so a `set` on either side propagates to
 * every connected peer and survives restarts.
 *
 * Every method is async because the underlying shared state is resolved
 * lazily on first access.
 */
interface DevframeSettingsStore<T extends Record<string, any> = Record<string, any>> {
  /** Read a single setting. Resolves to `undefined` when unset. */
  get: <K extends keyof T>(key: K) => Promise<T[K] | undefined>;
  /** Write a single setting. */
  set: <K extends keyof T>(key: K, value: T[K]) => Promise<void>;
  /** Remove a single setting. */
  delete: <K extends keyof T>(key: K) => Promise<void>;
  /** Read the whole settings object (immutable snapshot). */
  all: () => Promise<Readonly<T>>;
  /**
   * Subscribe to settings changes. Resolves to an unsubscribe function.
   * Fires on every local or remote mutation with the full snapshot.
   */
  onChange: (fn: (value: Readonly<T>) => void) => Promise<() => void>;
}
/**
 * The two settings scopes available on a scoped context.
 *
 *   - `project`: per-workspace state, persisted under the host's
 *     `workspace` storage dir. Project-local settings.
 *   - `global`:  per-user state, persisted under the host's `global`
 *     storage dir. Machine-wide preferences.
 */
interface DevframeSettings<T extends Record<string, any> = Record<string, any>> {
  global: DevframeSettingsStore<T>;
  project: DevframeSettingsStore<T>;
}
/**
 * Map the server-side RPC registry down to the bare names owned by a
 * namespace, so a scoped `call('get-cwd')` is typed without the
 * `my-plugin:` prefix.
 */
type ScopedServerFunctions<NS extends string> = { [K in keyof DevframeRpcServerFunctions as K extends `${NS}:${infer R}` ? R : never]: DevframeRpcServerFunctions[K]; };
/**
 * Map the client-side RPC registry down to the bare names owned by a
 * namespace, used by scoped `broadcast`.
 */
type ScopedClientFunctions<NS extends string> = { [K in keyof DevframeRpcClientFunctions as K extends `${NS}:${infer R}` ? R : never]: DevframeRpcClientFunctions[K]; };
/**
 * Map the shared-state registry down to the bare keys owned by a
 * namespace, so scoped `sharedState('messages')` is typed without the
 * `my-plugin:` prefix.
 */
type ScopedSharedStates<NS extends string> = { [K in keyof DevframeRpcSharedStates as K extends `${NS}:${infer R}` ? R : never]: DevframeRpcSharedStates[K]; };
/**
 * Broadcast options for a scoped client method (bare name).
 */
interface ScopedBroadcastOptions<METHOD, Args extends any[]> {
  method: METHOD;
  args: Args;
  optional?: boolean;
  event?: boolean;
}
/**
 * Node-side streaming host scoped to a namespace. Channel names are
 * auto-prefixed with `<namespace>:`.
 */
interface DevframeScopedStreamingHost {
  /**
   * Register a streaming channel. The bare `name` is auto-prefixed with
   * the scope namespace (`<namespace>:<name>`); pass an already-qualified
   * name (containing `:`) to opt out.
   */
  create: <T = unknown>(name: string, opts?: RpcStreamingChannelOptions) => RpcStreamingChannel<T>;
}
/**
 * The scoped node RPC surface exposed on `ctx.scope('my-plugin').rpc`.
 * IDs and keys you pass are auto-namespaced with `my-plugin:`.
 */
interface DevframeScopedNodeRpc<NS extends string = string> {
  /** The namespace this surface is scoped to. */
  readonly namespace: NS;
  /**
   * Register a server RPC function. The definition's `name` must be bare
   * (no `:`); it is stored as `<namespace>:<name>`. Throws `DF0034` if an
   * already-namespaced name is passed.
   */
  register: (fn: RpcFunctionDefinition<string, any, any, any, any, any, DevframeNodeContext>, force?: boolean) => void;
  /**
   * Update a previously registered server RPC function. Same naming rules
   * as {@link DevframeScopedNodeRpc.register}.
   */
  update: (fn: RpcFunctionDefinition<string, any, any, any, any, any, DevframeNodeContext>, force?: boolean) => void;
  /**
   * Invoke a locally registered server RPC function. Bare names are
   * resolved within this namespace; pass a fully-qualified name
   * (containing `:`) to call another scope's function.
   */
  call: {
    <T extends keyof ScopedServerFunctions<NS> & string>(method: T, ...args: Parameters<ScopedRpcFn<DevframeRpcServerFunctions, NS, T>>): Promise<Awaited<ReturnType<ScopedRpcFn<DevframeRpcServerFunctions, NS, T>>>>;
    <T extends keyof DevframeRpcServerFunctions & string>(method: T, ...args: Parameters<Extract<DevframeRpcServerFunctions[T], AnyRpcFn>>): Promise<Awaited<ReturnType<Extract<DevframeRpcServerFunctions[T], AnyRpcFn>>>>;
    (method: string, ...args: any[]): Promise<any>;
  };
  /**
   * Broadcast a client RPC event to every connected client. Bare method
   * names are resolved within this namespace.
   */
  broadcast: {
    <T extends keyof ScopedClientFunctions<NS> & string>(options: ScopedBroadcastOptions<T, Parameters<ScopedRpcFn<DevframeRpcClientFunctions, NS, T>>>): Promise<void>;
    (options: ScopedBroadcastOptions<string, any[]>): Promise<void>;
  };
  /**
   * Resolve a namespaced shared state. Bare keys are resolved within this
   * namespace; pass a fully-qualified key (containing `:`) to opt out.
   */
  sharedState: {
    <T extends keyof ScopedSharedStates<NS> & string>(key: T, options?: RpcSharedStateGetOptions<ScopedSharedStates<NS>[T]>): Promise<SharedState<ScopedSharedStates<NS>[T]>>;
    <T extends Record<string, any> = Record<string, any>>(key: string, options?: RpcSharedStateGetOptions<T>): Promise<SharedState<T>>;
  };
  /** Streaming host scoped to this namespace. */
  streaming: DevframeScopedStreamingHost;
  /** Pass-through to the current RPC session, when called inside a handler. */
  getCurrentRpcSession: () => DevframeNodeRpcSession | undefined;
}
/**
 * A namespace-scoped view of {@link DevframeNodeContext}. Returned by
 * `ctx.scope('my-plugin')`. Re-exposes the unscoped surfaces (`views`,
 * `diagnostics`, `agent`, …), replaces `rpc` with the auto-namespaced
 * {@link DevframeScopedNodeRpc}, and adds a top-level `settings` store.
 */
interface DevframeScopedNodeContext<NS extends string = string, Settings extends Record<string, any> = Record<string, any>> {
  /** The namespace this context is scoped to. */
  readonly namespace: NS;
  /** The underlying unscoped context. */
  readonly base: DevframeNodeContext;
  readonly workspaceRoot: string;
  readonly cwd: string;
  readonly mode: 'dev' | 'build';
  host: DevframeHost;
  rpc: DevframeScopedNodeRpc<NS>;
  /** Persisted settings for this namespace (`global` + `project`). */
  settings: DevframeSettings<Settings>;
  views: DevframeViewHost;
  diagnostics: DevframeDiagnosticsHost;
  agent: DevframeAgentHost;
  /**
   * Return a new scoped context, replacing the current scope. Pass `null`
   * or `''` to un-scope and get the base context.
   */
  scope: DevframeNodeContext['scope'];
}
//#endregion
//#region src/types/services.d.ts
/**
 * Augmentation point mapping service ids to their implementation types.
 * Providers extend this via `declare module 'devframe'`.
 */
interface DevframeServicesRegistry {}
/**
 * A known (augmented) service id, or any namespaced string for services
 * without a published type augmentation.
 */
type DevframeServiceId = keyof DevframeServicesRegistry | (string & {});
/** Resolved service type for an id: augmented type, or `unknown`. */
type DevframeServiceOf<ID> = ID extends keyof DevframeServicesRegistry ? DevframeServicesRegistry[ID] : unknown;
/**
 * Augmentation point mapping a service's npm package name to the RPC scope
 * namespace it registers its functions under, so a client's
 * `services.get('@devframes/service-x')` returns a scoped RPC surface typed
 * against that namespace. Service packages contribute their entry via
 * declaration merging:
 *
 * ```ts
 * declare module 'devframe' {
 *   interface DevframeServicesScopeRegistry {
 *     '@devframes/service-open': 'devframes:service:open'
 *   }
 * }
 * ```
 */
interface DevframeServicesScopeRegistry {}
/** Resolved RPC scope namespace for a service package name, or `string`. */
type DevframeServiceScopeOf<PKG> = PKG extends keyof DevframeServicesScopeRegistry ? DevframeServicesScopeRegistry[PKG] & string : string;
/**
 * A **wire service**: a shared server-side capability (e.g. open-in-editor,
 * syntax highlighting) packaged so any devframe host can install it once and
 * every plugin/client can consume it without re-implementing or re-bundling
 * it. Contrast with plain {@link DevframeServicesHost.provide}, which shares
 * an in-process object between plugins on the node side only: a
 * `DevframeServiceDefinition` additionally registers RPC functions under its
 * {@link DevframeServiceDefinition.scope} and is **advertised to clients**
 * through the reactive `devframe:services` shared state, so browser UIs can
 * feature-detect it (`ctx.services.has(pkg)`) and degrade gracefully.
 *
 * Ship one per npm package (`@devframes/service-<slug>` for first-party),
 * with the package's default export being the `create<X>Service` factory,
 * never a pre-built instance.
 */
interface DevframeServiceDefinition<API = unknown, Options = any> {
  /**
   * The npm package name this service ships in, also its registry key
   * (`ctx.services.has('@devframes/service-x')` on both node and client).
   */
  package: string;
  /** Semver of the service, advertised to clients and checked against descriptor ranges. */
  version: string;
  /**
   * RPC namespace the service's functions register under, following the
   * plugin id grammar (e.g. `devframes:service:open`). `setup` receives a
   * context pre-scoped to it, so functions register with bare names.
   */
  scope: string;
  /**
   * Extra advertised metadata (feature flags, defaults, …). Must be
   * JSON-serializable, since it is mirrored to every client.
   */
  meta?: Record<string, unknown>;
  /**
   * This instance's own option set (usually baked in by the factory that
   * created the definition). Joins the merge alongside every declarative
   * descriptor's `options`.
   */
  options?: Options;
  /**
   * Merge the option sets contributed by multiple installers (in declaration
   * order) into the one bag passed to `setup`. Defaults to a shallow merge
   * where later sets win.
   */
  mergeOptions?: (sets: Options[]) => Options;
  /**
   * Construct the service: register its RPC functions on the pre-scoped
   * context and return its **node API**: the in-process surface other
   * plugins get from `ctx.services.get(package)` (no RPC hop server-side).
   * `info.options` carries every installer's option sets merged at the
   * `ready()` barrier (via {@link mergeOptions} when present, otherwise a
   * shallow merge in declaration order, later sets win).
   */
  setup: (ctx: DevframeScopedNodeContext, info: {
    options?: Options;
  }) => API | Promise<API>;
}
/**
 * Declarative reference to a service package: the form a
 * {@link DevframeServiceInput} takes when the installer doesn't hold the
 * factory itself (e.g. `DevframeDefinition.services`). The host imports the
 * package's default-export factory and installs the resulting definition at
 * the `ready()` barrier.
 */
interface DevframeServiceDescriptor<Options = any> {
  /** npm package name of the service (its default export is the factory). */
  package: string;
  /**
   * Accepted semver range for the installed service. An unsatisfied range
   * warns (`DF0069`), or throws (`DF0068`) when {@link required}, while the
   * service still installs; the advertised meta carries the real version.
   */
  version?: string;
  /**
   * Fail hard when the service can't be imported or its version range isn't
   * satisfied. By default a missing service is skipped silently; clients see
   * `has() === false` and degrade.
   *
   * @default false
   */
  required?: boolean;
  /** Option set this installer contributes to the merge. */
  options?: Options;
}
/**
 * What can be passed to `ctx.services.install()` (and listed in
 * `DevframeDefinition.services`): a declarative {@link DevframeServiceDescriptor}
 * (the host imports the factory) or a ready {@link DevframeServiceDefinition}
 * (the installer already called the factory, so its `options` join the merge).
 */
type DevframeServiceInput<API = unknown, Options = any> = DevframeServiceDescriptor<Options> | DevframeServiceDefinition<API, Options>;
/**
 * One service's advertisement entry, mirrored to clients through the
 * `devframe:services` shared state.
 */
interface DevframeServiceMeta {
  /** npm package name, the registry key. */
  package: string;
  /** Installed version of the service. */
  version: string;
  /** RPC namespace its functions live under. */
  scope: string;
  /** Extra service-declared metadata. */
  meta?: Record<string, unknown>;
}
/**
 * Shape of the `devframe:services` shared state: package name → advertisement.
 */
type DevframeServicesState = Record<string, DevframeServiceMeta>;
interface DevframeServicesHost {
  /**
   * Publish a service under a namespaced id. Throws `DF0037` when the id is
   * already provided (revoke first to replace). Returns a revoke function.
   */
  provide: <ID extends DevframeServiceId>(id: ID, service: DevframeServiceOf<ID>) => () => void;
  /** The service currently provided under `id`, or `undefined`. */
  get: <ID extends DevframeServiceId>(id: ID) => DevframeServiceOf<ID> | undefined;
  has: (id: DevframeServiceId) => boolean;
  /**
   * Run `callback` with the service as soon as it is available: immediately
   * when already provided, otherwise on `provide`. Survives provider/consumer
   * setup-order differences. The callback also re-fires if the service is
   * revoked and provided again. Returns an unsubscribe function.
   */
  whenAvailable: <ID extends DevframeServiceId>(id: ID, callback: (service: DevframeServiceOf<ID>) => void) => () => void;
  /** Ids of every currently-provided service. */
  keys: () => string[];
  /**
   * Install a **wire service** (see {@link DevframeServiceDefinition}). The
   * common path is declarative: list services on `DevframeDefinition.services`
   * (or `initHub({ services })`) and the adapter installs them for you before
   * `setup` runs. Call `install()` directly only for the dynamic escape hatch:
   * a service configured at runtime from data unknown until then.
   *
   * Before the pre-setup ready fires, installs are queued and their option
   * sets deep-merged, constructing each service **once**. After it, an install
   * constructs immediately; installing an already-installed package returns
   * the existing API (a warning, `DF0066`, when the late install carried
   * options, since they're ignored). The returned promise resolves with the
   * node API (or `undefined` when an optional descriptor's package can't be
   * imported).
   *
   * `resolveFrom` is where a descriptor's package resolves **from**: a path
   * or file URL (e.g. the declaring devframe's `importMetaUrl`), or an npm
   * package name, so its declared services resolve against the declarer's own
   * dependencies. Falls back to the context's `workspaceRoot` then `cwd`.
   */
  install: <API = unknown, Options = any>(input: DevframeServiceInput<API, Options>, options?: {
    resolveFrom?: string | null;
  }) => Promise<API | undefined>;
  /**
   * Construct every queued service, importing descriptor packages, merging
   * option sets, `provide()`-ing each node API under its package name, and
   * advertising it to clients via the `devframe:services` shared state.
   * Idempotent. **Internal**: the adapters call it once, before running any
   * `setup`, so services are ready for `setup` to consume; application code
   * uses declarative `services` (or `install()` for the dynamic case) and
   * never calls this. Rejects when a `required` service fails to import or
   * misses its version range.
   */
  ready: () => Promise<void>;
}
//#endregion
//#region src/types/devframe.d.ts
/**
 * Classification of how a devframe is being deployed. Hosted adapters
 * (`vite`, `embedded`) share their origin with a host app and must
 * namespace their mount path under `/__<id>/`. Standalone adapters
 * (`cli`, `build`) own the origin and default to `/`.
 */
type DevframeDeploymentKind = 'standalone' | 'hosted';
/**
 * How a hub deduplicates devframes that share an `id` when more than one
 * is mounted onto the same hub. See {@link DevframeDefinition.duplicationStrategy}.
 *
 * - `'warn'` (default): keep the first registration, drop later
 *   duplicates, and emit a warning diagnostic (`DF8105`).
 * - `'silent'`: drop later duplicates without warning.
 * - `'throw'`: throw when a duplicate is mounted.
 * - `'duplicate'`: let every instance coexist under a disambiguated
 *   dock id.
 */
type DevframeDuplicationStrategy = 'warn' | 'silent' | 'throw' | 'duplicate';
/**
 * Controls where the browser opens the RPC WebSocket, advertised in
 * `__connection.json` and used to bind the dev server. The three shapes map
 * to the three connection scenarios; precedence is `url` > `port` > `route`:
 *
 *   1. **Same server, different route** (default): leave `port`/`url` unset.
 *      The socket shares the HTTP server's port and binds to `route`
 *      (`__ws`). The client connects to its own origin, so the link
 *      survives a reverse proxy that rewrites the host/port/subpath.
 *
 *   2. **Different port**: set `port`. The socket binds on its own port on the
 *      same host; the client targets `ws(s)://<page-host>:<port>/<route>`.
 *
 *   3. **Remote, different origin**: set `url` to a full `ws://`/`wss://`
 *      endpoint (e.g. a public tunnel or relay). The client uses it verbatim.
 */
interface DevframeWsOptions {
  /**
   * Upgrade route segment the socket binds to and is advertised at, relative
   * to the SPA base. Default: `__ws`.
   */
  route?: string;
  /**
   * Bind the socket on its own port instead of sharing the HTTP port. The
   * browser connects to this port on the page's hostname. Implies
   * {@link DevframeWsOptions.sidecar}.
   */
  port?: number;
  /**
   * Start a side-car WebSocket server on a free port, for hosts whose request
   * handlers can't accept upgrades (Next.js route handlers, Nitro, Rsbuild).
   * The resolved port is advertised in `__connection.json`, so the browser
   * finds it without any further wiring. Set `port` instead to pin it.
   */
  sidecar?: boolean;
  /**
   * Advertise a fixed, fully-qualified endpoint on another origin (a full
   * `ws://`/`wss://` URL). Takes precedence over `port`/`route` in the meta.
   */
  url?: string;
}
/**
 * Controls the SSE RPC endpoint, the WebSocket-free transport for hosts
 * and proxies where the upgrade isn't available. It rides whatever HTTP
 * surface serves the instance (the same one serving `__connection.json`),
 * so a relative `route` always resolves; there is no port plumbing of its
 * own. Enabled by default alongside the WebSocket; pass `sse: false` to
 * disable, or `ws: false` to run SSE-only (`backend: 'sse'`).
 */
interface DevframeSseOptions {
  /**
   * Route segment the SSE endpoint binds to and is advertised at, relative
   * to the SPA base. Default: `__sse`.
   */
  route?: string;
}
/**
 * An **optional** identity check layered on top of the origin gate. The
 * route-based MCP endpoint trusts same-machine callers by default (the
 * loopback origin gate is enough), so this is opt-in hardening for the cases
 * where a same-machine process is not a trust boundary, like a LAN/tunnel
 * origin, a shared/CI box, or a destructive tool surface:
 *
 * - a non-empty **bearer token string**: the request must carry
 *   `Authorization: Bearer <token>`, compared in constant time. Back it with
 *   an environment variable rather than a literal;
 * - a **callback** `(request) => boolean | Promise<boolean>`: a custom
 *   identity check (validate a signed header, an mTLS-derived claim, …). It
 *   only governs identity and cannot relax the origin gate;
 * - `false`, the default: **origin-only**, trusting same-machine callers.
 */
type McpAuthorization = string | ((request: Request) => boolean | Promise<boolean>) | false;
/**
 * The route-based MCP setting accepted everywhere a host mounts a devframe
 * (`initDevframe` / `initHub` / `createDevServer` options, `createCac` /
 * `--mcp`, the framework kits):
 *
 * - `'auto'`, the default: mount the route when the devframe exposes an
 *   agent surface (an `agent`-flagged RPC function, or a tool / resource /
 *   provider registered on `ctx.agent`) AND the optional `@devframes/agentic`
 *   peer (the MCP adapter and SDK) is installed. An empty agent surface
 *   mounts nothing and loads no MCP code; a non-empty one without the peer
 *   warns once (DF0078) and mounts nothing.
 * - `true`: always mount at the default `__mcp` route; a missing
 *   `@devframes/agentic` throws DF0079.
 * - `false`: never mount, and never probe or warn.
 * - {@link McpRouteOptions}: always mount (like `true`), with a custom route
 *   path, origin allow-list, or {@link McpAuthorization} identity check.
 *
 * A mounted route trusts same-machine callers by default (the loopback
 * origin gate), exactly like `mcp: true`.
 */
type McpSetting = boolean | 'auto' | McpRouteOptions;
/**
 * Configuration for the route-based MCP server mounted alongside the dev
 * server (via {@link DevframeCliOptions.mcp}). The endpoint speaks
 * the MCP Streamable-HTTP transport over the same origin as the SPA,
 * exposing the definition's `ctx.agent` tools + shared-state resources to
 * external MCP clients connected to the *running* server.
 */
interface McpRouteOptions {
  /**
   * Route segment the MCP endpoint binds to, relative to the SPA base.
   * Default: `__mcp` (i.e. `/__mcp` standalone, `/__<id>/__mcp` hosted).
   */
  path?: string;
  /**
   * Optional identity check, layered on top of the origin gate and checked
   * **after** it. Defaults to origin-only (`false`): the route trusts
   * same-machine callers, since the loopback origin gate already keeps
   * arbitrary remote/browser callers out. Set a bearer token or a callback to
   * harden the route when a same-machine process is not your trust boundary
   * (LAN/tunnel origin, shared/CI host, destructive tools). See
   * {@link McpAuthorization}.
   */
  authorization?: McpAuthorization;
  /**
   * Extra `Origin` header values to accept beyond the loopback default
   * (`localhost`/`127.0.0.1`/`::1` and any `Origin`-less native client).
   * Add your LAN/tunnel origin here when reaching the endpoint from another
   * host, mirroring the WS transport's origin gate. Pass `false` to disable
   * origin checking entirely (not recommended). Default: loopback-only.
   *
   * This is the endpoint's DNS-rebinding protection: the shared
   * `isAllowedOrigin` gate the WS upgrade already uses, applied as external
   * middleware (the approach the MCP SDK now recommends over its own
   * deprecated `allowedHosts`/`allowedOrigins` transport flags). When you
   * widen it past loopback, layer on {@link McpRouteOptions.authorization} to
   * prove identity too.
   */
  allowedOrigins?: readonly string[] | false;
  /**
   * Which shared-state keys the route exposes to agents, through the built-in
   * `devframe_state_read` tool and the `devframe://state/<key>` resources.
   * - `true` (default): every key the host publishes
   * - `false`: none
   * - `(key) => boolean`: only the keys the filter accepts
   *
   * The states themselves stay available to the UI over RPC.
   */
  exposeSharedState?: boolean | ((key: string) => boolean);
  /**
   * Usage guidance for the route, sent as `instructions` in the MCP
   * `initialize` (and `server/discover`) result. An MCP client can add it to
   * the coding agent's context, for example to say which tool to call first.
   * Omitted or empty sends no instructions.
   */
  instructions?: string;
}
interface DevframeCliOptions {
  /** Binary name; default: the devframe's `id`. */
  command?: string;
  /** Preferred port for the dev server (default 9999). */
  port?: number;
  /** Port scan range, forwarded to `get-port-please`. */
  portRange?: [number, number];
  /** Prefer a random open port. */
  random?: boolean;
  /** Default host to bind to; `--host` overrides. */
  host?: string;
  /**
   * Auto-open the browser when the dev server starts.
   * `true` opens the resolved origin; a string opens that relative path.
   * The `--open` / `--no-open` flags override this.
   */
  open?: boolean | string;
  /**
   * Authentication for the standalone dev server.
   *
   *   - `undefined` / `true`: the standalone adapters (`cli` /
   *     served `build`) auto-wire devframe's interactive OTP auth
   *     (`createInteractiveAuth`): an untrusted client can only reach
   *     `anonymous:` methods until it exchanges the printed one-time code.
   *     The adapter prints the code + magic-link banner once the server is
   *     listening.
   *   - `false`: no gate, for trusted single-user localhost tools where an
   *     auth round-trip only gets in the way (the built-in plugins set this).
   *     The `--no-auth` CLI flag maps here for one-off runs.
   *   - A {@link DevframeAuthHandler}: a custom handler (e.g. a tuned
   *     `createInteractiveAuth`, or an entirely different scheme) passed
   *     straight through to the RPC transport binding.
   *
   * Hosted adapters (`vite`, `embedded`) ignore this and defer to the host's
   * auth; `@vitejs/devtools` honors the equivalent `devtools.clientAuth`.
   *
   * @default true
   */
  auth?: boolean | DevframeAuthHandler;
  /**
   * How the browser reaches the RPC WebSocket. Defaults to sharing the HTTP
   * port on the `__ws` route. See {@link DevframeWsOptions} for the
   * different-port and remote-origin variants. Pass `false` to serve no
   * WebSocket at all; clients connect over SSE instead (`backend: 'sse'`).
   */
  ws?: DevframeWsOptions | false;
  /**
   * How the browser reaches the SSE RPC endpoint, enabled by default
   * alongside the WebSocket as the more portable transport. Pass `false`
   * to disable, or a {@link DevframeSseOptions} to change its route.
   */
  sse?: boolean | DevframeSseOptions;
  /**
   * Capability-side CAC hook. Called with the CAC instance after the
   * adapter registers its built-in commands (`build` / `mcp`)
   * but before `createCac`'s own `configureCli` caller. Use this to
   * contribute tool-specific flags and subcommands from the definition
   * itself.
   */
  configure?: (cli: CAC) => void;
  /**
   * Typed CLI flags for the default `dev` command, backed by any
   * [Standard Schema](https://standardschema.dev/) validator (valibot,
   * zod, arktype, or devframe's built-in `s`). The adapter registers
   * matching `--kebab-key` options on CAC, validates the parsed values,
   * and forwards the typed bag to `setup(ctx, { flags })`.
   *
   * Use {@link defineCliFlags} to preserve the literal schema-map
   * shape, and {@link InferCliFlags} to recover the typed output at the
   * call site:
   *
   * ```ts
   * const appFlags = defineCliFlags({
   *   depth: v.pipe(v.number(), v.integer()),
   *   config: v.optional(v.string()),
   * })
   *
   * defineDevframe({
   *   cli: { flags: appFlags },
   *   setup(ctx, info) {
   *     const flags = info.flags as InferCliFlags<typeof appFlags>
   *   },
   * })
   * ```
   */
  flags?: CliFlagsSchema;
}
/**
 * Default dock attributes for the iframe entry a hub synthesizes when it
 * mounts this devframe. Framework-neutral metadata only; the hub layer
 * (`ctx.install`) merges these beneath its per-mount `dock` overrides,
 * which in turn sit beneath the locked, derived `id` / `type` / `url`.
 *
 * Every field is optional. `title` / `icon` default to the definition's
 * `name` / `icon` when omitted here; the rest are unset by default.
 * Standalone adapters (`cli` / `build`) ignore this entirely.
 */
interface DevframeDockDefaults {
  /** Dock entry title. Defaults to the definition's `name`. */
  title?: string;
  /** Translations of `title` by BCP 47 tag; see `@devframes/hub`'s `resolveTitle()`. */
  titleLocales?: Record<string, string>;
  /** Dock entry icon. Defaults to the definition's `icon`. */
  icon?: string | {
    light: string;
    dark: string;
  };
  /**
   * Sort weight within the dock; higher sorts earlier.
   * @default 0
   */
  defaultOrder?: number;
  /**
   * Category the entry groups under in the dock.
   * @default 'default'
   */
  category?: string;
  /**
   * Conditional-visibility expression (same syntax as command `when`
   * clauses). Set to `'false'` to hide the entry unconditionally.
   */
  when?: string;
  /**
   * Render-only visibility expression, same syntax as {@link when}. Hides the
   * entry's own dock-bar button when it evaluates to `false` while leaving it
   * registered and reachable (activation, RPC lookups, etc.), unlike `when`,
   * which is the general relevance switch for the entry as a whole.
   */
  visibility?: string;
  /** Badge text rendered on the dock icon (e.g. an unread count). */
  badge?: string;
  /** Id of the dock group this entry collapses under, if any. */
  groupId?: string;
  /**
   * A client script the hub imports into the host page (this devframe's **page
   * script**). An absolute-path `importFrom` is served by the hub under the
   * mount base and rewritten to that URL, so mounting by package name needs no
   * host wiring; a URL or bare specifier passes through untouched.
   */
  clientScript?: {
    /**
     * Initialize after RPC trust without waiting for dock activation.
     * @default false
     */
    eager?: boolean;
    /** An absolute filesystem path, a served URL, or a bare npm specifier. */
    importFrom: string;
    /**
     * The name to import the module as.
     * @default 'default'
     */
    importName?: string;
  };
}
/**
 * Runtime information threaded into `setup(ctx, info)`. Adapters
 * populate the fields that make sense for their deployment. In
 * particular, `createCac` fills `flags` with the parsed CAC bag.
 */
interface DevframeSetupInfo {
  /** Parsed CLI flags, populated by the CLI adapter. */
  flags?: Record<string, unknown>;
}
interface DevframeDefinition {
  id: string;
  name: string;
  /** Semver of the tool, surfaced in hub UIs and diagnostics. */
  version: string;
  /** npm package name the devframe ships in (e.g. `@scope/my-tool`). */
  packageName: string;
  /**
   * `import.meta.url` of the module that defines this devframe. **Always
   * provide it** (`importMetaUrl: import.meta.url`): it is the resolution base
   * for the tool's own dependency graph, which lets the host resolve
   * everything against the plugin's own installed packages rather than the
   * consuming app's.
   *
   * - **Remote assets**: becomes the default `resolveFrom` for any remote
   *   {@link StaticAssetsSource} the devframe hosts (its `clientAssets`, and
   *   every `ctx.views.hostStatic` call) that doesn't set one explicitly, so a
   *   locally installed copy of the assets package is served with zero
   *   network. A per-asset `resolveFrom` still wins, and an explicit
   *   `resolveFrom: null` still opts out.
   * - **Service dependencies**: becomes the base the host resolves declared
   *   {@link DevframeServiceInput | services} from, so a plugin can ship a
   *   service package as its own dependency instead of asking users to install
   *   it.
   *
   * Optional for backward compatibility; omitting it falls back to
   * runtime-directory resolution and disables the zero-network installed-copy
   * fast paths above.
   */
  importMetaUrl?: string;
  /** Project homepage or documentation URL. */
  homepage: string;
  /** One-line summary of what the tool does. */
  description: string;
  icon?: string | {
    light: string;
    dark: string;
  };
  /**
   * Default dock attributes applied when a hub mounts this devframe as an
   * iframe dock entry. Consulted only by the hub install path (`ctx.install`),
   * which merge these beneath the per-mount `dock` overrides; standalone
   * adapters (`cli` / `build`) ignore it.
   *
   * @see {@link DevframeDockDefaults}
   */
  dock?: DevframeDockDefaults;
  /**
   * Mount path override. Defaults depend on the adapter:
   * `/` for standalone (`cli` / `build`), `/__<id>/` for hosted
   * (`vite` / `embedded`).
   */
  basePath?: string;
  /**
   * How a hub reacts when another devframe sharing this one's `id` is
   * mounted onto the same hub. Consulted only by hub adapters
   * (`ctx.install`); standalone adapters (`cli` / `build`)
   * ignore it.
   *
   * @default 'warn'
   */
  duplicationStrategy?: DevframeDuplicationStrategy;
  /**
   * Declares which runtimes meaningfully support this devframe. Adapters
   * act on a `false` before doing any work:
   *
   * - `build: false`: `createCac` skips registering the `build` subcommand,
   *   `createBuild` refuses (throws `DF0042`) unless `{ force: true }`, and
   *   a hub static build (`buildHub`) silently skips the devframe - no dock,
   *   no SPA copy, no RPCs in the dump. Useful for a devframe whose value is
   *   inherently live (e.g. it manages real files on disk), so a static
   *   export would only ever produce a broken, write-less shell of the tool.
   * - `dev: false`: `createDevServer` refuses (throws `DF0058`) unless
   *   `{ force: true }`. Useful for a devframe that only makes sense as a
   *   static export (e.g. a report generator with nothing to serve live).
   */
  capabilities?: {
    dev?: boolean;
    build?: boolean;
  };
  /**
   * Wire services this devframe consumes (see `DevframeServiceDefinition`).
   * Each entry is either a declarative descriptor
   * (`{ package, version?, required?, options? }`, where the host imports the
   * package's default-export factory, resolving it against **this plugin's
   * own dependencies**) or a ready `DevframeServiceDefinition` (the factory
   * was already called). The adapter queues these before `setup(ctx)` runs
   * and constructs each service once at the `ctx.services.ready()` barrier,
   * merging option sets across every declarer. Missing services are skipped
   * unless marked `required`; clients feature-detect via
   * `client.services.has(pkg)` and degrade.
   */
  services?: DevframeServiceInput[];
  /**
   * Author's SPA dist, served as the devframe's UI. A local directory, or
   * a {@link StaticAssetsSource} remote declaration (`{ package, version }`)
   * served through devframe's caching CDN back-proxy so the assets need not
   * ship inside the node package.
   *
   * Consumed by every adapter that serves the UI (`dev`, `build`, `vite`,
   * `next`, and the hub install path).
   */
  clientAssets?: StaticAssetsSource;
  /** RPC-level configuration for this devframe (see {@link DevframeRpcOptions}). */
  rpc?: DevframeRpcOptions;
  /** Server-side setup: the primary entrypoint. Runs in every runtime. */
  setup: (ctx: DevframeNodeContext, info?: DevframeSetupInfo) => void | Promise<void>;
  cli?: DevframeCliOptions;
}
interface DevframeRpcOptions {
  /**
   * Opt an RPC function into the static-build snapshot **without owning its
   * definition**, the mechanism a devframe uses to bake a wire service's
   * RPC (e.g. `@devframes/service-git`'s `status`/`log`/`show`) into its
   * `build` export, since the service itself defines no `dump`/`snapshot`.
   *
   * Each entry is either a bare method id (bakes the no-argument call, like
   * `snapshot: true`) or `{ method, inputs }` where `inputs` is the list of
   * argument-tuples to bake, or an async provider given the node context
   * (so it can enumerate at build time, e.g. read commit hashes via the
   * service's node API). `createBuild` resolves these after setup and
   * executes the target's own handler per tuple; the first tuple's result
   * becomes the fallback so any call variant resolves to a baked value.
   */
  snapshot?: DevframeSnapshotRpcEntry[];
}
/** Argument-tuples to bake for a {@link DevframeSnapshotRpcEntry}, or a provider that computes them at build time. */
type DevframeSnapshotRpcInputs = readonly (readonly unknown[])[] | ((ctx: DevframeNodeContext) => readonly (readonly unknown[])[] | Promise<readonly (readonly unknown[])[]>);
/**
 * One {@link DevframeRpcOptions.snapshot} entry: a bare method id (bakes
 * the no-argument call) or a method plus the argument-tuples to bake.
 */
type DevframeSnapshotRpcEntry = string | {
  method: string;
  inputs: DevframeSnapshotRpcInputs;
};
//#endregion
//#region src/types/mcp.d.ts
/**
 * The MCP adapter surface, typed here so `devframe` (which probes for and
 * lazily loads `@devframes/agentic`) and `@devframes/agentic/mcp` (which
 * implements it) share one contract without a type-level dependency cycle.
 * None of these shapes reference the MCP SDK: the SDK is an implementation
 * detail of `@devframes/agentic`, freely swappable behind this surface.
 * The h3-bound `mountMcpHttp` shapes live in `node/agentic.ts` (exported via
 * `devframe/internal`) instead: `devframe/types` must stay lib-neutral, and
 * h3's declarations are not.
 */
interface CreateMcpServerOptions {
  /**
   * Transport to use. `createMcpServer` itself runs `'stdio'` (a standalone
   * process with its own host context); the Streamable-HTTP transport is
   * served route-based by the dev server instead; see `mountMcpHttp` and
   * the `mcp` option on `createDevServer` / `createCac`'s `--mcp` flag.
   */
  transport?: 'stdio';
  /**
   * Expose shared-state keys as MCP resources.
   * - `true` (default): every key the host publishes
   * - `false`: none
   * - `(key) => boolean`: filter
   */
  exposeSharedState?: boolean | ((key: string) => boolean);
  /**
   * Usage guidance sent as `instructions` in the MCP `initialize` (and
   * `server/discover`) result. Omitted or empty sends no instructions.
   */
  instructions?: string;
  /** Override the name reported in the MCP handshake. */
  serverName?: string;
  /** Override the version reported in the MCP handshake. Defaults to `definition.version ?? '0.0.0'`. */
  serverVersion?: string;
  /** Called once the transport is connected. */
  onReady?: (info: {
    transport: 'stdio';
  }) => void;
}
/**
 * One MCP content block in a tool result. Attach blocks to a tool's return
 * value with `withMcpContent` (from `devframe`) to send them in place of the
 * default JSON text block. `data` is base64.
 */
type McpContentBlock = {
  type: 'text';
  text: string;
} | {
  type: 'image';
  data: string;
  mimeType: string;
} | {
  type: 'audio';
  data: string;
  mimeType: string;
};
interface McpServerHandle {
  stop: () => Promise<void>;
}
interface CreateMcpFetchHandlerOptions {
  /** Name reported in the MCP handshake. */
  serverName: string;
  /** Version reported in the MCP handshake. */
  serverVersion: string;
  /** Expose shared-state keys as MCP resources; see {@link CreateMcpServerOptions.exposeSharedState}. */
  exposeSharedState: boolean | ((key: string) => boolean);
  /** Usage guidance for the handshake; see {@link CreateMcpServerOptions.instructions}. */
  instructions?: string;
  /**
   * Optional identity check, layered on top of the origin gate and checked
   * **after** it: a bearer token string (matched in constant time against
   * `Authorization: Bearer <token>`), a `(request) => boolean` callback, or
   * `false` (the default) for origin-only, trusting same-machine callers. A
   * callback governs identity only and cannot relax the origin gate. See
   * {@link McpAuthorization}.
   */
  authorization?: McpAuthorization;
  /**
   * Origin allow-list beyond the loopback default. `false` disables the
   * origin gate entirely. Default: loopback-only.
   *
   * Unlike the WS transport, the MCP route does **not** allow `Origin`-less
   * requests: a route-based endpoint is reachable by any local process, so a
   * request must carry an `Origin` that passes the gate. Native clients
   * (e.g. `devframe connect`) send their loopback origin explicitly.
   */
  allowedOrigins?: readonly string[] | false;
}
/** Connection facts a host knows about a request beyond the `Request` itself. */
interface McpConnectionInfo {
  /**
   * The connecting peer's remote address (a node socket's `remoteAddress`),
   * used to prove a same-machine caller when the endpoint relies on the
   * loopback origin default with no identity check. A host that can resolve a
   * trustworthy peer address (the h3/node mount) supplies it; when it's
   * omitted the origin gate stays the only locality signal.
   */
  remoteAddress?: string;
}
interface McpFetchHandler {
  /**
   * WHATWG-`fetch` handler for the MCP endpoint. Hand every method
   * (POST/GET/DELETE) on the endpoint's path to it; routing by path is the
   * host's job. Pass {@link McpConnectionInfo} when the host can resolve the
   * peer address so the default trust boundary can enforce same-machine
   * locality.
   */
  fetch: (request: Request, connection?: McpConnectionInfo) => Promise<Response>;
  /** Tear down the handler (aborts in-flight exchanges, drops the change bridge). */
  dispose: () => Promise<void>;
}
//#endregion
//#region src/utils/shared-state.d.ts
type ImmutablePrimitive = undefined | null | boolean | string | number | Function;
type Immutable<T> = T extends ImmutablePrimitive ? T : T extends Array<infer U> ? ImmutableArray<U> : T extends Map<infer K, infer V> ? ImmutableMap<K, V> : T extends Set<infer M> ? ImmutableSet<M> : ImmutableObject<T>;
type ImmutableArray<T> = ReadonlyArray<Immutable<T>>;
type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>;
type ImmutableSet<T> = ReadonlySet<Immutable<T>>;
type ImmutableObject<T> = { readonly [K in keyof T]: Immutable<T[K]>; };
/**
 * Serializable patch describing a single mutation to a `SharedState`.
 * Structurally compatible with JSON-Patch and is safe to send over RPC.
 */
interface SharedStatePatch {
  op: 'add' | 'remove' | 'replace';
  path: readonly (string | number)[];
  value?: unknown;
}
/**
 * State host that is immutable by default with explicit mutate.
 */
interface SharedState<T> {
  /**
   * Get the current state. Immutable.
   */
  value: () => Immutable<T>;
  /**
   * Subscribe to state changes.
   */
  on: EventEmitter<SharedStateEvents<T>>['on'];
  /**
   * Mutate the state.
   */
  mutate: (fn: (state: T) => void, syncId?: string) => void;
  /**
   * Apply patches to the state.
   */
  patch: (patches: SharedStatePatch[], syncId?: string) => void;
  /**
   * Sync IDs that have been applied to the state.
   */
  syncIds: Set<string>;
}
interface SharedStateEvents<T> {
  updated: (fullState: T, patches: SharedStatePatch[] | undefined, syncId: string) => void;
}
interface SharedStateOptions<T> {
  /**
   * Initial state.
   */
  initialValue: T;
  /**
   * Enable patches.
   *
   * @default false
   */
  enablePatches?: boolean;
}
declare function createSharedState<T extends object>(options: SharedStateOptions<T>): SharedState<T>;
//#endregion
//#region src/utils/streaming-channel.d.ts
/**
 * Serialized error shape sent over the wire when a stream ends with a failure.
 * Stays JSON-safe so the strict-JSON encoder can carry it without coercion.
 */
interface StreamErrorPayload {
  name: string;
  message: string;
}
/**
 * Single buffered chunk in the server-side ring buffer.
 *
 * Sequence numbers start at 1 and increment per write. Subscribers track
 * `lastSeenSeq` and ask for `afterSeq` on resubscribe so the server can
 * replay any chunks the client missed during a brief disconnect.
 */
interface BufferedChunk<T> {
  seq: number;
  chunk: T;
}
interface StreamSinkEvents<T> {
  /** Fired for each `write()`. The RPC layer subscribes and broadcasts. */
  chunk: (seq: number, chunk: T) => void;
  /** Terminal; fired exactly once per sink lifetime. */
  end: (error?: StreamErrorPayload) => void;
}
interface CreateStreamSinkOptions {
  id?: string;
  /**
   * Size of the per-stream ring buffer kept for replay-on-resubscribe.
   * `0` (default) disables replay.
   */
  replayWindow?: number;
}
/**
 * Server-side producer handle. Two equivalent surfaces share one piece of
 * state: the imperative `write/error/close` triple, and a `WritableStream<T>`
 * for `pipeTo`-style consumption.
 */
interface StreamSink<T> {
  /** Stable id used by clients to subscribe. */
  readonly id: string;
  /**
   * Aborts when the consumer cancels (server-side) or when the transport
   * loses every subscriber. Producers should poll `signal.aborted` and exit
   * cleanly.
   */
  readonly signal: AbortSignal;
  /** `true` after `close()` / `error()`. Further writes throw. */
  readonly closed: boolean;
  /** Last allocated sequence number. `0` until the first write. */
  readonly lastSeq: number;
  write: (chunk: T) => void;
  error: (reason: unknown) => void;
  close: () => void;
  /** External-cancel path. Aborts the signal so handlers can short-circuit. */
  abort: (reason?: unknown) => void;
  /** `WritableStream<T>` adapter; same in-memory state as the imperative API. */
  readonly writable: WritableStream<T>;
  /**
   * Internal: RPC layer subscribes to receive chunk/end notifications.
   * Not part of the public contract; do not call directly.
   *
   * @internal
   */
  readonly events: EventEmitter<StreamSinkEvents<T>>;
  /**
   * Internal replay buffer. RPC layer reads on (re)subscribe to feed
   * missed chunks before going live.
   *
   * @internal
   */
  readonly buffer: ReadonlyArray<BufferedChunk<T>>;
}
interface CreateStreamReaderOptions {
  id?: string;
  /**
   * Maximum number of buffered chunks held client-side while the consumer
   * isn't draining. On overflow, the oldest chunk is dropped.
   */
  highWaterMark?: number;
  /**
   * Called when the chunk queue overflows the high-water mark. The RPC
   * layer wires this to a coded warning; the primitive itself is
   * RPC-agnostic.
   */
  onOverflow?: (dropped: number) => void;
  /** Called when the consumer cancels; the RPC layer sends `:cancel` upstream. */
  onCancel?: () => void;
}
/**
 * Client-side consumer handle. Both an `AsyncIterable<T>` (for `for await`)
 * and exposes `readable: ReadableStream<T>` (for `pipeTo`). Pick one; they
 * share a single internal queue, so concurrent draining will race.
 */
interface StreamReader<T> extends AsyncIterable<T> {
  readonly id: string;
  readonly cancelled: boolean;
  readonly done: boolean;
  /** Highest `seq` observed. Used for replay on reconnect. */
  readonly lastSeenSeq: number;
  /** `ReadableStream<T>` adapter for `pipeTo`-style consumption. */
  readonly readable: ReadableStream<T>;
  cancel: () => void;
  /** @internal */
  _push: (seq: number, chunk: T) => void;
  /** @internal */
  _end: (error?: StreamErrorPayload) => void;
}
/**
 * Build a server-side stream sink. RPC-agnostic; the RPC host wires
 * `events.on('chunk' | 'end')` to broadcast, and reads `buffer` to replay
 * for late or reconnecting subscribers.
 */
declare function createStreamSink<T>(options?: CreateStreamSinkOptions): StreamSink<T>;
/**
 * Build a client-side stream reader. RPC-agnostic; the RPC host calls
 * `_push(seq, chunk)` on each incoming chunk and `_end(error?)` on the
 * terminal frame. Consumers iterate with `for await` or pipe `readable`.
 */
declare function createStreamReader<T>(options?: CreateStreamReaderOptions): StreamReader<T>;
//#endregion
//#region src/types/rpc.d.ts
interface DevframeNodeRpcSession {
  meta: DevframeNodeRpcSessionMeta;
  rpc: BirpcReturn<DevframeRpcClientFunctions, DevframeRpcServerFunctions, false>;
}
interface RpcBroadcastOptions<METHOD, Args extends any[]> {
  method: METHOD;
  args: Args;
  optional?: boolean;
  event?: boolean;
  filter?: (client: BirpcReturn<DevframeRpcClientFunctions, DevframeRpcServerFunctions, false>) => boolean | void;
}
type RpcFunctionsHost = RpcFunctionsCollectorBase<DevframeRpcServerFunctions, DevframeNodeContext> & {
  /**
   * Invoke a locally registered server RPC function directly.
   *
   * This bypasses transport and is useful for server-side cross-function calls.
   */
  invokeLocal: <T extends keyof DevframeRpcServerFunctions, Args extends Parameters<DevframeRpcServerFunctions[T]>>(method: T, ...args: Args) => Promise<Awaited<ReturnType<DevframeRpcServerFunctions[T]>>>;
  /**
   * Broadcast a message to all connected clients
   */
  broadcast: <T extends keyof DevframeRpcClientFunctions, Args extends Parameters<DevframeRpcClientFunctions[T]>>(options: RpcBroadcastOptions<T, Args>) => Promise<void>;
  /**
   * Get the current RPC client
   *
   * Available in RPC functions to get the current RPC client
   */
  getCurrentRpcSession: () => DevframeNodeRpcSession | undefined;
  /**
   * The shared state host
   */
  sharedState: RpcSharedStateHost;
  /**
   * The streaming channel host. Provides per-channel `start()` /
   * `pipeFrom()` producers; clients consume via `rpc.streaming.subscribe()`.
   *
   * @see RpcStreamingHost
   */
  streaming: RpcStreamingHost;
};
interface RpcSharedStateGetOptions<T> {
  sharedState?: SharedState<T>;
  initialValue?: T;
}
interface RpcSharedStateHost {
  get: <T extends object = any>(key: string, options?: RpcSharedStateGetOptions<T>) => Promise<SharedState<T>>;
  keys: () => string[];
  /**
   * Subscribe to new shared-state keys becoming available. Fires when
   * `get(key, ...)` creates a fresh entry (not on subsequent gets).
   * Useful for protocol adapters (e.g. MCP) that surface shared state
   * as dynamic resources.
   */
  onKeyAdded: (fn: (key: string) => void) => () => void;
  /**
   * Unregister a shared state and drop its broadcast listeners. Returns
   * `true` when a state was removed, `false` when the key was unknown.
   * Used by short-lived states (e.g. a disposed JSON-render view) to avoid
   * leaking listeners and lingering entries for the context lifetime.
   */
  delete: (key: string) => boolean;
}
/**
 * Options for `RpcStreamingHost.create()`.
 */
interface RpcStreamingChannelOptions {
  /**
   * Size of the per-stream ring buffer kept on the server for
   * replay-on-resubscribe. `0` (default) disables replay; on reconnect
   * the consumer only sees chunks that arrive after subscribing.
   *
   * The buffer is per stream id, not per channel; each `channel.start()`
   * gets its own.
   */
  replayWindow?: number;
  /**
   * Milliseconds a closed stream is retained on the server after its
   * last subscriber leaves (or if no subscriber ever arrived). During
   * this window, late subscribers can still join and replay the buffer
   * + receive the `end` frame.
   *
   * Defaults to `30_000` (30 s) when `replayWindow > 0`, else `0`
   * (immediate free). Set to `0` to opt out, or higher for longer
   * post-mortem replay.
   */
  closedStreamRetention?: number;
}
/**
 * Channel handle returned by `ctx.rpc.streaming.create(name, opts)`. A
 * channel owns a wire namespace; calling `start()` produces individual
 * streams keyed by id.
 *
 * @see {@link https://devfra.me/guide/streaming Streaming guide}
 */
interface RpcStreamingChannel<T = unknown> {
  /** Channel name as registered with `ctx.rpc.streaming.create()`. */
  readonly name: string;
  /**
   * Start a new stream. Returns a server-side sink with both an imperative
   * (`write` / `close` / `error`) surface and a `WritableStream<T>` for
   * `pipeTo` consumption. The sink's `signal` aborts when every subscriber
   * disconnects or cancels.
   */
  start: (opts?: {
    id?: string;
  }) => StreamSink<T>;
  /**
   * Convenience: start a stream and pipe a `ReadableStream<T>` into it.
   * The pipe uses `sink.signal` so cancellation propagates upstream.
   *
   * Node-stream interop: convert a `Readable` with `Readable.toWeb(node)`
   * before passing it here.
   */
  pipeFrom: (readable: ReadableStream<T>, opts?: {
    id?: string;
  }) => Promise<StreamSink<T>>;
  /** Look up an active stream by id. Returns `undefined` if none. */
  get: (id: string) => StreamSink<T> | undefined;
  /** All active outbound stream ids on this channel. */
  ids: () => string[];
  /**
   * Open an inbound stream: the server side of a client-to-server
   * upload. Allocates an id, returns a `StreamReader<T>` that fills as
   * the client writes chunks. Typical pattern is to call this from an
   * action handler, kick off background processing, and return the id
   * so the caller can start uploading:
   *
   * ```ts
   * handler: async () => {
   *   const reader = channel.openInbound()
   *   ;(async () => {
   *     for await (const chunk of reader) processChunk(chunk)
   *   })()
   *   return { uploadId: reader.id }
   * }
   * ```
   *
   * Calling `reader.cancel()` on the server sends an `upload-cancel` to
   * the uploading client, which aborts its sink.
   */
  openInbound: (opts?: {
    id?: string;
  }) => StreamReader<T>;
}
/**
 * Server-side streaming host. Lives on `ctx.rpc.streaming` alongside
 * `ctx.rpc.sharedState`. Each named channel owns its own stream registry
 * and wire namespace.
 */
interface RpcStreamingHost {
  /**
   * Register a streaming channel. Names follow the `<plugin-id>:<channel>`
   * convention (e.g. `'my-devtool:chat-stream'`). Throws `DF0032` if the
   * name is already taken.
   */
  create: <T = unknown>(name: string, opts?: RpcStreamingChannelOptions) => RpcStreamingChannel<T>;
  /**
   * Adapters call this when a session disconnects so the host can drop
   * subscribers and abort orphaned streams. Most users do not need this;
   * it's wired by the RPC server binding automatically.
   *
   * @internal
   */
  _onSessionDisconnected: (meta: DevframeNodeRpcSessionMeta) => void;
}
//#endregion
//#region src/types/context.d.ts
interface DevframeCapabilities {
  rpc?: boolean;
  views?: boolean;
}
/**
 * Framework- and build-tool-agnostic node context: RPC + diagnostics +
 * agent + the view-host (HTTP file-serving). Host adapters can wrap this
 * to add their own surfaces; for example, `@vitejs/devtools-kit`'s
 * `createKitContext` adds `docks`, `terminals`, `messages`, and
 * `commands` when mounted into Vite DevTools. JSON rendering is an opt-in
 * integration (`@devframes/json-render`) layered on top, not part of this
 * core surface.
 */
interface DevframeNodeContext {
  readonly workspaceRoot: string;
  readonly cwd: string;
  /**
   * Lifecycle distinction surfaced to plugin authors:
   *
   *   - `'dev'`:   long-running, interactive session. Connections come and
   *                 go; broadcasts and shared-state mutations are debounced
   *                 to keep the UI responsive.
   *   - `'build'`: one-shot batch run. The context is set up, the devtool
   *                 collects what it needs, and a snapshot is written. No
   *                 live UI, no WS server.
   *
   * Names are inherited from Vite's serve/build dichotomy but the meaning
   * is general: the same distinction applies to any tool that runs in
   * either an interactive or a static-output mode.
   */
  readonly mode: 'dev' | 'build';
  /**
   * Host runtime abstraction, exposing `mountStatic` / `resolveOrigin` /
   * `getStorageDir`.
   */
  host: DevframeHost;
  rpc: RpcFunctionsHost;
  views: DevframeViewHost;
  /**
   * Structured diagnostics host; wraps `nostics` and lets integrations
   * register their own coded errors/warnings into the shared lookup.
   */
  diagnostics: DevframeDiagnosticsHost;
  /**
   * Agent host; aggregates the agent-exposed surface of this devtool.
   */
  agent: DevframeAgentHost;
  /**
   * Cross-plugin services: a typed, namespaced registry through which one
   * integration exposes a capability (e.g. a data-source registry) and
   * others consume it without a hard package dependency. Ids follow the RPC
   * namespacing rule (`<plugin-id>:<service>`); types come from augmenting
   * the `DevframeServicesRegistry` interface. `whenAvailable` subscriptions
   * absorb setup-order differences between provider and consumer.
   */
  services: DevframeServicesHost;
  /**
   * This context's own {@link ConnectionMeta.configs}: static, boot-time
   * config a host publishes once through the connection handshake and every
   * client reads read-only. A plain, **non-reactive** object: mutate it
   * during `setup(ctx)` (a plugin sets its keys, a hub aggregates across
   * every installed devframe), never during the session, since it's serialized
   * once, after setup, and changing it afterwards reaches no client.
   *
   * ```ts
   * ctx.staticConfig.dock = {
   *   ...ctx.staticConfig.dock,
   *   categoryOrder: { ...ctx.staticConfig.dock?.categoryOrder, ...myOrder },
   * }
   * ```
   */
  staticConfig: Partial<DevframeConnectionConfigsRegistry>;
  /**
   * Create a namespace-scoped view of this context. The returned
   * `ctx.scope('my-plugin')` auto-namespaces every RPC id, shared-state
   * key, and streaming channel with `my-plugin:`, and exposes a typed
   * top-level `settings` store. This is the preferred way to consume the
   * context from a single tool's setup code.
   *
   * Pass `null` or `''` to un-scope and get the base context.
   */
  scope: {
    <NS extends string>(namespace: NS): DevframeScopedNodeContext<NS, SettingsForNamespace<NS>>;
    (namespace?: null | ''): DevframeNodeContext;
  };
}
/**
 * Describes where the browser client should open its RPC WebSocket. The
 * object form is the proxy-flexible default: `path` is resolved relative to
 * where `__connection.json` was loaded, and the connection is made to the
 * page's own origin (only the `http`→`ws` / `https`→`wss` protocol swap is
 * applied). This survives reverse proxies that change the host/port, because
 * the client never trusts a server-baked hostname; it reuses its own.
 *
 * Set `port` (and/or `host`) only when the WS endpoint genuinely lives on a
 * different origin than the page, e.g. a side-car server on its own port.
 */
interface ConnectionMetaWebsocket {
  /**
   * Path to the WS endpoint. Relative paths (the default, e.g. `__ws`) are
   * resolved against `__connection.json`'s location; absolute paths (`/__ws`)
   * resolve against the page origin.
   */
  path?: string;
  /** Override the port. Combined with the page hostname unless `host` is set. */
  port?: number;
  /** Override the host (`hostname[:port]`). Use for a fully cross-origin endpoint. */
  host?: string;
}
/**
 * Object form of {@link ConnectionMeta.sse}: the same proxy-safe shape and
 * resolution rules as {@link ConnectionMetaWebsocket}, producing an
 * `http(s)://` endpoint instead of a `ws(s)://` one. Set `port` (and/or
 * `host`) only when the SSE endpoint genuinely lives on a different origin
 * than the page, e.g. a side-car server on its own port.
 */
interface ConnectionMetaSse {
  /**
   * Path to the SSE endpoint. Relative paths (the default, e.g. `__sse`)
   * are resolved against `__connection.json`'s location; absolute paths
   * (`/__sse`) resolve against the page origin.
   */
  path?: string;
  /** Override the port. Combined with the page hostname unless `host` is set. */
  port?: number;
  /** Override the host (`hostname[:port]`). Use for a fully cross-origin endpoint. */
  host?: string;
}
interface ConnectionMeta {
  /**
   * The server's primary live-RPC transport (`websocket` / `sse`), `static`
   * for a pre-computed RPC dump with no live server, or `none` for a server
   * exposing no RPC transport at all (e.g. an MCP-only deployment).
   */
  backend: 'websocket' | 'sse' | 'static' | 'none';
  /**
   * WebSocket endpoint, resolved by the client into a `ws(s)://` URL:
   *
   *   - {@link ConnectionMetaWebsocket}: the proxy-flexible default; a
   *     same-origin path relative to `__connection.json`.
   *   - `number`: a port on the page's hostname (`ws(s)://<host>:<port>`).
   *   - `string`: a full `ws://`/`wss://` URL used verbatim, an `http(s)://`
   *     URL with its protocol swapped, or a path resolved same-origin.
   */
  websocket?: number | string | ConnectionMetaWebsocket;
  /**
   * SSE endpoint (`GET` opens the event stream, `POST` carries RPC calls),
   * resolved by the client into an `http(s)://` URL with the same
   * proxy-safe rules as {@link ConnectionMeta.websocket}:
   *
   *   - {@link ConnectionMetaSse}: the proxy-flexible default; a
   *     same-origin path relative to `__connection.json`.
   *   - `string`: a full `http(s)://` URL used verbatim, or a path
   *     resolved same-origin.
   */
  sse?: string | ConnectionMetaSse;
  /**
   * Present when the dev server exposes a route-based MCP endpoint
   * (the host's `mcp` setting). Advertises the MCP Streamable-HTTP route so in-browser
   * tooling (e.g. an MCP inspector) can discover it without guessing the
   * path. `path` is relative to `__connection.json`'s location, like the
   * WebSocket `path`. `port` is set when the endpoint lives on a side-car
   * server on its own port (bridge mode: `devframeViteBridge`,
   * `@devframes/next`): the client combines the page hostname with `port`
   * and resolves `path` against that origin, mirroring
   * {@link ConnectionMetaWebsocket.port}.
   */
  mcp?: {
    path: string;
    port?: number;
  };
  /**
   * Names of RPC functions that have declared `jsonSerializable: true`.
   * Used by the WS / static client to dispatch the per-call wire
   * serializer (strict JSON for these methods, structured-clone for
   * the rest). Populated by the server / build adapter; absent on
   * legacy clients, in which case all outgoing messages fall back to
   * structured-clone.
   */
  jsonSerializableMethods?: string[];
  /**
   * URL of the `__connection.json` that owns this meta's relative paths.
   * Two producers write it:
   *
   *   - The client annotates it (absolute) when it publishes the meta on a
   *     shared window for same-origin inheritance: a relative
   *     `websocket.path` resolves against this, so a child SPA mounted at
   *     another base (e.g. a hub mounting several devframes at `/__foo/`,
   *     `/__bar/`, …) inherits a dialable endpoint rather than resolving the
   *     path against its own mount.
   *   - A static hub build serves it (base-absolute, e.g.
   *     `/__devframes/__connection.json`) in each **per-frame** meta, so a
   *     frame SPA that fetched its own copy still resolves the shared RPC
   *     dump from the hub base. Resolved against the fetched URL.
   */
  baseUrl?: string;
  /**
   * A pre-issued bearer token embedded in the meta so a client trusts the
   * server on connect without any prompt or `localStorage` lookup. Only a
   * **hub** serving a **per-frame** connection meta populates this; it
   * authenticates once at the top level and bakes the resulting token into
   * the meta each plugin iframe fetches, so a cross-origin frame (which
   * cannot read the hub's `localStorage`) is still pre-authorized. The
   * standalone `__connection.json` never carries a token.
   *
   * > [!WARNING]
   * > A token in a fetchable JSON is only as protected as the URL serving
   * > it. Emit it exclusively from hub-controlled, per-frame meta, never
   * > from a publicly reachable static `__connection.json`.
   */
  authToken?: string;
  /**
   * Session-scoped token that lets a trusted external viewer register its
   * browser origin before opening the WebSocket. The host includes it in the
   * connection metadata, which the viewer obtains through the host page.
   *
   * Treat this as a bearer credential. Keep connection metadata containing the
   * token same-origin until the requesting origin has been verified.
   */
  viewerOriginToken?: string;
  /**
   * Static, host-declared configuration, baked in once at connect time and
   * fixed for the life of the server (e.g. a hub's UI rebrand, or its
   * aggregated dock-bar layout preferences). Read-only from the browser: a
   * client only ever reads `rpc.connectionMeta.configs`, never writes to it.
   *
   * Contrast this with {@link DevframeSettingsRegistry} (`ctx.scope(ns).settings`)
   * and a hub's `devframe:user-settings` shared-state key; both are
   * mutable, user-editable, and synced bidirectionally over RPC for the
   * life of the session. `configs` is the opposite: one-way, immutable,
   * decided by whoever assembled the server.
   *
   * Each key is owned by one package, contributed via declaration merging:
   *
   * ```ts
   * declare module 'devframe/types' {
   *   interface DevframeConnectionConfigsRegistry {
   *     'my-key': { some: 'shape' }
   *   }
   * }
   * ```
   */
  configs?: Partial<DevframeConnectionConfigsRegistry>;
}
/**
 * Augmentation point for {@link ConnectionMeta.configs}. Empty by default;
 * a package that wants to publish static, boot-time config through the
 * connection handshake augments this interface with its own key (see
 * {@link ConnectionMeta.configs} for the pattern). `@devframes/hub`
 * augments it with `dock`; `@devframes/hub-ui` augments it with `ui`.
 */
interface DevframeConnectionConfigsRegistry {}
//#endregion
export { McpSetting as $, SharedStateEvents as A, DevframeDiagnosticsLogger as At, DevframeCliOptions as B, AgentResourceInput as Bt, createStreamSink as C, DevframeViewHost as Ct, ImmutableObject as D, DevframeHost as Dt, ImmutableMap as E, DevframeRpcSharedStates as Et, CreateMcpServerOptions as F, parseCliFlags as Ft, DevframeRpcOptions as G, DevframeAgentHost as Gt, DevframeDeploymentKind as H, AgentToolInput as Ht, McpConnectionInfo as I, AgentHandle as It, DevframeSnapshotRpcInputs as J, EventUnsubscribe as Jt, DevframeSetupInfo as K, DevframeAgentHostEvents as Kt, McpContentBlock as L, AgentManifest as Lt, SharedStatePatch as M, CliFlagsSchema as Mt, createSharedState as N, InferCliFlags as Nt, ImmutableSet as O, DevframeStorageScope as Ot, CreateMcpFetchHandlerOptions as P, defineCliFlags as Pt, McpRouteOptions as Q, McpFetchHandler as R, AgentResource as Rt, createStreamReader as S, SettingsForNamespace as St, ImmutableArray as T, DevframeRpcServerFunctions as Tt, DevframeDockDefaults as U, AgentToolProvider as Ut, DevframeDefinition as V, AgentTool as Vt, DevframeDuplicationStrategy as W, AgentToolProviderHandle as Wt, DevframeWsOptions as X, DevframeSseOptions as Y, EventsMap as Yt, McpAuthorization as Z, CreateStreamSinkOptions as _, ScopedBroadcastOptions as _t, DevframeConnectionConfigsRegistry as a, DevframeServiceOf as at, StreamSink as b, ScopedServerFunctions as bt, RpcBroadcastOptions as c, DevframeServicesRegistry as ct, RpcSharedStateHost as d, DevframeScopedNodeContext as dt, DevframeServiceDefinition as et, RpcStreamingChannel as f, DevframeScopedNodeRpc as ft, CreateStreamReaderOptions as g, DevframeSettingsStore as gt, BufferedChunk as h, DevframeSettingsRegistry as ht, DevframeCapabilities as i, DevframeServiceMeta as it, SharedStateOptions as j, DevframeAuthHandler as jt, SharedState as k, DevframeDiagnosticsHost as kt, RpcFunctionsHost as l, DevframeServicesScopeRegistry as lt, RpcStreamingHost as m, DevframeSettings as mt, ConnectionMetaSse as n, DevframeServiceId as nt, DevframeNodeContext as o, DevframeServiceScopeOf as ot, RpcStreamingChannelOptions as p, DevframeScopedStreamingHost as pt, DevframeSnapshotRpcEntry as q, EventEmitter as qt, ConnectionMetaWebsocket as r, DevframeServiceInput as rt, DevframeNodeRpcSession as s, DevframeServicesHost as st, ConnectionMeta as t, DevframeServiceDescriptor as tt, RpcSharedStateGetOptions as u, DevframeServicesState as ut, StreamErrorPayload as v, ScopedClientFunctions as vt, Immutable as w, DevframeRpcClientFunctions as wt, StreamSinkEvents as x, ScopedSharedStates as xt, StreamReader as y, ScopedRpcFn as yt, McpServerHandle as z, AgentResourceContent as zt };