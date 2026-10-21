import fs from "node:fs";
import process from "node:process";
import { spawn } from "node:child_process";
//#region src/utils/open.ts
/**
* Launches `command` detached from the current process and resolves once
* the OS has accepted the spawn (not once the launched app exits), the
* same "fire and forget" behavior `open`'s default (`wait: false`) gave us.
*/
function spawnDetached(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			detached: true,
			stdio: "ignore",
			windowsHide: true
		});
		child.once("error", reject);
		child.once("spawn", () => {
			child.unref();
			resolve();
		});
	});
}
function isWsl() {
	if (process.platform !== "linux") return false;
	try {
		return fs.readFileSync("/proc/version", "utf-8").toLowerCase().includes("microsoft");
	} catch {
		return false;
	}
}
/**
* Open a URL, file, or other target in its default OS handler
* (browser for URLs, Finder/Explorer for paths, etc.).
*/
async function open(target) {
	if (process.platform === "darwin") return spawnDetached("open", [target]);
	if (process.platform === "win32") return spawnDetached("cmd", [
		"/c",
		"start",
		"\"\"",
		target
	]);
	if (isWsl()) try {
		return await spawnDetached("wslview", [target]);
	} catch {
		return spawnDetached("cmd.exe", [
			"/c",
			"start",
			"\"\"",
			target
		]);
	}
	return spawnDetached("xdg-open", [target]);
}
//#endregion
export { open };
