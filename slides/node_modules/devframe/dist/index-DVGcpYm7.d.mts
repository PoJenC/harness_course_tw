import { k as SharedState, o as DevframeNodeContext, s as DevframeNodeRpcSession } from "./context-dOWXVHc6.mjs";
import { n as InternalAnonymousAuthStorage } from "./context-O8NJzl93.mjs";
//#region src/node/auth/revoke.d.ts
/**
 * Flip `isTrusted` to false on any live WS clients connected with `token`
 * and broadcast the `auth:revoked` event so they can react.
 *
 * Shared between persisted-auth revocation and remote-dock token revocation.
 */
declare function revokeActiveConnectionsForToken(context: DevframeNodeContext, token: string): Promise<void>;
/**
 * Revoke an auth token: remove from storage and notify all connected clients
 * using this token that they are no longer trusted.
 */
declare function revokeAuthToken(context: DevframeNodeContext, storage: SharedState<InternalAnonymousAuthStorage>, token: string): Promise<void>;
//#endregion
//#region src/node/auth/state.d.ts
/**
 * Format a raw `navigator.userAgent` string into the short display label
 * shown for a trusted device (e.g. "Chrome 120 | macOS 14 desktop").
 *
 * The client used to parse+format this itself, but that pulled
 * `ua-parser-modern` into the browser bundle for a label nothing else on
 * the client needs; the client now sends the raw string and parsing
 * happens here, at the server ingress, keeping the persisted label format
 * identical.
 */
declare function describeUA(userAgent: string): string;
/**
 * The current one-time authentication code. Display this to the user (e.g. in
 * the dev-server terminal) so they can type it into the browser to authenticate.
 */
declare function getTempAuthCode(): string;
/**
 * The current code plus its expiry timestamp, for display (e.g. the auth
 * banner). An already-expired code is rotated first, so the returned code is
 * always redeemable for its remaining lifetime.
 */
declare function getTempAuthCodeInfo(): {
  code: string;
  expireAt: number;
};
/**
 * Rotate the authentication code, resetting its expiry window and failed-attempt
 * counter. Call this when a new authentication flow begins (e.g. when an
 * untrusted client starts authenticating) so the displayed code is freshly
 * valid for its full TTL.
 */
declare function refreshTempAuthCode(): string;
/**
 * Build a "magic link" authentication URL that embeds a one-time code (OTP) in
 * the URL **fragment**. Opening it authenticates the client without typing;
 * print it on startup (devframe stays headless, so the host prints its own
 * banner). Defaults to the current code; the link is subject to the same TTL.
 *
 * The code rides the fragment (`#devframe_otp=…`), not the query string, so it
 * is never sent to the server, written to an access log, or leaked in a
 * `Referer` header; the browser client reads it locally (see
 * `consumeOtpFromUrl`). Any existing fragment parameters are preserved.
 */
declare function buildOtpAuthUrl(baseUrl: string, code?: string): string;
/**
 * Re-authenticate a connection that presents a previously-issued bearer token.
 * Returns `true` and marks the session trusted when the token is known.
 *
 * Used by the `anonymous:devframe:auth` handler so a client that already
 * authenticated (token persisted in the browser) is trusted on reconnect
 * without entering the code again.
 */
declare function verifyAuthToken(token: string, session: DevframeNodeRpcSession, storage: SharedState<InternalAnonymousAuthStorage>): boolean;
/**
 * Exchange a one-time authentication code for a fresh, node-issued bearer token.
 *
 * On success this mints a high-entropy token, records it in the trusted store,
 * marks the calling session trusted, rotates the code, and returns the token
 * for the client to persist. Returns `null` on any failure.
 *
 * Because the code is short and human-typed, verification is hardened against
 * brute force: it enforces a time-to-live, compares in constant time, and
 * rotates the code after {@link TEMP_AUTH_MAX_ATTEMPTS} failed attempts so an
 * attacker cannot keep guessing against the same code.
 */
declare function exchangeTempAuthCode(code: string, session: DevframeNodeRpcSession, info: {
  ua: string;
  origin: string;
}, storage: SharedState<InternalAnonymousAuthStorage>): string | null;
//#endregion
export { getTempAuthCodeInfo as a, revokeActiveConnectionsForToken as c, getTempAuthCode as i, revokeAuthToken as l, describeUA as n, refreshTempAuthCode as o, exchangeTempAuthCode as r, verifyAuthToken as s, buildOtpAuthUrl as t };