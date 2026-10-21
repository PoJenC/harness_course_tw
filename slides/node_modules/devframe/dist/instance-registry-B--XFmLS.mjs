import { n as __exportAll } from "./rolldown-runtime-B4iAMlE-.mjs";
import { t as diagnostics } from "./diagnostics-Dngy7cNp.mjs";
import { join } from "pathe";
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import process from "node:process";
import { homedir } from "node:os";
//#region src/node/instance-registry.ts
var instance_registry_exports = /* @__PURE__ */ __exportAll({
	listLiveDevframeInstances: () => listLiveDevframeInstances,
	probeDevframeOrigin: () => probeDevframeOrigin,
	readDevframeInstances: () => readDevframeInstances,
	registerDevframeInstance: () => registerDevframeInstance
});
/** Environment variable overriding the registry directory (tests, CI). */
const DEVFRAME_INSTANCES_DIR_ENV = "DEVFRAME_INSTANCES_DIR";
/** Environment variable disabling instance registration entirely. */
const DEVFRAME_DISABLE_INSTANCE_REGISTRY_ENV = "DEVFRAME_DISABLE_INSTANCE_REGISTRY";
/**
* Resolve the registry directory: `~/.devframe/instances/` by default
* (the framework's own global dir, deliberately outside the per-app
* `~/.<appName>/devframe/` storage convention since the registry spans apps),
* overridable via `DEVFRAME_INSTANCES_DIR`.
*/
function resolveInstancesDir(override) {
	return override ?? process.env[DEVFRAME_INSTANCES_DIR_ENV] ?? join(homedir(), ".devframe", "instances");
}
function isRegistryDisabled() {
	const value = process.env[DEVFRAME_DISABLE_INSTANCE_REGISTRY_ENV];
	return value === "1" || value === "true";
}
/**
* Record a running devframe instance in the global instance registry so
* discovery tooling (`devframe connect`, editor integrations) can find it
* without port guessing.
*
* `createDevServer` registers automatically; custom hosts that serve a
* devframe in-process (e.g. `@devframes/next`'s host inside a Next dev
* server) call this explicitly with the origin they are reachable at.
*
* The record is written atomically to `<dir>/<pid>-<port>.json` and removed
* by {@link DevframeInstanceRegistration.unregister}. Records surviving a
* crash are pruned by readers whose liveness probe fails. Registration never
* throws; a write failure degrades to a coded warning (`DF0045`), since a
* dev server must not die over discovery metadata.
*/
function registerDevframeInstance(record, options = {}) {
	const dir = resolveInstancesDir(options.instancesDir);
	const file = join(dir, `${record.pid}-${record.port}.json`);
	if (!isRegistryDisabled()) try {
		mkdirSync(dir, { recursive: true });
		const tmp = join(dir, `.${record.pid}-${record.port}.${Date.now()}.tmp`);
		writeFileSync(tmp, `${JSON.stringify(record, null, 2)}\n`);
		renameSync(tmp, file);
	} catch (error) {
		diagnostics.DF0045({
			file,
			reason: error instanceof Error ? error.message : String(error),
			cause: error
		});
	}
	return {
		file,
		unregister: () => {
			try {
				rmSync(file, { force: true });
			} catch (error) {
				diagnostics.DF0045({
					file,
					reason: error instanceof Error ? error.message : String(error),
					cause: error
				});
			}
		}
	};
}
/**
* Read every record in the registry directory, dropping unparseable files.
* Liveness is the caller's concern; see {@link probeDevframeInstance}.
*/
function readDevframeInstances(options = {}) {
	const dir = resolveInstancesDir(options.instancesDir);
	let files;
	try {
		files = readdirSync(dir).filter((f) => f.endsWith(".json"));
	} catch {
		return [];
	}
	const records = [];
	for (const file of files) try {
		const parsed = JSON.parse(readFileSync(join(dir, file), "utf8"));
		if (typeof parsed?.origin === "string" && typeof parsed?.pid === "number") records.push(parsed);
	} catch {}
	return records;
}
/**
* Dialable-origin candidates for a recorded origin. A `localhost` bind is
* ambiguous: the server may listen on `127.0.0.1`, `::1`, or both, and
* HTTP clients differ in which family they try, so probe the explicit
* addresses too and adopt whichever answers.
*/
function originCandidates(origin) {
	try {
		const url = new URL(origin);
		if (url.hostname !== "localhost") return [origin];
		const port = url.port ? `:${url.port}` : "";
		return [
			origin,
			`${url.protocol}//127.0.0.1${port}`,
			`${url.protocol}//[::1]${port}`
		];
	} catch {
		return [origin];
	}
}
/**
* Probe `<origin><basePath>__connection.json`, trying each dialable
* candidate for the origin (see {@link originCandidates}). The single
* probe primitive behind both registry liveness checks and the
* connector's explicit `--port` probes. A candidate counts only when it
* answers `2xx` with a JSON object; anything else (an HTML SPA fallback, a
* JSON array, an unparseable body) is treated as "no devframe here".
*
* @internal
*/
async function probeDevframeOrigin(origin, basePath, timeoutMs) {
	const base = basePath.endsWith("/") ? basePath : `${basePath}/`;
	for (const candidate of originCandidates(origin)) try {
		const response = await fetch(`${candidate}${base}__connection.json`, { signal: AbortSignal.timeout(timeoutMs ?? 1e3) });
		if (!response.ok) continue;
		const meta = await response.json().catch(() => void 0);
		if (!meta || typeof meta !== "object" || Array.isArray(meta)) continue;
		return {
			origin: candidate,
			meta
		};
	} catch {}
	return null;
}
/**
* Probe a record's `__connection.json` to check the instance is alive.
* Returns the **dialable origin** that answered (for `localhost` records
* this may be an explicit `127.0.0.1` / `[::1]` origin), or `null` when
* unreachable.
*/
async function probeDevframeInstance(record, options = {}) {
	return (await probeDevframeOrigin(record.origin, record.basePath, options.timeoutMs))?.origin ?? null;
}
/**
* Read the registry and split records into live and dead by probing each
* one's `__connection.json`, deleting dead records (prune-on-read). Live
* records carry the dialable origin the probe confirmed (a `localhost`
* record may come back as `127.0.0.1` / `[::1]`).
*
* A liveness probe only proves *something* answers on the record's port, so
* records left behind by killed processes shadow the server currently bound
* there: per `(port, basePath)` only the newest record survives, older
* ghosts are pruned with the dead.
*/
async function listLiveDevframeInstances(options = {}) {
	const dir = resolveInstancesDir(options.instancesDir);
	const records = readDevframeInstances({ instancesDir: dir });
	const pruned = [];
	const prune = (record) => {
		pruned.push(record);
		try {
			rmSync(join(dir, `${record.pid}-${record.port}.json`), { force: true });
		} catch {}
	};
	const newest = /* @__PURE__ */ new Map();
	for (const record of records) {
		const key = `${record.port}|${record.basePath}`;
		const existing = newest.get(key);
		if (!existing) newest.set(key, record);
		else if (record.startedAt > existing.startedAt) {
			prune(existing);
			newest.set(key, record);
		} else prune(record);
	}
	const live = [];
	await Promise.all([...newest.values()].map(async (record) => {
		const origin = await probeDevframeInstance(record, options);
		if (origin) live.push(origin === record.origin ? record : {
			...record,
			origin
		});
		else prune(record);
	}));
	live.sort((a, b) => a.startedAt - b.startedAt);
	return {
		live,
		pruned
	};
}
//#endregion
export { registerDevframeInstance as i, listLiveDevframeInstances as n, probeDevframeOrigin as r, instance_registry_exports as t };
