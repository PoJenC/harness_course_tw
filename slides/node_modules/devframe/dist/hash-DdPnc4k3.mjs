//#region ../../node_modules/.pnpm/ohash@2.0.12/node_modules/ohash/dist/_chunks/is-equal.mjs
function serialize(input) {
	if (typeof input === "string") return `'${input}'`;
	return new Serializer().serialize(input);
}
const asciiOrder = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz";
const asciiWeights = /*@__PURE__*/ (function() {
	const weights = /* @__PURE__ */ new Uint8Array(128);
	for (let i = 0; i < 69; i++) weights[asciiOrder.charCodeAt(i)] = i + 1;
	for (let code = 65; code <= 90; code++) weights[code] = weights[code + 32];
	return weights;
})();
function compareStrings(a, b) {
	if (a === b) return 0;
	const length = Math.min(a.length, b.length);
	let tieBreaker = 0;
	for (let i = 0; i < length; i++) {
		const codeA = a.charCodeAt(i);
		const codeB = b.charCodeAt(i);
		if (codeA === codeB) continue;
		const weightA = codeA < 128 && asciiWeights[codeA] ? asciiWeights[codeA] : codeA + 128;
		const weightB = codeB < 128 && asciiWeights[codeB] ? asciiWeights[codeB] : codeB + 128;
		if (weightA !== weightB) return weightA < weightB ? -1 : 1;
		if (tieBreaker === 0) tieBreaker = codeA > codeB ? -1 : 1;
	}
	if (a.length !== b.length) return a.length < b.length ? -1 : 1;
	return tieBreaker;
}
const Serializer = /*@__PURE__*/ (function() {
	class Serializer {
		#context = /* @__PURE__ */ new Map();
		compare(a, b) {
			const typeA = typeof a;
			const typeB = typeof b;
			if (typeA === "string" && typeB === "string") return compareStrings(a, b);
			if (typeA === "number" && typeB === "number") return a - b;
			return compareStrings(this.serialize(a, true), this.serialize(b, true));
		}
		serialize(value, noQuotes) {
			if (value === null) return "null";
			switch (typeof value) {
				case "string": return noQuotes ? value : `'${value}'`;
				case "bigint": return `${value}n`;
				case "object": return this.$object(value);
				case "function": return this.$function(value);
			}
			return String(value);
		}
		serializeObject(object) {
			const objString = Object.prototype.toString.call(object);
			if (objString !== "[object Object]") return this.serializeBuiltInType(objString.length < 10 ? `unknown:${objString}` : objString.slice(8, -1), object);
			const constructor = object.constructor;
			const objName = constructor === Object || constructor === void 0 ? "" : constructor.name;
			if (objName !== "" && globalThis[objName] === constructor) return this.serializeBuiltInType(objName, object);
			if ("toJSON" in object && typeof object.toJSON === "function") {
				const json = object.toJSON();
				return objName + (json !== null && typeof json === "object" ? this.$object(json) : `(${this.serialize(json)})`);
			}
			const keys = Object.keys(object).sort(compareStrings);
			let content = `${objName}{`;
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				content += `${key}:${this.serialize(object[key])}`;
				if (i < keys.length - 1) content += ",";
			}
			return content + "}";
		}
		serializeBuiltInType(type, object) {
			const handler = this["$" + type];
			if (handler) return handler.call(this, object);
			if (typeof object.entries === "function") return this.serializeObjectEntries(type, object.entries());
			throw new Error(`Cannot serialize ${type}`);
		}
		serializeObjectEntries(type, entries) {
			const sortedEntries = Array.from(entries).sort((a, b) => this.compare(a[0], b[0]));
			let content = `${type}{`;
			for (let i = 0; i < sortedEntries.length; i++) {
				const [key, value] = sortedEntries[i];
				content += `${this.serialize(key, true)}:${this.serialize(value)}`;
				if (i < sortedEntries.length - 1) content += ",";
			}
			return content + "}";
		}
		$object(object) {
			let content = this.#context.get(object);
			if (content === void 0) {
				this.#context.set(object, `#${this.#context.size}`);
				content = this.serializeObject(object);
				this.#context.set(object, content);
			}
			return content;
		}
		$function(fn) {
			const fnStr = Function.prototype.toString.call(fn);
			if (fnStr.slice(-15) === "[native code] }") return `${fn.name || ""}()[native]`;
			return `${fn.name}(${fn.length})${fnStr.replace(/\s*\n\s*/g, "")}`;
		}
		$Array(arr) {
			let content = "[";
			for (let i = 0; i < arr.length; i++) {
				content += this.serialize(arr[i]);
				if (i < arr.length - 1) content += ",";
			}
			return content + "]";
		}
		$Date(date) {
			try {
				return `Date(${date.toISOString()})`;
			} catch {
				return `Date(null)`;
			}
		}
		$ArrayBuffer(arr) {
			return `ArrayBuffer[${new Uint8Array(arr).join(",")}]`;
		}
		$Set(set) {
			return `Set${this.$Array(Array.from(set).sort((a, b) => this.compare(a, b)))}`;
		}
		$Map(map) {
			return this.serializeObjectEntries("Map", map.entries());
		}
	}
	for (const type of [
		"Error",
		"RegExp",
		"URL"
	]) Serializer.prototype["$" + type] = function(val) {
		return `${type}(${val})`;
	};
	for (const type of [
		"Int8Array",
		"Uint8Array",
		"Uint8ClampedArray",
		"Int16Array",
		"Uint16Array",
		"Int32Array",
		"Uint32Array",
		"Float32Array",
		"Float64Array"
	]) Serializer.prototype["$" + type] = function(arr) {
		return `${type}[${arr.join(",")}]`;
	};
	for (const type of ["BigInt64Array", "BigUint64Array"]) Serializer.prototype["$" + type] = function(arr) {
		return `${type}[${arr.join("n,")}${arr.length > 0 ? "n" : ""}]`;
	};
	return Serializer;
})();
//#endregion
//#region ../../node_modules/.pnpm/ohash@2.0.12/node_modules/ohash/dist/crypto/js/index.mjs
const H = [
	1779033703,
	-1150833019,
	1013904242,
	-1521486534,
	1359893119,
	-1694144372,
	528734635,
	1541459225
];
const K = [
	1116352408,
	1899447441,
	-1245643825,
	-373957723,
	961987163,
	1508970993,
	-1841331548,
	-1424204075,
	-670586216,
	310598401,
	607225278,
	1426881987,
	1925078388,
	-2132889090,
	-1680079193,
	-1046744716,
	-459576895,
	-272742522,
	264347078,
	604807628,
	770255983,
	1249150122,
	1555081692,
	1996064986,
	-1740746414,
	-1473132947,
	-1341970488,
	-1084653625,
	-958395405,
	-710438585,
	113926993,
	338241895,
	666307205,
	773529912,
	1294757372,
	1396182291,
	1695183700,
	1986661051,
	-2117940946,
	-1838011259,
	-1564481375,
	-1474664885,
	-1035236496,
	-949202525,
	-778901479,
	-694614492,
	-200395387,
	275423344,
	430227734,
	506948616,
	659060556,
	883997877,
	958139571,
	1322822218,
	1537002063,
	1747873779,
	1955562222,
	2024104815,
	-2067236844,
	-1933114872,
	-1866530822,
	-1538233109,
	-1090935817,
	-965641998
];
const base64KeyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const W = [];
var SHA256 = class {
	_data = new WordArray();
	_hash = new WordArray([...H]);
	_nDataBytes = 0;
	_minBufferSize = 0;
	finalize(messageUpdate) {
		if (messageUpdate) this._append(messageUpdate);
		const nBitsTotal = this._nDataBytes * 8;
		const nBitsLeft = this._data.sigBytes * 8;
		this._data.words[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
		this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
		this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
		this._data.sigBytes = this._data.words.length * 4;
		this._process();
		return this._hash;
	}
	_doProcessBlock(M, offset) {
		const H = this._hash.words;
		let a = H[0];
		let b = H[1];
		let c = H[2];
		let d = H[3];
		let e = H[4];
		let f = H[5];
		let g = H[6];
		let h = H[7];
		for (let i = 0; i < 64; i++) {
			if (i < 16) W[i] = M[offset + i] | 0;
			else {
				const gamma0x = W[i - 15];
				const gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
				const gamma1x = W[i - 2];
				const gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
				W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
			}
			const ch = e & f ^ ~e & g;
			const maj = a & b ^ a & c ^ b & c;
			const sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
			const sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
			const t1 = h + sigma1 + ch + K[i] + W[i];
			const t2 = sigma0 + maj;
			h = g;
			g = f;
			f = e;
			e = d + t1 | 0;
			d = c;
			c = b;
			b = a;
			a = t1 + t2 | 0;
		}
		H[0] = H[0] + a | 0;
		H[1] = H[1] + b | 0;
		H[2] = H[2] + c | 0;
		H[3] = H[3] + d | 0;
		H[4] = H[4] + e | 0;
		H[5] = H[5] + f | 0;
		H[6] = H[6] + g | 0;
		H[7] = H[7] + h | 0;
	}
	_append(data) {
		if (typeof data === "string") data = WordArray.fromUtf8(data);
		this._data.concat(data);
		this._nDataBytes += data.sigBytes;
	}
	_process(doFlush) {
		let processedWords;
		let nBlocksReady = this._data.sigBytes / 64;
		if (doFlush) nBlocksReady = Math.ceil(nBlocksReady);
		else nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
		const nWordsReady = nBlocksReady * 16;
		const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);
		if (nWordsReady) {
			for (let offset = 0; offset < nWordsReady; offset += 16) this._doProcessBlock(this._data.words, offset);
			processedWords = this._data.words.splice(0, nWordsReady);
			this._data.sigBytes -= nBytesReady;
		}
		return new WordArray(processedWords, nBytesReady);
	}
};
var WordArray = class WordArray {
	words;
	sigBytes;
	constructor(words, sigBytes) {
		words = this.words = words || [];
		this.sigBytes = sigBytes === void 0 ? words.length * 4 : sigBytes;
	}
	static fromUtf8(input) {
		const str = unescape(encodeURIComponent(input));
		const strlen = str.length;
		const words = [];
		for (let i = 0; i < strlen; i++) words[i >>> 2] |= (str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
		return new WordArray(words, strlen);
	}
	toBase64() {
		const base64Chars = [];
		for (let i = 0; i < this.sigBytes; i += 3) {
			const byte1 = this.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
			const byte2 = this.words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
			const byte3 = this.words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
			const triplet = byte1 << 16 | byte2 << 8 | byte3;
			for (let j = 0; j < 4 && i * 8 + j * 6 < this.sigBytes * 8; j++) base64Chars.push(base64KeyStr.charAt(triplet >>> 6 * (3 - j) & 63));
		}
		return base64Chars.join("");
	}
	concat(wordArray) {
		this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8;
		this.words.length = Math.ceil(this.sigBytes / 4);
		if (this.sigBytes % 4) for (let i = 0; i < wordArray.sigBytes; i++) {
			const thatByte = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
			this.words[this.sigBytes + i >>> 2] |= thatByte << 24 - (this.sigBytes + i) % 4 * 8;
		}
		else for (let j = 0; j < wordArray.sigBytes; j += 4) this.words[this.sigBytes + j >>> 2] = wordArray.words[j >>> 2];
		this.sigBytes += wordArray.sigBytes;
	}
};
function digest(message) {
	return new SHA256().finalize(message).toBase64();
}
//#endregion
//#region ../../node_modules/.pnpm/ohash@2.0.12/node_modules/ohash/dist/index.mjs
function hash$1(input) {
	return digest(serialize(input));
}
//#endregion
//#region src/utils/hash.ts
/**
* Stable, deterministic hash of any structured-cloneable value.
*/
function hash(value) {
	return hash$1(value);
}
//#endregion
export { hash as t };
