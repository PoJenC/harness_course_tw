import { a as RemoteAssetsStore, o as StaticAssetsSource } from "../remote-assets-eBvSKZMS.mjs";
//#region src/utils/remote-assets.d.ts
/**
 * Normalize a {@link StaticAssetsSource} into something servable: a local
 * directory (strings pass through; a remote source short-circuits to a
 * locally installed copy of its package when present) or a caching
 * {@link RemoteAssetsStore} back-proxy. Remote caches live under
 * `<projectStorageDir>/.remote-assets/<package>@<version>/`.
 *
 * A remote source's `package`/`version` are validated first (`DF0065`); both
 * are interpolated into CDN URLs and the cache path.
 *
 * `defaultResolveFrom` (typically the declaring devframe's `importMetaUrl`)
 * supplies a `resolveFrom` base for a remote source that doesn't set one:
 * it is applied only when `source.resolveFrom` is `undefined`, so an explicit
 * per-source string still wins and an explicit `null` still opts out of the
 * installed-copy lookup.
 */
export declare function resolveStaticAssetsSource(source: StaticAssetsSource, projectStorageDir: string, defaultResolveFrom?: string | null): string | RemoteAssetsStore;
//#endregion