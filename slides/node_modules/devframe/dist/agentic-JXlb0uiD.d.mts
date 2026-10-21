import { F as CreateMcpServerOptions, P as CreateMcpFetchHandlerOptions, R as McpFetchHandler, V as DevframeDefinition, o as DevframeNodeContext, z as McpServerHandle } from "./context-dOWXVHc6.mjs";
import { H3 } from "h3";
//#region src/node/agentic.d.ts
/**
 * The h3-bound half of the MCP adapter contract (the SDK-neutral half lives
 * in `types/mcp.ts`, which must stay lib-neutral; h3's declarations are not).
 */
interface MountMcpHttpOptions extends CreateMcpFetchHandlerOptions {}
interface MountedMcpHttp {
  /** Tear down the MCP handler (aborts in-flight exchanges, drops the change bridge). */
  dispose: () => Promise<void>;
}
/** The surface `@devframes/agentic/mcp` exports, as devframe's loaders consume it. */
interface AgenticMcpModule {
  /** Build an MCP server over the agent surface of a devframe definition (stdio). */
  createMcpServer: (definition: DevframeDefinition, options?: CreateMcpServerOptions) => Promise<McpServerHandle>;
  /** Build a framework-agnostic `Request → Response` MCP endpoint over a devframe context. */
  createMcpFetchHandler: (ctx: DevframeNodeContext, options: CreateMcpFetchHandlerOptions) => McpFetchHandler;
  /** Mount a stateless MCP endpoint on an h3 app at `path`. */
  mountMcpHttp: (app: H3, ctx: DevframeNodeContext, path: string, options: MountMcpHttpOptions) => MountedMcpHttp;
}
/**
 * Load the MCP adapter from `@devframes/agentic/mcp`, mapping a failed load
 * (typically: the optional peer is not installed) to a thrown `DF0079`.
 * Loads through `importRuntimeModule`, so the adapter and the MCP SDK behind
 * it never enter a consumer's bundle graph.
 */
declare function importAgenticMcp(specifier?: string): Promise<AgenticMcpModule>;
//#endregion
export { importAgenticMcp as i, MountMcpHttpOptions as n, MountedMcpHttp as r, AgenticMcpModule as t };