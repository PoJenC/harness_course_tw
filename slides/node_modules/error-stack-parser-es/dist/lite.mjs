//#region src/lite.ts
const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;
/**
* Given an Error object, extract the most information from it.
*
* @param {Error} error object
* @param {ParseOptions} options
* @return {Array} of StackFrames
*/
function parse(error, options) {
	if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined") return parseOpera(error, options);
	else if (error.stack && CHROME_IE_STACK_REGEXP.test(error.stack)) return parseV8OrIE(error, options);
	else if (error.stack) return parseFFOrSafari(error, options);
	else if (options === null || options === void 0 ? void 0 : options.allowEmpty) return [];
	else throw new Error("Cannot parse given Error object");
}
/**
* Parse stack string from V8, Firefox, or IE into an array of StackFrames.
*/
function parseStack(stackString, options) {
	if (CHROME_IE_STACK_REGEXP.test(stackString)) return parseV8OrIeString(stackString, options);
	else return parseFFOrSafariString(stackString, options);
}
/**
* Separate line and column numbers from a string of the form: (URI:Line:Column)
*/
function extractLocation(urlLike) {
	if (!urlLike.includes(":")) return [
		urlLike,
		void 0,
		void 0
	];
	const parts = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(urlLike.replace(/[()]/g, ""));
	return [
		parts[1],
		parts[2] || void 0,
		parts[3] || void 0
	];
}
function applySlice(lines, options) {
	if (options && options.slice != null) {
		if (Array.isArray(options.slice)) return lines.slice(options.slice[0], options.slice[1]);
		return lines.slice(0, options.slice);
	}
	return lines;
}
function parseV8OrIE(error, options) {
	return parseV8OrIeString(error.stack, options);
}
function parseV8OrIeString(stack, options) {
	return applySlice(stack.split("\n").filter((line) => {
		return !!line.match(CHROME_IE_STACK_REGEXP);
	}), options).map((line) => {
		if (line.includes("(eval ")) line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, "");
		let sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, "");
		const location = sanitizedLine.match(/ (\(.+\)$)/);
		sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
		const locationParts = extractLocation(location ? location[1] : sanitizedLine);
		return {
			function: location && sanitizedLine || void 0,
			file: ["eval", "<anonymous>"].includes(locationParts[0]) ? void 0 : locationParts[0],
			line: locationParts[1] ? +locationParts[1] : void 0,
			col: locationParts[2] ? +locationParts[2] : void 0,
			raw: line
		};
	});
}
function parseFFOrSafari(error, options) {
	return parseFFOrSafariString(error.stack, options);
}
function parseFFOrSafariString(stack, options) {
	return applySlice(stack.split("\n").filter((line) => {
		return !line.match(SAFARI_NATIVE_CODE_REGEXP);
	}), options).map((line) => {
		if (line.includes(" > eval")) line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
		if (!line.includes("@") && !line.includes(":")) return { function: line };
		else {
			const functionNameRegex = /(([^\n\r"\u2028\u2029]*".[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*(?:@[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*)*(?:[\n\r\u2028\u2029][^@]*)?)?[^@]*)@/;
			const matches = line.match(functionNameRegex);
			const functionName = matches && matches[1] ? matches[1] : void 0;
			const locationParts = extractLocation(line.replace(functionNameRegex, ""));
			return {
				function: functionName,
				file: locationParts[0],
				line: locationParts[1] ? +locationParts[1] : void 0,
				col: locationParts[2] ? +locationParts[2] : void 0,
				raw: line
			};
		}
	});
}
function parseOpera(e, options) {
	if (!e.stacktrace || e.message.includes("\n") && e.message.split("\n").length > e.stacktrace.split("\n").length) return parseOpera9(e);
	else if (!e.stack) return parseOpera10(e);
	else return parseOpera11(e, options);
}
function parseOpera9(e, options) {
	const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
	const lines = e.message.split("\n");
	const result = [];
	for (let i = 2, len = lines.length; i < len; i += 2) {
		const match = lineRE.exec(lines[i]);
		if (match) result.push({
			file: match[2],
			line: +match[1],
			raw: lines[i]
		});
	}
	return applySlice(result, options);
}
function parseOpera10(e, options) {
	const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
	const lines = e.stacktrace.split("\n");
	const result = [];
	for (let i = 0, len = lines.length; i < len; i += 2) {
		const match = lineRE.exec(lines[i]);
		if (match) result.push({
			function: match[3] || void 0,
			file: match[2],
			line: match[1] ? +match[1] : void 0,
			raw: lines[i]
		});
	}
	return applySlice(result, options);
}
function parseOpera11(error, options) {
	return applySlice(error.stack.split("\n").filter((line) => {
		return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
	}), options).map((line) => {
		const tokens = line.split("@");
		const locationParts = extractLocation(tokens.pop());
		const functionCall = tokens.shift() || "";
		const functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
		let argsRaw;
		if (/\([^)]*\)/.test(functionCall)) argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, "$1");
		return {
			function: functionName,
			args: argsRaw === void 0 || argsRaw === "[arguments not available]" ? void 0 : argsRaw.split(","),
			file: locationParts[0],
			line: locationParts[1] ? +locationParts[1] : void 0,
			col: locationParts[2] ? +locationParts[2] : void 0,
			raw: line
		};
	});
}
//#endregion
export { extractLocation, parse, parseFFOrSafari, parseFFOrSafariString, parseOpera, parseOpera10, parseOpera11, parseOpera9, parseStack, parseV8OrIE, parseV8OrIeString };
