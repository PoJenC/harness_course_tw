import { a as RemoteAssetsStore } from "../remote-assets-eBvSKZMS.mjs";
import { EventHandler, H3 } from "h3";
import { IncomingMessage, ServerResponse } from "node:http";
//#region src/utils/serve-static.d.ts
/**
 * What the static-serving engine accepts: a local directory, or a resolved
 * {@link RemoteAssetsStore} back-proxy (from `devframe/utils/remote-assets`).
 */
export type ServableAssets = string | RemoteAssetsStore;
export interface ServeStaticOptions {
  /** Default: `['index.html']`. */
  indexNames?: string[];
  /** SPA fallback to `indexNames[0]` on miss. Default: `true`. */
  single?: boolean;
}
/**
 * h3 event handler that serves files from `source` with SPA fallback: a
 * local directory, or a {@link RemoteAssetsStore} whose files stream through
 * the CDN back-proxy into the local cache.
 *
 * Drop-in replacement for `fromNodeMiddleware(sirv(dir, { dev: true, single: true }))`
 * when the surrounding server is an h3 app: no `Cache-Control` beyond
 * `no-store`, `Content-Type` resolved via `mrmime`, and a miss with no
 * file extension falls back to `<dir>/index.html` so client-side routing
 * works.
 */
export declare function serveStaticHandler(source: ServableAssets, options?: ServeStaticOptions): EventHandler;
/**
 * Mount {@link serveStaticHandler} on an h3 app at `base`.
 *
 * h3's sub-app mount provides segment-boundary matching and strips `base`
 * from `event.url.pathname`, so the file resolver sees paths relative to
 * `dir`.
 */
export declare function mountStaticHandler(app: H3, base: string, source: ServableAssets, options?: ServeStaticOptions): void;
/**
 * Connect/Express-style Node middleware variant of {@link serveStaticHandler}.
 *
 * Use when mounting onto `viteServer.middlewares.use(base, …)` or any other
 * Connect stack; avoids forcing the host package to depend on h3 just to
 * adapt an event handler back into Node middleware.
 */
export declare function serveStaticNodeMiddleware(source: ServableAssets, options?: ServeStaticOptions): (req: IncomingMessage, res: ServerResponse, next?: (err?: Error) => void) => void;
//#endregion