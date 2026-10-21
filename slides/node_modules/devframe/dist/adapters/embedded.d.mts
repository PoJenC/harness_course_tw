import { V as DevframeDefinition, o as DevframeNodeContext } from "../context-dOWXVHc6.mjs";
//#region src/adapters/embedded.d.ts
export interface CreateEmbeddedOptions {
  /** Target context the devframe is registered into. Required. */
  ctx: DevframeNodeContext;
}
/**
 * Register a devframe into an already-running devframe/Kit context at
 * runtime. Mirrors what the Vite plugin scan does for devframes passed
 * as plugin options, but exposes the same flow to callers that need
 * dynamic, post-startup registration.
 *
 * The host owns the mount path; when a hosted mount is needed the
 * effective default follows the hosted rule of `def.basePath ?? '/__<id>/'`.
 */
export declare function createEmbedded(d: DevframeDefinition, options: CreateEmbeddedOptions): Promise<void>;
//#endregion