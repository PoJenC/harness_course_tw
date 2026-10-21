import { $ as McpSetting, Gt as DevframeAgentHost, H as DevframeDeploymentKind, V as DevframeDefinition, Z as McpAuthorization, t as ConnectionMeta } from "./context-dOWXVHc6.mjs";
import { t as AgenticMcpModule } from "./agentic-JXlb0uiD.mjs";
//#region src/adapters/_shared.d.ts
/**
 * Resolve the mount base path for a devframe's SPA. Hosted adapters
 * (`vite`, `embedded`) default to `/__<id>/` so they don't collide
 * with the host app; standalone adapters (`cli`, `build`)
 * default to `/` because they own the origin.
 *
 * The devframe author can override with `basePath` on the definition.
 */
declare function resolveBasePath(def: DevframeDefinition, kind: DevframeDeploymentKind): string;
declare function normalizeBasePath(base: string): string;
interface ResolveDevServerPortOptions {
  /** Bind host (passed to `get-port-please` for in-use detection). */
  host?: string;
  /** Override the preferred port. Default: `def.cli?.port ?? 9999`. */
  defaultPort?: number;
}
/**
 * Resolve the listening port for `createDevServer` (and `createHandler`'s
 * side-car tiers), honoring the definition's `cli.port` / `cli.portRange` /
 * `cli.random` settings. Exposed separately so authors who run their own
 * argv parsing can resolve a port up-front (to print it, log it, etc.)
 * before starting the server.
 */
declare function resolveDevServerPort(def: DevframeDefinition, options?: ResolveDevServerPortOptions): Promise<number>;
/**
 * A fully-resolved MCP route configuration: the concrete authorization policy
 * (never the `mcp: true` shorthand), plus the optional route path and origin
 * allow-list. Every route mount consumes this shape.
 */
interface ResolvedMcpConfig {
  /** Route segment, relative to the base. Default resolved by the caller. */
  path?: string;
  /** Origin allow-list, or `false` to disable the origin gate. */
  allowedOrigins?: readonly string[] | false;
  /** Shared-state exposure from the route options; omitted means every key. */
  exposeSharedState?: boolean | ((key: string) => boolean);
  /** Handshake `instructions` from the route options; omitted means none. */
  instructions?: string;
  /** The resolved identity policy: a bearer token, callback, or `false`. */
  authorization: McpAuthorization;
}
/**
 * Normalize an *explicit* `mcp` setting into a fully-resolved config, or
 * `undefined` when the MCP route is disabled. `'auto'` also resolves to
 * `undefined` here: whether it mounts depends on the live agent surface,
 * which only the mounting adapter can consult (through
 * {@link loadAutoMcpAdapter}) - static resolvers like
 * `resolveMcpConnectionMeta` treat it as unadvertisable.
 *
 * An enabled route trusts same-machine callers by default: the authorization
 * resolves to origin-only (`false`) unless the object config opts into a
 * bearer/callback identity check. An empty-string bearer is treated as no
 * bearer (origin-only) rather than a usable credential.
 */
declare function resolveMcpConfig(mcp: McpSetting | undefined): ResolvedMcpConfig | undefined;
/**
 * Resolve the `mcp: 'auto'` default at mount time: import the MCP adapter
 * from the optional `@devframes/agentic` peer when the devframe's agent
 * surface is non-empty, or return `undefined` (mount nothing) when the
 * surface is empty - the zero-cost path, loading no MCP code at all. A
 * non-empty surface with the peer absent also mounts nothing, reporting a
 * one-time DF0078 warning instead. The adapter (and the MCP SDK behind it)
 * loads through `importRuntimeModule`, so it never enters a consumer's
 * bundle graph.
 */
declare function loadAutoMcpAdapter(agent: Pick<DevframeAgentHost, 'hasSurface'>): Promise<AgenticMcpModule | undefined>;
/**
 * Resolve the `mcp` entry a `__connection.json` should advertise for a dev
 * server started with the given `mcp` option, or `undefined` when the route
 * is disabled. `'auto'` (the omitted default) resolves at mount time against
 * the live agent surface, so hand-rolled meta advertises it only for an
 * explicit setting; the adapters advertise the actually-mounted route
 * themselves.
 *
 * Hosted bridges that hand-roll their connection meta pass the side-car
 * `port`: the advertised path becomes absolute (the side-car mounts at `/`)
 * and the client dials `<page-host>:<port><path>`. Without `port` the path
 * stays relative, resolved against `__connection.json`'s own location (the
 * same-server default).
 */
declare function resolveMcpConnectionMeta(mcp: McpSetting | undefined, port?: number): ConnectionMeta['mcp'];
//#endregion
export { resolveBasePath as a, resolveMcpConnectionMeta as c, normalizeBasePath as i, ResolvedMcpConfig as n, resolveDevServerPort as o, loadAutoMcpAdapter as r, resolveMcpConfig as s, ResolveDevServerPortOptions as t };