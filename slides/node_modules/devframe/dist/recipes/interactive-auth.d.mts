import { jt as DevframeAuthHandler, o as DevframeNodeContext, s as DevframeNodeRpcSession } from "../context-dOWXVHc6.mjs";
import "../index-DVGcpYm7.mjs";
import { ColorFn } from "../utils/colors.mjs";
//#region src/recipes/interactive-auth.d.ts
export interface CreateInteractiveAuthOptions {
  /**
   * Static, pre-shared bearer tokens that are always trusted, for CI runs
   * or shared machines where the interactive code prompt would only get in
   * the way. Checked in both the handshake handler and the connect-time
   * hook, alongside tokens minted by a real code exchange.
   */
  clientAuthTokens?: string[];
  /**
   * Print the current code + magic-link URL. Runs when an untrusted browser
   * client asks for a code (`anonymous:devframe:auth:request-code`, sent by
   * the client's `requestAuthCode()`) or when the host calls
   * `auth.printBanner()` itself. Defaults to {@link createAuthBanner}'s
   * output; pass its result here directly to rebrand the box (title /
   * colors), or your own function to replace the format outright.
   */
  banner?: AuthBannerFunction;
  /**
   * Called once a code exchange succeeds, so a host rendering its own
   * banner can retract it. Connect-time trust from a static or
   * remote-dock token doesn't call this.
   */
  onTrusted?: (info: {
    session: DevframeNodeRpcSession;
    authToken: string;
  }) => void;
  /**
   * The base URL the magic link should point at. Defaults to
   * `context.host.resolveOrigin()`.
   */
  serverUrl?: () => string;
}
/** The browser client whose `anonymous:devframe:auth:request-code` call triggered a banner print. */
export interface AuthBannerRequester {
  /** Short display label parsed from the client's user agent (e.g. `Chrome 120 | macOS 14 desktop`). */
  ua: string;
  /** The requesting page's `location.origin`. */
  origin: string;
}
/** What `options.banner` receives on each print. */
export interface AuthBannerInfo {
  code: string;
  url: string;
  /** Epoch-ms timestamp the code stops being redeemable at. */
  expireAt: number;
  /** Present when a browser client requested the print; absent for a host's own `printBanner()` call. */
  requester?: AuthBannerRequester;
}
/** Signature of `options.banner`: render the current auth code + magic-link URL. */
export type AuthBannerFunction = (info: AuthBannerInfo) => void;
/** Palette for {@link createAuthBanner}'s box - one color per part, so a host can rebrand a subset. */
export interface CreateAuthBannerColorsOptions {
  border: ColorFn;
  title: ColorFn;
  label: ColorFn;
  code: ColorFn;
  url: ColorFn;
}
export interface CreateAuthBannerOptions {
  /** Box title. Defaults to `'Devframe'` - set to your product name for branding. */
  title?: string;
  /** Palette overrides; unset colors fall back to dim/bold/cyan defaults. */
  colors?: Partial<CreateAuthBannerColorsOptions>;
}
/**
 * Build a {@link AuthBannerFunction} that renders the auth code + magic-link
 * URL as a small bordered box, its two rows label-aligned. `createInteractiveAuth`
 * falls back to `createAuthBanner()` when no `banner` is given; call this
 * yourself to rebrand the box (`title` / `colors`) and pass the result as
 * `options.banner`.
 */
export declare function createAuthBanner(options?: CreateAuthBannerOptions): AuthBannerFunction;
/**
 * Package the interactive OTP auth protocol devframe's primitives
 * (`exchangeTempAuthCode`, `verifyAuthToken`, `revokeAuthToken`,
 * `getTempAuthCode`, `buildOtpAuthUrl`) implement into a ready-made
 * {@link DevframeAuthHandler}: the handshake RPC functions, the resolver
 * gate, the connect-time trust hook, and the startup banner.
 *
 * The auth storage stays internal to this handler; callers never reach into
 * `devframe/node/hub-internals` themselves.
 *
 * ```ts
 * import { createInteractiveAuth } from 'devframe/recipes/interactive-auth'
 *
 * const auth = createInteractiveAuth(ctx)
 * auth.rpcFunctions.forEach(fn => ctx.rpc.register(fn))
 * auth.printBanner()
 *
 * // wire `auth.authorize` / `auth.onConnect` into your transport, or pass
 * // the whole handler to `initDevframe` / `initHub` via their `auth` option.
 * ```
 */
export declare function createInteractiveAuth(context: DevframeNodeContext, options?: CreateInteractiveAuthOptions): DevframeAuthHandler;
//#endregion