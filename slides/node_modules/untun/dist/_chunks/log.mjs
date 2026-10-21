import { createInterface } from "node:readline/promises";
function log(message, type) {
	const color = type && colors[type];
	console.log(color ? `${color}${message}${colors.reset}` : message);
}
async function prompt(message) {
	if (!process.stdin.isTTY) return true;
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout
	});
	try {
		const answer = await rl.question(`${colors.info}?${colors.reset} ${message} ${colors.dim}(Y/n)${colors.reset} `);
		return !/^n(o)?$/i.test(answer.trim());
	} finally {
		rl.close();
	}
}
const colors = {
	reset: "\x1B[0m",
	dim: "\x1B[2m",
	info: "\x1B[36m",
	success: "\x1B[32m",
	error: "\x1B[31m",
	warn: "\x1B[33m"
};
export { log, prompt };
