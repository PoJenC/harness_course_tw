import { L as McpContentBlock } from "./context-dOWXVHc6.mjs";
//#region src/agent/mcp-content.d.ts
/**
 * Attach MCP content blocks to a tool result, for example an image next to
 * its text. The MCP adapter sends these blocks as the `content` of the
 * `tools/call` result, in place of the default single JSON text block.
 *
 * The blocks are stored under a non-enumerable symbol key, so `value` itself
 * does not change: the RPC transport to the SPA, `returns` validation, and the
 * `structuredContent` of a tool with an output schema all see the plain value
 * and never the (often large) block data.
 *
 * `value` must be an object that is not frozen. Returns `value`.
 */
declare function withMcpContent<T extends object>(value: T, content: readonly McpContentBlock[]): T;
/**
 * Read the blocks attached by {@link withMcpContent}, or `undefined` when the
 * value carries none. The value is not validated here; the MCP adapter checks
 * each block before it sends it.
 *
 * @internal
 */
declare function getMcpContent(value: unknown): unknown;
//#endregion
export { withMcpContent as n, getMcpContent as t };