import { s as colors } from "../nostics-D0PvLZsn.mjs";
import { DEVFRAME_CONNECTION_META_FILENAME, DEVFRAME_RPC_DUMP_MANIFEST_FILENAME } from "../constants.mjs";
import { n as collectStaticRpcDump, t as writeStaticRpcDump } from "../write-DK7rBUN3.mjs";
import { t as diagnostics } from "../diagnostics-Dngy7cNp.mjs";
import { t as createHostContext } from "../context-CeD8-IZA.mjs";
import { t as resolveStaticAssetsSource } from "../remote-assets-DoZ1AMpq.mjs";
import { t as createH3DevframeHost } from "../host-h3-BROI6SQ4.mjs";
import fs from "node:fs/promises";
import { resolve } from "pathe";
import { existsSync } from "node:fs";
import process from "node:process";
//#region src/adapters/build.ts
/**
* Produce a self-contained static deploy of a devframe:
*
*   - Build a `mode: 'build'` context and run `devframe.setup(ctx)`.
*   - Copy the author's SPA dist into `<outDir>/`.
*   - Write `<outDir>/__connection.json` (`{ backend: 'static' }`) and the
*     sharded RPC dump under `<outDir>/__rpc-dump/` so the deployed SPA
*     discovers both via relative paths from `document.baseURI`. The
*     output is mount-path agnostic, so the same bundle works at `/`,
*     `/devframe/`, or any base, no rewriting required.
*/
async function createBuild(d, options = {}) {
	if (d.capabilities?.build === false && !options.force) throw diagnostics.DF0042({ id: d.id });
	const outDir = resolve(options.outDir ?? "dist-static");
	const distSource = options.distDir ?? d.clientAssets;
	if (!distSource) throw new Error(`[devframe] createBuild: no client assets for "${d.id}". Set \`clientAssets\` on the definition or pass it as an option.`);
	if (existsSync(outDir)) await fs.rm(outDir, { recursive: true });
	await fs.mkdir(outDir, { recursive: true });
	const host = createH3DevframeHost({
		origin: "http://localhost",
		appName: d.id
	});
	await materializeSpa(resolveStaticAssetsSource(distSource, host.getStorageDir("project"), d.importMetaUrl), outDir);
	const ctx = await createHostContext({
		cwd: process.cwd(),
		mode: "build",
		host,
		importMetaUrl: d.importMetaUrl
	});
	for (const input of d.services ?? []) ctx.services.install(input, { resolveFrom: d.importMetaUrl });
	await ctx.services.ready();
	await d.setup(ctx);
	applySnapshotRpc(ctx, d.rpc?.snapshot);
	await writeConnectionMeta(ctx, outDir);
	console.log(colors.cyan`[devframe] writing RPC dump to ${resolve(outDir, DEVFRAME_RPC_DUMP_MANIFEST_FILENAME)}`);
	const dump = await collectStaticRpcDump(ctx.rpc.definitions.values(), ctx);
	await writeStaticRpcDump(dump, outDir, { pretty: options.pretty });
	console.log(colors.green`[devframe] built "${d.id}" -> ${outDir}`);
}
/** Copy a local SPA dist, or materialize a remote assets source, into `outDir`. */
async function materializeSpa(resolved, outDir) {
	if (typeof resolved === "string") {
		console.log(colors.cyan`[devframe] copying SPA from ${resolved} -> ${outDir}`);
		await fs.cp(resolved, outDir, { recursive: true });
		return;
	}
	console.log(colors.cyan`[devframe] materializing SPA from ${resolved.assets.package}@${resolved.assets.version} -> ${outDir}`);
	await resolved.materialize(outDir);
}
/** Write `__connection.json` with the JSON-serializable method allow-list. */
async function writeConnectionMeta(ctx, outDir) {
	const jsonSerializableMethods = [];
	for (const def of ctx.rpc.definitions.values()) if (def.jsonSerializable === true) jsonSerializableMethods.push(def.name);
	await fs.writeFile(resolve(outDir, DEVFRAME_CONNECTION_META_FILENAME), JSON.stringify({
		backend: "static",
		jsonSerializableMethods
	}, null, 2), "utf-8");
}
/**
* Attach a `dump` to each {@link DevframeRpcOptions.snapshot} target so the
* static collector bakes it, even though the (service-owned) definition
* declares no dump of its own. A bare method id becomes `snapshot: true`
* (bakes the no-arg call); `{ method, inputs }` bakes one record per resolved
* argument-tuple by running the target's own handler, with the first tuple's
* output as the fallback.
*/
function applySnapshotRpc(ctx, entries) {
	for (const entry of entries ?? []) {
		const method = typeof entry === "string" ? entry : entry.method;
		const def = ctx.rpc.definitions.get(method);
		if (!def) {
			diagnostics.DF0072({ method });
			continue;
		}
		if (typeof entry === "string") {
			def.snapshot = true;
			continue;
		}
		const inputsSpec = entry.inputs;
		def.dump = async (dumpCtx, handler) => {
			const tuples = typeof inputsSpec === "function" ? await inputsSpec(dumpCtx) : inputsSpec;
			const records = [];
			for (const input of tuples) records.push({
				inputs: [...input],
				output: await handler(...input)
			});
			return {
				records,
				fallback: records[0]?.output
			};
		};
	}
}
//#endregion
export { applySnapshotRpc, createBuild };
