import { Plugin } from "vite";
//#region src/node/options.d.ts
type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null;
interface ViteInspectOptions {
  /**
   * Enable the inspect plugin in dev mode (could be some performance overhead)
   *
   * @default true
   */
  dev?: boolean;
  /**
   * Enable the inspect plugin in build mode, and output the report to `.vite-inspect`
   *
   * @default false
   */
  build?: boolean;
  /**
   * @deprecated use `dev` or `build` option instead.
   */
  enabled?: boolean;
  /**
   * Directory for build inspector UI output
   * Only work in build mode
   *
   * @default '.vite-inspect'
   */
  outputDir?: string;
  /**
   * Filter for modules to be inspected
   */
  include?: FilterPattern;
  /**
   * Filter for modules to not be inspected
   */
  exclude?: FilterPattern;
  /**
   * Base URL for inspector UI
   *
   * @default read from Vite's config
   */
  base?: string;
  /**
   * Print URL output silently in the terminal
   *
   * @default false
   */
  silent?: boolean;
  /**
   * Automatically open inspect page
   *
   * @default false
   */
  open?: boolean;
  /**
   * Remove version query `?v=xxx` and treat them as the same module
   *
   * @default true
   */
  removeVersionQuery?: boolean;
  /**
   * Enable embedded mode
   *
   * @default false
   */
  embedded?: boolean;
}
//#endregion
//#region src/node/index.d.ts
declare function PluginInspect(options?: ViteInspectOptions): Plugin;
//#endregion
export { FilterPattern as n, ViteInspectOptions as r, PluginInspect as t };