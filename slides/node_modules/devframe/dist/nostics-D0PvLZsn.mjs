import { Diagnostic, createConsoleReporter, defineDiagnostics, defineProdDiagnostics, formatDiagnostic } from "nostics";
import { ansiFormatter, ansiFormatter as ansiFormatter$1 } from "nostics/formatters/ansi";
//#region src/utils/colors.ts
function makeColor(open, close) {
	const o = `\x1B[${open}m`;
	const c = `\x1B[${close}m`;
	return ((arg, ...values) => {
		if (Array.isArray(arg) && "raw" in arg) {
			const strings = arg;
			let out = "";
			for (let i = 0; i < strings.length; i++) {
				out += strings[i];
				if (i < values.length) out += String(values[i]);
			}
			return `${o}${out}${c}`;
		}
		return `${o}${String(arg)}${c}`;
	});
}
const colors = {
	blue: makeColor(34, 39),
	cyan: makeColor(36, 39),
	gray: makeColor(90, 39),
	green: makeColor(32, 39),
	red: makeColor(31, 39),
	yellow: makeColor(33, 39),
	bold: makeColor(1, 22),
	dim: makeColor(2, 22),
	reset: makeColor(0, 0),
	underline: makeColor(4, 24)
};
//#endregion
//#region src/utils/nostics.ts
const formatAnsi = ansiFormatter(colors);
/**
* The reporter every {@link defineDiagnostics} call below wires in ahead of
* any caller-supplied ones: prints the diagnostic through devframe's own
* ANSI colors via `console[method]` (default `'warn'`).
*/
function devframeReporter(d, { method = "warn" } = {}) {
	console[method](formatAnsi(d));
}
/**
* Drop-in replacement for `nostics`'s `defineDiagnostics()` with devframe's
* ANSI console reporter pre-wired ahead of any `reporters` passed in. Every
* `diagnostics.ts` in devframe core, `@devframes/hub`, `@devframes/json-render`,
* and the built-in plugins defines its codes through this instead of
* `nostics`'s own `defineDiagnostics`; the reporter registration lives
* here, once, so none of them need to build their own reporter (`colors`,
* `ansiFormatter`) or take a direct dependency on `nostics` themselves.
*/
function defineDiagnostics$1(options) {
	return defineDiagnostics({
		...options,
		reporters: [devframeReporter, ...options.reporters ?? []]
	});
}
//#endregion
export { defineProdDiagnostics as a, defineDiagnostics$1 as i, ansiFormatter$1 as n, formatDiagnostic as o, createConsoleReporter as r, colors as s, Diagnostic as t };
