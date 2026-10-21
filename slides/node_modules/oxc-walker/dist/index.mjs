import { createRequire } from "node:module";
//#region src/utils.ts
function isNode(v) {
	return v !== null && typeof v === "object" && typeof v.type === "string";
}
//#endregion
//#region src/walker/base.ts
var WalkerBase = class {
	scopeTracker;
	enter;
	leave;
	contextEnter = {
		skip: () => {
			this._skip = true;
		},
		remove: () => {
			this._remove = true;
		},
		replace: (node) => {
			this._replacement = node;
		}
	};
	contextLeave = {
		remove: this.contextEnter.remove,
		replace: this.contextEnter.replace
	};
	_skip = false;
	_remove = false;
	_replacement = null;
	constructor(handler, options) {
		this.enter = handler.enter;
		this.leave = handler.leave;
		this.scopeTracker = options?.scopeTracker;
	}
	replace(parent, key, index, node) {
		if (!parent || key === null) return;
		if (index !== null) parent[key][index] = node;
		else parent[key] = node;
	}
	insert(parent, key, index, node) {
		if (!parent || key === null) return;
		if (index !== null) parent[key].splice(index, 0, node);
		else parent[key] = node;
	}
	remove(parent, key, index) {
		if (!parent || key === null) return;
		if (index !== null) parent[key].splice(index, 1);
		else delete parent[key];
	}
};
//#endregion
//#region src/walker/sync.ts
var WalkerSync = class extends WalkerBase {
	constructor(handler, options) {
		super(handler, options);
	}
	traverse(input, key, index, parent) {
		const ctx = {
			key: null,
			index: index ?? null,
			ast: input
		};
		const scopeTracker = this.scopeTracker;
		const enter = this.enter;
		const leave = this.leave;
		const contextEnter = this.contextEnter;
		const contextLeave = this.contextLeave;
		const _walk = (input, parent, key, index, skip) => {
			if (scopeTracker) scopeTracker.processNodeEnter(input);
			let currentNode = input;
			let removedInEnter = false;
			let replacedInEnter = false;
			let skipChildren = skip;
			if (enter && !skip) {
				const _skip = this._skip;
				const _remove = this._remove;
				const _replacement = this._replacement;
				this._skip = false;
				this._remove = false;
				this._replacement = null;
				ctx.key = key;
				ctx.index = index;
				enter.call(contextEnter, input, parent, ctx);
				if (this._replacement && !this._remove) {
					currentNode = this._replacement;
					replacedInEnter = true;
					this.replace(parent, key, index, this._replacement);
					if (scopeTracker) scopeTracker.processNodeEnter(currentNode);
				}
				if (this._remove) {
					removedInEnter = true;
					currentNode = null;
					this.remove(parent, key, index);
				}
				if (this._skip) skipChildren = true;
				this._skip = _skip;
				this._remove = _remove;
				this._replacement = _replacement;
			}
			if ((!skipChildren || scopeTracker) && currentNode) for (const k in currentNode) {
				if (k === "type" || k === "start" || k === "end") continue;
				const node = currentNode[k];
				if (!node || typeof node !== "object") continue;
				if (Array.isArray(node)) for (let i = 0; i < node.length; i++) {
					const child = node[i];
					if (isNode(child)) {
						if (_walk(child, currentNode, k, i, skipChildren) === null) i--;
					}
				}
				else if (typeof node.type === "string") _walk(node, currentNode, k, null, skipChildren);
			}
			if (scopeTracker) {
				if (replacedInEnter) scopeTracker.processNodeLeave(currentNode);
				scopeTracker.processNodeLeave(input);
			}
			if (leave && !skip) {
				const _replacement = this._replacement;
				const _remove = this._remove;
				this._replacement = null;
				this._remove = false;
				ctx.key = key;
				ctx.index = index;
				leave.call(contextLeave, input, parent, ctx);
				if (this._replacement && !this._remove) {
					currentNode = this._replacement;
					if (removedInEnter) this.insert(parent, key, index, this._replacement);
					else this.replace(parent, key, index, this._replacement);
				}
				if (this._remove) {
					currentNode = null;
					this.remove(parent, key, index);
				}
				this._replacement = _replacement;
				this._remove = _remove;
			}
			return currentNode;
		};
		if (!isNode(input)) return null;
		if (scopeTracker) scopeTracker.onWalkStart(input);
		if (scopeTracker && !enter && !leave) {
			const _walkScopesOnly = (input) => {
				scopeTracker.processNodeEnter(input);
				for (const k in input) {
					if (k === "type" || k === "start" || k === "end") continue;
					const node = input[k];
					if (!node || typeof node !== "object") continue;
					if (Array.isArray(node)) for (let i = 0; i < node.length; i++) {
						const child = node[i];
						if (isNode(child)) _walkScopesOnly(child);
					}
					else if (typeof node.type === "string") _walkScopesOnly(node);
				}
				scopeTracker.processNodeLeave(input);
			};
			_walkScopesOnly(input);
			return input;
		}
		return _walk(input, parent ?? null, key ?? null, index ?? null, false);
	}
};
//#endregion
//#region src/walk.ts
let cachedParseSync;
function resolveParseSync() {
	if (cachedParseSync) return cachedParseSync;
	const require = createRequire(import.meta.url);
	for (const id of ["oxc-parser", "rolldown/utils"]) try {
		const mod = require(id);
		if (typeof mod.parseSync === "function") {
			cachedParseSync = mod.parseSync;
			return cachedParseSync;
		}
	} catch {}
	throw new Error("oxc-walker: could not resolve a `parseSync` implementation. Install `oxc-parser` or `rolldown` (and use `rolldown/utils`), or pass a `parseSync` function via the `parseAndWalk` options.");
}
/**
* Walk the AST with the given options.
* @param input The AST to walk.
* @param options The options to be used when walking the AST. Here you can specify the callbacks for entering and leaving nodes, as well as other options.
*/
function walk(input, options) {
	return new WalkerSync({
		enter: options.enter,
		leave: options.leave
	}, { scopeTracker: options.scopeTracker }).traverse(input);
}
const LANG_RE = /\.(?:c|m)?(?<lang>jsx?|tsx?)$/;
function parseAndWalk(code, sourceFilename, arg3) {
	const lang = sourceFilename?.match(LANG_RE)?.groups?.lang;
	const { parseOptions: _parseOptions = {}, parseSync: _parseSync, ...options } = typeof arg3 === "function" ? { enter: arg3 } : arg3;
	const parseOptions = {
		sourceType: "module",
		lang,
		..._parseOptions
	};
	const ast = (_parseSync ?? resolveParseSync())(sourceFilename, code, parseOptions);
	walk(ast.program, options);
	return ast;
}
//#endregion
//#region src/scope-tracker.ts
/**
* The node types handled by {@link ScopeTracker.processNodeEnter}.
* Must list every `case` of its switch statement; a missing entry silently disables
* scope tracking for that node type (see the drift test in `test/scope-tracker.test.ts`).
*/
const SCOPE_ENTER_TYPES = /* @__PURE__ */ new Set([
	"Program",
	"BlockStatement",
	"StaticBlock",
	"TSModuleBlock",
	"FunctionDeclaration",
	"FunctionExpression",
	"ArrowFunctionExpression",
	"VariableDeclaration",
	"ClassDeclaration",
	"ClassExpression",
	"ImportDeclaration",
	"TSEnumDeclaration",
	"TSModuleDeclaration",
	"TSImportEqualsDeclaration",
	"TSDeclareFunction",
	"TSInterfaceDeclaration",
	"TSTypeAliasDeclaration",
	"TSTypeParameter",
	"TSMappedType",
	"TSEnumBody",
	"TSMethodSignature",
	"TSCallSignatureDeclaration",
	"TSConstructSignatureDeclaration",
	"TSFunctionType",
	"TSConstructorType",
	"TSConditionalType",
	"CatchClause",
	"ForStatement",
	"ForOfStatement",
	"ForInStatement",
	"SwitchStatement"
]);
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
var ScopeTracker = class {
	scopeIndexStack = [];
	/**
	* The scope keys of the ancestors of the current scope, one entry per active scope.
	* `pushScope` pushes the current `scopeIndexKey` before deriving the new one,
	* and `popScope` restores it from here, so the stack always mirrors the path
	* from the root scope down to the parent of the current scope.
	*/
	scopeKeyStack = [];
	/**
	* The nodes that created the currently active scopes, one entry per scope.
	* A node that creates multiple scopes (e.g. `FunctionExpression`) appears once per scope.
	* This lets `processNodeLeave` detect scope ends with a pointer comparison
	* instead of checking the node type.
	*/
	scopeOwnerStack = [];
	scopeIndexKey = "";
	scopes = /* @__PURE__ */ new Map();
	typeScopes = /* @__PURE__ */ new Map();
	/**
	* The implicit `arguments` keyed by the function that introduces them,
	* so that repeated queries return the same instance.
	*/
	implicitArguments = /* @__PURE__ */ new WeakMap();
	options;
	isFrozen = false;
	constructor(options = {}) {
		this.options = options;
	}
	onWalkStart = (root) => {
		if (this.scopeIndexStack.length === 0 && root.type !== "Program") this.scopeIndexStack.push(0);
	};
	pushScope(owner) {
		const depthIndex = this.scopeIndexStack[this.scopeIndexStack.length - 1];
		this.scopeKeyStack.push(this.scopeIndexKey);
		this.scopeOwnerStack.push(owner);
		this.scopeIndexStack.push(0);
		if (depthIndex !== void 0) this.scopeIndexKey = this.scopeIndexKey ? `${this.scopeIndexKey}-${depthIndex}` : `${depthIndex}`;
	}
	popScope() {
		this.scopeOwnerStack.pop();
		this.scopeIndexStack.pop();
		if (this.scopeIndexStack[this.scopeIndexStack.length - 1] !== void 0) this.scopeIndexStack[this.scopeIndexStack.length - 1]++;
		if (!this.options.preserveExitedScopes) {
			this.scopes.delete(this.scopeIndexKey);
			this.typeScopes.delete(this.scopeIndexKey);
		}
		this.scopeIndexKey = this.scopeKeyStack.pop() ?? "";
	}
	/**
	* Get the key of the active scope at the given index of the scope stacks.
	*/
	getScopeKeyAt(index) {
		return index === this.scopeKeyStack.length - 1 ? this.scopeIndexKey : this.scopeKeyStack[index + 1];
	}
	/**
	* Get the key of the closest function-like scope (function bodies, static blocks,
	* module blocks and the root scope), which is where `var` declarations are hoisted to.
	*/
	getVarScopeKey() {
		const owners = this.scopeOwnerStack;
		for (let i = owners.length - 1; i >= 0; i--) switch (owners[i].type) {
			case "FunctionDeclaration":
			case "FunctionExpression":
			case "ArrowFunctionExpression":
			case "TSDeclareFunction":
			case "Program":
			case "StaticBlock":
			case "TSModuleBlock": return this.getScopeKeyAt(i);
		}
		return "";
	}
	declareInNamespace(scopes, name, node) {
		let scope = scopes.get(node.scope);
		if (!scope) {
			scope = /* @__PURE__ */ new Map();
			scopes.set(node.scope, scope);
		}
		scope.set(name, node);
	}
	declareIdentifier(name, data, namespaces = { value: true }) {
		if (this.isFrozen) return;
		if (namespaces.value) this.declareInNamespace(this.scopes, name, data);
		if (namespaces.type) this.declareInNamespace(this.typeScopes, name, data);
	}
	declareFunctionParameter(param, fn) {
		if (this.isFrozen) return;
		const identifiers = getPatternIdentifiers(param);
		for (const identifier of identifiers) this.declareIdentifier(identifier.name, new ScopeTrackerFunctionParam(identifier, this.scopeIndexKey, fn));
	}
	declarePattern(pattern, parent) {
		if (this.isFrozen) return;
		const scopeKey = parent.type === "VariableDeclaration" && parent.kind === "var" ? this.getVarScopeKey() : this.scopeIndexKey;
		const identifiers = getPatternIdentifiers(pattern);
		for (const identifier of identifiers) this.declareIdentifier(identifier.name, parent.type === "VariableDeclaration" ? new ScopeTrackerVariable(identifier, scopeKey, parent) : parent.type === "CatchClause" ? new ScopeTrackerCatchParam(identifier, scopeKey, parent) : new ScopeTrackerFunctionParam(identifier, scopeKey, parent));
	}
	processNodeEnter = (node) => {
		if (!SCOPE_ENTER_TYPES.has(node.type)) return;
		switch (node.type) {
			case "Program":
			case "BlockStatement":
			case "StaticBlock":
			case "SwitchStatement":
			case "TSModuleBlock":
			case "TSMethodSignature":
			case "TSCallSignatureDeclaration":
			case "TSConstructSignatureDeclaration":
			case "TSFunctionType":
			case "TSConstructorType":
			case "TSConditionalType":
				this.pushScope(node);
				break;
			case "FunctionDeclaration":
				if (node.id?.name) this.declareIdentifier(node.id.name, new ScopeTrackerFunction(node, this.scopeIndexKey));
				this.pushScope(node);
				for (const param of node.params) this.declareFunctionParameter(param, node);
				break;
			case "FunctionExpression":
				this.pushScope(node);
				if (node.id?.name) this.declareIdentifier(node.id.name, new ScopeTrackerFunction(node, this.scopeIndexKey));
				this.pushScope(node);
				for (const param of node.params) this.declareFunctionParameter(param, node);
				break;
			case "ArrowFunctionExpression":
				this.pushScope(node);
				for (const param of node.params) this.declareFunctionParameter(param, node);
				break;
			case "VariableDeclaration":
				for (const decl of node.declarations) this.declarePattern(decl.id, node);
				break;
			case "ClassDeclaration":
				if (node.id?.name) this.declareIdentifier(node.id.name, new ScopeTrackerIdentifier(node.id, this.scopeIndexKey), {
					value: true,
					type: true
				});
				if (node.typeParameters) this.pushScope(node);
				break;
			case "ClassExpression":
				this.pushScope(node);
				if (node.id?.name) this.declareIdentifier(node.id.name, new ScopeTrackerIdentifier(node.id, this.scopeIndexKey), {
					value: true,
					type: true
				});
				break;
			case "ImportDeclaration":
				for (const specifier of node.specifiers) {
					const isTypeOnly = node.importKind === "type" || specifier.type === "ImportSpecifier" && specifier.importKind === "type";
					this.declareIdentifier(specifier.local.name, new ScopeTrackerImport(specifier, this.scopeIndexKey, node), {
						value: !isTypeOnly,
						type: true
					});
				}
				break;
			case "TSEnumDeclaration":
			case "TSModuleDeclaration":
			case "TSImportEqualsDeclaration":
				if (node.type === "TSModuleDeclaration" && node.kind === "global") break;
				if (node.id?.type === "Identifier" && node.id.name) this.declareIdentifier(node.id.name, new ScopeTrackerIdentifier(node.id, this.scopeIndexKey), {
					value: true,
					type: true
				});
				break;
			case "TSDeclareFunction":
				if (node.id?.name) this.declareIdentifier(node.id.name, new ScopeTrackerIdentifier(node.id, this.scopeIndexKey));
				this.pushScope(node);
				break;
			case "TSInterfaceDeclaration":
			case "TSTypeAliasDeclaration":
				if (node.id?.name) this.declareIdentifier(node.id.name, new ScopeTrackerIdentifier(node.id, this.scopeIndexKey), { type: true });
				this.pushScope(node);
				break;
			case "TSTypeParameter":
				if (node.name?.name) this.declareIdentifier(node.name.name, new ScopeTrackerIdentifier(node.name, this.scopeIndexKey), { type: true });
				break;
			case "TSMappedType":
				this.pushScope(node);
				this.declareIdentifier(node.key.name, new ScopeTrackerIdentifier(node.key, this.scopeIndexKey), { type: true });
				break;
			case "TSEnumBody":
				this.pushScope(node);
				for (const member of node.members) if (member.id.type === "Identifier") this.declareIdentifier(member.id.name, new ScopeTrackerIdentifier(member.id, this.scopeIndexKey));
				break;
			case "CatchClause":
				this.pushScope(node);
				if (node.param) this.declarePattern(node.param, node);
				break;
			case "ForStatement":
			case "ForOfStatement":
			case "ForInStatement":
				this.pushScope(node);
				if (node.type === "ForStatement" && node.init?.type === "VariableDeclaration") for (const decl of node.init.declarations) this.declarePattern(decl.id, node.init);
				else if ((node.type === "ForOfStatement" || node.type === "ForInStatement") && node.left.type === "VariableDeclaration") for (const decl of node.left.declarations) this.declarePattern(decl.id, node.left);
				break;
		}
	};
	processNodeLeave = (node) => {
		const owners = this.scopeOwnerStack;
		while (owners.length > 0 && owners[owners.length - 1] === node) this.popScope();
	};
	getDeclarationIn(scopes, name) {
		let key = this.scopeIndexKey;
		while (true) {
			const node = scopes.get(key)?.get(name);
			if (node) return node;
			if (!key) return null;
			const separatorIndex = key.lastIndexOf("-");
			key = separatorIndex === -1 ? "" : key.slice(0, separatorIndex);
		}
	}
	/**
	* Check if an identifier is declared in the current scope or any parent scope.
	* @param name the identifier name to check
	* @param options which namespace to check — the value namespace (default), the type namespace, or both
	*/
	isDeclared(name, options) {
		return this.getDeclaration(name, options) !== null;
	}
	/**
	* Get the declaration node for a given identifier name.
	* @param name the identifier name to look up
	* @param options which namespace to check — the value namespace (default), the type namespace, or both
	*/
	getDeclaration(name, options) {
		const mode = options?.mode ?? "value";
		const declaration = (mode !== "type" ? this.getDeclarationIn(this.scopes, name) : null) ?? (mode !== "value" ? this.getDeclarationIn(this.typeScopes, name) : null);
		if (name === "arguments" && mode !== "type") {
			const owners = this.scopeOwnerStack;
			for (let i = owners.length - 1; i >= 0; i--) {
				const owner = owners[i];
				if (owner.type === "FunctionDeclaration" || owner.type === "FunctionExpression") {
					const fnScope = this.getScopeKeyAt(i);
					if (!declaration || isChildScope(fnScope, declaration.scope)) {
						let implicit = this.implicitArguments.get(owner);
						if (!implicit) {
							implicit = new ScopeTrackerFunctionArguments(owner, fnScope);
							this.implicitArguments.set(owner, implicit);
						}
						return implicit;
					}
					break;
				}
			}
		}
		return declaration;
	}
	/**
	* Get the current scope key.
	*/
	getCurrentScope() {
		return this.scopeIndexKey;
	}
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
	isCurrentScopeUnder(scope) {
		return isChildScope(this.scopeIndexKey, scope);
	}
	/**
	* Freezes the ScopeTracker, preventing further modifications to its state.
	* It also resets the scope index stack to its initial state so that the tracker can be reused.
	*
	* This is useful for second passes through the AST.
	*/
	freeze() {
		this.isFrozen = true;
		this.scopeIndexStack = [];
		this.scopeKeyStack = [];
		this.scopeOwnerStack = [];
		this.scopeIndexKey = "";
	}
};
function getPatternIdentifiers(pattern) {
	const identifiers = [];
	function collectIdentifiers(pattern) {
		switch (pattern.type) {
			case "Identifier":
				identifiers.push(pattern);
				break;
			case "AssignmentPattern":
				collectIdentifiers(pattern.left);
				break;
			case "RestElement":
				collectIdentifiers(pattern.argument);
				break;
			case "TSParameterProperty":
				collectIdentifiers(pattern.parameter);
				break;
			case "ArrayPattern":
				for (const element of pattern.elements) if (element) collectIdentifiers(element.type === "RestElement" ? element.argument : element);
				break;
			case "ObjectPattern":
				for (const property of pattern.properties) collectIdentifiers(property.type === "RestElement" ? property.argument : property.value);
				break;
		}
	}
	collectIdentifiers(pattern);
	return identifiers;
}
/**
* An allocation-free alternative to `getPatternIdentifiers(pattern).includes(node)`
*/
function isIdentifierInPattern(pattern, node) {
	switch (pattern.type) {
		case "Identifier": return pattern === node;
		case "AssignmentPattern": return isIdentifierInPattern(pattern.left, node);
		case "RestElement": return isIdentifierInPattern(pattern.argument, node);
		case "TSParameterProperty": return isIdentifierInPattern(pattern.parameter, node);
		case "ArrayPattern":
			for (const element of pattern.elements) if (element && isIdentifierInPattern(element.type === "RestElement" ? element.argument : element, node)) return true;
			return false;
		case "ObjectPattern":
			for (const property of pattern.properties) if (isIdentifierInPattern(property.type === "RestElement" ? property.argument : property.value, node)) return true;
			return false;
	}
	return false;
}
/**
* Check if an identifier is in a binding position, where it declares a new variable.
*
* Note that identifiers nested in destructuring patterns (`const { a, b = c } = obj`)
* cannot be resolved from the direct parent alone; this function returns `false` for them
* and {@link isReferenceIdentifier} reports them as references.
* Pair these functions with a {@link ScopeTracker} to resolve such identifiers correctly.
*/
function isOnlyBindingIdentifier(node, parent) {
	if (!parent || node.type !== "Identifier") return false;
	switch (parent.type) {
		case "FunctionDeclaration":
		case "FunctionExpression":
		case "ArrowFunctionExpression":
		case "TSDeclareFunction":
		case "TSEmptyBodyFunctionExpression":
			if (parent.type !== "ArrowFunctionExpression" && parent.id === node) return true;
			for (const param of parent.params) if (isIdentifierInPattern(param, node)) return true;
			return false;
		case "ClassDeclaration":
		case "ClassExpression": return parent.id === node;
		case "VariableDeclarator": return isIdentifierInPattern(parent.id, node);
		case "CatchClause":
			if (!parent.param) return false;
			return isIdentifierInPattern(parent.param, node);
		case "ImportSpecifier": return parent.local === node;
		case "ImportDefaultSpecifier":
		case "ImportNamespaceSpecifier": return true;
		case "TSEnumDeclaration":
		case "TSModuleDeclaration": return parent.id === node;
		case "TSImportEqualsDeclaration": return parent.id === node;
		case "TSParameterProperty": return isIdentifierInPattern(parent.parameter, node);
	}
	return false;
}
/**
* @deprecated
* Despite its name, this function does not check for binding positions only.
* It will adopt the strict binding-position behavior of {@link isOnlyBindingIdentifier}
* in the next major version. Migrate based on what you need:
* - `!isReferenceIdentifier(node, parent)` if you were filtering out variable references
*   (the common case)
* - `isOnlyBindingIdentifier(node, parent)` if you need actual binding positions
*/
function isBindingIdentifier(node, parent) {
	if (!parent || node.type !== "Identifier") return false;
	if (isOnlyBindingIdentifier(node, parent)) return true;
	switch (parent.type) {
		case "MethodDefinition":
		case "PropertyDefinition": return parent.key === node;
		case "Property": return parent.key === node && parent.value !== node;
		case "MemberExpression": return parent.property === node;
	}
	return false;
}
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
function isReferenceIdentifier(node, parent, options) {
	if (!parent) return false;
	const mode = options?.mode ?? "value";
	if (node.type === "JSXIdentifier") {
		if (mode === "type") return false;
		switch (parent.type) {
			case "JSXOpeningElement":
			case "JSXClosingElement": return parent.name === node && !/^[a-z]/.test(node.name);
			case "JSXMemberExpression": return parent.object === node;
			case "JSXAttribute":
			case "JSXNamespacedName": return false;
		}
		return false;
	}
	if (node.type !== "Identifier" || isOnlyBindingIdentifier(node, parent)) return false;
	switch (parent.type) {
		case "MemberExpression": return mode !== "type" && (parent.object === node || parent.computed);
		case "Property": return mode !== "type" && (parent.value === node || parent.computed);
		case "MethodDefinition":
		case "PropertyDefinition":
		case "AccessorProperty":
		case "TSAbstractMethodDefinition":
		case "TSAbstractPropertyDefinition":
		case "TSAbstractAccessorProperty": return mode !== "type" && (parent.value === node || parent.computed);
		case "ExportSpecifier": return mode !== "type" && parent.local === node;
		case "ExportAllDeclaration": return false;
		case "ImportSpecifier": return false;
		case "LabeledStatement":
		case "BreakStatement":
		case "ContinueStatement": return false;
		case "MetaProperty": return false;
		case "ImportAttribute": return false;
		case "TSEnumMember": return mode !== "type" && parent.id !== node;
		case "TSMappedType": return false;
		case "TSTypeReference": return mode !== "value";
		case "TSQualifiedName": return mode !== "value" && parent.left === node;
		case "TSClassImplements":
		case "TSInterfaceHeritage": return mode !== "value" && parent.expression === node;
		case "TSTypeParameter":
		case "TSInterfaceDeclaration":
		case "TSTypeAliasDeclaration":
		case "TSPropertySignature":
		case "TSMethodSignature":
		case "TSIndexSignature": return false;
		case "TSFunctionType":
		case "TSConstructorType":
		case "TSCallSignatureDeclaration":
		case "TSConstructSignatureDeclaration": return false;
	}
	return mode !== "type";
}
function getUndeclaredIdentifiersInFunction(node) {
	const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
	const undeclaredIdentifiers = /* @__PURE__ */ new Set();
	function isIdentifierUndeclared(node, parent) {
		return isReferenceIdentifier(node, parent) && !scopeTracker.isDeclared(node.name);
	}
	walk(node, { scopeTracker });
	scopeTracker.freeze();
	walk(node, {
		scopeTracker,
		enter(node, parent) {
			if ((node.type === "Identifier" || node.type === "JSXIdentifier") && isIdentifierUndeclared(node, parent)) undeclaredIdentifiers.add(node.name);
		}
	});
	return Array.from(undeclaredIdentifiers);
}
/**
* A function to check whether scope A is a child of scope B.
* @example
* ```ts
* isChildScope('0-1-2', '0-1') // true
* isChildScope('0-1', '0-1') // false
* ```
*
* @param a the child scope
* @param b the parent scope
* @returns true if scope A is a child of scope B, false otherwise (also when they are the same)
*/
function isChildScope(a, b) {
	return a.length > b.length && a.startsWith(b) && (b === "" || a[b.length] === "-");
}
var BaseNode = class {
	scope;
	node;
	constructor(node, scope) {
		this.node = node;
		this.scope = scope;
	}
	/**
	* Check if the node is defined under a specific scope.
	* @param scope
	*/
	isUnderScope(scope) {
		return isChildScope(this.scope, scope);
	}
};
var ScopeTrackerIdentifier = class extends BaseNode {
	type = "Identifier";
	get start() {
		return this.node.start;
	}
	get end() {
		return this.node.end;
	}
};
var ScopeTrackerFunctionParam = class extends BaseNode {
	type = "FunctionParam";
	fnNode;
	constructor(node, scope, fnNode) {
		super(node, scope);
		this.fnNode = fnNode;
	}
	/**
	* @deprecated The representation of this position may change in the future. Use `.fnNode.start` instead for now.
	*/
	get start() {
		return this.fnNode.start;
	}
	/**
	* @deprecated The representation of this position may change in the future. Use `.fnNode.end` instead for now.
	*/
	get end() {
		return this.fnNode.end;
	}
};
var ScopeTrackerFunction = class extends BaseNode {
	type = "Function";
	get start() {
		return this.node.start;
	}
	get end() {
		return this.node.end;
	}
};
var ScopeTrackerFunctionArguments = class extends BaseNode {
	type = "FunctionArguments";
	get start() {
		return this.node.start;
	}
	get end() {
		return this.node.end;
	}
};
var ScopeTrackerVariable = class extends BaseNode {
	type = "Variable";
	variableNode;
	constructor(node, scope, variableNode) {
		super(node, scope);
		this.variableNode = variableNode;
	}
	get start() {
		return this.variableNode.start;
	}
	get end() {
		return this.variableNode.end;
	}
};
var ScopeTrackerImport = class extends BaseNode {
	type = "Import";
	importNode;
	constructor(node, scope, importNode) {
		super(node, scope);
		this.importNode = importNode;
	}
	get start() {
		return this.importNode.start;
	}
	get end() {
		return this.importNode.end;
	}
};
var ScopeTrackerCatchParam = class extends BaseNode {
	type = "CatchParam";
	catchNode;
	constructor(node, scope, catchNode) {
		super(node, scope);
		this.catchNode = catchNode;
	}
	get start() {
		return this.catchNode.start;
	}
	get end() {
		return this.catchNode.end;
	}
};
//#endregion
export { ScopeTracker, ScopeTrackerCatchParam, ScopeTrackerFunction, ScopeTrackerFunctionArguments, ScopeTrackerFunctionParam, ScopeTrackerIdentifier, ScopeTrackerImport, ScopeTrackerVariable, getUndeclaredIdentifiersInFunction, isBindingIdentifier, isOnlyBindingIdentifier, isReferenceIdentifier, parseAndWalk, walk };
