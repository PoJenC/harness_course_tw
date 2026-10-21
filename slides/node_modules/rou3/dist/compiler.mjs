const UNNAMED_GROUP_PREFIX = "__rou3_unnamed_";
const ESCAPED_GROUP_PREFIX = "__rou3_esc_";
function fromGroupName(key) {
	if (key.charCodeAt(0) !== 95) return key;
	if (key.startsWith("__rou3_esc_")) return key.slice(11).replace(/__|_h/g, (c) => c === "__" ? "_" : "-");
	return key.startsWith("__rou3_unnamed_") ? key.slice(15) : key;
}
const NullProtoObj = /* @__PURE__ */ (() => {
	const e = function() {};
	return e.prototype = Object.create(null), Object.freeze(e.prototype), e;
})();
function reverseVariants(entries) {
	let out;
	for (let i = 0, j; i < entries.length; i = j) {
		const token = entries[i].variants;
		for (j = i + 1; token && entries[j]?.variants === token; j++);
		if (j - i > 1) (out ??= entries.slice()).splice(i, j - i, ...entries.slice(i, j).reverse());
	}
	return out || entries;
}
function compileRouter(router, opts) {
	const ctx = {
		opts: opts || {},
		router,
		data: []
	};
	const compiled = compileRouteMatch(ctx);
	if (ctx.data.length < DATA_ARGS_MAX) return new Function(...ctx.data.map((_, i) => `$${i}`), `return(m,p)=>{${compiled}}`)(...ctx.data);
	const arrayCtx = {
		opts: opts || {},
		router,
		data: [],
		dataArray: true
	};
	return new Function("$", `return(m,p)=>{${compileRouteMatch(arrayCtx)}}`)(arrayCtx.data);
}
function compileRouterToString(router, opts, legacyOpts) {
	const functionName = typeof opts === "string" ? opts : opts?.functionName;
	if (typeof opts !== "object" || !opts) opts = legacyOpts || {};
	const ctx = {
		opts,
		router,
		data: [],
		compileToString: true
	};
	let compiled = `(m,p)=>{${compileRouteMatch(ctx)}}`;
	if (ctx.data.length > 0) compiled = `/* @__PURE__ */ (() => { ${`const ${ctx.data.map((v, i) => `$${i}=${v}`).join(",")};`} return ${compiled}})()`;
	return functionName ? `const ${functionName}=${compiled};` : compiled;
}
const DATA_ARGS_MAX = 32e3;
function compileRouteMatch(ctx) {
	const matchAll = ctx.opts?.matchAll;
	ctx.rank = hasSuffixTrie(ctx.router.root);
	let code = compileStaticMatch(ctx);
	let match = compileNode(ctx, ctx.router.root, [], 1, 1);
	if (ctx.rank && !matchAll) {
		const opts = ctx.opts;
		ctx.opts = {
			...opts,
			matchAll: true
		};
		ctx.collector = true;
		const all = compileNode(ctx, ctx.router.root, [], 1, 1);
		ctx.opts = opts;
		ctx.collector = false;
		const probe = compileSuffixProbe(ctx, ctx.router.root, 1);
		if (probe !== "false") match = `if(${probe}){let r=[],k=[];${all}r=${rankRef(ctx)}(r.reverse(),k.reverse(),l-1);return r[r.length-1]}${match}`;
	}
	if (match) {
		const tempNames = Array.from({ length: ctx.regexTemps || 0 }, (_, i) => `_m${i}`);
		if (ctx.starStarTemp) tempNames.push("_w");
		if (ctx.variants && !ctx.rank) for (let i = 0; i < ctx.variants.size; i++) tempNames.push(`_g${i}`);
		const temps = tempNames.length > 0 ? `let ${tempNames.join(",")};` : "";
		code += `let s=p.split("/");let l=s.length;${temps}${match}`;
	}
	if (!code) return ctx.opts?.matchAll ? `return [];` : "";
	const normalizeHelper = code.includes("_normalizeGroups(") ? `const _u=${JSON.stringify(UNNAMED_GROUP_PREFIX)},_e=${JSON.stringify(ESCAPED_GROUP_PREFIX)};const _normalizeGroups=(g)=>{if(!g)return g;for(const k in g){const n=k.startsWith(_u)?k.slice(_u.length):(k.startsWith(_e)?k.slice(_e.length).replace(/__|_h/g,(c)=>c==="__"?"_":"-"):k);if(n!==k){g[n]=g[k];delete g[k]}}return g;};` : "";
	const normalizePathHelper = ctx.opts?.normalize ? `if(p.includes("/.")){let _r=[],_v;for(_v of p.split("/")){if(_v===".")continue;if(_v==="..")_r.length>1&&_r.pop();else _r.push(_v)}if(_v==="."||_v==="..")_r.push("");p=_r.join("/")||"/"}` : "";
	const collect = ctx.rank ? `let r=[],k=[];` : `let r=[];`;
	const done = ctx.rank ? `return ${rankRef(ctx)}(r.reverse(),k.reverse(),l-1);` : "return r.reverse();";
	const strip = ctx.slash ? `let t=p.charCodeAt(p.length-1)===47;if(t)p=p.slice(0,-1);` : `if(p.charCodeAt(p.length-1)===47)p=p.slice(0,-1);`;
	return `${matchAll ? collect : ""}${normalizeHelper}${normalizePathHelper}${strip}${code}${matchAll ? done : ""}`;
}
const STATIC_CHAIN_MAX = 8;
const SEGMENT_CHAIN_MAX = 32;
function compileStaticMatch(ctx) {
	const matchAll = ctx.opts?.matchAll;
	const entries = [];
	let mixed = false;
	for (const key in ctx.router.static) {
		const node = ctx.router.static[key];
		if (node?.methods) {
			entries.push([key, node]);
			if (node.methods[""]?.length && Object.keys(node.methods).length > 1) mixed = true;
		}
	}
	if (entries.length <= STATIC_CHAIN_MAX) {
		let code = "";
		for (const [nk, node] of entries) {
			const body = compileMethodMatch(ctx, node.methods, [], -1);
			code += `${code ? "else " : ""}if(p===${JSON.stringify(nk)}){${body}}`;
		}
		return code;
	}
	const jitMap = ctx.compileToString ? void 0 : new NullProtoObj();
	let mapCode = "";
	for (const [nk, node] of entries) {
		const jitMethods = jitMap ? new NullProtoObj() : void 0;
		let methodsCode = "";
		for (const method in node.methods) {
			const matchers = node.methods[method];
			if (matchers && matchers.length > 0) {
				if (jitMethods) jitMethods[method] = matchAll ? staticOnce(matchers).map((m) => m.data) : matchers[0].data;
				else {
					const refs = (matchAll ? staticOnce(matchers) : matchers).map((m) => serializeData(ctx, m));
					methodsCode += `${JSON.stringify(method)}:${matchAll ? `[${refs.join(",")}]` : refs[0]},`;
				}
			}
		}
		if (jitMethods ? Object.keys(jitMethods).length === 0 : !methodsCode) continue;
		if (jitMap) jitMap[nk] = jitMethods;
		else mapCode += `${JSON.stringify(nk)}:{__proto__:null,${methodsCode}},`;
	}
	if (jitMap ? Object.keys(jitMap).length === 0 : !mapCode) return "";
	const lookup = `let _n=${pushDataSlot(ctx, jitMap ? jitMap : `{__proto__:null,${mapCode}}`)}[p];`;
	if (!matchAll) return `${lookup}if(_n!==void 0){let _d=_n[m];if(_d===void 0)_d=_n[""];if(_d!==void 0)return {data:_d};}`;
	const push = ctx.rank ? `{r.push({data:_a[_i]});k.push(${rankDescriptor(ctx)})}` : `r.push({data:_a[_i]});`;
	if (mixed) {
		const loop = `if(_a!==void 0)for(let _i=_a.length-1;_i>=0;_i--)${push}`;
		return `${lookup}if(_n!==void 0){let _a=_n[m];${loop}if(m!==""){_a=_n[""];${loop}}}`;
	}
	return `${lookup}if(_n!==void 0){let _a=_n[m];if(_a===void 0)_a=_n[""];if(_a!==void 0)for(let _i=_a.length-1;_i>=0;_i--)${push}}`;
}
function compileMethodMatch(ctx, methods, params, currentIdx, suffixGuard) {
	const compile = (matchers) => {
		const all = ctx.opts?.matchAll && !ctx.collector;
		const compiled = (all ? reverseVariants(staticOnce(matchers)) : matchers).map((m) => compileFinalMatch(ctx, m, currentIdx, params, suffixGuard));
		return all ? compiled.reverse() : compiled;
	};
	const emit = (compiled) => compiled.sort((a, b) => b.weight - a.weight).map((m) => m.code).join("");
	const any = methods[""]?.length ? compile(methods[""]) : void 0;
	let code = "";
	for (const key in methods) {
		const matchers = methods[key];
		if (key !== "" && matchers && matchers.length > 0) {
			const own = compile(matchers);
			const body = emit(any ? own.concat(any) : own);
			code += `${code ? "else " : ""}if(m===${JSON.stringify(key)}){${body}}`;
		}
	}
	const fallback = any ? emit(any) : "";
	return fallback ? code ? `${code}else{${fallback}}` : fallback : code;
}
function compileFinalMatch(ctx, data, currentIdx, params, suffixGuard) {
	let ret = `{data:${serializeData(ctx, data)}`;
	const conditions = [];
	let guardConditions = 0;
	let starWeight = 0;
	const catchAll = suffixGuard && data.paramsMap.find(([index, , optional]) => index < 0 && !optional);
	if (catchAll) {
		conditions.push(suffixGuard);
		if (catchAll[3]) {
			guardConditions++;
			starWeight = 2;
		}
	}
	const { paramsMap } = data;
	if (paramsMap && paramsMap.length > 0) {
		const lastParam = paramsMap[paramsMap.length - 1];
		if (currentIdx !== -1) {
			const star = !lastParam[2] && !!lastParam[3] && !lastParam[5];
			if (star) starWeight = 2;
			if (!lastParam[2] && !star) conditions.push(`l>${currentIdx}`);
			else if (lastParam[0] < 0 && paramsMap.length > 1) {
				conditions.push(`l>${currentIdx - 1}`);
				guardConditions++;
			}
		}
		let paramsCode = "";
		let starStar;
		let present = "";
		const join = paramsMap.find((map) => map[5] && map[0] < 0)?.[1];
		const pieces = [];
		const prop = (key, value, nonEmpty) => {
			if (key !== join) return `${propKey(key)}:${value},`;
			pieces.push([value, nonEmpty]);
			return pieces.length > 1 ? "" : `${propKey(key)}:\0,`;
		};
		let tmpCount = 0;
		for (let i = 0; i < paramsMap.length; i++) {
			const map = paramsMap[i];
			if (typeof map[1] === "string") {
				let code = prop(map[1], params[i], map[5] ? suffixGuard || `l>${currentIdx}` : void 0);
				if (map[0] < 0 && map[2] && !map[5]) {
					code = `${propKey(map[1])}:_w=${params[i]},_:_w,`;
					ctx.starStarTemp = true;
					starStar = [paramsCode.length, paramsCode.length + code.length];
					present = suffixGuard || `l>${currentIdx}`;
				} else if (map[0] < 0 && map[3] && !map[5] && currentIdx !== -1) {
					starStar = [paramsCode.length, paramsCode.length + code.length];
					ctx.slash = true;
					present = `(l>${currentIdx}||t)`;
				}
				paramsCode += code;
				const guard = nonEmptyGuard(ctx, map, params[i], data.suffix);
				if (guard) {
					conditions.push(guard);
					guardConditions++;
				}
				continue;
			}
			const regexp = serializeRegExp(ctx, map[1]);
			const groups = scanRegExpGroups(map[1].source);
			if (map[3] && data.suffix) {
				guardConditions++;
				starWeight++;
			}
			if (!groups) {
				const tmp = `_m${tmpCount++}`;
				conditions.push(`(${tmp}=${regexp}.exec(${params[i]}))!==null`);
				paramsCode += `..._normalizeGroups(${tmp}.groups),`;
			} else if (groups.names.length === 0) conditions.push(`${regexp}.test(${params[i]})`);
			else if (groups.whole) {
				conditions.push(`${regexp}.test(${params[i]})`);
				paramsCode += prop(fromGroupName(groups.names[0]), params[i]);
			} else {
				const tmp = `_m${tmpCount++}`;
				conditions.push(`(${tmp}=${regexp}.exec(${params[i]}))!==null`);
				for (const name of groups.names) {
					const key = fromGroupName(name);
					paramsCode += key === map[4] ? `...(${tmp}.groups.${name}!==void 0&&{${propKey(key)}:${tmp}.groups.${name}}),` : prop(key, `${tmp}.groups.${name}`);
				}
			}
		}
		if (tmpCount > (ctx.regexTemps || 0)) ctx.regexTemps = tmpCount;
		if (pieces.length > 0) {
			let value = "";
			for (let k = 0; k < pieces.length; k++) {
				const [piece, nonEmpty] = pieces[k];
				value += nonEmpty ? k ? `+(${nonEmpty}?"/"+${piece}:"")` : `(${nonEmpty}?${piece}+"/":"")` : k === 0 ? piece : k === 1 && pieces[0][1] ? `+${piece}` : `+"/"+${piece}`;
			}
			paramsCode = paramsCode.replace("\0", () => value);
		}
		ret = starStar ? `${present}?${ret},params:{${paramsCode}}}:${ret},params:{${paramsCode.slice(0, starStar[0])}${paramsCode.slice(starStar[1])}}` : `${ret},params:{${paramsCode}}`;
	}
	ret += "}";
	const variant = variantCode(ctx, data);
	if (variant) {
		conditions.unshift(...variant);
		guardConditions += variant.length;
	}
	const flag = variant && !ctx.rank ? `_g${ctx.variants.get(data.variants)}=` : "";
	const push = ctx.rank ? `{r.push(${ret});k.push(${rankDescriptor(ctx, data)})}` : `${flag}r.push(${ret});`;
	return {
		code: (conditions.length > 0 ? `if(${conditions.join("&&")})` : "") + (ctx.opts?.matchAll ? push : `return ${ret};`),
		weight: 4 * (conditions.length - guardConditions) + starWeight + data.rank
	};
}
function compileNode(ctx, node, params, currentIdx, staticPrefixLen) {
	let code = "", hasIf = false;
	if (node.methods && params.length > 0) {
		const match = compileMethodMatch(ctx, node.methods, params, -1);
		if (match) {
			code += `if(l===${currentIdx}){${match}}`;
			hasIf = true;
		}
	}
	if (node.static) {
		const children = [];
		for (const key in node.static) {
			const match = compileNode(ctx, node.static[key], params, currentIdx + 1, staticPrefixLen < 0 ? -1 : staticPrefixLen + key.length + 1);
			if (match) children.push([key, match]);
		}
		if (children.length > SEGMENT_CHAIN_MAX) {
			const jitMap = ctx.compileToString ? void 0 : new NullProtoObj();
			let mapCode = "";
			let cases = "";
			for (const [i, [key, match]] of children.entries()) {
				if (jitMap) jitMap[key] = i;
				else mapCode += `${propKey(key)}:${i},`;
				cases += `case ${i}:{${match}}break;`;
			}
			const ref = pushDataSlot(ctx, jitMap ? jitMap : `{__proto__:null,${mapCode}}`);
			code += `${hasIf ? "else " : ""}if(l>${currentIdx}){switch(${ref}[s[${currentIdx}]]){${cases}}}`;
			hasIf = true;
		} else if (children.length > 0) {
			let staticCode = "";
			const notNeedBoundCheck = hasIf;
			for (const [key, match] of children) {
				staticCode += `${hasIf ? "else " : ""}if(s[${currentIdx}]===${JSON.stringify(key)}){${match}}`;
				hasIf = true;
			}
			code += notNeedBoundCheck ? staticCode : `if(l>${currentIdx}){${staticCode}}`;
		}
	}
	if (node.param) code += compileNode(ctx, node.param, params.concat(`s[${currentIdx}]`), currentIdx + 1, -1);
	if (node.wildcard) {
		const { wildcard } = node;
		if (wildcard.suffix && ctx.opts?.matchAll) code += compileSuffix(ctx, wildcard.suffix, params, currentIdx, staticPrefixLen, 0, [], 0);
		if (wildcard.methods) {
			const tail = staticPrefixLen < 0 ? `s.slice(${currentIdx}).join('/')` : `p.slice(${staticPrefixLen})`;
			code += compileMethodMatch(ctx, wildcard.methods, params.concat(tail), currentIdx);
		}
	}
	return code;
}
function compileSuffix(ctx, node, params, c, staticPrefixLen, j, suffixParams, suffixLen) {
	let code = "";
	const guard = `l>${c + j}`;
	if (node.static) {
		let chain = "";
		for (const key in node.static) {
			const match = compileSuffix(ctx, node.static[key], params, c, staticPrefixLen, j + 1, suffixParams, suffixLen < 0 ? -1 : suffixLen + key.length + 1);
			if (match) chain += `${chain ? "else " : ""}if(s[l-${j + 1}]===${JSON.stringify(key)}){${match}}`;
		}
		if (chain) code += `if(${guard}){${chain}}`;
	}
	if (node.param) {
		const match = compileSuffix(ctx, node.param, params, c, staticPrefixLen, j + 1, [`s[l-${j + 1}]`, ...suffixParams], -1);
		if (match) code += `if(${guard}){${match}}`;
	}
	if (node.methods) {
		const tail = staticPrefixLen < 0 || suffixLen < 0 ? `s.slice(${c},l-${j}).join('/')` : `p.slice(${staticPrefixLen},p.length-${suffixLen})`;
		code += compileMethodMatch(ctx, node.methods, params.concat(tail, suffixParams), -1, guard);
	}
	return code;
}
function compileSuffixProbe(ctx, node, c) {
	const terms = [];
	if (node.wildcard?.suffix) terms.push(compileTrieProbe(ctx, node.wildcard.suffix, c, 0));
	for (const key in node.static) if (node.static[key].hasSuffix) {
		const probe = compileSuffixProbe(ctx, node.static[key], c + 1);
		terms.push(`l>${c}&&s[${c}]===${JSON.stringify(key)}&&(${probe})`);
	}
	if (node.param?.hasSuffix) terms.push(`l>${c}&&(${compileSuffixProbe(ctx, node.param, c + 1)})`);
	return terms.filter((term) => !term.endsWith("(false)")).join("||") || "false";
}
function compileTrieProbe(ctx, node, c, j) {
	const terms = [];
	for (const key in node.methods) {
		const entries = node.methods[key];
		if (!entries?.length) continue;
		const routes = entries.map((m) => {
			const w = m.suffix[0];
			const tests = [];
			for (let i = w + 1; i < m.paramsRegexp.length; i++) if (m.paramsRegexp[i]) tests.push(`${serializeRegExp(ctx, m.paramsRegexp[i])}.test(s[l-${j + w + 1 - i}])`);
			return tests.join("&&");
		});
		const any = routes.includes("") ? "" : routes.join("||");
		terms.push(key ? `m===${JSON.stringify(key)}${any ? `&&(${any})` : ""}` : any || "true");
	}
	const children = [];
	for (const key in node.static) {
		const probe = compileTrieProbe(ctx, node.static[key], c, j + 1);
		if (probe !== "false") children.push(`s[l-${j + 1}]===${JSON.stringify(key)}&&(${probe})`);
	}
	if (node.param) {
		const probe = compileTrieProbe(ctx, node.param, c, j + 1);
		if (probe !== "false") children.push(probe);
	}
	if (children.length > 0) terms.push(`l>${c + j}&&(${children.join("||")})`);
	return terms.join("||") || "false";
}
function hasSuffixTrie(node) {
	if (!node.hasSuffix) return false;
	if (node.wildcard?.suffix) return true;
	for (const key in node.static) if (hasSuffixTrie(node.static[key])) return true;
	return !!node.param && hasSuffixTrie(node.param);
}
const RANK = `(r,k,n)=>{if(!k.some((d)=>d[1]>0))return r;const K=(d,p)=>{const e=n-d[1];if(d[0]>=0&&p>=d[0]&&p<e)return 0;for(let i=2;i<d.length;i+=2)if((d[1]&&d[i]>d[0]?d[i]-d[0]-1+e:d[i])===p)return d[i+1];return 3};return r.map((_,i)=>i).sort((a,b)=>{const A=k[a],B=k[b],o=Math.max(A[0]<0?n:A[0],B[0]<0?n:B[0]),h=n-Math.max(A[1],B[1]);for(let p=n-1;p>=0;p--){if(p<h&&p>=o){p=o;continue}const x=K(A,p)-K(B,p);if(x!==0)return x}return 0}).map((i)=>r[i])}`;
const VALUES = `(s,c,e)=>{for(;c<e;c++)if(!s[c])return false;return true}`;
const RANKG = `(()=>{const R=${RANK};return(r,k,n)=>{let c=0;for(const d of k)if(d.g!==void 0)c++;if(c<2)return R(r,k,n);const x=R(r.map((_,i)=>i),k,n),o=[],g=[];for(let i=x.length-1;i>=0;i--){const d=k[x[i]].g;if(d!==void 0){if(g.includes(d))continue;g.push(d)}o.push(r[x[i]])}return o.reverse()}})()`;
function rankRef(ctx) {
	return helperRef(ctx, ctx.variantRank && !ctx.collector ? RANKG : RANK);
}
function variantCode(ctx, data) {
	const token = data.variants;
	if (!token || !data.paramsMap || !ctx.opts?.matchAll || ctx.collector) return;
	const { ranges, listed, statics } = ctx.variantInfo ??= variantInfo(ctx.router.root);
	if (!listed.has(token)) return;
	const variants = ctx.variants ??= /* @__PURE__ */ new Map();
	if (!variants.has(token)) variants.set(token, variants.size);
	const [min, max] = ranges.get(data);
	const conditions = [];
	for (const [m, path] of statics) {
		const length = ranges.get(m)[0];
		if (m.variants === token && length >= min && length <= max) conditions.push(`p!==${JSON.stringify(path)}`);
	}
	if (ctx.rank) ctx.variantRank = true;
	else conditions.unshift(`!_g${variants.get(token)}`);
	return conditions;
}
function variantInfo(root) {
	const info = {
		ranges: /* @__PURE__ */ new Map(),
		listed: /* @__PURE__ */ new Set(),
		statics: []
	};
	const byToken = /* @__PURE__ */ new Map();
	const walk = (node, depth, path, trie) => {
		for (const method in node.methods) for (const m of node.methods[method]) {
			if (!m.variants) continue;
			const c = m.paramsMap?.find((e) => e[0] < 0);
			const range = trie ? [m.suffix[0] + m.suffix[1], Infinity] : c ? [depth - (c[2] || c[3] ? 1 : 0), Infinity] : [depth, depth];
			info.ranges.set(m, range);
			const ranges = byToken.get(m.variants) || [];
			if (ranges.some(([lo, hi]) => lo <= range[1] && range[0] <= hi)) info.listed.add(m.variants);
			byToken.set(m.variants, ranges.concat([range]));
			if (!m.paramsMap) info.statics.push([m, path]);
		}
		for (const key in node.static) walk(node.static[key], depth + 1, path === void 0 ? path : `${path}/${key}`, trie);
		if (node.param) walk(node.param, depth + 1, void 0, trie);
		if (node.wildcard) walk(node.wildcard, depth + 1, void 0, trie);
		if (node.suffix) walk(node.suffix, depth, void 0, true);
	};
	walk(root, 0, "");
	return info;
}
function staticOnce(matchers) {
	return matchers.filter((m, i) => !m.variants || m.paramsMap || matchers.findIndex((x) => x.variants === m.variants && !x.paramsMap) === i);
}
function helperRef(ctx, source) {
	const rankMap = ctx.rankMap ??= /* @__PURE__ */ new Map();
	let index = rankMap.get(source);
	if (index === void 0) {
		index = ctx.data.push(ctx.compileToString ? source : new Function(`return ${source}`)()) - 1;
		rankMap.set(source, index);
	}
	return dataRef(ctx, index);
}
function rankDescriptor(ctx, data) {
	const descriptor = [-1, data?.suffix ? data.suffix[1] : 0];
	for (const [index, name, , plain] of data?.paramsMap || []) if (index < 0) descriptor[0] = -(index + 1);
	else descriptor.push(index, typeof name === "string" || plain ? 0 : 2);
	const g = data?.paramsMap && ctx.variantRank ? ctx.variants?.get(data.variants) : void 0;
	let key = JSON.stringify(descriptor);
	if (g !== void 0) {
		key = `Object.assign(${key},{g:${g}})`;
		Object.assign(descriptor, { g });
	}
	const rankMap = ctx.rankMap ??= /* @__PURE__ */ new Map();
	let slot = rankMap.get(key);
	if (slot === void 0) {
		slot = ctx.data.push(ctx.compileToString ? key : descriptor) - 1;
		rankMap.set(key, slot);
	}
	return dataRef(ctx, slot);
}
function scanRegExpGroups(source) {
	const names = [];
	const wholeCandidate = source.charCodeAt(0) === 94 && source.startsWith("(?<", 1);
	let i = 0;
	let depth = 0;
	let firstGroupEnd = -1;
	while (i < source.length) {
		const c = source.charCodeAt(i);
		if (c === 92) i += 2;
		else if (c === 91) {
			i++;
			while (i < source.length && source.charCodeAt(i) !== 93) i += source.charCodeAt(i) === 92 ? 2 : 1;
			i++;
		} else if (c === 40) {
			depth++;
			if (source.startsWith("(?<", i) && source[i + 3] !== "=" && source[i + 3] !== "!") {
				const end = source.indexOf(">", i + 3);
				const name = end === -1 ? "" : source.slice(i + 3, end);
				if (!/^[A-Za-z_$][\w$]*$/.test(name)) return;
				if (!names.includes(name)) names.push(name);
				i = end + 1;
			} else i++;
		} else if (c === 41) {
			depth--;
			if (depth === 0 && firstGroupEnd === -1) firstGroupEnd = i;
			i++;
		} else i++;
	}
	return {
		names,
		whole: wholeCandidate && names.length === 1 && firstGroupEnd === source.length - 2 && source.charCodeAt(source.length - 1) === 36
	};
}
function serializeData(ctx, entry) {
	let value = entry.data;
	if (ctx.compileToString) value = ctx.opts.serialize ? ctx.opts.serialize(value) : toJSONCode(value, entry.route);
	const dataMap = ctx.dataMap ??= /* @__PURE__ */ new Map();
	let index = dataMap.get(value);
	if (index === void 0) {
		index = ctx.data.push(value) - 1;
		dataMap.set(value, index);
	}
	return dataRef(ctx, index);
}
function toJSONCode(value, route) {
	let code;
	try {
		code = JSON.stringify(value, assertJSONValue);
	} catch (error) {
		code = void 0;
		if (error !== NOT_JSON) throw notJSONError(route, error);
	}
	if (code === void 0) throw notJSONError(route);
	return code;
}
const NOT_JSON = /* @__PURE__ */ Symbol("rou3:not-json");
function assertJSONValue(_key, value) {
	const type = typeof value;
	if (type === "function" || type === "symbol" || type === "bigint") throw NOT_JSON;
	return value;
}
function notJSONError(route, cause) {
	return new Error(`rou3: route data for ${JSON.stringify(route)} is not JSON-serializable, pass opts.serialize to emit it as code`, cause === void 0 ? void 0 : { cause });
}
function serializeRegExp(ctx, value) {
	const key = value.toString();
	const regexpMap = ctx.regexpMap ??= /* @__PURE__ */ new Map();
	let index = regexpMap.get(key);
	if (index === void 0) {
		index = ctx.data.push(ctx.compileToString ? key : value) - 1;
		regexpMap.set(key, index);
	}
	return dataRef(ctx, index);
}
function pushDataSlot(ctx, value) {
	return dataRef(ctx, ctx.data.push(value) - 1);
}
function dataRef(ctx, index) {
	return ctx.dataArray ? `$[${index}]` : `$${index}`;
}
function propKey(name) {
	return name === "__proto__" ? "[\"__proto__\"]" : JSON.stringify(name);
}
function nonEmptyGuard(ctx, [index, name, optional, empty], param, suffix) {
	if (index >= 0) return name.charCodeAt(0) > 57 ? param : void 0;
	if (optional || empty) return;
	return `${helperRef(ctx, VALUES)}(s,${~index + 1},l${suffix ? `-${suffix[1]}` : ""})`;
}
export { compileRouter, compileRouterToString };
