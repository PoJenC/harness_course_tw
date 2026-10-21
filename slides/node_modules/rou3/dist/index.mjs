const NullProtoObj = /* @__PURE__ */ (() => {
	const e = function() {};
	return e.prototype = Object.create(null), Object.freeze(e.prototype), e;
})();
function createRouter() {
	return {
		root: { key: "" },
		static: new NullProtoObj()
	};
}
const UNNAMED_GROUP_PREFIX = "__rou3_unnamed_";
const ESCAPED_GROUP_PREFIX = "__rou3_esc_";
function toUnnamedGroupKey(key) {
	return typeof key === "string" ? toGroupName(key) : `${UNNAMED_GROUP_PREFIX}${key}`;
}
function toGroupName(name) {
	return /^(?!__rou3_|_\d)[A-Za-z_]\w*$/.test(name) ? name : ESCAPED_GROUP_PREFIX + name.replace(/[_-]/g, (c) => c === "_" ? "__" : "_h");
}
function fromGroupName(key) {
	if (key.charCodeAt(0) !== 95) return key;
	if (key.startsWith("__rou3_esc_")) return key.slice(11).replace(/__|_h/g, (c) => c === "__" ? "_" : "-");
	return key.startsWith("__rou3_unnamed_") ? key.slice(15) : key;
}
function emptyParam(m, segments) {
	const pMap = m.paramsMap;
	const params = pMap && getMatchParams(segments, pMap, m.suffix);
	return !!pMap?.some(([, name, , empty]) => !empty && name > ":" && /(^|\/)(\/|$)/.test(params[name]));
}
function matchesZero(m) {
	const last = m.paramsMap[m.paramsMap.length - 1];
	return last[2] || !!last[3] && !last[5];
}
function normalizePath(path) {
	if (!path.includes("/.")) return path;
	const r = [];
	let s = "";
	for (s of path.split("/")) if (s === ".") continue;
	else if (s === "..") {
		if (r.length > 1) r.pop();
	} else r.push(s);
	if (s === "." || s === "..") r.push("");
	return r.join("/") || "/";
}
function splitPath(path) {
	const s = path.split("/");
	s.shift();
	return s;
}
function methodEntries(methods, method, reverse) {
	let own = methods[method];
	let any = method ? methods[""] : void 0;
	if (reverse) {
		own &&= own.slice().reverse();
		any &&= any.slice().reverse();
	}
	return own && any ? any.concat(own) : own || any;
}
function reverseVariants(entries) {
	let out;
	for (let i = 0, j; i < entries.length; i = j) {
		const token = entries[i].variants;
		for (j = i + 1; token && entries[j]?.variants === token; j++);
		if (j - i > 1) (out ??= entries.slice()).splice(i, j - i, ...entries.slice(i, j).reverse());
	}
	return out || entries;
}
function setParam(params, key, value, join) {
	params[key] = join && params[key] !== void 0 ? params[key] + "/" + value : value;
}
function getMatchParams(segments, paramsMap, suffix, slash) {
	const params = new NullProtoObj();
	const end = suffix ? segments.length - suffix[1] : segments.length;
	for (const [index, name, optional, , , join] of paramsMap) {
		if (~index >= end && (optional || !slash)) continue;
		const segment = index < 0 ? segments.slice(~index, end).join("/") : segments[suffix && index > suffix[0] ? index - suffix[0] - 1 + end : index];
		if (typeof name === "string") {
			setParam(params, name, segment, join);
			if (index < 0 && optional && !join) params._ = segment;
		} else {
			const match = segment.match(name);
			if (match) {
				for (const key in match.groups) if (match.groups[key] !== void 0) setParam(params, fromGroupName(key), match.groups[key], join);
			}
		}
	}
	return params;
}
function encodeEscapes(path) {
	if (!path.includes("\\")) return path;
	return path.replace(/\\([:(){}\\])/g, (_, c) => "�" + ESCAPABLE.indexOf(c));
}
function decodeEscapes(segment, prefix) {
	return segment.replace(/\uFFFD([0-5])/g, (_, i) => prefix + ESCAPABLE[i]);
}
const ESCAPABLE = ":(){}\\";
function segmentKey(segment) {
	if (segment === "*" || segment.startsWith("**")) return 2;
	if (segment.includes(":") || segment.includes("(") || segmentWildcards(segment).length > 0) return 1;
	if (segment.includes("\\")) segment = segment.replace(/\\([\s\S])/g, "$1");
	if (segment.includes("�")) segment = decodeEscapes(segment, "");
	return encodeLiteral(segment);
}
function dynamicKey(segment) {
	if (!/[\0- "#<>^`\x7F-\uFFFC]/.test(segment)) return segment;
	let d = 0;
	return segment.replace(/[()]|[\0- "#<>^`\x7F-\uFFFC]+/g, (c) => c === "(" ? (d++, c) : c === ")" ? (d && d--, c) : d ? c : encodeLiteral(c));
}
function routeId(id) {
	return id.split("/").map(dynamicKey).join("/");
}
function encodeLiteral(text) {
	return /[\0- "#<>?^`{}\x7F-\uFFFC]/.test(text) ? text.replace(/[\0- "#<>?^`{}\x7F-\uFFFC]+/g, (run) => encodeURIComponent(run.replace(/[\uD800-\uDFFF]/gu, "�"))) : text;
}
function checkConstraints(route) {
	if (!/[\t\n\r\\({}\uFFFD-\uFFFF]/.test(route)) return;
	if (/[\t\n\r\uFFFD-\uFFFF]/.test(route)) invalidSyntax("a tab, LF, CR (use %09, %0A, %0D) or U+FFFD-U+FFFF char", route);
	let s = route.replace(/\\([^/])/g, (_, c) => c > "0" && c <= "9" ? "\0" : "_");
	while (s !== (s = s.replace(/\([^()/]*\)/g, (group) => {
		if (/[$^]|^\(\?<?[=!]/.test(group.replace(/\[[^\]]*\]/g, "")) || group.includes("\0")) invalidSyntax("an anchor, look-around, backreference or capturing group in a constraint", route);
		if (classSetOp(group)) invalidSyntax("a `--` / `&&` in a class of a constraint", route);
		return group[1] === "?" && group[2] !== "<" ? "" : "\0";
	})));
	if (s.includes("(")) throw new Error(`rou3: a \`(\` must close in its own segment, escape a literal one as \`\\(\` (${route})`);
	if (s.includes("\\")) invalidSyntax("a `\\` must escape a char of its segment", route);
	if (/[{}]/.test(s.replace(/\{[^{}]*\}/g, ""))) invalidSyntax("unbalanced or nested `{}`", route);
}
function classSetOp(s) {
	let found = false;
	while (!found && /--|&&/.test(s) && s !== (s = s.replace(/\[[^[\]]*\]/g, (k) => {
		found ||= /--|&&/.test(k);
		return "_";
	})));
	return found;
}
function starGroups(path) {
	if (!path.includes("(.*)")) return [path];
	let count = 0;
	let unnamed;
	return [path.replace(/\\[\s\S]|(:[A-Za-z_]\w*)?\((?!\?)(\.\*\)(?!\*))?/g, (m, name, star, at) => {
		if (m[0] === "\\" || !star) {
			if (m[0] === "(") count++;
			return m;
		}
		if (name) {
			const k = count;
			unnamed = (index) => index === k ? name.slice(1) : index > k ? index - 1 : index;
		} else count++;
		return /(^|[^\\])(\\\\)*([)*}?]|:[A-Za-z_]\w*)\{?$/.test(path.slice(0, at)) ? "￿*" : "*";
	}), unnamed];
}
function absolutePattern(path) {
	return /^[/{]/.test(path) ? path : `/${path}`;
}
function dotSegments(path) {
	if (!DOT_SEGMENT.test(path)) return path;
	const s = path.split("/");
	const out = [s[0]];
	let dot = false;
	for (let i = 1; i < s.length; i++) {
		const m = /^(?:\.|%2e)(\.|%2e)?$/i.exec(s[i]);
		if (m) {
			if (m[1] && (out.length > 1 || out[0]) && !isText(out.pop())) invalidSyntax(DOT_SEGMENT_NEXT_TO, path);
			dot = true;
			continue;
		}
		if (dot && /^[:*(]/.test(s[i])) invalidSyntax(DOT_SEGMENT_NEXT_TO, path);
		out.push(s[i]);
		dot = false;
	}
	if (dot) out.push("");
	return out.join("/");
}
const isText = (segment) => typeof segmentKey(segment = encodeEscapes(segment)) === "string" && !/[{}]|(^|[^\\])\?/.test(segment);
const DOT_SEGMENT = /(?:^|\/)(?:\.|%2e){1,2}(?=\/|$)/i;
const DOT_SEGMENT_NEXT_TO = "`.` / `..` segment next to a param, catch-all or group";
function invalidSyntax(what, route) {
	throw new Error(`rou3: ${what} (${route})`);
}
const MISPLACED_MODIFIER = "misplaced `?` / `+` / `*`: `?` follows `:name` or `:name(…)`, `+` / `*` a whole-segment `:name`, none a catch-all (`(.*)` too); escape a literal one with `\\`";
const PARAM_MODIFIER = /^(.*)(:[A-Za-z_]\w*(?:\([^)]*\))?)([?+*])$/;
function expandModifiers(segments, input) {
	for (let i = 0; i < segments.length; i++) {
		const last = segments[i].charCodeAt(segments[i].length - 1);
		if (last !== 63 && last !== 43 && last !== 42) continue;
		const m = segments[i].match(PARAM_MODIFIER);
		if (!m) continue;
		const pre = segments.slice(0, i);
		const suf = segments.slice(i + 1);
		const without = "/" + pre.concat(m[1] || [], suf).join("/");
		if (m[3] === "?" && m[1] !== "**") {
			if (typeof segmentKey(m[1]) !== "string") continue;
			return ["/" + pre.concat(m[1] + m[2], suf).join("/"), without];
		}
		if (m[1] || m[2].includes("(")) invalidSyntax(MISPLACED_MODIFIER, input);
		const wc = "/" + pre.concat("**" + m[2], suf).join("/");
		return m[3] === "+" ? [wc] : [wc, without];
	}
}
function splitStar(segments, input) {
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		const at = segment.startsWith("**") || segment === "*" ? [] : segmentWildcards(segment);
		if (at.length === 0) continue;
		for (let j = i + 1; j < segments.length && at.length === 1; j++) if (!segments[j].startsWith("**") && segments[j] !== "*") at.push(...segmentWildcards(segments[j]));
		if (at.length > 1) {
			if (at.some((x, k) => at[k + 1] === x + 1)) invalidSyntax(MISPLACED_MODIFIER, input);
			oneCatchAll(input);
		}
		const pre = segments.slice(0, i);
		const post = segments.slice(i + 1);
		const head = segment.slice(0, at[0]);
		const tail = segment.slice(at[0] + 1);
		if (!head) return [
			[pre.concat("**", segment, post)],
			i,
			false
		];
		if (!tail) return [
			[pre.concat(segment, "**", post), segments],
			i + 1,
			true
		];
		return [
			[pre.concat(head + "*", "**", "*" + tail, post), segments],
			i + 1,
			true
		];
	}
}
function oneCatchAll(input) {
	throw new Error(`rou3: a route can have only one \`*\`, \`**\`, \`:name+\` or \`:name*\` (${input})`);
}
function splitRoute(path) {
	const s = splitPath(path);
	while (s[s.length - 1] === "") s.pop();
	if (path.includes("**")) {
		for (let i = 0; i < s.length; i++) if (/^\*\*[^:{}]/.test(s[i])) s.splice(i, 1, ...s[i][2] === "*" ? ["**", s[i].slice(2)] : [s[i].slice(1)]);
	}
	return s;
}
function expandedRouteId(path) {
	if (path.charCodeAt(0) !== 47) return `{${expandedRouteId(`/${path}`)}`;
	return "/" + splitRoute(encodeEscapes(path)).map((segment) => {
		const key = segmentKey(segment);
		return typeof key === "string" ? key : segment;
	}).join("/");
}
function addName(names, name, input) {
	if (names.includes(name) || !/^[A-Za-z_]\w*$/.test(name)) invalidSyntax(`${names.includes(name) ? "duplicate" : "invalid"} param name "${decodeEscapes(name.replace(/\\(?=[\w$\x80-\ufffc])(?![^(]*\))/g, ""), "\\")}"`, input);
	names.push(name);
	return name;
}
function segmentWildcards(segment) {
	const at = [];
	let depth = 0;
	for (let i = 0; i < segment.length; i++) {
		const ch = segment.charCodeAt(i);
		if (ch === 92) i++;
		else if (ch === 40) depth++;
		else if (ch === 41 && depth > 0) depth--;
		else if (ch === 42 && depth === 0) at.push(i);
	}
	return at;
}
function scanFirstGroup(path) {
	let i = 0;
	let depth = 0;
	for (; i < path.length; i++) {
		const c = path.charCodeAt(i);
		if (c === 92) i++;
		else if (c === 40) depth++;
		else if (c === 41 && depth > 0) depth--;
		else if (c === 123 && depth === 0) break;
	}
	if (i >= path.length) return;
	let j = i + 1;
	depth = 0;
	for (; j < path.length; j++) {
		const c = path.charCodeAt(j);
		if (c === 92) j++;
		else if (c === 40) depth++;
		else if (c === 41 && depth > 0) depth--;
		else if (c === 125 && depth === 0) break;
	}
	if (j >= path.length) return;
	const mod = path[j + 1];
	const hasMod = mod === "?" || mod === "+" || mod === "*";
	return [
		path.slice(0, i),
		path.slice(i + 1, j).replace(NAME_CHAR, "\\$&"),
		path.slice(j + (hasMod ? 2 : 1)).replace(NAME_CHAR, "\\$&"),
		hasMod ? mod : void 0
	];
}
const NAME_CHAR = /^[\w$\x80-￼]/;
function expandGroupDelimiters(path, input = path) {
	if (!path.includes("{")) return;
	const group = scanFirstGroup(path);
	if (!group) return;
	const [pre, body, suf, mod] = group;
	if (mod === "+" || mod === "*") invalidSyntax(`unsupported \`{}${mod}\``, input);
	if (mod === "?" && /^(?!\*\*)./.test(pre.slice(pre.lastIndexOf("/") + 1)) && /^:[A-Za-z_]\w*(\([^)]*\))?$/.test(body) && (!suf || suf[0] === "/")) return [pre + body + "?" + suf];
	const full = joinGroup(joinGroup(pre, body, input), suf, input);
	const expanded = mod ? [full, joinGroup(pre, suf, input)] : [full];
	if (expanded.some((e) => DOT_SEGMENT.test(e))) invalidSyntax(DOT_SEGMENT_NEXT_TO, input);
	if (pre) return expanded;
	if (mod && body.charCodeAt(0) === 47 && suf && !/^\{?\//.test(suf)) invalidSyntax("text after a leading `{/...}?`", input);
	return expanded.map(absolutePattern);
}
function joinGroup(a, b, input) {
	const m = /(?<!\\)(\\\\)*((?<!\*\*):\w+|\([^/]*[^\\]\)|\*)([(?+*\uFFFF])$/.exec(a + b[0]);
	if (m) {
		if (m[3] === "￿") return a + b;
		if (m[3] > "(") invalidSyntax(MISPLACED_MODIFIER, input);
		if (m[2] > "*") a += "([^\\x2f]+?)";
	}
	return a + (b.charCodeAt(0) === 65535 ? b.slice(1) : b);
}
function getParamRegexp(segment, unnamedStart, names, input, groupKey = toUnnamedGroupKey) {
	let _i = unnamedStart;
	let _o;
	let _s = "", _d = 0, _e = -1, _g = 0, _r = 0;
	const _c = [];
	for (let j = 0; j < segment.length; j++) {
		const c = segment.charCodeAt(j);
		if (_d === 0) {
			if (c === 65535) {
				_s += "￿";
				continue;
			}
			if (c === 58) _e = j + 1 + addName(names, /^[\w$\x80-\ufffc]*/.exec(segment.slice(j + 1))[0], input).length;
			else if (c === 40 && /[?)]/.test(segment[j + 1])) invalidSyntax("empty or `(?` group", input);
			else if (c === 63 || c === 43 || c === 42 && j === _e) {
				if (c === 63 && j === segment.length - 1 && PARAM_MODIFIER.test(segment)) {
					_s += "?";
					_r--;
					continue;
				}
				invalidSyntax(MISPLACED_MODIFIER, input);
			} else if (c === 42) {
				_e = j + 1;
				_s += "([^/]*)";
				_r--;
				continue;
			}
		} else if (c === 58) {
			_s += "￾:";
			continue;
		}
		if (c === 40) {
			if (_d++ === 0) _g = j;
		} else if (c === 41 && _d > 0) {
			if (--_d === 0) {
				_e = j + 1;
				const p = segment.slice(_g + 1, j);
				if (p !== "[^\\x2f]+?") _c.push(p);
			}
		} else if (_d === 0 && c === 65533 && /[34]/.test(segment[j + 1])) {
			_s += encodeLiteral("{}"[+segment[++j] - 3]);
			_r += 768;
			continue;
		} else if (_d === 0 && /[\0- "#$).<>?[-^`{-}\x7F-\uFFFC]/.test(segment[j])) {
			const esc = c === 92 && j + 1 < segment.length ? 1 : 0;
			const ch = segment.slice(j + esc, j + esc + (segment.codePointAt(j + esc) > 65535 ? 2 : 1));
			const encoded = encodeLiteral(ch);
			j += esc + ch.length - 1;
			_s += encoded !== ch ? encoded : esc && ch !== "*" ? "￾" + ch : "\\" + ch;
			_r += encoded.length * 256;
			continue;
		}
		if (_d === 0 && j >= _e && segment.charCodeAt(j - 1) !== 65533) _r += 256;
		_s += segment[j];
	}
	const regex = decodeEscapes(_s.replace(/(?<!\uFFFE):([A-Za-z_]\w*)(?:\(([^)]*)\))?(\?$)?/g, (m, id, p, o, i, s) => {
		const group = `(?<${toGroupName(id)}>${p && (p != "[^\\x2f]+?" || !/[(\uFFFF]/.test(s[i + m.length])) ? p : "[^/]+?"})`;
		return o ? (_o = id, `(?:${group})?`) : group;
	}).replace(/\((?![?<])/g, () => `(?<${groupKey(_i++)}>`), "￾").replace(/\uFFFE([\s\S])|\uFFFF/g, (_, c = "") => /[.*+?^${}()|[\]\\]/.test(c) ? `\\${c}` : c);
	const regexp = new RegExp(`^${regex}$`);
	for (const p of _c) _r += new RegExp(`^(?:${decodeEscapes(p, "\\")})$`).test("") ? -1 : 1;
	return [
		regexp,
		_i,
		_o,
		_r
	];
}
function linearRegExp(regexp) {
	let source = regexp.source;
	if (!source.includes("[^/]+?)")) return regexp;
	let head = "";
	source = source.replace(/(\(\?<\w+>\[\^\/\]\*\))((?:\\[\s\S]|[^\\()]|(?:\(\?:)?\(\?<\w+>\[\^\/\]\+\?\)(?:\)\?)?)*)\$$/, (all, star, rest) => {
		if (!rest.includes("+?")) return all;
		head = `(?=[^/]*$(?<=(${rest.replace(/((?:\\[\s\S]|[^\\()])+)(?=\()|(\(\?:)?\(\?<\w+>\[\^\/\]\+\?\)(?:\)\?)?/g, (_, L, opt) => L ? L + upTo(L, true) : opt ? "" : "[^/]")})))`;
		return `${star}(?=\\1$)${rest}$`;
	});
	source = source.replace(/\[\^\/\]\+\?\)((?:\\[\s\S]|[^\\()])*)(?=(?:\(\?:)?\(\?<\w+>\[\^\/\](?:\+\?|\*)\))/g, (_, L) => `[^/]${L && upTo(L)})${L}`);
	return source === regexp.source ? regexp : new RegExp(`^${head}${source.slice(1)}`);
}
const upTo = (L, back) => L.replace(/^\\/, "").length < 2 ? `[^/${L}]*` : back ? `(?:[^/](?<!${L}))*` : `(?:(?!${L})[^/])*`;
function addRoute(ctx, method = "", path, data) {
	method = method.toUpperCase();
	path = absolutePattern(path);
	checkConstraints(path);
	const resolved = dotSegments(path);
	const [route, unnamed] = starGroups(resolved);
	variants = void 0;
	_add(ctx, method, route, data, unnamed && expandedRouteId(resolved), path, unnamed);
}
let variants;
function _add(ctx, method, path, data, route, input = path, unnamed = same) {
	const groupExpanded = expandGroupDelimiters(path, input);
	if (groupExpanded) {
		if (groupExpanded[1] !== void 0) {
			route ??= expandedRouteId(path);
			variants ??= {};
		}
		_add(ctx, method, groupExpanded[0], data, route, input, unnamed);
		if (groupExpanded[1] !== void 0) _add(ctx, method, groupExpanded[1], data, route, input, /[*(]/.test(path) ? skipGroup(path, input, unnamed) : unnamed);
		return 0;
	}
	path = encodeEscapes(path);
	const segments = splitRoute(path);
	const expanded = expandModifiers(segments, input);
	if (expanded) {
		route ??= expandedRouteId(path);
		variants ??= {};
		let count = 0;
		for (const p of expanded) count = _add(ctx, method, p, data, route, input, unnamed);
		return count;
	}
	const star = path.includes("*");
	const split = star ? splitStar(segments, input) : void 0;
	if (split) {
		const [routes, join, head] = split;
		if (routes.length > 1) {
			route ??= expandedRouteId(path);
			variants ??= {};
		}
		let count = 0;
		for (const r of routes) count = _insert(ctx, method, r, data, route, input, unnamed, star, r === segments ? -1 : join, head);
		return count;
	}
	return _insert(ctx, method, segments, data, route, input, unnamed, star);
}
function _insert(ctx, method, segments, data, route, input, unnamed, star, join = -1, head) {
	let node = ctx.root;
	let _unnamedParamIndex = 0;
	const paramsMap = [];
	const paramsRegexp = [];
	let rank = 0;
	const names = [];
	let named = false;
	const captureKey = (n) => {
		const k = unnamed(n);
		if (typeof k === "string" && !named) {
			named = true;
			addName(names, k, input);
		}
		return k;
	};
	let suffix;
	let wildcardIndex = -1;
	const trail = star ? [] : void 0;
	for (let i = 0; i < segments.length; i++) {
		let segment = segments[i];
		const key = segmentKey(segment);
		if (key === 2) {
			if (suffix) oneCatchAll(input);
			trail?.push(node);
			if (!node.wildcard) node.wildcard = { key: "**" };
			node = node.wildcard;
			const empty = segment.length === 1 || i === join;
			paramsMap.push([
				-(i + 1),
				i === join ? String(captureKey(head ? _unnamedParamIndex - 1 : _unnamedParamIndex++)) : segment.length === 2 ? (addName(names, "_", input), String(unnamed(_unnamedParamIndex++))) : empty ? String(captureKey(_unnamedParamIndex++)) : addName(names, segment.slice(3), input),
				segment.length === 2 && !(i === join && segments[i + 1]?.charCodeAt(0) !== 42),
				empty,
				void 0,
				i === join
			]);
			if (i === segments.length - 1) break;
			suffix = [];
			wildcardIndex = i;
			continue;
		}
		if (key === 1) {
			if (suffix) suffix.push(1);
			else {
				trail?.push(node);
				if (!node.param) node.param = { key: "*" };
				node = node.param;
			}
			if (!/^:[A-Za-z_]\w*$/.test(segment)) {
				const tail = i === join + 1 && segment.charCodeAt(0) === 42;
				const [source, nextIndex, inPlace, segmentRank] = getParamRegexp(segment, _unnamedParamIndex - (tail ? 1 : 0), names, input, (n) => toUnnamedGroupKey(captureKey(n)));
				_unnamedParamIndex = nextIndex;
				const regexp = paramsRegexp[i] = linearRegExp(source);
				rank += segmentRank;
				if (!suffix) node.hasRegexParam = true;
				paramsMap.push([
					i,
					regexp,
					false,
					/^(?!(?:[\s\S]*:\w+(?![\w?])){2})(?:\*|:[A-Za-z_]\w*)+\??$/.test(segment),
					inPlace,
					tail
				]);
			} else paramsMap.push([
				i,
				addName(names, segment.slice(1), input),
				false
			]);
			continue;
		}
		if (segment.includes("?") && /(^|[^\\])\?/.test(segment)) invalidSyntax(MISPLACED_MODIFIER, input);
		segment = segments[i] = key;
		if (suffix) {
			suffix.push(segment);
			continue;
		}
		trail?.push(node);
		const child = node.static?.[segment];
		if (child) node = child;
		else {
			const staticNode = { key: segment };
			if (!node.static) node.static = new NullProtoObj();
			node.static[segment] = staticNode;
			node = staticNode;
		}
	}
	if (suffix) {
		for (const n of trail) n.hasSuffix = true;
		node = node.suffix ??= { key: "" };
		for (let j = suffix.length - 1; j >= 0; j--) {
			const edge = suffix[j];
			if (edge === 1) node = node.param ??= { key: "*" };
			else node = (node.static ??= new NullProtoObj())[edge] ??= { key: edge };
		}
	}
	const hasParams = paramsMap.length > 0;
	const key = "/" + segments.join("/");
	const methods = node.methods ??= new NullProtoObj();
	(methods[method] ??= []).push({
		data: data ?? null,
		paramsRegexp,
		paramsMap: hasParams ? paramsMap : void 0,
		route: route ?? key,
		suffix: suffix && [wildcardIndex, suffix.length],
		variants,
		rank: rank / 2 ** 32
	});
	if (!hasParams) ctx.static[segments.length > 0 ? key : ""] = node;
	return _unnamedParamIndex;
}
const same = (index) => index;
function skipGroup(path, input, unnamed = same) {
	const [pre, body] = scanFirstGroup(path);
	if (!/[*(]/.test(body) && !pre.endsWith("*")) return unnamed;
	const count = (p) => _add(createRouter(), "", p, void 0, void 0, input);
	const before = count(pre);
	const skip = count(absolutePattern(joinGroup(pre, body, input))) - before;
	return skip ? (index) => unnamed(index < before ? index : index + skip) : unnamed;
}
function collectSuffix(node, method, segments, start, pos, matches, reverse) {
	const match = node.methods && methodEntries(node.methods, method, reverse);
	if (match) {
		const end = pos + 1;
		const weighted = [];
		for (const m of reverse ? match : reverseVariants(match)) {
			const w = m.suffix[0];
			let weight = 0;
			for (const [index, , optional, empty] of m.paramsMap) if (index < 0 && !optional) weight = end > start ? empty ? 2 : 4 : -1;
			const regexps = m.paramsRegexp;
			for (let i = 0; i < regexps.length && weight >= 0; i++) if (regexps[i]) weight = regexps[i].test(segments[i > w ? i - w - 1 + end : i]) ? weight + (m.paramsMap.find((e) => e[0] === i)[3] ? 1 : 4) : -1;
			if (weight >= 0) weighted.push([m, weight + m.rank]);
		}
		for (const [m] of weighted.sort((a, b) => a[1] - b[1])) matches.push(m);
	}
	if (pos >= start) {
		if (node.param) collectSuffix(node.param, method, segments, start, pos - 1, matches, reverse);
		const staticChild = node.static?.[segments[pos]];
		if (staticChild) collectSuffix(staticChild, method, segments, start, pos - 1, matches, reverse);
	}
}
function hasSuffixMatch(node, method, segments, index) {
	const trie = node.wildcard?.suffix;
	if (trie && (trie.param || trie.static?.[segments[segments.length - 1]])) {
		const matches = [];
		collectSuffix(trie, method, segments, index, segments.length - 1, matches);
		if (matches.length > 0) return true;
	}
	if (index < segments.length) {
		const staticChild = node.static?.[segments[index]];
		if (staticChild?.hasSuffix && hasSuffixMatch(staticChild, method, segments, index + 1)) return true;
		if (node.param?.hasSuffix && hasSuffixMatch(node.param, method, segments, index + 1)) return true;
	}
	return false;
}
function rankFromEnd(matches, segments) {
	const n = segments.length;
	return matches.sort((a, b) => {
		for (let p = n - 1; p >= 0; p--) {
			const x = kindAt(a, n, p);
			const y = kindAt(b, n, p);
			if (x < 0 && y < 0) p = ~Math.min(x, y);
			else if (Math.max(x, 0) !== Math.max(y, 0)) return Math.max(x, 0) - Math.max(y, 0);
		}
		return 0;
	});
}
function kindAt(m, n, p) {
	const suffix = m.suffix;
	const end = suffix ? n - suffix[1] : n;
	for (const [index, name, , plain] of m.paramsMap || []) if (index < 0) {
		if (p >= ~index && p < end) return index;
	} else if ((suffix && index > suffix[0] ? index - suffix[0] - 1 + end : index) === p) return typeof name === "string" || plain ? 0 : 2;
	return 3;
}
function findAllRoutes(ctx, method = "", path, opts) {
	if (opts?.normalize) path = normalizePath(path);
	const slash = path.charCodeAt(path.length - 1) === 47;
	if (slash) path = path.slice(0, -1);
	const segments = splitPath(path);
	const matches = _findRanked(ctx, method, segments);
	let seen;
	for (let i = matches.length - 1; i >= 0; i--) {
		const token = matches[i].variants;
		if (token) {
			if (seen?.includes(token)) matches.splice(i, 1);
			else (seen ??= []).push(token);
		}
	}
	const params = opts?.params !== false;
	return matches.map((m) => params && m.paramsMap ? {
		data: m.data,
		params: getMatchParams(segments, m.paramsMap, m.suffix, slash)
	} : { data: m.data });
}
function _findRanked(ctx, method, segments, reverse) {
	let matches = _findAll(ctx.root, method, segments, 0, [], reverse);
	if (segments.includes("")) matches = matches.filter((m) => !emptyParam(m, segments));
	if (ctx.root.hasSuffix && matches.some((m) => m.suffix)) rankFromEnd(matches, segments);
	return matches;
}
function _findAll(node, method, segments, index, matches = [], reverse) {
	const segment = segments[index];
	if (node.wildcard) {
		const match = node.wildcard.methods && methodEntries(node.wildcard.methods, method, reverse);
		if (match) pushSorted(matches, index < segments.length ? match : match.filter((m) => matchesZero(m)), reverse);
		if (node.wildcard.suffix) collectSuffix(node.wildcard.suffix, method, segments, index, segments.length - 1, matches, reverse);
	}
	if (node.param && index < segments.length) {
		const start = matches.length;
		_findAll(node.param, method, segments, index + 1, matches, reverse);
		if (node.param.hasRegexParam) {
			for (let r = matches.length - 1; r >= start; r--) if (matches[r].paramsRegexp[index]?.test(segment) === false) matches.splice(r, 1);
		}
	}
	if (index < segments.length) {
		const staticChild = node.static?.[segment];
		if (staticChild) _findAll(staticChild, method, segments, index + 1, matches, reverse);
	}
	if (index === segments.length && node.methods) {
		const match = methodEntries(node.methods, method, reverse);
		if (match) pushSorted(matches, match, reverse);
	}
	return matches;
}
function pushSorted(matches, match, reverse) {
	if (match.length > 1) match = (reverse ? match : reverseVariants(match)).map((m) => {
		let w = m.rank;
		const { paramsRegexp: rx, paramsMap: pm } = m;
		for (let i = 0; i < rx.length; i++) if (rx[i]) w += 2;
		const last = pm?.[pm.length - 1];
		if (last && !last[2]) w += last[0] < 0 && last[3] ? 1 : 2;
		return [m, w];
	}).sort((a, b) => a[1] - b[1]).map((e) => e[0]);
	for (const m of match) matches.push(m);
}
function findRoute(ctx, method = "", path, opts) {
	if (opts?.normalize) path = normalizePath(path);
	const slash = path.charCodeAt(path.length - 1) === 47;
	if (slash) path = path.slice(0, -1);
	const staticNode = ctx.static[path];
	if (staticNode && staticNode.methods) {
		const staticMatch = staticNode.methods[method] || staticNode.methods[""];
		if (staticMatch !== void 0) return { data: staticMatch[0].data };
	}
	const segments = splitPath(path);
	let match;
	if (segments.includes("") || ctx.root.hasSuffix && hasSuffixMatch(ctx.root, method, segments, 0)) {
		const matches = _findRanked(ctx, method, segments, true);
		match = matches[matches.length - 1];
	} else match = _lookupTree(ctx.root, method, segments, 0);
	if (match === void 0) return;
	if (opts?.params === false) return { data: match.data };
	return {
		data: match.data,
		params: match.paramsMap ? getMatchParams(segments, match.paramsMap, match.suffix, slash) : void 0
	};
}
function _lookupTree(node, method, segments, index) {
	if (index === segments.length) {
		if (node.methods) {
			const match = _selectMatcher(node.methods, method, segments);
			if (match) return match;
		}
		return node.wildcard?.methods ? _selectMatcher(node.wildcard.methods, method, segments, true) : void 0;
	}
	const segment = segments[index];
	if (node.static) {
		const staticChild = node.static[segment];
		if (staticChild) {
			const match = _lookupTree(staticChild, method, segments, index + 1);
			if (match) return match;
		}
	}
	if (node.param) {
		const match = _lookupTree(node.param, method, segments, index + 1);
		if (match) return match;
	}
	if (node.wildcard && node.wildcard.methods) return _selectMatcher(node.wildcard.methods, method, segments);
}
function _selectMatcher(methods, method, segments, optionalOnly) {
	let any = methods[""];
	const match = methods[method] || any;
	if (!match) return;
	if (match === any) any = void 0;
	const first = match[0];
	if (!any && match.length === 1 && first.paramsRegexp.length === 0) return !optionalOnly || matchesZero(first) ? first : void 0;
	let best;
	let bestWeight = -1;
	let list = match;
	for (; list; list = list === any ? void 0 : any) for (const m of list) {
		const last = m.paramsMap?.[m.paramsMap.length - 1];
		if (optionalOnly && !matchesZero(m)) continue;
		let weight = m.rank + (last && !last[2] ? last[0] < 0 && last[3] ? 1 : 2 : 0);
		const regexps = m.paramsRegexp;
		for (let i = 0; i < regexps.length; i++) if (regexps[i]) {
			if (!regexps[i].test(segments[i])) {
				weight = -1;
				break;
			}
			weight += 2;
		}
		if (weight > bestWeight) {
			best = m;
			bestWeight = weight;
		}
	}
	return best;
}
function removeRoute(ctx, method = "", path) {
	method = method.toUpperCase();
	const input = absolutePattern(path);
	path = dotSegments(input);
	const [route, named] = starGroups(path);
	_removeRoute(ctx, method, route, named && expandedRouteId(path), input);
}
function _removeRoute(ctx, method, path, route, input = path) {
	const groupExpanded = expandGroupDelimiters(path, input);
	if (groupExpanded) {
		if (groupExpanded.length > 1) route ??= expandedRouteId(path);
		for (const expandedPath of groupExpanded) _removeRoute(ctx, method, expandedPath, route, input);
		return;
	}
	if (path.charCodeAt(0) !== 47) return;
	path = encodeEscapes(path);
	const segments = splitRoute(path);
	const modExpanded = expandModifiers(segments, input);
	if (modExpanded) {
		route ??= expandedRouteId(path);
		for (const expandedPath of modExpanded) _removeRoute(ctx, method, expandedPath, route, input);
		return;
	}
	const split = path.includes("*") ? splitStar(segments, path) : void 0;
	if (split) {
		if (split[0].length > 1) route ??= expandedRouteId(path);
		for (const r of split[0]) _remove(ctx, ctx.root, method, r, 0, route, "", true);
		return;
	}
	_remove(ctx, ctx.root, method, segments, 0, route, "", true);
}
function _remove(ctx, node, method, segments, index, route, key, isStatic) {
	if (index === segments.length) {
		const methods = node.methods;
		const entries = methods?.[method];
		if (!entries) return;
		const id = routeId(route ?? (key || "/"));
		for (let i = entries.length - 1; i >= 0; i--) if (routeId(entries[i].route) === id) entries.splice(i, 1);
		if (entries.length === 0) {
			delete methods[method];
			if (Object.keys(methods).length === 0) {
				node.methods = void 0;
				if (isStatic) delete ctx.static[key];
			}
		}
		return;
	}
	const segment = segments[index];
	const segKey = segmentKey(segment);
	if (segKey === 2) {
		const wildcard = node.wildcard;
		if (wildcard) {
			if (index === segments.length - 1) _remove(ctx, wildcard, method, segments, index + 1, route, key + "/" + segment, false);
			else if (wildcard.suffix) {
				for (let i = index; i < segments.length; i++) {
					const k = segmentKey(segments[i]);
					key += "/" + (typeof k === "string" ? k : segments[i]);
				}
				_removeSuffix(ctx, wildcard.suffix, method, segments, segments.length - 1, index, route ?? key);
				if (_isEmptyNode(wildcard.suffix)) wildcard.suffix = void 0;
			}
			if (_isEmptyNode(wildcard)) node.wildcard = void 0;
		}
		return;
	}
	if (segKey === 1) {
		if (node.param) {
			_remove(ctx, node.param, method, segments, index + 1, route, key + "/" + segment, false);
			if (_isEmptyNode(node.param)) node.param = void 0;
		}
		return;
	}
	const childNode = node.static?.[segKey];
	if (childNode) {
		_remove(ctx, childNode, method, segments, index + 1, route, key + "/" + segKey, isStatic);
		if (_isEmptyNode(childNode)) {
			delete node.static[segKey];
			if (Object.keys(node.static).length === 0) node.static = void 0;
		}
	}
}
function _removeSuffix(ctx, node, method, segments, index, stop, route) {
	if (index === stop) {
		_remove(ctx, node, method, segments, segments.length, route, "", false);
		return;
	}
	const segKey = segmentKey(segments[index]);
	const child = segKey === 1 ? node.param : typeof segKey === "string" ? node.static?.[segKey] : void 0;
	if (child) {
		_removeSuffix(ctx, child, method, segments, index - 1, stop, route);
		if (_isEmptyNode(child)) {
			if (segKey === 1) node.param = void 0;
			else {
				delete node.static[segKey];
				if (Object.keys(node.static).length === 0) node.static = void 0;
			}
		}
	}
}
function _isEmptyNode(node) {
	return node.methods === void 0 && node.static === void 0 && node.param === void 0 && node.wildcard === void 0 && node.suffix === void 0;
}
function segmentCovers(x, y, nonEmpty) {
	const X = _pieces(x);
	const Y = y === nonEmpty ? [1] : _pieces(y);
	if (!X || !Y) return false;
	const memo = /* @__PURE__ */ new Map();
	const covers = (i, j) => {
		const id = i * (Y.length + 1) + j;
		let result = memo.get(id);
		if (result === void 0) {
			result = _covers$1(X, Y, i, j, covers);
			memo.set(id, result);
		}
		return result;
	};
	return covers(0, 0);
}
function _covers$1(X, Y, i, j, covers) {
	if (i === X.length) return j === Y.length;
	const x = X[i];
	if (typeof x === "string") return Y[j] === x && covers(i + 1, j + 1);
	if (x instanceof RegExp) {
		const y = Y[j];
		if (y instanceof RegExp && y.source === x.source && covers(i + 1, j + 1)) return true;
		let text = "";
		for (let k = j;; k++) {
			if (x.test(text) && covers(i + 1, k)) return true;
			if (typeof Y[k] !== "string") return false;
			text += Y[k];
		}
	}
	let empty = true;
	for (let k = j; k <= Y.length; k++) {
		if ((x === 0 || !empty) && covers(i + 1, k)) return true;
		const y = Y[k];
		if (y === 1 || typeof y === "string" || y instanceof RegExp && !y.test("")) empty = false;
	}
	return false;
}
const _cache = /* @__PURE__ */ new WeakMap();
const ANY$1 = /^(\(\?:)?\(\?<[^>]+>\[\^(?:\\?\/|\\x2f)\]\+\?\)(\))?$/;
const STAR = /^\(\?<[^>]+>\[\^\\?\/\]\*\)$/;
function _pieces(r) {
	if (_cache.has(r)) return _cache.get(r);
	let pieces = [];
	let s = r.source;
	if (s.startsWith("^(?=[^/]*$(?<=(")) s = "^" + s.slice(_groupEnd(s, 1) + 1).replace("(?=\\1$)", "");
	s = s.replace(/\[\^\/\](?:\[\^\/(?:\\[\s\S]|[^\]\\])*\]\*|\(\?:\(\?!(?:\\[\s\S]|[^)\\])*\)\[\^\/\]\)\*)?\)/g, "[^/]+?)");
	if (r.flags || s[0] !== "^" || s[s.length - 1] !== "$") pieces = void 0;
	for (let i = 1; pieces && i < s.length - 1; i++) {
		const c = s[i];
		if (c === "\\") {
			if (/[\w]/.test(s[i + 1])) pieces = void 0;
			else pieces.push(s[++i]);
		} else if (c === "(") {
			const end = _groupEnd(s, i);
			if (end < 0) {
				pieces = void 0;
				break;
			}
			const optional = s[end + 1] === "?";
			const group = s.slice(i, end + 1);
			if (/^\(\?<?[=!]/.test(group)) {
				pieces = void 0;
				break;
			}
			const any = ANY$1.exec(group);
			pieces.push(any && !any[1] === !any[2] && !any[1] === !optional ? optional ? 0 : 1 : STAR.test(group) ? 0 : new RegExp(`^${group.replace(/^(\(\?:)?\(\?<[^>]+>/, "$1(?:")}${optional ? "?" : ""}$`));
			i = end + (optional ? 1 : 0);
		} else if ("^$|.*+?[]{}()".includes(c)) pieces = void 0;
		else pieces.push(c);
	}
	_cache.set(r, pieces);
	return pieces;
}
function _groupEnd(s, start) {
	let depth = 0;
	for (let i = start; i < s.length; i++) {
		const c = s[i];
		if (c === "\\") i++;
		else if (c === "[") {
			while (++i < s.length && s[i] !== "]") if (s[i] === "\\") i++;
		} else if (c === "(") depth++;
		else if (c === ")" && --depth === 0) return i;
	}
	return -1;
}
function routeToShapes(pattern) {
	let shapes = _patternShapes.get(pattern);
	if (shapes === void 0) {
		const ctx = createRouter();
		addRoute(ctx, "", pattern);
		shapes = [];
		_collectShapes(ctx.root, [], shapes);
		shapes = mergeShapes(shapes);
		if (_patternShapes.size >= 1024) _patternShapes.clear();
		_patternShapes.set(pattern, shapes);
	}
	return shapes;
}
function shapeOf(edges, entry) {
	let shape = _shapeCache.get(entry);
	if (!shape) _shapeCache.set(entry, shape = _computeShape(edges, entry));
	return shape;
}
function visitSuffixTrie(node, after, visit) {
	if (node.methods) visit(node, after);
	if (node.param) visitSuffixTrie(node.param, [0, ...after], visit);
	if (node.static) for (const key in node.static) visitSuffixTrie(node.static[key], [key, ...after], visit);
}
function mergeShapes(shapes) {
	for (let i = 0; i < shapes.length; i++) for (let j = i + 1; j < shapes.length; j++) {
		const a = shapes[i];
		const b = shapes[j];
		if (_sameFixed(a.fixed, b.fixed) && _sameFixed(a.suffix || [], b.suffix || []) && a.tailMin <= b.tailMax + 1 && b.tailMin <= a.tailMax + 1) {
			a.some = _someTail(a) && _someTail(b) ? true : void 0;
			a.tailMin = Math.min(a.tailMin, b.tailMin);
			a.tailMax = Math.max(a.tailMax, b.tailMax);
			shapes.splice(j, 1);
			j = i;
		}
	}
	return shapes;
}
function minLength(shape) {
	return shape.fixed.length + (shape.suffix?.length || 0) + shape.tailMin;
}
function maxLength(shape) {
	return shape.fixed.length + (shape.suffix?.length || 0) + shape.tailMax;
}
function matcherAt(shape, n, i) {
	if (i < shape.fixed.length) return shape.fixed[i];
	const s = shape.suffix?.length || 0;
	if (i >= n - s) return shape.suffix[i - n + s];
	return shape.some ? NON_EMPTY : void 0;
}
function stableLength(a, b) {
	return Math.max(a.fixed.length, b.fixed.length) + Math.max(a.suffix?.length || 0, b.suffix?.length || 0) + (a.some || b.some ? 1 : 0);
}
const NON_EMPTY = /^[\s\S]/;
const _regExpKeys = /* @__PURE__ */ new WeakMap();
function regExpKey(r) {
	let key = _regExpKeys.get(r);
	if (key === void 0) {
		const s = r.source;
		key = "";
		for (let i = 0; i < s.length; i++) {
			const c = s[i];
			if (c === "\\") key += c + s[++i];
			else if (c === "[") {
				let j = i + 1;
				while (j < s.length && s[j] !== "]") j += s[j] === "\\" ? 2 : 1;
				key += s.slice(i, j + 1);
				i = j;
			} else if (c === "(" && s[i + 1] === "?" && s[i + 2] === "<" && s[i + 3] !== "=" && s[i + 3] !== "!") {
				const end = s.indexOf(">", i + 3);
				key += "(";
				i = end === -1 ? i : end;
			} else key += c;
		}
		_regExpKeys.set(r, key);
	}
	return key;
}
const _shapeCache = /* @__PURE__ */ new WeakMap();
const _patternShapes = /* @__PURE__ */ new Map();
function _collectShapes(node, edges, shapes) {
	if (node.methods) for (const entry of node.methods[""] || []) shapes.push(_computeShape(edges, entry));
	if (node.static) for (const key in node.static) {
		edges.push(key);
		_collectShapes(node.static[key], edges, shapes);
		edges.pop();
	}
	if (node.param) {
		edges.push(0);
		_collectShapes(node.param, edges, shapes);
		edges.pop();
	}
	if (node.wildcard) {
		edges.push(1);
		_collectShapes(node.wildcard, edges, shapes);
		edges.pop();
	}
	if (node.suffix) visitSuffixTrie(node.suffix, [], (trieNode, after) => {
		for (const entry of trieNode.methods[""] || []) shapes.push(_computeShape(edges.concat(after), entry));
	});
}
function _computeShape(edges, entry) {
	const fixed = [];
	let suffix;
	let tailMin = 0;
	let tailMax = 0;
	let some;
	const pMap = entry.paramsMap;
	for (let d = 0; d < edges.length; d++) {
		const edge = edges[d];
		const into = suffix || fixed;
		if (typeof edge === "string") into.push(edge);
		else if (edge === 1) {
			const [, , optional, empty, , join] = pMap.find((e) => e[0] === -(d + 1));
			const last = d === edges.length - 1;
			tailMin = optional || last && empty && !join ? 0 : 1;
			tailMax = Number.POSITIVE_INFINITY;
			if (!optional && !empty) some = true;
			if (!last) suffix = [];
		} else if (pMap) {
			const p = pMap.find((e) => e[0] === d);
			into.push(p[1] instanceof RegExp ? p[1] : NON_EMPTY);
		}
	}
	return suffix ? {
		fixed,
		tailMin,
		tailMax,
		suffix,
		some
	} : {
		fixed,
		tailMin,
		tailMax,
		some
	};
}
function _someTail(shape) {
	return !!shape.some || shape.tailMax < 1;
}
function _sameFixed(a, b) {
	if (a.length !== b.length) return false;
	for (let k = 0; k < a.length; k++) if (!_segmentEqual(a[k], b[k])) return false;
	return true;
}
function _segmentEqual(x, y) {
	return x === y || x instanceof RegExp && y instanceof RegExp && x.flags === y.flags && regExpKey(x) === regExpKey(y);
}
function routesOverlap(patternA, patternB) {
	return _anyOverlap(routeToShapes(patternA), routeToShapes(patternB));
}
function compareRoutes(patternA, patternB) {
	const a = routeToShapes(patternA);
	const b = routeToShapes(patternB);
	const aCoversB = _covers(a, b);
	const bCoversA = _covers(b, a);
	if (aCoversB && bCoversA) return "equal";
	if (aCoversB) return "superset";
	if (bCoversA) return "subset";
	return _anyOverlap(a, b) ? "partial" : "disjoint";
}
function findOverlappingRoutes(ctx, method = "", pattern) {
	const query = routeToShapes(pattern);
	const matches = [];
	_collectOverlaps(ctx.root, method, query, [], [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()], matches);
	return matches;
}
function _anyOverlap(a, b) {
	for (const x of a) for (const y of b) if (_shapesOverlap(x, y)) return true;
	return false;
}
function _covers(sup, sub) {
	return sub.every((s) => sup.some((x) => _shapeSubsumes(x, s)));
}
function _collectOverlaps(node, method, query, edges, seen, matches) {
	if (node.wildcard) {
		edges.push(1);
		_collectOverlaps(node.wildcard, method, query, edges, seen, matches);
		edges.pop();
	}
	if (node.param) {
		edges.push(0);
		_collectOverlaps(node.param, method, query, edges, seen, matches);
		edges.pop();
	}
	if (node.static) {
		for (const key in node.static) if (_mayMatchAt(query, edges.length, key)) {
			edges.push(key);
			_collectOverlaps(node.static[key], method, query, edges, seen, matches);
			edges.pop();
		}
	}
	if (node.methods) _collectEntries(node, method, query, edges, seen, matches);
	if (node.suffix) visitSuffixTrie(node.suffix, [], (trieNode, after) => {
		_collectEntries(trieNode, method, query, edges.concat(after), seen, matches);
	});
}
function _collectEntries(node, method, query, edges, seen, matches) {
	const methods = node.methods;
	if (method) _collectBucket(methods[""], query, edges, seen[0], matches);
	_collectBucket(methods[method], query, edges, seen[method ? 1 : 0], matches);
}
function _collectBucket(entries, query, edges, seen, matches) {
	if (!entries) return;
	for (const entry of entries) {
		const d = entry.data;
		const routes = seen.get(d);
		const id = routeId(entry.route);
		if (routes?.has(id)) continue;
		const shape = shapeOf(edges, entry);
		if (query.some((q) => _shapesOverlap(q, shape))) {
			if (routes) routes.add(id);
			else seen.set(d, /* @__PURE__ */ new Set([id]));
			matches.push({ data: d });
		}
	}
}
function _shapesOverlap(a, b) {
	if (a.suffix || b.suffix || a.some || b.some) {
		const lo = Math.max(minLength(a), minLength(b));
		const hi = Math.min(maxLength(a), maxLength(b));
		const last = Math.min(hi, Math.max(lo, stableLength(a, b)));
		for (let n = lo; n <= last; n++) {
			let overlaps = true;
			for (let i = 0; i < n && overlaps; i++) overlaps = _segmentsCanOverlap(matcherAt(a, n, i), matcherAt(b, n, i));
			if (overlaps) return true;
		}
		return false;
	}
	const fa = a.fixed.length;
	const fb = b.fixed.length;
	const common = fa < fb ? fa : fb;
	for (let k = 0; k < common; k++) if (!_segmentsCanOverlap(a.fixed[k], b.fixed[k])) return false;
	return Math.max(fa + a.tailMin, fb + b.tailMin) <= Math.min(fa + a.tailMax, fb + b.tailMax);
}
function _shapeSubsumes(a, b) {
	if (a.suffix || b.suffix || a.some || b.some) {
		const lo = minLength(b);
		const hi = maxLength(b);
		if (lo < minLength(a) || hi > maxLength(a)) return false;
		const last = Math.min(hi, Math.max(lo, stableLength(a, b)));
		for (let n = lo; n <= last; n++) for (let i = 0; i < n; i++) if (!_segmentSubsumes(matcherAt(a, n, i), matcherAt(b, n, i))) return false;
		return true;
	}
	const fa = a.fixed.length;
	const fb = b.fixed.length;
	if (fa + a.tailMin > fb + b.tailMin || fa + a.tailMax < fb + b.tailMax) return false;
	const common = fa < fb ? fa : fb;
	for (let k = 0; k < common; k++) if (!_segmentSubsumes(a.fixed[k], b.fixed[k])) return false;
	for (let k = fb; k < fa; k++) if (a.fixed[k] !== void 0) return false;
	return true;
}
function _mayMatchAt(query, depth, key) {
	for (const q of query) if (depth < q.fixed.length) {
		const m = q.fixed[depth];
		if (m === void 0 || (typeof m === "string" ? m === key : m.test(key))) return true;
	} else if (depth - q.fixed.length < q.tailMax) return true;
	return false;
}
function _segmentsCanOverlap(x, y) {
	if (typeof x === "string") return typeof y === "string" ? x === y : y instanceof RegExp ? y.test(x) : true;
	if (x instanceof RegExp && typeof y === "string") return x.test(y);
	return true;
}
function _segmentSubsumes(x, y) {
	if (x === void 0) return true;
	if (typeof x === "string") return x === y;
	if (typeof y === "string") return x.test(y);
	if (x === NON_EMPTY && y) return y === NON_EMPTY || !y.test("");
	return y instanceof RegExp && (x.flags === y.flags && regExpKey(x) === regExpKey(y) || segmentCovers(x, y, NON_EMPTY));
}
function routeNodeKeys(pattern) {
	let keys = _patternKeys.get(pattern);
	if (keys === void 0) {
		const ctx = createRouter();
		addRoute(ctx, "", pattern);
		keys = [];
		_collectKeys(ctx.root, "", keys);
		if (_patternKeys.size >= 1024) _patternKeys.clear();
		_patternKeys.set(pattern, keys);
	}
	return keys.slice();
}
const _patternKeys = /* @__PURE__ */ new Map();
function _collectKeys(node, prefix, keys) {
	if (node.methods) _pushKey(keys, prefix || "/");
	if (node.static) for (const key in node.static) _collectKeys(node.static[key], prefix + "/" + _escapeKey(key), keys);
	if (node.param) _collectKeys(node.param, prefix + PARAM, keys);
	if (node.wildcard) _collectKeys(node.wildcard, prefix + "/**", keys);
	if (node.suffix) _collectSuffixKeys(node.suffix, prefix, "", keys);
}
function _collectSuffixKeys(node, prefix, suffix, keys) {
	if (node.methods) _pushKey(keys, prefix + suffix);
	if (node.static) for (const key in node.static) _collectSuffixKeys(node.static[key], prefix, "/" + _escapeKey(key) + suffix, keys);
	if (node.param) _collectSuffixKeys(node.param, prefix, PARAM + suffix, keys);
}
const PARAM = "/￿";
function _pushKey(keys, key) {
	let n = 0;
	keys.push(key.replace(/\uFFFF/g, () => `:_${n++}`));
}
function _escapeKey(key) {
	return key.replace(/[\\:(){}*]/g, "\\$&");
}
const ATOM = /\\(?:x[\da-f]{2}|u[\da-f]{4}|c[a-z]|k<[^>]*>|\d+|[^])|\[(?:\\[^]|[^\\\]])*\]?|\((?:\?(?:<?[=!]|<[^>]*>|[\w-]*:))?|(?:[*+?]|\{\d+(?:,\d*)?\})\??|[^]/gi;
function canEndInSlash(fragment) {
	const stack = [["", [[]]]];
	for (const atom of fragment.match(ATOM) || []) {
		const [open, alternatives] = stack[stack.length - 1];
		const items = alternatives[alternatives.length - 1];
		if (atom[0] === "(") stack.push([atom, [[]]]);
		else if (atom === ")") {
			if (stack.length === 1) return true;
			stack.pop();
			const parent = stack[stack.length - 1][1];
			parent[parent.length - 1].push(/[=!]$/.test(open) ? [false, true] : join(alternatives));
		} else if (atom === "|") alternatives.push([]);
		else if (/^(?:[*+?]|\{\d)/.test(atom)) {
			if (items.length === 0) return true;
			if (/^(?:[*?]|\{0*[,}])/.test(atom)) items[items.length - 1][1] = true;
		} else if (/^(?:[$^]|\\[bB])$/.test(atom)) items.push([false, true]);
		else if (/^\\[\dk]/.test(atom)) items.push([true, true]);
		else items.push([matchesSlash(atom), false]);
	}
	return stack.length > 1 || join(stack[0][1])[0];
}
function join(alternatives) {
	let slash = false;
	let empty = false;
	for (const items of alternatives) {
		for (let i = items.length - 1; i >= 0 && !slash; i--) {
			slash = items[i][0];
			if (!items[i][1]) break;
		}
		empty ||= items.every((item) => item[1]);
	}
	return [slash, empty];
}
function matchesSlash(atom) {
	try {
		return new RegExp(`^(?:${atom})$`).test("/");
	} catch {
		return true;
	}
}
function canBeEmpty(fragment) {
	try {
		return new RegExp(`^(?:${fragment})$`).test("");
	} catch {
		return true;
	}
}
function tokenize(body) {
	const tokens = [];
	let depth = 0;
	for (const atom of body.match(/\\[^]|\[(?:\\[^]|[^\\\]])*\]?|\)[?*+]?|[^]/g) || []) {
		if (depth === 0) tokens.push("");
		tokens[tokens.length - 1] += atom;
		if (atom === "(") depth++;
		else if (atom[0] === ")" && depth > 0) depth--;
	}
	return tokens;
}
function parseLevel(level) {
	const tokens = tokenize(level);
	let end = tokens.length;
	while (end > 0 && OPTIONAL_GROUP.test(tokens[end - 1])) end--;
	let sep = end - 1;
	while (sep >= 0 && tokens[sep] !== "/" && !SEPARATOR_GROUP.test(tokens[sep])) sep--;
	const last = tokens.slice(sep + 1, end).join("");
	const groups = tokens.slice(end).map((group) => group.slice(4, -2));
	if (groups.slice(0, -1).some((group) => canEndInSlash(group)) || canEndInSlash(last) && !(groups.length === 0 && CATCH_ALL.test(last))) return;
	return [
		tokens.slice(0, sep + 1).join(""),
		last,
		groups
	];
}
function isOptionalGroups(fragment) {
	const tokens = tokenize(fragment);
	return tokens.length > 0 && tokens.every((token) => OPTIONAL_GROUP.test(token));
}
const SEPARATOR_GROUP = /^\(\?:.*\/\)\?$/s;
const OPTIONAL_GROUP = /^\(\?:\/.*\)\?$/s;
const CATCH_ALL = /^\(\?<(\w+)>(\[\\s\\S\]\*|\.\*)\)$/;
function appendsCleanly(prefix, rest) {
	const tokens = tokenize(prefix);
	const all = tokens.concat(tokenize(rest));
	if (tokens.every((token) => literal(token) || LAZY_NAME.test(token))) return true;
	const a = lastAtom(tokens);
	const b = lastAtom(all);
	const [atom, char] = literal(a) ? [b, literal(a)] : [a, literal(b)];
	if (atom && char && !matches(atom, char)) return true;
	return tokens.every((token, i) => {
		if (literal(token)) return true;
		const next = literal(all[i + 1]);
		const capture = CAPTURE.exec(token);
		if (!next || !capture) return false;
		const [, run, , words] = capture;
		return run ? !matches(run, next) : !words.split("|").some((word) => word.includes(next));
	});
}
const LAZY_NAME = /^\(\?<\w+>\[\^\/\]\+\?\)$/;
const CAPTURE = /^\(\?<\w+>(?:(\\[dwsDWS]|\[(?:\\[\s\S]|[^\\\]])*\]|\\\W|[^\\()[\]{}.*+?^$|])([*+?]|\{\d+(?:,\d*)?\})\??|([^\\()[\]{}.*+?^$|]+(?:\|[^\\()[\]{}.*+?^$|]+)*))\)$/;
function literal(token) {
	if (!token) return;
	if (token.length === 2 && token[0] === "\\" && /\W/.test(token[1])) return token[1];
	if (token.length === 1 && !/[\\()[\]{}.*+?^$|]/.test(token)) return token;
}
function lastAtom(tokens) {
	const last = tokens[tokens.length - 1];
	if (literal(last)) return last;
	const capture = CAPTURE.exec(last || "");
	return capture?.[1] && /^(?:\+|\{[1-9])/.test(capture[2]) ? capture[1] : void 0;
}
function matches(atom, c) {
	return new RegExp(`^${atom}$`).test(c);
}
const LOOKBEHIND_SUFFIX = "(?:(?<=/)/|(?<!/)/?)$";
const ANY_TAIL = "(?:[\\s\\S]*[^/])?/*?";
const SOME_TAIL = "(?:[\\s\\S]*[^/]|/)/*?";
function tails(body) {
	return body === ".*" ? [".*?", ".+?"] : [ANY_TAIL, SOME_TAIL];
}
function withTrailingSlash(body) {
	const open = openEnding(body);
	if (open !== void 0) return `${open}/?$`;
	const closed = closedEnding(body);
	return closed === void 0 ? body + LOOKBEHIND_SUFFIX : `${closed}$`;
}
function openOptionals(fragment) {
	return openEnding(fragment);
}
function openEnding(level) {
	const parsed = parseLevel(level);
	if (!parsed) return;
	const [prefix, last, groups] = parsed;
	const inner = groups.pop();
	if (prefix && canBeEmpty(last) || groups.some((group) => canBeEmpty(group))) return;
	if (inner === void 0) {
		const tail = CATCH_ALL.exec(level);
		return tail ? `(?<${tail[1]}>${tails(tail[2])[0]})` : level;
	}
	const out = openEnding(inner);
	if (out === void 0) return;
	return `${level.slice(0, level.length - inner.length - 6)}(?:/${out})?${canBeEmpty(out) ? "?" : ""}`;
}
function closedEnding(level) {
	const parsed = parseLevel(level);
	if (!parsed || parsed[2].length > 1) return;
	const [prefix, last, [inner]] = parsed;
	if (inner === void 0) {
		const param = CATCH_ALL.exec(last);
		if (!prefix) return;
		return param ? `${prefix}(?:/|(?<${param[1]}>${tails(param[2])[1]})/?)` : void 0;
	}
	const tail = optionalTail(inner);
	if (tail === void 0) return;
	if (!prefix || !canBeEmpty(last)) return `${prefix}${last}(?:/${tail})?`;
	return last === "" ? `${prefix}/${tail}` : void 0;
}
function optionalTail(inner) {
	const out = openEnding(inner);
	if (out !== void 0) return `(?:${out}/?)?${canBeEmpty(out) ? "?" : ""}`;
	const parsed = parseLevel(inner);
	const closed = parsed && (parsed[0] || !canBeEmpty(parsed[1])) ? closedEnding(inner) : void 0;
	return closed === void 0 ? void 0 : `(?:${closed})?`;
}
function determinize(source) {
	const { FIRST, BEFORE_OPTIONAL, STAR_CHAIN } = shapes();
	return source.replace(STAR_CHAIN, (_, star, c, chain, name, optional, rest) => {
		const last = !c ? "[^/]" : optional ? `[^/]${not(c)}*` : `${chain ? `${c}?` : ""}${not(c)}*[^/]`;
		const group = `(?<${name || optional}>${last})`;
		return `${star}${c}${chain}${optional ? `(?:${group})?` : group}${rest}`;
	}).replace(FIRST, (match, name, text) => {
		const body = firstBody(text.match(/\\?[\s\S]/g) || []);
		return body ? `(?<${name}>${body})${text}` : match;
	}).replace(BEFORE_OPTIONAL, (_, name, c) => {
		return `(?<${name}>[^/]${not(c)}*${c}??)`;
	});
}
function undeterminize(source) {
	let lazy = "";
	let from = 0;
	for (const match of source.matchAll(/\(\?<(\w+)>\[\^\\?\/\](?:\)|\[\^\\?\/)/g)) {
		const end = closingParen$1(source, match.index);
		if (match.index < from || end < 0) continue;
		lazy += `${source.slice(from, match.index)}(?<${match[1]}>[^/]+?)`;
		from = end + 1;
	}
	lazy = (lazy + source.slice(from)).replace(shapes().STAR_LAST, "(?<$1>[^/]+?)");
	return lazy !== source && determinize(lazy) === source ? lazy : source;
}
function firstBody(lit) {
	if (lit.length === 0) return "[^/]";
	const chars = lit.map((token) => token[token.length - 1]);
	const at = chars.indexOf(chars[0], 1);
	const runs = (rest, exact) => {
		if (rest.length === 0) return exact ? `${not(lit[0])}+` : "";
		const inner = runs(rest.slice(1), exact);
		const next = inner && `|${rest[0]}${inner}`;
		return `(?:${not(lit[0], rest[0])}${not(lit[0])}*${next})?`;
	};
	if (at < 0 || at === chars.length - 1) {
		const rest = lit.slice(1, at < 0 ? void 0 : -1);
		const run = at < 0 ? runs(rest, false) : runs(rest, true);
		return `[^/]${not(lit[0])}*${at < 0 && rest.length === 0 ? "" : `(?:${lit[0]}${run})*`}`;
	}
}
function not(...lits) {
	const chars = lits.map((lit) => lit[lit.length - 1]);
	return `[^/${chars.filter((c) => c !== "-").map((c) => /[[\]\\^]/.test(c) ? `\\${c}` : c).join("")}${chars.includes("-") ? "-" : ""}]`;
}
function closingParen$1(source, at) {
	let depth = 0;
	for (let i = at; i < source.length; i++) {
		const c = source[i];
		if (c === "\\") i++;
		else if (c === "[") {
			for (i++; i < source.length && source[i] !== "]"; i++) if (source[i] === "\\") i++;
		} else if (c === "(") depth++;
		else if (c === ")" && --depth === 0) return i;
	}
	return -1;
}
let _shapes;
function shapes() {
	if (_shapes) return _shapes;
	const LIT = String.raw`(?:\\[^\w\s/]|[^\\()[\]{}|?*+.^$/\s])`;
	const CLS = String.raw`(?:\\[[\]\\^]|[^\\[\]\s/^])`;
	const SLASH = String.raw`\\?\/`;
	const LAZY = String.raw`\(\?<(\w+)>\[\^${SLASH}\]\+\?\)`;
	const ANY_LAZY = String.raw`\(\?<\w+>\[\^${SLASH}\]\+\?\)`;
	const SEGMENT_END = String.raw`(?:\)\??\??)*(?:${SLASH}|\$|\(\?:${SLASH}|\(\?:\(\?<=)`;
	const ABSORB = [
		ANY_LAZY,
		String.raw`\(\?:${ANY_LAZY}\)\?`,
		String.raw`\(\?<\w+>\[\\s\\S\]\*`,
		String.raw`\(\?<\w+>\(\?:\[\\s\\S\]\*\[\^${SLASH}\]\)\?`,
		String.raw`\(\?<\w+>(?:${LIT}\?)?\[\^${SLASH}${CLS}\]\*\[\^${SLASH}\]\)`,
		String.raw`\(\?<\w+>\[\^${SLASH}\]\)`,
		String.raw`\(\?:\(\?<\w+>\[\^${SLASH}\](?:\[\^${SLASH}${CLS}\]\*)?\)\)\?`
	].join("|");
	return _shapes = {
		FIRST: new RegExp(`${LAZY}(${LIT}*)(?=${ABSORB})`, "g"),
		BEFORE_OPTIONAL: new RegExp(String.raw`${LAZY}(?=\(\?:(${LIT})${ANY_LAZY}\)\?(?!\?)${SEGMENT_END})`, "g"),
		STAR_CHAIN: new RegExp(String.raw`(\(\?<\w+>\[\\s\\S\]\*\))(${LIT}?)((?:${ANY_LAZY}\2)*)(?:${LAZY}|\(\?:${LAZY}\)\?(?!\?))(${LIT}*)(?=${SEGMENT_END})`, "g"),
		STAR_LAST: new RegExp(String.raw`\(\?<(\w+)>(?:${LIT}\?)?\[\^${SLASH}${CLS}\]\*\[\^${SLASH}\]\)`, "g")
	};
}
const ANY = "[\\s\\S]*";
const SOME = "[^/]+(?:/[^/]+)*";
const STAR_TAIL = "*";
const STAR_OPEN = "*?";
const STAR_OPEN_LAZY = "*??";
const STAR_BAIL = "*!";
const STAR_SEGMENT = "*/";
function routeToRegExp(route = "/") {
	route = absolutePattern(route);
	addRoute(createRouter(), "", route);
	const [path, unnamed] = starGroups(dotSegments(route));
	return new RegExp(determinize(toRegExp(path, route, unnamed).source));
}
function toRegExp(route, input, unnamed) {
	const inlineOptional = inlineOptionalGroup(route, input, unnamed);
	if (inlineOptional) return inlineOptional;
	const groups = expandGroupDelimiters(route);
	const groupExpanded = groups || (needsModifierExpansion(route) ? expandModifiers(splitRoute(encodeEscapes(route)), input) : void 0);
	if (groupExpanded) return alternation(groupExpanded.map((expandedRoute, i) => toRegExp(expandedRoute, input, groups && i > 0 ? skipGroup(route, input, unnamed) : unnamed)), input);
	return _routeToRegExp(route, input, unnamed);
}
function alternation(regexps, input) {
	const sources = [...new Set(regexps.map((regexp) => regexp.source.slice(1, -1)))];
	if (sources.length === 1) return new RegExp(`^${sources[0]}$`);
	try {
		return new RegExp(`^(?:${sources.join("|")})$`);
	} catch (error) {
		if (!(error instanceof SyntaxError)) throw error;
		throw new SyntaxError(`rou3: the regex for "${input}" repeats a named group across alternatives, which needs duplicate named groups support (Node.js 23+, Chrome 125+, Firefox 129+, Safari 17+)`, { cause: error });
	}
}
function lazyStarGroup(pre, body, input, unnamed) {
	const slash = pre.endsWith("/");
	if (slash === (body.charCodeAt(0) === 47)) return;
	const keys = [];
	for (const segment of splitRoute(slash ? `/${body}` : body)) {
		const key = segment && segmentKey(encodeEscapes(segment));
		if (typeof key !== "string" || key === "") return;
		keys.push(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
	}
	const [segments, ownSeparator, openTail] = routeToRegExpSegments(slash ? pre.slice(0, -1) : pre, input, [], unnamed);
	const base = joinSegments(segments, ownSeparator);
	const last = segments[segments.length - 1];
	const end = openTail === STAR_TAIL ? `${ANY})` : `${ANY}))?`;
	const head = last.slice(0, last.lastIndexOf("(?<")).replace(/\(\?:\/$/, "");
	const empty = openTail === STAR_SEGMENT && !ownSeparator && head === "";
	if ((openTail === STAR_TAIL || openTail === STAR_SEGMENT && (ownSeparator || empty || !canBeEmpty(head))) && base.endsWith(end) && segments.slice(0, -1).concat(head).every((segment) => isFixedSegment(segment))) {
		const body = base.slice(0, -end.length);
		return new RegExp(empty ? `^${body.slice(0, body.lastIndexOf("(?:/"))}/${body.slice(body.lastIndexOf("(?:/") + 4)}${ANY}?)(?:/${keys.join("/")})?/?$` : `^${body}${ANY}?${end.slice(7)}(?:/${keys.join("/")})?/?$`);
	}
}
function inlineOptionalGroup(route, input, unnamed) {
	const group = scanFirstGroup(route);
	if (!group) return;
	const [pre, body, suf, mod] = group;
	if (mod !== "?" || body === "") return;
	const base = absolutePattern(joinGroup(pre, suf));
	const full = absolutePattern(joinGroup(joinGroup(pre, body), suf));
	const inSegment = suf !== "" && suf.charCodeAt(0) !== 47;
	if (expandGroupDelimiters(route).length < 2 || scanFirstGroup(pre) || scanFirstGroup(body) || scanFirstGroup(suf) || needsModifierExpansion(base) || needsModifierExpansion(full)) return;
	const star = suf === "" && /(?<!\\)\*\/?$/.test(pre) ? lazyStarGroup(pre, body, input, unnamed) : void 0;
	if (star || /(?<!\\)\*$/.test(pre)) return star;
	const extra = suf === "" && body.charCodeAt(0) === 47 ? splitRoute(body) : [];
	const [baseSegs, baseOwnSep, baseOpenTail] = routeToRegExpSegments(base, input, extra, skipGroup(route, input, unnamed));
	const [fullSegs, fullOwnSep, openTail] = routeToRegExpSegments(full, input, extra, unnamed);
	const baseLen = baseSegs.length;
	const fullLen = fullSegs.length;
	const starEnding = (tail) => typeof tail === "string" && tail[0] === "*";
	const at = pre.endsWith("/") ? pre.length - 1 : pre.length;
	const starFirst = /^\/\uFFFF?\*(?:\/|$)/.test((pre + body).slice(at)) && pre.charCodeAt(at - 1) !== 47;
	const tailEnding = suf === "" ? starEnding(openTail) && (starFirst && openTail === STAR_OPEN ? STAR_OPEN_LAZY : (openTail !== STAR_SEGMENT || !starFirst) && openTail) : openTail;
	if (baseLen === 0 && suf === "" && starFirst) return new RegExp(`^${ending(joinSegments(fullSegs, fullOwnSep), tailEnding)}`);
	const baseBody = joinSegments(baseSegs, baseOwnSep);
	if (baseOpenTail === STAR_BAIL || openTail === STAR_BAIL || starEnding(baseOpenTail) && baseOpenTail !== openTail || starEnding(openTail) && baseOpenTail !== openTail && (suf !== "" || withTrailingSlash(baseBody) !== `${baseBody}/?$`)) return;
	if (baseLen === 0 || fullLen < baseLen || baseOwnSep !== fullOwnSep || suf !== "" && baseOpenTail !== openTail) return;
	let shared = 0;
	while (shared < baseLen && fullSegs[shared] === baseSegs[shared]) shared++;
	let tail = 0;
	while (tail < baseLen - shared && fullSegs[fullLen - 1 - tail] === baseSegs[baseLen - 1 - tail]) tail++;
	const fixedHead = () => baseSegs.slice(0, shared).every((s) => isFixedSegment(s));
	if (fullLen === baseLen && shared + tail >= baseLen - 1) {
		const i = Math.min(shared, baseLen - 1);
		const prefix = baseSegs[i];
		const last = fullSegs[i];
		const k = prefix.length;
		let merged;
		let lookahead = false;
		if (last === prefix) merged = last;
		else if (inSegment) {
			const x = last.slice(0, last.length - k);
			if (last.endsWith(prefix) && isRegExpSource(x)) merged = `(?:${x})?${prefix}`;
		} else if (last.startsWith(prefix) && isOptionalGroups(last.slice(k))) merged = last;
		else {
			const capture = mergeCapture(prefix, last);
			if (capture) [merged, lookahead] = capture;
			else if (last.startsWith(prefix) && appendsCleanly(prefix, last.slice(k))) {
				const added = last.slice(k);
				merged = `${prefix}(?:${added})?${suf !== "" && added.endsWith(`${SOME})`) && /^\/\(\?<\w+>$/.test(added.slice(0, -17)) ? "?" : ""}`;
			}
		}
		if (!merged || (suf !== "" || lookahead) && !fixedHead()) return;
		const inlineSegs = baseSegs.slice();
		inlineSegs[i] = merged;
		return new RegExp(`^${ending(joinSegments(inlineSegs, fullOwnSep), tailEnding)}`);
	}
	if (inSegment || shared + tail !== baseLen || suf !== "" && !fixedHead()) return;
	const head = shared > 0 ? joinSegments(fullSegs.slice(0, shared), fullOwnSep) : fullOwnSep ? void 0 : "";
	if (head === void 0) return;
	const added = fullSegs.slice(shared, fullLen - tail).join("/");
	const rest = tail > 0 ? `/${baseSegs.slice(baseLen - tail).join("/")}` : "";
	return new RegExp(`^${ending(`${head}(?:/${added})?${rest}`, tailEnding)}`);
}
function isRegExpSource(source) {
	try {
		new RegExp(source);
		return true;
	} catch {
		return false;
	}
}
function mergeCapture(base, full) {
	const match = /^([^(]*\(\?<\w+>)([\s\S]*)\)$/.exec(base);
	if (!match || !full.startsWith(match[1])) return;
	const [, head, body] = match;
	if (/[()]/.test(body.replace(/\\[\s\S]/g, ""))) return;
	let fullBody = body;
	let rest = full.slice(head.length + body.length + 1);
	if (!full.startsWith(`${head}${body})`)) {
		const capture = /^\[\^\/\]\+\?\)([\s\S]+)$/.exec(full.slice(head.length));
		if (!capture || body !== "[^/]+") return;
		fullBody = "[^/]+?";
		rest = capture[1];
	}
	if (!rest) return;
	if (fullBody === "[^/]+?") return [`${head}[^/]+?)(?:${rest})?`, false];
	const first = rest.charCodeAt(0) === 92 ? rest[1] : rest[0];
	if (/^\\[dw][*+]?$/.test(body) && !/[\w([|.?*+{^$]/.test(first)) return [`${base}(?:${rest})?`, false];
	const wrap = (re) => re.includes("|") ? `(?:${re})` : re;
	const ahead = rest.replace(/\(\?<\w+>/g, "(?:");
	return [`${head}${wrap(fullBody)}(?=${ahead}(?:/|$))|${wrap(body)}(?![^/]))(?:${rest})?`, true];
}
function isFixedSegment(segment) {
	const atoms = segment.replace(/\\([\s\S])/g, (_, c) => /[SDWpPux0-9ck]/.test(c) ? "." : "").replaceAll("[^/]", "");
	return !/[./[]|\(\?:/.test(atoms);
}
function needsModifierExpansion(route) {
	const segments = splitRoute(route);
	for (let i = 0; i < segments.length - 1; i++) if (segments[i] === "" && segments.slice(i + 1).every((s) => paramModifier(s))) return true;
	return false;
}
function lazyCatchAll(after, extra) {
	const all = after.concat(extra);
	const kept = all.filter((segment, i) => i < after.length && paramModifier(segment) !== "?");
	if (kept.length === all.length) return;
	for (let a = all.length - 1, b = kept.length - 1; a >= 0; a--, b--) {
		const kind = segmentKind(all[a]);
		const other = b >= 0 ? segmentKind(kept[b]) : 0;
		if (kind !== other) return kind > other;
		if (kind === 3 && all[a] !== kept[b]) return false;
	}
	return true;
}
function segmentKind(segment) {
	const base = segment.replace(/\\./g, "x").replace(/(:[A-Za-z_]\w*(?:\([^)]*\))?)[?+*]$/, "$1");
	if (base === "*" || /^:[A-Za-z_]\w*$/.test(base)) return 0;
	return /[:(*]/.test(base) ? 2 : 3;
}
function paramModifier(segment) {
	return /^:[A-Za-z_]\w*(?:\([^)]*\))?([?+*])$/.exec(encodeEscapes(segment))?.[1];
}
function _routeToRegExp(route, input, unnamed) {
	const [segments, ownSeparator, openTail] = routeToRegExpSegments(route, input, [], unnamed);
	if (openTail === STAR_BAIL) return alternation(expandModifiers(splitRoute(encodeEscapes(route)), input).map((expandedRoute) => toRegExp(expandedRoute, input, unnamed)), input);
	const body = joinSegments(segments, ownSeparator);
	return new RegExp(segments.length > 0 ? `^${ending(body, openTail)}` : "^/$");
}
function starSegmentEnding(body) {
	const out = withTrailingSlash(body);
	const at = out.lastIndexOf(ANY_TAIL);
	if (at < 0) return body.endsWith(`${ANY}))?`) ? `${body.slice(0, -`${ANY}))?`.length)}${ANY_TAIL})/?|(?<!/))$` : out;
	const end = at + 19;
	if (out.endsWith(")/?)??$")) {
		const start = out.lastIndexOf("(?:", at - 1);
		return `${out.slice(0, start)}${out.slice(start + 3, end)})/?$`;
	}
	return out.slice(0, end) + out.slice(end).replace("))??", "))?");
}
const STAR_GROUP = /\(\?:\/\(\?<\w+>\[\\s\\S\]\*\?\)/;
function closingParen(source, at) {
	if (at < 0) return -1;
	let depth = 0;
	for (let i = at; i < source.length; i++) {
		const c = source[i];
		if (c === "\\") i++;
		else if (c === "[") i = source.indexOf("]", i + 1);
		else if (c === "(") depth++;
		else if (c === ")" && --depth === 0) return i;
	}
	return -1;
}
function ending(body, openTail) {
	if (!openTail) return withTrailingSlash(body);
	if (openTail === STAR_SEGMENT) return starSegmentEnding(body);
	if (openTail === STAR_TAIL) return `${body.replace(/\[\\s\\S\]\*\)((?:\)\??)*)$/, (_, closers) => `${ANY_TAIL})${closers.replaceAll(")?", ")??")}`)}/?$`;
	if (openTail === STAR_OPEN || openTail === STAR_OPEN_LAZY) {
		const lazy = body.replace(/(?:\)\?\??)+$/, (closers) => closers.replace(/\)\?\??/g, ")??"));
		const end = openTail === STAR_OPEN ? closingParen(lazy, lazy.search(STAR_GROUP)) : -1;
		return `${end < 0 ? lazy : lazy.slice(0, end + 2) + lazy.slice(end + 3)}/?$`;
	}
	if (typeof openTail === "string") {
		const at = body.lastIndexOf(openTail) + openTail.length;
		const optionals = openOptionals(body.slice(at));
		if (optionals !== void 0) return `${body.slice(0, at)}${optionals}/?$`;
	}
	return `${body}/?$`;
}
function joinSegments(segments, ownSeparator) {
	return (ownSeparator ? "" : "/") + segments.join("/");
}
function routeToRegExpSegments(route, input, extra = [], unnamed = (index) => index) {
	const reSegments = [];
	let idCtr = 0;
	const unnamedKey = (index) => {
		const key = unnamed(index);
		return typeof key === "string" ? toGroupName(key) : `_${key}`;
	};
	let ownSeparator = false;
	let catchAll = false;
	let openTail = false;
	const oneCatchAll = () => {
		if (catchAll) throw new Error(`rou3: a route can have only one \`*\`, \`**\`, \`:name+\` or \`:name*\` (${input})`);
		catchAll = true;
	};
	const groupName = toGroupName;
	let nest = 0;
	let nestValue = false;
	const levels = [];
	const pushOptional = (inner, nestable, lazy = false, free = canBeEmpty(inner)) => {
		const group = `(?:/${inner})?${lazy ? "?" : ""}`;
		if (nestValue && free) {
			if (canBeEmpty(inner)) nest = 0;
			else {
				while (nest > 0 && levels[nest - 1]) nest--;
				nestValue = false;
			}
		}
		if (reSegments.length === 0) {
			ownSeparator = true;
			reSegments.push(group);
		} else {
			const prev = reSegments.pop();
			const at = prev.length - 2 * nest;
			reSegments.push(`${prev.slice(0, at)}${group}${prev.slice(at)}`);
		}
		if (nestable) {
			levels[nest++] = !free;
			nestValue = !free;
		}
	};
	const segments = splitRoute(route);
	const pushCatchAll = (name, required, i, repeat = false, star = false) => {
		const empty = star || !required && !repeat;
		const tail = segments.slice(i + 1);
		const after = star && segments.length - i <= extra.length ? [] : extra;
		const lazy = lazyCatchAll(tail, after);
		const open = lazy && empty && after.length === 0 && tail.every((s) => paramModifier(s) === "?") && !(reSegments.length > 0 && canBeEmpty(reSegments[reSegments.length - 1]));
		const group = `(?<${name}>${empty ? ANY : SOME}${lazy ? "?" : ""})`;
		if (open) openTail = star ? STAR_OPEN : nest === 0 ? `(?:/${group})??` : true;
		else if (star && tail.every((s) => paramModifier(s) === "?")) openTail = STAR_BAIL;
		if (star && open) pushOptional(group, true);
		else if (required) {
			reSegments.push(reSegments.length > 0 ? `${reSegments.pop()}/${group}` : group);
			nest = 0;
		} else pushOptional(group, false, lazy ?? repeat, true);
	};
	const dynamic = (segment) => {
		if (/^:[A-Za-z_]\w*$/.test(segment)) return `(?<${groupName(segment.slice(1))}>[^/]+)`;
		const [regexp, next] = getParamRegexp(encodeEscapes(segment), idCtr, [], input, unnamedKey);
		idCtr = next;
		return greedy(regexp.source.slice(1, -1));
	};
	const greedy = (source) => {
		const out = source.replace(/(\(\?<\w+>)\[\^\/\]\*\)/, `$1${ANY})`);
		if (out !== source) oneCatchAll();
		return out;
	};
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		if (!segment) {
			reSegments.push("");
			nest = 0;
			continue;
		}
		if (segment === "*") {
			oneCatchAll();
			const name = unnamedKey(idCtr++);
			if (i < segments.length - 1) {
				pushCatchAll(name, true, i, false, true);
				continue;
			}
			pushOptional(`(?<${name}>${ANY})`, false);
			openTail = STAR_SEGMENT;
			break;
		} else if (segment.startsWith("**")) {
			oneCatchAll();
			const bare = segment === "**";
			const name = bare ? unnamedKey(idCtr++) : groupName(segment.slice(3));
			if (i < segments.length - 1) {
				pushCatchAll(name, !bare, i);
				continue;
			}
			if (bare) pushOptional(`(?<${name}>${ANY})`, false);
			else reSegments.push(`(?<${name}>${SOME})`);
			break;
		} else if (segmentKey(encodeEscapes(segment)) === 1) {
			const modMatch = encodeEscapes(segment).match(PARAM_MODIFIER);
			if (modMatch && !(modMatch[1] && modMatch[3] === "?")) {
				const [, , base, mod] = modMatch;
				if (mod === "?") {
					pushOptional(dynamic(base), /^:[A-Za-z_]\w*$/.test(base));
					continue;
				}
				const name = groupName(base.slice(1));
				oneCatchAll();
				if (i < segments.length - 1) {
					pushCatchAll(name, mod === "+", i, mod === "*");
					continue;
				}
				const group = `(?<${name}>${SOME})`;
				if (mod === "*") pushOptional(group, false, false, true);
				else {
					reSegments.push(reSegments.length > 0 ? `${reSegments.pop()}/${group}` : group);
					nest = 0;
				}
				continue;
			}
			let regex = dynamic(segment);
			if (i === segments.length - 1 && regex.endsWith(`${ANY})`)) openTail = STAR_TAIL;
			else if (regex.includes(`${ANY})`) && lazyCatchAll(regex.endsWith(`${ANY})`) ? segments.slice(i + 1) : segments.slice(i), extra)) regex = regex.replace(`${ANY})`, `${ANY}?)`);
			reSegments.push(regex);
			nest = 0;
		} else {
			const key = segmentKey(encodeEscapes(segment));
			reSegments.push(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
			nest = 0;
		}
	}
	return [
		reSegments,
		ownSeparator,
		openTail
	];
}
const ROUTE_SPECIAL = /* @__PURE__ */ new Set([
	":",
	"(",
	")",
	"*",
	"\\",
	"+",
	"|",
	"$",
	"[",
	"]"
]);
function regExpToRoute(regexp) {
	if (typeof regexp !== "string" && /[imsuv]/.test(regexp.flags)) throw new Error(`rou3: cannot represent regexp flag(s) "${regexp.flags}" as a route`);
	let src = typeof regexp === "string" ? regexp : regexp.source;
	if (!src.startsWith("^") || !src.endsWith("$") || /(?:^|[^\\])(?:\\\\)*\\\$$/.test(src)) throw new Error(`rou3: regexp must be anchored with \`^\` and \`$\` (${src})`);
	src = undeterminize(src);
	src = src.slice(1, -1);
	src = src.replace(VALUE_CATCH_ALL, "(?<$1>[\\s\\S]+$2)");
	const rootRepeat = ROOT_REPEAT.exec(src);
	if (rootRepeat) return `/:${paramName(rootRepeat[1])}*`;
	src = src.replace(STAR_LOOKBEHIND, "\\/(?<$1>[\\s\\S]*)\\/?");
	const closed = { dot: false };
	const plain = plainBody(src, closed);
	if (plain !== void 0) src = `${plain}\\/?`;
	const dotConstraint = closed.dot || TRAILING_DOT.test(src);
	src = unwrapStar(src.replace(TRAILING_CATCH_ALL, "(?<$1>[\\s\\S]*)$2\\/?").replace(TRAILING_DOT, "(?<$1>.*)$2\\/?"));
	if (src.endsWith(TRAILING_SLASH)) src = src.slice(0, -TRAILING_SLASH.length);
	else if (src.endsWith(LEGACY_TRAILING_SLASHES)) src = src.slice(0, -LEGACY_TRAILING_SLASHES.length);
	else if (src.endsWith("\\/?")) {
		src = src.slice(0, -3);
		if (/\\\/\((?:\?<_\d+>)?\[\^\/\]\*\)$/.test(src)) throw new Error(`rou3: a last segment \`[^/]*\` before a plain \`\\/?\` has no route form (it matches "" before a trailing slash)`);
	}
	if (src === "" || src === "\\/") return "/";
	const route = parseSegments(src, true, !dotConstraint).join("/");
	if (route.charCodeAt(0) !== 123 || src.startsWith("\\/")) return `/${route}`;
	const check = (r) => {
		for (const p of expandGroupDelimiters(r, route) || []) if (p.charCodeAt(0) === 123) check(p);
	};
	check(route);
	return route;
}
const VALUE_CATCH_ALL = /\(\?<(\w+)>\[\^\/\]\+\(\?:\\\/\[\^\/\]\+\)\*(\??)\)/g;
const STAR_LOOKBEHIND = /\(\?:\\\/\(\?<(\w+)>\(\?:\[\\s\\S\]\*\[\^\/\]\)\?\\\/\*\?\)\\\/\?\|\(\?<!\\\/\)\)$/;
const REQUIRED_PARAM = /\(\?:\(\?<(\w+)>\[\^\/\]\+\)\\\/\?\|\\\/\)$/;
const REQUIRED_VALUE = /\(\?:\\\/\\\/\|\(\?<(\w+)>\(\?:\[\\s\\S\]\*\[\^\/\]\|\\\/\\\/\)\\\/\*\?\)\\\/\?\)$/;
const REQUIRED_CATCH_ALL = /\(\?:\\\/\|\(\?<(\w+)>\(\?:\[\\s\\S\]\*\[\^\/\]\|\\\/\)\\\/\*\?\)\\\/\?\)$/;
const TRAILING_CATCH_ALL = /\(\?<(\w+)>\(\?:\[\\s\\S\]\*\[\^\/\]\)\?\\\/\*\?\)((?:\)\?\??)*)\\\/\?$/;
const ROOT_REPEAT = /^\(\?:\\\/\?\(\?<(\w+)>\(\?:\[\\s\\S\]\*\[\^\/\]\)\?\\\/\*\?\)\)\?\?\\\/\?$/;
const REQUIRED_DOT = /\(\?:\\\/\|\(\?<(\w+)>\.\+\?\)\\\/\?\)$/;
const TRAILING_DOT = /(?<=\(\?:\\\/)\(\?<(\w+)>\.\*\?\)(\)\?\?(?:\)\?\??)*)\\\/\?$/;
const REQUIRED_HEAD = /\(\?:\(\?<(\w+)>\[\^\/\]\+\)\(\?:\\\/\|\$\)\|\\\/\)$/;
const REQUIRED_ENDINGS = [
	[REQUIRED_PARAM, "[^/]*"],
	[REQUIRED_VALUE, "[\\s\\S]+"],
	[REQUIRED_CATCH_ALL, "[\\s\\S]+"],
	[REQUIRED_DOT, ".*"]
];
function plainBody(src, closed) {
	for (const [ending, body] of REQUIRED_ENDINGS) {
		const required = ending.exec(src);
		if (required) {
			closed.dot ||= body === ".*";
			return `${src.slice(0, required.index)}(?<${required[1]}>${body})`;
		}
	}
	const group = trailingGroup(src);
	if (!group) return;
	const [start, inner, lazy] = group;
	const before = src.slice(0, start);
	if (!lazy && inner.startsWith("\\/")) {
		const tail = plainTail(inner.slice(2), closed);
		if (tail !== void 0) return before + tail;
	}
	const tail = plainTail(src.slice(start), closed);
	if (tail === void 0) return;
	const head = REQUIRED_HEAD.exec(before);
	if (head) return `${before.slice(0, head.index)}(?<${head[1]}>[^/]*)${tail}`;
	return before.endsWith("\\/\\/") ? before.slice(0, -2) + tail : void 0;
}
function plainTail(x, closed) {
	const group = trailingGroup(x);
	if (!group || group[0] !== 0) return;
	const [, inner, lazy] = group;
	if (inner.endsWith("\\/?")) return `(?:\\/${inner.slice(0, -3)})?${lazy ? "?" : ""}`;
	const body = lazy ? void 0 : plainBody(inner, closed);
	return body === void 0 ? void 0 : `(?:\\/${body})?`;
}
function trailingGroup(src) {
	for (let i = 0; i < src.length;) if (src[i] === "(") {
		const end = readGroup(src, i);
		const quantifier = src.slice(end);
		if (src.startsWith("(?:", i) && (quantifier === "?" || quantifier === "??")) return [
			i,
			src.slice(i + 3, end - 1),
			quantifier === "??"
		];
		i = end;
	} else if (src[i] === "[") {
		i++;
		while (i < src.length && src[i] !== "]") i += src[i] === "\\" ? 2 : 1;
		i++;
	} else i += src[i] === "\\" ? 2 : 1;
}
function isCatchAll(body, dot, value) {
	return body === "[\\s\\S]*" || body === "[\\s\\S]*?" || dot && body === ".*" || !!value && (body === "[\\s\\S]+" || body === "[\\s\\S]+?");
}
function continues(src, i) {
	return src.startsWith("\\/", i) || src.startsWith("(?:", i);
}
function parseSegments(src, atEnd, dot, inGroup = false) {
	const segments = [];
	const n = src.length;
	let i = 0;
	while (i < n) {
		if (src.startsWith("(?:", i)) {
			const end = readGroup(src, i);
			if (src[end] !== "?") throw new Error(`rou3: unsupported non-optional group in "${src}"`);
			const lazy = src[end + 1] === "?";
			const next = end + (lazy ? 2 : 1);
			const inner = src.slice(i + 3, end - 1);
			applyOptional(segments, inner, atEnd && next === n, lazy, dot, inGroup);
			i = next;
			if (i < n && !continues(src, i) && !inGroup && !inner.includes("\\/")) {
				const end = segmentEnd(src, i);
				if (src.startsWith("(?:", end) && !src.startsWith("(?:\\/", end)) throw new Error(`rou3: unsupported optional group after a group in "${src}"`);
				segments[segments.length - 1] += reverseSegment(src.slice(i, end), true);
				i = end;
			}
			continue;
		}
		if (src.startsWith("\\/?", i)) {
			const g = matchNamedGroup(src, i + 3);
			if (g && g.end === n && (g.body === ".+" || isCatchAll(g.body, dot))) {
				segments.push(g.body === ".+" ? `**:${g.name}` : g.unnamed || g.name === "_" ? "**" : `:${g.name}*`);
				break;
			}
			if (g && g.name === "_" && isCatchAll(g.body, dot) && src.startsWith("\\/", g.end)) {
				segments.push("**");
				i = g.end;
				continue;
			}
		}
		if (src.startsWith("\\/", i)) {
			const g = matchNamedGroup(src, i + 2);
			if (g && (g.end === n || continues(src, g.end)) && isCatchAll(g.body, dot, true) && !g.unnamed) {
				segments.push(STAR_BODY.test(g.body) ? `:${g.name}(.*)` : `:${g.name}+`);
				i = g.end;
				continue;
			}
		}
		if (src.startsWith("\\/", i)) {
			const end = segmentEnd(src, i + 2);
			segments.push(reverseSegment(src.slice(i + 2, end)));
			i = end;
			continue;
		}
		throw new Error(`rou3: cannot parse "${src}" at index ${i}`);
	}
	return segments.map((segment) => literalDots(segment).replace(/^([^{]+)\{(:[A-Za-z_]\w*(?:\([^)]*\))?)\}\?$/, "$1$2?"));
}
function reverseSegment(seg, part) {
	const whole = !part && matchNamedGroup(seg, 0);
	if (whole && whole.end === seg.length && whole.body === ".+") return `:${whole.name}+`;
	let out = "";
	let i = 0;
	let afterName = false;
	let afterStar = false;
	let lastBody = "";
	const literal = (at) => {
		const ch = String.fromCodePoint(seg.codePointAt(at));
		const encoded = ch.charCodeAt(0) < 65533 ? encodeLiteral(ch) : encodeURIComponent(ch);
		if (encoded !== ch) throw new Error(`rou3: no route has a literal ${JSON.stringify(ch)} (route text is percent-encoded, write it as ${encoded}) in "${seg}"`);
		out += afterName && /\w/.test(ch) ? `\\${ch}` : escapeLiteral(ch);
		afterName = afterStar = false;
		return ch.length;
	};
	const param = (token, name) => {
		if (token === "*" && !afterStar && (afterName || out.endsWith(")"))) token = "(.*)";
		if (afterName && token[0] === "(") out += `([^\\x2f]${lastBody.slice(4)})`;
		else if (afterName && token[0] !== ":" || token === "*" && (afterStar || out.endsWith(")"))) throw new Error(`rou3: no route has a param followed by a group in "${seg}"`);
		out += token;
		afterName = token === `:${name}`;
		afterStar = token === "*";
	};
	while (i < seg.length) {
		const c = seg[i];
		if (c === "(") {
			const g = matchNamedGroup(seg, i);
			if (g) {
				param(paramToken(g.name, g.body, g.unnamed), g.name);
				lastBody = g.body;
				i = g.end;
				continue;
			}
			if (!seg.startsWith("(?", i)) {
				const end = readGroup(seg, i);
				param(paramToken("_0", seg.slice(i + 1, end - 1), true));
				i = end;
				continue;
			}
			throw new Error(`rou3: unsupported group construct in "${seg}"`);
		}
		if (c === "\\") {
			const next = seg[i + 1];
			if (next === void 0) throw new Error(`rou3: dangling escape in "${seg}"`);
			if (/[a-z0-9]/i.test(next)) throw new Error(`rou3: unsupported escape "\\${next}" in "${seg}"`);
			i += 1 + literal(i + 1);
			continue;
		}
		if (BARE_META.has(c)) throw new Error(`rou3: unsupported metacharacter "${c}" in "${seg}"`);
		i += literal(i);
	}
	return part ? out : literalDots(out);
}
const TRAILING_SLASH = "(?:(?<=\\/)\\/|(?<!\\/)\\/?)";
const LEGACY_TRAILING_SLASHES = "(?:\\/\\/|(?<!\\/)\\/?)";
const BARE_META = /* @__PURE__ */ new Set([
	".",
	"^",
	"$",
	"*",
	"+",
	"?",
	"|",
	"[",
	"]",
	"{",
	"}",
	")"
]);
function applyOptional(segments, inner, last, lazy, dot, inGroup) {
	if (inner.startsWith("\\/")) {
		const rest = inner.slice(2);
		const nested = NESTED_CATCH_ALL.exec(rest);
		if (nested && !UNNAMED.test(nested[1]) && !UNNAMED.test(nested[3])) {
			const [catchAll, last] = [nested[1], nested[3]].map(paramName);
			segments.push(catchAll === "_" && nested[2] === "*" ? "**" : `:${catchAll}*`);
			segments.push(`:${last}?`);
			return;
		}
		const g = matchNamedGroup(rest, 0);
		if (g && g.end === rest.length) {
			if (g.unnamed && isCatchAll(g.body, dot)) {
				segments.push("**");
				return;
			}
			if (g.unnamed) {
				if (inGroup) throw new Error(`rou3: no route has an optional unnamed capture in a group in "${inner}"`);
				mergeGroup(segments, `/${paramToken(g.name, g.body, true)}`, false, last);
				return;
			}
			if (g.name === "_" && isCatchAll(g.body, dot)) {
				if (!lazy || g.body.endsWith("?")) segments.push("**");
				else if (segments.length > 0 && !inGroup) mergeGroup(segments, "/**", false, last);
				else segments.push(":_*");
				return;
			}
			if (STAR_BODY.test(g.body) && !inGroup) {
				mergeGroup(segments, `/:${g.name}(.*)`, false, last);
				return;
			}
			segments.push(optionalParam(g, dot));
			return;
		}
		const units = (segments.length === 0 || inGroup) && g && !g.unnamed && /^\[\^\/\][*+]$/.test(g.body) ? optionalUnits(rest.slice(g.end)) : void 0;
		if (g && units) {
			segments.push(optionalParam(g, dot));
			for (const [i, [unit, unitLazy]] of units.entries()) applyOptional(segments, unit, last && i === units.length - 1, unitLazy, dot, inGroup);
			return;
		}
		mergeGroup(segments, `/${parseSegments(inner, last, dot, true).join("/")}`, inGroup, last);
		return;
	}
	mergeGroup(segments, reverseSegment(inner), inGroup, last);
}
function optionalUnits(src) {
	const units = [];
	for (let i = 0; i < src.length;) {
		if (!src.startsWith("(?:\\/", i)) return;
		const end = readGroup(src, i);
		if (src[end] !== "?") return;
		const lazy = src[end + 1] === "?";
		units.push([src.slice(i + 3, end - 1), lazy]);
		i = end + (lazy ? 2 : 1);
	}
	return units.length > 0 ? units : void 0;
}
function mergeGroup(segments, body, inGroup, last) {
	if (scanFirstGroup(body)) throw new Error(`rou3: no route has a group inside a group in "{${body}}?"`);
	if (segments.length === 0) {
		if (inGroup || body.charCodeAt(0) !== 47) throw new Error(`rou3: optional group "{${body}}?" has no preceding segment`);
		segments.push(`{${body}}?`);
		return;
	}
	let k = segments.length - 1;
	while (k > 0 && /^:[A-Za-z_]\w*(?:\(.*\))?\?$/.test(segments[k])) k--;
	if (last && segments[k] === "") throw new Error(`rou3: optional group "{${body}}?" after an empty segment has no route form`);
	segments[segments.length - 1] += `{${body}}?`;
}
function paramToken(name, body, unnamed) {
	if (STAR_BODY.test(body)) return unnamed ? "*" : `:${name}(.*)`;
	if (unnamed && body === "[^/]*") return "([^\\x2f]*)";
	if (!unnamed && /^\[\^\/\](?:\*|\+\??)$/.test(body)) return `:${name}`;
	return unnamed ? constraint(body) : `:${name}${constraint(body)}`;
}
function optionalParam({ name, body }, dot) {
	if (body === "[^/]*" || body === "[^/]+") return `:${name}?`;
	if (isCatchAll(body, dot, true)) return `:${name}*`;
	return `:${name}${constraint(body)}?`;
}
const NESTED_CATCH_ALL = /^\(\?:\(\?<(\w+)>\[\\s\\S\]([*+])\)\\\/\)\?\(\?<(\w+)>\[\^\/\]\*\)$/;
function constraint(body) {
	if (body.includes("/")) throw new Error(`rou3: param constraint "(${body})" cannot contain "/"`);
	if (/[\t\n\r]/.test(body)) throw new Error(`rou3: param constraint "(${body})" cannot contain a raw tab, LF or CR`);
	if (/\((?!\?(?!<[^=!]))/.test(body.replace(/\\[\s\S]|\[(?:\\[\s\S]|[^\]])*\]/g, ""))) throw new Error(`rou3: param constraint "(${body})" cannot contain a capturing group`);
	if (classSetOp(body.replace(/\\[\s\S]/g, "_"))) throw new Error(`rou3: param constraint "(${body})" cannot contain a \`--\` / \`&&\` in a class`);
	return `(${body})`;
}
function escapeLiteral(ch) {
	return ROUTE_SPECIAL.has(ch) ? `\\${ch}` : ch;
}
const STAR_BODY = /^\[\\s\\S\]\*\??$/;
const UNNAMED = /^_\d+$/;
function matchNamedGroup(src, start) {
	if (!src.startsWith("(?<", start)) return;
	const after = src[start + 3];
	if (after === "=" || after === "!") return;
	const gt = src.indexOf(">", start);
	if (gt === -1) return;
	const end = readGroup(src, start);
	const key = src.slice(start + 3, gt);
	return {
		name: paramName(key),
		body: src.slice(gt + 1, end - 1),
		end,
		unnamed: UNNAMED.test(key)
	};
}
function paramName(key) {
	const name = fromGroupName(key);
	if (!/^[A-Za-z_]\w*$/.test(name)) throw new Error(`rou3: "${name}" is not a valid param name`);
	return name;
}
function readGroup(src, start) {
	let depth = 0;
	let inClass = false;
	for (let i = start; i < src.length; i++) {
		const c = src[i];
		if (inClass) {
			if (c === "\\") i++;
			else if (c === "]") inClass = false;
			continue;
		}
		if (c === "\\") i++;
		else if (c === "[") inClass = true;
		else if (c === "(") depth++;
		else if (c === ")" && --depth === 0) return i + 1;
	}
	throw new Error(`rou3: unbalanced group in "${src}"`);
}
function unwrapStar(src) {
	const at = src.search(/\(\?:\\\/\(\?<(?!_>)\w+>\[\\s\\S\]\*\??\)/);
	if (at < 0) return src;
	const end = readGroup(src, at);
	const lazyBody = src[src.indexOf(")", at + 5) - 1] === "?";
	if (src[end] !== "?" || src[end + 1] === "?" || !lazyBody && !/^(?:\)\?\??)*\\\/\?$/.test(src.slice(end + 1))) return src;
	return src.slice(0, at) + src.slice(at + 3, end - 1) + src.slice(end + 1);
}
function segmentEnd(src, start) {
	let depth = 0;
	let inClass = false;
	let i = start;
	while (i < src.length) {
		if (inClass) {
			if (src[i] === "\\") i++;
			else if (src[i] === "]") inClass = false;
			i++;
			continue;
		}
		if (depth === 0 && (src.startsWith("\\/", i) || src.startsWith("(?:", i))) break;
		const c = src[i];
		if (c === "\\") i += 2;
		else if (c === "[") {
			inClass = true;
			i++;
		} else {
			if (c === "(") depth++;
			else if (c === ")") depth--;
			i++;
		}
	}
	return i;
}
function literalDots(segment) {
	return /^(?:\.|%2e){1,2}$/i.test(segment) ? segment.replace(/[.%]/g, "\\$&") : segment;
}
export { NullProtoObj, addRoute, compareRoutes, createRouter, findAllRoutes, findOverlappingRoutes, findRoute, regExpToRoute, removeRoute, routeNodeKeys, routeToRegExp, routesOverlap };
