import { V as DevframeDefinition, o as DevframeNodeContext, q as DevframeSnapshotRpcEntry } from "../context-dOWXVHc6.mjs";
import { o as StaticAssetsSource } from "../remote-assets-eBvSKZMS.mjs";
//#region src/adapters/build.d.ts
export interface CreateBuildOptions {
  /** Output directory. Defaults to `dist-static`. */
  outDir?: string;
  /**
   * Override the SPA dist to copy into `outDir`: a local directory or a
   * remote-assets declaration (materialized in full at build time). When
   * omitted the adapter reads `devframe.clientAssets`; authors typically set
   * this once on the definition itself.
   */
  distDir?: StaticAssetsSource;
  /**
   * Pretty-print RPC dump JSON files. Defaults to `false` so payload
   * shards (which can be multiple MB for graph-heavy tools) ship
   * minified. Set `true` when you need to diff / read the dumps by hand.
   */
  pretty?: boolean;
  /**
   * Proceed even when the definition declares `capabilities.build: false`.
   * `createCac` already skips registering the `build` subcommand for such
   * a definition; this only matters for a caller invoking `createBuild`
   * directly, bypassing the CLI.
   */
  force?: boolean;
}
/**
 * Produce a self-contained static deploy of a devframe:
 *
 *   - Build a `mode: 'build'` context and run `devframe.setup(ctx)`.
 *   - Copy the author's SPA dist into `<outDir>/`.
 *   - Write `<outDir>/__connection.json` (`{ backend: 'static' }`) and the
 *     sharded RPC dump under `<outDir>/__rpc-dump/` so the deployed SPA
 *     discovers both via relative paths from `document.baseURI`. The
 *     output is mount-path agnostic, so the same bundle works at `/`,
 *     `/devframe/`, or any base, no rewriting required.
 */
export declare function createBuild(d: DevframeDefinition, options?: CreateBuildOptions): Promise<void>;
/**
 * Attach a `dump` to each {@link DevframeRpcOptions.snapshot} target so the
 * static collector bakes it, even though the (service-owned) definition
 * declares no dump of its own. A bare method id becomes `snapshot: true`
 * (bakes the no-arg call); `{ method, inputs }` bakes one record per resolved
 * argument-tuple by running the target's own handler, with the first tuple's
 * output as the fallback.
 */
export declare function applySnapshotRpc(ctx: DevframeNodeContext, entries: readonly DevframeSnapshotRpcEntry[] | undefined): void;
//#endregion