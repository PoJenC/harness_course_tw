import { t as StandardSchemaV1 } from "../index-CeEtxDmK.mjs";
import { g as RpcFunctionDefinitionAny } from "../types-BmDbfHCx.mjs";
import { Bt as AgentResourceInput, Dt as DevframeHost, Gt as DevframeAgentHost$1, Ht as AgentToolInput, It as AgentHandle, Kt as DevframeAgentHostEvents, Lt as AgentManifest, Rt as AgentResource, Ut as AgentToolProvider, Vt as AgentTool, Wt as AgentToolProviderHandle, o as DevframeNodeContext, qt as EventEmitter, zt as AgentResourceContent } from "../context-dOWXVHc6.mjs";
import { a as RemoteAssetsStore } from "../remote-assets-eBvSKZMS.mjs";
import { a as InstanceShellInit, c as StartedServer, d as samePath, f as DevframeInstanceRecord, g as registerDevframeInstance, h as probeDevframeOrigin, i as InstanceShellApi, l as createInstanceShell, m as listLiveDevframeInstances, n as InstanceRegisterConfig, o as InstanceShellInternals, p as DevframeInstanceRegistration, r as InstanceShell, s as InstanceWsTier, t as CreateInstanceShellOptions, u as resolveInstanceRegister } from "../instance-shell-DrvOWxqh.mjs";
import { i as importAgenticMcp, n as MountMcpHttpOptions, r as MountedMcpHttp, t as AgenticMcpModule } from "../agentic-JXlb0uiD.mjs";
import { a as resolveBasePath, i as normalizeBasePath, n as ResolvedMcpConfig, r as loadAutoMcpAdapter, s as resolveMcpConfig } from "../_shared-BvDsc83f.mjs";
import { t as getMcpContent } from "../mcp-content-9_Pdtziq.mjs";
import { n as CreateContextRpcServerOptions, r as createContextRpcServer, t as ContextRpcServer } from "../rpc-core-D6NWQW-B.mjs";
//#region src/agent/stringify.d.ts
/**
 * JSON-coercing serializer for MCP text payloads.
 *
 * MCP carries tool results and resource reads as plain text over a
 * JSON-RPC transport, so we cannot use the `s:`-prefixed structured-clone
 * format the WS RPC transport falls back to for non-JSON values. Instead,
 * we coerce common non-JSON types into JSON-friendly forms so the LLM
 * client sees something useful instead of `[object Object]`.
 *
 * Coercions:
 *   - `BigInt` → `"123n"`
 *   - `Date` → ISO string (via the native `toJSON`)
 *   - `Map` → `{ __type: 'Map', entries: [[k, v], …] }`
 *   - `Set` → `{ __type: 'Set', entries: [v, …] }`
 *   - `Error` → `{ name, message, stack, cause? }` (cause recurses)
 *   - `Function` → `"[Function: name]"`
 *   - `Symbol` → `value.toString()`
 *   - cycles → `"[Circular]"`
 */
export declare function stringifyForMcp(value: unknown): string;
/**
 * Format a thrown value for an MCP `isError` text payload.
 *
 * A nostics `Diagnostic` (every coded devframe error) becomes structured
 * JSON (`{ error: { code, message, fix?, docs? } }`), so an agent receives
 * the actionable next step (`fix`) and the docs URL instead of a bare
 * message string. Other errors surface `Error.name`/`message`, plus one
 * level of `cause.message` so context isn't dropped silently.
 */
export declare function formatMcpError(error: unknown): string;
//#endregion
//#region src/agent/to-json-schema.d.ts
/**
 * JSON Schema for an RPC return value on the agent/MCP surface.
 *
 * Unlike args, a return value has no permissive fallback: the schema is
 * advertised as an MCP `outputSchema`, which obliges the tool to return a
 * matching object on every call. A validator with no native converter
 * (e.g. valibot), or one whose converter cannot express the schema, yields
 * no output schema rather than an unfounded object one, so array- and
 * primitive-returning tools still work. Conversion uses the converter's
 * `output`, since a transforming validator returns its output type.
 * @internal
 */
export declare function returnToJsonSchema(schema: StandardSchemaV1 | undefined): unknown;
/**
 * JSON Schema for an RPC function's positional args on the agent/MCP
 * surface. Each positional arg is advertised under `arg0` / `arg1` / …,
 * matching how the agent bridge coerces the incoming object payload back
 * into positional arguments.
 *
 * Returns `{ type: 'object', properties: {} }` when there are no args.
 * @internal
 */
export declare function argsToJsonSchema(args: readonly StandardSchemaV1[] | undefined): unknown;
//#endregion
//#region src/node/diagnostics.d.ts
/**
 * DF00xx codes are allocated across packages (e.g. @devframes/json-render
 * owns DF0037–DF0041), so this file alone doesn't show the next free
 * number; check `docs/content/6.errors/` for the full allocation before adding one.
 */
export declare const diagnostics: import("nostics").Diagnostics<{
  readonly DF0006: {
    readonly why: (p: {
      name: string;
    }) => string;
  };
  readonly DF0007: {
    readonly why: "AsyncLocalStorage is not set, it likely to be an internal bug of the Devframe foundation";
  };
  readonly DF0008: {
    readonly why: (p: {
      distDir: string;
    }) => string;
  };
  readonly DF0012: {
    readonly why: (p: {
      filepath: string;
    }) => string;
  };
  readonly DF0013: {
    readonly why: (p: {
      key: string;
    }) => string;
  };
  readonly DF0014: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: "Provide a short description (~1–3 sentences) explaining what the tool does and when agents should invoke it.";
  };
  readonly DF0015: {
    readonly why: (p: {
      id: string;
    }) => string;
    readonly fix: "Tool ids must be unique across RPC functions with an `agent` field and tools registered via `ctx.agent.registerTool()`.";
  };
  readonly DF0016: {
    readonly why: (p: {
      id: string;
    }) => string;
  };
  readonly DF0017: {
    readonly why: (p: {
      transport: string;
      reason: string;
    }) => string;
  };
  readonly DF0029: {
    readonly why: (p: {
      channel: string;
      id: string;
      dropped: number;
    }) => string;
    readonly fix: "The consumer is too slow for the producer. Raise `highWaterMark` on the subscription, slow the producer, or batch chunks.";
  };
  readonly DF0030: {
    readonly why: (p: {
      channel: string;
      id: string;
    }) => string;
    readonly fix: "Ensure the server-side producer is running before clients subscribe, or check for typos in the stream id.";
  };
  readonly DF0031: {
    readonly why: (p: {
      channel: string;
      id: string;
    }) => string;
    readonly fix: "Track the producer lifecycle by guarding writes with the `stream.signal.aborted` flag.";
  };
  readonly DF0032: {
    readonly why: (p: {
      channel: string;
    }) => string;
    readonly fix: "Each channel name must be unique within a context. Pick a different name or reuse the existing channel handle.";
  };
  readonly DF0033: {
    readonly why: (p: {
      id: string;
      reason: string;
    }) => string;
    readonly fix: "Verify the bridge port is free and the devframe setup function does not throw. Pin a port via `cli.port` / `cli.portRange` on the definition, or via `port` on `devframeViteBridge` (`@devframes/vite`).";
  };
  readonly DF0034: {
    readonly why: (p: {
      namespace: string;
      name: string;
    }) => string;
    readonly fix: "A scoped context auto-namespaces ids. Pass a bare name without a \":\" separator (e.g. `register({ name: \"get-cwd\" })`), or use the unscoped `ctx.base.rpc.register` for a fully-qualified name.";
  };
  readonly DF0035: {
    readonly why: (p: {
      filepath: string;
    }) => string;
    readonly fix: "Check that the storage directory is writable and has free space.";
  };
  readonly DF0036: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: "Complete the auth handshake (or connect with a static/pre-shared token) before calling a trusted method. Untrusted callers may only call `anonymous:`-prefixed methods; see `isAnonymousRpcMethod`.";
  };
  readonly DF0037: {
    readonly why: (p: {
      id: string;
    }) => string;
    readonly fix: "Service ids are unique per context. Revoke the existing provider first (the `provide()` call returns a revoke function), or namespace the id with your plugin id to avoid collisions.";
  };
  readonly DF0042: {
    readonly why: (p: {
      id: string;
    }) => string;
    readonly fix: "Pass `{ force: true }` to `createBuild()` if the degraded export is still useful to you, or drop `capabilities.build: false` on the definition.";
  };
  readonly DF0045: {
    readonly why: (p: {
      file: string;
      reason: string;
    }) => string;
    readonly fix: "Discovery tooling (`devframe connect`) will not see this instance. Check that the registry directory is writable, point `DEVFRAME_INSTANCES_DIR` at a writable directory, or set `DEVFRAME_DISABLE_INSTANCE_REGISTRY=1` to opt out of registration.";
  };
  readonly DF0046: {
    readonly why: (p: {
      reason: string;
    }) => string;
    readonly fix: "Install it next to devframe (e.g. `npm install @devframes/agentic`) and run `devframe connect` again.";
  };
  readonly DF0047: {
    readonly why: (p: {
      name: string;
      id: string;
      existing: string;
    }) => string;
    readonly fix: "Wire names derive from tool ids (characters outside [a-zA-Z0-9_-] become \"_\"). Rename one of the two ids so they sanitize to distinct names.";
  };
  readonly DF0048: {
    readonly why: (p: {
      key: string;
    }) => string;
    readonly fix: "Call the devframe_state_read tool without arguments to list the available keys, then retry with one of them.";
  };
  readonly DF0049: {
    readonly why: "The devframe_connect_call-tool tool requires { port: number, tool: string }.";
    readonly fix: "Call devframe_connect_list-instances to get the port and tool names, then retry.";
  };
  readonly DF0050: {
    readonly why: (p: {
      port: number;
    }) => string;
    readonly fix: "Call devframe_connect_list-instances for the current instance list; the instance may have stopped or changed port.";
  };
  readonly DF0051: {
    readonly why: (p: {
      port: number;
    }) => string;
    readonly fix: "Restart the instance with the --mcp flag to expose its tools, then list instances again.";
  };
  readonly DF0052: {
    readonly why: (p: {
      host: string;
      port: number;
      reason: string;
    }) => string;
    readonly fix: "The port is likely already taken by another process (often a previous devframe instance). Free it, or pick another via `--port`, `cli.port` / `cli.portRange` on the definition, or `port` on `devframeViteBridge` (`@devframes/vite`). The original node error is available as `error.cause`.";
  };
  readonly DF0054: {
    readonly why: (p: {
      id: string;
    }) => string;
    readonly fix: "Await `instance.ready` (or any request through `instance.handler`) before reading `connectionMeta()`; the WebSocket binding it describes is only known once initialization completes.";
  };
  readonly DF0055: {
    readonly why: (p: {
      tier: string;
    }) => string;
    readonly fix: "Drop `handleUpgrade`/`attach` and let the configured transport serve the socket, or remove `server` / `ws.port` / `ws.sidecar` from the options so the instance leaves the binding to you.";
  };
  readonly DF0056: {
    readonly why: (p: {
      url: string;
    }) => string;
    readonly fix: "The server behind `ws.url` owns the transport (and its auth). Drop `ws.url` to have the instance serve the socket, or pair it with `server` / `ws.port` / `ws.sidecar` for the tunnel pattern, where a local binding is advertised through the relay.";
  };
  readonly DF0057: {
    readonly why: () => string;
    readonly fix: "Clients connect over the SSE endpoint instead, so no upgrade wiring is needed. Remove `ws: false` if the instance should serve a WebSocket after all.";
  };
  readonly DF0058: {
    readonly why: (p: {
      id: string;
    }) => string;
    readonly fix: "Pass `{ force: true }` to `createDevServer()` to run it anyway, or drop `capabilities.dev: false` on the definition.";
  };
  readonly DF0059: {
    readonly why: (p: {
      package: string;
      version: string;
      provider: string;
      reason: string;
    }) => string;
    readonly fix: "Requests fall back to probing the provider per file. Check network access to the provider, or install the assets package locally so no listing is needed.";
  };
  readonly DF0060: {
    readonly why: (p: {
      url: string;
      package: string;
      reason: string;
    }) => string;
    readonly fix: "Install the assets package locally (`npm install <package>`) to serve it with zero network, or check network access to the configured provider.";
  };
  readonly DF0061: {
    readonly why: (p: {
      package: string;
      required: string;
      installed: string;
    }) => string;
    readonly fix: "Align the installed assets package with the version its node package declares; they are published in lockstep.";
  };
  readonly DF0062: {
    readonly why: (p: {
      package: string;
      required: string;
      installed: string;
    }) => string;
    readonly fix: "Install the exact declared version to serve byte-identical assets.";
  };
  readonly DF0063: {
    readonly why: (p: {
      filepath: string;
      reason: string;
    }) => string;
    readonly fix: "The response was still served; only caching failed. Check that the cache directory is writable and has free space.";
  };
  readonly DF0064: {
    readonly why: (p: {
      package: string;
      version: string;
      reason: string;
    }) => string;
    readonly fix: "Static builds need every asset file up front. Install the assets package locally, or ensure the provider (and its file-listing API) is reachable during the build.";
  };
  readonly DF0065: {
    readonly why: (p: {
      field: "package" | "version";
      value: string;
    }) => string;
    readonly fix: "A remote-assets `package` must be a valid npm package name and `version` an exact semver version (e.g. `1.2.3`); they are interpolated into CDN URLs and the cache path.";
  };
  readonly DF0066: {
    readonly why: (p: {
      package: string;
    }) => string;
    readonly fix: "Option sets only merge before `ctx.services.ready()` fires. Install the service (or declare it in `DevframeDefinition.services`) before the barrier so its options join the merge.";
  };
  readonly DF0067: {
    readonly why: (p: {
      package: string;
      reason: string;
    }) => string;
    readonly fix: "Install the service package next to whoever declares it (a plugin declaring it in `services` should list it in its own dependencies), or drop `required: true` to degrade gracefully when it is absent.";
  };
  readonly DF0068: {
    readonly why: (p: {
      package: string;
      required: string;
      installed: string;
    }) => string;
    readonly fix: "Align the installed service package with the range its declarer requires, or drop `required: true` to downgrade the mismatch to a warning.";
  };
  readonly DF0069: {
    readonly why: (p: {
      package: string;
      required: string;
      installed: string;
    }) => string;
    readonly fix: "The advertised meta carries the real version, so clients can gate on it. Align the installed service package with the declared range to silence this warning.";
  };
  readonly DF0070: {
    readonly why: (p: {
      package: string;
      reason: string;
    }) => string;
    readonly fix: "A service package's default export must be a factory returning a `DevframeServiceDefinition`, an object with `package`, `version`, `scope`, and a `setup` function.";
  };
  readonly DF0072: {
    readonly why: (p: {
      method: string;
    }) => string;
    readonly fix: "Check the method id, and ensure the service/plugin that registers it is installed (e.g. declared in `services`) before the build collects the dump.";
  };
  readonly DF0075: {
    readonly why: (p: {
      runtime: string;
    }) => string;
    readonly fix: "Keep the SSE endpoint enabled (drop `sse: false`) so clients connect over it on Bun/Deno, or move the socket to a side-car (`ws: { sidecar: true }`) which binds the native WebSocket adapter on its own port.";
  };
  readonly DF0076: {
    readonly why: (p: {
      runtime: string;
    }) => string;
    readonly fix: "On Bun/Deno, serve the advertised `__ws` route from `Bun.serve` / `Deno.serve` with `attachBunWsTransport` / `attachDenoWsTransport` (see the hub-deno example), or connect over the SSE endpoint instead.";
  };
  readonly DF0078: {
    readonly why: "This devframe exposes agent tools, but the MCP endpoint stays off: the optional peer \"@devframes/agentic\" is not installed.";
    readonly fix: "Install `@devframes/agentic` next to devframe to serve the MCP endpoint, or set `mcp: false` to opt out silently.";
  };
  readonly DF0079: {
    readonly why: (p: {
      reason: string;
    }) => string;
    readonly fix: "Install `@devframes/agentic` next to devframe (the MCP adapter and the MCP SDK live there), or remove the explicit `mcp` setting.";
  };
  readonly DF0081: {
    readonly why: (p: {
      name: string;
      reason: string;
    }) => string;
    readonly fix: "Pass `withMcpContent` a non-empty array of `{ type: 'text', text }`, `{ type: 'image', data, mimeType }` or `{ type: 'audio', data, mimeType }` blocks, with string fields and base64 `data`.";
  };
}, readonly [(d: import("nostics").Diagnostic, { method }?: {
  method?: "log" | "warn" | "error";
}) => void], never>;
//#endregion
//#region src/node/host-agent.d.ts
/**
 * Framework-neutral host aggregating the agent-exposed surface of a
 * devframe. Auto-discovers RPC functions with an `agent` field from
 * `ctx.rpc.definitions`, and accepts plugin-registered tools /
 * resources via `registerTool` / `registerResource`.
 */
export declare class DevframeAgentHost implements DevframeAgentHost$1 {
  readonly context: DevframeNodeContext;
  readonly events: EventEmitter<DevframeAgentHostEvents>;
  private readonly tools;
  private readonly resources;
  private readonly providers;
  private _rpcUnsubscribe;
  constructor(context: DevframeNodeContext);
  registerTool(input: AgentToolInput): AgentHandle;
  unregisterTool(id: string): boolean;
  registerToolProvider(provider: AgentToolProvider): AgentToolProviderHandle;
  registerResource(input: AgentResourceInput): AgentHandle;
  unregisterResource(id: string): boolean;
  list(): AgentManifest;
  hasSurface(): boolean;
  getTool(id: string): AgentTool | undefined;
  getResource(id: string): AgentResource | undefined;
  invoke(id: string, args: unknown): Promise<unknown>;
  read(id: string): Promise<AgentResourceContent>;
  /** @internal */
  _dispose(): void;
  private _validateToolId;
  private _projectTool;
  /** Query every registered provider, projecting inputs to serializable tools. */
  private _collectProviderTools;
  private _collectRpcTools;
  private _findRpcDefinition;
}
//#endregion
//#region src/node/host-h3.d.ts
export interface CreateH3DevframeHostOptions {
  /**
   * Host the standalone server listens on, e.g. `http://localhost:9999`.
   * Consumed by `resolveOrigin` for dock entries that need an absolute URL.
   * Pass a function for hosts that only learn their public origin later
   * (e.g. `createHandler` derives it from the first incoming request).
   */
  origin: string | (() => string);
  /**
   * Register a static-file handler at `base` serving files from `source`:
   * a local directory or a resolved remote-assets back-proxy store (both
   * accepted by `devframe/utils/serve-static`). `mountStatic` forwards to
   * it; when omitted the host serves no SPA (bridge mode, where the SPA is
   * hosted elsewhere).
   */
  mount?: (base: string, source: string | RemoteAssetsStore) => void | Promise<void>;
  /**
   * Namespace for storage paths returned by `getStorageDir`. Workspace
   * state (committable) lives under `${workspaceRoot}/.devframe/`, project
   * state under `${workspaceRoot}/node_modules/.<appName>/devframe/`, and
   * global state under `${homedir()}/.<appName>/devframe/`. Pick the
   * devtool's id (or another stable, filesystem-safe identifier) so the
   * standalone host doesn't collide with other tools' storage.
   */
  appName: string;
  /**
   * Workspace root used as the parent of the per-project storage
   * directory. Defaults to `process.cwd()`.
   */
  workspaceRoot?: string;
}
/**
 * h3-backed {@link DevframeHost}, used by the standalone CLI adapter.
 */
export declare function createH3DevframeHost(options: CreateH3DevframeHostOptions): DevframeHost;
//#endregion
//#region src/node/import-runtime-module.d.ts
/**
 * Resolve and import a package at runtime without adding it to a consumer's
 * bundle graph. First-party adapters use this for modules whose code is
 * needed only when the matching feature is enabled (optional peers, and the
 * MCP adapter with the SDK behind it).
 *
 * @internal
 */
export declare function importRuntimeModule<T = unknown>(specifier: string): Promise<T>;
//#endregion
//#region src/node/utils.d.ts
export declare function normalizeHttpServerUrl(host: string, port: number | string): string;
//#endregion
//#region src/rpc/wire-codec.d.ts
/**
 * The per-connection `serialize`/`deserialize` pair for a live RPC wire.
 *
 * @internal
 */
interface RpcWireCodec {
  serialize: (msg: any) => string;
  deserialize: (raw: string) => any;
}
/**
 * Build the per-connection wire codec every live transport (WS server, WS
 * client, SSE server, SSE client) shares: per-method dispatch between strict
 * JSON (methods declared `jsonSerializable: true`) and `s:`-prefixed
 * structured-clone (everything else, including all error envelopes), with a
 * request-id → method map so a response independently picks the same
 * encoder as its request. One codec per connection; request-id spaces
 * don't collide across connections.
 *
 * @internal
 */
export declare function createRpcWireCodec(definitions?: ReadonlyMap<string, Pick<RpcFunctionDefinitionAny, 'jsonSerializable'>>): RpcWireCodec;
/**
 * Peek at a wire frame's birpc envelope without engaging a codec's
 * request-id bookkeeping; used by the SSE transport to route a frame
 * (park a POST for its response / answer with a bare 202) before it is
 * handed to birpc proper.
 *
 * @internal
 */
export declare function peekRpcWireFrame(raw: string): {
  t?: string;
  i?: string;
};
//#endregion
//#region src/tool-input.d.ts
/** Convert tool input for a command, whose arguments must be declared. */
export declare function toolInputToCommandArgs(input: unknown, argumentCount?: number): unknown[];
//#endregion
export { type AgenticMcpModule, type ContextRpcServer, type CreateContextRpcServerOptions, type CreateInstanceShellOptions, type DevframeInstanceRecord, type DevframeInstanceRegistration, type InstanceRegisterConfig, type InstanceShell, type InstanceShellApi, type InstanceShellInit, type InstanceShellInternals, type InstanceWsTier, type MountMcpHttpOptions, type MountedMcpHttp, type ResolvedMcpConfig, type RpcWireCodec, type StartedServer, createContextRpcServer, createInstanceShell, getMcpContent, importAgenticMcp, listLiveDevframeInstances, loadAutoMcpAdapter, normalizeBasePath, probeDevframeOrigin, registerDevframeInstance, resolveBasePath, resolveInstanceRegister, resolveMcpConfig, samePath };