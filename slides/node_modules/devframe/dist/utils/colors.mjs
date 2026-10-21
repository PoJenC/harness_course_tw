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
export { colors };
