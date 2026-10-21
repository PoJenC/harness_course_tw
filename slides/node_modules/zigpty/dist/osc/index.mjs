import { Buffer } from "node:buffer";
function stripControls(s) {
	return s.replace(/[\x00-\x1f\x7f]/g, "");
}
function safeBase64Decode(s) {
	try {
		return Buffer.from(s, "base64").toString("utf8");
	} catch {
		return s;
	}
}
function unquote(s) {
	if (s.length >= 2 && s[0] === "\"" && s[s.length - 1] === "\"") return s.slice(1, -1);
	return s;
}
const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;
function vscodeUnescape(s) {
	let out = "";
	let i = 0;
	while (i < s.length) {
		if (s.charCodeAt(i) === 92 && i + 1 < s.length) {
			const n = s.charCodeAt(i + 1);
			if (n === 92) {
				out += "\\";
				i += 2;
				continue;
			}
			if (n === 120 && i + 3 < s.length) {
				const hex = s.slice(i + 2, i + 4);
				if (/^[0-9a-fA-F]{2}$/.test(hex)) {
					out += String.fromCharCode(Number.parseInt(hex, 16));
					i += 4;
					continue;
				}
			}
		}
		out += s[i];
		i++;
	}
	return out;
}
const titleDecoder = (payload, event) => ({
	kind: "title",
	code: event.code,
	title: stripControls(payload)
});
const cwdDecoder = (payload) => {
	const m = /^([a-zA-Z][a-zA-Z0-9+.\-]*):\/\/([^/]*)(\/.*)?$/.exec(payload);
	if (m) {
		const scheme = m[1];
		const host = m[2] || void 0;
		const rawPath = m[3] ?? "";
		let path;
		try {
			path = decodeURIComponent(rawPath);
		} catch {
			path = rawPath;
		}
		return {
			kind: "cwd",
			source: "osc7",
			uri: payload,
			scheme,
			host,
			path,
			local: !host || host === "localhost"
		};
	}
	return {
		kind: "cwd",
		source: "osc7",
		uri: payload,
		path: payload
	};
};
const shellIntegrationDecoder = (vendor) => (payload) => {
	const semi = payload.indexOf(";");
	const command = semi >= 0 ? payload.slice(0, semi) : payload;
	const data = semi >= 0 ? payload.slice(semi + 1) : "";
	const out = {
		kind: "shellIntegration",
		vendor,
		command,
		data
	};
	if (vendor === "vt") {
		if (command === "D" && data) {
			const parts = data.split(";");
			const head = parts[0];
			if (/^\d+$/.test(head)) out.exitCode = Number(head);
			for (const p of parts) if (p.startsWith("err=")) out.err = p.slice(4);
		}
		if ((command === "A" || command === "C") && data) {
			const params = {};
			for (const p of data.split(";")) {
				const eq = p.indexOf("=");
				if (eq >= 0) params[p.slice(0, eq)] = p.slice(eq + 1);
			}
			if (Object.keys(params).length > 0) out.params = params;
		}
		return out;
	}
	if (command === "D" && data) {
		if (/^\d+$/.test(data)) out.exitCode = Number(data);
	} else if (command === "P") {
		const eq = data.indexOf("=");
		if (eq >= 0) {
			out.key = data.slice(0, eq);
			out.value = vscodeUnescape(data.slice(eq + 1));
		}
	} else if (command === "E") {
		const parts = data.split(";");
		out.commandLine = vscodeUnescape(parts[0] ?? "");
		if (parts.length > 1) out.nonce = parts[parts.length - 1];
	} else if (command === "EnvSingleStart") {
		const parts = data.split(";");
		if (parts[0] && /^\d+$/.test(parts[0])) out.index = Number(parts[0]);
		if (parts[1]) out.nonce = parts[1];
	} else if (command === "EnvSingleEntry") {
		const parts = data.split(";");
		if (parts[0]) out.key = parts[0];
		if (parts[1] !== void 0) out.value = vscodeUnescape(parts[1]);
		if (parts[2]) out.nonce = parts[2];
	} else if (command === "EnvSingleEnd") out.nonce = data;
	return out;
};
const CONEMU_SUBCMDS = new Set([
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"12"
]);
const osc9Decoder = (payload, event) => {
	const semi = payload.indexOf(";");
	const head = semi >= 0 ? payload.slice(0, semi) : payload;
	const rest = semi >= 0 ? payload.slice(semi + 1) : "";
	if (head === "4") {
		const parts = rest.split(";");
		const state = Number(parts[0] ?? 0);
		const valueRaw = parts[1];
		const out = {
			kind: "progress",
			state
		};
		if (valueRaw !== void 0 && valueRaw !== "") out.value = Number(valueRaw);
		return out;
	}
	if (head === "9") return {
		kind: "cwd",
		source: "conemu",
		path: unquote(rest)
	};
	if (head === "12") return {
		kind: "mark",
		vendor: "conemu",
		raw: payload
	};
	if (CONEMU_SUBCMDS.has(head)) return {
		kind: "unknown",
		code: event.code,
		payload
	};
	return {
		kind: "notification",
		vendor: "iterm",
		body: payload,
		raw: payload
	};
};
const osc99Decoder = (payload) => {
	const semi = payload.indexOf(";");
	const meta = semi >= 0 ? payload.slice(0, semi) : payload;
	const rawValue = semi >= 0 ? payload.slice(semi + 1) : "";
	const fields = {};
	for (const kv of meta.split(":")) {
		if (!kv) continue;
		const eq = kv.indexOf("=");
		if (eq >= 0) fields[kv.slice(0, eq)] = kv.slice(eq + 1);
		else fields[kv] = "";
	}
	const phase = fields.p ?? "title";
	const value = fields.e === "1" ? safeBase64Decode(rawValue) : rawValue;
	const out = {
		kind: "notification",
		vendor: "kitty",
		raw: payload
	};
	if (fields.i) out.id = fields.i;
	if (fields.u === "0" || fields.u === "1" || fields.u === "2") out.urgency = Number(fields.u);
	if (fields.d === "0") out.partial = true;
	if (phase === "title") out.title = value;
	else if (phase === "body") out.body = value;
	else out.phase = phase;
	return out;
};
const osc1337Decoder = (payload, event) => {
	if (payload === "RequestAttention" || payload.startsWith("RequestAttention=")) {
		const value = payload.includes("=") ? payload.slice(payload.indexOf("=") + 1) : "yes";
		const action = value === "no" ? "cancel" : "request";
		const effect = value === "fireworks" || value === "once" ? value : void 0;
		return {
			kind: "attention",
			vendor: "iterm",
			action,
			...effect ? { effect } : {},
			value,
			raw: payload
		};
	}
	if (payload === "SetMark") return {
		kind: "mark",
		vendor: "iterm",
		raw: payload
	};
	if (payload.startsWith("CurrentDir=")) return {
		kind: "cwd",
		source: "iterm",
		path: payload.slice(11)
	};
	if (payload.startsWith("SetUserVar=")) {
		const rest = payload.slice(11);
		const eq = rest.indexOf("=");
		if (eq >= 0) return {
			kind: "userVar",
			vendor: "iterm",
			name: rest.slice(0, eq),
			value: safeBase64Decode(rest.slice(eq + 1)),
			raw: payload
		};
	}
	if (payload.startsWith("RemoteHost=")) {
		const v = payload.slice(11);
		const at = v.indexOf("@");
		return {
			kind: "remoteHost",
			vendor: "iterm",
			...at >= 0 ? {
				user: v.slice(0, at),
				host: v.slice(at + 1)
			} : { host: v },
			raw: payload
		};
	}
	if (payload.startsWith("ShellIntegrationVersion=")) return {
		kind: "shellIntegrationVersion",
		vendor: "iterm",
		version: payload.slice(24),
		raw: payload
	};
	if (payload.startsWith("Copy=")) {
		const rest = payload.slice(5);
		const colon = rest.indexOf(":");
		const sel = colon >= 0 ? rest.slice(0, colon) : "";
		const data = colon >= 0 ? rest.slice(colon + 1) : rest;
		return {
			kind: "clipboard",
			selection: sel,
			selections: sel ? [...sel] : [],
			data
		};
	}
	return {
		kind: "unknown",
		code: event.code,
		payload
	};
};
const osc777Decoder = (payload, event) => {
	if (payload.startsWith("notify;")) {
		const parts = payload.slice(7).split(";");
		return {
			kind: "notification",
			vendor: "rxvt",
			title: parts[0] ?? "",
			body: parts.slice(1).join(";"),
			raw: payload
		};
	}
	return {
		kind: "unknown",
		code: event.code,
		payload
	};
};
const hyperlinkDecoder = (payload) => {
	const semi = payload.indexOf(";");
	const paramStr = semi >= 0 ? payload.slice(0, semi) : "";
	const uri = semi >= 0 ? payload.slice(semi + 1) : "";
	const params = {};
	if (paramStr) for (const kv of paramStr.split(":")) {
		if (!kv) continue;
		const eq = kv.indexOf("=");
		if (eq >= 0) params[kv.slice(0, eq)] = kv.slice(eq + 1);
		else params[kv] = "";
	}
	const action = uri === "" ? "close" : "open";
	return params.id !== void 0 ? {
		kind: "hyperlink",
		action,
		uri,
		id: params.id,
		params
	} : {
		kind: "hyperlink",
		action,
		uri,
		params
	};
};
const clipboardDecoder = (payload) => {
	const semi = payload.indexOf(";");
	const selection = semi >= 0 ? payload.slice(0, semi) : payload;
	const value = semi >= 0 ? payload.slice(semi + 1) : "";
	const selections = selection ? [...selection] : [];
	if (value === "?") return {
		kind: "clipboard",
		selection,
		selections,
		query: true
	};
	if (!BASE64_RE.test(value)) return {
		kind: "clipboard",
		selection,
		selections,
		clear: true
	};
	return {
		kind: "clipboard",
		selection,
		selections,
		data: value
	};
};
const builtinOSCDecoders = {
	0: titleDecoder,
	1: titleDecoder,
	2: titleDecoder,
	7: cwdDecoder,
	8: hyperlinkDecoder,
	9: osc9Decoder,
	52: clipboardDecoder,
	99: osc99Decoder,
	133: shellIntegrationDecoder("vt"),
	633: shellIntegrationDecoder("vscode"),
	777: osc777Decoder,
	1337: osc1337Decoder
};
function createOSCDecoder(custom) {
	if (!custom) return decodeBuiltin;
	return (event) => {
		const fn = custom[event.code];
		if (fn) return fn(event.payload, event);
		return decodeBuiltin(event);
	};
}
function decodeBuiltin(event) {
	const fn = builtinOSCDecoders[event.code];
	if (fn) return fn(event.payload, event);
	return {
		kind: "unknown",
		code: event.code,
		payload: event.payload
	};
}
const decodeOSC = decodeBuiltin;
const MAX_PAYLOAD = 4096;
const Ground = 0;
const Esc = 1;
const Osc = 2;
const OscSt = 3;
var OSCInspector = class {
	_state = Ground;
	_buf = Buffer.allocUnsafe(MAX_PAYLOAD);
	_len = 0;
	_overflow = false;
	_listeners = [];
	_stateListeners = [];
	state = {};
	constructor(listener) {
		if (listener) this._listeners.push(listener);
	}
	on(listener) {
		this._listeners.push(listener);
		return () => {
			const idx = this._listeners.indexOf(listener);
			if (idx >= 0) this._listeners.splice(idx, 1);
		};
	}
	onStateChange(listener) {
		this._stateListeners.push(listener);
		return () => {
			const idx = this._stateListeners.indexOf(listener);
			if (idx >= 0) this._stateListeners.splice(idx, 1);
		};
	}
	feed(data) {
		const bytes = typeof data === "string" ? Buffer.from(data, "utf8") : Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
		for (let i = 0; i < bytes.length; i++) this._feedByte(bytes[i]);
	}
	dispose() {
		this._listeners.length = 0;
		this._stateListeners.length = 0;
		this._state = Ground;
		this._len = 0;
		this._overflow = false;
		for (const k of Object.keys(this.state)) delete this.state[k];
	}
	_feedByte(b) {
		if (b === 24 || b === 26) {
			this._state = Ground;
			this._len = 0;
			this._overflow = false;
			return;
		}
		switch (this._state) {
			case Ground:
				if (b === 27) this._state = Esc;
				return;
			case Esc:
				if (b === 93) {
					this._state = Osc;
					this._len = 0;
					this._overflow = false;
				} else if (b !== 27) this._state = Ground;
				return;
			case Osc:
				if (b === 7) this._finish();
				else if (b === 27) this._state = OscSt;
				else if (!this._overflow) if (this._len === MAX_PAYLOAD) this._overflow = true;
				else this._buf[this._len++] = b;
				return;
			case OscSt:
				if (b === 92) this._finish();
				else if (b === 27) {
					this._state = Esc;
					this._len = 0;
					this._overflow = false;
				} else {
					this._state = Ground;
					this._len = 0;
					this._overflow = false;
				}
				return;
		}
	}
	_finish() {
		if (!this._overflow && this._len > 0) {
			const data = this._buf.toString("utf8", 0, this._len);
			let code = -1;
			let payload = data;
			const semi = data.indexOf(";");
			const codeStr = semi >= 0 ? data.slice(0, semi) : data;
			if (codeStr.length > 0 && /^\d+$/.test(codeStr)) {
				code = Number(codeStr);
				payload = semi >= 0 ? data.slice(semi + 1) : "";
			} else if (codeStr.length === 0) payload = semi >= 0 ? data.slice(semi + 1) : "";
			const event = {
				code,
				payload
			};
			const mutated = this._applyToState(decodeOSC(event));
			for (const l of this._listeners) try {
				l(event);
			} catch {}
			if (mutated) for (const l of this._stateListeners) try {
				l(this.state);
			} catch {}
		}
		this._state = Ground;
		this._len = 0;
		this._overflow = false;
	}
	_applyToState(d) {
		const s = this.state;
		switch (d.kind) {
			case "title":
				if (d.code === 0) {
					s.title = d.title;
					s.iconName = d.title;
				} else if (d.code === 1) s.iconName = d.title;
				else s.title = d.title;
				return true;
			case "cwd":
				s.cwd = d.host ? {
					path: d.path,
					source: d.source,
					host: d.host
				} : {
					path: d.path,
					source: d.source
				};
				return true;
			case "hyperlink":
				if (d.action === "close") {
					if (s.hyperlink === void 0) return false;
					s.hyperlink = void 0;
				} else s.hyperlink = d.id ? {
					uri: d.uri,
					id: d.id,
					params: d.params
				} : {
					uri: d.uri,
					params: d.params
				};
				return true;
			case "progress":
				if (d.state === 0) {
					if (s.progress === void 0) return false;
					s.progress = void 0;
				} else s.progress = d.value === void 0 ? { state: d.state } : {
					state: d.state,
					value: d.value
				};
				return true;
			case "remoteHost":
				s.remoteHost = d.user ? {
					user: d.user,
					host: d.host
				} : { host: d.host };
				return true;
			case "shellIntegrationVersion":
				s.shellIntegrationVersion = d.version;
				return true;
			case "userVar": {
				const vars = s.userVars ?? (s.userVars = {});
				vars[d.name] = d.value;
				return true;
			}
			default: return false;
		}
	}
};
export { OSCInspector, builtinOSCDecoders, createOSCDecoder, decodeOSC };
