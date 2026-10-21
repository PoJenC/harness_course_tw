import { n as DevframeHubContext, t as CreateHubContextOptions } from "../context-BK50aJ-F.mjs";
import { DevframeHubUi, DevframesInput, DockRendererRegistration } from "./initiate.mjs";
import { DevframeServiceInput, DevframeStorageScope } from "devframe/types";
//#region src/node/build.d.ts
export interface BuildHubOptions {
  /**
   * Output directory the hub subtree is written into. It corresponds to the
   * hub {@link BuildHubOptions.base} at serve time: building with
   * `base: '/__devframes/'` into `dist/__devframes` makes the deployed app's
   * `dist/` servable as-is by any static file server. A mount served outside
   * the hub base (a devframe SPA or asset dir kept as a sibling of it) is
   * written to this directory's parent (the deploy root) by its absolute path,
   * so `dist/` still serves the whole layout.
   */
  outDir: string;
  /**
   * Mount base the deployed hub answers under (baked into every absolute URL
   * the build emits: page-script rewrites, renderer modules, per-frame meta
   * pointers). Default: `/__devframes/`.
   */
  base?: string;
  /** Devframes to bake as docks, same input as `initHub({ devframes })`. */
  devframes?: DevframesInput;
  /**
   * Bring your own already-mounted hub context instead of `devframes`, the
   * build counterpart of `initHub({ context })`: a host that assembled
   * `createHubContext` + `ctx.install` itself (Vite DevTools' kit-augmented
   * context, devframes mounted from Vite plugins) hands the mounted context
   * here and `buildHub` bakes it, reading `ctx.frames` and
   * `ctx.views.buildStaticDirs` for what to emit. `configure` and the UI
   * slot's `setup` still run against it, so pass them here rather than running
   * them yourself. Mutually exclusive with `devframes`.
   */
  context?: DevframeHubContext;
  /** Host-level wire services, same contract as `initHub({ services })`. */
  services?: DevframeServiceInput[];
  /** Extra RPC declarations registered at context creation. */
  rpcDeclarations?: CreateHubContextOptions['builtinRpcDeclarations'];
  /**
   * Runs once the context exists and every `devframes` entry is mounted;
   * register docks, commands, and messages surfaces here, exactly like
   * `initHub({ configure })`. Everything it registers is baked into the
   * static shared-state snapshot.
   */
  configure?: (ctx: DevframeHubContext) => void | Promise<void>;
  /**
   * The hub's UI slot: the viewer SPA is copied to the hub base, the
   * `embedded.js` bootstrap next to it, and `setup(ctx)` runs so its static
   * config (branding, dock preferences) is baked into the connection meta.
   */
  ui?: DevframeHubUi;
  /** Prebuilt dock-renderer modules, copied to `<base>__renderers/<type>.mjs`. */
  renderers?: readonly DockRendererRegistration[];
  /** Name written into `<base>__index.json`. */
  name?: string;
  /** Version written into `<base>__index.json`. */
  version?: string;
  /** Working directory for the hub context. Default: `process.cwd()`. */
  cwd?: string;
  /** Override where persisted devframe state lives during the build. */
  getStorageDir?: (scope: DevframeStorageScope) => string;
  /** Pretty-print RPC dump JSON files. Default: `false` (minified shards). */
  pretty?: boolean;
  /**
   * Remove {@link BuildHubOptions.outDir} before writing. Default `true`,
   * matching a from-scratch build. Pass `false` to bake into a directory that
   * already holds sibling output (an app's own `dist/` the hub subtree lives
   * beside).
   */
  clean?: boolean;
}
/**
 * Produce a self-contained static deploy of a whole hub, the multi-devframe
 * counterpart of devframe's `createBuild`:
 *
 *   - Build a `mode: 'build'` hub context and mount every devframe (or reuse a
 *     `context` a host mounted itself): each SPA is copied to `<outDir>/<id>/`,
 *     an absolute-path page script to `<outDir>/<id>/__page-script/`, and its
 *     `setup(ctx)` runs.
 *   - Copy the UI slot's viewer SPA, `embedded.js`, and the renderer
 *     modules, and write the discovery documents (`__index.json`,
 *     `__client-imports.js`).
 *   - Write `__connection.json` (`{ backend: 'static' }`, carrying
 *     `ctx.staticConfig` as `configs`) at the hub base and at every frame
 *     base (each pointing back at the hub's own meta via `baseUrl`).
 *   - Bake the shared RPC dump under `<outDir>/__rpc-dump/`: every
 *     `static`/`snapshot` RPC plus a snapshot of each shared-state key
 *     (docks, commands, renderer manifest), so `createDevframeClientRuntime`
 *     and every frame SPA boot from the dump with no live server.
 *
 * Reads work from the baked dump; live writes (messages, terminals, commands
 * execution) have no server and degrade to no-ops in the clients.
 */
export declare function buildHub(options: BuildHubOptions): Promise<void>;
//#endregion