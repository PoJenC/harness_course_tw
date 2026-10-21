import { k as SharedState, o as DevframeNodeContext } from "./context-dOWXVHc6.mjs";
//#region src/node/hub-internals/context.d.ts
interface InternalAnonymousAuthStorage {
  trusted: Record<string, {
    authToken: string;
    ua: string;
    origin: string;
    timestamp: number;
  } | undefined>;
}
interface RemoteTokenRecord {
  dockId: string;
  /** Dock URL origin, matched against WS handshake `Origin` header when `originLock` is on. */
  origin: string;
  originLock: boolean;
}
interface DevframeInternalContext {
  storage: {
    auth: SharedState<InternalAnonymousAuthStorage>;
  };
  /**
   * Revoke an auth token: remove from storage and notify all connected clients
   * using this token that they are no longer trusted.
   */
  revokeAuthToken: (token: string) => Promise<void>;
  /**
   * Session-only tokens issued to remote-UI iframe docks. Not persisted;
   * regenerated on every dev-server restart.
   */
  remoteTokens: Map<string, RemoteTokenRecord>;
  allocateRemoteToken: (dockId: string, origin: string, originLock: boolean) => string;
  revokeRemoteToken: (token: string) => void;
  revokeRemoteTokensForDock: (dockId: string) => void;
  /**
   * Returns true if `token` is a valid remote token and, when `originLock` is
   * on, `requestOrigin` matches the recorded dock origin.
   */
  isRemoteTokenTrusted: (token: string, requestOrigin?: string) => boolean;
  /**
   * Populated by `createWsServer` once the WS port is bound. Consumed by the
   * docks host when enriching remote iframe URLs with a connection descriptor.
   */
  wsEndpoint?: {
    /** Full `ws://` or `wss://` URL with host and port. */
    url: string;
  };
  /**
   * Set {@link DevframeInternalContext.wsEndpoint} and notify subscribers.
   * The WS-binding tiers (side-car, shared-server, and the `unbound` tier's
   * `attach()`) call this once the socket is bound (or `undefined` once torn
   * down) instead of assigning the field directly, so anything that already
   * projected the endpoint (a hub's remote-dock URLs, registered before an
   * async bind resolves) gets a chance to re-project it.
   */
  setWsEndpoint: (endpoint: {
    url: string;
  } | undefined) => void;
  /**
   * Subscribe to every {@link DevframeInternalContext.setWsEndpoint} call.
   * Returns an unsubscribe function. The hub context uses this to refresh
   * the `devframe:docks` shared state so a remote dock registered before the
   * WS port resolves still ends up with a live connection URL.
   */
  onWsEndpointChange: (cb: () => void) => () => void;
}
declare const internalContextMap: WeakMap<DevframeNodeContext, DevframeInternalContext>;
declare function getInternalContext(context: DevframeNodeContext): DevframeInternalContext;
//#endregion
export { internalContextMap as a, getInternalContext as i, InternalAnonymousAuthStorage as n, RemoteTokenRecord as r, DevframeInternalContext as t };