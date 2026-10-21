import { createRequire } from "node:module";
import * as os from "node:os";
import { arch, platform } from "node:os";
import { fileURLToPath } from "node:url";
import * as fs from "node:fs";
import * as tty from "node:tty";
import { spawn as spawn$1 } from "node:child_process";
const isWindows = platform() === "win32";
const osPlatform = platform() === "android" ? "linux" : platform();
function loadNative() {
	try {
		const require = createRequire(import.meta.url);
		const base = `zigpty.${osPlatform}-${arch()}`;
		const resolve = (name) => fileURLToPath(new URL(`../prebuilds/${name}.node`, import.meta.url));
		if (isWindows) return require(resolve(base));
		try {
			return require(resolve(base));
		} catch {}
		return require(resolve(`${base}-musl`));
	} catch {
		return null;
	}
}
const native$1 = loadNative();
const hasNative = native$1 !== null;
var WriteQueue = class {
	_queue = [];
	_writing = false;
	_immediate = null;
	_closed = false;
	_fd;
	_onDrain;
	constructor(fd, onDrain) {
		this._fd = fd;
		this._onDrain = onDrain;
	}
	enqueue(data, encoding) {
		if (this._closed || this._fd < 0) return 0;
		const buf = typeof data === "string" ? Buffer.from(data, encoding || "utf8") : Buffer.from(data);
		this._queue.push({
			buffer: buf,
			offset: 0
		});
		this._process();
		return buf.length;
	}
	close() {
		this._closed = true;
		if (this._immediate) {
			clearImmediate(this._immediate);
			this._immediate = null;
		}
		this._queue.length = 0;
	}
	_process() {
		if (this._writing || this._queue.length === 0 || this._closed) return;
		this._writing = true;
		const task = this._queue[0];
		fs.write(this._fd, task.buffer, task.offset, (err, written) => {
			this._writing = false;
			if (this._closed) return;
			if (err) {
				if ("code" in err && err.code === "EAGAIN") {
					this._immediate = setImmediate(() => this._process());
					return;
				}
				this._queue.length = 0;
				return;
			}
			task.offset += written;
			if (task.offset >= task.buffer.length) this._queue.shift();
			if (this._queue.length === 0) this._onDrain?.();
			this._process();
		});
	}
};
const DEFAULT_COLS = 80;
const DEFAULT_ROWS = 24;
var Terminal = class {
	stdin;
	stdout;
	_closed = false;
	_cols;
	_rows;
	_name;
	_onData;
	_onExit;
	_onDrain;
	_textDecoder = new TextDecoder();
	_dataListeners = [];
	_readable;
	_wq;
	_winHandle;
	_winNative;
	_winReady = false;
	_winDeferred = [];
	_standalone;
	constructor(options) {
		this._cols = options?.cols ?? DEFAULT_COLS;
		this._rows = options?.rows ?? DEFAULT_ROWS;
		this._name = options?.name ?? "xterm-256color";
		this._onData = options?.data;
		this._onExit = options?.exit;
		this._onDrain = options?.drain;
		this._standalone = true;
		this.stdin = -1;
		this.stdout = -1;
		if (!isWindows) {
			const result = native$1.open(this._cols, this._rows);
			this.stdin = result.master;
			this.stdout = result.slave;
			this._setupUnixReader(this.stdin);
		}
	}
	get closed() {
		return this._closed;
	}
	write(data) {
		if (this._closed) return 0;
		if (isWindows) return this._writeWindows(data);
		return this._writeUnix(data);
	}
	resize(cols, rows) {
		if (this._closed) return;
		this._cols = cols;
		this._rows = rows;
		if (isWindows) {
			if (this._winHandle) {
				const doResize = () => this._winNative.resize(this._winHandle, cols, rows);
				if (this._winReady) doResize();
				else this._winDeferred.push(doResize);
			}
		} else if (this.stdin >= 0) native$1.resize(this.stdin, cols, rows);
	}
	ref() {
		this._readable?.ref();
	}
	unref() {
		this._readable?.unref();
	}
	close() {
		if (this._closed) return;
		this._closed = true;
		this._wq?.close();
		if (isWindows) {
			this._winDeferred.length = 0;
			if (this._winHandle) try {
				this._winNative.close(this._winHandle);
			} catch {}
		} else {
			this._destroyReader();
			if (this._standalone) {
				if (this.stdout >= 0) {
					try {
						fs.closeSync(this.stdout);
					} catch {}
					this.stdout = -1;
				}
				if (this.stdin >= 0) try {
					fs.closeSync(this.stdin);
				} catch {}
			}
			this.stdin = -1;
		}
		this._dataListeners.length = 0;
		this._onExit?.(this, 0, null);
	}
	[Symbol.dispose]() {
		this.close();
	}
	_attachUnixFd(fd) {
		this._standalone = false;
		this._destroyReader();
		if (this.stdout >= 0) {
			try {
				fs.closeSync(this.stdout);
			} catch {}
			this.stdout = -1;
		}
		if (this.stdin >= 0) try {
			fs.closeSync(this.stdin);
		} catch {}
		this.stdin = fd;
		this._setupUnixReader(fd);
	}
	_attachWindows(winNative, handle) {
		this._winNative = winNative;
		this._winHandle = handle;
		this._standalone = false;
	}
	_markReady() {
		this._winReady = true;
		for (const fn of this._winDeferred) fn();
		this._winDeferred.length = 0;
	}
	_emitData(data) {
		this._onData?.(this, data);
		if (this._dataListeners.length > 0) {
			const text = this._textDecoder.decode(data);
			for (const listener of this._dataListeners) listener(text);
		}
	}
	_destroyReader() {
		try {
			this._readable?.destroy();
		} catch {}
		this._readable = void 0;
	}
	_setupUnixReader(fd) {
		this._readable = new tty.ReadStream(fd);
		this._readable.on("data", (chunk) => {
			this._emitData(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
		});
		this._readable.on("error", () => {});
		this._wq = new WriteQueue(fd, () => this._onDrain?.(this));
	}
	_writeUnix(data) {
		return this._wq?.enqueue(data) ?? 0;
	}
	_writeWindows(data) {
		if (!this._winHandle) return 0;
		const str = typeof data === "string" ? data : this._textDecoder.decode(data);
		const len = typeof data === "string" ? Buffer.byteLength(data) : data.byteLength;
		const doWrite = () => this._winNative.write(this._winHandle, str);
		if (this._winReady) doWrite();
		else this._winDeferred.push(doWrite);
		return len;
	}
};
var BasePty = class {
	pid;
	cols;
	rows;
	handleFlowControl;
	_dataListeners = [];
	_exitListeners = [];
	_resizeListeners = [];
	_closed = false;
	_exitCode = null;
	_resolveExited;
	_exited;
	_terminal;
	_onExitCallback;
	constructor(cols, rows, options) {
		this.cols = cols;
		this.rows = rows;
		this.handleFlowControl = options?.handleFlowControl ?? false;
		this._onExitCallback = options?.onExit;
		this._exited = new Promise((resolve) => {
			this._resolveExited = resolve;
		});
		if (options?.terminal) this._terminal = options.terminal instanceof Terminal ? options.terminal : new Terminal(options.terminal);
	}
	get exited() {
		return this._exited;
	}
	get exitCode() {
		return this._exitCode;
	}
	get onData() {
		return (listener) => {
			this._dataListeners.push(listener);
			return { dispose: () => {
				const idx = this._dataListeners.indexOf(listener);
				if (idx >= 0) this._dataListeners.splice(idx, 1);
			} };
		};
	}
	get onExit() {
		return (listener) => {
			this._exitListeners.push(listener);
			return { dispose: () => {
				const idx = this._exitListeners.indexOf(listener);
				if (idx >= 0) this._exitListeners.splice(idx, 1);
			} };
		};
	}
	attach(consumer) {
		consumer.onAttach?.(this);
		const feed = (data) => {
			try {
				consumer.feed(data);
			} catch {}
		};
		let resizeListener;
		if (consumer.onResize) {
			resizeListener = consumer.onResize.bind(consumer);
			this._resizeListeners.push(resizeListener);
		}
		let dataSub;
		let terminalListener;
		if (this._terminal) {
			terminalListener = feed;
			this._terminal._dataListeners.push(terminalListener);
		} else dataSub = this.onData(feed);
		let detached = false;
		const detach = () => {
			if (detached) return;
			detached = true;
			dataSub?.dispose();
			if (resizeListener) {
				const idx = this._resizeListeners.indexOf(resizeListener);
				if (idx >= 0) this._resizeListeners.splice(idx, 1);
			}
			if (terminalListener) {
				const listeners = this._terminal?._dataListeners;
				if (listeners) {
					const idx = listeners.indexOf(terminalListener);
					if (idx >= 0) listeners.splice(idx, 1);
				}
			}
			exitSub.dispose();
			try {
				consumer.onDetach?.(this);
			} catch {}
		};
		const exitSub = this.onExit(detach);
		return { dispose: detach };
	}
	waitFor(pattern, options) {
		const timeout = options?.timeout ?? 3e4;
		const terminal = this._terminal;
		const pty = this;
		return new Promise((resolve, reject) => {
			let collected = "";
			let cleaned = false;
			const cleanup = () => {
				if (cleaned) return;
				cleaned = true;
				clearTimeout(timer);
				disposable?.dispose();
				if (terminalListener) {
					const listeners = terminal?._dataListeners;
					if (listeners) {
						const idx = listeners.indexOf(terminalListener);
						if (idx >= 0) listeners.splice(idx, 1);
					}
				}
			};
			const timer = setTimeout(() => {
				cleanup();
				reject(/* @__PURE__ */ new Error(`waitFor("${pattern}") timed out after ${timeout}ms`));
			}, timeout);
			let disposable;
			let terminalListener;
			const onChunk = (text) => {
				if (cleaned) return;
				collected += text;
				if (collected.includes(pattern)) {
					cleanup();
					resolve(collected);
				}
			};
			if (terminal) {
				terminalListener = onChunk;
				terminal._dataListeners.push(terminalListener);
			} else disposable = pty.onData((data) => {
				onChunk(typeof data === "string" ? data : data.toString());
			});
		});
	}
	async [Symbol.asyncDispose]() {
		this.close();
		await this._exited;
	}
	_notifyResize(cols, rows) {
		for (const listener of this._resizeListeners) try {
			listener(cols, rows);
		} catch {}
	}
	_handleExit(info) {
		this._closed = true;
		this._exitCode = info.exitCode;
		this._onExitCallback?.(info.exitCode, info.signal);
		const listeners = [...this._exitListeners];
		this._dataListeners.length = 0;
		this._exitListeners.length = 0;
		for (const listener of listeners) listener(info);
		this._resolveExited(info.exitCode);
	}
};
function buildEnvPairs(env, termName, sanitizeKeys) {
	const pairs = [];
	const envCopy = { ...env };
	if (termName && !envCopy.TERM) envCopy.TERM = termName;
	if (sanitizeKeys) for (const key of sanitizeKeys) delete envCopy[key];
	for (const [key, value] of Object.entries(envCopy)) if (value !== void 0) pairs.push(`${key}=${value}`);
	return pairs;
}
const native = native$1;
const DEFAULT_FLOW_PAUSE = "";
const DEFAULT_FLOW_RESUME = "";
const UNIX_SANITIZE_KEYS = [
	"TMUX",
	"TMUX_PANE",
	"STY",
	"WINDOW",
	"WINDOWID",
	"TERMCAP",
	"COLUMNS",
	"LINES"
];
var UnixPty = class extends BasePty {
	_fd;
	_pty;
	_readable;
	_encoding;
	_flowControlPause;
	_flowControlResume;
	_wq;
	constructor(file, args, options) {
		const cols = options?.cols ?? 80;
		const rows = options?.rows ?? 24;
		super(cols, rows, options);
		const cwd = options?.cwd ?? process.cwd();
		const encoding = options?.encoding !== void 0 ? options.encoding : "utf8";
		const uid = options?.uid ?? -1;
		const gid = options?.gid ?? -1;
		const useUtf8 = encoding === "utf8";
		const envPairs = buildEnvPairs(options?.env ?? process.env, options?.name, UNIX_SANITIZE_KEYS);
		const result = native.fork(file, args, envPairs, cwd, cols, rows, uid, gid, useUtf8, (info) => {
			this._handleExit(info);
			try {
				this._readable?.destroy();
			} catch {}
		});
		this.pid = result.pid;
		this._fd = result.fd;
		this._pty = result.pty;
		this._encoding = encoding;
		this._flowControlPause = options?.flowControlPause ?? DEFAULT_FLOW_PAUSE;
		this._flowControlResume = options?.flowControlResume ?? DEFAULT_FLOW_RESUME;
		this._wq = new WriteQueue(this._fd);
		if (this._terminal) {
			this._terminal._attachUnixFd(this._fd);
			this._readable = void 0;
		} else {
			this._readable = new tty.ReadStream(this._fd);
			if (encoding) this._readable.setEncoding(encoding);
			this._readable.on("data", (data) => {
				if (this.handleFlowControl && typeof data === "string") {
					if (data === this._flowControlPause || data === this._flowControlResume) return;
				}
				for (const listener of this._dataListeners) listener(data);
			});
			this._readable.on("error", () => {});
		}
	}
	get process() {
		try {
			return native.process(this._fd) ?? "";
		} catch {
			return "";
		}
	}
	stats() {
		if (this._closed) return null;
		try {
			return native.stats(this.pid) ?? null;
		} catch {
			return null;
		}
	}
	write(data) {
		if (this._closed) return;
		this._wq.enqueue(data, this._encoding);
	}
	resize(cols, rows, pixelSize) {
		if (this._closed) return;
		this.cols = cols;
		this.rows = rows;
		native.resize(this._fd, cols, rows, pixelSize?.width ?? 0, pixelSize?.height ?? 0);
		this._notifyResize(cols, rows);
	}
	clear() {}
	kill(signal) {
		if (this._closed) return;
		const sig = signalNumber(signal ?? "SIGHUP");
		try {
			process.kill(this.pid, sig);
		} catch {}
	}
	pause() {
		this._readable?.pause();
	}
	resume() {
		this._readable?.resume();
	}
	close() {
		if (this._closed) return;
		this._closed = true;
		this._wq.close();
		try {
			this._readable?.destroy();
		} catch {}
		try {
			fs.closeSync(this._fd);
		} catch {}
		try {
			process.kill(this.pid, 0);
			process.kill(this.pid, "SIGHUP");
		} catch {}
	}
};
function signalNumber(signal) {
	return {
		SIGHUP: 1,
		SIGINT: 2,
		SIGQUIT: 3,
		SIGTERM: 15,
		SIGKILL: 9,
		SIGUSR1: 10,
		SIGUSR2: 12
	}[signal] ?? os.constants.signals[signal] ?? 1;
}
var WindowsPty = class extends BasePty {
	_handle;
	_native;
	_file;
	_encoding;
	_deferredCalls = [];
	_ready = false;
	constructor(native, file, args, options) {
		const cols = options?.cols ?? 80;
		const rows = options?.rows ?? 24;
		super(cols, rows, options);
		this._native = native;
		this._file = file;
		this._encoding = options?.encoding !== void 0 ? options.encoding : "utf8";
		const cwd = options?.cwd ?? process.cwd();
		const envPairs = buildEnvPairs(options?.env ?? process.env, options?.name);
		const result = native.spawn(file, args, envPairs, cwd, cols, rows, (data) => {
			if (!this._ready) {
				this._ready = true;
				if (this._closed) return;
				if (this._terminal) this._terminal._markReady();
				const deferred = [...this._deferredCalls];
				this._deferredCalls.length = 0;
				for (const fn of deferred) fn();
			}
			if (this._closed) return;
			if (this._terminal) this._terminal._emitData(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
			const output = this._encoding ? data.toString(this._encoding) : data;
			for (const listener of this._dataListeners) listener(output);
		}, (info) => {
			this._handleExit(info);
		});
		this.pid = result.pid;
		this._handle = result.handle;
		if (this._terminal) this._terminal._attachWindows(native, result.handle);
	}
	get process() {
		return this._file;
	}
	stats() {
		if (this._closed) return null;
		try {
			return this._native.stats(this._handle) ?? null;
		} catch {
			return null;
		}
	}
	write(data) {
		if (this._closed) return;
		const doWrite = () => this._native.write(this._handle, data);
		if (this._ready) doWrite();
		else this._deferredCalls.push(doWrite);
	}
	resize(cols, rows) {
		if (this._closed) return;
		this.cols = cols;
		this.rows = rows;
		const doResize = () => {
			this._native.resize(this._handle, cols, rows);
			this._notifyResize(cols, rows);
		};
		if (this._ready) doResize();
		else this._deferredCalls.push(doResize);
	}
	clear() {}
	kill() {
		if (this._closed) return;
		this._native.kill(this._handle);
	}
	pause() {}
	resume() {}
	close() {
		if (this._closed) return;
		this._closed = true;
		this._deferredCalls.length = 0;
		try {
			this._native.kill(this._handle);
		} catch {}
	}
};
const SIGNAL_CHARS = {
	3: "SIGINT",
	28: "SIGQUIT"
};
const EOF_CHAR = 4;
const XOFF = 19;
const XON = 17;
const CHAR_BACKSPACE = 127;
const CHAR_DEL = 8;
const CHAR_WORD_ERASE = 23;
const CHAR_LINE_KILL = 21;
const CHAR_REPRINT = 18;
const CHAR_CR = 13;
const CHAR_LF = 10;
const KNOWN_SHELLS = /\b(?:bash|zsh|sh|fish|ash|dash|ksh)$/;
const SHELLS_WITH_PIPE_ECHO = /\b(?:bash|sh|ash|dash|ksh)$/;
var PipePty = class extends BasePty {
	_child;
	_file;
	_encoding;
	_paused = false;
	_canonicalMode = true;
	_echoEnabled = true;
	_lineBuffer = "";
	_shellWarningFilter = false;
	constructor(file, args, options) {
		const cols = options?.cols ?? 80;
		const rows = options?.rows ?? 24;
		super(cols, rows, options);
		this._file = file;
		this._encoding = options?.encoding !== void 0 ? options.encoding : "utf8";
		const cwd = options?.cwd ?? process.cwd();
		const envObj = options?.env ?? process.env;
		const isShell = options?.shell ?? KNOWN_SHELLS.test(file);
		const env = {};
		const termName = options?.name ?? "xterm-256color";
		for (const [key, value] of Object.entries(envObj)) if (value !== void 0) env[key] = value;
		if (!env.TERM) env.TERM = termName;
		env.COLUMNS = String(cols);
		env.LINES = String(rows);
		if (!env.FORCE_COLOR) env.FORCE_COLOR = "1";
		if (!env.COLORTERM) env.COLORTERM = "truecolor";
		const isWebContainer = !!globalThis?.process?.versions?.webcontainer || env.SHELL?.includes("jsh");
		const shellInteractive = isShell && !args.includes("-c") && !isWebContainer;
		const spawnOpts = {
			cwd,
			env,
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			],
			...isShell && !isWebContainer && { detached: true }
		};
		if (options?.uid !== void 0) spawnOpts.uid = options.uid;
		if (options?.gid !== void 0) spawnOpts.gid = options.gid;
		const selfEcho = SHELLS_WITH_PIPE_ECHO.test(file);
		if (shellInteractive && selfEcho) {
			this._child = spawn$1("sh", ["-c", `trap '' TTOU TTIN; exec ${file} ${[...args, "-i"].map((a) => `'${a.replace(/'/g, "'\\''")}'`).join(" ")} 2>&1`], spawnOpts);
			this._shellWarningFilter = true;
			this._canonicalMode = false;
			this._echoEnabled = false;
			this._flushLineBuffer();
		} else this._child = spawn$1(file, shellInteractive ? [...args, "-i"] : args, spawnOpts);
		this.pid = this._child.pid ?? -1;
		this._child.stdout?.on("data", (chunk) => {
			this._emitData(chunk);
		});
		this._child.stderr?.on("data", (chunk) => {
			this._emitData(chunk);
		});
		this._child.stdin?.on("error", () => {});
		this._child.stdout?.on("error", () => {});
		this._child.stderr?.on("error", () => {});
		this._child.on("exit", (code, signal) => {
			const exitCode = code ?? -1;
			const sigNum = signal ? os.constants.signals[signal] ?? 0 : 0;
			this._handleExit({
				exitCode,
				signal: sigNum
			});
		});
		this._child.on("error", () => {
			if (!this._closed) this._handleExit({
				exitCode: -1,
				signal: 0
			});
		});
	}
	setRawMode() {
		this._canonicalMode = false;
		this._echoEnabled = false;
		this._flushLineBuffer();
	}
	setCanonicalMode() {
		this._canonicalMode = true;
		this._echoEnabled = true;
	}
	get process() {
		return this._file;
	}
	stats() {
		if (this._closed || this.pid <= 0) return null;
		if (os.platform() !== "linux") return null;
		return readLinuxStats(this.pid);
	}
	write(data) {
		if (this._closed) return;
		const bytes = Buffer.from(data, this._encoding || "utf8");
		for (let i = 0; i < bytes.length; i++) {
			const byte = bytes[i];
			if (this.handleFlowControl) {
				if (byte === XOFF) {
					this.pause();
					continue;
				}
				if (byte === XON) {
					this.resume();
					continue;
				}
			}
			const sig = SIGNAL_CHARS[byte];
			if (sig) {
				this._flushLineBuffer();
				try {
					this._child.kill(sig);
				} catch {}
				continue;
			}
			if (byte === EOF_CHAR) {
				if (this._canonicalMode && this._lineBuffer.length > 0) {
					this._writeToChild(this._lineBuffer);
					this._lineBuffer = "";
				} else try {
					this._child.stdin?.end();
				} catch {}
				continue;
			}
			if (this._canonicalMode) {
				this._handleCanonicalByte(byte);
				continue;
			}
			const outByte = byte === CHAR_CR ? CHAR_LF : byte;
			const ch = String.fromCharCode(outByte);
			if (this._echoEnabled) if (outByte === CHAR_LF) this._echoText("\r\n");
			else this._echoText(ch);
			this._writeToChild(ch);
		}
	}
	resize(cols, rows) {
		if (this._closed) return;
		this.cols = cols;
		this.rows = rows;
		if (this.pid > 0) try {
			process.kill(this.pid, "SIGWINCH");
		} catch {}
		this._notifyResize(cols, rows);
	}
	clear() {}
	kill(signal) {
		if (this._closed) return;
		const sig = signal ?? "SIGHUP";
		try {
			this._child.kill(sig);
		} catch {}
	}
	pause() {
		this._paused = true;
		this._child.stdout?.pause();
		this._child.stderr?.pause();
	}
	resume() {
		this._paused = false;
		this._child.stdout?.resume();
		this._child.stderr?.resume();
	}
	close() {
		if (this._closed) return;
		try {
			this._child.kill("SIGHUP");
		} catch {}
		try {
			this._child.stdin?.destroy();
		} catch {}
		try {
			this._child.stdout?.destroy();
		} catch {}
		try {
			this._child.stderr?.destroy();
		} catch {}
		this._closed = true;
	}
	_handleCanonicalByte(byte) {
		if (byte === CHAR_BACKSPACE || byte === CHAR_DEL) {
			if (this._lineBuffer.length > 0) {
				this._lineBuffer = this._lineBuffer.slice(0, -1);
				if (this._echoEnabled) this._echoText("\b \b");
			}
			return;
		}
		if (byte === CHAR_WORD_ERASE) {
			const before = this._lineBuffer;
			let trimmed = before.replace(/\s+$/, "");
			const lastSpace = trimmed.lastIndexOf(" ");
			trimmed = lastSpace >= 0 ? trimmed.slice(0, lastSpace + 1) : "";
			const erased = before.length - trimmed.length;
			this._lineBuffer = trimmed;
			if (this._echoEnabled && erased > 0) this._echoText("\b \b".repeat(erased));
			return;
		}
		if (byte === CHAR_LINE_KILL) {
			const len = this._lineBuffer.length;
			this._lineBuffer = "";
			if (this._echoEnabled && len > 0) this._echoText("\b \b".repeat(len));
			return;
		}
		if (byte === CHAR_REPRINT) {
			if (this._echoEnabled && this._lineBuffer.length > 0) this._echoText("\r\n" + this._lineBuffer);
			return;
		}
		if (byte === CHAR_CR || byte === CHAR_LF) {
			if (this._echoEnabled) this._echoText("\r\n");
			this._writeToChild(this._lineBuffer + "\n");
			this._lineBuffer = "";
			return;
		}
		const ch = String.fromCharCode(byte);
		this._lineBuffer += ch;
		if (this._echoEnabled) this._echoText(ch);
	}
	_echoText(text) {
		const buf = Buffer.from(text, "utf8");
		this._emitData(buf);
	}
	_flushLineBuffer() {
		if (this._lineBuffer.length > 0) {
			this._writeToChild(this._lineBuffer + "\n");
			this._lineBuffer = "";
		}
	}
	_writeToChild(data) {
		if (this._child.stdin?.writable) this._child.stdin.write(data, this._encoding || "utf8");
	}
	_emitData(chunk) {
		if (this._paused) return;
		if (this._shellWarningFilter) {
			const str = chunk.toString("utf8");
			const filtered = str.replace(/^bash: cannot set terminal process group \(\d+\): Inappropriate ioctl for device\n?/m, "").replace(/^bash: no job control in this shell\n?/m, "").replace(/^.*: cannot set terminal process group.*\n?/m, "").replace(/^.*: no job control in this shell\n?/m, "");
			if (filtered !== str) {
				if (filtered.length === 0) return;
				chunk = Buffer.from(filtered, "utf8");
			}
			if (filtered.length > 0) this._shellWarningFilter = false;
		}
		if (this._terminal) this._terminal._emitData(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
		const output = this._encoding ? chunk.toString(this._encoding) : chunk;
		for (const listener of this._dataListeners) listener(output);
	}
};
const CLK_TCK = 100;
let _pageSize = null;
function getPageSize() {
	if (_pageSize !== null) return _pageSize;
	try {
		const auxv = fs.readFileSync("/proc/self/auxv");
		const is64 = [
			"arm64",
			"x64",
			"ppc64",
			"s390x",
			"mips64el",
			"riscv64",
			"loong64"
		].includes(process.arch);
		const isLE = os.endianness() === "LE";
		const wordSize = is64 ? 8 : 4;
		const AT_PAGESZ = 6;
		const AT_NULL = 0;
		const readWord = (off) => {
			if (is64) {
				const big = isLE ? auxv.readBigUInt64LE(off) : auxv.readBigUInt64BE(off);
				return Number(big);
			}
			return isLE ? auxv.readUInt32LE(off) : auxv.readUInt32BE(off);
		};
		for (let i = 0; i + wordSize * 2 <= auxv.length; i += wordSize * 2) {
			const key = readWord(i);
			if (key === AT_NULL) break;
			if (key === AT_PAGESZ) {
				_pageSize = readWord(i + wordSize);
				return _pageSize;
			}
		}
	} catch {}
	_pageSize = 4096;
	return _pageSize;
}
function parseProcStat(raw) {
	const firstParen = raw.indexOf("(");
	const lastParen = raw.lastIndexOf(")");
	if (firstParen < 0 || lastParen < 0 || lastParen <= firstParen || lastParen + 2 >= raw.length) return null;
	const comm = raw.slice(firstParen + 1, lastParen);
	const fields = raw.slice(lastParen + 2).split(" ");
	const ppid = Number(fields[1] ?? 0);
	if (!Number.isFinite(ppid)) return null;
	return {
		comm,
		ppid,
		utimeTicks: Number(fields[11] ?? 0),
		stimeTicks: Number(fields[12] ?? 0),
		rssPages: Number(fields[21] ?? 0)
	};
}
function readLinuxStats(pid) {
	const pageSize = getPageSize();
	let leaderCwd = null;
	try {
		leaderCwd = fs.readlinkSync(`/proc/${pid}/cwd`);
	} catch {}
	let procDir;
	try {
		procDir = fs.readdirSync("/proc");
	} catch {
		return null;
	}
	const rows = /* @__PURE__ */ new Map();
	for (const entry of procDir) {
		const entryPid = Number(entry);
		if (!Number.isInteger(entryPid) || entryPid <= 0) continue;
		let raw;
		try {
			raw = fs.readFileSync(`/proc/${entryPid}/stat`, "utf8");
		} catch {
			continue;
		}
		const row = parseProcStat(raw);
		if (!row) continue;
		rows.set(entryPid, row);
	}
	if (!rows.has(pid)) return null;
	const byParent = /* @__PURE__ */ new Map();
	for (const [childPid, row] of rows) {
		const bucket = byParent.get(row.ppid);
		if (bucket) bucket.push(childPid);
		else byParent.set(row.ppid, [childPid]);
	}
	const marked = /* @__PURE__ */ new Set();
	const queue = [pid];
	marked.add(pid);
	while (queue.length > 0) {
		const parent = queue.shift();
		const kids = byParent.get(parent);
		if (!kids) continue;
		for (const kid of kids) {
			if (marked.has(kid)) continue;
			marked.add(kid);
			queue.push(kid);
		}
	}
	let totalRss = 0;
	let totalUser = 0;
	let totalSys = 0;
	let count = 0;
	const children = [];
	for (const markedPid of marked) {
		const row = rows.get(markedPid);
		if (!row) continue;
		const rssBytes = row.rssPages * pageSize;
		const cpuUser = Math.floor(row.utimeTicks * 1e6 / CLK_TCK);
		const cpuSys = Math.floor(row.stimeTicks * 1e6 / CLK_TCK);
		totalRss += rssBytes;
		totalUser += cpuUser;
		totalSys += cpuSys;
		count += 1;
		if (markedPid !== pid) children.push({
			pid: markedPid,
			name: row.comm.slice(0, 31),
			rssBytes,
			cpuUser,
			cpuSys
		});
	}
	if (count === 0) return null;
	return {
		pid,
		cwd: leaderCwd,
		rssBytes: totalRss,
		cpuUser: totalUser,
		cpuSys: totalSys,
		count,
		children
	};
}
function spawn(file, args = [], options) {
	const shell = file ?? defaultShell();
	if (!hasNative || options?.pipe) return new PipePty(shell, args, options);
	if (isWindows) return new WindowsPty(native$1, shell, args, options);
	return new UnixPty(shell, args, options);
}
function defaultShell() {
	if (isWindows) return process.env.COMSPEC || "powershell.exe";
	return process.env.SHELL || "/bin/sh";
}
function open(options) {
	if (!hasNative) throw new Error("open() requires native PTY bindings (not available in pipe fallback mode)");
	if (isWindows) throw new Error("open() is not supported on Windows");
	return native$1.open(options?.cols ?? 80, options?.rows ?? 24);
}
export { PipePty, Terminal, hasNative, open, spawn };
