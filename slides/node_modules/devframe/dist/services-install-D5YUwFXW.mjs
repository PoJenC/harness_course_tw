import { createRequire } from "node:module";
import { isAbsolute, join } from "pathe";
import { pathToFileURL } from "node:url";
//#region src/node/services-install.ts
/**
* Turn a `resolveFrom` value (a file path, a file URL like `import.meta.url`,
* or a directory) into something `createRequire` accepts; a directory gets a
* synthetic filename appended so resolution starts inside it.
*/
function toRequireBase(resolveFrom) {
	if (resolveFrom.startsWith("file://")) return resolveFrom;
	if ((resolveFrom.split(/[/\\]/).pop() ?? "").includes(".")) return resolveFrom;
	return join(resolveFrom, "_devframe_resolve.js");
}
/**
* Normalize an `install()` `resolveFrom` into a resolution base. Paths and
* file URLs pass through (the common case: the declaring plugin's
* `importMetaUrl`, so a service it declares resolves against the plugin's own
* dependencies); a bare npm package name resolves to that package's location
* from `cwd`. An unresolvable package name reads as no base (the caller's
* workspace fallbacks apply).
*/
function expandResolveFrom(resolveFrom, cwd) {
	if (resolveFrom.startsWith("file://") || resolveFrom.startsWith(".") || isAbsolute(resolveFrom)) return resolveFrom;
	const require = createRequire(join(cwd, "_devframe_resolve.js"));
	try {
		return require.resolve(`${resolveFrom}/package.json`);
	} catch {}
	try {
		return require.resolve(resolveFrom);
	} catch {}
}
/**
* Resolve a package specifier against each `resolveFrom` candidate in order,
* returning the resolved absolute path or `undefined`. A pure probe: nothing
* is imported. The resolution base arrives as a parameter (not a literal
* `createRequire(import.meta.url)`), which keeps bundlers that special-case
* that pattern (turbopack rewrites its `.resolve()` of a dynamic specifier
* into a throwing stub) from touching the runtime resolution.
*/
function resolveServicePackage(pkg, resolveFrom) {
	for (const from of resolveFrom) {
		if (typeof from !== "string" || from.length === 0) continue;
		try {
			return createRequire(toRequireBase(from)).resolve(pkg);
		} catch {}
	}
}
/**
* Import a service package's module, trying each `resolveFrom` candidate in
* order (so a plugin-declared service resolves against the plugin's own
* dependency tree first, then the workspace fallback). Throws the last
* resolution error when no candidate succeeds.
*/
async function importServicePackage(pkg, resolveFroms) {
	const candidates = [...new Set(resolveFroms.filter((x) => typeof x === "string" && x.length > 0))];
	let lastError = /* @__PURE__ */ new Error(`no resolution base available for "${pkg}"`);
	for (const from of candidates) {
		let resolved;
		try {
			resolved = createRequire(toRequireBase(from)).resolve(pkg);
		} catch (error) {
			lastError = error;
			continue;
		}
		return await import(
			/* webpackIgnore: true */
			/* @vite-ignore */
			/* turbopackIgnore: true */
			pathToFileURL(resolved).href
);
	}
	throw lastError;
}
function parseVersion(input) {
	const [core, ...prerelease] = input.trim().replace(/^v/, "").split("-");
	if (!core) return void 0;
	const parts = core.split(".").map((part) => Number.parseInt(part, 10));
	if (parts.length === 0 || parts.some((part) => Number.isNaN(part) || part < 0)) return void 0;
	while (parts.length < 3) parts.push(0);
	return {
		parts,
		...prerelease.length ? { prerelease: prerelease.join("-") } : {}
	};
}
function compareVersions(a, b) {
	for (let i = 0; i < 3; i++) {
		const diff = (a.parts[i] ?? 0) - (b.parts[i] ?? 0);
		if (diff !== 0) return diff;
	}
	if (a.prerelease && !b.prerelease) return -1;
	if (!a.prerelease && b.prerelease) return 1;
	if (a.prerelease && b.prerelease) return a.prerelease < b.prerelease ? -1 : a.prerelease > b.prerelease ? 1 : 0;
	return 0;
}
/** Whether `version` and `base` share their first `lockUpTo + 1` parts. */
function partsMatchUpTo(version, base, lockUpTo) {
	for (let i = 0; i <= lockUpTo; i++) if ((version.parts[i] ?? 0) !== (base.parts[i] ?? 0)) return false;
	return true;
}
function satisfiesCaret(version, base) {
	if (compareVersions(version, base) < 0) return false;
	const fixedIndex = base.parts.findIndex((part) => part !== 0);
	return partsMatchUpTo(version, base, fixedIndex === -1 ? base.parts.length - 1 : fixedIndex);
}
function satisfiesTilde(version, base, segments) {
	if (compareVersions(version, base) < 0) return false;
	return partsMatchUpTo(version, base, segments.length >= 2 ? 1 : 0);
}
function satisfiesExactOrPrefix(version, base, segments) {
	for (let i = 0; i < Math.max(segments.length, 3); i++) if (i < segments.length && (version.parts[i] ?? 0) !== (base.parts[i] ?? 0)) return false;
	return segments.length >= 3 ? compareVersions(version, base) === 0 : true;
}
function satisfiesComparator(version, comparator) {
	const raw = comparator.trim();
	if (!raw || raw === "*" || raw === "x") return true;
	const operatorMatch = raw.match(/^([\^~]|>=|<=|[><=])?(.+)$/);
	if (!operatorMatch) return false;
	const operator = operatorMatch[1];
	const rest = operatorMatch[2].trim();
	const segments = rest.replace(/\.[x*]/gi, "").split(".").filter(Boolean);
	const base = parseVersion(rest.replace(/[x*]/gi, "0"));
	if (!base) return false;
	switch (operator) {
		case ">": return compareVersions(version, base) > 0;
		case ">=": return compareVersions(version, base) >= 0;
		case "<": return compareVersions(version, base) < 0;
		case "<=": return compareVersions(version, base) <= 0;
		case "^": return satisfiesCaret(version, base);
		case "~": return satisfiesTilde(version, base, segments);
		default: return satisfiesExactOrPrefix(version, base, segments);
	}
}
/**
* Pragmatic semver range check for service version declarations; supports
* the common forms (`1.2.3`, `^1.2.3`, `~1.2`, `>=1 <3`, `1.x`, `*`, and
* `||`-joined alternatives) without pulling in a semver dependency. An
* unparseable version or range reads as **not satisfied**.
*/
function satisfiesVersionRange(version, range) {
	const parsed = parseVersion(version);
	if (!parsed) return false;
	const alternatives = range.split("||").map((alt) => alt.trim()).filter(Boolean);
	if (alternatives.length === 0) return true;
	return alternatives.some((alternative) => alternative.split(/\s+/).every((comparator) => satisfiesComparator(parsed, comparator)));
}
function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Deep-merge two values with the service option-set rules (see below). */
function deepMergeTwo(a, b) {
	if (Array.isArray(a) && Array.isArray(b)) return [.../* @__PURE__ */ new Set([...a, ...b])];
	if (isPlainObject(a) && isPlainObject(b)) {
		const out = { ...a };
		for (const key of Object.keys(b)) out[key] = key in a ? deepMergeTwo(a[key], b[key]) : b[key];
		return out;
	}
	return b;
}
/**
* Default option-set merge when a service declares no `mergeOptions`:
* deep-merge in declaration order: objects recurse, arrays union-dedupe,
* scalars take the later value. Covers the built-in services (`roots` /
* `langs` union, `themes` per-key last-wins) without a custom hook.
*/
function deepMergeOptionSets(sets) {
	return sets.reduce((merged, set) => deepMergeTwo(merged, set));
}
//#endregion
export { satisfiesVersionRange as a, resolveServicePackage as i, expandResolveFrom as n, importServicePackage as r, deepMergeOptionSets as t };
