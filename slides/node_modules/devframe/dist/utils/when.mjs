//#region ../../node_modules/.pnpm/whenexpr@0.1.2/node_modules/whenexpr/dist/index.mjs
const OPS = [
	"===",
	"!==",
	"==",
	"!=",
	"<=",
	">=",
	"&&",
	"||",
	"<",
	">",
	"+",
	"-",
	"*",
	"/",
	"%",
	"!"
];
const IDENT_START = /[a-z_$]/i;
const IDENT_CONT = /[\w$.:]/;
const DIGIT = /\d/;
const WHITESPACE = /\s/;
function tokenize(input) {
	const tokens = [];
	let i = 0;
	while (i < input.length) {
		const c = input[i];
		if (WHITESPACE.test(c)) {
			i++;
			continue;
		}
		if (c === "(") {
			tokens.push({ type: "lparen" });
			i++;
			continue;
		}
		if (c === ")") {
			tokens.push({ type: "rparen" });
			i++;
			continue;
		}
		let matched = false;
		for (const op of OPS) if (input.startsWith(op, i)) {
			tokens.push({
				type: "op",
				value: op
			});
			i += op.length;
			matched = true;
			break;
		}
		if (matched) continue;
		if (DIGIT.test(c)) {
			let j = i;
			while (j < input.length && DIGIT.test(input[j])) j++;
			if (input[j] === "." && j + 1 < input.length && DIGIT.test(input[j + 1])) {
				j++;
				while (j < input.length && DIGIT.test(input[j])) j++;
			}
			tokens.push({
				type: "number",
				value: Number(input.slice(i, j))
			});
			i = j;
			continue;
		}
		if (c === "\"" || c === "'") {
			const quote = c;
			let j = i + 1;
			let value = "";
			while (j < input.length && input[j] !== quote) if (input[j] === "\\" && j + 1 < input.length) {
				const nx = input[j + 1];
				value += nx === "n" ? "\n" : nx === "t" ? "	" : nx;
				j += 2;
			} else {
				value += input[j];
				j++;
			}
			if (j >= input.length) throw new Error(`Unterminated string literal at position ${i}`);
			j++;
			tokens.push({
				type: "string",
				value
			});
			i = j;
			continue;
		}
		if (IDENT_START.test(c)) {
			let j = i;
			while (j < input.length && IDENT_CONT.test(input[j])) j++;
			const name = input.slice(i, j);
			if (name === "true") tokens.push({
				type: "bool",
				value: true
			});
			else if (name === "false") tokens.push({
				type: "bool",
				value: false
			});
			else tokens.push({
				type: "ident",
				value: name
			});
			i = j;
			continue;
		}
		throw new Error(`Unexpected character "${c}" at position ${i}`);
	}
	tokens.push({ type: "eof" });
	return tokens;
}
/**
* Parse a when-clause expression string into an AST.
*
* Grammar (lowest to highest precedence):
* - `||` — logical OR
* - `&&` — logical AND
* - `==`, `!=`, `===`, `!==` — equality
* - `<`, `>`, `<=`, `>=` — relational
* - `+`, `-` — additive
* - `*`, `/`, `%` — multiplicative
* - `!`, `-`, `+` — unary
* - primary: literals (number, string, boolean), identifiers, `( … )`
*
* `==` and `!=` follow VS Code-style semantics: the right-hand side is a
* simple value literal or bare identifier (treated as an implicit string),
* not a full expression. Use `===` / `!==` for JS-style strict equality with
* full expressions on both sides.
*/
function parse(expression) {
	const tokens = tokenize(expression);
	let pos = 0;
	const peek = () => tokens[pos];
	const consume = () => tokens[pos++];
	const isOp = (op) => {
		const t = peek();
		return t.type === "op" && t.value === op;
	};
	const consumeOp = () => {
		const t = consume();
		if (t.type !== "op") throw new Error(`internal: expected operator token, got ${tokenLabel(t)}`);
		return t.value;
	};
	function parseOr() {
		let left = parseAnd();
		while (isOp("||")) {
			consume();
			left = {
				type: "binary",
				op: "||",
				left,
				right: parseAnd()
			};
		}
		return left;
	}
	function parseAnd() {
		let left = parseEquality();
		while (isOp("&&")) {
			consume();
			left = {
				type: "binary",
				op: "&&",
				left,
				right: parseEquality()
			};
		}
		return left;
	}
	function parseEquality() {
		let left = parseRelational();
		while (isOp("===") || isOp("!==") || isOp("==") || isOp("!=")) {
			const op = consumeOp();
			const right = op === "==" || op === "!=" ? parseValueRhs() : parseRelational();
			left = {
				type: "binary",
				op,
				left,
				right
			};
		}
		return left;
	}
	function parseRelational() {
		let left = parseAdditive();
		while (isOp("<=") || isOp(">=") || isOp("<") || isOp(">")) left = {
			type: "binary",
			op: consumeOp(),
			left,
			right: parseAdditive()
		};
		return left;
	}
	function parseAdditive() {
		let left = parseMultiplicative();
		while (isOp("+") || isOp("-")) left = {
			type: "binary",
			op: consumeOp(),
			left,
			right: parseMultiplicative()
		};
		return left;
	}
	function parseMultiplicative() {
		let left = parseUnary();
		while (isOp("*") || isOp("/") || isOp("%")) left = {
			type: "binary",
			op: consumeOp(),
			left,
			right: parseUnary()
		};
		return left;
	}
	function parseUnary() {
		if (isOp("!") || isOp("-") || isOp("+")) return {
			type: "unary",
			op: consumeOp(),
			operand: parseUnary()
		};
		return parsePrimary();
	}
	function parsePrimary() {
		const t = peek();
		if (t.type === "number" || t.type === "string" || t.type === "bool") {
			consume();
			return {
				type: "literal",
				value: t.value
			};
		}
		if (t.type === "ident") {
			consume();
			return {
				type: "key",
				key: t.value
			};
		}
		if (t.type === "lparen") {
			consume();
			const node = parseOr();
			const close = peek();
			if (close.type !== "rparen") throw new Error(`Expected ")" but got ${tokenLabel(close)}`);
			consume();
			return node;
		}
		throw new Error(`Unexpected token: ${tokenLabel(t)}`);
	}
	function parseValueRhs() {
		const t = peek();
		if (t.type === "string") {
			consume();
			return {
				type: "literal",
				value: t.value
			};
		}
		if (t.type === "number") {
			consume();
			return {
				type: "literal",
				value: String(t.value)
			};
		}
		if (t.type === "bool") {
			consume();
			return {
				type: "literal",
				value: String(t.value)
			};
		}
		if (t.type === "ident") {
			consume();
			return {
				type: "literal",
				value: t.value
			};
		}
		throw new Error(`Expected value literal or identifier on right side of equality, got ${tokenLabel(t)}`);
	}
	const node = parseOr();
	const end = peek();
	if (end.type !== "eof") throw new Error(`Unexpected token: ${tokenLabel(end)}`);
	return node;
}
function tokenLabel(t) {
	switch (t.type) {
		case "eof": return "end of expression";
		case "lparen": return "\"(\"";
		case "rparen": return "\")\"";
		case "op":
		case "ident":
		case "string": return `"${t.value}"`;
		case "number":
		case "bool": return `"${String(t.value)}"`;
	}
}
/**
* Evaluate a parsed when-clause AST against a context object.
*
* With `{ strict: true }`, referencing an unknown context key throws.
* Short-circuit evaluation still applies — keys not reached are not checked.
*/
function evaluate(node, ctx, options = {}) {
	const { strict = false } = options;
	return !!run(node, ctx, strict);
}
function run(node, ctx, strict) {
	switch (node.type) {
		case "literal": return node.value;
		case "key": return lookup(node.key, ctx, strict);
		case "unary": return runUnary(node.op, run(node.operand, ctx, strict));
		case "binary": return runBinary(node, ctx, strict);
	}
}
function runUnary(op, v) {
	switch (op) {
		case "!": return !v;
		case "-": return -v;
		case "+": return +v;
	}
}
function runBinary(node, ctx, strict) {
	const { op } = node;
	if (op === "&&") {
		const l = run(node.left, ctx, strict);
		return l ? run(node.right, ctx, strict) : l;
	}
	if (op === "||") return run(node.left, ctx, strict) || run(node.right, ctx, strict);
	const l = run(node.left, ctx, strict);
	const r = run(node.right, ctx, strict);
	switch (op) {
		case "==": return String(l) === String(r);
		case "!=": return String(l) !== String(r);
		case "===": return l === r;
		case "!==": return l !== r;
		case "<": return l < r;
		case ">": return l > r;
		case "<=": return l <= r;
		case ">=": return l >= r;
		case "+": return l + r;
		case "-": return l - r;
		case "*": return l * r;
		case "/": return l / r;
		case "%": return l % r;
	}
}
/**
* Evaluate a when-clause expression string against a context object.
* Equivalent to `evaluate(parse(expression), ctx, options)`.
*
* Supports a JS-expression subset:
* - Literals: booleans, numbers, strings (quoted with `"` or `'`)
* - Identifiers: bare keys, including namespaced (`vite.mode`, `vite:buildMode`)
* - Logical: `&&`, `||`, `!`
* - Equality: `==`, `!=` (string comparison, bare identifier RHS treated as string),
*             `===`, `!==` (JS strict equality with full expression RHS)
* - Relational: `<`, `<=`, `>`, `>=`
* - Arithmetic: `+`, `-`, `*`, `/`, `%`, unary `-` / `+`
* - Grouping: `(` … `)`
*
* When `ctx` has a specific type with known keys, the expression string is
* **statically validated** — unknown context keys and syntax errors surface
* as TypeScript errors at the call site. Pass `ctx` typed as
* `Record<string, unknown>`, or the expression as `string`, to opt out of
* static checking (e.g. for dynamic expressions).
*
* With `{ strict: true }`, referencing an unknown context key at runtime
* throws. Short-circuit evaluation still applies — keys not reached are not
* checked.
*/
function evaluateWhen$1(expression, ctx, options) {
	return evaluate(parse(expression), ctx, options);
}
/**
* Resolve a context value by key. Supports namespaced keys with `.` or `:` separators.
*
* Lookup order:
* 1. Exact match — `ctx['plugin.mode']` or `ctx['plugin:mode']`
* 2. Nested path — e.g. `plugin.mode` falls back to `ctx.plugin?.mode`
*
* Returns `undefined` for unknown keys.
*/
function resolveContextValue$1(key, ctx) {
	return resolve(key, ctx).value;
}
function lookup(key, ctx, strict) {
	const { found, value } = resolve(key, ctx);
	if (!found && strict) throw new Error(`Unknown context key: "${key}"`);
	return value;
}
function resolve(key, ctx) {
	if (key in ctx) return {
		found: true,
		value: ctx[key]
	};
	const separator = key.includes(".") ? "." : key.includes(":") ? ":" : null;
	if (separator) {
		const segments = key.split(separator);
		let current = ctx;
		for (const segment of segments) {
			if (current == null || typeof current !== "object") return {
				found: false,
				value: void 0
			};
			const obj = current;
			if (!(segment in obj)) return {
				found: false,
				value: void 0
			};
			current = obj[segment];
		}
		return {
			found: true,
			value: current
		};
	}
	return {
		found: false,
		value: void 0
	};
}
//#endregion
//#region src/utils/when.ts
/**
* Evaluate a when-clause expression string against a context object.
*
* @example
* evaluateWhen('dockOpen && clientType == embedded', ctx)
*/
function evaluateWhen(expression, context, options) {
	return evaluateWhen$1(expression, context, options);
}
/**
* Resolve a context value by key. Supports namespaced keys with `.` or `:`
* separators. Returns `undefined` for unknown keys.
*/
function resolveContextValue(key, context) {
	return resolveContextValue$1(key, context);
}
//#endregion
export { evaluateWhen, resolveContextValue };
