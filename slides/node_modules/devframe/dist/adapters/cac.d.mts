import { $ as McpSetting, Ft as parseCliFlags, Mt as CliFlagsSchema, Nt as InferCliFlags, Pt as defineCliFlags, V as DevframeDefinition } from "../context-dOWXVHc6.mjs";
import { CAC } from "cac";
import { H3 } from "h3";
//#region src/adapters/cac.d.ts
export interface CreateCacOptions {
  /** Default port for `dev` (default: 9999). */
  defaultPort?: number;
  /**
   * Expose a route-based MCP server alongside the dev server, speaking the
   * MCP Streamable-HTTP transport at `<base>__mcp`. Whether to expose MCP is
   * a hosting decision made at the CLI assembly stage, so it lives here rather
   * than on the definition. When unset, falls back to the `'auto'` default
   * (mount once the agent surface is non-empty). See {@link McpSetting}.
   *
   * The `--mcp` / `--no-mcp` flags override this per run.
   */
  mcp?: McpSetting;
  /**
   * Final CAC hook invoked after devframe's built-in subcommands and
   * after the definition's `cli.configure`. Use this to add app-level
   * flags and commands at the assembly stage.
   */
  configureCli?: (cli: CAC) => void;
  /**
   * Called once the dev server is listening. Use this to print a
   * startup banner or trigger side-effects that depend on the live URL.
   */
  onReady?: (info: {
    origin: string;
    port: number;
    app: H3;
  }) => void | Promise<void>;
}
export interface CacHandle {
  /**
   * Raw CAC instance. Mutate before calling `parse()` for last-mile
   * flag or command additions that don't fit `configureCli`.
   */
  cli: CAC;
  parse: (argv?: string[]) => Promise<void>;
}
/**
 * Wrap a {@link DevframeDefinition} in a `cac`-powered command-line
 * interface exposing `dev` / `build` / `mcp` subcommands.
 *
 * Requires the optional `cac` peer dependency.
 */
export declare function createCac(d: DevframeDefinition, options?: CreateCacOptions): CacHandle;
//#endregion
export { type CliFlagsSchema, type InferCliFlags, defineCliFlags, parseCliFlags };