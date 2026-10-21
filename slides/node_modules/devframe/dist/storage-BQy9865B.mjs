import { t as diagnostics } from "./diagnostics-Dngy7cNp.mjs";
import { dirname } from "pathe";
import { createSharedState } from "devframe/utils/shared-state";
import fs from "node:fs";
import process from "node:process";
//#region ../../node_modules/.pnpm/perfect-debounce@2.1.0/node_modules/perfect-debounce/dist/index.mjs
const DEBOUNCE_DEFAULTS = { trailing: true };
/**
Debounce functions
@param fn - Promise-returning/async function to debounce.
@param wait - Milliseconds to wait before calling `fn`. Default value is 25ms
@returns A function that delays calling `fn` until after `wait` milliseconds have elapsed since the last time it was called.
@example
```
import { debounce } from 'perfect-debounce';
const expensiveCall = async input => input;
const debouncedFn = debounce(expensiveCall, 200);
for (const number of [1, 2, 3]) {
console.log(await debouncedFn(number));
}
//=> 1
//=> 2
//=> 3
```
*/
function debounce(fn, wait = 25, options = {}) {
	options = {
		...DEBOUNCE_DEFAULTS,
		...options
	};
	if (!Number.isFinite(wait)) throw new TypeError("Expected `wait` to be a finite number");
	let leadingValue;
	let timeout;
	let resolveList = [];
	let currentPromise;
	let trailingArgs;
	const applyFn = (_this, args) => {
		currentPromise = _applyPromised(fn, _this, args);
		currentPromise.finally(() => {
			currentPromise = null;
			if (options.trailing && trailingArgs && !timeout) {
				const promise = applyFn(_this, trailingArgs);
				trailingArgs = null;
				return promise;
			}
		});
		return currentPromise;
	};
	const debounced = function(...args) {
		if (options.trailing) trailingArgs = args;
		if (currentPromise) return currentPromise;
		return new Promise((resolve) => {
			const shouldCallNow = !timeout && options.leading;
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				timeout = null;
				const promise = options.leading ? leadingValue : applyFn(this, args);
				trailingArgs = null;
				for (const _resolve of resolveList) _resolve(promise);
				resolveList = [];
			}, wait);
			if (shouldCallNow) {
				leadingValue = applyFn(this, args);
				resolve(leadingValue);
			} else resolveList.push(resolve);
		});
	};
	const _clearTimeout = (timer) => {
		if (timer) {
			clearTimeout(timer);
			timeout = null;
		}
	};
	debounced.isPending = () => !!timeout;
	debounced.cancel = () => {
		_clearTimeout(timeout);
		resolveList = [];
		trailingArgs = null;
	};
	debounced.flush = () => {
		_clearTimeout(timeout);
		if (!trailingArgs || currentPromise) return;
		const args = trailingArgs;
		trailingArgs = null;
		return applyFn(this, args);
	};
	return debounced;
}
async function _applyPromised(fn, _this, args) {
	return await fn.apply(_this, args);
}
//#endregion
//#region src/node/storage.ts
function safeJsonParse(text) {
	return JSON.parse(text, (key, value) => {
		if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) return void 0;
		return value;
	});
}
function createStorage(options) {
	const { mergeInitialValue = (initialValue, savedValue) => ({
		...initialValue,
		...savedValue
	}), debounce: debounceTime = 100 } = options;
	let initialValue = options.initialValue;
	if (fs.existsSync(options.filepath)) try {
		const savedValue = safeJsonParse(fs.readFileSync(options.filepath, "utf-8"));
		initialValue = mergeInitialValue ? mergeInitialValue(options.initialValue, savedValue) : savedValue;
	} catch (error) {
		diagnostics.DF0012({
			filepath: options.filepath,
			cause: error
		}, { method: "warn" });
		initialValue = options.initialValue;
	}
	const state = createSharedState({
		initialValue,
		enablePatches: false
	});
	state.on("updated", debounce((newState) => {
		try {
			const dir = dirname(options.filepath);
			fs.mkdirSync(dir, { recursive: true });
			const tmp = `${options.filepath}.${process.pid}.tmp`;
			fs.writeFileSync(tmp, `${JSON.stringify(newState, null, 2)}\n`);
			fs.renameSync(tmp, options.filepath);
		} catch (error) {
			diagnostics.DF0035({
				filepath: options.filepath,
				cause: error
			}, { method: "error" });
		}
	}, debounceTime));
	return state;
}
//#endregion
export { createStorage as t };
