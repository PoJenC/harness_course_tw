import { S as StateModel, V as VisibilityCondition, a as StateCondition, A as AndCondition, O as OrCondition, D as DynamicValue, b as Spec, J as JsonPatch, U as UIElement } from './store-utils-vyT_VWJ6.js';
export { $ as Action, _ as ActionBinding, a7 as ActionBindingSchema, a0 as ActionConfirm, a9 as ActionConfirmSchema, a4 as ActionDefinition, a6 as ActionExecutionContext, a3 as ActionHandler, a2 as ActionOnError, ab as ActionOnErrorSchema, a1 as ActionOnSuccess, aa as ActionOnSuccessSchema, a8 as ActionSchema, C as ComponentSchema, e as DynamicBoolean, r as DynamicBooleanSchema, d as DynamicNumber, q as DynamicNumberSchema, c as DynamicString, p as DynamicStringSchema, o as DynamicValueSchema, F as FlatElement, f as IndexCondition, I as ItemCondition, M as MixedStreamCallbacks, l as MixedStreamParser, P as PatchOp, R as RepeatStatePath, a5 as ResolvedAction, W as SPEC_DATA_PART, X as SPEC_DATA_PART_TYPE, g as SingleCondition, n as SpecDataPart, k as SpecStreamCompiler, j as SpecStreamLine, h as StateStore, Y as StoreAdapterConfig, m as StreamChunk, i as ValidationMode, ag as action, af as actionBinding, x as addByPath, G as applySpecPatch, E as applySpecStreamPatch, K as compileSpecStream, Q as createJsonRenderTransform, N as createMixedStreamParser, L as createSpecStreamCompiler, Z as createStateStore, ad as executeAction, z as findFormValue, t as getByPath, ae as interpolateString, H as nestedToFlat, B as parseSpecStreamLine, T as pipeJsonRender, y as removeByPath, ac as resolveAction, s as resolveDynamicValue, v as resolveRepeatItemStatePath, u as resolveRepeatStatePath, w as setByPath } from './store-utils-vyT_VWJ6.js';
import { z } from 'zod';

/**
 * Visibility condition schema.
 *
 * Lazy because `OrCondition` can recursively contain `VisibilityCondition`.
 */
declare const VisibilityConditionSchema: z.ZodType<VisibilityCondition>;
/**
 * Strict variant for spec validation: rejects unknown keys, so malformed
 * conditions (e.g. mixing $state and $item in one object) are caught at
 * validation time instead of silently evaluating to hidden at runtime.
 */
/**
 * True when a condition references the repeat-item scope ($item or $index)
 * anywhere in its tree. Renderers use this to apply a repeat container's own
 * visible condition as a per-item filter instead of evaluating it (and
 * failing) outside the repeat scope.
 */
declare function conditionUsesItemScope(condition: VisibilityCondition | undefined): boolean;
/**
 * Splits a repeat container's visible condition into a container-level gate
 * and a per-item filter. Top-level AND structures (arrays, $and) partition
 * cleanly: conjuncts that reference $item/$index filter items, the rest gate
 * the container. An $or that mixes scopes cannot be partitioned soundly and
 * is applied entirely per item (state parts still evaluate correctly there;
 * the container shell just cannot be hidden by it).
 */
declare function splitRepeatVisibility(condition: VisibilityCondition | undefined): {
    container: VisibilityCondition | undefined;
    itemFilter: VisibilityCondition | undefined;
};
declare const VisibilityConditionStrictSchema: z.ZodType<VisibilityCondition>;
/**
 * Context for evaluating visibility conditions.
 *
 * `repeatItem` and `repeatIndex` are only present inside a `repeat` scope
 * and enable `$item` / `$index` conditions.
 */
interface VisibilityContext {
    stateModel: StateModel;
    /** The current repeat item (set inside a repeat scope). */
    repeatItem?: unknown;
    /** The current repeat array index (set inside a repeat scope). */
    repeatIndex?: number;
}
/**
 * Evaluate a visibility condition.
 *
 * - `undefined` → visible
 * - `boolean` → that value
 * - `SingleCondition` → evaluate single condition
 * - `SingleCondition[]` → implicit AND (all must be true)
 * - `AndCondition` → `{ $and: [...] }`, explicit AND
 * - `OrCondition` → `{ $or: [...] }`, at least one must be true
 */
declare function evaluateVisibility(condition: VisibilityCondition | undefined, ctx: VisibilityContext): boolean;
/**
 * Helper to create visibility conditions.
 */
declare const visibility: {
    /** Always visible */
    always: true;
    /** Never visible */
    never: false;
    /** Visible when state path is truthy */
    when: (path: string) => StateCondition;
    /** Visible when state path is falsy */
    unless: (path: string) => StateCondition;
    /** Equality check */
    eq: (path: string, value: unknown) => StateCondition;
    /** Not equal check */
    neq: (path: string, value: unknown) => StateCondition;
    /** Greater than */
    gt: (path: string, value: number | {
        $state: string;
    }) => StateCondition;
    /** Greater than or equal */
    gte: (path: string, value: number | {
        $state: string;
    }) => StateCondition;
    /** Less than */
    lt: (path: string, value: number | {
        $state: string;
    }) => StateCondition;
    /** Less than or equal */
    lte: (path: string, value: number | {
        $state: string;
    }) => StateCondition;
    /** AND multiple conditions */
    and: (...conditions: VisibilityCondition[]) => AndCondition;
    /** OR multiple conditions */
    or: (...conditions: VisibilityCondition[]) => OrCondition;
};

/**
 * Definition for a custom directive — a user-defined `$`-prefixed dynamic
 * value that extends the spec language.
 *
 * @example
 * ```ts
 * const formatDirective = defineDirective({
 *   name: '$format',
 *   description: 'Locale-aware value formatting (date, currency, number, percent).',
 *   schema: z.object({
 *     $format: z.enum(['date', 'currency', 'number']),
 *     value: z.unknown(),
 *   }),
 *   resolve(value, ctx) {
 *     const resolved = resolvePropValue(value.value, ctx);
 *     return new Intl.NumberFormat().format(resolved);
 *   },
 * });
 * ```
 */
interface DirectiveDefinition<TSchema extends z.ZodType = z.ZodType> {
    /** The `$`-prefixed key that triggers this directive (e.g. `"$format"`). */
    name: string;
    /**
     * Short description of the directive for the AI system prompt.
     * The schema fields are auto-generated; this adds behavioral context.
     */
    description?: string;
    /** Zod schema for validating the directive object. */
    schema: TSchema;
    /**
     * Resolver function. Receives the raw directive value and the current
     * {@link PropResolutionContext}. May call `resolvePropValue` on sub-values
     * to support composition with other dynamic expressions.
     */
    resolve: (value: z.infer<TSchema>, ctx: PropResolutionContext) => unknown;
}
/**
 * A Map from directive name (e.g. `"$format"`) to its definition.
 * Passed through {@link PropResolutionContext} for runtime resolution.
 */
type DirectiveRegistry = Map<string, DirectiveDefinition>;
/**
 * Define a custom directive.
 *
 * This is an identity function that provides type checking and serves as
 * a documentation convention. Throws if the name collides with a built-in
 * prop expression key.
 */
declare function defineDirective<TSchema extends z.ZodType>(definition: DirectiveDefinition<TSchema>): DirectiveDefinition<TSchema>;
/**
 * Convert an array of directive definitions into a {@link DirectiveRegistry}.
 */
declare function createDirectiveRegistry(directives: DirectiveDefinition[]): DirectiveRegistry;
/**
 * Look up a custom directive for a plain-object value.
 *
 * Iterates the registry and checks whether the object contains a matching key.
 * Returns `undefined` when no match is found or when no registry is provided.
 *
 * This is only called **after** all built-in expressions (`$state`, `$cond`,
 * etc.) have been checked in `resolvePropValue`, so built-ins always take
 * precedence. {@link defineDirective} enforces this at registration time by
 * rejecting names that collide with built-in keys.
 */
declare function findDirective(value: Record<string, unknown>, directives?: DirectiveRegistry): DirectiveDefinition | undefined;

/**
 * A prop expression that resolves to a value based on state.
 *
 * - `{ $state: string }` reads a value from the global state model
 * - `{ $item: string }` reads a field from the current repeat item
 *    (relative path into the item object; use `""` for the whole item)
 * - `{ $index: true }` returns the current repeat array index. Uses `true`
 *    as a sentinel flag because the index is a scalar with no sub-path to
 *    navigate — unlike `$item` which needs a path into the item object.
 * - `{ $bindState: string }` two-way binding to a global state path —
 *    resolves to the value at the path (like `$state`) AND exposes the
 *    resolved path so the component can write back.
 * - `{ $bindItem: string }` two-way binding to a field on the current
 *    repeat item — resolves via `repeatBasePath + path` and exposes the
 *    absolute state path for write-back.
 * - `{ $cond, $then, $else }` conditionally picks a value
 * - `{ $computed: string, args?: Record<string, PropExpression> }` calls a
 *    registered function with resolved args and returns the result
 * - `{ $template: string }` interpolates `${/path}` and `${field}`
 *    references. Absolute paths (`${/path}`) resolve against the state
 *    model. Bare names (`${field}`) resolve against the current repeat
 *    item first, then fall back to the state model at `/<field>`.
 * - Any other value is a literal (passthrough)
 */
type PropExpression<T = unknown> = T | {
    $state: string;
} | {
    $item: string;
} | {
    $index: true;
} | {
    $bindState: string;
} | {
    $bindItem: string;
} | {
    $cond: VisibilityCondition;
    $then: PropExpression<T>;
    $else: PropExpression<T>;
} | {
    $computed: string;
    args?: Record<string, unknown>;
} | {
    $template: string;
};
/**
 * Function signature for `$computed` expressions.
 * Receives a record of resolved argument values and returns a computed result.
 */
type ComputedFunction = (args: Record<string, unknown>) => unknown;
/**
 * Context for resolving prop expressions.
 * Extends {@link VisibilityContext} with an optional `repeatBasePath` used
 * to resolve `$bindItem` paths to absolute state paths.
 */
interface PropResolutionContext extends VisibilityContext {
    /** Absolute state path to the current repeat item (e.g. "/todos/0"). Set inside repeat scopes. */
    repeatBasePath?: string;
    /** Named functions available for `$computed` expressions. */
    functions?: Record<string, ComputedFunction>;
    /** Custom directive registry for user-defined `$`-prefixed dynamic values. */
    directives?: DirectiveRegistry;
}
/**
 * Resolve a single prop value that may contain expressions.
 * Handles $state, $item, $index, $bindState, $bindItem, and $cond/$then/$else in a single pass.
 */
declare function resolvePropValue(value: unknown, ctx: PropResolutionContext): unknown;
/**
 * Resolve all prop values in an element's props object.
 * Returns a new props object with all expressions resolved.
 */
declare function resolveElementProps(props: Record<string, unknown>, ctx: PropResolutionContext): Record<string, unknown>;
/**
 * Scan an element's raw props for `$bindState` / `$bindItem` expressions
 * and return a map of prop name → resolved absolute state path.
 *
 * This is called **before** `resolveElementProps` so the component can
 * receive both the resolved value (in `props`) and the write-back path
 * (in `bindings`).
 *
 * @example
 * ```ts
 * const rawProps = { value: { $bindState: "/form/email" }, label: "Email" };
 * const bindings = resolveBindings(rawProps, ctx);
 * // bindings = { value: "/form/email" }
 * ```
 */
declare function resolveBindings(props: Record<string, unknown>, ctx: PropResolutionContext): Record<string, string> | undefined;
/**
 * Resolve a single action parameter value.
 *
 * Like {@link resolvePropValue} but with special handling for path-valued
 * params: `{ $item: "field" }` resolves to an **absolute state path**
 * (e.g. `/todos/0/field`) instead of the field's value, so the path can
 * be passed to `setState` / `pushState` / `removeState`.
 *
 * - `{ $item: "field" }` → absolute state path via `repeatBasePath`
 * - `{ $index: true }` → current repeat index (number)
 * - Everything else delegates to `resolvePropValue` ($state, $cond, literals).
 */
declare function resolveActionParam(value: unknown, ctx: PropResolutionContext): unknown;

/**
 * Emitted when an action begins executing. The same `id` will appear on a
 * matching {@link ActionSettleInfo} emitted when the action resolves or throws.
 */
interface ActionDispatchInfo {
    /** Stable dispatch id; paired with the matching `onSettle`. */
    id: string;
    /** Resolved action name. */
    name: string;
    /** Resolved params, if any. */
    params?: Record<string, unknown>;
    /** Wall clock time (ms) at dispatch. */
    at: number;
}
/**
 * Emitted after an action has resolved or thrown.
 */
interface ActionSettleInfo {
    /** Matches the `id` of the corresponding `onDispatch`. */
    id: string;
    /** Resolved action name. */
    name: string;
    /** `true` if the handler resolved, `false` if it threw. */
    ok: boolean;
    /** Wall clock time (ms) at settle. */
    at: number;
    /** Elapsed time in milliseconds. */
    durationMs: number;
    /** Return value from the handler, if any. */
    result?: unknown;
    /** Error if the handler threw. */
    error?: unknown;
}
/**
 * Observer for action lifecycle events. Either callback is optional.
 */
interface ActionObserver {
    onDispatch?: (evt: ActionDispatchInfo) => void;
    onSettle?: (evt: ActionSettleInfo) => void;
}
/**
 * Register an observer for action lifecycle events. Returns an unsubscribe
 * function. Intended for devtools integrations; safe to call from any
 * framework adapter.
 *
 * @example
 * ```ts
 * import { registerActionObserver } from "@json-render/core";
 * const unsub = registerActionObserver({
 *   onDispatch: (evt) => console.log("fired", evt.name),
 *   onSettle: (evt) => console.log("settled", evt.name, evt.durationMs),
 * });
 * ```
 */
declare function registerActionObserver(observer: ActionObserver): () => void;
/**
 * Emit a dispatch event to all registered observers. Called by framework
 * ActionProviders at the start of every action execution.
 *
 * Wrapped in try/catch per-observer so a buggy observer cannot interrupt
 * action execution.
 */
declare function notifyActionDispatch(evt: ActionDispatchInfo): void;
/**
 * Emit a settle event to all registered observers. Called by framework
 * ActionProviders after every action resolves or throws.
 */
declare function notifyActionSettle(evt: ActionSettleInfo): void;
declare function nextActionDispatchId(): string;

/**
 * Mark devtools as active. Returns a release function. Safe to call
 * multiple times (nested counter).
 *
 * @example
 * ```ts
 * // In a devtools adapter:
 * useEffect(() => markDevtoolsActive(), []);
 * ```
 */
declare function markDevtoolsActive(): () => void;
/**
 * True when at least one devtools adapter is mounted in the page.
 * Cheap to call; a plain integer comparison.
 */
declare function isDevtoolsActive(): boolean;
/**
 * Subscribe to changes in the devtools-active flag. Framework renderers
 * that need to re-render on state change (e.g. React's `useSyncExternalStore`)
 * subscribe here; most can just read `isDevtoolsActive()` on render.
 */
declare function subscribeDevtoolsActive(listener: () => void): () => void;

/**
 * Validation check definition
 */
interface ValidationCheck {
    /** Validation type (built-in or from catalog) */
    type: string;
    /** Additional arguments for the validation */
    args?: Record<string, DynamicValue>;
    /** Error message to display if check fails */
    message: string;
}
/**
 * Validation configuration for a field
 */
interface ValidationConfig {
    /** Array of checks to run */
    checks?: ValidationCheck[];
    /** When to run validation */
    validateOn?: "change" | "blur" | "submit";
    /** Condition for when validation is enabled */
    enabled?: VisibilityCondition;
}
/**
 * Schema for validation check
 */
declare const ValidationCheckSchema: z.ZodObject<{
    type: z.ZodString;
    args: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
        $state: z.ZodString;
    }, z.core.$strip>]>>>;
    message: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for validation config
 */
declare const ValidationConfigSchema: z.ZodObject<{
    checks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        args: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
            $state: z.ZodString;
        }, z.core.$strip>]>>>;
        message: z.ZodString;
    }, z.core.$strip>>>;
    validateOn: z.ZodOptional<z.ZodEnum<{
        change: "change";
        blur: "blur";
        submit: "submit";
    }>>;
    enabled: z.ZodOptional<z.ZodType<VisibilityCondition, unknown, z.core.$ZodTypeInternals<VisibilityCondition, unknown>>>;
}, z.core.$strip>;
/**
 * Validation function signature
 */
type ValidationFunction = (value: unknown, args?: Record<string, unknown>) => boolean;
/**
 * Validation function definition in catalog
 */
interface ValidationFunctionDefinition {
    /** The validation function */
    validate: ValidationFunction;
    /** Description for AI */
    description?: string;
}
/**
 * Built-in validation functions
 */
declare const builtInValidationFunctions: Record<string, ValidationFunction>;
/**
 * Validation result for a single check
 */
interface ValidationCheckResult {
    type: string;
    valid: boolean;
    message: string;
}
/**
 * Full validation result for a field
 */
interface ValidationResult {
    valid: boolean;
    errors: string[];
    checks: ValidationCheckResult[];
}
/**
 * Context for running validation
 */
interface ValidationContext {
    /** Current value to validate */
    value: unknown;
    /** Full data model for resolving paths */
    stateModel: StateModel;
    /** Custom validation functions from catalog */
    customFunctions?: Record<string, ValidationFunction>;
}
/**
 * Run a single validation check
 */
declare function runValidationCheck(check: ValidationCheck, ctx: ValidationContext): ValidationCheckResult;
/**
 * Run all validation checks for a field
 */
declare function runValidation(config: ValidationConfig, ctx: ValidationContext): ValidationResult;
/**
 * Helper to create validation checks
 */
declare const check: {
    required: (message?: string) => ValidationCheck;
    email: (message?: string) => ValidationCheck;
    minLength: (min: number, message?: string) => ValidationCheck;
    maxLength: (max: number, message?: string) => ValidationCheck;
    pattern: (pattern: string, message?: string) => ValidationCheck;
    min: (min: number, message?: string) => ValidationCheck;
    max: (max: number, message?: string) => ValidationCheck;
    url: (message?: string) => ValidationCheck;
    numeric: (message?: string) => ValidationCheck;
    matches: (otherPath: string, message?: string) => ValidationCheck;
    equalTo: (otherPath: string, message?: string) => ValidationCheck;
    lessThan: (otherPath: string, message?: string) => ValidationCheck;
    greaterThan: (otherPath: string, message?: string) => ValidationCheck;
    requiredIf: (fieldPath: string, message?: string) => ValidationCheck;
};

/**
 * Severity level for validation issues.
 */
type SpecIssueSeverity = "error" | "warning";
/**
 * A single validation issue found in a spec.
 */
interface SpecIssue {
    /** Severity: errors should be fixed, warnings are informational */
    severity: SpecIssueSeverity;
    /** Human-readable description of the issue */
    message: string;
    /** The element key where the issue was found (if applicable) */
    elementKey?: string;
    /** Machine-readable issue code for programmatic handling */
    code: "missing_root" | "root_not_found" | "missing_child" | "invalid_visible" | "repeat_without_children" | "repeat_item_outside_scope" | "repeat_state_mismatch" | "visible_in_props" | "orphaned_element" | "empty_spec" | "on_in_props" | "repeat_in_props" | "watch_in_props";
}
/**
 * Result of spec structural validation.
 */
interface SpecValidationIssues {
    /** Whether the spec passed validation (no errors; warnings are OK) */
    valid: boolean;
    /** List of issues found */
    issues: SpecIssue[];
}
/**
 * Options for validateSpec.
 */
interface ValidateSpecOptions {
    /**
     * Whether to check for orphaned elements (elements not reachable from root).
     * Defaults to false since orphans are harmless (just unused).
     */
    checkOrphans?: boolean;
}
/**
 * Validate a spec for structural integrity.
 *
 * Checks for common AI-generation errors:
 * - Missing or empty root
 * - Root element not found in elements map
 * - Children referencing non-existent elements
 * - `visible` placed inside `props` instead of on the element
 * - Orphaned elements (optional)
 *
 * @example
 * ```ts
 * const result = validateSpec(spec);
 * if (!result.valid) {
 *   console.log("Spec errors:", result.issues);
 * }
 * ```
 */
declare function validateSpec(spec: Spec, options?: ValidateSpecOptions): SpecValidationIssues;
/**
 * Auto-fix common spec issues in-place and return a corrected copy.
 *
 * Currently fixes:
 * - `visible` inside `props` → moved to element level
 * - `on` inside `props` → moved to element level
 * - `repeat` inside `props` → moved to element level
 *
 * Returns the fixed spec and a list of fixes applied.
 */
interface SpecFix {
    message: string;
    /**
     * Lossy fixes change what renders (e.g. pruning a dangling child
     * reference); lossless fixes only relocate misplaced fields. Callers with a
     * repair loop should prefer re-prompting over accepting lossy fixes, and
     * use the lossy-fixed spec as a last resort.
     */
    lossy: boolean;
}
interface AutoFixOptions {
    /**
     * Apply lossy fixes (content pruning). Default true. Callers with a repair
     * loop should pass false while retries remain so the model regenerates the
     * missing content, then true as a last resort.
     */
    lossy?: boolean;
}
declare function autoFixSpec(spec: Spec, options?: AutoFixOptions): {
    spec: Spec;
    fixes: string[];
    /** Structured fix records; fixes is the plain-message projection. */
    fixDetails: SpecFix[];
};
/**
 * Format validation issues into a human-readable string suitable for
 * inclusion in a repair prompt sent back to the AI.
 */
declare function formatSpecIssues(issues: SpecIssue[]): string;

/**
 * Edit mode for modifying an existing spec.
 *
 * - `"patch"` — RFC 6902 JSON Patch. One operation per line.
 * - `"merge"` — RFC 7396 JSON Merge Patch. Partial object deep-merged; `null` deletes.
 * - `"diff"`  — Unified diff (POSIX). Line-level text edits against the serialized spec.
 */
type EditMode = "patch" | "merge" | "diff";
interface EditConfig {
    /** Which edit modes are enabled. When >1, the AI chooses per edit. */
    modes: EditMode[];
}
/**
 * Generate the prompt section describing available edit modes.
 * Only documents the modes that are enabled.
 */
declare function buildEditInstructions(config: EditConfig | undefined, format: "json" | "yaml"): string;
declare function isNonEmptySpec(spec: unknown): spec is Spec;
interface BuildEditUserPromptOptions {
    prompt: string;
    currentSpec?: Spec | null;
    config?: EditConfig;
    format: "json" | "yaml";
    maxPromptLength?: number;
    /** Serialise the spec. Defaults to JSON.stringify for json, must be provided for yaml. */
    serializer?: (spec: Spec) => string;
}
/**
 * Generate the user prompt for edits, including the current spec
 * (with line numbers when diff mode is enabled) and mode instructions.
 */
declare function buildEditUserPrompt(options: BuildEditUserPromptOptions): string;

/**
 * Schema builder primitives
 */
interface SchemaBuilder {
    /** String type */
    string(): SchemaType<"string">;
    /** Number type */
    number(): SchemaType<"number">;
    /** Boolean type */
    boolean(): SchemaType<"boolean">;
    /** Array of type */
    array<T extends SchemaType>(item: T): SchemaType<"array", T>;
    /** Object with shape */
    object<T extends Record<string, SchemaType>>(shape: T): SchemaType<"object", T>;
    /** Record/map with value type */
    record<T extends SchemaType>(value: T): SchemaType<"record", T>;
    /** Any type */
    any(): SchemaType<"any">;
    /** Placeholder for user-provided Zod schema */
    zod(): SchemaType<"zod">;
    /** Reference to catalog key (e.g., 'catalog.components') */
    ref(path: string): SchemaType<"ref", string>;
    /** Props from referenced catalog entry */
    propsOf(path: string): SchemaType<"propsOf", string>;
    /** Map of named entries with shared shape */
    map<T extends Record<string, SchemaType>>(entryShape: T): SchemaType<"map", T>;
    /** Optional modifier */
    optional(): {
        optional: true;
    };
}
/**
 * Schema type representation
 */
interface SchemaType<TKind extends string = string, TInner = unknown> {
    kind: TKind;
    inner?: TInner;
    optional?: boolean;
}
/**
 * Schema definition shape
 */
interface SchemaDefinition<TSpec extends SchemaType = SchemaType, TCatalog extends SchemaType = SchemaType> {
    /** What the AI-generated spec looks like */
    spec: TSpec;
    /** What the catalog must provide */
    catalog: TCatalog;
}
/**
 * Schema instance with methods
 */
interface Schema<TDef extends SchemaDefinition = SchemaDefinition> {
    /** The schema definition */
    readonly definition: TDef;
    /** Custom prompt template for this schema */
    readonly promptTemplate?: PromptTemplate;
    /** Default rules baked into the schema (injected before customRules) */
    readonly defaultRules?: string[];
    /** Built-in actions always available at runtime (injected into prompts automatically) */
    readonly builtInActions?: BuiltInAction[];
    /** Create a catalog from this schema */
    createCatalog<TCatalog extends InferCatalogInput<TDef["catalog"]>>(catalog: TCatalog): Catalog<TDef, TCatalog>;
}
/**
 * Catalog instance with methods
 */
interface Catalog<TDef extends SchemaDefinition = SchemaDefinition, TCatalog = unknown> {
    /** The schema this catalog is based on */
    readonly schema: Schema<TDef>;
    /** The catalog data */
    readonly data: TCatalog;
    /** Component names */
    readonly componentNames: string[];
    /** Action names */
    readonly actionNames: string[];
    /** Generate system prompt for AI */
    prompt(options?: PromptOptions): string;
    /** Export as JSON Schema for structured outputs */
    jsonSchema(options?: JsonSchemaOptions): object;
    /** Validate a spec against this catalog */
    validate(spec: unknown): SpecValidationResult<InferSpec<TDef, TCatalog>>;
    /** Get the Zod schema for the spec */
    zodSchema(): z.ZodType<InferSpec<TDef, TCatalog>>;
    /** Type helper for the spec type */
    readonly _specType: InferSpec<TDef, TCatalog>;
}
/**
 * Options for JSON Schema export
 */
interface JsonSchemaOptions {
    /**
     * When true, produces a strict JSON Schema subset compatible with
     * LLM structured output APIs (OpenAI, Google Gemini, Anthropic, etc.).
     * This ensures:
     * - `additionalProperties: false` on every object
     * - All object properties listed in `required` (optionals use nullable types)
     * - Record/map types converted to fixed-key objects
     *
     * **Limitation:** Record types (dynamic-key maps) cannot be represented in
     * strict JSON Schema because `additionalProperties` must be `false`. They
     * are emitted as `{ type: "object", properties: {}, additionalProperties: false }`.
     * The LLM prompt (via `catalog.prompt()`) still describes the full structure,
     * so the model can produce valid output even though the JSON Schema for
     * record entries is opaque.
     */
    strict?: boolean;
}
/**
 * Prompt generation options
 */
interface PromptOptions {
    /** Custom system message intro */
    system?: string;
    /** Additional rules to append */
    customRules?: string[];
    /**
     * Output mode for the generated prompt.
     *
     * - `"standalone"` (default): The LLM should output only JSONL patches (no prose).
     * - `"inline"`: The LLM should respond conversationally first, then output JSONL patches.
     *   Includes rules about interleaving text with JSONL and not wrapping in code fences.
     *
     * @deprecated `"generate"` — use `"standalone"` instead.
     * @deprecated `"chat"` — use `"inline"` instead.
     */
    mode?: "standalone" | "inline" | "generate" | "chat";
    /** Edit modes to document in the system prompt. Default: `["patch"]`. */
    editModes?: EditMode[];
    /**
     * Custom directives to include in the system prompt.
     * Each directive's schema is auto-described; the optional `description`
     * field adds behavioral context. Pass the same array used at runtime.
     */
    directives?: DirectiveDefinition[];
}
/**
 * Context provided to prompt templates
 */
interface PromptContext<TCatalog = unknown> {
    /** The catalog data */
    catalog: TCatalog;
    /** Component names from the catalog */
    componentNames: string[];
    /** Action names from the catalog (if any) */
    actionNames: string[];
    /** Prompt options provided by the user */
    options: PromptOptions;
    /** Helper to format a Zod type as a human-readable string */
    formatZodType: (schema: z.ZodType) => string;
}
/**
 * Prompt template function type
 */
type PromptTemplate<TCatalog = unknown> = (context: PromptContext<TCatalog>) => string;
/**
 * A built-in action that is always available regardless of catalog configuration.
 * These are handled by the runtime (e.g. ActionProvider) and injected into prompts
 * automatically so the LLM knows about them.
 */
interface BuiltInAction {
    /** Action name (e.g. "setState") */
    name: string;
    /** Human-readable description for the LLM */
    description: string;
}
/**
 * Schema options
 */
interface SchemaOptions<TCatalog = unknown> {
    /** Custom prompt template for this schema */
    promptTemplate?: PromptTemplate<TCatalog>;
    /** Default rules baked into the schema (injected before customRules in prompts) */
    defaultRules?: string[];
    /**
     * Built-in actions that are always available regardless of catalog configuration.
     * These are injected into prompts automatically so the LLM knows about them,
     * but they don't require handlers in defineRegistry because the runtime
     * (e.g. ActionProvider) handles them directly.
     */
    builtInActions?: BuiltInAction[];
}
/**
 * Spec validation result
 */
interface SpecValidationResult<T> {
    success: boolean;
    data?: T;
    error?: z.ZodError;
}
/**
 * Extract the components map type from a catalog
 * @example type Components = InferCatalogComponents<typeof myCatalog>;
 */
type InferCatalogComponents<C extends Catalog> = C extends Catalog<SchemaDefinition, infer TCatalog> ? TCatalog extends {
    components: infer Comps;
} ? Comps : never : never;
/**
 * Extract the actions map type from a catalog
 * @example type Actions = InferCatalogActions<typeof myCatalog>;
 */
type InferCatalogActions<C extends Catalog> = C extends Catalog<SchemaDefinition, infer TCatalog> ? TCatalog extends {
    actions: infer Acts;
} ? Acts : never : never;
/**
 * Infer component props from a catalog by component name
 * @example type ButtonProps = InferComponentProps<typeof myCatalog, 'Button'>;
 */
type InferComponentProps<C extends Catalog, K extends keyof InferCatalogComponents<C>> = InferCatalogComponents<C>[K] extends {
    props: z.ZodType<infer P>;
} ? P : never;
/**
 * Infer action params from a catalog by action name
 * @example type ViewCustomersParams = InferActionParams<typeof myCatalog, 'viewCustomers'>;
 */
type InferActionParams<C extends Catalog, K extends keyof InferCatalogActions<C>> = InferCatalogActions<C>[K] extends {
    params: z.ZodType<infer P>;
} ? P : never;
type InferCatalogInput<T> = T extends SchemaType<"object", infer Shape> ? {
    [K in keyof Shape]: InferCatalogField<Shape[K]>;
} : never;
type InferCatalogField<T> = T extends SchemaType<"map", infer EntryShape> ? Record<string, InferMapEntryRequired<EntryShape> & Partial<InferMapEntryOptional<EntryShape>>> : T extends SchemaType<"zod"> ? z.ZodType : T extends SchemaType<"string"> ? string : T extends SchemaType<"number"> ? number : T extends SchemaType<"boolean"> ? boolean : T extends SchemaType<"array", infer Item> ? InferCatalogField<Item>[] : T extends SchemaType<"object", infer Shape> ? {
    [K in keyof Shape]: InferCatalogField<Shape[K]>;
} : unknown;
type InferMapEntryRequired<T> = {
    [K in keyof T as K extends "props" ? K : never]: InferMapEntryField<T[K]>;
};
type InferMapEntryOptional<T> = {
    [K in keyof T as K extends "props" ? never : K]: InferMapEntryField<T[K]>;
};
type InferMapEntryField<T> = T extends SchemaType<"zod"> ? z.ZodType : T extends SchemaType<"string"> ? string : T extends SchemaType<"number"> ? number : T extends SchemaType<"boolean"> ? boolean : T extends SchemaType<"array", infer Item> ? InferMapEntryField<Item>[] : T extends SchemaType<"object", infer Shape> ? {
    [K in keyof Shape]: InferMapEntryField<Shape[K]>;
} : unknown;
type InferSpec<TDef extends SchemaDefinition, TCatalog> = TDef extends {
    spec: SchemaType<"object", infer Shape>;
} ? InferSpecObject<Shape, TCatalog> : unknown;
type InferSpecObject<Shape, TCatalog> = {
    [K in keyof Shape as Shape[K] extends {
        optional: true;
    } ? never : K]: InferSpecField<Shape[K], TCatalog>;
} & {
    [K in keyof Shape as Shape[K] extends {
        optional: true;
    } ? K : never]?: InferSpecField<Shape[K], TCatalog>;
};
type InferSpecField<T, TCatalog> = T extends SchemaType<"string"> ? string : T extends SchemaType<"number"> ? number : T extends SchemaType<"boolean"> ? boolean : T extends SchemaType<"array", infer Item> ? InferSpecField<Item, TCatalog>[] : T extends SchemaType<"object", infer Shape> ? InferSpecObject<Shape, TCatalog> : T extends SchemaType<"record", infer Value> ? Record<string, InferSpecField<Value, TCatalog>> : T extends SchemaType<"ref", infer Path> ? InferRefType<Path, TCatalog> : T extends SchemaType<"propsOf", infer Path> ? InferPropsOfType<Path, TCatalog> : T extends SchemaType<"any"> ? any : unknown;
type InferRefType<Path, TCatalog> = Path extends "catalog.components" ? TCatalog extends {
    components: infer C;
} ? keyof C : string : Path extends "catalog.actions" ? TCatalog extends {
    actions: infer A;
} ? keyof A : string : string;
type InferPropsOfType<Path, TCatalog> = Path extends "catalog.components" ? TCatalog extends {
    components: infer C;
} ? C extends Record<string, {
    props: z.ZodType<infer P>;
}> ? P : Record<string, unknown> : Record<string, unknown> : Record<string, unknown>;
/**
 * Define a schema using the builder pattern
 */
declare function defineSchema<TDef extends SchemaDefinition>(builder: (s: SchemaBuilder) => TDef, options?: SchemaOptions): Schema<TDef>;
/**
 * Shorthand: Define a catalog directly from a schema
 */
declare function defineCatalog<TDef extends SchemaDefinition, TCatalog extends InferCatalogInput<TDef["catalog"]>>(schema: Schema<TDef>, catalog: TCatalog): Catalog<TDef, TCatalog>;

/**
 * Options for building a user prompt.
 */
interface UserPromptOptions {
    /** The user's text prompt */
    prompt: string;
    /** Existing spec to refine (triggers patch-only mode) */
    currentSpec?: Spec | null;
    /** Runtime state context to include */
    state?: Record<string, unknown> | null;
    /** Maximum length for the user's text prompt (applied before wrapping) */
    maxPromptLength?: number;
    /** Edit modes to offer when refining an existing spec. Default: `["patch"]`. */
    editModes?: EditMode[];
    /** Wire format. Default: `"json"`. */
    format?: "json" | "yaml";
    /** Serialise the spec for edits. Defaults to JSON.stringify for json, must be provided for yaml. */
    serializer?: (spec: Spec) => string;
}
/**
 * Build a user prompt for AI generation.
 *
 * Handles common patterns that every consuming app needs:
 * - Truncating the user's prompt to a max length
 * - Including the current spec for refinement (edit mode)
 * - Including runtime state context
 *
 * @example
 * ```ts
 * // Fresh generation
 * buildUserPrompt({ prompt: "create a todo app" })
 *
 * // Refinement with existing spec
 * buildUserPrompt({ prompt: "add a dark mode toggle", currentSpec: spec })
 *
 * // With multiple edit modes
 * buildUserPrompt({ prompt: "change title", currentSpec: spec, editModes: ["patch", "merge"] })
 * ```
 */
declare function buildUserPrompt(options: UserPromptOptions): string;

/**
 * Deep-merge `patch` into `base`, returning a new object.
 *
 * Semantics (RFC 7396 JSON Merge Patch):
 * - `null` values in `patch` delete the corresponding key from `base`
 * - Arrays in `patch` replace (not concat) the corresponding array in `base`
 * - Plain objects recurse
 * - All other values replace
 *
 * Neither `base` nor `patch` is mutated.
 */
declare function deepMergeSpec(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown>;

/**
 * Produce RFC 6902 JSON Patch operations that transform `oldObj` into `newObj`.
 *
 * - New keys → `add`
 * - Changed scalar/array values → `replace`
 * - Removed keys → `remove`
 * - Arrays are compared shallowly and replaced atomically (not element-diffed)
 * - Plain objects recurse
 */
declare function diffToPatches(oldObj: Record<string, unknown>, newObj: Record<string, unknown>, basePath?: string): JsonPatch[];

/** Experimental: may change in any release. A catalog using the flat Spec format. */
interface Experimental_CompositionCatalog {
    data: {
        components: Record<string, {
            props: z.ZodType;
            slots?: readonly string[];
            events?: readonly string[];
        }>;
        actions?: Record<string, {
            params?: z.ZodType;
        }>;
    };
    schema?: {
        builtInActions?: readonly {
            name: string;
        }[];
    };
    validate(spec: unknown): {
        success: boolean;
    };
}
/** One app-owned element recipe. The evaluator cannot modify its props or bindings. */
interface Experimental_CompositionCandidate {
    id: string;
    description: string;
    element: Pick<UIElement, "type" | "props" | "on" | "visible">;
    /** Whether this candidate can be the root. Defaults to true. */
    root?: boolean;
    /** Defaults to one. Reusable layout elements can opt into a larger count. */
    maxUses?: number;
    /** Candidates sharing a resource are mutually exclusive. */
    resource?: string;
}
interface Experimental_ChoiceQuestion {
    type: "choice";
    instructions: string;
    criteria: Record<string, string>;
}
interface Experimental_CompositionEvaluation {
    answers: Record<string, {
        choice: string;
        confidence?: number;
    }>;
    usage?: {
        inputTokens?: number;
    };
}
/** Custom adapters must return one of each question's offered criteria keys. */
type Experimental_CompositionEvaluator = (request: {
    state: Record<string, unknown>;
    questions: Record<string, Experimental_ChoiceQuestion>;
    signal: AbortSignal;
}) => Promise<Experimental_CompositionEvaluation>;
interface Experimental_CompositionStep {
    index: number;
    choice: string;
    description: string;
    parent: string | null;
    slot: string | null;
    confidence: number | null;
    parentConfidence: number | null;
    elapsedMs: number;
    inputTokens: number | null;
    /** Independent answers from a batched selection or layout evaluation. */
    answers?: Experimental_CompositionEvaluation["answers"];
}
type Experimental_CompositionEvent = {
    type: "step";
    spec: Spec;
    step: Experimental_CompositionStep;
} | {
    type: "complete";
    spec: Spec | null;
    steps: Experimental_CompositionStep[];
    elapsedMs: number;
    inputTokens: number | null;
    stopReason: "finish" | "limit" | "unavailable";
};
interface Experimental_ComposeSpecOptions {
    catalog: Experimental_CompositionCatalog;
    candidates: readonly Experimental_CompositionCandidate[];
    prompt: string;
    evaluate: Experimental_CompositionEvaluator;
    /** New trees use batched selection/layout by default. Edits remain sequential. */
    strategy?: "batch" | "sequential";
    /** Element budget for batched creation, including the root. Default: 32. */
    maxElements?: number;
    /** Edit an existing tree. Cloned and validated before evaluation. */
    initialSpec?: Spec;
    /** Descriptions explicitly shared for existing elements, keyed by element ID. */
    elementDescriptions?: Record<string, string>;
    /** Included in the spec, never sent to the evaluator. Overrides initialSpec.state. */
    initialState?: Record<string, unknown>;
    /** Additional app context explicitly shared with the evaluator. */
    context?: Record<string, unknown>;
    signal?: AbortSignal;
    /** Evaluation budget, including sequential terminal decisions. Default: 32. */
    maxSteps?: number;
    /** Root has depth one. Default: 8. */
    maxDepth?: number;
    /** App-specific guidance appended to the construction instructions. */
    instructions?: {
        root?: string;
        next?: string;
        parent?: string;
    };
}
/**
 * Experimental catalog-constrained composition. Streams detached Spec snapshots.
 * Throws on invalid configuration, evaluator output, provider errors, or abort.
 * Actions are copied into the spec; they are never executed by the composer.
 */
declare function experimental_composeSpec(options: Experimental_ComposeSpecOptions): AsyncGenerator<Experimental_CompositionEvent>;

interface Experimental_EvaluatorOptions {
    /** Server-side Vercel AI Gateway key. Never expose this in browser code. */
    apiKey: string;
    /** Gateway evaluation model identifier, for example typesafe-ai/jev. */
    model: string;
    /** Per-evaluation timeout in milliseconds. Default: 10000. */
    timeoutMs?: number;
    fetch?: typeof globalThis.fetch;
}
/**
 * Experimental server-side choice evaluator using Vercel AI Gateway's v4 evaluation
 * transport. No AI SDK provider constructor or additional dependency is needed.
 */
declare function experimental_createEvaluator(options: Experimental_EvaluatorOptions): Experimental_CompositionEvaluator;

export { type ActionDispatchInfo, type ActionObserver, type ActionSettleInfo, AndCondition, type BuildEditUserPromptOptions, type BuiltInAction, type Catalog, type ComputedFunction, type DirectiveDefinition, type DirectiveRegistry, DynamicValue, type EditConfig, type EditMode, type Experimental_ChoiceQuestion, type Experimental_ComposeSpecOptions, type Experimental_CompositionCandidate, type Experimental_CompositionCatalog, type Experimental_CompositionEvaluation, type Experimental_CompositionEvaluator, type Experimental_CompositionEvent, type Experimental_CompositionStep, type Experimental_EvaluatorOptions, type InferActionParams, type InferCatalogActions, type InferCatalogComponents, type InferCatalogInput, type InferComponentProps, type InferSpec, JsonPatch, type JsonSchemaOptions, OrCondition, type PromptContext, type PromptOptions, type PromptTemplate, type PropExpression, type PropResolutionContext, type Schema, type SchemaBuilder, type SchemaDefinition, type SchemaOptions, type SchemaType, Spec, type SpecIssue, type SpecIssueSeverity, type SpecValidationIssues, type SpecValidationResult, StateCondition, StateModel, UIElement, type UserPromptOptions, type ValidateSpecOptions, type ValidationCheck, type ValidationCheckResult, ValidationCheckSchema, type ValidationConfig, ValidationConfigSchema, type ValidationContext, type ValidationFunction, type ValidationFunctionDefinition, type ValidationResult, VisibilityCondition, VisibilityConditionSchema, VisibilityConditionStrictSchema, type VisibilityContext, autoFixSpec, buildEditInstructions, buildEditUserPrompt, buildUserPrompt, builtInValidationFunctions, check, conditionUsesItemScope, createDirectiveRegistry, deepMergeSpec, defineCatalog, defineDirective, defineSchema, diffToPatches, evaluateVisibility, experimental_composeSpec, experimental_createEvaluator, findDirective, formatSpecIssues, isDevtoolsActive, isNonEmptySpec, markDevtoolsActive, nextActionDispatchId, notifyActionDispatch, notifyActionSettle, registerActionObserver, resolveActionParam, resolveBindings, resolveElementProps, resolvePropValue, runValidation, runValidationCheck, splitRepeatVisibility, subscribeDevtoolsActive, validateSpec, visibility };
