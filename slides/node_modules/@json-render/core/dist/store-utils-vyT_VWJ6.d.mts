import { z } from 'zod';

/**
 * Confirmation dialog configuration
 */
interface ActionConfirm {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "danger";
}
/**
 * Action success handler
 */
type ActionOnSuccess = {
    navigate: string;
} | {
    set: Record<string, unknown>;
} | {
    action: string;
    params?: Record<string, DynamicValue>;
};
/**
 * Action error handler
 */
type ActionOnError = {
    set: Record<string, unknown>;
} | {
    action: string;
    params?: Record<string, DynamicValue>;
};
/**
 * Action binding — maps an event to an action invocation.
 *
 * Used inside the `on` field of a UIElement:
 * ```json
 * { "on": { "press": { "action": "setState", "params": { "statePath": "/x", "value": 1 } } } }
 * ```
 */
interface ActionBinding {
    /** Action name (must be in catalog) */
    action: string;
    /** Parameters to pass to the action handler */
    params?: Record<string, DynamicValue>;
    /** Confirmation dialog before execution */
    confirm?: ActionConfirm;
    /** Handler after successful execution */
    onSuccess?: ActionOnSuccess;
    /** Handler after failed execution */
    onError?: ActionOnError;
    /** Whether to prevent default browser behavior (e.g. navigation on links) */
    preventDefault?: boolean;
}
/**
 * @deprecated Use ActionBinding instead
 */
type Action = ActionBinding;
/**
 * Schema for action confirmation
 */
declare const ActionConfirmSchema: z.ZodObject<{
    title: z.ZodString;
    message: z.ZodString;
    confirmLabel: z.ZodOptional<z.ZodString>;
    cancelLabel: z.ZodOptional<z.ZodString>;
    variant: z.ZodOptional<z.ZodEnum<{
        default: "default";
        danger: "danger";
    }>>;
}, z.core.$strip>;
/**
 * Schema for success handlers
 */
declare const ActionOnSuccessSchema: z.ZodUnion<readonly [z.ZodObject<{
    navigate: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    set: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
        $state: z.ZodString;
    }, z.core.$strip>]>>>;
}, z.core.$strip>]>;
/**
 * Schema for error handlers
 */
declare const ActionOnErrorSchema: z.ZodUnion<readonly [z.ZodObject<{
    set: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
        $state: z.ZodString;
    }, z.core.$strip>]>>>;
}, z.core.$strip>]>;
/**
 * Full action binding schema
 */
declare const ActionBindingSchema: z.ZodObject<{
    action: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
        $state: z.ZodString;
    }, z.core.$strip>]>>>;
    confirm: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        message: z.ZodString;
        confirmLabel: z.ZodOptional<z.ZodString>;
        cancelLabel: z.ZodOptional<z.ZodString>;
        variant: z.ZodOptional<z.ZodEnum<{
            default: "default";
            danger: "danger";
        }>>;
    }, z.core.$strip>>;
    onSuccess: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        navigate: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        set: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>, z.ZodObject<{
        action: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
            $state: z.ZodString;
        }, z.core.$strip>]>>>;
    }, z.core.$strip>]>>;
    onError: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        set: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>, z.ZodObject<{
        action: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
            $state: z.ZodString;
        }, z.core.$strip>]>>>;
    }, z.core.$strip>]>>;
    preventDefault: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * @deprecated Use ActionBindingSchema instead
 */
declare const ActionSchema: z.ZodObject<{
    action: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
        $state: z.ZodString;
    }, z.core.$strip>]>>>;
    confirm: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        message: z.ZodString;
        confirmLabel: z.ZodOptional<z.ZodString>;
        cancelLabel: z.ZodOptional<z.ZodString>;
        variant: z.ZodOptional<z.ZodEnum<{
            default: "default";
            danger: "danger";
        }>>;
    }, z.core.$strip>>;
    onSuccess: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        navigate: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        set: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>, z.ZodObject<{
        action: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
            $state: z.ZodString;
        }, z.core.$strip>]>>>;
    }, z.core.$strip>]>>;
    onError: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        set: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>, z.ZodObject<{
        action: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
            $state: z.ZodString;
        }, z.core.$strip>]>>>;
    }, z.core.$strip>]>>;
    preventDefault: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Action handler function signature
 */
type ActionHandler<TParams = Record<string, unknown>, TResult = unknown> = (params: TParams) => Promise<TResult> | TResult;
/**
 * Action definition in catalog
 */
interface ActionDefinition<TParams = Record<string, unknown>> {
    /** Zod schema for params validation */
    params?: z.ZodType<TParams>;
    /** Description for AI */
    description?: string;
}
/**
 * Resolved action with all dynamic values resolved
 */
interface ResolvedAction {
    action: string;
    params: Record<string, unknown>;
    confirm?: ActionConfirm;
    onSuccess?: ActionOnSuccess;
    onError?: ActionOnError;
}
/**
 * Resolve all dynamic values in an action binding
 */
declare function resolveAction(binding: ActionBinding, stateModel: StateModel): ResolvedAction;
/**
 * Interpolate ${path} expressions in a string
 */
declare function interpolateString(template: string, stateModel: StateModel): string;
/**
 * Context for action execution
 */
interface ActionExecutionContext {
    /** The resolved action */
    action: ResolvedAction;
    /** The action handler from the host */
    handler: ActionHandler;
    /** Function to update state model */
    setState: (path: string, value: unknown) => void;
    /** Function to navigate */
    navigate?: (path: string) => void;
    /** Function to execute another action */
    executeAction?: (binding: ActionBinding) => Promise<void>;
}
/**
 * Execute an action with all callbacks
 */
declare function executeAction(ctx: ActionExecutionContext): Promise<void>;
/**
 * Helper to create action bindings
 */
declare const actionBinding: {
    /** Create a simple action binding */
    simple: (actionName: string, params?: Record<string, DynamicValue>) => ActionBinding;
    /** Create an action binding with confirmation */
    withConfirm: (actionName: string, confirm: ActionConfirm, params?: Record<string, DynamicValue>) => ActionBinding;
    /** Create an action binding with success handler */
    withSuccess: (actionName: string, onSuccess: ActionOnSuccess, params?: Record<string, DynamicValue>) => ActionBinding;
};
/**
 * @deprecated Use actionBinding instead
 */
declare const action: {
    /** Create a simple action binding */
    simple: (actionName: string, params?: Record<string, DynamicValue>) => ActionBinding;
    /** Create an action binding with confirmation */
    withConfirm: (actionName: string, confirm: ActionConfirm, params?: Record<string, DynamicValue>) => ActionBinding;
    /** Create an action binding with success handler */
    withSuccess: (actionName: string, onSuccess: ActionOnSuccess, params?: Record<string, DynamicValue>) => ActionBinding;
};

/**
 * Dynamic value - can be a literal or a `{ $state }` reference to the state model.
 *
 * Used in action params and validation args where values can either be
 * hardcoded or resolved from state at runtime.
 */
type DynamicValue<T = unknown> = T | {
    $state: string;
};
/**
 * Dynamic string value
 */
type DynamicString = DynamicValue<string>;
/**
 * Dynamic number value
 */
type DynamicNumber = DynamicValue<number>;
/**
 * Dynamic boolean value
 */
type DynamicBoolean = DynamicValue<boolean>;
/**
 * Zod schema for dynamic values
 */
declare const DynamicValueSchema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull, z.ZodObject<{
    $state: z.ZodString;
}, z.core.$strip>]>;
declare const DynamicStringSchema: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    $state: z.ZodString;
}, z.core.$strip>]>;
declare const DynamicNumberSchema: z.ZodUnion<readonly [z.ZodNumber, z.ZodObject<{
    $state: z.ZodString;
}, z.core.$strip>]>;
declare const DynamicBooleanSchema: z.ZodUnion<readonly [z.ZodBoolean, z.ZodObject<{
    $state: z.ZodString;
}, z.core.$strip>]>;
type RepeatStatePath = string | {
    $item: string;
};
/**
 * Base UI element structure for v2
 */
interface UIElement<T extends string = string, P = Record<string, unknown>> {
    /** Component type from the catalog */
    type: T;
    /** Component props */
    props: P;
    /** Child element keys (flat structure) */
    children?: string[];
    slots?: Record<string, string[]>;
    /** Visibility condition */
    visible?: VisibilityCondition;
    /** Event bindings — maps event names to action bindings */
    on?: Record<string, ActionBinding | ActionBinding[]>;
    /** Repeat children once per item in a state array */
    repeat?: {
        statePath: RepeatStatePath;
        key?: string;
    };
    /**
     * State watchers — maps JSON Pointer state paths to action bindings.
     * When the value at a watched path changes, the bound actions fire.
     * Useful for cascading dependencies (e.g. country → city option loading).
     */
    watch?: Record<string, ActionBinding | ActionBinding[]>;
}
/**
 * Element with key and parentKey for use with flatToTree.
 * When elements are in an array (not a keyed map), key and parentKey
 * are needed to establish identity and parent-child relationships.
 */
interface FlatElement<T extends string = string, P = Record<string, unknown>> extends UIElement<T, P> {
    /** Unique key identifying this element */
    key: string;
    /** Parent element key (null for root) */
    parentKey?: string | null;
}
/**
 * Shared comparison operators for visibility conditions.
 *
 * Use at most ONE comparison operator per condition. If multiple are
 * provided, only the first matching one is evaluated (precedence:
 * eq > neq > gt > gte > lt > lte). With no operator, truthiness is checked.
 *
 * `not` inverts the final result of whichever operator (or truthiness
 * check) is used.
 */
type ComparisonOperators = {
    eq?: unknown;
    neq?: unknown;
    gt?: number | {
        $state: string;
    };
    gte?: number | {
        $state: string;
    };
    lt?: number | {
        $state: string;
    };
    lte?: number | {
        $state: string;
    };
    not?: true;
};
/**
 * A single state-based condition.
 * Resolves `$state` to a value from the state model, then applies the operator.
 * Without an operator, checks truthiness.
 *
 * When `not` is `true`, the result of the entire condition is inverted.
 * For example `{ $state: "/count", gt: 5, not: true }` means "NOT greater than 5".
 */
type StateCondition = {
    $state: string;
} & ComparisonOperators;
/**
 * A condition that resolves `$item` to a field on the current repeat item.
 * Only meaningful inside a `repeat` scope.
 *
 * Use `""` to reference the whole item, or `"field"` for a specific field.
 */
type ItemCondition = {
    $item: string;
} & ComparisonOperators;
/**
 * A condition that resolves `$index` to the current repeat array index.
 * Only meaningful inside a `repeat` scope.
 */
type IndexCondition = {
    $index: true;
} & ComparisonOperators;
/** A single visibility condition (state, item, or index). */
type SingleCondition = StateCondition | ItemCondition | IndexCondition;
/**
 * AND wrapper — all child conditions must be true.
 * This is the explicit form of the implicit array AND (`SingleCondition[]`).
 * Unlike the implicit form, `$and` supports nested `$or` and `$and` conditions.
 */
type AndCondition = {
    $and: VisibilityCondition[];
};
/**
 * OR wrapper — at least one child condition must be true.
 */
type OrCondition = {
    $or: VisibilityCondition[];
};
/**
 * Visibility condition types.
 * - `boolean` — always/never
 * - `SingleCondition` — single condition (`$state`, `$item`, or `$index`)
 * - `SingleCondition[]` — implicit AND (all must be true)
 * - `AndCondition` — `{ $and: [...] }`, explicit AND (all must be true)
 * - `OrCondition` — `{ $or: [...] }`, at least one must be true
 */
type VisibilityCondition = boolean | SingleCondition | SingleCondition[] | AndCondition | OrCondition;
/**
 * Flat UI tree structure (optimized for LLM generation)
 */
interface Spec {
    /** Root element key */
    root: string;
    /** Flat map of elements by key */
    elements: Record<string, UIElement>;
    /** Optional initial state to seed the state model.
     *  Components using statePath will read from / write to this state. */
    state?: Record<string, unknown>;
}
/**
 * State model type
 */
type StateModel = Record<string, unknown>;
/**
 * An abstract store that owns state and notifies subscribers on change.
 *
 * Consumers can supply their own implementation (backed by Redux, Zustand,
 * XState, etc.) or use the built-in {@link createStateStore} for a simple
 * in-memory store.
 */
interface StateStore {
    /** Read a value by JSON Pointer path. */
    get: (path: string) => unknown;
    /**
     * Write a value by JSON Pointer path and notify subscribers.
     * Equality is checked by reference (`===`), not deep comparison.
     * Callers must pass a new object/array reference for changes to be detected.
     */
    set: (path: string, value: unknown) => void;
    /**
     * Write multiple values at once and notify subscribers (single notification).
     * Each value is compared by reference (`===`); only paths whose value
     * actually changed are applied.
     */
    update: (updates: Record<string, unknown>) => void;
    /** Return the full state object (used by `useSyncExternalStore`). */
    getSnapshot: () => StateModel;
    /** Optional server snapshot for SSR (passed to `useSyncExternalStore`). Falls back to `getSnapshot` when omitted. */
    getServerSnapshot?: () => StateModel;
    /** Register a listener that is called on every state change. Returns an unsubscribe function. */
    subscribe: (listener: () => void) => () => void;
}
/**
 * Component schema definition using Zod
 */
type ComponentSchema = z.ZodType<Record<string, unknown>>;
/**
 * Validation mode for catalog validation
 */
type ValidationMode = "strict" | "warn" | "ignore";
/**
 * JSON patch operation types (RFC 6902)
 */
type PatchOp = "add" | "remove" | "replace" | "move" | "copy" | "test";
/**
 * JSON patch operation (RFC 6902)
 */
interface JsonPatch {
    op: PatchOp;
    path: string;
    /** Required for add, replace, test */
    value?: unknown;
    /** Required for move, copy (source location) */
    from?: string;
}
/**
 * Resolve a dynamic value against a state model
 */
declare function resolveDynamicValue<T>(value: DynamicValue<T>, stateModel: StateModel): T | undefined;
/**
 * Get a value from an object by JSON Pointer path (RFC 6901)
 */
declare function getByPath(obj: unknown, path: string): unknown;
declare function resolveRepeatStatePath(statePath: RepeatStatePath, repeatBasePath?: string | null): string | undefined;
declare function resolveRepeatItemStatePath(statePath: string, index: number): string;
/**
 * Set a value in an object by JSON Pointer path (RFC 6901).
 * Automatically creates arrays when the path segment is a numeric index.
 */
declare function setByPath(obj: Record<string, unknown>, path: string, value: unknown): void;
/**
 * Add a value per RFC 6902 "add" semantics.
 * For objects: create-or-replace the member.
 * For arrays: insert before the given index, or append if "-".
 */
declare function addByPath(obj: Record<string, unknown>, path: string, value: unknown): void;
/**
 * Remove a value per RFC 6902 "remove" semantics.
 * For objects: delete the property.
 * For arrays: splice out the element at the given index.
 */
declare function removeByPath(obj: Record<string, unknown>, path: string): void;
/**
 * Find a form value from params and/or state.
 * Useful in action handlers to locate form input values regardless of path format.
 * Params are literal values (including dynamic bindings resolved before the
 * handler runs); a dot in a parameter value does not make it a state path.
 *
 * Checks in order:
 * 1. Defined direct param key
 * 2. Param keys ending with the field name
 * 3. Matching flat state keys (direct or dot notation)
 * 4. Nested state path using getByPath (slash notation)
 *
 * @example
 * // Find "name" from params or state
 * const name = findFormValue("name", params, state);
 *
 * // Will find from: params.name, params["form.name"], or state["form.name"]
 * // Use "/form/name" for nested state, or { $state: "/form/name" } in an action binding.
 */
declare function findFormValue(fieldName: string, params?: Record<string, unknown>, state?: Record<string, unknown>): unknown;
/**
 * A SpecStream line - a single patch operation in the stream.
 */
type SpecStreamLine = JsonPatch;
/**
 * Parse a single SpecStream line into a patch operation.
 * Returns null if the line is invalid or empty.
 *
 * SpecStream is json-render's streaming format where each line is a JSON patch
 * operation that progressively builds up the final spec.
 */
declare function parseSpecStreamLine(line: string): SpecStreamLine | null;
/**
 * Apply a single RFC 6902 JSON Patch operation to an object.
 * Mutates the object in place.
 *
 * Supports all six RFC 6902 operations: add, remove, replace, move, copy, test.
 *
 * @throws {Error} If a "test" operation fails (value mismatch).
 */
declare function applySpecStreamPatch<T extends Record<string, unknown>>(obj: T, patch: SpecStreamLine): T;
/**
 * Apply a single RFC 6902 JSON Patch operation to a Spec.
 * Mutates the spec in place and returns it.
 *
 * This is a typed convenience wrapper around `applySpecStreamPatch` that
 * accepts a `Spec` directly without requiring a cast to `Record<string, unknown>`.
 *
 * Note: This mutates the spec. For React state updates, spread the result
 * to create a new reference: `setSpec({ ...applySpecPatch(spec, patch) })`.
 *
 * @example
 * let spec: Spec = { root: "", elements: {} };
 * applySpecPatch(spec, { op: "add", path: "/root", value: "main" });
 */
declare function applySpecPatch(spec: Spec, patch: SpecStreamLine): Spec;
/**
 * Convert a nested (tree-structured) spec into the flat `Spec` format used
 * by json-render renderers.
 *
 * In the nested format each node has inline `children` as an array of child
 * objects. This function walks the tree, assigns auto-generated keys
 * (`el-0`, `el-1`, ...), and produces a flat `{ root, elements, state }` spec.
 *
 * The top-level `state` field (if present on the root node) is hoisted to
 * `spec.state`.
 *
 * @example
 * ```ts
 * const nested = {
 *   type: "Card",
 *   props: { title: "Hello" },
 *   children: [
 *     { type: "Text", props: { content: "World" } },
 *   ],
 *   state: { count: 0 },
 * };
 * const spec = nestedToFlat(nested);
 * // {
 * //   root: "el-0",
 * //   elements: {
 * //     "el-0": { type: "Card", props: { title: "Hello" }, children: ["el-1"] },
 * //     "el-1": { type: "Text", props: { content: "World" }, children: [] },
 * //   },
 * //   state: { count: 0 },
 * // }
 * ```
 */
declare function nestedToFlat(nested: Record<string, unknown>): Spec;
/**
 * Compile a SpecStream string into a JSON object.
 * Each line should be a patch operation.
 *
 * @example
 * const stream = `{"op":"add","path":"/name","value":"Alice"}
 * {"op":"add","path":"/age","value":30}`;
 * const result = compileSpecStream(stream);
 * // { name: "Alice", age: 30 }
 */
declare function compileSpecStream<T extends Record<string, unknown> = Record<string, unknown>>(stream: string, initial?: T): T;
/**
 * Streaming SpecStream compiler.
 * Useful for processing SpecStream data as it streams in from AI.
 *
 * @example
 * const compiler = createSpecStreamCompiler<MySpec>();
 *
 * // As chunks arrive:
 * const { result, newPatches } = compiler.push(chunk);
 * if (newPatches.length > 0) {
 *   updateUI(result);
 * }
 *
 * // When done:
 * const finalResult = compiler.getResult();
 */
interface SpecStreamCompiler<T> {
    /** Push a chunk of text. Returns the current result and any new patches applied. */
    push(chunk: string): {
        result: T;
        newPatches: SpecStreamLine[];
    };
    /** Get the current compiled result */
    getResult(): T;
    /** Get all patches that have been applied */
    getPatches(): SpecStreamLine[];
    /** Reset the compiler to initial state */
    reset(initial?: Partial<T>): void;
}
/**
 * Create a streaming SpecStream compiler.
 *
 * SpecStream is json-render's streaming format. AI outputs patch operations
 * line by line, and this compiler progressively builds the final spec.
 *
 * @example
 * const compiler = createSpecStreamCompiler<TimelineSpec>();
 *
 * // Process streaming response
 * const reader = response.body.getReader();
 * while (true) {
 *   const { done, value } = await reader.read();
 *   if (done) break;
 *
 *   const { result, newPatches } = compiler.push(decoder.decode(value));
 *   if (newPatches.length > 0) {
 *     setSpec(result); // Update UI with partial result
 *   }
 * }
 */
declare function createSpecStreamCompiler<T = Record<string, unknown>>(initial?: Partial<T>): SpecStreamCompiler<T>;
/**
 * Callbacks for the mixed stream parser.
 */
interface MixedStreamCallbacks {
    /** Called when a JSONL patch line is parsed */
    onPatch: (patch: SpecStreamLine) => void;
    /** Called when a text (non-JSONL) line is received */
    onText: (text: string) => void;
}
/**
 * A stateful parser for mixed streams that contain both text and JSONL patches.
 * Used in chat + GenUI scenarios where an LLM responds with conversational text
 * interleaved with json-render JSONL patch operations.
 */
interface MixedStreamParser {
    /** Push a chunk of streamed data. Calls onPatch/onText for each complete line. */
    push(chunk: string): void;
    /** Flush any remaining buffered content. Call when the stream ends. */
    flush(): void;
}
/**
 * Create a parser for mixed text + JSONL streams.
 *
 * In chat + GenUI scenarios, an LLM streams a response that contains both
 * conversational text and json-render JSONL patch lines. This parser buffers
 * incoming chunks, splits them into lines, and classifies each line as either
 * a JSONL patch (via `parseSpecStreamLine`) or plain text.
 *
 * @example
 * const parser = createMixedStreamParser({
 *   onText: (text) => appendToMessage(text),
 *   onPatch: (patch) => applySpecPatch(spec, patch),
 * });
 *
 * // As chunks arrive from the stream:
 * for await (const chunk of stream) {
 *   parser.push(chunk);
 * }
 * parser.flush();
 */
declare function createMixedStreamParser(callbacks: MixedStreamCallbacks): MixedStreamParser;
/**
 * Minimal chunk shape compatible with the AI SDK's `UIMessageChunk`.
 *
 * Defined here so that `@json-render/core` has no dependency on the `ai`
 * package. The discriminated union covers the three text-related chunk types
 * the transform inspects; all other chunk types pass through via the fallback.
 */
type StreamChunk = {
    type: "text-start";
    id: string;
    [k: string]: unknown;
} | {
    type: "text-delta";
    id: string;
    delta: string;
    [k: string]: unknown;
} | {
    type: "text-end";
    id: string;
    [k: string]: unknown;
} | {
    type: string;
    [k: string]: unknown;
};
/**
 * Creates a `TransformStream` that intercepts AI SDK UI message stream chunks
 * and classifies text content as either prose or json-render JSONL patches.
 *
 * Two classification modes:
 *
 * 1. **Fence mode** (preferred): Lines between ` ```spec ` and ` ``` ` are
 *    parsed as JSONL patches. Fence delimiters are swallowed (not emitted).
 * 2. **Heuristic mode** (backward compat): Outside of fences, lines starting
 *    with `{` are buffered and tested with `parseSpecStreamLine`. Valid patches
 *    are emitted as {@link SPEC_DATA_PART_TYPE} parts; everything else is
 *    flushed as text.
 *
 * Non-text chunks (tool events, step markers, etc.) are passed through unchanged.
 *
 * @example
 * ```ts
 * import { createJsonRenderTransform } from "@json-render/core";
 * import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
 *
 * const stream = createUIMessageStream({
 *   execute: async ({ writer }) => {
 *     writer.merge(
 *       result.toUIMessageStream().pipeThrough(createJsonRenderTransform()),
 *     );
 *   },
 * });
 * return createUIMessageStreamResponse({ stream });
 * ```
 */
declare function createJsonRenderTransform(): TransformStream<StreamChunk, StreamChunk>;
/**
 * The key registered in `AppDataParts` for json-render specs.
 * The AI SDK automatically prefixes this with `"data-"` on the wire,
 * so the actual stream chunk type is `"data-spec"` (see {@link SPEC_DATA_PART_TYPE}).
 *
 * @example
 * ```ts
 * import { SPEC_DATA_PART, type SpecDataPart } from "@json-render/core";
 * type AppDataParts = { [SPEC_DATA_PART]: SpecDataPart };
 * ```
 */
declare const SPEC_DATA_PART: "spec";
/**
 * The wire-format type string as it appears in stream chunks and message parts.
 * This is `"data-"` + {@link SPEC_DATA_PART} — i.e. `"data-spec"`.
 *
 * Use this constant when filtering message parts or enqueuing stream chunks.
 */
declare const SPEC_DATA_PART_TYPE: "data-spec";
/**
 * Discriminated union for the payload of a {@link SPEC_DATA_PART_TYPE} SSE part.
 *
 * - `"patch"`: A single RFC 6902 JSON Patch operation (streaming, progressive UI).
 * - `"flat"`: A complete flat spec with `root`, `elements`, and optional `state`.
 * - `"nested"`: A complete nested spec (tree structure — schema depends on catalog).
 */
type SpecDataPart = {
    type: "patch";
    patch: JsonPatch;
} | {
    type: "flat";
    spec: Spec;
} | {
    type: "nested";
    spec: Record<string, unknown>;
};
/**
 * Convenience wrapper that pipes an AI SDK UI message stream through the
 * json-render transform, classifying text as prose or JSONL patches.
 *
 * Eliminates the need for manual `pipeThrough(createJsonRenderTransform())`
 * and the associated type cast.
 *
 * @example
 * ```ts
 * import { pipeJsonRender } from "@json-render/core";
 *
 * const stream = createUIMessageStream({
 *   execute: async ({ writer }) => {
 *     writer.merge(pipeJsonRender(result.toUIMessageStream()));
 *   },
 * });
 * return createUIMessageStreamResponse({ stream });
 * ```
 */
declare function pipeJsonRender<T = StreamChunk>(stream: ReadableStream<T>): ReadableStream<T>;

/**
 * Immutably set a value at a JSON Pointer path using structural sharing.
 * Only objects along the path are shallow-cloned; untouched branches keep
 * their original references.
 */
declare function immutableSetByPath(root: StateModel, path: string, value: unknown): StateModel;
/**
 * Create a simple in-memory {@link StateStore}.
 *
 * This is the default store used by `StateProvider` when no external store is
 * provided. It mirrors the previous `useState`-based behaviour but is
 * framework-agnostic so it can also be used in tests or non-React contexts.
 */
declare function createStateStore(initialState?: StateModel): StateStore;
/**
 * Configuration for {@link createStoreAdapter}. Adapter authors supply these
 * three callbacks; everything else (get, set, update, no-op detection,
 * getServerSnapshot) is handled by the returned {@link StateStore}.
 */
interface StoreAdapterConfig {
    /** Return the current state snapshot from the underlying store. */
    getSnapshot: () => StateModel;
    /** Write a new state snapshot to the underlying store. */
    setSnapshot: (next: StateModel) => void;
    /** Subscribe to changes in the underlying store. Return an unsubscribe fn. */
    subscribe: (listener: () => void) => () => void;
}
/**
 * Build a full {@link StateStore} from a minimal adapter config.
 *
 * Handles `get`, `set` (with no-op detection), `update` (batched, with no-op
 * detection), `getSnapshot`, `getServerSnapshot`, and `subscribe` -- so each
 * adapter only needs to wire its snapshot source, write API, and subscribe
 * mechanism.
 */
declare function createStoreAdapter(config: StoreAdapterConfig): StateStore;
/**
 * Recursively flatten a plain object into a `Record<string, unknown>` keyed by
 * JSON Pointer paths. Only leaf values (non-plain-object) appear in the output.
 *
 * Includes circular reference protection and a depth cap to prevent stack
 * overflow on pathological inputs.
 *
 * ```ts
 * flattenToPointers({ user: { name: "Alice" }, count: 1 })
 * // => { "/user/name": "Alice", "/count": 1 }
 * ```
 */
declare function flattenToPointers(obj: Record<string, unknown>, prefix?: string, _depth?: number, _seen?: Set<object>, _warned?: {
    current: boolean;
}): Record<string, unknown>;

export { type Action as $, type AndCondition as A, parseSpecStreamLine as B, type ComponentSchema as C, type DynamicValue as D, applySpecStreamPatch as E, type FlatElement as F, applySpecPatch as G, nestedToFlat as H, type ItemCondition as I, type JsonPatch as J, compileSpecStream as K, createSpecStreamCompiler as L, type MixedStreamCallbacks as M, createMixedStreamParser as N, type OrCondition as O, type PatchOp as P, createJsonRenderTransform as Q, type RepeatStatePath as R, type StateModel as S, pipeJsonRender as T, type UIElement as U, type VisibilityCondition as V, SPEC_DATA_PART as W, SPEC_DATA_PART_TYPE as X, type StoreAdapterConfig as Y, createStateStore as Z, type ActionBinding as _, type StateCondition as a, type ActionConfirm as a0, type ActionOnSuccess as a1, type ActionOnError as a2, type ActionHandler as a3, type ActionDefinition as a4, type ResolvedAction as a5, type ActionExecutionContext as a6, ActionBindingSchema as a7, ActionSchema as a8, ActionConfirmSchema as a9, ActionOnSuccessSchema as aa, ActionOnErrorSchema as ab, resolveAction as ac, executeAction as ad, interpolateString as ae, actionBinding as af, action as ag, immutableSetByPath as ah, flattenToPointers as ai, createStoreAdapter as aj, type Spec as b, type DynamicString as c, type DynamicNumber as d, type DynamicBoolean as e, type IndexCondition as f, type SingleCondition as g, type StateStore as h, type ValidationMode as i, type SpecStreamLine as j, type SpecStreamCompiler as k, type MixedStreamParser as l, type StreamChunk as m, type SpecDataPart as n, DynamicValueSchema as o, DynamicStringSchema as p, DynamicNumberSchema as q, DynamicBooleanSchema as r, resolveDynamicValue as s, getByPath as t, resolveRepeatStatePath as u, resolveRepeatItemStatePath as v, setByPath as w, addByPath as x, removeByPath as y, findFormValue as z };
