import { ArrowFunctionExpression, BindingIdentifier, BindingPattern, CatchClause, Function, IdentifierName, IdentifierReference, ImportDeclaration, ImportDeclarationSpecifier, LabelIdentifier, Node, ParamPattern, Program, TSIndexSignatureName, VariableDeclaration } from "@oxc-project/types";
import { ParseResult, ParserOptions } from "oxc-parser";
//#region src/walker/base.d.ts
interface WalkerCallbackContext {
  /**
   * The key of the current node within its parent node object, if applicable.
   *
   * For instance, when processing a `VariableDeclarator` node, this would be the `declarations` key of the parent `VariableDeclaration` node.
   * @example
   * {
   *   type: 'VariableDeclaration',
   *   declarations: [[Object]],
   *   // ...
   * },
   *   {  // <-- when processing this, the key would be 'declarations'
   *     type: 'VariableDeclarator',
   *     // ...
   *   },
   */
  key: string | number | symbol | null | undefined;
  /**
   * The zero-based index of the current node within its parent's children array, if applicable.
   * For instance, when processing a `VariableDeclarator` node,
   * this would be the index of the current `VariableDeclarator` node within the `declarations` array.
   *
   * This is `null` when the node is not part of an array.
   *
   * @example
   * {
   *   type: 'VariableDeclaration',
   *   declarations: [[Object]],
   *   // ...
   * },
   *   {  // <-- when processing this, the index would be 0
   *     type: 'VariableDeclarator',
   *     // ...
   *   },
   */
  index: number | null;
  /**
   * The full Abstract Syntax Tree (AST) that is being walked, starting from the root node.
   */
  ast: Program | Node;
}
interface WalkerThisContextLeave {
  /**
   * Remove the current node from the AST.
   * @remarks
   * - The `ScopeTracker` currently does not support node removal
   * @see ScopeTracker
   */
  remove: () => void;
  /**
   * Replace the current node with another node.
   * After replacement, the walker will continue with the next sibling of the replaced node.
   *
   * In case the current node was removed in the `enter` phase, this will put the new node in
   * the place of the removed node - essentially undoing the removal.
   * @remarks
   * - The `ScopeTracker` currently does not support node replacement
   * @see ScopeTracker
   */
  replace: (node: Node) => void;
}
interface WalkerThisContextEnter extends WalkerThisContextLeave {
  /**
   * Skip traversing the child nodes of the current node.
   */
  skip: () => void;
  /**
   * Remove the current node and all of its children from the AST.
   * @remarks
   * - The `ScopeTracker` currently does not support node removal
   * @see ScopeTracker
   */
  remove: () => void;
  /**
   * Replace the current node with another node.
   * After replacement, the walker will continue to traverse the children of the new node.
   *
   * If you want to replace the current node and skip traversing its children, call `this.skip()` after calling `this.replace(newNode)`.
   * @remarks
   * - The `ScopeTracker` currently does not support node replacement
   * @see this.skip
   * @see ScopeTracker
   */
  replace: (node: Node) => void;
}
type WalkerCallback<T extends WalkerThisContextLeave> = (this: T, node: Node, parent: Node | null, ctx: WalkerCallbackContext) => void;
type WalkerEnter = WalkerCallback<WalkerThisContextEnter>;
type WalkerLeave = WalkerCallback<WalkerThisContextLeave>;
//#endregion
//#region src/walker/sync.d.ts
interface _WalkOptions {
  /**
   * The instance of `ScopeTracker` to use for tracking declarations and references.
   * @see ScopeTracker
   * @default undefined
   */
  scopeTracker: ScopeTracker;
}
interface WalkOptions extends Partial<_WalkOptions> {
  /**
   * The function to be called when entering a node.
   */
  enter: WalkerEnter;
  /**
   * The function to be called when leaving a node.
   */
  leave: WalkerLeave;
}
//#endregion
//#region src/walk.d.ts
type ParseSync = (filename: string, sourceText: string, options?: ParserOptions | null) => ParseResult;
type Identifier = IdentifierName | IdentifierReference | BindingIdentifier | LabelIdentifier | TSIndexSignatureName;
/**
 * Walk the AST with the given options.
 * @param input The AST to walk.
 * @param options The options to be used when walking the AST. Here you can specify the callbacks for entering and leaving nodes, as well as other options.
 */
declare function walk(input: Program | Node, options: Partial<WalkOptions>): Node | null;
interface ParseAndWalkOptions extends WalkOptions {
  /**
   * The options for `oxc-parser` to use when parsing the code.
   */
  parseOptions: ParserOptions;
  /**
   * The `parseSync` implementation to use. Defaults to `parseSync` from `oxc-parser`,
   * falling back to `rolldown/utils` if `oxc-parser` is not installed.
   *
   * Provide this explicitly to avoid the runtime lookup or to use a different
   * compatible parser (e.g. `import { parseSync } from "rolldown/utils"`).
   */
  parseSync: ParseSync;
}
/**
 * Parse the code and walk the AST with the given callback, which is called when entering a node.
 * @param code The string with the code to parse and walk. This can be JavaScript, TypeScript, jsx, or tsx.
 * @param sourceFilename The filename of the source code. This is used to determine the language of the code, unless
 * it is specified in the parse options.
 * @param callback The callback to be called when entering a node.
 */
declare function parseAndWalk(code: string, sourceFilename: string, callback: WalkerEnter): ParseResult;
/**
 * Parse the code and walk the AST with the given callback(s).
 * @param code The string with the code to parse and walk. This can be JavaScript, TypeScript, jsx, or tsx.
 * @param sourceFilename The filename of the source code. This is used to determine the language of the code, unless
 * it is specified in the parse options.
 * @param options The options to be used when walking the AST. Here you can specify the callbacks for entering and leaving nodes, as well as other options.
 */
declare function parseAndWalk(code: string, sourceFilename: string, options: Partial<ParseAndWalkOptions>): ParseResult;
//#endregion
//#region src/scope-tracker.d.ts
interface ScopeTrackerProtected {
  onWalkStart: (root: Node) => void;
  processNodeEnter: (node: Node) => void;
  processNodeLeave: (node: Node) => void;
}
/**
 * Tracks variable scopes and identifier declarations within a JavaScript AST.
 *
 * Maintains a stack of scopes, each represented as a map from identifier names to their declaration nodes,
 * enabling efficient lookup of the declaration.
 *
 * The ScopeTracker is designed to integrate with the `walk` function,
 * it automatically manages scope creation and identifier tracking,
 * so only query and inspection methods are exposed for external use.
 *
 * ### Scope tracking
 * A new scope is created when entering blocks, function parameters, loop variables, etc.
 * Note that this representation may split a single JavaScript lexical scope into multiple internal scopes,
 * meaning it doesn't mirror JavaScript’s scoping 1:1.
 *
 * Scopes are represented using a string-based index like `"0-1-2"`, which tracks depth and ancestry.
 *
 * #### Root scope
 * The root scope is represented by an empty string `""`.
 *
 * #### Scope key format
 * Scope keys are hierarchical strings that uniquely identify each scope and its position in the tree.
 * They are constructed using a depth-based indexing scheme, where:
 *
 * - the root scope is represented by an empty string `""`.
 * - the first child scope is `"0"`.
 * - a parallel sibling of `"0"` becomes `"1"`, `"2"`, etc.
 * - a nested scope under `"0"` is `"0-0"`, then its sibling is `"0-1"`, and so on.
 *
 * Each segment in the key corresponds to the zero-based index of the scope at that depth level in
 * the order of AST traversal.
 *
 * ### Additional features
 * - supports freezing the tracker to allow for second passes through the AST without modifying the scope data
 * (useful for doing a pre-pass to collect all identifiers before walking).
 *
 * @example
 * ```ts
 * const scopeTracker = new ScopeTracker()
 * walk(code, {
 *   scopeTracker,
 *   enter(node) {
 *     // ...
 *   },
 * })
 * ```
 *
 * @see parseAndWalk
 * @see walk
 */
declare class ScopeTracker {
  protected scopeIndexStack: number[];
  /**
   * The scope keys of the ancestors of the current scope, one entry per active scope.
   * `pushScope` pushes the current `scopeIndexKey` before deriving the new one,
   * and `popScope` restores it from here, so the stack always mirrors the path
   * from the root scope down to the parent of the current scope.
   */
  protected scopeKeyStack: string[];
  /**
   * The nodes that created the currently active scopes, one entry per scope.
   * A node that creates multiple scopes (e.g. `FunctionExpression`) appears once per scope.
   * This lets `processNodeLeave` detect scope ends with a pointer comparison
   * instead of checking the node type.
   */
  protected scopeOwnerStack: Node[];
  protected scopeIndexKey: string;
  protected scopes: Map<string, Map<string, ScopeTrackerNode>>;
  protected typeScopes: Map<string, Map<string, ScopeTrackerNode>>;
  /**
   * The implicit `arguments` keyed by the function that introduces them,
   * so that repeated queries return the same instance.
   */
  protected implicitArguments: WeakMap<Function, ScopeTrackerFunctionArguments>;
  protected options: Partial<ScopeTrackerOptions>;
  protected isFrozen: boolean;
  constructor(options?: ScopeTrackerOptions);
  protected onWalkStart: ScopeTrackerProtected["onWalkStart"];
  protected pushScope(owner: Node): void;
  protected popScope(): void;
  /**
   * Get the key of the active scope at the given index of the scope stacks.
   */
  protected getScopeKeyAt(index: number): string;
  /**
   * Get the key of the closest function-like scope (function bodies, static blocks,
   * module blocks and the root scope), which is where `var` declarations are hoisted to.
   */
  protected getVarScopeKey(): string;
  protected declareInNamespace(scopes: Map<string, Map<string, ScopeTrackerNode>>, name: string, node: ScopeTrackerNode): void;
  protected declareIdentifier(name: string, data: ScopeTrackerNode, namespaces?: {
    value?: boolean;
    type?: boolean;
  }): void;
  protected declareFunctionParameter(param: ParamPattern, fn: Function | ArrowFunctionExpression): void;
  protected declarePattern(pattern: BindingPattern, parent: VariableDeclaration | ArrowFunctionExpression | CatchClause | Function): void;
  protected processNodeEnter: ScopeTrackerProtected["processNodeEnter"];
  protected processNodeLeave: ScopeTrackerProtected["processNodeLeave"];
  protected getDeclarationIn(scopes: Map<string, Map<string, ScopeTrackerNode>>, name: string): ScopeTrackerNode | null;
  /**
   * Check if an identifier is declared in the current scope or any parent scope.
   * @param name the identifier name to check
   * @param options which namespace to check — the value namespace (default), the type namespace, or both
   */
  isDeclared(name: string, options?: ScopeTrackerQueryOptions): boolean;
  /**
   * Get the declaration node for a given identifier name.
   * @param name the identifier name to look up
   * @param options which namespace to check — the value namespace (default), the type namespace, or both
   */
  getDeclaration(name: string, options?: ScopeTrackerQueryOptions): ScopeTrackerNode | null;
  /**
   * Get the current scope key.
   */
  getCurrentScope(): string;
  /**
   * Check if the current scope is a child of a specific scope.
   * @example
   * ```ts
   * // current scope is 0-1
   * isCurrentScopeUnder('0') // true
   * isCurrentScopeUnder('0-1') // false
   * ```
   *
   * @param scope the parent scope key to check against
   * @returns `true` if the current scope is a child of the specified scope, `false` otherwise (also when they are the same)
   */
  isCurrentScopeUnder(scope: string): boolean;
  /**
   * Freezes the ScopeTracker, preventing further modifications to its state.
   * It also resets the scope index stack to its initial state so that the tracker can be reused.
   *
   * This is useful for second passes through the AST.
   */
  freeze(): void;
}
/**
 * Check if an identifier is in a binding position, where it declares a new variable.
 *
 * Note that identifiers nested in destructuring patterns (`const { a, b = c } = obj`)
 * cannot be resolved from the direct parent alone; this function returns `false` for them
 * and {@link isReferenceIdentifier} reports them as references.
 * Pair these functions with a {@link ScopeTracker} to resolve such identifiers correctly.
 */
declare function isOnlyBindingIdentifier(node: Node, parent: Node | null): boolean;
/**
 * @deprecated
 * Despite its name, this function does not check for binding positions only.
 * It will adopt the strict binding-position behavior of {@link isOnlyBindingIdentifier}
 * in the next major version. Migrate based on what you need:
 * - `!isReferenceIdentifier(node, parent)` if you were filtering out variable references
 *   (the common case)
 * - `isOnlyBindingIdentifier(node, parent)` if you need actual binding positions
 */
declare function isBindingIdentifier(node: Node, parent: Node | null): boolean;
/**
 * Check if an identifier is a reference.
 *
 * Note that this function returns `true` for the local name of a plain export
 * (`export { foo }`), where it is a genuine reference to a local variable,
 * but also for the local name of a re-export (`export { foo } from '...'`),
 * where it refers to the other module's exports instead.
 *
 * The two are indistinguishable from the specifier alone, as the `source` lives
 * on the parent `ExportNamedDeclaration`.
 * Skip re-export declarations during the walk to avoid the false positives.
 *
 * Identifiers nested in destructuring patterns (`const { a, b = c } = obj`) are also
 * indistinguishable from references based on the direct parent alone and are reported
 * as references. Pair this function with a {@link ScopeTracker} to resolve them correctly.
 */
declare function isReferenceIdentifier(node: Node, parent: Node | null, options?: IsReferenceIdentifierOptions): boolean;
interface IsReferenceIdentifierOptions {
  /**
   * Which references to report:
   * - `'value'`: references to runtime values, e.g. `foo()` or `typeof foo` in a type annotation
   * - `'type'`: references in type-only positions, e.g. `const x: Foo` or `implements Foo`,
   * which reference bindings in TypeScript's type namespace rather than runtime values
   * - `'all'`: both
   * @default 'value'
   */
  mode?: "value" | "type" | "all";
}
declare function getUndeclaredIdentifiersInFunction(node: Function | ArrowFunctionExpression): string[];
declare abstract class BaseNode<T extends Node = Node> {
  abstract type: string;
  readonly scope: string;
  node: T;
  constructor(node: T, scope: string);
  /**
   * The starting position of the entire node relevant for code transformation.
   * For instance, for a reference to a variable (ScopeTrackerVariable -> Identifier), this would refer to the start of the VariableDeclaration.
   */
  abstract get start(): number;
  /**
   * The ending position of the entire node relevant for code transformation.
   * For instance, for a reference to a variable (ScopeTrackerVariable -> Identifier), this would refer to the end of the VariableDeclaration.
   */
  abstract get end(): number;
  /**
   * Check if the node is defined under a specific scope.
   * @param scope
   */
  isUnderScope(scope: string): boolean;
}
declare class ScopeTrackerIdentifier extends BaseNode<Identifier> {
  type: "Identifier";
  get start(): number;
  get end(): number;
}
declare class ScopeTrackerFunctionParam extends BaseNode {
  type: "FunctionParam";
  fnNode: Function | ArrowFunctionExpression;
  constructor(node: Node, scope: string, fnNode: Function | ArrowFunctionExpression);
  /**
   * @deprecated The representation of this position may change in the future. Use `.fnNode.start` instead for now.
   */
  get start(): number;
  /**
   * @deprecated The representation of this position may change in the future. Use `.fnNode.end` instead for now.
   */
  get end(): number;
}
declare class ScopeTrackerFunction extends BaseNode<Function | ArrowFunctionExpression> {
  type: "Function";
  get start(): number;
  get end(): number;
}
declare class ScopeTrackerFunctionArguments extends BaseNode<Function> {
  type: "FunctionArguments";
  get start(): number;
  get end(): number;
}
declare class ScopeTrackerVariable extends BaseNode<Identifier> {
  type: "Variable";
  variableNode: VariableDeclaration;
  constructor(node: Identifier, scope: string, variableNode: VariableDeclaration);
  get start(): number;
  get end(): number;
}
declare class ScopeTrackerImport extends BaseNode<ImportDeclarationSpecifier> {
  type: "Import";
  importNode: ImportDeclaration;
  constructor(node: ImportDeclarationSpecifier, scope: string, importNode: ImportDeclaration);
  get start(): number;
  get end(): number;
}
declare class ScopeTrackerCatchParam extends BaseNode {
  type: "CatchParam";
  catchNode: CatchClause;
  constructor(node: Node, scope: string, catchNode: CatchClause);
  get start(): number;
  get end(): number;
}
type ScopeTrackerNode = ScopeTrackerFunctionParam | ScopeTrackerFunction | ScopeTrackerFunctionArguments | ScopeTrackerVariable | ScopeTrackerIdentifier | ScopeTrackerImport | ScopeTrackerCatchParam;
interface ScopeTrackerOptions {
  /**
   * If true, the scope tracker will preserve exited scopes in memory.
   * This is necessary when you want to do a pre-pass to collect all identifiers before walking, for example.
   * @default false
   */
  preserveExitedScopes?: boolean;
}
interface ScopeTrackerQueryOptions {
  /**
   * Which namespace to check:
   * - `'value'`: bindings of runtime values (default)
   * - `'type'`: bindings in TypeScript's type namespace (interfaces, type aliases, type parameters);
   * declarations available in both namespaces (classes, enums, namespaces, imports) are included in either
   * - `'all'`: both
   * @default 'value'
   */
  mode?: "value" | "type" | "all";
}
//#endregion
export { type Identifier, type IsReferenceIdentifierOptions, ScopeTracker, ScopeTrackerCatchParam, ScopeTrackerFunction, ScopeTrackerFunctionArguments, ScopeTrackerFunctionParam, ScopeTrackerIdentifier, ScopeTrackerImport, type ScopeTrackerNode, type ScopeTrackerOptions, type ScopeTrackerQueryOptions, ScopeTrackerVariable, type WalkOptions, type WalkerCallbackContext, type WalkerEnter, type WalkerLeave, type WalkerThisContextEnter, type WalkerThisContextLeave, getUndeclaredIdentifiersInFunction, isBindingIdentifier, isOnlyBindingIdentifier, isReferenceIdentifier, parseAndWalk, walk };