//#region src/scanner.ts
const MAX = 4294967295;
function isSearchCacheable(regexp) {
	return !regexp.sticky && !regexp.rawOptions?.strategy;
}
function toResult(index, indices) {
	return {
		index,
		captureIndices: indices.map((indice) => {
			if (indice == null) return {
				start: MAX,
				end: MAX,
				length: 0
			};
			return {
				start: indice[0],
				end: indice[1],
				length: indice[1] - indice[0]
			};
		})
	};
}
var JavaScriptScanner = class {
	patterns;
	options;
	regexps;
	/**
	* Last search of each regexp on the current string, reused the way `vscode-oniguruma` does.
	* `null` for regexps whose searches can't be reused.
	*/
	lastSearches;
	constructor(patterns, options = {}) {
		this.patterns = patterns;
		this.options = options;
		const { forgiving = false, cache, regexConstructor } = options;
		if (!regexConstructor) throw new Error("Option `regexConstructor` is not provided");
		this.regexps = patterns.map((p) => {
			if (typeof p !== "string") return p;
			const cached = cache?.get(p);
			if (cached) {
				if (cached instanceof RegExp) return cached;
				if (forgiving) return null;
				throw cached;
			}
			try {
				const regex = regexConstructor(p);
				cache?.set(p, regex);
				return regex;
			} catch (e) {
				cache?.set(p, e);
				if (forgiving) return null;
				throw e;
			}
		});
		this.lastSearches = this.regexps.map((regexp) => regexp && isSearchCacheable(regexp) ? {
			strId: 0,
			searchedFrom: 0,
			matchIndex: -1,
			indices: null
		} : null);
	}
	findNextMatchSync(string, startPosition, _options) {
		const str = typeof string === "string" ? string : string.content;
		const strId = typeof string === "string" ? 0 : string.id || 0;
		let bestIndex = -1;
		let bestMatchIndex = 0;
		let bestIndices = null;
		for (let i = 0; i < this.regexps.length; i++) {
			const regexp = this.regexps[i];
			if (!regexp) continue;
			try {
				const last = strId ? this.lastSearches[i] : null;
				let matchIndex;
				let indices;
				if (last && last.strId === strId && last.searchedFrom <= startPosition && (last.matchIndex === -1 || last.matchIndex >= startPosition)) {
					matchIndex = last.matchIndex;
					indices = last.indices;
				} else {
					regexp.lastIndex = startPosition;
					const match = regexp.exec(str);
					matchIndex = match ? match.index : -1;
					indices = match ? match.indices : null;
					if (last) {
						last.strId = strId;
						last.searchedFrom = startPosition;
						last.matchIndex = matchIndex;
						last.indices = indices;
					}
				}
				if (matchIndex === -1) continue;
				if (matchIndex === startPosition) return toResult(i, indices);
				if (bestIndex === -1 || matchIndex < bestMatchIndex) {
					bestIndex = i;
					bestMatchIndex = matchIndex;
					bestIndices = indices;
				}
			} catch (e) {
				if (this.options.forgiving) continue;
				throw e;
			}
		}
		return bestIndex === -1 ? null : toResult(bestIndex, bestIndices);
	}
};
//#endregion
//#region src/string.ts
let lastStringId = 0;
function createJavaScriptEngineString(content) {
	return {
		content,
		id: ++lastStringId
	};
}
//#endregion
export { JavaScriptScanner as n, createJavaScriptEngineString as t };
