import { FetchHandler, ServerRequest, ServerRequestContext, ServerRuntimeContext } from "srvx";
declare const kGetSession: unique symbol;
declare const kSessionNew: unique symbol;
/**
 * Stringify options.
 */
interface CookieStringifyOptions {
  /**
   * Specifies a function that will be used to encode a [cookie-value](https://datatracker.ietf.org/doc/html/rfc6265#section-4.1.1).
   * Since value of a cookie has a limited character set (and must be a simple string), this function can be used to encode
   * a value into a string suited for a cookie's value, and should mirror `decode` when parsing.
   *
   * @default encodeURIComponent
   */
  encode?: (str: string) => string;
  /**
   * Specifies a function that will be used to coerce non-string values to a string.
   *
   * @default JSON.stringify
   */
  stringify?: (value: unknown) => string;
}
/**
 * Set-Cookie object.
 */
interface SetCookie {
  /**
   * Specifies the name of the cookie.
   */
  name: string;
  /**
   * Specifies the string to be the value for the cookie.
   */
  value: string | undefined;
  /**
   * Specifies the `number` (in seconds) to be the value for the [`Max-Age` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.2).
   *
   * The [cookie storage model specification](https://tools.ietf.org/html/rfc6265#section-5.3) states that if both `expires` and
   * `maxAge` are set, then `maxAge` takes precedence, but it is possible not all clients by obey this,
   * so if both are set, they should point to the same date and time.
   */
  maxAge?: number;
  /**
   * Specifies the `Date` object to be the value for the [`Expires` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.1).
   * When no expiration is set, clients consider this a "non-persistent cookie" and delete it when the current session is over.
   *
   * The [cookie storage model specification](https://tools.ietf.org/html/rfc6265#section-5.3) states that if both `expires` and
   * `maxAge` are set, then `maxAge` takes precedence, but it is possible not all clients by obey this,
   * so if both are set, they should point to the same date and time.
   */
  expires?: Date;
  /**
   * Specifies the value for the [`Domain` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.3).
   * When no domain is set, clients consider the cookie to apply to the current domain only.
   */
  domain?: string;
  /**
   * Specifies the value for the [`Path` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.4).
   * When no path is set, the path is considered the ["default path"](https://tools.ietf.org/html/rfc6265#section-5.1.4).
   */
  path?: string;
  /**
   * Enables the [`HttpOnly` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.6).
   * When enabled, clients will not allow client-side JavaScript to see the cookie in `document.cookie`.
   */
  httpOnly?: boolean;
  /**
   * Enables the [`Secure` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.5).
   * When enabled, clients will only send the cookie back if the browser has an HTTPS connection.
   */
  secure?: boolean;
  /**
   * Enables the [`Partitioned` `Set-Cookie` attribute](https://tools.ietf.org/html/draft-cutler-httpbis-partitioned-cookies/).
   * When enabled, clients will only send the cookie back when the current domain _and_ top-level domain matches.
   *
   * This is an attribute that has not yet been fully standardized, and may change in the future.
   * This also means clients may ignore this attribute until they understand it. More information
   * about can be found in [the proposal](https://github.com/privacycg/CHIPS).
   */
  partitioned?: boolean;
  /**
   * Specifies the value for the [`Priority` `Set-Cookie` attribute](https://tools.ietf.org/html/draft-west-cookie-priority-00#section-4.1).
   *
   * - `'low'` will set the `Priority` attribute to `Low`.
   * - `'medium'` will set the `Priority` attribute to `Medium`, the default priority when not set.
   * - `'high'` will set the `Priority` attribute to `High`.
   *
   * More information about priority levels can be found in [the specification](https://tools.ietf.org/html/draft-west-cookie-priority-00#section-4.1).
   */
  priority?: "low" | "medium" | "high";
  /**
   * Specifies the value for the [`SameSite` `Set-Cookie` attribute](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-09#section-5.4.7).
   *
   * - `true` will set the `SameSite` attribute to `Strict` for strict same site enforcement.
   * - `'lax'` will set the `SameSite` attribute to `Lax` for lax same site enforcement.
   * - `'none'` will set the `SameSite` attribute to `None` for an explicit cross-site cookie.
   * - `'strict'` will set the `SameSite` attribute to `Strict` for strict same site enforcement.
   *
   * More information about enforcement levels can be found in [the specification](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-09#section-5.4.7).
   */
  sameSite?: boolean | "lax" | "strict" | "none";
}
/**
 * Backward compatibility serialize options.
 */
type CookieSerializeOptions = CookieStringifyOptions & Omit<SetCookie, "name" | "value">;
/** Algorithm used for encryption and decryption. */
type EncryptionAlgorithm = "aes-128-ctr" | "aes-256-cbc";
/** Algorithm used for integrity verification. */
type IntegrityAlgorithm = "sha256";
/** @internal */
type _Algorithm = EncryptionAlgorithm | IntegrityAlgorithm;
/**
 * Options for customizing the key derivation algorithm used to generate encryption and integrity verification keys as well as the algorithms and salt sizes used.
 */
type SealOptions = Readonly<{
  /** Encryption step options. */
  encryption: SealOptionsSub<EncryptionAlgorithm>;
  /** Integrity step options. */
  integrity: SealOptionsSub<IntegrityAlgorithm>;
  ttl: number;
  /** Number of seconds of permitted clock skew for incoming expirations. Defaults to 60 seconds. */
  timestampSkewSec: number;
  /**
   * Local clock time offset, expressed in number of milliseconds (positive or negative). Defaults to 0.
   */
  localtimeOffsetMsec: number;
}>;
/** `seal()` method options. */
type SealOptionsSub<Algorithm extends _Algorithm = _Algorithm> = Readonly<{
  /** The length of the salt (random buffer used to ensure that two identical objects will generate a different encrypted result). Defaults to 256. */
  saltBits: number;
  /** The algorithm used. Defaults to 'aes-256-cbc' for encryption and 'sha256' for integrity. */
  algorithm: Algorithm;
  /** The number of iterations used to derive a key from the password. Defaults to 1. */
  iterations: number;
  /** Minimum password size. Defaults to 32. */
  minPasswordlength: number;
}>;
type SessionDataT = Record<string, any>;
export type SessionData<T extends SessionDataT = SessionDataT> = Partial<T>;
export interface Session<T extends SessionDataT = SessionDataT> {
  id: string;
  /** Time the session was created. The point `maxAge` is measured from. */
  createdAt: number;
  /**
   * Time the session was last resealed. Only stamped when `idleTimeout` is set,
   * and the point the idle window is measured from.
   */
  lastSeenAt?: number;
  data: SessionData<T>;
  [kGetSession]?: Promise<Session<T>>;
  /** Set on a session created in-memory for this request and not yet persisted */
  [kSessionNew]?: true;
}
export interface SessionManager<T extends SessionDataT = SessionDataT> {
  readonly id: string | undefined;
  readonly data: SessionData<T>;
  update: (update: SessionUpdate<T>) => Promise<SessionManager<T>>;
  clear: () => Promise<SessionManager<T>>;
}
export interface SessionConfig {
  /**
   * Private key used to seal session tokens. Must be at least 32 characters.
   *
   * Its entropy is the security boundary: a stolen cookie can be brute-forced
   * offline, so generate this from a cryptographically random source (e.g.
   * `crypto.randomBytes(32).toString("base64")`) — a guessable passphrase is
   * unsafe even at 32+ characters.
   */
  password: string;
  /**
   * Absolute session lifetime in seconds, counted from when the session was
   * created. Reached regardless of how active the user is.
   */
  maxAge?: number;
  /**
   * Sliding session lifetime in seconds, counted from the last request. An
   * active user stays signed in; an idle one is signed out after this long.
   *
   * Equivalent to `rolling` in express-session and koa-session, but with its own
   * duration instead of reinterpreting `maxAge` — so `maxAge` remains available
   * as an absolute cap on top of the idle window rather than being replaced.
   *
   * H3 moves the window forward by resealing the session cookie with the reseal
   * time stamped into it as `lastSeenAt`; `createdAt` is untouched. Only
   * cookie-based sessions slide: a session read from the session header cannot
   * be resealed, so it expires `idleTimeout` after its seal was issued.
   *
   * The reseal is throttled to once per half window (writing the session
   * reseals it too, and counts), so `lastSeenAt` can trail the last request by
   * up to half of `idleTimeout`. An idle session is therefore signed out
   * between `idleTimeout / 2` and `idleTimeout` after the last request — never
   * later, and never while the user keeps making requests.
   */
  idleTimeout?: number;
  /** default is h3 */
  name?: string;
  /** Default is secure, httpOnly, sameSite lax, / */
  cookie?: false | (CookieSerializeOptions & {
    chunkMaxLength?: number;
  });
  /** Default is x-h3-session / x-{name}-session */
  sessionHeader?: false | string;
  /**
   * Overrides for the iron seal (algorithms, PBKDF2 iterations, TTL, clock skew).
   *
   * `SealOptions` has no optional fields, so an override must specify all of
   * them. Session expiration is enforced by `maxAge`/`idleTimeout` independently
   * of the seal `ttl` set here, so a shorter or zeroed `ttl` cannot extend a
   * session beyond those limits.
   */
  seal?: SealOptions;
  /**
   * Set to `false` to reject sessions sealed with the legacy default of 1
   * PBKDF2 iteration instead of unsealing and resealing them.
   *
   * @deprecated The legacy seal fallback (and this option) will be removed in v3.
   */
  legacySealFallback?: boolean;
  crypto?: Crypto;
  /** Default is Crypto.randomUUID */
  generateId?: () => string;
}
/**
 * Create a session manager for the current request.
 *
 * Starts a session if the request does not carry one, persisting it so its id
 * is stable across requests. Use {@link getSession} to read a session without
 * starting one.
 */
export declare function useSession<T extends SessionData = SessionData>(event: HTTPEvent, config: SessionConfig): Promise<SessionManager<T>>;
/**
 * Get the session for the current request.
 *
 * A request without a session gets a new one initialized in memory only — no
 * `Set-Cookie` is issued until something is stored with {@link updateSession},
 * so reading the session (an auth check, for example) does not start one for
 * anonymous visitors. Its `id` is therefore only stable across requests once
 * the session has been written; use {@link useSession} to start one eagerly.
 */
export declare function getSession<T extends SessionData = SessionData>(event: HTTPEvent, config: SessionConfig): Promise<Session<T>>;
type SessionUpdate<T extends SessionData = SessionData> = Partial<SessionData<T>> | ((oldData: SessionData<T>) => Partial<SessionData<T>> | undefined);
/**
 * Update the session data for the current request.
 */
export declare function updateSession<T extends SessionData = SessionData>(event: HTTPEvent, config: SessionConfig, update?: SessionUpdate<T>): Promise<Session<T>>;
/**
 * Encrypt and sign the session data for the current request.
 */
export declare function sealSession<T extends SessionData = SessionData>(event: HTTPEvent, config: SessionConfig): Promise<string>;
/**
 * Decrypt and verify the session data for the current request.
 */
export declare function unsealSession(_event: HTTPEvent, config: SessionConfig, sealed: string): Promise<Partial<Session>>;
/**
 * Clear the session data for the current request.
 */
export declare function clearSession(event: HTTPEvent, config: Partial<SessionConfig>): Promise<void>;
//#region src/fetch.d.ts
type TypedHeaderName<TypedHeaderValues> = Extract<keyof TypedHeaderValues, string> | string & {};
type TypedHeaderValue<TypedHeaderValues, Name extends string> = Lowercase<Name> extends keyof TypedHeaderValues ? Extract<TypedHeaderValues[Lowercase<Name>], string> : string;
interface TypedHeaders<TypedHeaderValues extends Record<string, string> | unknown> extends Omit<Headers, "append" | "delete" | "get" | "getSetCookie" | "has" | "set" | "forEach"> {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/append) */
  append: <Name extends TypedHeaderName<TypedHeaderValues>>(name: Name, value: TypedHeaderValue<TypedHeaderValues, Name>) => void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/delete) */
  delete: <Name extends TypedHeaderName<TypedHeaderValues>>(name: Name) => void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/get) */
  get: <Name extends TypedHeaderName<TypedHeaderValues>>(name: Name) => TypedHeaderValue<TypedHeaderValues, Name> | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/getSetCookie) */
  getSetCookie: () => string[];
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/has) */
  has: <Name extends TypedHeaderName<TypedHeaderValues>>(name: Name) => boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/set) */
  set: <Name extends TypedHeaderName<TypedHeaderValues>>(name: Name, value: TypedHeaderValue<TypedHeaderValues, Name>) => void;
  forEach: (callbackfn: (value: Extract<TypedHeaderValues[keyof TypedHeaderValues], string> | string & {}, key: TypedHeaderName<TypedHeaderValues>, parent: TypedHeaders<TypedHeaderValues>) => void, thisArg?: any) => void;
}
interface TypedResponse<Body = unknown, Headers extends Record<string, string> | unknown = ResponseHeaderMap> extends Omit<Response, "clone" | "headers" | "json"> {
  clone: () => TypedResponse<Body, Headers>;
  json: () => Promise<Body>;
  headers: TypedHeaders<Headers>;
}
interface TypedRequest<Body = unknown, Headers extends Record<string, string> | unknown = RequestHeaderMap> extends Omit<Request, "clone" | "headers" | "json"> {
  clone: () => TypedRequest<Body, Headers>;
  json: () => Promise<Body>;
  headers: TypedHeaders<Headers>;
}
//#endregion
//#region src/http/mimes.d.ts
type ApplicationType = `application/${"1d-interleaved-parityfec" | "3gpdash-qoe-report+xml" | "3gppHal+json" | "3gppHalForms+json" | "3gpp-ims+xml" | "A2L" | "ace+cbor" | "ace+json" | "activemessage" | "activity+json" | "aif+cbor" | "aif+json" | "alto-cdni+json" | "alto-cdnifilter+json" | "alto-costmap+json" | "alto-costmapfilter+json" | "alto-directory+json" | "alto-endpointprop+json" | "alto-endpointpropparams+json" | "alto-endpointcost+json" | "alto-endpointcostparams+json" | "alto-error+json" | "alto-networkmapfilter+json" | "alto-networkmap+json" | "alto-propmap+json" | "alto-propmapparams+json" | "alto-tips+json" | "alto-tipsparams+json" | "alto-updatestreamcontrol+json" | "alto-updatestreamparams+json" | "AML" | "andrew-inset" | "applefile" | "at+jwt" | "ATF" | "ATFX" | "atom+xml" | "atomcat+xml" | "atomdeleted+xml" | "atomicmail" | "atomsvc+xml" | "atsc-dwd+xml" | "atsc-dynamic-event-message" | "atsc-held+xml" | "atsc-rdt+json" | "atsc-rsat+xml" | "ATXML" | "auth-policy+xml" | "automationml-aml+xml" | "automationml-amlx+zip" | "bacnet-xdd+zip" | "batch-SMTP" | "beep+xml" | "c2pa" | "calendar+json" | "calendar+xml" | "call-completion" | "CALS-1840" | "captive+json" | "cbor" | "cbor-seq" | "cccex" | "ccmp+xml" | "ccxml+xml" | "cda+xml" | "CDFX+XML" | "cdmi-capability" | "cdmi-container" | "cdmi-domain" | "cdmi-object" | "cdmi-queue" | "cdni" | "CEA" | "cea-2018+xml" | "cellml+xml" | "cfw" | "cid-edhoc+cbor-seq" | "city+json" | "clr" | "clue_info+xml" | "clue+xml" | "cms" | "cnrp+xml" | "coap-group+json" | "coap-payload" | "commonground" | "concise-problem-details+cbor" | "conference-info+xml" | "cpl+xml" | "cose" | "cose-key" | "cose-key-set" | "cose-x509" | "csrattrs" | "csta+xml" | "CSTAdata+xml" | "csvm+json" | "cwl" | "cwl+json" | "cwt" | "cybercash" | "dash+xml" | "dash-patch+xml" | "dashdelta" | "davmount+xml" | "dca-rft" | "DCD" | "dec-dx" | "dialog-info+xml" | "dicom" | "dicom+json" | "dicom+xml" | "DII" | "DIT" | "dns" | "dns+json" | "dns-message" | "dots+cbor" | "dpop+jwt" | "dskpp+xml" | "dssc+der" | "dssc+xml" | "dvcs" | "ecmascript" | "edhoc+cbor-seq" | "EDI-consent" | "EDIFACT" | "EDI-X12" | "efi" | "elm+json" | "elm+xml" | "EmergencyCallData.cap+xml" | "EmergencyCallData.Comment+xml" | "EmergencyCallData.Control+xml" | "EmergencyCallData.DeviceInfo+xml" | "EmergencyCallData.eCall.MSD" | "EmergencyCallData.LegacyESN+json" | "EmergencyCallData.ProviderInfo+xml" | "EmergencyCallData.ServiceInfo+xml" | "EmergencyCallData.SubscriberInfo+xml" | "EmergencyCallData.VEDS+xml" | "emma+xml" | "emotionml+xml" | "encaprtp" | "epp+xml" | "epub+zip" | "eshop" | "example" | "exi" | "expect-ct-report+json" | "express" | "fastinfoset" | "fastsoap" | "fdf" | "fdt+xml" | "fhir+json" | "fhir+xml" | "fits" | "flexfec" | "font-sfnt" | "font-tdpfr" | "font-woff" | "framework-attributes+xml" | "geo+json" | "geo+json-seq" | "geopackage+sqlite3" | "geoxacml+json" | "geoxacml+xml" | "gltf-buffer" | "gml+xml" | "gzip" | "H224" | "held+xml" | "hl7v2+xml" | "http" | "hyperstudio" | "ibe-key-request+xml" | "ibe-pkg-reply+xml" | "ibe-pp-data" | "iges" | "im-iscomposing+xml" | "index" | "index.cmd" | "index.obj" | "index.response" | "index.vnd" | "inkml+xml" | "IOTP" | "ipfix" | "ipp" | "ISUP" | "its+xml" | "java-archive" | "javascript" | "jf2feed+json" | "jose" | "jose+json" | "jrd+json" | "jscalendar+json" | "jscontact+json" | "json" | "json-patch+json" | "json-seq" | "jsonpath" | "jwk+json" | "jwk-set+json" | "jwt" | "kpml-request+xml" | "kpml-response+xml" | "ld+json" | "lgr+xml" | "link-format" | "linkset" | "linkset+json" | "load-control+xml" | "logout+jwt" | "lost+xml" | "lostsync+xml" | "lpf+zip" | "LXF" | "mac-binhex40" | "macwriteii" | "mads+xml" | "manifest+json" | "marc" | "marcxml+xml" | "mathematica" | "mathml+xml" | "mathml-content+xml" | "mathml-presentation+xml" | "mbms-associated-procedure-description+xml" | "mbms-deregister+xml" | "mbms-envelope+xml" | "mbms-msk-response+xml" | "mbms-msk+xml" | "mbms-protection-description+xml" | "mbms-reception-report+xml" | "mbms-register-response+xml" | "mbms-register+xml" | "mbms-schedule+xml" | "mbms-user-service-description+xml" | "mbox" | "media_control+xml" | "media-policy-dataset+xml" | "mediaservercontrol+xml" | "merge-patch+json" | "metalink4+xml" | "mets+xml" | "MF4" | "mikey" | "mipc" | "missing-blocks+cbor-seq" | "mmt-aei+xml" | "mmt-usd+xml" | "mods+xml" | "moss-keys" | "moss-signature" | "mosskey-data" | "mosskey-request" | "mp21" | "mp4" | "mpeg4-generic" | "mpeg4-iod" | "mpeg4-iod-xmt" | "mrb-consumer+xml" | "mrb-publish+xml" | "msc-ivr+xml" | "msc-mixer+xml" | "msword" | "mud+json" | "multipart-core" | "mxf" | "n-quads" | "n-triples" | "nasdata" | "news-checkgroups" | "news-groupinfo" | "news-transmission" | "nlsml+xml" | "node" | "nss" | "oauth-authz-req+jwt" | "oblivious-dns-message" | "ocsp-request" | "ocsp-response" | "octet-stream" | "ODA" | "odm+xml" | "ODX" | "oebps-package+xml" | "ogg" | "ohttp-keys" | "opc-nodeset+xml" | "oscore" | "oxps" | "p21" | "p21+zip" | "p2p-overlay+xml" | "parityfec" | "passport" | "patch-ops-error+xml" | "pdf" | "PDX" | "pem-certificate-chain" | "pgp-encrypted" | "pgp-keys" | "pgp-signature" | "pidf-diff+xml" | "pidf+xml" | "pkcs10" | "pkcs7-mime" | "pkcs7-signature" | "pkcs8" | "pkcs8-encrypted" | "pkcs12" | "pkix-attr-cert" | "pkix-cert" | "pkix-crl" | "pkix-pkipath" | "pkixcmp" | "pls+xml" | "poc-settings+xml" | "postscript" | "ppsp-tracker+json" | "private-token-issuer-directory" | "private-token-request" | "private-token-response" | "problem+json" | "problem+xml" | "provenance+xml" | "prs.alvestrand.titrax-sheet" | "prs.cww" | "prs.cyn" | "prs.hpub+zip" | "prs.implied-document+xml" | "prs.implied-executable" | "prs.implied-object+json" | "prs.implied-object+json-seq" | "prs.implied-object+yaml" | "prs.implied-structure" | "prs.nprend" | "prs.plucker" | "prs.rdf-xml-crypt" | "prs.vcfbzip2" | "prs.xsf+xml" | "pskc+xml" | "pvd+json" | "rdf+xml" | "route-apd+xml" | "route-s-tsid+xml" | "route-usd+xml" | "QSIG" | "raptorfec" | "rdap+json" | "reginfo+xml" | "relax-ng-compact-syntax" | "remote-printing" | "reputon+json" | "resource-lists-diff+xml" | "resource-lists+xml" | "rfc+xml" | "riscos" | "rlmi+xml" | "rls-services+xml" | "rpki-checklist" | "rpki-ghostbusters" | "rpki-manifest" | "rpki-publication" | "rpki-roa" | "rpki-updown" | "rtf" | "rtploopback" | "rtx" | "samlassertion+xml" | "samlmetadata+xml" | "sarif-external-properties+json" | "sarif+json" | "sbe" | "sbml+xml" | "scaip+xml" | "scim+json" | "scvp-cv-request" | "scvp-cv-response" | "scvp-vp-request" | "scvp-vp-response" | "sdp" | "secevent+jwt" | "senml-etch+cbor" | "senml-etch+json" | "senml-exi" | "senml+cbor" | "senml+json" | "senml+xml" | "sensml-exi" | "sensml+cbor" | "sensml+json" | "sensml+xml" | "sep-exi" | "sep+xml" | "session-info" | "set-payment" | "set-payment-initiation" | "set-registration" | "set-registration-initiation" | "SGML" | "sgml-open-catalog" | "shf+xml" | "sieve" | "simple-filter+xml" | "simple-message-summary" | "simpleSymbolContainer" | "sipc" | "slate" | "smil" | "smil+xml" | "smpte336m" | "soap+fastinfoset" | "soap+xml" | "sparql-query" | "spdx+json" | "sparql-results+xml" | "spirits-event+xml" | "sql" | "srgs" | "srgs+xml" | "sru+xml" | "ssml+xml" | "stix+json" | "swid+cbor" | "swid+xml" | "tamp-apex-update" | "tamp-apex-update-confirm" | "tamp-community-update" | "tamp-community-update-confirm" | "tamp-error" | "tamp-sequence-adjust" | "tamp-sequence-adjust-confirm" | "tamp-status-query" | "tamp-status-response" | "tamp-update" | "tamp-update-confirm" | "taxii+json" | "td+json" | "tei+xml" | "TETRA_ISI" | "thraud+xml" | "timestamp-query" | "timestamp-reply" | "timestamped-data" | "tlsrpt+gzip" | "tlsrpt+json" | "tm+json" | "tnauthlist" | "token-introspection+jwt" | "trickle-ice-sdpfrag" | "trig" | "ttml+xml" | "tve-trigger" | "tzif" | "tzif-leap" | "ulpfec" | "urc-grpsheet+xml" | "urc-ressheet+xml" | "urc-targetdesc+xml" | "urc-uisocketdesc+xml" | "vcard+json" | "vcard+xml" | "vemmi" | "vnd.1000minds.decision-model+xml" | "vnd.1ob" | "vnd.3gpp.5gnas" | "vnd.3gpp.access-transfer-events+xml" | "vnd.3gpp.bsf+xml" | "vnd.3gpp.crs+xml" | "vnd.3gpp.current-location-discovery+xml" | "vnd.3gpp.GMOP+xml" | "vnd.3gpp.gtpc" | "vnd.3gpp.interworking-data" | "vnd.3gpp.lpp" | "vnd.3gpp.mc-signalling-ear" | "vnd.3gpp.mcdata-affiliation-command+xml" | "vnd.3gpp.mcdata-info+xml" | "vnd.3gpp.mcdata-msgstore-ctrl-request+xml" | "vnd.3gpp.mcdata-payload" | "vnd.3gpp.mcdata-regroup+xml" | "vnd.3gpp.mcdata-service-config+xml" | "vnd.3gpp.mcdata-signalling" | "vnd.3gpp.mcdata-ue-config+xml" | "vnd.3gpp.mcdata-user-profile+xml" | "vnd.3gpp.mcptt-affiliation-command+xml" | "vnd.3gpp.mcptt-floor-request+xml" | "vnd.3gpp.mcptt-info+xml" | "vnd.3gpp.mcptt-location-info+xml" | "vnd.3gpp.mcptt-mbms-usage-info+xml" | "vnd.3gpp.mcptt-regroup+xml" | "vnd.3gpp.mcptt-service-config+xml" | "vnd.3gpp.mcptt-signed+xml" | "vnd.3gpp.mcptt-ue-config+xml" | "vnd.3gpp.mcptt-ue-init-config+xml" | "vnd.3gpp.mcptt-user-profile+xml" | "vnd.3gpp.mcvideo-affiliation-command+xml" | "vnd.3gpp.mcvideo-affiliation-info+xml" | "vnd.3gpp.mcvideo-info+xml" | "vnd.3gpp.mcvideo-location-info+xml" | "vnd.3gpp.mcvideo-mbms-usage-info+xml" | "vnd.3gpp.mcvideo-regroup+xml" | "vnd.3gpp.mcvideo-service-config+xml" | "vnd.3gpp.mcvideo-transmission-request+xml" | "vnd.3gpp.mcvideo-ue-config+xml" | "vnd.3gpp.mcvideo-user-profile+xml" | "vnd.3gpp.mid-call+xml" | "vnd.3gpp.ngap" | "vnd.3gpp.pfcp" | "vnd.3gpp.pic-bw-large" | "vnd.3gpp.pic-bw-small" | "vnd.3gpp.pic-bw-var" | "vnd.3gpp-prose-pc3a+xml" | "vnd.3gpp-prose-pc3ach+xml" | "vnd.3gpp-prose-pc3ch+xml" | "vnd.3gpp-prose-pc8+xml" | "vnd.3gpp-prose+xml" | "vnd.3gpp.s1ap" | "vnd.3gpp.seal-group-doc+xml" | "vnd.3gpp.seal-info+xml" | "vnd.3gpp.seal-location-info+xml" | "vnd.3gpp.seal-mbms-usage-info+xml" | "vnd.3gpp.seal-network-QoS-management-info+xml" | "vnd.3gpp.seal-ue-config-info+xml" | "vnd.3gpp.seal-unicast-info+xml" | "vnd.3gpp.seal-user-profile-info+xml" | "vnd.3gpp.sms" | "vnd.3gpp.sms+xml" | "vnd.3gpp.srvcc-ext+xml" | "vnd.3gpp.SRVCC-info+xml" | "vnd.3gpp.state-and-event-info+xml" | "vnd.3gpp.ussd+xml" | "vnd.3gpp.vae-info+xml" | "vnd.3gpp-v2x-local-service-information" | "vnd.3gpp2.bcmcsinfo+xml" | "vnd.3gpp2.sms" | "vnd.3gpp2.tcap" | "vnd.3gpp.v2x" | "vnd.3lightssoftware.imagescal" | "vnd.3M.Post-it-Notes" | "vnd.accpac.simply.aso" | "vnd.accpac.simply.imp" | "vnd.acm.addressxfer+json" | "vnd.acm.chatbot+json" | "vnd.acucobol" | "vnd.acucorp" | "vnd.adobe.flash.movie" | "vnd.adobe.formscentral.fcdt" | "vnd.adobe.fxp" | "vnd.adobe.partial-upload" | "vnd.adobe.xdp+xml" | "vnd.aether.imp" | "vnd.afpc.afplinedata" | "vnd.afpc.afplinedata-pagedef" | "vnd.afpc.cmoca-cmresource" | "vnd.afpc.foca-charset" | "vnd.afpc.foca-codedfont" | "vnd.afpc.foca-codepage" | "vnd.afpc.modca" | "vnd.afpc.modca-cmtable" | "vnd.afpc.modca-formdef" | "vnd.afpc.modca-mediummap" | "vnd.afpc.modca-objectcontainer" | "vnd.afpc.modca-overlay" | "vnd.afpc.modca-pagesegment" | "vnd.age" | "vnd.ah-barcode" | "vnd.ahead.space" | "vnd.airzip.filesecure.azf" | "vnd.airzip.filesecure.azs" | "vnd.amadeus+json" | "vnd.amazon.mobi8-ebook" | "vnd.americandynamics.acc" | "vnd.amiga.ami" | "vnd.amundsen.maze+xml" | "vnd.android.ota" | "vnd.anki" | "vnd.anser-web-certificate-issue-initiation" | "vnd.antix.game-component" | "vnd.apache.arrow.file" | "vnd.apache.arrow.stream" | "vnd.apache.thrift.binary" | "vnd.apache.thrift.compact" | "vnd.apache.thrift.json" | "vnd.apexlang" | "vnd.api+json" | "vnd.aplextor.warrp+json" | "vnd.apothekende.reservation+json" | "vnd.apple.installer+xml" | "vnd.apple.keynote" | "vnd.apple.mpegurl" | "vnd.apple.numbers" | "vnd.apple.pages" | "vnd.arastra.swi" | "vnd.aristanetworks.swi" | "vnd.artisan+json" | "vnd.artsquare" | "vnd.astraea-software.iota" | "vnd.audiograph" | "vnd.autopackage" | "vnd.avalon+json" | "vnd.avistar+xml" | "vnd.balsamiq.bmml+xml" | "vnd.banana-accounting" | "vnd.bbf.usp.error" | "vnd.bbf.usp.msg" | "vnd.bbf.usp.msg+json" | "vnd.balsamiq.bmpr" | "vnd.bekitzur-stech+json" | "vnd.belightsoft.lhzd+zip" | "vnd.belightsoft.lhzl+zip" | "vnd.bint.med-content" | "vnd.biopax.rdf+xml" | "vnd.blink-idb-value-wrapper" | "vnd.blueice.multipass" | "vnd.bluetooth.ep.oob" | "vnd.bluetooth.le.oob" | "vnd.bmi" | "vnd.bpf" | "vnd.bpf3" | "vnd.businessobjects" | "vnd.byu.uapi+json" | "vnd.bzip3" | "vnd.cab-jscript" | "vnd.canon-cpdl" | "vnd.canon-lips" | "vnd.capasystems-pg+json" | "vnd.cendio.thinlinc.clientconf" | "vnd.century-systems.tcp_stream" | "vnd.chemdraw+xml" | "vnd.chess-pgn" | "vnd.chipnuts.karaoke-mmd" | "vnd.ciedi" | "vnd.cinderella" | "vnd.cirpack.isdn-ext" | "vnd.citationstyles.style+xml" | "vnd.claymore" | "vnd.cloanto.rp9" | "vnd.clonk.c4group" | "vnd.cluetrust.cartomobile-config" | "vnd.cluetrust.cartomobile-config-pkg" | "vnd.cncf.helm.chart.content.v1.tar+gzip" | "vnd.cncf.helm.chart.provenance.v1.prov" | "vnd.cncf.helm.config.v1+json" | "vnd.coffeescript" | "vnd.collabio.xodocuments.document" | "vnd.collabio.xodocuments.document-template" | "vnd.collabio.xodocuments.presentation" | "vnd.collabio.xodocuments.presentation-template" | "vnd.collabio.xodocuments.spreadsheet" | "vnd.collabio.xodocuments.spreadsheet-template" | "vnd.collection.doc+json" | "vnd.collection+json" | "vnd.collection.next+json" | "vnd.comicbook-rar" | "vnd.comicbook+zip" | "vnd.commerce-battelle" | "vnd.commonspace" | "vnd.coreos.ignition+json" | "vnd.cosmocaller" | "vnd.contact.cmsg" | "vnd.crick.clicker" | "vnd.crick.clicker.keyboard" | "vnd.crick.clicker.palette" | "vnd.crick.clicker.template" | "vnd.crick.clicker.wordbank" | "vnd.criticaltools.wbs+xml" | "vnd.cryptii.pipe+json" | "vnd.crypto-shade-file" | "vnd.cryptomator.encrypted" | "vnd.cryptomator.vault" | "vnd.ctc-posml" | "vnd.ctct.ws+xml" | "vnd.cups-pdf" | "vnd.cups-postscript" | "vnd.cups-ppd" | "vnd.cups-raster" | "vnd.cups-raw" | "vnd.curl" | "vnd.cyan.dean.root+xml" | "vnd.cybank" | "vnd.cyclonedx+json" | "vnd.cyclonedx+xml" | "vnd.d2l.coursepackage1p0+zip" | "vnd.d3m-dataset" | "vnd.d3m-problem" | "vnd.dart" | "vnd.data-vision.rdz" | "vnd.datalog" | "vnd.datapackage+json" | "vnd.dataresource+json" | "vnd.dbf" | "vnd.debian.binary-package" | "vnd.dece.data" | "vnd.dece.ttml+xml" | "vnd.dece.unspecified" | "vnd.dece.zip" | "vnd.denovo.fcselayout-link" | "vnd.desmume.movie" | "vnd.dir-bi.plate-dl-nosuffix" | "vnd.dm.delegation+xml" | "vnd.dna" | "vnd.document+json" | "vnd.dolby.mobile.1" | "vnd.dolby.mobile.2" | "vnd.doremir.scorecloud-binary-document" | "vnd.dpgraph" | "vnd.dreamfactory" | "vnd.drive+json" | "vnd.dtg.local" | "vnd.dtg.local.flash" | "vnd.dtg.local.html" | "vnd.dvb.ait" | "vnd.dvb.dvbisl+xml" | "vnd.dvb.dvbj" | "vnd.dvb.esgcontainer" | "vnd.dvb.ipdcdftnotifaccess" | "vnd.dvb.ipdcesgaccess" | "vnd.dvb.ipdcesgaccess2" | "vnd.dvb.ipdcesgpdd" | "vnd.dvb.ipdcroaming" | "vnd.dvb.iptv.alfec-base" | "vnd.dvb.iptv.alfec-enhancement" | "vnd.dvb.notif-aggregate-root+xml" | "vnd.dvb.notif-container+xml" | "vnd.dvb.notif-generic+xml" | "vnd.dvb.notif-ia-msglist+xml" | "vnd.dvb.notif-ia-registration-request+xml" | "vnd.dvb.notif-ia-registration-response+xml" | "vnd.dvb.notif-init+xml" | "vnd.dvb.pfr" | "vnd.dvb.service" | "vnd.dxr" | "vnd.dynageo" | "vnd.dzr" | "vnd.easykaraoke.cdgdownload" | "vnd.ecip.rlp" | "vnd.ecdis-update" | "vnd.eclipse.ditto+json" | "vnd.ecowin.chart" | "vnd.ecowin.filerequest" | "vnd.ecowin.fileupdate" | "vnd.ecowin.series" | "vnd.ecowin.seriesrequest" | "vnd.ecowin.seriesupdate" | "vnd.efi.img" | "vnd.efi.iso" | "vnd.eln+zip" | "vnd.emclient.accessrequest+xml" | "vnd.enliven" | "vnd.enphase.envoy" | "vnd.eprints.data+xml" | "vnd.epson.esf" | "vnd.epson.msf" | "vnd.epson.quickanime" | "vnd.epson.salt" | "vnd.epson.ssf" | "vnd.ericsson.quickcall" | "vnd.erofs" | "vnd.espass-espass+zip" | "vnd.eszigno3+xml" | "vnd.etsi.aoc+xml" | "vnd.etsi.asic-s+zip" | "vnd.etsi.asic-e+zip" | "vnd.etsi.cug+xml" | "vnd.etsi.iptvcommand+xml" | "vnd.etsi.iptvdiscovery+xml" | "vnd.etsi.iptvprofile+xml" | "vnd.etsi.iptvsad-bc+xml" | "vnd.etsi.iptvsad-cod+xml" | "vnd.etsi.iptvsad-npvr+xml" | "vnd.etsi.iptvservice+xml" | "vnd.etsi.iptvsync+xml" | "vnd.etsi.iptvueprofile+xml" | "vnd.etsi.mcid+xml" | "vnd.etsi.mheg5" | "vnd.etsi.overload-control-policy-dataset+xml" | "vnd.etsi.pstn+xml" | "vnd.etsi.sci+xml" | "vnd.etsi.simservs+xml" | "vnd.etsi.timestamp-token" | "vnd.etsi.tsl+xml" | "vnd.etsi.tsl.der" | "vnd.eu.kasparian.car+json" | "vnd.eudora.data" | "vnd.evolv.ecig.profile" | "vnd.evolv.ecig.settings" | "vnd.evolv.ecig.theme" | "vnd.exstream-empower+zip" | "vnd.exstream-package" | "vnd.ezpix-album" | "vnd.ezpix-package" | "vnd.f-secure.mobile" | "vnd.fastcopy-disk-image" | "vnd.familysearch.gedcom+zip" | "vnd.fdsn.mseed" | "vnd.fdsn.seed" | "vnd.ffsns" | "vnd.ficlab.flb+zip" | "vnd.filmit.zfc" | "vnd.fints" | "vnd.firemonkeys.cloudcell" | "vnd.FloGraphIt" | "vnd.fluxtime.clip" | "vnd.font-fontforge-sfd" | "vnd.framemaker" | "vnd.freelog.comic" | "vnd.frogans.fnc" | "vnd.frogans.ltf" | "vnd.fsc.weblaunch" | "vnd.fujifilm.fb.docuworks" | "vnd.fujifilm.fb.docuworks.binder" | "vnd.fujifilm.fb.docuworks.container" | "vnd.fujifilm.fb.jfi+xml" | "vnd.fujitsu.oasys" | "vnd.fujitsu.oasys2" | "vnd.fujitsu.oasys3" | "vnd.fujitsu.oasysgp" | "vnd.fujitsu.oasysprs" | "vnd.fujixerox.ART4" | "vnd.fujixerox.ART-EX" | "vnd.fujixerox.ddd" | "vnd.fujixerox.docuworks" | "vnd.fujixerox.docuworks.binder" | "vnd.fujixerox.docuworks.container" | "vnd.fujixerox.HBPL" | "vnd.fut-misnet" | "vnd.futoin+cbor" | "vnd.futoin+json" | "vnd.fuzzysheet" | "vnd.genomatix.tuxedo" | "vnd.genozip" | "vnd.gentics.grd+json" | "vnd.gentoo.catmetadata+xml" | "vnd.gentoo.ebuild" | "vnd.gentoo.eclass" | "vnd.gentoo.gpkg" | "vnd.gentoo.manifest" | "vnd.gentoo.xpak" | "vnd.gentoo.pkgmetadata+xml" | "vnd.geo+json" | "vnd.geocube+xml" | "vnd.geogebra.file" | "vnd.geogebra.slides" | "vnd.geogebra.tool" | "vnd.geometry-explorer" | "vnd.geonext" | "vnd.geoplan" | "vnd.geospace" | "vnd.gerber" | "vnd.globalplatform.card-content-mgt" | "vnd.globalplatform.card-content-mgt-response" | "vnd.gmx" | "vnd.gnu.taler.exchange+json" | "vnd.gnu.taler.merchant+json" | "vnd.google-earth.kml+xml" | "vnd.google-earth.kmz" | "vnd.gov.sk.e-form+xml" | "vnd.gov.sk.e-form+zip" | "vnd.gov.sk.xmldatacontainer+xml" | "vnd.gpxsee.map+xml" | "vnd.grafeq" | "vnd.gridmp" | "vnd.groove-account" | "vnd.groove-help" | "vnd.groove-identity-message" | "vnd.groove-injector" | "vnd.groove-tool-message" | "vnd.groove-tool-template" | "vnd.groove-vcard" | "vnd.hal+json" | "vnd.hal+xml" | "vnd.HandHeld-Entertainment+xml" | "vnd.hbci" | "vnd.hc+json" | "vnd.hcl-bireports" | "vnd.hdt" | "vnd.heroku+json" | "vnd.hhe.lesson-player" | "vnd.hp-HPGL" | "vnd.hp-hpid" | "vnd.hp-hps" | "vnd.hp-jlyt" | "vnd.hp-PCL" | "vnd.hp-PCLXL" | "vnd.hsl" | "vnd.httphone" | "vnd.hydrostatix.sof-data" | "vnd.hyper-item+json" | "vnd.hyper+json" | "vnd.hyperdrive+json" | "vnd.hzn-3d-crossword" | "vnd.ibm.afplinedata" | "vnd.ibm.electronic-media" | "vnd.ibm.MiniPay" | "vnd.ibm.modcap" | "vnd.ibm.rights-management" | "vnd.ibm.secure-container" | "vnd.iccprofile" | "vnd.ieee.1905" | "vnd.igloader" | "vnd.imagemeter.folder+zip" | "vnd.imagemeter.image+zip" | "vnd.immervision-ivp" | "vnd.immervision-ivu" | "vnd.ims.imsccv1p1" | "vnd.ims.imsccv1p2" | "vnd.ims.imsccv1p3" | "vnd.ims.lis.v2.result+json" | "vnd.ims.lti.v2.toolconsumerprofile+json" | "vnd.ims.lti.v2.toolproxy.id+json" | "vnd.ims.lti.v2.toolproxy+json" | "vnd.ims.lti.v2.toolsettings+json" | "vnd.ims.lti.v2.toolsettings.simple+json" | "vnd.informedcontrol.rms+xml" | "vnd.infotech.project" | "vnd.infotech.project+xml" | "vnd.informix-visionary" | "vnd.innopath.wamp.notification" | "vnd.insors.igm" | "vnd.intercon.formnet" | "vnd.intergeo" | "vnd.intertrust.digibox" | "vnd.intertrust.nncp" | "vnd.intu.qbo" | "vnd.intu.qfx" | "vnd.ipfs.ipns-record" | "vnd.ipld.car" | "vnd.ipld.dag-cbor" | "vnd.ipld.dag-json" | "vnd.ipld.raw" | "vnd.iptc.g2.catalogitem+xml" | "vnd.iptc.g2.conceptitem+xml" | "vnd.iptc.g2.knowledgeitem+xml" | "vnd.iptc.g2.newsitem+xml" | "vnd.iptc.g2.newsmessage+xml" | "vnd.iptc.g2.packageitem+xml" | "vnd.iptc.g2.planningitem+xml" | "vnd.ipunplugged.rcprofile" | "vnd.irepository.package+xml" | "vnd.is-xpr" | "vnd.isac.fcs" | "vnd.jam" | "vnd.iso11783-10+zip" | "vnd.japannet-directory-service" | "vnd.japannet-jpnstore-wakeup" | "vnd.japannet-payment-wakeup" | "vnd.japannet-registration" | "vnd.japannet-registration-wakeup" | "vnd.japannet-setstore-wakeup" | "vnd.japannet-verification" | "vnd.japannet-verification-wakeup" | "vnd.jcp.javame.midlet-rms" | "vnd.jisp" | "vnd.joost.joda-archive" | "vnd.jsk.isdn-ngn" | "vnd.kahootz" | "vnd.kde.karbon" | "vnd.kde.kchart" | "vnd.kde.kformula" | "vnd.kde.kivio" | "vnd.kde.kontour" | "vnd.kde.kpresenter" | "vnd.kde.kspread" | "vnd.kde.kword" | "vnd.kenameaapp" | "vnd.kidspiration" | "vnd.Kinar" | "vnd.koan" | "vnd.kodak-descriptor" | "vnd.las" | "vnd.las.las+json" | "vnd.las.las+xml" | "vnd.laszip" | "vnd.ldev.productlicensing" | "vnd.leap+json" | "vnd.liberty-request+xml" | "vnd.llamagraphics.life-balance.desktop" | "vnd.llamagraphics.life-balance.exchange+xml" | "vnd.logipipe.circuit+zip" | "vnd.loom" | "vnd.lotus-1-2-3" | "vnd.lotus-approach" | "vnd.lotus-freelance" | "vnd.lotus-notes" | "vnd.lotus-organizer" | "vnd.lotus-screencam" | "vnd.lotus-wordpro" | "vnd.macports.portpkg" | "vnd.mapbox-vector-tile" | "vnd.marlin.drm.actiontoken+xml" | "vnd.marlin.drm.conftoken+xml" | "vnd.marlin.drm.license+xml" | "vnd.marlin.drm.mdcf" | "vnd.mason+json" | "vnd.maxar.archive.3tz+zip" | "vnd.maxmind.maxmind-db" | "vnd.mcd" | "vnd.mdl" | "vnd.mdl-mbsdf" | "vnd.medcalcdata" | "vnd.mediastation.cdkey" | "vnd.medicalholodeck.recordxr" | "vnd.meridian-slingshot" | "vnd.mermaid" | "vnd.MFER" | "vnd.mfmp" | "vnd.micro+json" | "vnd.micrografx.flo" | "vnd.micrografx.igx" | "vnd.microsoft.portable-executable" | "vnd.microsoft.windows.thumbnail-cache" | "vnd.miele+json" | "vnd.mif" | "vnd.minisoft-hp3000-save" | "vnd.mitsubishi.misty-guard.trustweb" | "vnd.Mobius.DAF" | "vnd.Mobius.DIS" | "vnd.Mobius.MBK" | "vnd.Mobius.MQY" | "vnd.Mobius.MSL" | "vnd.Mobius.PLC" | "vnd.Mobius.TXF" | "vnd.modl" | "vnd.mophun.application" | "vnd.mophun.certificate" | "vnd.motorola.flexsuite" | "vnd.motorola.flexsuite.adsi" | "vnd.motorola.flexsuite.fis" | "vnd.motorola.flexsuite.gotap" | "vnd.motorola.flexsuite.kmr" | "vnd.motorola.flexsuite.ttc" | "vnd.motorola.flexsuite.wem" | "vnd.motorola.iprm" | "vnd.mozilla.xul+xml" | "vnd.ms-artgalry" | "vnd.ms-asf" | "vnd.ms-cab-compressed" | "vnd.ms-3mfdocument" | "vnd.ms-excel" | "vnd.ms-excel.addin.macroEnabled.12" | "vnd.ms-excel.sheet.binary.macroEnabled.12" | "vnd.ms-excel.sheet.macroEnabled.12" | "vnd.ms-excel.template.macroEnabled.12" | "vnd.ms-fontobject" | "vnd.ms-htmlhelp" | "vnd.ms-ims" | "vnd.ms-lrm" | "vnd.ms-office.activeX+xml" | "vnd.ms-officetheme" | "vnd.ms-playready.initiator+xml" | "vnd.ms-powerpoint" | "vnd.ms-powerpoint.addin.macroEnabled.12" | "vnd.ms-powerpoint.presentation.macroEnabled.12" | "vnd.ms-powerpoint.slide.macroEnabled.12" | "vnd.ms-powerpoint.slideshow.macroEnabled.12" | "vnd.ms-powerpoint.template.macroEnabled.12" | "vnd.ms-PrintDeviceCapabilities+xml" | "vnd.ms-PrintSchemaTicket+xml" | "vnd.ms-project" | "vnd.ms-tnef" | "vnd.ms-windows.devicepairing" | "vnd.ms-windows.nwprinting.oob" | "vnd.ms-windows.printerpairing" | "vnd.ms-windows.wsd.oob" | "vnd.ms-wmdrm.lic-chlg-req" | "vnd.ms-wmdrm.lic-resp" | "vnd.ms-wmdrm.meter-chlg-req" | "vnd.ms-wmdrm.meter-resp" | "vnd.ms-word.document.macroEnabled.12" | "vnd.ms-word.template.macroEnabled.12" | "vnd.ms-works" | "vnd.ms-wpl" | "vnd.ms-xpsdocument" | "vnd.msa-disk-image" | "vnd.mseq" | "vnd.msign" | "vnd.multiad.creator" | "vnd.multiad.creator.cif" | "vnd.musician" | "vnd.music-niff" | "vnd.muvee.style" | "vnd.mynfc" | "vnd.nacamar.ybrid+json" | "vnd.nato.bindingdataobject+cbor" | "vnd.nato.bindingdataobject+json" | "vnd.nato.bindingdataobject+xml" | "vnd.nato.openxmlformats-package.iepd+zip" | "vnd.ncd.control" | "vnd.ncd.reference" | "vnd.nearst.inv+json" | "vnd.nebumind.line" | "vnd.nervana" | "vnd.netfpx" | "vnd.neurolanguage.nlu" | "vnd.nimn" | "vnd.nintendo.snes.rom" | "vnd.nintendo.nitro.rom" | "vnd.nitf" | "vnd.noblenet-directory" | "vnd.noblenet-sealer" | "vnd.noblenet-web" | "vnd.nokia.catalogs" | "vnd.nokia.conml+wbxml" | "vnd.nokia.conml+xml" | "vnd.nokia.iptv.config+xml" | "vnd.nokia.iSDS-radio-presets" | "vnd.nokia.landmark+wbxml" | "vnd.nokia.landmark+xml" | "vnd.nokia.landmarkcollection+xml" | "vnd.nokia.ncd" | "vnd.nokia.n-gage.ac+xml" | "vnd.nokia.n-gage.data" | "vnd.nokia.n-gage.symbian.install" | "vnd.nokia.pcd+wbxml" | "vnd.nokia.pcd+xml" | "vnd.nokia.radio-preset" | "vnd.nokia.radio-presets" | "vnd.novadigm.EDM" | "vnd.novadigm.EDX" | "vnd.novadigm.EXT" | "vnd.ntt-local.content-share" | "vnd.ntt-local.file-transfer" | "vnd.ntt-local.ogw_remote-access" | "vnd.ntt-local.sip-ta_remote" | "vnd.ntt-local.sip-ta_tcp_stream" | "vnd.oai.workflows" | "vnd.oai.workflows+json" | "vnd.oai.workflows+yaml" | "vnd.oasis.opendocument.base" | "vnd.oasis.opendocument.chart" | "vnd.oasis.opendocument.chart-template" | "vnd.oasis.opendocument.database" | "vnd.oasis.opendocument.formula" | "vnd.oasis.opendocument.formula-template" | "vnd.oasis.opendocument.graphics" | "vnd.oasis.opendocument.graphics-template" | "vnd.oasis.opendocument.image" | "vnd.oasis.opendocument.image-template" | "vnd.oasis.opendocument.presentation" | "vnd.oasis.opendocument.presentation-template" | "vnd.oasis.opendocument.spreadsheet" | "vnd.oasis.opendocument.spreadsheet-template" | "vnd.oasis.opendocument.text" | "vnd.oasis.opendocument.text-master" | "vnd.oasis.opendocument.text-master-template" | "vnd.oasis.opendocument.text-template" | "vnd.oasis.opendocument.text-web" | "vnd.obn" | "vnd.ocf+cbor" | "vnd.oci.image.manifest.v1+json" | "vnd.oftn.l10n+json" | "vnd.oipf.contentaccessdownload+xml" | "vnd.oipf.contentaccessstreaming+xml" | "vnd.oipf.cspg-hexbinary" | "vnd.oipf.dae.svg+xml" | "vnd.oipf.dae.xhtml+xml" | "vnd.oipf.mippvcontrolmessage+xml" | "vnd.oipf.pae.gem" | "vnd.oipf.spdiscovery+xml" | "vnd.oipf.spdlist+xml" | "vnd.oipf.ueprofile+xml" | "vnd.oipf.userprofile+xml" | "vnd.olpc-sugar" | "vnd.oma.bcast.associated-procedure-parameter+xml" | "vnd.oma.bcast.drm-trigger+xml" | "vnd.oma.bcast.imd+xml" | "vnd.oma.bcast.ltkm" | "vnd.oma.bcast.notification+xml" | "vnd.oma.bcast.provisioningtrigger" | "vnd.oma.bcast.sgboot" | "vnd.oma.bcast.sgdd+xml" | "vnd.oma.bcast.sgdu" | "vnd.oma.bcast.simple-symbol-container" | "vnd.oma.bcast.smartcard-trigger+xml" | "vnd.oma.bcast.sprov+xml" | "vnd.oma.bcast.stkm" | "vnd.oma.cab-address-book+xml" | "vnd.oma.cab-feature-handler+xml" | "vnd.oma.cab-pcc+xml" | "vnd.oma.cab-subs-invite+xml" | "vnd.oma.cab-user-prefs+xml" | "vnd.oma.dcd" | "vnd.oma.dcdc" | "vnd.oma.dd2+xml" | "vnd.oma.drm.risd+xml" | "vnd.oma.group-usage-list+xml" | "vnd.oma.lwm2m+cbor" | "vnd.oma.lwm2m+json" | "vnd.oma.lwm2m+tlv" | "vnd.oma.pal+xml" | "vnd.oma.poc.detailed-progress-report+xml" | "vnd.oma.poc.final-report+xml" | "vnd.oma.poc.groups+xml" | "vnd.oma.poc.invocation-descriptor+xml" | "vnd.oma.poc.optimized-progress-report+xml" | "vnd.oma.push" | "vnd.oma.scidm.messages+xml" | "vnd.oma.xcap-directory+xml" | "vnd.omads-email+xml" | "vnd.omads-file+xml" | "vnd.omads-folder+xml" | "vnd.omaloc-supl-init" | "vnd.oma-scws-config" | "vnd.oma-scws-http-request" | "vnd.oma-scws-http-response" | "vnd.onepager" | "vnd.onepagertamp" | "vnd.onepagertamx" | "vnd.onepagertat" | "vnd.onepagertatp" | "vnd.onepagertatx" | "vnd.onvif.metadata" | "vnd.openblox.game-binary" | "vnd.openblox.game+xml" | "vnd.openeye.oeb" | "vnd.openstreetmap.data+xml" | "vnd.opentimestamps.ots" | "vnd.openxmlformats-officedocument.custom-properties+xml" | "vnd.openxmlformats-officedocument.customXmlProperties+xml" | "vnd.openxmlformats-officedocument.drawing+xml" | "vnd.openxmlformats-officedocument.drawingml.chart+xml" | "vnd.openxmlformats-officedocument.drawingml.chartshapes+xml" | "vnd.openxmlformats-officedocument.drawingml.diagramColors+xml" | "vnd.openxmlformats-officedocument.drawingml.diagramData+xml" | "vnd.openxmlformats-officedocument.drawingml.diagramLayout+xml" | "vnd.openxmlformats-officedocument.drawingml.diagramStyle+xml" | "vnd.openxmlformats-officedocument.extended-properties+xml" | "vnd.openxmlformats-officedocument.presentationml.commentAuthors+xml" | "vnd.openxmlformats-officedocument.presentationml.comments+xml" | "vnd.openxmlformats-officedocument.presentationml.handoutMaster+xml" | "vnd.openxmlformats-officedocument.presentationml.notesMaster+xml" | "vnd.openxmlformats-officedocument.presentationml.notesSlide+xml" | "vnd.openxmlformats-officedocument.presentationml.presentation" | "vnd.openxmlformats-officedocument.presentationml.presentation.main+xml" | "vnd.openxmlformats-officedocument.presentationml.presProps+xml" | "vnd.openxmlformats-officedocument.presentationml.slide" | "vnd.openxmlformats-officedocument.presentationml.slide+xml" | "vnd.openxmlformats-officedocument.presentationml.slideLayout+xml" | "vnd.openxmlformats-officedocument.presentationml.slideMaster+xml" | "vnd.openxmlformats-officedocument.presentationml.slideshow" | "vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml" | "vnd.openxmlformats-officedocument.presentationml.slideUpdateInfo+xml" | "vnd.openxmlformats-officedocument.presentationml.tableStyles+xml" | "vnd.openxmlformats-officedocument.presentationml.tags+xml" | "vnd.openxmlformats-officedocument.presentationml.template" | "vnd.openxmlformats-officedocument.presentationml.template.main+xml" | "vnd.openxmlformats-officedocument.presentationml.viewProps+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.comments+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.connections+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheDefinition+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheRecords+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.pivotTable+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.queryTable+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.revisionHeaders+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.revisionLog+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.table+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.tableSingleCells+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.template" | "vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.userNames+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.volatileDependencies+xml" | "vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" | "vnd.openxmlformats-officedocument.theme+xml" | "vnd.openxmlformats-officedocument.themeOverride+xml" | "vnd.openxmlformats-officedocument.vmlDrawing" | "vnd.openxmlformats-officedocument.wordprocessingml.comments+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.document" | "vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.footer+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.settings+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.styles+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.template" | "vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml" | "vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml" | "vnd.openxmlformats-package.core-properties+xml" | "vnd.openxmlformats-package.digital-signature-xmlsignature+xml" | "vnd.openxmlformats-package.relationships+xml" | "vnd.oracle.resource+json" | "vnd.orange.indata" | "vnd.osa.netdeploy" | "vnd.osgeo.mapguide.package" | "vnd.osgi.bundle" | "vnd.osgi.dp" | "vnd.osgi.subsystem" | "vnd.otps.ct-kip+xml" | "vnd.oxli.countgraph" | "vnd.pagerduty+json" | "vnd.palm" | "vnd.panoply" | "vnd.paos.xml" | "vnd.patentdive" | "vnd.patientecommsdoc" | "vnd.pawaafile" | "vnd.pcos" | "vnd.pg.format" | "vnd.pg.osasli" | "vnd.piaccess.application-licence" | "vnd.picsel" | "vnd.pmi.widget" | "vnd.poc.group-advertisement+xml" | "vnd.pocketlearn" | "vnd.powerbuilder6" | "vnd.powerbuilder6-s" | "vnd.powerbuilder7" | "vnd.powerbuilder75" | "vnd.powerbuilder75-s" | "vnd.powerbuilder7-s" | "vnd.preminet" | "vnd.previewsystems.box" | "vnd.proteus.magazine" | "vnd.psfs" | "vnd.pt.mundusmundi" | "vnd.publishare-delta-tree" | "vnd.pvi.ptid1" | "vnd.pwg-multiplexed" | "vnd.pwg-xhtml-print+xml" | "vnd.qualcomm.brew-app-res" | "vnd.quarantainenet" | "vnd.Quark.QuarkXPress" | "vnd.quobject-quoxdocument" | "vnd.radisys.moml+xml" | "vnd.radisys.msml-audit-conf+xml" | "vnd.radisys.msml-audit-conn+xml" | "vnd.radisys.msml-audit-dialog+xml" | "vnd.radisys.msml-audit-stream+xml" | "vnd.radisys.msml-audit+xml" | "vnd.radisys.msml-conf+xml" | "vnd.radisys.msml-dialog-base+xml" | "vnd.radisys.msml-dialog-fax-detect+xml" | "vnd.radisys.msml-dialog-fax-sendrecv+xml" | "vnd.radisys.msml-dialog-group+xml" | "vnd.radisys.msml-dialog-speech+xml" | "vnd.radisys.msml-dialog-transform+xml" | "vnd.radisys.msml-dialog+xml" | "vnd.radisys.msml+xml" | "vnd.rainstor.data" | "vnd.rapid" | "vnd.rar" | "vnd.realvnc.bed" | "vnd.recordare.musicxml" | "vnd.recordare.musicxml+xml" | "vnd.relpipe" | "vnd.RenLearn.rlprint" | "vnd.resilient.logic" | "vnd.restful+json" | "vnd.rig.cryptonote" | "vnd.route66.link66+xml" | "vnd.rs-274x" | "vnd.ruckus.download" | "vnd.s3sms" | "vnd.sailingtracker.track" | "vnd.sar" | "vnd.sbm.cid" | "vnd.sbm.mid2" | "vnd.scribus" | "vnd.sealed.3df" | "vnd.sealed.csf" | "vnd.sealed.doc" | "vnd.sealed.eml" | "vnd.sealed.mht" | "vnd.sealed.net" | "vnd.sealed.ppt" | "vnd.sealed.tiff" | "vnd.sealed.xls" | "vnd.sealedmedia.softseal.html" | "vnd.sealedmedia.softseal.pdf" | "vnd.seemail" | "vnd.seis+json" | "vnd.sema" | "vnd.semd" | "vnd.semf" | "vnd.shade-save-file" | "vnd.shana.informed.formdata" | "vnd.shana.informed.formtemplate" | "vnd.shana.informed.interchange" | "vnd.shana.informed.package" | "vnd.shootproof+json" | "vnd.shopkick+json" | "vnd.shp" | "vnd.shx" | "vnd.sigrok.session" | "vnd.SimTech-MindMapper" | "vnd.siren+json" | "vnd.smaf" | "vnd.smart.notebook" | "vnd.smart.teacher" | "vnd.smintio.portals.archive" | "vnd.snesdev-page-table" | "vnd.software602.filler.form+xml" | "vnd.software602.filler.form-xml-zip" | "vnd.solent.sdkm+xml" | "vnd.spotfire.dxp" | "vnd.spotfire.sfs" | "vnd.sqlite3" | "vnd.sss-cod" | "vnd.sss-dtf" | "vnd.sss-ntf" | "vnd.stepmania.package" | "vnd.stepmania.stepchart" | "vnd.street-stream" | "vnd.sun.wadl+xml" | "vnd.sus-calendar" | "vnd.svd" | "vnd.swiftview-ics" | "vnd.sybyl.mol2" | "vnd.sycle+xml" | "vnd.syft+json" | "vnd.syncml.dm.notification" | "vnd.syncml.dmddf+xml" | "vnd.syncml.dmtnds+wbxml" | "vnd.syncml.dmtnds+xml" | "vnd.syncml.dmddf+wbxml" | "vnd.syncml.dm+wbxml" | "vnd.syncml.dm+xml" | "vnd.syncml.ds.notification" | "vnd.syncml+xml" | "vnd.tableschema+json" | "vnd.tao.intent-module-archive" | "vnd.tcpdump.pcap" | "vnd.think-cell.ppttc+json" | "vnd.tml" | "vnd.tmd.mediaflex.api+xml" | "vnd.tmobile-livetv" | "vnd.tri.onesource" | "vnd.trid.tpt" | "vnd.triscape.mxs" | "vnd.trueapp" | "vnd.truedoc" | "vnd.ubisoft.webplayer" | "vnd.ufdl" | "vnd.uiq.theme" | "vnd.umajin" | "vnd.unity" | "vnd.uoml+xml" | "vnd.uplanet.alert" | "vnd.uplanet.alert-wbxml" | "vnd.uplanet.bearer-choice" | "vnd.uplanet.bearer-choice-wbxml" | "vnd.uplanet.cacheop" | "vnd.uplanet.cacheop-wbxml" | "vnd.uplanet.channel" | "vnd.uplanet.channel-wbxml" | "vnd.uplanet.list" | "vnd.uplanet.listcmd" | "vnd.uplanet.listcmd-wbxml" | "vnd.uplanet.list-wbxml" | "vnd.uri-map" | "vnd.uplanet.signal" | "vnd.valve.source.material" | "vnd.vcx" | "vnd.vd-study" | "vnd.vectorworks" | "vnd.vel+json" | "vnd.verimatrix.vcas" | "vnd.veritone.aion+json" | "vnd.veryant.thin" | "vnd.ves.encrypted" | "vnd.vidsoft.vidconference" | "vnd.visio" | "vnd.visionary" | "vnd.vividence.scriptfile" | "vnd.vsf" | "vnd.wap.sic" | "vnd.wap.slc" | "vnd.wap.wbxml" | "vnd.wap.wmlc" | "vnd.wap.wmlscriptc" | "vnd.wasmflow.wafl" | "vnd.webturbo" | "vnd.wfa.dpp" | "vnd.wfa.p2p" | "vnd.wfa.wsc" | "vnd.windows.devicepairing" | "vnd.wmc" | "vnd.wmf.bootstrap" | "vnd.wolfram.mathematica" | "vnd.wolfram.mathematica.package" | "vnd.wolfram.player" | "vnd.wordlift" | "vnd.wordperfect" | "vnd.wqd" | "vnd.wrq-hp3000-labelled" | "vnd.wt.stf" | "vnd.wv.csp+xml" | "vnd.wv.csp+wbxml" | "vnd.wv.ssp+xml" | "vnd.xacml+json" | "vnd.xara" | "vnd.xecrets-encrypted" | "vnd.xfdl" | "vnd.xfdl.webform" | "vnd.xmi+xml" | "vnd.xmpie.cpkg" | "vnd.xmpie.dpkg" | "vnd.xmpie.plan" | "vnd.xmpie.ppkg" | "vnd.xmpie.xlim" | "vnd.yamaha.hv-dic" | "vnd.yamaha.hv-script" | "vnd.yamaha.hv-voice" | "vnd.yamaha.openscoreformat.osfpvg+xml" | "vnd.yamaha.openscoreformat" | "vnd.yamaha.remote-setup" | "vnd.yamaha.smaf-audio" | "vnd.yamaha.smaf-phrase" | "vnd.yamaha.through-ngn" | "vnd.yamaha.tunnel-udpencap" | "vnd.yaoweme" | "vnd.yellowriver-custom-menu" | "vnd.youtube.yt" | "vnd.zul" | "vnd.zzazz.deck+xml" | "voicexml+xml" | "voucher-cms+json" | "vq-rtcpxr" | "wasm" | "watcherinfo+xml" | "webpush-options+json" | "whoispp-query" | "whoispp-response" | "widget" | "wita" | "wordperfect5.1" | "wsdl+xml" | "wspolicy+xml" | "x-pki-message" | "x-www-form-urlencoded" | "x-x509-ca-cert" | "x-x509-ca-ra-cert" | "x-x509-next-ca-cert" | "x400-bp" | "xacml+xml" | "xcap-att+xml" | "xcap-caps+xml" | "xcap-diff+xml" | "xcap-el+xml" | "xcap-error+xml" | "xcap-ns+xml" | "xcon-conference-info-diff+xml" | "xcon-conference-info+xml" | "xenc+xml" | "xfdf" | "xhtml+xml" | "xliff+xml" | "xml" | "xml-dtd" | "xml-external-parsed-entity" | "xml-patch+xml" | "xmpp+xml" | "xop+xml" | "xslt+xml" | "xv+xml" | "yaml" | "yang" | "yang-data+cbor" | "yang-data+json" | "yang-data+xml" | "yang-patch+json" | "yang-patch+xml" | "yin+xml" | "zip" | "zlib" | "zstd"}`;
type AudioMimeType = `audio/${"1d-interleaved-parityfec" | "32kadpcm" | "3gpp" | "3gpp2" | "aac" | "ac3" | "AMR" | "AMR-WB" | "amr-wb+" | "aptx" | "asc" | "ATRAC-ADVANCED-LOSSLESS" | "ATRAC-X" | "ATRAC3" | "basic" | "BV16" | "BV32" | "clearmode" | "CN" | "DAT12" | "dls" | "dsr-es201108" | "dsr-es202050" | "dsr-es202211" | "dsr-es202212" | "DV" | "DVI4" | "eac3" | "encaprtp" | "EVRC" | "EVRC-QCP" | "EVRC0" | "EVRC1" | "EVRCB" | "EVRCB0" | "EVRCB1" | "EVRCNW" | "EVRCNW0" | "EVRCNW1" | "EVRCWB" | "EVRCWB0" | "EVRCWB1" | "EVS" | "example" | "flexfec" | "fwdred" | "G711-0" | "G719" | "G7221" | "G722" | "G723" | "G726-16" | "G726-24" | "G726-32" | "G726-40" | "G728" | "G729" | "G7291" | "G729D" | "G729E" | "GSM" | "GSM-EFR" | "GSM-HR-08" | "iLBC" | "ip-mr_v2.5" | "L8" | "L16" | "L20" | "L24" | "LPC" | "matroska" | "MELP" | "MELP600" | "MELP1200" | "MELP2400" | "mhas" | "mobile-xmf" | "MPA" | "mp4" | "MP4A-LATM" | "mpa-robust" | "mpeg" | "mpeg4-generic" | "ogg" | "opus" | "parityfec" | "PCMA" | "PCMA-WB" | "PCMU" | "PCMU-WB" | "prs.sid" | "QCELP" | "raptorfec" | "RED" | "rtp-enc-aescm128" | "rtploopback" | "rtp-midi" | "rtx" | "scip" | "SMV" | "SMV0" | "SMV-QCP" | "sofa" | "sp-midi" | "speex" | "t140c" | "t38" | "telephone-event" | "TETRA_ACELP" | "TETRA_ACELP_BB" | "tone" | "TSVCIS" | "UEMCLIP" | "ulpfec" | "usac" | "VDVI" | "VMR-WB" | "vnd.3gpp.iufp" | "vnd.4SB" | "vnd.audiokoz" | "vnd.CELP" | "vnd.cisco.nse" | "vnd.cmles.radio-events" | "vnd.cns.anp1" | "vnd.cns.inf1" | "vnd.dece.audio" | "vnd.digital-winds" | "vnd.dlna.adts" | "vnd.dolby.heaac.1" | "vnd.dolby.heaac.2" | "vnd.dolby.mlp" | "vnd.dolby.mps" | "vnd.dolby.pl2" | "vnd.dolby.pl2x" | "vnd.dolby.pl2z" | "vnd.dolby.pulse.1" | "vnd.dra" | "vnd.dts" | "vnd.dts.hd" | "vnd.dts.uhd" | "vnd.dvb.file" | "vnd.everad.plj" | "vnd.hns.audio" | "vnd.lucent.voice" | "vnd.ms-playready.media.pya" | "vnd.nokia.mobile-xmf" | "vnd.nortel.vbk" | "vnd.nuera.ecelp4800" | "vnd.nuera.ecelp7470" | "vnd.nuera.ecelp9600" | "vnd.octel.sbc" | "vnd.presonus.multitrack" | "vnd.qcelp" | "vnd.rhetorex.32kadpcm" | "vnd.rip" | "vnd.sealedmedia.softseal.mpeg" | "vnd.vmx.cvsd" | "vorbis" | "vorbis-config"}`;
type FontMimeType = `font/${"collection" | "otf" | "sfnt" | "ttf" | "woff" | "woff2"}`;
type ImageMimeType = `image/${"aces" | "apng" | "avci" | "avcs" | "avif" | "bmp" | "cgm" | "dicom-rle" | "dpx" | "emf" | "example" | "fits" | "g3fax" | "heic" | "heic-sequence" | "heif" | "heif-sequence" | "hej2k" | "hsj2" | "j2c" | "jls" | "jp2" | "jph" | "jphc" | "jpm" | "jpx" | "jxr" | "jxrA" | "jxrS" | "jxs" | "jxsc" | "jxsi" | "jxss" | "ktx" | "ktx2" | "naplps" | "png" | "prs.btif" | "prs.pti" | "pwg-raster" | "svg+xml" | "t38" | "tiff" | "tiff-fx" | "vnd.adobe.photoshop" | "vnd.airzip.accelerator.azv" | "vnd.cns.inf2" | "vnd.dece.graphic" | "vnd.djvu" | "vnd.dwg" | "vnd.dxf" | "vnd.dvb.subtitle" | "vnd.fastbidsheet" | "vnd.fpx" | "vnd.fst" | "vnd.fujixerox.edmics-mmr" | "vnd.fujixerox.edmics-rlc" | "vnd.globalgraphics.pgb" | "vnd.microsoft.icon" | "vnd.mix" | "vnd.ms-modi" | "vnd.mozilla.apng" | "vnd.net-fpx" | "vnd.pco.b16" | "vnd.radiance" | "vnd.sealed.png" | "vnd.sealedmedia.softseal.gif" | "vnd.sealedmedia.softseal.jpg" | "vnd.svf" | "vnd.tencent.tap" | "vnd.valve.source.texture" | "vnd.wap.wbmp" | "vnd.xiff" | "vnd.zbrush.pcx" | "webp" | "wmf" | "emf" | "wmf"}`;
type MessageMimeType = `message/${"bhttp" | "CPIM" | "delivery-status" | "disposition-notification" | "example" | "feedback-report" | "global" | "global-delivery-status" | "global-disposition-notification" | "global-headers" | "http" | "imdn+xml" | "mls" | "news" | "ohttp-req" | "ohttp-res" | "s-http" | "sip" | "sipfrag" | "tracking-status" | "vnd.si.simp" | "vnd.wfa.wsc"}`;
type ModelMimeType = `model/${"3mf" | "e57" | "example" | "gltf-binary" | "gltf+json" | "JT" | "iges" | "mtl" | "obj" | "prc" | "step" | "step+xml" | "step+zip" | "step-xml+zip" | "stl" | "u3d" | "vnd.bary" | "vnd.cld" | "vnd.collada+xml" | "vnd.dwf" | "vnd.flatland.3dml" | "vnd.gdl" | "vnd.gs-gdl" | "vnd.gtw" | "vnd.moml+xml" | "vnd.mts" | "vnd.opengex" | "vnd.parasolid.transmit.binary" | "vnd.parasolid.transmit.text" | "vnd.pytha.pyox" | "vnd.rosette.annotated-data-model" | "vnd.sap.vds" | "vnd.usda" | "vnd.usdz+zip" | "vnd.valve.source.compiled-map" | "vnd.vtu" | "x3d-vrml" | "x3d+fastinfoset" | "x3d+xml"}`;
type MultipartMimeType = `multipart/${"appledouble" | "byteranges" | "encrypted" | "example" | "form-data" | "header-set" | "multilingual" | "related" | "report" | "signed" | "vnd.bint.med-plus" | "voice-message" | "x-mixed-replace"}`;
type TextMimeType = `text/${"1d-interleaved-parityfec" | "cache-manifest" | "calendar" | "cql" | "cql-expression" | "cql-identifier" | "css" | "csv" | "csv-schema" | "directory" | "dns" | "ecmascript" | "encaprtp" | "example" | "fhirpath" | "flexfec" | "fwdred" | "gff3" | "grammar-ref-list" | "hl7v2" | "html" | "javascript" | "jcr-cnd" | "markdown" | "mizar" | "n3" | "parameters" | "parityfec" | "provenance-notation" | "prs.fallenstein.rst" | "prs.lines.tag" | "prs.prop.logic" | "prs.texi" | "raptorfec" | "RED" | "rfc822-headers" | "rtf" | "rtp-enc-aescm128" | "rtploopback" | "rtx" | "SGML" | "shaclc" | "shex" | "spdx" | "strings" | "t140" | "tab-separated-values" | "troff" | "turtle" | "ulpfec" | "uri-list" | "vcard" | "vnd.a" | "vnd.abc" | "vnd.ascii-art" | "vnd.curl" | "vnd.debian.copyright" | "vnd.DMClientScript" | "vnd.dvb.subtitle" | "vnd.esmertec.theme-descriptor" | "vnd.exchangeable" | "vnd.familysearch.gedcom" | "vnd.ficlab.flt" | "vnd.fly" | "vnd.fmi.flexstor" | "vnd.gml" | "vnd.graphviz" | "vnd.hans" | "vnd.hgl" | "vnd.in3d.3dml" | "vnd.in3d.spot" | "vnd.IPTC.NewsML" | "vnd.IPTC.NITF" | "vnd.latex-z" | "vnd.motorola.reflex" | "vnd.ms-mediapackage" | "vnd.net2phone.commcenter.command" | "vnd.radisys.msml-basic-layout" | "vnd.senx.warpscript" | "vnd.si.uricatalogue" | "vnd.sun.j2me.app-descriptor" | "vnd.sosi" | "vnd.trolltech.linguist" | "vnd.wap.si" | "vnd.wap.sl" | "vnd.wap.wml" | "vnd.wap.wmlscript" | "vtt" | "wgsl" | "xml" | "xml-external-parsed-entity"}`;
type VideoMimeType = `video/${"1d-interleaved-parityfec" | "3gpp" | "3gpp2" | "3gpp-tt" | "AV1" | "BMPEG" | "BT656" | "CelB" | "DV" | "encaprtp" | "example" | "FFV1" | "flexfec" | "H261" | "H263" | "H263-1998" | "H263-2000" | "H264" | "H264-RCDO" | "H264-SVC" | "H265" | "H266" | "iso.segment" | "JPEG" | "jpeg2000" | "jxsv" | "matroska" | "matroska-3d" | "mj2" | "MP1S" | "MP2P" | "MP2T" | "mp4" | "MP4V-ES" | "MPV" | "mpeg4-generic" | "nv" | "ogg" | "parityfec" | "pointer" | "quicktime" | "raptorfec" | "raw" | "rtp-enc-aescm128" | "rtploopback" | "rtx" | "scip" | "smpte291" | "SMPTE292M" | "ulpfec" | "vc1" | "vc2" | "vnd.CCTV" | "vnd.dece.hd" | "vnd.dece.mobile" | "vnd.dece.mp4" | "vnd.dece.pd" | "vnd.dece.sd" | "vnd.dece.video" | "vnd.directv.mpeg" | "vnd.directv.mpeg-tts" | "vnd.dlna.mpeg-tts" | "vnd.dvb.file" | "vnd.fvt" | "vnd.hns.video" | "vnd.iptvforum.1dparityfec-1010" | "vnd.iptvforum.1dparityfec-2005" | "vnd.iptvforum.2dparityfec-1010" | "vnd.iptvforum.2dparityfec-2005" | "vnd.iptvforum.ttsavc" | "vnd.iptvforum.ttsmpeg2" | "vnd.motorola.video" | "vnd.motorola.videop" | "vnd.mpegurl" | "vnd.ms-playready.media.pyv" | "vnd.nokia.interleaved-multimedia" | "vnd.nokia.mp4vr" | "vnd.nokia.videovoip" | "vnd.objectvideo" | "vnd.radgamettools.bink" | "vnd.radgamettools.smacker" | "vnd.sealed.mpeg1" | "vnd.sealed.mpeg4" | "vnd.sealed.swf" | "vnd.sealedmedia.softseal.mov" | "vnd.uvvu.mp4" | "vnd.youtube.yt" | "vnd.vivo" | "VP8" | "VP9"}`;
type MimeType$1 = ApplicationType | AudioMimeType | FontMimeType | ImageMimeType | MessageMimeType | ModelMimeType | MultipartMimeType | TextMimeType | VideoMimeType | (string & {});
//#endregion
//#region src/http/headers/request.d.ts
type AnyString$1 = string & {};
type RequestHeaderName = keyof RequestHeaderMap | AnyString$1;
interface RequestHeaderMap {
  "Accept": MimeType$1 | AnyString$1;
  "Accept-Charset": AnyString$1;
  "Accept-Encoding": "gzip" | "compress" | "deflate" | "br" | "identity" | AnyString$1;
  "Accept-Language": AnyString$1;
  "Accept-Ch": "Sec-CH-UA" | "Sec-CH-UA-Arch" | "Sec-CH-UA-Bitness" | "Sec-CH-UA-Full-Version-List" | "Sec-CH-UA-Full-Version" | "Sec-CH-UA-Mobile" | "Sec-CH-UA-Model" | "Sec-CH-UA-Platform" | "Sec-CH-UA-Platform-Version" | "Sec-CH-Prefers-Reduced-Motion" | "Sec-CH-Prefers-Color-Scheme" | "Device-Memory" | "Width" | "Viewport-Width" | "Save-Data" | "Downlink" | "ECT" | "RTT" | AnyString$1;
  "Access-Control-Allow-Credentials": "true" | "false" | AnyString$1;
  "Access-Control-Allow-Headers": RequestHeaderName | AnyString$1;
  "Access-Control-Allow-Methods": HTTPMethod$1 | AnyString$1;
  "Access-Control-Allow-Origin": "*" | AnyString$1;
  "Access-Control-Expose-Headers": RequestHeaderName | AnyString$1;
  "Access-Control-Max-Age": AnyString$1;
  "Access-Control-Request-Headers": RequestHeaderName | AnyString$1;
  "Access-Control-Request-Method": HTTPMethod$1 | AnyString$1;
  "Age": AnyString$1;
  "Allow": HTTPMethod$1 | AnyString$1;
  "Authorization": AnyString$1;
  "Cache-Control": "no-cache" | "no-store" | "max-age" | "must-revalidate" | "public" | "private" | "proxy-revalidate" | "s-maxage" | "stale-while-revalidate" | "stale-if-error" | AnyString$1;
  "Connection": "keep-alive" | "close" | "upgrade" | AnyString$1;
  "Content-Disposition": AnyString$1;
  "Content-Encoding": "gzip" | "compress" | "deflate" | "br" | "identity" | AnyString$1;
  "Content-Language": AnyString$1;
  "Content-Length": AnyString$1;
  "Content-Location": AnyString$1;
  "Content-Range": AnyString$1;
  "Content-Security-Policy": AnyString$1;
  "Content-Type": MimeType$1 | AnyString$1;
  "Cookie": AnyString$1;
  "Critical-CH": AnyString$1;
  "Date": AnyString$1;
  "Device-Memory": "0.25" | "0.5" | "1" | "2" | "4" | "8" | AnyString$1;
  "Digest": AnyString$1;
  "ETag": AnyString$1;
  "Expect": "100-continue" | AnyString$1;
  "Expires": AnyString$1;
  "Forwarded": AnyString$1;
  "From": AnyString$1;
  "Host": AnyString$1;
  "If-Match": AnyString$1;
  "If-Modified-Since": AnyString$1;
  "If-None-Match": AnyString$1;
  "If-Range": AnyString$1;
  "If-Unmodified-Since": AnyString$1;
  "Keep-Alive": `timeout=${string}, max=${string}` | AnyString$1;
  "Last-Modified": AnyString$1;
  "Link": AnyString$1;
  "Location": AnyString$1;
  "Max-Forwards": AnyString$1;
  "Origin": AnyString$1;
  "Origin-Agent-Cluster": `?1` | `?0` | AnyString$1;
  "Ping-From": AnyString$1;
  "Ping-To": AnyString$1;
  "Pragma": AnyString$1;
  "Proxy-Authenticate": AnyString$1;
  "Proxy-Authorization": AnyString$1;
  "Range": AnyString$1;
  "Referer": AnyString$1;
  "Referrer-Policy": "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url" | AnyString$1;
  "Retry-After": AnyString$1;
  "Save-Data": `on` | `off` | AnyString$1;
  "Sec-CH-UA": AnyString$1;
  "Sec-CH-UA-Arch": "x86" | "ARM" | "[arm64-v8a, armeabi-v7a, armeabi]" | AnyString$1;
  "Sec-CH-UA-Bitness": "64" | "32" | AnyString$1;
  "Sec-CH-UA-Full-Version-List": AnyString$1;
  "Sec-CH-UA-Mobile": `?1` | `?0` | AnyString$1;
  "Sec-CH-UA-Model": AnyString$1;
  "Sec-CH-UA-Platform": "Android" | "Chrome OS" | "Chromium OS" | "iOS" | "Linux" | "macOS" | "Windows" | "Unknown" | AnyString$1;
  "Sec-CH-UA-Platform-Version": AnyString$1;
  "Sec-CH-UA-Prefers-Color-Scheme": "dark" | "light" | AnyString$1;
  "Sec-CH-UA-Prefers-Reduced-Motion": "no-preference" | "reduce" | AnyString$1;
  "Sec-Fetch-Dest": "audio" | "audioworklet" | "document" | "embed" | "empty" | "font" | "frame" | "iframe" | "image" | "manifest" | "object" | "paintworklet" | "report" | "script" | "serviceworker" | "sharedworker" | "style" | "track" | "video" | "worker" | "xslt" | AnyString$1;
  "Sec-Fetch-Mode": "cors" | "navigate" | "no-cors" | "same-origin" | "websocket" | AnyString$1;
  "Sec-Fetch-Site": "cross-site" | "same-origin" | "same-site" | "none" | AnyString$1;
  "Sec-Fetch-User": "?1" | AnyString$1;
  "Sec-Purpose": "prefetch" | AnyString$1;
  "Sec-WebSocket-Accept": AnyString$1;
  "Sec-WebSocket-Extensions": AnyString$1;
  "Sec-WebSocket-Key": AnyString$1;
  "Sec-WebSocket-Protocol": AnyString$1;
  "Sec-WebSocket-Version": AnyString$1;
  "Server": AnyString$1;
  "Service-Worker-Allowed": AnyString$1;
  "Set-Cookie": AnyString$1;
  "Strict-Transport-Security": AnyString$1;
  "TE": "trailers" | AnyString$1;
  "Trailer": AnyString$1;
  "Transfer-Encoding": "chunked" | "compress" | "deflate" | "gzip" | "identity" | AnyString$1;
  "Upgrade": AnyString$1;
  "Upgrade-Insecure-Requests": "1" | AnyString$1;
  "User-Agent": AnyString$1;
  "Vary": AnyString$1;
  "Via": AnyString$1;
  "Warning": AnyString$1;
  "WWW-Authenticate": AnyString$1;
  "X-Content-Type-Options": "nosniff" | AnyString$1;
  "X-DNS-Prefetch-Control": "on" | "off" | AnyString$1;
  "X-Forwarded-For": AnyString$1;
  "X-Forwarded-Host": AnyString$1;
  "X-Forwarded-Proto": AnyString$1;
  "X-Frame-Options": "deny" | "sameorigin" | AnyString$1;
  "X-Permitted-Cross-Domain-Policies": "none" | "master-only" | "by-content-type" | "all" | AnyString$1;
  "X-Pingback": AnyString$1;
  "X-Requested-With": AnyString$1;
  "X-XSS-Protection": "0" | "1" | "1; mode=block" | AnyString$1;
}
//#endregion
//#region src/http/headers/response.d.ts
type AnyString = string & {};
type ResponseHeaderName = keyof ResponseHeaderMap | AnyString;
interface ResponseHeaderMap {
  "Accept-Patch": AnyString;
  "Accept-Ranges": "bytes" | "none" | AnyString;
  "Access-Control-Allow-Credentials": "true" | AnyString;
  "Access-Control-Allow-Headers": "*" | ResponseHeaderName | AnyString;
  "Access-Control-Allow-Methods": "*" | HTTPMethod$1 | AnyString;
  "Access-Control-Allow-Origin": "*" | "null" | AnyString;
  "Access-Control-Expose-Headers": "*" | ResponseHeaderName | AnyString;
  "Access-Control-Max-Age": AnyString;
  "Age": AnyString;
  "Allow": HTTPMethod$1 | AnyString;
  "Alt-Svc": AnyString;
  "Alt-Used": AnyString;
  "Cache-Control": "no-cache" | "no-store" | "max-age" | "must-revalidate" | "public" | "private" | "proxy-revalidate" | "s-maxage" | "stale-while-revalidate" | "stale-if-error" | AnyString;
  "Clear-Site-Data": AnyString;
  "Connection": "keep-alive" | "close" | AnyString;
  "Content-Disposition": AnyString;
  "Content-DPR": AnyString;
  "Content-Encoding": "gzip" | "compress" | "deflate" | "br" | "identity" | AnyString;
  "Content-Language": AnyString;
  "Content-Length": AnyString;
  "Content-Location": AnyString;
  "Content-Range": AnyString;
  "Content-Security-Policy": AnyString;
  "Content-Security-Policy-Report-Only": AnyString;
  "Content-Type": MimeType | AnyString;
  "Cross-Origin-Embedder-Policy": "unsafe-none" | "require-corp" | "credentialless" | AnyString;
  "Cross-Origin-Opener-Policy": "unsafe-none" | "same-origin-allow-popups" | "same-origin" | AnyString;
  "Cross-Origin-Resource-Policy": "same-site" | "same-origin" | "cross-origin" | AnyString;
  "Date": AnyString;
  "Device-Memory": AnyString;
  "Digest": AnyString;
  "Downlink": AnyString;
  "ECT": "slow-2g" | "2g" | "3g" | "4g" | AnyString;
  "ETag": AnyString;
  "Early-Data": "1" | AnyString;
  "Expect-CT": AnyString;
  "Expires": AnyString;
  "Feature-Policy": AnyString;
  "Last-Event-ID": AnyString;
  "Last-Modified": AnyString;
  "Link": AnyString;
  "Location": AnyString;
  "NEL": AnyString;
  "Origin-Agent-Cluster": AnyString;
  "Origin-Isolation": AnyString;
  "Proxy-Authenticate": AnyString;
  "Public-Key-Pins": AnyString;
  "Public-Key-Pins-Report-Only": AnyString;
  "Refresh": AnyString;
  "Report-To": AnyString;
  "Retry-After": AnyString;
  "Save-Data": AnyString;
  "Sec-WebSocket-Accept": AnyString;
  "Sec-WebSocket-Extensions": AnyString;
  "Sec-WebSocket-Protocol": AnyString;
  "Sec-WebSocket-Version": AnyString;
  "Server": AnyString;
  "Server-Timing": AnyString;
  "Service-Worker-Allowed": AnyString;
  "Service-Worker-Navigation-Preload": AnyString;
  "Set-Cookie": AnyString;
  "Signature": AnyString;
  "Signed-Headers": AnyString;
  "Sourcemap": AnyString;
  "Strict-Transport-Security": AnyString;
  "Timing-Allow-Origin": AnyString;
  "Tk": AnyString;
  "Vary": AnyString;
  "Via": AnyString;
  "WWW-Authenticate": AnyString;
  "X-Content-Type-Options": "nosniff" | AnyString;
  "X-DNS-Prefetch-Control": "on" | "off" | AnyString;
  "X-Frame-Options": "DENY" | "SAMEORIGIN" | AnyString;
  "X-Permitted-Cross-Domain-Policies": "none" | "master-only" | "by-content-type" | "all" | AnyString;
  "X-Powered-By": AnyString;
  "X-Robots-Tag": AnyString;
  "X-UA-Compatible": "IE=edge" | AnyString;
  "X-XSS-Protection": "0" | "1" | "1; mode=block" | AnyString;
}
//#endregion
//#region src/http/index.d.ts
type HTTPMethod$1 = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";
export type MaybePromise<T = unknown> = T | Promise<T>;
export type HTTPHandler<_RequestT extends EventHandlerRequest = any> = EventHandler<_RequestT> | FetchableObject | H3Core;
/** Collapses the `any` request type of a bare {@link HTTPHandler} to the default request shape. */
export type ResolvedRequest<_RequestT extends EventHandlerRequest> = 0 extends 1 & _RequestT ? EventHandlerRequest : _RequestT;
export interface EventHandler<_RequestT extends EventHandlerRequest = EventHandlerRequest, _ResponseT extends EventHandlerResponse = EventHandlerResponse> {
  (event: H3Event<_RequestT>): _ResponseT;
  meta?: H3RouteMeta;
}
export interface EventHandlerObject<_RequestT extends EventHandlerRequest = EventHandlerRequest, _ResponseT extends EventHandlerResponse = EventHandlerResponse> {
  handler?: EventHandler<_RequestT, _ResponseT>;
  fetch?: FetchHandler$1;
  middleware?: Middleware[];
  meta?: H3RouteMeta;
}
export interface EventHandlerRequest {
  body?: unknown;
  headers?: unknown;
  query?: Partial<Record<string, string | string[]>>;
  routerParams?: Record<string, string>;
}
export type EventHandlerResponse<T = unknown> = T | Promise<T>;
export type TypedServerRequest<_RequestT extends EventHandlerRequest = EventHandlerRequest> = Omit<ServerRequest, "json" | "headers" | "clone"> & Pick<TypedRequest<NonNullable<_RequestT["body"]>, Record<keyof RequestHeaderMap, string>>, "json" | "headers" | "clone">;
type FetchHandler$1 = (req: ServerRequest) => Response | Promise<Response>;
export type FetchableObject = {
  fetch: FetchHandler$1;
};
export type EventHandlerWithFetch<_RequestT extends EventHandlerRequest = EventHandlerRequest, _ResponseT extends EventHandlerResponse = EventHandlerResponse> = EventHandler<_RequestT, _ResponseT> & {
  fetch: EventHandlerFetch<TypedResponse<_ResponseT, ResponseHeaderMap>>;
};
export type EventHandlerFetch<T extends Response | TypedResponse = Response> = (req: ServerRequest | URL | string) => Promise<T>;
export type Middleware = (event: H3Event, next: () => MaybePromise<unknown | undefined>) => MaybePromise<unknown | undefined>;
export type LazyEventHandler = () => EventHandler | FetchableObject | Promise<EventHandler | FetchableObject>;
export interface DynamicEventHandler extends EventHandlerWithFetch {
  set: (handler: EventHandler | FetchableObject) => void;
}
export type InferEventInput<Key extends keyof EventHandlerRequest, Event extends HTTPEvent, T> = void extends T ? (Event extends HTTPEvent<infer E> ? E[Key] : never) : T;
/**
 * Raw object describing HTTP error (passed to `HTTPError` constructor).
 */
export interface ErrorInput<DataT = unknown> extends Partial<ErrorBody<DataT>> {
  /**
   * Original error object that caused this error.
   */
  cause?: unknown;
  /**
   * Additional HTTP headers to be sent in error response.
   */
  headers?: HeadersInit;
  /**
   * @deprecated use `status`
   */
  statusCode?: number;
  /**
   * @deprecated use `statusText`
   */
  statusMessage?: string;
}
export type ErrorDetails = (Error & {
  cause?: unknown;
}) | HTTPError | ErrorInput;
export interface ErrorBody<DataT = unknown> {
  /**
   * HTTP status code in range [200...599]
   */
  status: number;
  /**
   * HTTP status text
   *
   * **NOTE:** This should be short (max 512 to 1024 characters).
   * Allowed characters are tabs, spaces, visible ASCII characters, and extended characters (byte value 128–255).
   *
   * **TIP:** Use `message` for longer error descriptions in JSON body.
   */
  statusText?: string;
  /**
   * HTTP Error message.
   *
   * **NOTE:** This message will be in JSON body under `message` key.
   */
  message: string;
  /**
   * Flag to indicate that the error was not handled by the application.
   *
   * Unhandled error stack trace, `data`, `body` and `message` are hidden for security reasons.
   */
  unhandled?: boolean;
  /**
   * Additional data to attach in the error JSON body under `data` key.
   */
  data?: DataT;
  /**
   * Additional top level JSON body properties to attach in the error JSON body.
   */
  body?: Record<string, unknown>;
}
/**
 * HTTPError
 */
export declare class HTTPError<DataT = unknown> extends Error implements ErrorBody<DataT> {
  override get name(): string;
  /**
   * HTTP status code in range [200...599]
   */
  readonly status: number;
  /**
   * HTTP status text
   *
   * **NOTE:** This should be short (max 512 to 1024 characters).
   * Allowed characters are tabs, spaces, visible ASCII characters, and extended characters (byte value 128–255).
   *
   * **TIP:** Use `message` for longer error descriptions in JSON body.
   */
  readonly statusText: string | undefined;
  /**
   * Additional HTTP headers to be sent in error response.
   */
  readonly headers: Headers | undefined;
  /**
   * Original error object that caused this error.
   */
  override readonly cause: unknown | undefined;
  /**
   * Additional data attached in the error JSON body under `data` key.
   */
  readonly data: DataT | undefined;
  /**
   * Additional top level JSON body properties to attach in the error JSON body.
   */
  readonly body: Record<string, unknown> | undefined;
  /**
   * Flag to indicate that the error was not handled by the application.
   *
   * Unhandled error stack trace, data and message are hidden in non debug mode for security reasons.
   */
  readonly unhandled: boolean | undefined;
  /**
   * Check if the input is an instance of HTTPError using its constructor name and status.
   *
   * It is safer than using `instanceof` because it works across different contexts (e.g., if the error was thrown in a different module).
   *
   * Requiring a `status` rejects unrelated errors named `HTTPError` (e.g. from fetch clients like `ky` or `got`), while
   * still accepting HTTPError-shaped errors from other packages (e.g. srvx `BodyTooLargeError`).
   */
  static override isError(input: any): input is HTTPError;
  /**
   * Create a new HTTPError with the given status code and optional status text and details.
   *
   * @example
   *
   * HTTPError.status(404)
   * HTTPError.status(418, "I'm a teapot")
   * HTTPError.status(403, "Forbidden", { message: "Not authenticated" })
   */
  static status(status: number, statusText?: string, details?: Exclude<ErrorDetails, "status" | "statusText" | "statusCode" | "statusMessage">): HTTPError;
  /**
   * Create a new HTTPError with the given message and optional details.
   *
   * @example
   *
   * new HTTPError("This is an error", { status: 400, cause: error })
   * new HTTPError({ message: "This is an error", status: 500, statusText: "Not Found", data: {} })
   */
  constructor(message: string, details?: ErrorDetails);
  constructor(details: ErrorDetails);
  /**
   * @deprecated Use `status`
   */
  get statusCode(): number;
  /**
   * @deprecated Use `statusText`
   */
  get statusMessage(): string | undefined;
  toJSON(): Omit<ErrorBody, "body"> & ErrorBody["body"];
}
export type H3Plugin = (h3: H3) => void;
export declare function definePlugin<T = unknown>(def: (h3: H3, options: T) => void): undefined extends T ? (options?: T) => H3Plugin : (options: T) => H3Plugin;
export declare function defineMiddleware(input: Middleware): Middleware;
/**
 * Composed middleware chain: calls each middleware in order, then the final `handler`.
 *
 * The chain is built once per middleware list (see {@link composeMiddleware}) and the
 * terminal handler is passed per-call so one composed chain can serve every route.
 */
export type ComposedMiddleware = (event: H3Event, handler: EventHandler) => unknown | Promise<unknown>;
/**
 * Precompose a middleware list into a single callable chain.
 *
 * Unlike {@link callMiddleware}, per-layer dispatch cost is paid once at build time
 * instead of on every request. Later mutations of the input array are not reflected —
 * rebuild when the list changes.
 */
export declare function composeMiddleware(middleware: Middleware[]): ComposedMiddleware;
export declare function callMiddleware(event: H3Event, middleware: Middleware[], handler: EventHandler, index?: number): unknown | Promise<unknown>;
/**
 * Converts any HTTPHandler or Middleware into Middleware.
 *
 * If FetchableObject or Handler returns a Response with 404 status, the next middleware will be called.
 */
export declare function toMiddleware(input: HTTPHandler | Middleware | undefined): Middleware;
export interface RouterContext {
  root: any;
  static: Record<string, any>;
}
export type MatchedRoute<T = any> = {
  data: T;
  params?: Record<string, string>;
};
export type HTTPMethod = "GET" | "HEAD" | "PATCH" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "QUERY";
export interface H3Config {
  /**
   * When enabled, H3 displays debugging stack traces in HTTP responses (potentially dangerous for production!).
   */
  debug?: boolean;
  /**
   * When enabled, H3 console errors for unhandled exceptions will not be displayed.
   */
  silent?: boolean;
  /**
   * By default H3 rejects requests with a malformed percent-encoded URL path
   * (e.g. `/foo%`, `/%ZZ`) with a `400 Bad Request` before routing.
   *
   * When enabled, such requests are allowed through with the raw, undecoded
   * pathname instead. Your handlers are then responsible for handling it safely.
   */
  allowMalformedURL?: boolean;
  plugins?: H3Plugin[];
  onRequest?: (event: H3Event) => MaybePromise<void>;
  onResponse?: (response: Response, event: H3Event) => MaybePromise<void>;
  onError?: (error: HTTPError, event: H3Event) => MaybePromise<void | unknown>;
}
export type H3CoreConfig = Omit<H3Config, "plugins">;
export type PreparedResponse = ResponseInit & {
  body?: BodyInit | null;
};
export interface H3RouteMeta {
  readonly [key: string]: unknown;
}
export interface H3Route {
  route?: string;
  method?: HTTPMethod;
  middleware?: Middleware[];
  meta?: H3RouteMeta;
  handler: EventHandler;
  /**
   * Cached composition of `middleware` + `handler` (built on first match).
   * @internal
   */
  "~composed"?: EventHandler;
}
export type RouteOptions = {
  middleware?: Middleware[];
  meta?: H3RouteMeta;
};
export type MiddlewareOptions = {
  method?: string;
  match?: (event: H3Event) => boolean;
};
declare class H3Core$1 {
  /**
   * Brand used to detect H3 instances (see `toEventHandler`).
   * @internal
   */
  static "~h3": boolean;
  /**
   * H3 instance config.
   */
  readonly config: H3Config;
  /** @internal */
  "~middleware": Middleware[];
  /**
   * Cached dispatch function (invalidated by `use()` and `mount()`).
   * @internal
   */
  "~dispatch"?: (event: H3Event, route: MatchedRoute<H3Route> | void) => unknown | Promise<unknown>;
  /**
   * Cached composition of `~middleware` (invalidated by `use()` and `mount()`).
   * @internal
   */
  "~composed"?: ComposedMiddleware;
  /** @internal */
  "~routes": H3Route[];
  /**
   * Create a new H3 app instance.
   */
  constructor(config?: H3Config);
  /**
   * A [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)-compatible API allowing to fetch app routes.
   *
   * Input should be standard [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object.
   *
   * Returned value is a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) Promise.
   */
  fetch(_request: ServerRequest): Response | Promise<Response>;
  /**
   * An h3 compatible event handler useful to compose multiple h3 app instances.
   */
  handler(event: H3Event): unknown | Promise<unknown>;
  /** @internal */
  "~request"(request: ServerRequest, context?: H3EventContext): Response | Promise<Response>;
  /** @internal */
  "~findRoute"(_event: H3Event): MatchedRoute<H3Route> | void;
  /**
   * Returns the middleware chain for an event. Can be overridden (subclass method or
   * instance assignment) to provide dynamic per-event middleware, which disables
   * middleware precomposition. Override before handling the first request — the
   * dispatch strategy is cached and only re-evaluated after `use()` or `mount()`.
   * @internal
   */
  "~getMiddleware"(event: H3Event, route: MatchedRoute<H3Route> | undefined): Middleware[];
  /** @internal */
  "~addRoute"(_route: H3Route): void;
}
/**
 * Registers a route handler, inferring the handler request type when it has one.
 */
export interface RouteRegistrar<T> {
  <_RequestT extends EventHandlerRequest = EventHandlerRequest>(route: string, handler: HTTPHandler<_RequestT>, opts?: RouteOptions): T;
}
declare class H3$1 extends H3Core$1 {
  /** @internal */
  "~rou3": RouterContext;
  /**
   * A [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)-compatible API allowing to fetch app routes.
   *
   * Input can be a URL, relative path or standard [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object.
   *
   * Returned value is a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) Promise.
   */
  request(request: ServerRequest | URL | string, options?: RequestInit, context?: H3EventContext): Response | Promise<Response>;
  /**
   * Register a global middleware.
   */
  use(route: string, handler: Middleware | H3$1, opts?: MiddlewareOptions): this;
  use(handler: Middleware | H3$1, opts?: MiddlewareOptions): this;
  /**
   * Register a route handler for the specified HTTP method and route.
   */
  on<_RequestT extends EventHandlerRequest = EventHandlerRequest>(method: HTTPMethod | Lowercase<HTTPMethod> | "", route: string, handler: HTTPHandler<_RequestT>, opts?: RouteOptions): this;
  /**
   * Immediately register an H3 plugin.
   */
  register(plugin: H3Plugin): this;
  /**
   * Mount an H3 app or a `.fetch` compatible server (like Hono or Elysia) with a base prefix.
   *
   * When mounting a sub-app, all routes will be added with base prefix and global middleware will be added as one prefixed middleware.
   *
   * **Note:** Sub-app options and global hooks are not inherited by the mounted app please consider setting them in the main app directly.
   */
  mount(base: string, input: FetchHandler | {
    fetch: FetchHandler;
  } | H3$1): this;
  /**
   * Register a route handler for all HTTP methods.
   */
  all: RouteRegistrar<this>;
  get: RouteRegistrar<this>;
  post: RouteRegistrar<this>;
  put: RouteRegistrar<this>;
  delete: RouteRegistrar<this>;
  patch: RouteRegistrar<this>;
  head: RouteRegistrar<this>;
  options: RouteRegistrar<this>;
  connect: RouteRegistrar<this>;
  trace: RouteRegistrar<this>;
  query: RouteRegistrar<this>;
}
export declare function toResponse(val: unknown, event: H3Event, config?: H3Config): Response | Promise<Response>;
export declare class HTTPResponse {
  #private;
  body?: BodyInit | null;
  constructor(body: BodyInit | null, init?: Pick<ResponseInit, "status" | "statusText" | "headers">);
  /**
   * Status of the response, or `undefined` when unset.
   *
   * Unset means "inherit": the status staged on `event.res.status` is used, falling back to `200`.
   * Defaulting to `200` here instead would make an untouched `HTTPResponse` indistinguishable from
   * one explicitly built with `{ status: 200 }`, and always win over `event.res`.
   */
  get status(): number | undefined;
  /** Status text of the response, or `undefined` when unset. See {@link HTTPResponse.status}. */
  get statusText(): string | undefined;
  get headers(): Headers;
}
/**
 * Check if the origin is allowed.
 */
export declare function isCorsOriginAllowed(origin: string | null | undefined, options: CorsOptions): boolean;
export interface CorsOptions {
  /**
   * This determines the value of the "access-control-allow-origin" response header.
   * If "*", it can be used to allow all origins.
   * If an array of strings or regular expressions, it can be used with origin matching.
   * If a custom function, it's used to validate the origin. It takes the origin as an argument and returns `true` if allowed.
   *
   * **Security:** Regular-expression entries are tested against the full origin
   * string **unanchored** (via `RegExp.prototype.test`). A pattern like
   * `/example\.com/` therefore also matches `https://example.com.evil.test` and
   * `https://notexample.com`. Always **anchor** (`^`…`$`) and **escape** literal
   * dots in regex origins — e.g. `/^https:\/\/([a-z0-9-]+\.)?example\.com$/` to
   * allow `example.com` and one optional subdomain label (use `(…\.)*` for
   * arbitrary depth), or `/^https?:\/\/example\.com$/` for an exact host. Prefer
   * plain string entries (matched by exact equality) when
   * you don't need pattern matching.
   *
   * Avoid `"null"` together with `credentials: true`. Sandboxed iframes, `data:`/`file:` documents,
   * and other opaque origins all send `Origin: null`, so allowing it with credentials would share
   * them across untrusted contexts.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
   * @default "*"
   */
  origin?: "*" | "null" | (string | RegExp)[] | ((origin: string) => boolean);
  /**
   * This determines the value of the "access-control-allow-methods" response header of a preflight request.
   *
   * The default `"*"` permits any method (including non-safelisted ones like `QUERY`).
   * When using an explicit allowlist, remember that `QUERY` is **not** a CORS-safelisted
   * method, so browsers preflight it — include `"QUERY"` in the array to allow it.
   *
   * When `credentials` is enabled, browsers treat `"*"` as a literal method name — in that
   * case the requested method is reflected back instead of sending a literal `*`.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods
   * @default "*"
   * @example ["GET", "HEAD", "PUT", "POST", "QUERY"]
   */
  methods?: "*" | string[];
  /**
   * This determines the value of the "access-control-allow-headers" response header of a preflight request.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers
   * @default "*"
   */
  allowHeaders?: "*" | string[];
  /**
   * This determines the value of the "access-control-expose-headers" response header.
   *
   * When `credentials` is enabled, browsers treat `"*"` as a literal header name — in that
   * case the header is omitted; list the headers explicitly to expose them.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers
   * @default "*"
   */
  exposeHeaders?: "*" | string[];
  /**
   * This determines the value of the "access-control-allow-credentials" response header.
   * When request with credentials, the options that `origin`, `methods`, `exposeHeaders` and `allowHeaders` should not be set "*".
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials
   * @see https://fetch.spec.whatwg.org/#cors-protocol-and-credentials
   * @default false
   */
  credentials?: boolean;
  /**
   * This determines the value of the "access-control-max-age" response header of a preflight request.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age
   * @default false
   */
  maxAge?: string | false;
  /**
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers
   */
  preflight?: {
    statusCode?: number;
  };
}
/**
 * Check if the incoming request is a CORS preflight request.
 */
export declare function isPreflightRequest(event: HTTPEvent): boolean;
/**
 * Append CORS preflight headers to the response.
 */
export declare function appendCorsPreflightHeaders(event: H3Event, options: CorsOptions): void;
/**
 * Append CORS headers to the response.
 */
export declare function appendCorsHeaders(event: H3Event, options: CorsOptions): void;
/**
 * Handle CORS for the incoming request.
 *
 * If the incoming request is a CORS preflight request, it will append the CORS preflight headers and send a 204 response.
 *
 * If return value is not `false`, the request is handled and no further action is needed.
 *
 * @example
 * const app = new H3();
 * app.all("/", async (event) => {
 *   const corsRes = handleCors(event, {
 *     origin: "*",
 *     preflight: {
 *       statusCode: 204,
 *     },
 *     methods: "*",
 *   });
 *   if (corsRes !== false) {
 *     return corsRes;
 *   }
 *   // Your code here
 * });
 */
export declare function handleCors(event: H3Event, options: CorsOptions): false | HTTPResponse;
export interface ProxyOptions {
  headers?: HeadersInit;
  /**
   * Header names allowed to bypass the built-in denylist. Matched
   * case-insensitively.
   *
   * This is **not** an exclusive allowlist: all ordinary request headers are
   * still forwarded regardless. It only lists exceptions that force-forward a
   * header the proxy would otherwise drop — e.g. `forwardHeaders: ["host"]`
   * forwards the client's `host` verbatim. `filterHeaders` still wins over it.
   *
   * Only the "soft" drops (`host`, `accept-encoding`, `expect`) can be
   * overridden this way. It can **never** force-forward a true hop-by-hop framing header
   * (`connection`, `keep-alive`, `transfer-encoding`, `te`, `trailer`,
   * `upgrade`, `proxy-authorization`, `proxy-connection`) or a field the
   * incoming `Connection` header nominates — forwarding those could desync
   * request framing or leak the inbound proxy's credentials upstream, so they
   * are always dropped.
   */
  forwardHeaders?: string[];
  /**
   * Denylist of incoming request header names to drop before proxying.
   * Header names are matched case-insensitively.
   */
  filterHeaders?: string[];
  /**
   * Options forwarded to the underlying `fetch()` call.
   *
   * Upstream 3xx responses are passed through to the client by default
   * (`redirect: "manual"`) rather than followed. Set
   * `fetchOptions: { redirect: "follow" }` to restore following redirects — but
   * note that following a redirect for a request with a streamed body can fail,
   * since the body cannot be replayed once it has been consumed.
   */
  fetchOptions?: RequestInit & {
    duplex?: "half" | "full";
  };
  cookieDomainRewrite?: string | Record<string, string>;
  cookiePathRewrite?: string | Record<string, string>;
  /**
   * Rewrite `location` and `refresh` response headers, like nginx
   * `proxy_redirect`:
   *
   * - `true` (default): a URL whose origin matches the proxy `target` is
   *   rewritten to the proxy's own origin (path and query preserved), so
   *   client-side redirects keep flowing through the proxy instead of
   *   exposing the upstream host. Relative and third-party URLs are left
   *   untouched, as are internal (`/`-prefixed) targets, which already share
   *   the proxy origin.
   * - A record maps URL prefixes to replacements (nginx
   *   `proxy_redirect <from> <to>`); the first matching prefix is replaced,
   *   e.g. `{ "https://upstream.example/two/": "/one/" }`. Only the explicit
   *   mappings apply in this mode (including for internal targets).
   * - `false`: forward these headers verbatim.
   *
   * @default true
   */
  locationRewrite?: boolean | Record<string, string>;
  onResponse?: (event: H3Event, response: Response) => void | Promise<void>;
  /**
   * Control how a client disconnect is handled.
   *
   * The incoming request's abort signal (`event.req.signal`) is always forwarded
   * to the proxied request, so a client disconnect aborts the upstream request
   * and releases its connection. By default the resulting abort is handled
   * quietly with a `499 Client Closed Request` response (never delivered, since
   * the client is already gone) rather than logged as a `502` gateway error.
   *
   * Set this to `true` to instead let the `AbortError` propagate to your handler
   * (e.g. to run cleanup). This also applies to a custom `fetchOptions.signal`,
   * except when it aborts with a `TimeoutError` — timeouts always map to `504`
   * (see `timeout`).
   */
  propagateAbortError?: boolean;
  /**
   * Milliseconds to wait for the upstream response (headers) before giving up.
   * On timeout the proxy responds with `504 Gateway Timeout`. The deadline is
   * cleared once the upstream responds — it never cuts off a long-running
   * response body stream.
   *
   * Because a fired timeout aborts with a `TimeoutError`, a caller-supplied
   * `fetchOptions.signal` that is itself an `AbortSignal.timeout` is also
   * mapped to `504` (rather than the `499` used for client disconnects) — note
   * that such a signal stays armed during body streaming and can truncate it;
   * prefer this option.
   */
  timeout?: number;
  /**
   * When `true`, add `x-forwarded-*` request headers derived from the incoming
   * request so the upstream learns the client and original request info:
   *
   * - `x-forwarded-for`: the client IP (`event.req.ip`, when available),
   *   **appended** to any inbound chain (like nginx
   *   `$proxy_add_x_forwarded_for`) so each hop is preserved.
   * - `x-forwarded-proto`: the incoming request protocol.
   * - `x-forwarded-host`: the original host (incl. port).
   * - `x-forwarded-port`: the original port (or the protocol default — `443` for
   *   https, `80` for http).
   *
   * An inbound value from the client never wins: the last three are replaced
   * with the server-resolved values from `event.url`, and the client's
   * `x-forwarded-for` becomes only the left of the chain. Otherwise a client
   * could hand the upstream — which trusts these headers precisely because a
   * proxy sits in front of it — an arbitrary origin address, protocol, and host,
   * defeating IP allowlists, rate limiting, and audit logs.
   *
   * These values reflect the server's own view of the request, which by default
   * comes from the real transport and the on-the-wire `Host`. They follow an
   * inbound `x-forwarded-*` header only when the server is explicitly configured
   * to trust an upstream proxy (e.g. srvx's `trustProxy`) — the correct setup
   * when a proxy you control sits in front, and the case where replacing them
   * here is a no-op.
   *
   * Headers passed explicitly via `headers` or `fetchOptions.headers` still win
   * over all of the above, since they are merged in afterwards.
   *
   * Only applied by `proxyRequest` (which forwards the incoming request);
   * the lower-level `proxy` ignores this option.
   *
   * @default false
   */
  xfwd?: boolean;
}
/**
 * Proxy the incoming request to a target URL.
 *
 * If the `target` starts with `/`, the request is handled internally by the app router
 * via `event.app.fetch()` instead of making an external HTTP request. Such a target
 * always resolves against the app's own origin: a leading separator run
 * (`//host/x`, `/\host/x`, and C0-interleaved forms like `/\thost/x` that the
 * URL parser strips down to one) is collapsed to a single `/` rather than read
 * as an authority.
 *
 * The request body is streamed to the target without buffering. Per the Fetch
 * standard, a request body can only be consumed once, so reading it beforehand
 * (e.g. via `readBody()`, `readFormData()`, or body-reading middleware) locks
 * the stream and proxying fails. If you need to inspect the body and still
 * proxy it, read from a clone and leave the original event untouched.
 *
 * Upstream 3xx responses are passed through to the client by default rather than
 * followed. Set `fetchOptions: { redirect: "follow" }` to follow them instead —
 * but following a redirect with a streamed request body can fail, since the body
 * cannot be replayed once consumed.
 *
 * **Security:** Never pass unsanitized user input as the `target`. Callers are
 * responsible for validating and restricting the target URL (e.g. allowlisting
 * hosts, blocking internal paths, enforcing protocol). Consider using
 * `bodyLimit()` middleware to prevent large request bodies from consuming
 * excessive resources when proxying untrusted input.
 *
 * **Credential forwarding:** the incoming request's `Cookie` and `Authorization`
 * headers are forwarded to the `target` verbatim. This is the correct behavior
 * for a same-trust reverse proxy, but leaks the client's credentials to any
 * upstream you do not fully trust. When proxying to a not-fully-trusted upstream,
 * strip them with `filterHeaders: ["cookie", "authorization"]`. (This differs
 * from `fetchWithEvent`, which never forwards the event's headers to an external
 * URL.)
 *
 * @example
 * app.all("/proxy", async (event) => {
 *   const body = await event.req.clone().json(); // read from the clone
 *   // ...inspect body...
 *   return proxyRequest(event, "/target"); // original stream still intact
 * });
 */
export declare function proxyRequest(event: H3Event, target: string, opts?: ProxyOptions): Promise<HTTPResponse>;
/**
 * Make a proxy request to a target URL and send the response back to the client.
 *
 * If the `target` starts with `/`, the request is dispatched internally via
 * `event.app.fetch()` (sub-request) and never leaves the process. This bypasses
 * any external security layer (reverse proxy auth, IP allowlisting, mTLS).
 *
 * Upstream 3xx responses are passed through to the client by default rather than
 * followed. Set `fetchOptions: { redirect: "follow" }` to follow them instead —
 * but following a redirect with a streamed request body can fail, since the body
 * cannot be replayed once consumed. (Internal sub-requests via `event.app.fetch()`
 * never follow redirects.)
 *
 * **Limitations** (inherited from `fetch`): upstream response bodies are always
 * decompressed (compression is not preserved end-to-end), the `host` header is
 * rewritten to the target (preserving it via `forwardHeaders: ["host"]` works on
 * Node.js but may be ignored on other runtimes), and unix sockets, TLS options,
 * or connection agents require a runtime-specific escape hatch (e.g. undici's
 * `dispatcher` in `fetchOptions` on Node.js). On browser and service-worker
 * runtimes, `redirect: "manual"` produces an unrelayable opaque-redirect for
 * external targets (a `502` is returned) — set
 * `fetchOptions: { redirect: "follow" }` there.
 *
 * **Security:** Never pass unsanitized user input as the `target`. Callers are
 * responsible for validating and restricting the target URL (e.g. allowlisting
 * hosts, blocking internal paths, enforcing protocol).
 *
 * **Credential forwarding:** `proxy` does not forward the incoming request's
 * headers automatically — only headers the caller explicitly passes via
 * `opts.headers` (or `fetchOptions.headers`) are sent, verbatim. Do not pass the
 * client's `Cookie` or `Authorization` headers through to an upstream you do not
 * fully trust. Note that `opts.filterHeaders` has no effect here — it is only
 * applied by `proxyRequest` (which does forward the incoming headers and offers
 * `filterHeaders: ["cookie", "authorization"]` as the mitigation).
 */
export declare function proxy(event: H3Event, target: string, opts?: ProxyOptions): Promise<HTTPResponse>;
/**
 * Get the request headers object without headers known to cause issues when proxying.
 */
export declare function getProxyRequestHeaders(event: H3Event, opts?: {
  host?: boolean;
  forwardHeaders?: string[];
  filterHeaders?: string[];
}): Record<string, string>;
/**
 * Make a fetch request carrying the event's context.
 *
 * Behavior depends on the target:
 *
 * An **internal** `url` (starting with `/`) is dispatched via
 * `event.app.fetch()` (sub-request) and never leaves the process. It inherits
 * the incoming request's filtered headers (via `getProxyRequestHeaders`) and
 * runtime metadata (`ip`, `waitUntil`, ...). It always resolves against the
 * app's own origin: a leading separator run (`//host/x`, `/\host/x`, and
 * C0-interleaved forms like `/\thost/x` that the URL parser strips down to
 * one) is collapsed to a single `/` rather than read as an authority.
 *
 * An **external** `url` is sent with native `fetch(url, init)` **unchanged** —
 * the event's headers and context are *not* inherited (forwarding cookies or
 * authorization to arbitrary hosts would be unsafe). A streamed `init.body`
 * is given `duplex: "half"` when unset, which Node's `fetch` requires.
 *
 * **Security:** Never pass unsanitized user input as the `url`. Callers are
 * responsible for validating and restricting the URL.
 */
export declare function fetchWithEvent(event: H3Event, url: string, init?: RequestInit & {
  duplex?: "half" | "full";
}): Promise<Response>;
/** Valid HTTP status code (100–599). Kept loose (`number`) for portability. */
export type HTTPStatus = number;
/** Declarative options for a `cache` route rule. */
export interface CacheRuleOptions {
  /**
   * Full cache name. Replaces the default app, method, rule, and route scoping;
   * prefer the cache handler's `id` option for stable cross-process keys.
   */
  name?: string;
  /** Cache key group prefix. Defaults to `"h3/route-rules"`. */
  group?: string;
  /** Custom integrity value participating in cache invalidation. */
  integrity?: unknown;
  /** Number of seconds to cache the response. */
  maxAge?: number;
  /** Enable stale-while-revalidate: serve stale cache while refreshing in the background. */
  swr?: boolean;
  /** Maximum number of seconds a stale entry may be served while revalidating. */
  staleMaxAge?: number;
  /** Storage key base prefix(es). */
  base?: string | string[];
  /**
   * Seconds one shared resolution may take before every waiter is rejected and
   * the entry evicted. Defaults to `30`; `0` or `Infinity` disables the deadline.
   */
  maxResolveTime?: number;
  /**
   * Stream the response that fills the entry instead of buffering it first.
   * Trades a synthesized `etag` and mid-body error recovery for time to first
   * byte; later requests are still served from the stored entry.
   */
  stream?: boolean;
  /**
   * Largest response body, in bytes, that may be buffered for storage. Defaults
   * to what the storage backend can hold; a larger response streams through
   * uncached.
   */
  maxBodySize?: number;
  /** Only handle conditional headers (304 responses) without caching full responses. */
  headersOnly?: boolean;
  /**
   * Headers that vary the cache key and response `Vary`. Authorization headers
   * are forwarded only when {@link allowAuthorization} is enabled.
   */
  varies?: string[] | readonly string[];
  /**
   * Query parameter names that reach the handler and vary the cache key. No
   * query parameter does by default; `true` opts the full query string back in.
   */
  allowQuery?: boolean | string[] | readonly string[];
  /**
   * Cookies allowed to vary the cache key and reach the handler. Other request
   * cookies are filtered, and `Set-Cookie` is never stored.
   */
  allowCookies?: string[] | readonly string[];
  /**
   * Forward authorization headers and vary the cache per credential. Disabled
   * by default; enabling it can greatly increase cache cardinality.
   *
   * Custom cache implementations must enforce this behavior themselves.
   */
  allowAuthorization?: boolean;
  /** Whether to synthesize a `Cache-Control` response header (default `true`). */
  sendCacheControl?: boolean;
  /** Cache-status response header: `true` (`X-Cache`), a custom name, or `false`. */
  cacheStatusHeader?: boolean | string;
}
/**
 * User-authored rules for one route pattern. Custom rule names require module
 * augmentation.
 */
export interface RouteRuleConfig {
  /**
   * Enable runtime caching; `false` disables caching inherited from a less-specific
   * pattern. Requires a registered `cache` handler (`h3/rules/cache`'s ocache-backed
   * one, or your own via `createCacheRuleHandler`).
   */
  cache?: CacheRuleOptions | false;
  /**
   * Response headers to set. `false` disables headers inherited from a
   * less-specific pattern.
   */
  headers?: Record<string, string> | false;
  /**
   * Server-side redirect; a plain string defaults to status `307`. When the rule
   * key ends in `/**`, a `**` in `to` is replaced with the matched tail — appended
   * for a trailing `to: "/new/**"`, or interpolated in place anywhere else in the
   * target's path, query, or fragment (`/new?from=**`).
   * A request whose path already has the target's shape (`/docs/v2/…` for
   * `to: "/docs/v2/**"`) is not redirected again.
   * `false` disables a redirect inherited from a less-specific pattern.
   */
  redirect?: string | {
    to: string;
    status?: HTTPStatus;
  } | false;
  /**
   * Proxy to another origin or internal path; a plain string is the destination,
   * or use an object for {@link ProxyOptions}. Wildcard `**` tail behavior matches
   * {@link redirect}. `false` disables a proxy inherited from a less-specific pattern.
   */
  proxy?: string | ({
    to: string;
  } & ProxyOptions) | false;
  /**
   * CORS via h3's `handleCors`; `true` applies permissive defaults (`*`), or pass
   * {@link CorsOptions}. A preflight is answered (204) before any other rule.
   * `false` disables CORS inherited from a less-specific pattern.
   */
  cors?: CorsOptions | boolean;
  /** Enable stale-while-revalidate, optionally with a `maxAge` in seconds. */
  swr?: boolean | number;
}
/**
 * Rules for one normalized pattern. Includes custom names and `false` markers
 * that reset inherited rules.
 */
export type NormalizedRouteRules = { [K in RouteRuleName]?: ResolvedRouteRules[K] | RuleReset<K>; } & {
  [key: string]: unknown;
};
/** The `false` reset marker for rule `K`, when its authored config admits one. */
type RuleReset<K extends RouteRuleName> = K extends keyof RouteRuleConfig ? Extract<RouteRuleConfig[K], false> : false;
/** Normalized `redirect` rule options. */
export interface RedirectRuleOptions {
  to: string;
  status: HTTPStatus;
  /** Scope base used to validate and strip the tail a `/**` rule key matched. */
  base?: string;
}
/** Normalized `proxy` rule options. */
export type ProxyRuleOptions = {
  to: string;
  /** Scope base used to validate and strip the tail a `/**` rule key matched. */
  base?: string;
} & ProxyOptions;
/** A declared built-in or augmented route-rule name. */
type RouteRuleName = Extract<keyof ResolvedRouteRules, string>;
/** A matched rule with merged options and route provenance. */
export interface MatchedRouteRule<K extends RouteRuleName = RouteRuleName> {
  /** The merged rule options (never `false` — a reset deletes the rule instead). */
  options: NonNullable<ResolvedRouteRules[K]>;
  /**
   * Most specific pattern that contributed to the rule, as normalized: spelled
   * the way h3 stores the equivalent route, so `"/café/**"` reads
   * `/caf%C3%A9/**` and `"/a b/**"` reads `/a%20b/**`.
   */
  route: string;
  /** rou3 params from every matched pattern that contributed to this rule. */
  params?: Record<string, string>;
  /**
   * Rule handler: the middleware constructor plus its optional `order`.
   * Data-only rules have no handler.
   */
  handler?: RuleHandler<K>;
}
/** Matched rules with provenance, keyed by rule name. */
export type MatchedRouteRules = { [K in RouteRuleName]?: MatchedRouteRule<K>; };
/** Builds middleware for a matched rule. */
export interface RuleHandler<K extends RouteRuleName = RouteRuleName> {
  /**
   * Execution order, lower runs first (outermost). Defaults to `0`, which is
   * outside every built-in that can short-circuit (`redirect` 1, `proxy` 2,
   * `cache` 3) and inside `cors` (-3) and `headers` (-1); `-2` is left free for
   * a gate that must also precede `headers`.
   *
   * Two handlers must not share an order when one of them can answer without
   * calling `next()` — the tie is broken by rule name, which is deterministic
   * but arbitrary, and the loser never runs.
   */
  order?: number;
  /**
   * Mark fail-closed rules such as auth gates. Restricting rules may be re-added
   * from alternate path readings after a narrower reset; defaults to `false`.
   */
  restricting?: boolean;
  handler: (matched: MatchedRouteRule<K>) => Middleware;
}
/** Map of rule name → handler constructor. */
export type RuleHandlers = Record<string, RuleHandler<any> | undefined>;
/** Result of matching a request against the rule set. */
export interface MatchResult {
  /**
   * Merged rule options keyed by rule name — the map exposed as
   * `event.context.routeRules`, so `routeRules.redirect?.to` reads directly.
   */
  routeRules: ResolvedRouteRules;
  /** The same rules with their contributing pattern, params, and handler. */
  matchedRules: MatchedRouteRules;
  /** Ordered middleware to run before the route handler. */
  routeRuleMiddleware: Middleware[];
}
/**
 * The rule keys `h3/rules` ships a built-in handler for, typed as the **merged
 * rule options** the runtime resolves for them — the same shape the rule was
 * authored in (`RouteRuleConfig`), minus the input sugar normalization already
 * expanded (`redirect: "/new"` → `{ to, status }`) and minus the `false` reset
 * marker, which is applied as a deletion and can therefore never survive into a
 * merged rule set.
 *
 * Declared on their own interface rather than on {@link RouteRules}, the shared
 * augmentable one. Declaration merging compares a redeclared property by *type
 * identity* (`TS2717`), so naming these keys on `RouteRules` itself would make
 * every third-party declaration of the same key an error — including the ones
 * Nitro and the standalone `h3-rules` package have always shipped:
 *
 * ```ts
 * declare module "h3" {
 *   interface RouteRules {
 *     redirect?: { to: string; status?: number };
 *   }
 * }
 * ```
 *
 * *Inheriting* them (`interface RouteRules extends BuiltinRouteRules`) does not
 * work either. It only downgrades the check to assignability (`TS2430` — a
 * derived interface may narrow an inherited property), and the shapes actually
 * shipped are not narrowings of anything useful: `nitropack`'s
 * `redirect?: string | { to; status? }` carries a **primitive** arm (h3's own
 * `@example` shipped that shape too), and its `cache?: … | false` /
 * `cors?: boolean` carry a **`false`** arm — `false` being h3's own reset
 * marker. Widening the built-in's declared type until those assign makes it an
 * escape hatch that erases member access for everyone who does *not* augment.
 *
 * The built-ins are therefore *composed in at the point of use* — see
 * {@link ResolvedRouteRules} — where nothing is inherited and no assignability
 * check applies at all.
 *
 * Adding a `[key: string]: unknown` index signature here (so that a data-only
 * rule reads off the context without being declared) is equally out: on a shared
 * ecosystem interface an index signature makes every other module's augmentation
 * an error (`TS2411`), whatever key or type it adds. A custom rule is declared
 * once, on {@link RouteRules}.
 */
export interface BuiltinRouteRules {
  headers?: Record<string, string>;
  redirect?: RedirectRuleOptions;
  proxy?: ProxyRuleOptions;
  cache?: CacheRuleOptions;
  cors?: CorsOptions;
}
/**
 * The rules matched for the current route, **keyed by rule name and holding the
 * merged rule options directly** (`rules.redirect.to`, `rules.headers["x-a"]`) —
 * the canonical extension point for route rules in the h3 ecosystem.
 *
 * Intentionally **empty and unconstrained**: modules that implement or consume
 * route rules (such as Nitro) augment it via declaration merging, so that a
 * single type describes the rules of any h3 app regardless of which module
 * declared them. Every shape is accepted, including on a key h3 ships a built-in
 * for — see {@link BuiltinRouteRules} for why nothing is declared here.
 *
 * Handlers read the *resolved* set, {@link ResolvedRouteRules}, off
 * `event.context.routeRules`, where it is typed `Readonly` — matchers are
 * commonly memoized, so a matched object can be shared between requests and must
 * not be mutated in place.
 *
 * This is the **one** `RouteRules` interface: `h3/rules` re-exports it, so a
 * custom rule is declared once, in one shape, and is then typed on both the
 * matched result and the context. (Its authored counterpart, `RouteRuleConfig`,
 * stays a separate closed interface — that is what makes a typo a compile
 * error.) Per-rule provenance — which pattern contributed the options, its
 * params, the handler — is deliberately *not* here; it is passed to rule
 * handlers as a `MatchedRouteRule` and available as `MatchResult.matchedRules`.
 *
 * @example
 * ```ts
 * declare module "h3/rules" {
 *   interface RouteRuleConfig {
 *     audience?: "public" | "internal";
 *   }
 *   interface RouteRules {
 *     audience?: "public" | "internal";
 *   }
 * }
 *
 * // event.context.routeRules.audience -> "public" | "internal" | undefined
 * ```
 */
export interface RouteRules {}
/**
 * The rules as seen on `event.context.routeRules`: everything declared on
 * {@link RouteRules}, plus a built-in for every key nobody claimed.
 *
 * `Omit` — not `&` — so that an augmenter's redeclaration *replaces* h3's
 * built-in rather than intersecting with it; intersecting `RedirectRuleOptions`
 * with `string | { to: string }` would yield a type no value inhabits. Keys left
 * to h3 keep their exact option type, so `rules.redirect?.to` reads without
 * narrowing.
 */
export type ResolvedRouteRules = RouteRules & Omit<BuiltinRouteRules, keyof RouteRules>;
export interface H3EventContext extends ServerRequestContext {
  params?: Record<string, string>;
  middlewareParams?: Record<string, string>;
  /**
   * Matched router Node
   *
   * @experimental The object structure may change in non-major version.
   */
  matchedRoute?: H3Route;
  sessions?: Record<string, Session>;
  routeRules?: Readonly<ResolvedRouteRules>;
  clientAddress?: string;
  basicAuth?: {
    username: string;
    password?: string;
    realm: string;
  };
  timing?: Array<{
    name: string;
  } & Record<string, unknown>>;
}
export interface HTTPEvent<_RequestT extends EventHandlerRequest = EventHandlerRequest> {
  /**
   * Incoming HTTP request info.
   *
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request)
   */
  req: TypedServerRequest<_RequestT>;
}
export declare class H3Event<_RequestT extends EventHandlerRequest = EventHandlerRequest> implements HTTPEvent<_RequestT> {
  /**
   * Access to the H3 application instance.
   */
  app?: H3Core;
  /**
   * Incoming HTTP request info.
   *
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request)
   */
  readonly req: TypedServerRequest<_RequestT>;
  /**
   * Access to the parsed request URL.
   *
   * `event.url.pathname` is the path in its wire encoding, with one exception:
   * an escape that is *needlessly* there is dropped — one whose character
   * survives WHATWG path serialization unchanged, minus `%2F` and `%25` which
   * must stay opaque (e.g. `/%61dmin` -> `/admin`, `/%40handle` -> `/@handle`).
   * This is decoded once, before routing, so that route matching, `use()`
   * matchers and a handler reading `event.url.pathname` all compare one and the
   * same string and `/%61dmin` cannot slip past an `/admin` guard. Nothing else
   * is touched, and `event.req.url` always keeps the original wire encoding.
   * See the "Pathname encoding" section of the guide for the full rule:
   * https://h3.dev/guide/api/h3event#pathname-encoding
   *
   * Malformed encoding (`/foo%`, `/%ZZ`) has no canonical form and is rejected
   * with a `400` before any handler runs, unless the `allowMalformedURL` app
   * option is enabled.
   *
   * Every escape that survives is therefore opaque, and must be treated as such:
   * `%2F`/`%5C` keep a separator out of a `:param` the router matched as one
   * segment, and decoding `pathname` yourself can reintroduce a `/` or `..` that
   * routing and middleware never saw (path traversal). To read a route param in
   * decoded form use `getRouterParams(event, { decode: true })`, which keeps
   * encoded separators encoded.
   *
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/URL)
   */
  url: URL;
  /**
   * Event context.
   */
  readonly context: H3EventContext;
  /**
   * @internal
   */
  static __is_event__: boolean;
  constructor(req: ServerRequest, context?: H3EventContext, app?: H3Core);
  /**
   * Prepared HTTP response.
   */
  get res(): H3EventResponse;
  /**
   * Access to runtime specific additional context.
   *
   */
  get runtime(): ServerRuntimeContext | undefined;
  /**
   * Tell the runtime about an ongoing operation that shouldn't close until the promise resolves.
   */
  waitUntil(promise: Promise<any>): void;
  toString(): string;
  toJSON(): string;
  /**
   * Access to the raw Node.js req/res objects.
   *
   * @deprecated Use `event.runtime.{node|deno|bun|...}.` instead.
   */
  get node(): ServerRuntimeContext["node"] | undefined;
  /**
   * Access to the incoming request headers.
   *
   * @deprecated Use `event.req.headers` instead.
   *
   */
  get headers(): Headers;
  /**
   * Access to the incoming request url (pathname+search).
   *
   * @deprecated Use `event.url.pathname + event.url.search` instead.
   *
   * Example: `/api/hello?name=world`
   * */
  get path(): string;
  /**
   * Access to the incoming request method.
   *
   * @deprecated Use `event.req.method` instead.
   */
  get method(): string;
}
declare class H3EventResponse {
  status?: number;
  statusText?: string;
  get headers(): Headers;
  get errHeaders(): Headers;
}
export declare class H3Core implements H3Core$1 {
  static "~h3": boolean;
  readonly config: H3CoreConfig;
  "~middleware": Middleware[];
  "~routes": H3Route[];
  "~dispatch"?: (event: H3Event, route: MatchedRoute<H3Route> | void) => unknown | Promise<unknown>;
  "~composed"?: ComposedMiddleware;
  constructor(config?: H3CoreConfig);
  fetch(request: ServerRequest): Response | Promise<Response>;
  handler(event: H3Event): unknown | Promise<unknown>;
  "~request"(request: ServerRequest, context?: H3EventContext): Response | Promise<Response>;
  "~findRoute"(_event: H3Event): MatchedRoute<H3Route> | void;
  "~addRoute"(_route: H3Route): void;
  "~getMiddleware"(_event: H3Event, _route?: MatchedRoute<H3Route>): Middleware[];
}
export declare const H3: {
  new (config?: H3Config): H3$1;
};
export type H3 = H3$1;
export { type CookieSerializeOptions, FetchHandler$1 as FetchHandler, H3$1, type TypedHeaders };