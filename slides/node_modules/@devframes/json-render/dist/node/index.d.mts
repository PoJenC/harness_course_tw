import { n as DevframeJsonRenderSpec, r as JsonRenderView } from "../types-ByXkazOp.mjs";
import { DevframeDiagnostics } from "devframe/utils/nostics";
import { DevframeNodeContext, DevframeScopedNodeContext } from "devframe";
import { StandardSchemaV1 } from "devframe/utils/simple-schema";
//#region src/node/create-view.d.ts
/** Options for {@link createJsonRenderView}. */
interface CreateJsonRenderViewOptions<SpecType extends DevframeJsonRenderSpec = DevframeJsonRenderSpec> {
  /**
   * Stable, author-supplied id, unique within the view's scope. Forms the
   * shared-state key `devframe:json-render:<scope>:<id>` and never changes
   * across updates, so a client keeps its subscription across reconnects.
   */
  id: string;
  /** The initial spec. */
  spec: SpecType;
  /** A replacement Standard Schema validator, or `false` to disable validation. */
  schema?: StandardSchemaV1 | false;
  /**
   * Override the scope segment of the view's stable id. Defaults to the
   * context's namespace when created from a scoped context, otherwise
   * `'global'`.
   */
  scope?: string;
  /**
   * Human-facing label published in the view index and used by a multi-view
   * frontend (e.g. the standalone SPA's view switcher) to name this view.
   * Defaults to {@link CreateJsonRenderViewOptions.id}.
   */
  title?: string;
}
type AnyContext = DevframeNodeContext | DevframeScopedNodeContext<string>;
/**
 * Create a JSON-render view bound to a devframe context. Registers a
 * server-side shared state (patches enabled) carrying the live spec + state,
 * validates element props at ingress against the base catalog, and returns a
 * handle plus the serializable {@link JsonRenderView.ref} a client subscribes
 * through.
 *
 * @example
 * ```ts
 * const view = createJsonRenderView(ctx, { id: 'metrics', spec })
 * view.update(nextSpec)
 * view.patchState([{ op: 'replace', path: '/count', value: 3 }])
 * view.dispose()
 * ```
 */
export declare function createJsonRenderView<SpecType extends DevframeJsonRenderSpec = DevframeJsonRenderSpec>(ctx: AnyContext, options: CreateJsonRenderViewOptions<SpecType>): JsonRenderView<SpecType>;
//#endregion
//#region src/node/diagnostics.d.ts
declare const codes: {
  DF0038: {
    why: (p: {
      id: string;
      key: string;
      issues: string;
    }) => string;
    fix: string;
  };
  DF0039: {
    why: (p: {
      id: string;
      scope: string;
    }) => string;
    fix: string;
  };
  DF0040: {
    why: (p: {
      id: string;
    }) => string;
    fix: string;
  };
  DF0041: {
    why: (p: {
      id: string;
      reason: string;
    }) => string;
    fix: string;
  };
  DF0073: {
    why: (p: {
      id: string;
      issues: string;
    }) => string;
    fix: string;
  };
  DF0074: {
    why: (p: {
      id: string;
    }) => string;
    fix: string;
  };
};
/**
 * `@devframes/json-render` protocol/runtime diagnostics share the `DF`
 * prefix and use the next globally available core codes. Browser-only render
 * failures keep `console.*` in the UI package.
 *
 * Annotated with {@link DevframeDiagnostics} so the public type resolves
 * through the `devframe/utils/nostics` peer rather than inlining `nostics`.
 */
declare const diagnostics: DevframeDiagnostics<typeof codes>;
//#endregion
export { type CreateJsonRenderViewOptions, diagnostics as jsonRenderDiagnostics };