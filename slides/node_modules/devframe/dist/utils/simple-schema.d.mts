import { t as StandardSchemaV1 } from "../index-CeEtxDmK.mjs";
//#region src/utils/simple-schema.d.ts
/**
 * A tiny, zero-dependency [Standard Schema](https://standardschema.dev/)
 * builder.
 *
 * ⚠️ **Discouraged for app code.** This is a deliberately minimal,
 * best-effort validator that exists only so devframe's own first-party
 * packages (recipes, built-in plugins) can declare `args`/`returns`/flag
 * schemas without taking on a validator dependency. It implements a small
 * subset of primitives and approximates refinements; it is not a
 * general-purpose validator.
 *
 * For your own code, prefer a real Standard Schema validator: **valibot**,
 * **zod**, or **arktype**. Devframe's RPC and CLI-flag layers accept any of
 * them; install the one you like and use it directly:
 *
 * ```ts
 * import * as v from 'valibot' // npm i valibot
 *
 * defineRpcFunction({
 *   name: 'greet',
 *   args: [v.object({ name: v.string() })],
 *   returns: v.string(),
 *   handler: ({ name }) => `hi ${name}`,
 * })
 * ```
 */
/**
 * A Standard Schema produced by the {@link s} builder. It carries a
 * duck-typed `type` marker (and `wrapped` for wrappers) alongside the
 * standard `~standard` prop so the CLI-flags adapter can introspect the
 * schema kind without importing any validator.
 */
export interface SimpleSchema<Input, Output = Input> extends StandardSchemaV1<Input, Output> {
  /** Schema kind marker, e.g. `'string'`, `'boolean'`, `'optional'`. */
  readonly type: string;
  /** Inner schema for wrapper kinds (`optional` / `nullable`). */
  readonly wrapped?: StandardSchemaV1;
  /** Optional human description (surfaced as CLI option help). */
  readonly description?: string;
}
/** Any string. */
export declare function string(): SimpleSchema<string>;
/** A finite number (rejects `NaN`). */
export declare function number(): SimpleSchema<number>;
/** A boolean. */
export declare function boolean(): SimpleSchema<boolean>;
/** `undefined`, mirroring valibot's `void`. */
export declare function voidType(): SimpleSchema<void>;
/** `null`. */
export declare function nullType(): SimpleSchema<null>;
/** One of a fixed set of literal values. */
export declare function picklist<const T extends readonly (string | number | boolean)[]>(values: T): SimpleSchema<T[number]>;
/** A single literal value (string / number / boolean). */
export declare function literal<const T extends string | number | boolean>(value: T): SimpleSchema<T>;
/** A value matching any one of the given schemas. */
export declare function union<const T extends readonly StandardSchemaV1[]>(options: T): SimpleSchema<StandardSchemaV1.InferInput<T[number]>, StandardSchemaV1.InferOutput<T[number]>>;
/** A record with string keys whose values each satisfy the value schema. */
export declare function record<V extends StandardSchemaV1>(_key: StandardSchemaV1, value: V): SimpleSchema<Record<string, StandardSchemaV1.InferInput<V>>, Record<string, StandardSchemaV1.InferOutput<V>>>;
/** An array whose every element satisfies the item schema. */
export declare function array<T extends StandardSchemaV1>(item: T): SimpleSchema<StandardSchemaV1.InferInput<T>[], StandardSchemaV1.InferOutput<T>[]>;
/** Flatten an intersection into a single object literal for readable types. */
type Prettify<T> = { [K in keyof T]: T[K]; } & {};
/**
 * Map a shape to its object type, turning fields whose type includes
 * `undefined` (i.e. `optional()`) into optional keys, mirroring how
 * valibot/zod render `optional` object entries.
 */
type InferField<T extends StandardSchemaV1, Mode extends 'input' | 'output'> = Mode extends 'input' ? StandardSchemaV1.InferInput<T> : StandardSchemaV1.InferOutput<T>;
type InferObject<T extends Record<string, StandardSchemaV1>, Mode extends 'input' | 'output'> = Prettify<{ [K in keyof T as undefined extends InferField<T[K], Mode> ? never : K]: InferField<T[K], Mode>; } & { [K in keyof T as undefined extends InferField<T[K], Mode> ? K : never]?: InferField<T[K], Mode>; }>;
/** An object whose known keys each satisfy their schema (extra keys are kept). */
export declare function object<T extends Record<string, StandardSchemaV1>>(shape: T): SimpleSchema<InferObject<T, 'input'>, InferObject<T, 'output'>>;
/** Allow `undefined` in addition to the inner schema. */
export declare function optional<T extends StandardSchemaV1>(inner: T): SimpleSchema<StandardSchemaV1.InferInput<T> | undefined, StandardSchemaV1.InferOutput<T> | undefined>;
/** Allow `null` in addition to the inner schema. */
export declare function nullable<T extends StandardSchemaV1>(inner: T): SimpleSchema<StandardSchemaV1.InferInput<T> | null, StandardSchemaV1.InferOutput<T> | null>;
/** Attach a human-readable description (used for CLI option help). */
export declare function describe<T extends SimpleSchema<any, any>>(schema: T, description: string): T;
/**
 * Grouped access to every builder: `s.string()`, `s.object({ ... })`,
 * `s.void()`, etc. Handy for a valibot-like `import { s } from
 * 'devframe/utils/simple-schema'` call site.
 */
export declare const s: {
  readonly string: typeof string;
  readonly number: typeof number;
  readonly boolean: typeof boolean;
  readonly void: typeof voidType;
  readonly null: typeof nullType;
  readonly literal: typeof literal;
  readonly picklist: typeof picklist;
  readonly union: typeof union;
  readonly record: typeof record;
  readonly array: typeof array;
  readonly object: typeof object;
  readonly optional: typeof optional;
  readonly nullable: typeof nullable;
  readonly describe: typeof describe;
};
//#endregion
export type { StandardSchemaV1 };