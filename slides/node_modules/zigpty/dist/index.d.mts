import { a as IPtyConsumer, c as IPtyStats, d as hasNative, i as IPty, l as Terminal, n as IEvent, o as IPtyOpenOptions, r as IOpenResult, s as IPtyOptions, t as IDisposable, u as TerminalOptions } from "./_chunks/types.mjs";
declare abstract class BasePty implements IPty {
  pid: number;
  cols: number;
  rows: number;
  handleFlowControl: boolean;
  protected _dataListeners: Array<(data: string | Buffer) => void>;
  protected _exitListeners: Array<(info: {
    exitCode: number;
    signal: number;
  }) => void>;
  protected _resizeListeners: Array<(cols: number, rows: number) => void>;
  protected _closed: boolean;
  protected _exitCode: number | null;
  protected _resolveExited: (code: number) => void;
  protected _exited: Promise<number>;
  protected _terminal?: Terminal;
  protected _onExitCallback?: (exitCode: number, signal: number) => void;
  constructor(cols: number, rows: number, options?: IPtyOptions);
  get exited(): Promise<number>;
  get exitCode(): number | null;
  get onData(): IEvent<string | Buffer>;
  get onExit(): IEvent<{
    exitCode: number;
    signal: number;
  }>;
  attach(consumer: IPtyConsumer): IDisposable;
  waitFor(pattern: string, options?: {
    timeout?: number;
  }): Promise<string>;
  [Symbol.asyncDispose](): Promise<void>;
  /** Notify attached consumers of a resize. Call from each platform's `resize`. */
  protected _notifyResize(cols: number, rows: number): void;
  protected _handleExit(info: {
    exitCode: number;
    signal: number;
  }): void;
  abstract get process(): string;
  abstract write(data: string): void;
  abstract resize(cols: number, rows: number, pixelSize?: {
    width: number;
    height: number;
  }): void;
  abstract clear(): void;
  abstract kill(signal?: string): void;
  abstract pause(): void;
  abstract resume(): void;
  abstract close(): void;
  abstract stats(): IPtyStats | null;
}
declare class PipePty extends BasePty {
  private _child;
  private _file;
  private _encoding;
  private _paused;
  private _canonicalMode;
  private _echoEnabled;
  private _lineBuffer;
  private _shellWarningFilter;
  constructor(file: string, args: string[], options?: IPtyOptions);
  /** Switch to raw mode (no echo, no line buffering, pass-through). */
  setRawMode(): void;
  /** Switch to canonical (cooked) mode with echo. */
  setCanonicalMode(): void;
  get process(): string;
  stats(): IPtyStats | null;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  clear(): void;
  kill(signal?: string): void;
  pause(): void;
  resume(): void;
  close(): void;
  private _handleCanonicalByte;
  /** Echo text back to the data stream (simulates terminal echo). */
  private _echoText;
  /** Flush any pending line buffer to the child's stdin. */
  private _flushLineBuffer;
  /** Write a string to the child's stdin. */
  private _writeToChild;
  private _emitData;
}
declare function spawn(file?: string, args?: string[], options?: IPtyOptions): IPty;
declare function open(options?: IPtyOpenOptions): IOpenResult;
export { type IDisposable, type IEvent, type IOpenResult, type IPty, type IPtyConsumer, type IPtyOpenOptions, type IPtyOptions, PipePty, Terminal, type TerminalOptions, hasNative, open, spawn };