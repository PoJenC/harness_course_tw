interface INativeChildStats {
  pid: number;
  name: string;
  rssBytes: number;
  cpuUser: number;
  cpuSys: number;
}
interface INativeStats {
  pid: number;
  cwd: string | null;
  rssBytes: number;
  cpuUser: number;
  cpuSys: number;
  count: number;
  children: INativeChildStats[];
}
interface INativeWindows {
  spawn(file: string, args: string[], env: string[], cwd: string, cols: number, rows: number, onData: (data: Buffer) => void, onExit: (info: {
    exitCode: number;
    signal: number;
  }) => void): {
    pid: number;
    handle: object;
  };
  write(handle: object, data: string): void;
  resize(handle: object, cols: number, rows: number): void;
  kill(handle: object): void;
  close(handle: object): void;
  stats(handle: object): INativeStats | undefined;
}
/** True when native Zig PTY bindings loaded successfully. */
declare const hasNative: boolean;
interface TerminalOptions {
  /** Number of columns. Default: 80 */
  cols?: number;
  /** Number of rows. Default: 24 */
  rows?: number;
  /** Terminal type name (sets TERM env var). Default: "xterm-256color" */
  name?: string;
  /** Callback when data is received from the terminal. */
  data?: (terminal: Terminal, data: Uint8Array) => void;
  /** Callback when PTY stream closes (EOF or error). exitCode is PTY lifecycle status (0=EOF, 1=error). */
  exit?: (terminal: Terminal, exitCode: number, signal: string | null) => void;
  /** Callback when the terminal is ready for more data. */
  drain?: (terminal: Terminal) => void;
}
/**
 * Standalone terminal (PTY).
 *
 * Can be created standalone via `new Terminal()` or passed to `spawn()` via the
 * `terminal` option for callback-based data handling.
 *
 * Supports `Disposable` (`using`) — close is synchronous.
 */
declare class Terminal implements Disposable {
  stdin: number;
  stdout: number;
  private _closed;
  private _cols;
  private _rows;
  private _name;
  private _onData?;
  private _onExit?;
  private _onDrain?;
  private _textDecoder;
  /** @internal Listeners for waitFor support. */
  _dataListeners: Array<(data: string) => void>;
  private _readable?;
  private _wq?;
  private _winHandle?;
  private _winNative?;
  private _winReady;
  private _winDeferred;
  private _standalone;
  constructor(options?: TerminalOptions);
  get closed(): boolean;
  write(data: string | Uint8Array): number;
  resize(cols: number, rows: number): void;
  ref(): void;
  unref(): void;
  close(): void;
  [Symbol.dispose](): void;
  /** @internal Attach to a fork's master fd (called from UnixTerminal). */
  _attachUnixFd(fd: number): void;
  /** @internal Attach a Windows ConPTY handle (called from WindowsTerminal). */
  _attachWindows(winNative: INativeWindows, handle: object): void;
  /** @internal Mark Windows terminal as ready and flush deferred calls. */
  _markReady(): void;
  /** @internal Emit data from native. */
  _emitData(data: Uint8Array): void;
  private _destroyReader;
  private _setupUnixReader;
  private _writeUnix;
  private _writeWindows;
}
interface IEvent<T> {
  (listener: (data: T) => void): IDisposable;
}
interface IDisposable {
  dispose(): void;
}
/**
 * A sink that consumes PTY output. Pass to {@link IPty.attach} to wire it
 * onto a PTY's data stream.
 *
 * Anything with a `feed(data)` method conforms — including `OSCInspector`,
 * a terminal recorder, a logger, etc. Optional lifecycle hooks let the
 * consumer react to attach/detach (which also fires when the PTY exits).
 */
interface IPtyConsumer {
  /** Receive a chunk of PTY output. */
  feed(data: string | Buffer): void;
  /** Optional: called once when attached, before the first `feed`. */
  onAttach?(pty: IPty): void;
  /** Optional: called once when detached (explicit dispose or PTY exit). */
  onDetach?(pty: IPty): void;
  /** Optional: called after the PTY is resized, with the new dimensions. */
  onResize?(cols: number, rows: number): void;
}
interface IPtyChildStats {
  /** Process ID. */
  pid: number;
  /** Short executable / command name (truncated to ~15 chars on Unix, up to 31 on Windows). */
  name: string;
  /** Resident set size (physical memory) in bytes. */
  rssBytes: number;
  /** Accumulated user-mode CPU time in microseconds. */
  cpuUser: number;
  /** Accumulated system-mode CPU time in microseconds. */
  cpuSys: number;
}
interface IPtyStats {
  /** Leader PID — the spawned process (e.g. the shell). */
  pid: number;
  /** Leader's current working directory. `null` when unavailable (always on Windows, or when the process has exited). */
  cwd: string | null;
  /** Total resident set size (physical memory) in bytes, aggregated across leader + descendants. */
  rssBytes: number;
  /** Total accumulated user-mode CPU time in microseconds, aggregated across leader + descendants. */
  cpuUser: number;
  /** Total accumulated system-mode CPU time in microseconds, aggregated across leader + descendants. */
  cpuSys: number;
  /** Total number of processes aggregated (leader + descendants). Always `>= 1`. */
  count: number;
  /**
   * Non-leader transitive descendants (BFS by ppid) aggregated into the totals.
   * Catches background jobs, subshells, pipelines, and grandchildren of the leader.
   * Double-fork daemons that reparent to init/launchd are not tracked.
   */
  children: IPtyChildStats[];
}
interface IPty extends AsyncDisposable {
  /** Process ID of the spawned process. */
  pid: number;
  /** Number of columns. */
  cols: number;
  /** Number of rows. */
  rows: number;
  /** Name of the current foreground process. */
  readonly process: string;
  /** Whether to intercept flow control characters. */
  handleFlowControl: boolean;
  /** Promise that resolves with the exit code when the process exits. */
  readonly exited: Promise<number>;
  /** The exit code, or null if still running. */
  readonly exitCode: number | null;
  /** Fires when data is received from the PTY. */
  onData: IEvent<string | Buffer>;
  /** Fires when the process exits. */
  onExit: IEvent<{
    exitCode: number;
    signal: number;
  }>;
  /** Write data to the PTY. */
  write(data: string): void;
  /** Resize the PTY. */
  resize(cols: number, rows: number, pixelSize?: {
    width: number;
    height: number;
  }): void;
  /** Clear the PTY buffer (no-op on Unix). */
  clear(): void;
  /** Kill the process. */
  kill(signal?: string): void;
  /** Pause reading from the PTY. */
  pause(): void;
  /** Resume reading from the PTY. */
  resume(): void;
  /** Close the PTY, closing file descriptors and cleaning up resources. */
  close(): void;
  /** Wait until the output contains the given string. Resolves with all output collected so far. */
  waitFor(pattern: string, options?: {
    timeout?: number;
  }): Promise<string>;
  /** Snapshot OS-level stats (cwd, memory, CPU time) aggregated across the leader process and every transitive descendant. Returns null when unavailable. */
  stats(): IPtyStats | null;
  /**
   * Attach a consumer to the PTY's output stream. The consumer's `feed`
   * receives every data chunk. Returns an `IDisposable` to detach early;
   * the consumer is also auto-detached when the PTY exits.
   */
  attach(consumer: IPtyConsumer): IDisposable;
}
interface IPtyOpenOptions {
  cols?: number;
  rows?: number;
  encoding?: BufferEncoding | null;
}
interface IOpenResult {
  master: number;
  slave: number;
  pty: string;
}
interface IPtyOptions {
  name?: string;
  cols?: number;
  rows?: number;
  cwd?: string;
  env?: Record<string, string>;
  encoding?: BufferEncoding | null;
  uid?: number;
  gid?: number;
  handleFlowControl?: boolean;
  flowControlPause?: string;
  flowControlResume?: string;
  /** Terminal options or an existing Terminal instance. When provided, data flows through terminal callbacks. */
  terminal?: TerminalOptions | Terminal;
  /** Called when the process exits (alternative to onExit event). */
  onExit?: (exitCode: number, signal: number) => void;
  /** Force pipe-based PTY fallback even when native bindings are available. */
  pipe?: boolean;
  /** Treat the command as an interactive shell (auto-enables `-i`, raw mode, stderr merge). Auto-detected for known shells (bash, zsh, sh, fish, etc.) when unset. */
  shell?: boolean;
}
export { IPtyConsumer as a, IPtyStats as c, hasNative as d, IPty as i, Terminal as l, IEvent as n, IPtyOpenOptions as o, IOpenResult as r, IPtyOptions as s, IDisposable as t, TerminalOptions as u };