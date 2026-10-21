import { a as IPtyConsumer, i as IPty } from "../_chunks/types.mjs";
import { Buffer } from "node:buffer";
/** Detector state — either nothing meaningful is flowing, or output is in flight. */
type IdleState = "idle" | "active";
/** Emitted on every state transition. */
interface IdleEvent {
  /** New state after the transition. */
  type: IdleState;
  /** Significant content bytes (ANSI/control bytes excluded) accumulated for the output burst. */
  bytes: number;
  /** How long the previous state lasted, in ms. */
  durationMs: number;
}
/** Listener for idle-detector transitions. */
type IdleListener = (event: IdleEvent) => void;
interface IdleDetectorOptions {
  /**
   * Quiet period (ms) with no significant bytes before transitioning
   * `active` → `idle`. This is the main "attention" signal — when output
   * stops, the agent is likely done or waiting for input. Default `750`.
   */
  quietMs?: number;
  /**
   * Minimum significant bytes in a single burst (gaps shorter than
   * `quietMs`) before transitioning `idle` → `active`. Tiny status-bar
   * updates and cursor-blink redraws fall below this. Default `512`.
   */
  activeThreshold?: number;
  /**
   * Grace period (ms) after attach during which significant bytes are
   * silently absorbed without firing `active`. Filters out the initial
   * shell-prompt / banner flood. Default `1500`.
   */
  graceMs?: number;
  /**
   * Suppression window (ms) opened by {@link IdleDetector.suppress} — and
   * automatically on PTY resize — during which significant bytes are
   * silently absorbed. Filters out the full-screen repaint a TUI emits
   * after a resize or an explicit redraw (`^L`), which would otherwise look
   * like a fresh burst of agent output. Default `500`.
   */
  redrawGraceMs?: number;
}
/**
 * Implicit terminal-attention detector.
 *
 * Watches a PTY's byte stream and emits an `idle` event when output stops
 * after a burst of meaningful activity — typically meaning an interactive
 * AI agent or REPL is done streaming and waiting for input.
 *
 * Designed to suppress common false positives:
 * - **Startup flood**: bytes arriving within `graceMs` of attach are
 *   silently absorbed (shell init, banner, first prompt).
 * - **Tiny UI updates**: status bars and cursor-blink redraws fall below
 *   `activeThreshold` (significant bytes per burst) and never enter active.
 * - **ANSI/CSI/OSC sequences**: only printable content counts toward the
 *   threshold, so heavy color/escape output doesn't masquerade as text.
 * - **Resize / redraw repaints**: bytes arriving within `redrawGraceMs` of a
 *   PTY resize (auto) or an explicit {@link suppress} call (e.g. before
 *   sending `^L`) are absorbed — a full-screen repaint isn't fresh output.
 *
 * @example
 * ```ts
 * const det = new IdleDetector((e) => {
 *   if (e.type === "idle") console.log("agent likely waiting for input");
 * });
 * pty.attach(det);
 * ```
 */
declare class IdleDetector implements IPtyConsumer {
  private _state;
  private _bytesPending;
  private _stateStart;
  private _attachAt;
  private _lastSigTime;
  private _idleTimer;
  private _escState;
  private _suppressUntil;
  private _listeners;
  private readonly _quietMs;
  private readonly _activeThreshold;
  private readonly _graceMs;
  private readonly _redrawGraceMs;
  constructor(listener?: IdleListener, options?: IdleDetectorOptions);
  /** Subscribe to idle/active transitions. Returns a disposer. */
  on(listener: IdleListener): () => void;
  /** Current state (`idle` initially). */
  get state(): IdleState;
  /** Reset the grace window — called automatically by `pty.attach()`. */
  onAttach(_pty: IPty): void;
  onDetach(_pty: IPty): void;
  /**
   * Auto-called by `pty.attach()` wiring whenever the PTY is resized. Opens a
   * suppression window so the TUI's full-screen repaint isn't counted as a
   * fresh activity burst.
   */
  onResize(_cols: number, _rows: number): void;
  /**
   * Open a suppression window of `durationMs` (default `redrawGraceMs`).
   * Significant bytes arriving within it are absorbed silently — they never
   * push the detector into `active`, nor keep an active burst alive. Call this
   * right before sending an explicit redraw (e.g. `^L`) so the repaint that
   * follows isn't mistaken for new output. Resize triggers it automatically.
   */
  suppress(durationMs?: number): void;
  /** Feed bytes into the detector. Accepts string (utf-8), Buffer, or Uint8Array. */
  feed(data: string | Buffer | Uint8Array): void;
  /** Drop all listeners and reset internal state. */
  dispose(): void;
  private _scheduleIdle;
  private _countSignificant;
  private _emit;
}
export { IdleDetector, type IdleDetectorOptions, type IdleEvent, type IdleListener, type IdleState };