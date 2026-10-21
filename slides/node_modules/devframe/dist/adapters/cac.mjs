import { s as colors } from "../nostics-D0PvLZsn.mjs";
import { i as resolveDevServerPort, s as importAgenticMcp } from "../_shared-B6K2DKhb.mjs";
import { createBuild } from "./build.mjs";
import { t as createDevServer } from "../dev-pIWWAGYd.mjs";
import process from "node:process";
import cac$1 from "cac";
//#region src/adapters/flags.ts
/**
* Identity helper that preserves the literal schema-map type; use this
* so `InferCliFlags<typeof myFlags>` resolves to the right object shape.
*
* ```ts
* const appFlags = defineCliFlags({
*   depth: v.pipe(v.number(), v.integer()),
*   config: v.optional(v.string()),
* })
*
* defineDevframe({
*   cli: { flags: appFlags },
*   setup(ctx, info) {
*     const flags = info.flags as InferCliFlags<typeof appFlags>
*     flags.depth // number
*     flags.config // string | undefined
*   },
* })
* ```
*/
function defineCliFlags(flags) {
	return flags;
}
/**
* Best-effort, dependency-free probe of a schema to decide whether the
* corresponding CAC option takes a value. Duck-types the `type` /
* `wrapped` / `inner` / `pipe` fields exposed by valibot and by devframe's
* built-in `s` builder, unwrapping `optional` / `nullable` / `nullish` /
* `pipe` wrappers then matching on the inner kind. Validators that don't
* expose these fields (e.g. zod) fall through to a value-taking option.
*/
function getSchemaKind(schema) {
	let current = schema;
	while (current) {
		const kind = current.type;
		if (kind === "optional" || kind === "nullable" || kind === "nullish" || kind === "undefined") {
			current = current.wrapped ?? current.inner;
			continue;
		}
		if (kind === "pipe" && Array.isArray(current.pipe) && current.pipe.length > 0) {
			current = current.pipe[0];
			continue;
		}
		return kind ?? "unknown";
	}
	return "unknown";
}
/** Whether the CAC option for this schema should be a boolean flag. */
function isBooleanFlag(schema) {
	return getSchemaKind(schema) === "boolean";
}
/** Validate the raw cac-parsed bag against a {@link CliFlagsSchema}. */
function parseCliFlags(schema, raw) {
	const flags = {};
	const issues = [];
	for (const [key, fieldSchema] of Object.entries(schema)) {
		const result = fieldSchema["~standard"].validate(raw[key]);
		if (result instanceof Promise) {
			issues.push(`--${toKebab(key)}: async flag validation is not supported`);
			continue;
		}
		if (result.issues) issues.push(`--${toKebab(key)}: ${result.issues.map((i) => i.message).join(", ")}`);
		else flags[key] = result.value;
	}
	for (const [key, value] of Object.entries(raw)) if (!(key in schema) && !(key in flags)) flags[key] = value;
	return issues.length ? {
		flags,
		issues
	} : { flags };
}
function toKebab(camel) {
	return camel.replaceAll(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
/** Kebab-case a schema key for CAC option registration. */
function flagKeyToOption(camel) {
	return toKebab(camel);
}
//#endregion
//#region src/adapters/cac.ts
/**
* Wrap a {@link DevframeDefinition} in a `cac`-powered command-line
* interface exposing `dev` / `build` / `mcp` subcommands.
*
* Requires the optional `cac` peer dependency.
*/
function createCac(d, options = {}) {
	const defaultPort = options.defaultPort ?? d.cli?.port ?? 9999;
	const defaultHost = d.cli?.host ?? "localhost";
	const command = d.cli?.command ?? d.id;
	const cli = cac$1(command);
	const devCommand = cli.command("[...args]", "Start a local dev server").option("--port <port>", "Port to listen on").option("--host <host>", "Host to bind to", { default: defaultHost }).option("--open", "Open the browser on start").option("--no-open", "Do not open the browser").option("--no-auth", "Disable the interactive authentication gate").option("--mcp", "Force the MCP route on (use --no-mcp to disable; default mounts it once agent tools exist)");
	if (d.cli?.flags) for (const [key, schema] of Object.entries(d.cli.flags)) {
		const optionName = flagKeyToOption(key);
		const description = schema.description ?? "";
		if (isBooleanFlag(schema)) devCommand.option(`--${optionName}`, description);
		else devCommand.option(`--${optionName} <value>`, description);
	}
	devCommand.action(async (_args, rawFlags) => {
		const flags = resolveTypedFlags(d, rawFlags);
		const host = flags.host ?? defaultHost;
		const port = flags.port ?? await resolveDevServerPort(d, {
			host,
			defaultPort
		});
		const mcp = flags.mcp ?? options.mcp;
		await createDevServer(d, {
			host,
			port,
			flags,
			mcp,
			onReady: options.onReady
		});
	});
	if (d.capabilities?.build !== false) cli.command("build", "Build a self-contained static deploy of the devframe").option("--out-dir <outDir>", "Output directory", { default: "dist-static" }).option("--pretty", "Pretty-print dump JSON (larger on disk)").action(async (flags) => {
		await createBuild(d, {
			outDir: flags.outDir,
			pretty: flags.pretty
		});
	});
	cli.command("mcp", "Start an MCP server exposing agent-facing tools (stdio)").action(async () => {
		const { createMcpServer } = await importAgenticMcp();
		await createMcpServer(d, {
			transport: "stdio",
			/** Deliberately go to stderr: stdout is the MCP transport. */
			onReady: ({ transport }) => {
				console.error(`[devframe] "${d.id}" MCP server ready (${transport})`);
			}
		});
	});
	d.cli?.configure?.(cli);
	options.configureCli?.(cli);
	cli.help();
	cli.version("0.0.0");
	return {
		cli,
		async parse(argv = process.argv) {
			cli.parse(argv, { run: false });
			await cli.runMatchedCommand();
		}
	};
}
function resolveTypedFlags(d, raw) {
	if (!d.cli?.flags) return raw;
	const { flags, issues } = parseCliFlags(d.cli.flags, raw);
	if (issues?.length) {
		for (const issue of issues) console.error(colors.red`[devframe] invalid flag: ${issue}`);
		process.exit(1);
	}
	return flags;
}
//#endregion
export { createCac, defineCliFlags, parseCliFlags };
