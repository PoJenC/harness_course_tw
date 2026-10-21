import { Buffer } from "node:buffer";
const Ground = 0;
const Esc = 1;
const Csi = 2;
const Osc = 3;
const OscSt = 4;
var IdleDetector = class {
	_state = "idle";
	_bytesPending = 0;
	_stateStart;
	_attachAt;
	_lastSigTime;
	_idleTimer = null;
	_escState = Ground;
	_suppressUntil = 0;
	_listeners = [];
	_quietMs;
	_activeThreshold;
	_graceMs;
	_redrawGraceMs;
	constructor(listener, options = {}) {
		this._quietMs = options.quietMs ?? 750;
		this._activeThreshold = options.activeThreshold ?? 512;
		this._graceMs = options.graceMs ?? 1500;
		this._redrawGraceMs = options.redrawGraceMs ?? 500;
		const now = Date.now();
		this._stateStart = now;
		this._attachAt = now;
		this._lastSigTime = now;
		if (listener) this._listeners.push(listener);
	}
	on(listener) {
		this._listeners.push(listener);
		return () => {
			const idx = this._listeners.indexOf(listener);
			if (idx >= 0) this._listeners.splice(idx, 1);
		};
	}
	get state() {
		return this._state;
	}
	onAttach(_pty) {
		const now = Date.now();
		this._attachAt = now;
		this._stateStart = now;
		this._lastSigTime = now;
	}
	onDetach(_pty) {
		this.dispose();
	}
	onResize(_cols, _rows) {
		this.suppress();
	}
	suppress(durationMs = this._redrawGraceMs) {
		this._suppressUntil = Date.now() + durationMs;
	}
	feed(data) {
		const buf = typeof data === "string" ? Buffer.from(data, "utf8") : Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
		const sig = this._countSignificant(buf);
		if (sig === 0) return;
		const now = Date.now();
		if (now < this._suppressUntil) {
			this._lastSigTime = now;
			return;
		}
		if (this._state === "idle") {
			if (now - this._attachAt < this._graceMs) {
				this._lastSigTime = now;
				return;
			}
			if (now - this._lastSigTime > this._quietMs) this._bytesPending = 0;
			this._lastSigTime = now;
			this._bytesPending += sig;
			if (this._bytesPending >= this._activeThreshold) {
				const prevBytes = this._bytesPending;
				const prevDuration = now - this._stateStart;
				this._state = "active";
				this._stateStart = now;
				this._emit({
					type: "active",
					bytes: prevBytes,
					durationMs: prevDuration
				});
				this._scheduleIdle();
			}
		} else {
			this._lastSigTime = now;
			this._bytesPending += sig;
			this._scheduleIdle();
		}
	}
	dispose() {
		if (this._idleTimer) {
			clearTimeout(this._idleTimer);
			this._idleTimer = null;
		}
		this._listeners.length = 0;
		this._state = "idle";
		this._bytesPending = 0;
		this._escState = Ground;
		this._suppressUntil = 0;
	}
	_scheduleIdle() {
		if (this._idleTimer) clearTimeout(this._idleTimer);
		const timer = setTimeout(() => {
			this._idleTimer = null;
			const now = Date.now();
			const prevBytes = this._bytesPending;
			const prevDuration = now - this._stateStart;
			this._state = "idle";
			this._bytesPending = 0;
			this._stateStart = now;
			this._emit({
				type: "idle",
				bytes: prevBytes,
				durationMs: prevDuration
			});
		}, this._quietMs);
		if (typeof timer.unref === "function") timer.unref();
		this._idleTimer = timer;
	}
	_countSignificant(buf) {
		let count = 0;
		for (let i = 0; i < buf.length; i++) {
			const b = buf[i];
			switch (this._escState) {
				case Ground:
					if (b === 27) this._escState = Esc;
					else if (b === 10 || b === 9) count++;
					else if (b >= 32 && b !== 127) count++;
					break;
				case Esc:
					if (b === 91) this._escState = Csi;
					else if (b === 93) this._escState = Osc;
					else this._escState = Ground;
					break;
				case Csi:
					if (b >= 64 && b <= 126) this._escState = Ground;
					break;
				case Osc:
					if (b === 7) this._escState = Ground;
					else if (b === 27) this._escState = OscSt;
					break;
				case OscSt:
					if (b === 92) this._escState = Ground;
					else if (b === 27) this._escState = Esc;
					else this._escState = Ground;
					break;
			}
		}
		return count;
	}
	_emit(event) {
		for (const l of this._listeners) try {
			l(event);
		} catch {}
	}
};
export { IdleDetector };
