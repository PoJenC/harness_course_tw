import { a as IPtyConsumer } from "../_chunks/types.mjs";
import { Buffer } from "node:buffer";
/** Raw OSC event emitted by the parser. */
interface OSCEvent {
  /** Numeric OSC code (e.g. 0, 7, 133, 633, 9, 99, 1337). `-1` if absent. */
  code: number;
  /** Raw payload after the leading `code;` (or the whole body if no `;`). */
  payload: string;
}
/** Decoded shapes for well-known OSC codes. */
type DecodedOSC = {
  kind: "title";
  code: 0 | 1 | 2;
  title: string;
} | {
  kind: "cwd"; /** Where this CWD was reported from. */
  source: "osc7" | "conemu" | "iterm"; /** Decoded filesystem path (percent-decoded for OSC 7). */
  path: string; /** Raw URI — only present for OSC 7. */
  uri?: string; /** URI scheme (`file`, `kitty-shell-cwd`, …) — only present for OSC 7. */
  scheme?: string; /** Host from the OSC 7 URI authority — `undefined` when empty. */
  host?: string; /** True when `host` is empty or `localhost` (OSC 7). */
  local?: boolean;
} | {
  kind: "shellIntegration";
  vendor: "vt" | "vscode"; /** Sub-command letter or word (e.g. `A`, `B`, `C`, `D`, `EnvSingleStart`). */
  command: string; /** Remainder after the command, joined by `;`. Empty when no data. */
  data: string; /** Parsed exit code for `D`. */
  exitCode?: number; /** Parsed `err=` value for OSC 133 `D` (empty string = success). */
  err?: string; /** Parsed `key=value` extras (kitty `A`/`C`; vscode `P`). */
  params?: Record<string, string>; /** Parsed key for vscode `P;<Key>=<Value>` / `EnvSingleEntry`. */
  key?: string; /** Parsed value for vscode `P;<Key>=<Value>` / `EnvSingleEntry`. */
  value?: string; /** Parsed command line for vscode `E`. */
  commandLine?: string; /** Parsed nonce for vscode `E` / `EnvSingle*`. */
  nonce?: string; /** Index for vscode `EnvSingleStart`. */
  index?: number;
} | {
  kind: "notification";
  vendor: "iterm" | "conemu" | "kitty" | "rxvt";
  title?: string;
  body?: string; /** kitty: notification identifier ties chunks together. */
  id?: string; /** kitty: 0=low, 1=normal, 2=critical. */
  urgency?: 0 | 1 | 2; /** kitty: `d=0` — more chunks pending. */
  partial?: boolean; /** kitty: non-payload phase (`close`, `alive`, `icon`, `buttons`, `?`). */
  phase?: string;
  raw: string;
} | {
  kind: "progress"; /** 0=remove, 1=normal, 2=error, 3=indeterminate, 4=paused. */
  state: number; /** 0-100. Omitted for states 0/3 and optional for 2/4. */
  value?: number;
} | {
  kind: "attention";
  vendor: "iterm";
  action: "request" | "cancel";
  effect?: "fireworks" | "once";
  value: string;
  raw: string;
} | {
  kind: "hyperlink"; /** `open` = active hyperlink begins; `close` = empty-URI terminator. */
  action: "open" | "close";
  uri: string;
  id?: string;
  params: Record<string, string>;
} | {
  kind: "clipboard"; /** Raw `Pc` field (may be empty for default `s0`, may be multi-char). */
  selection: string; /** `Pc` split into individual selection chars (`cs` → `['c','s']`). */
  selections: string[]; /** Base64-encoded data (when setting). */
  data?: string; /** True for `?` query. */
  query?: boolean; /** True when `Pd` is neither base64 nor `?` (xterm-spec: clear clipboard). */
  clear?: boolean;
} | {
  kind: "mark";
  vendor: "iterm" | "conemu";
  raw: string;
} | {
  kind: "userVar";
  vendor: "iterm";
  name: string; /** Base64-decoded value. */
  value: string;
  raw: string;
} | {
  kind: "remoteHost";
  vendor: "iterm";
  user?: string;
  host: string;
  raw: string;
} | {
  kind: "shellIntegrationVersion";
  vendor: "iterm";
  version: string;
  raw: string;
} | {
  kind: "unknown";
  code: number;
  payload: string;
};
/** Listener for raw OSC events. */
type OSCListener = (event: OSCEvent) => void;
/**
 * Terminal state derived from OSC sequences seen so far.
 *
 * Populated by {@link OSCInspector} as it parses incoming bytes. Only
 * sequences that represent durable, observable state are folded in here —
 * action-like sequences (clipboard writes, notifications, marks, attention
 * requests) are still emitted to listeners but don't update state.
 */
interface OSCState {
  /** Window title — last value from OSC 0 or OSC 2. */
  title?: string;
  /** Icon / tab name — last value from OSC 0 or OSC 1. */
  iconName?: string;
  /** Current working directory — from OSC 7, OSC 1337 `CurrentDir`, or OSC 9;9. */
  cwd?: {
    path: string;
    source: "osc7" | "conemu" | "iterm"; /** Host from the OSC 7 URI authority (only when present and non-empty). */
    host?: string;
  };
  /** Active hyperlink between OSC 8 open and OSC 8 close. */
  hyperlink?: {
    uri: string;
    id?: string;
    params: Record<string, string>;
  };
  /** Latest taskbar progress (OSC 9;4). Cleared when state 0 is reported. */
  progress?: {
    state: number;
    value?: number;
  };
  /** Remote host (OSC 1337 `RemoteHost`). */
  remoteHost?: {
    user?: string;
    host: string;
  };
  /** iTerm shell-integration version (OSC 1337 `ShellIntegrationVersion`). */
  shellIntegrationVersion?: string;
  /** User-defined variables set via OSC 1337 `SetUserVar`. */
  userVars?: Record<string, string>;
}
/** Listener for state changes. Called after each OSC sequence that mutated state. */
type OSCStateListener = (state: Readonly<OSCState>) => void;
/** Signature for an OSC decoder. `payload` is split out for ergonomics. */
type OSCDecoderFn<T> = (payload: string, event: OSCEvent) => T;
/** A map of OSC code → decoder. Used by both built-ins and custom decoders. */
type OSCDecoderMap<T> = Record<number, OSCDecoderFn<T>>;
/** Union of return types from a custom decoder map — used to type the result of {@link createOSCDecoder}. */
type CustomDecodedOSC<Map> = Map[keyof Map] extends ((...args: never) => infer R) ? R : never;
/**
 * Pure-TS OSC (Operating System Command) inspector.
 *
 * Feed any byte stream — typically a PTY's data stream — and receive a
 * callback per recognized OSC sequence. The parser is a byte-fed state
 * machine, so sequences split across feed calls are stitched back together.
 *
 * @example
 * ```ts
 * const inspector = new OSCInspector((event) => {
 *   console.log(`OSC ${event.code}: ${event.payload}`);
 * });
 * pty.attach(inspector);
 * ```
 */
declare class OSCInspector implements IPtyConsumer {
  private _state;
  private _buf;
  private _len;
  private _overflow;
  private _listeners;
  private _stateListeners;
  /**
   * Terminal state derived from the sequences seen so far. Mutated in place
   * before listeners fire, so handlers can read fresh values. Treat as
   * read-only — direct mutation will not notify state listeners.
   */
  readonly state: OSCState;
  constructor(listener?: OSCListener);
  /** Subscribe to OSC events. Returns a disposer. */
  on(listener: OSCListener): () => void;
  /**
   * Subscribe to state changes. The listener is invoked after each OSC
   * sequence that mutated {@link state}. Returns a disposer.
   */
  onStateChange(listener: OSCStateListener): () => void;
  /** Feed bytes into the parser. Accepts string (utf-8), Buffer, or Uint8Array. */
  feed(data: string | Buffer | Uint8Array): void;
  /** Drop all listeners and reset parser + derived state. */
  dispose(): void;
  private _feedByte;
  private _finish;
  private _applyToState;
}
/**
 * Built-in OSC decoders keyed by code. Exposed so callers can inspect,
 * reuse, or layer their own decoders on top via {@link createOSCDecoder}.
 *
 * Mutating this object is supported but considered a global side-effect —
 * prefer passing custom decoders to {@link createOSCDecoder} instead.
 */
declare const builtinOSCDecoders: OSCDecoderMap<DecodedOSC>;
/**
 * Build a decoder function that runs custom decoders first, then falls back
 * to the built-ins, then to `{ kind: "unknown", code, payload }`.
 *
 * Custom decoders may register handlers for any OSC code — including unknown
 * ones — and may override built-in codes. The returned type is the union of
 * {@link DecodedOSC} and every custom decoder's return type, so the result
 * is fully typed in user code.
 *
 * @example
 * ```ts
 * const decode = createOSCDecoder({
 *   50:   (p) => ({ kind: "screen-mode", mode: p } as const),
 *   1234: (p, e) => ({ kind: "x", code: e.code, raw: p } as const),
 * });
 *
 * const d = decode(event);
 * // d is DecodedOSC | { kind: "screen-mode"; ... } | { kind: "x"; ... }
 * ```
 */
declare function createOSCDecoder(): (event: OSCEvent) => DecodedOSC;
declare function createOSCDecoder<Map extends Record<number, OSCDecoderFn<unknown>>>(custom: Map): (event: OSCEvent) => DecodedOSC | CustomDecodedOSC<Map>;
/**
 * Decode a raw OSC event into a typed shape for well-known codes.
 *
 * Returns `{ kind: "unknown", code, payload }` for unrecognized codes — the
 * raw event is always preserved so callers can implement custom decoders
 * (see {@link createOSCDecoder} for extending the decoder with new codes).
 */
declare const decodeOSC: (event: OSCEvent) => DecodedOSC;
export { type CustomDecodedOSC, type DecodedOSC, type OSCDecoderFn, type OSCDecoderMap, type OSCEvent, OSCInspector, type OSCListener, type OSCState, type OSCStateListener, builtinOSCDecoders, createOSCDecoder, decodeOSC };