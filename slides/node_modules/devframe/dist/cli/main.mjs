import { t as diagnostics } from "../diagnostics-Dngy7cNp.mjs";
import { t as importRuntimeModule } from "../import-runtime-module-BzlEQ9PI.mjs";
import process from "node:process";
import { cac } from "cac";
//#region src/cli/main.ts
/** Parse the repeatable `--port` flag value(s) from cac into numbers. */
function parsePortsFlag(value) {
	return (Array.isArray(value) ? value : value === void 0 ? [] : [value]).map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0 && n < 65536);
}
/**
* Load the connector from the optional `@devframes/agentic` peer, mapping a
* failed load (typically: the peer is not installed) to a thrown `DF0046`.
*/
async function importConnect() {
	try {
		return await importRuntimeModule("@devframes/agentic/connect");
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw diagnostics.DF0046({
			reason,
			cause: error
		});
	}
}
/**
* The `devframe` bin is the framework's own CLI, distinct from the per-app
* CLI shells authors build with `createCac(definition)`. It hosts the
* app-independent commands; today that is `connect`, the MCP connector.
*/
async function runDevframeCli(argv = process.argv) {
	const cli = cac("devframe");
	cli.command("connect", "Run the devframe MCP connector on stdio (discovers running devframe dev servers and proxies their tools)").option("--port <port>", "Probe an explicit port besides the instance registry (repeatable)").option("--base <path>", "Base path the --port probes look for __connection.json under, for a devframe mounted below the root (e.g. /__devtools/ for Vite DevTools)", { default: "/" }).option("--instances-dir <dir>", "Override the instance registry directory (default: ~/.devframe/instances, or $DEVFRAME_INSTANCES_DIR)").option("--timeout <ms>", "Probe timeout per instance in milliseconds", { default: 1e3 }).action(async (options) => {
		const { startConnectServer } = await importConnect();
		await startConnectServer({
			ports: parsePortsFlag(options.port),
			base: typeof options.base === "string" ? options.base : void 0,
			instancesDir: options.instancesDir,
			timeoutMs: options.timeout,
			/**
			* The bearer for authenticated instance MCP routes comes from the
			* environment, never a CLI flag: command-line arguments are visible to
			* any process on the machine (`ps`, `/proc`), which would defeat it.
			*/
			authToken: process.env.DEVFRAME_MCP_AUTH_TOKEN
		});
		process.stdin.resume();
	});
	cli.help();
	cli.parse(argv, { run: false });
	if (!cli.matchedCommand) {
		if (!cli.options.help) cli.outputHelp();
		return;
	}
	await cli.runMatchedCommand();
}
//#endregion
export { runDevframeCli };
