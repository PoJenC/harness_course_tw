import { n as __exportAll } from "./rolldown-runtime-B4iAMlE-.mjs";
import "node:fs/promises";
import { createServer } from "node:net";
import { networkInterfaces } from "node:os";
//#region ../../node_modules/.pnpm/get-port-please@3.2.0/node_modules/get-port-please/dist/index.mjs
var dist_exports = /* @__PURE__ */ __exportAll({
	checkPort: () => checkPort,
	getPort: () => getPort,
	getRandomPort: () => getRandomPort,
	isSafePort: () => isSafePort,
	isUnsafePort: () => isUnsafePort
});
const unsafePorts = /* @__PURE__ */ new Set([
	1,
	7,
	9,
	11,
	13,
	15,
	17,
	19,
	20,
	21,
	22,
	23,
	25,
	37,
	42,
	43,
	53,
	69,
	77,
	79,
	87,
	95,
	101,
	102,
	103,
	104,
	109,
	110,
	111,
	113,
	115,
	117,
	119,
	123,
	135,
	137,
	139,
	143,
	161,
	179,
	389,
	427,
	465,
	512,
	513,
	514,
	515,
	526,
	530,
	531,
	532,
	540,
	548,
	554,
	556,
	563,
	587,
	601,
	636,
	989,
	990,
	993,
	995,
	1719,
	1720,
	1723,
	2049,
	3659,
	4045,
	5060,
	5061,
	6e3,
	6566,
	6665,
	6666,
	6667,
	6668,
	6669,
	6697,
	10080
]);
function isUnsafePort(port) {
	return unsafePorts.has(port);
}
function isSafePort(port) {
	return !isUnsafePort(port);
}
var GetPortError = class extends Error {
	constructor(message, opts) {
		super(message, opts);
		this.message = message;
	}
	name = "GetPortError";
};
function _log(verbose, message) {
	if (verbose) console.log(`[get-port] ${message}`);
}
function _generateRange(from, to) {
	if (to < from) return [];
	const r = [];
	for (let index = from; index <= to; index++) r.push(index);
	return r;
}
function _tryPort(port, host) {
	return new Promise((resolve) => {
		const server = createServer();
		server.unref();
		server.on("error", () => {
			resolve(false);
		});
		server.listen({
			port,
			host
		}, () => {
			const { port: port2 } = server.address();
			server.close(() => {
				resolve(isSafePort(port2) && port2);
			});
		});
	});
}
function _getLocalHosts(additional) {
	const hosts = new Set(additional);
	for (const _interface of Object.values(networkInterfaces())) for (const config of _interface || []) if (config.address && !config.internal && !config.address.startsWith("fe80::") && !config.address.startsWith("169.254")) hosts.add(config.address);
	return [...hosts];
}
async function _findPort(ports, host) {
	for (const port of ports) {
		const r = await _tryPort(port, host);
		if (r) return r;
	}
}
function _fmtOnHost(hostname) {
	return hostname ? `on host ${JSON.stringify(hostname)}` : "on any host";
}
const HOSTNAME_RE = /^(?!-)[\d.:A-Za-z-]{1,63}(?<!-)$/;
function _validateHostname(hostname, _public, verbose) {
	if (hostname && !HOSTNAME_RE.test(hostname)) {
		const fallbackHost = _public ? "0.0.0.0" : "127.0.0.1";
		_log(verbose, `Invalid hostname: ${JSON.stringify(hostname)}. Using ${JSON.stringify(fallbackHost)} as fallback.`);
		return fallbackHost;
	}
	return hostname;
}
async function getPort(_userOptions = {}) {
	if (typeof _userOptions === "number" || typeof _userOptions === "string") _userOptions = { port: Number.parseInt(_userOptions + "") || 0 };
	const _port = Number(_userOptions.port ?? process.env.PORT);
	const _userSpecifiedAnyPort = Boolean(_userOptions.port || _userOptions.ports?.length || _userOptions.portRange?.length);
	const options = {
		random: _port === 0,
		ports: [],
		portRange: [],
		alternativePortRange: _userSpecifiedAnyPort ? [] : [3e3, 3100],
		verbose: false,
		..._userOptions,
		port: _port,
		host: _validateHostname(_userOptions.host ?? process.env.HOST, _userOptions.public, _userOptions.verbose)
	};
	if (options.random && !_userSpecifiedAnyPort) return getRandomPort(options.host);
	const portsToCheck = [
		options.port,
		...options.ports,
		..._generateRange(...options.portRange)
	].filter((port) => {
		if (!port) return false;
		if (!isSafePort(port)) {
			_log(options.verbose, `Ignoring unsafe port: ${port}`);
			return false;
		}
		return true;
	});
	if (portsToCheck.length === 0) portsToCheck.push(3e3);
	let availablePort = await _findPort(portsToCheck, options.host);
	if (!availablePort && options.alternativePortRange.length > 0) {
		availablePort = await _findPort(_generateRange(...options.alternativePortRange), options.host);
		if (portsToCheck.length > 0) {
			let message = `Unable to find an available port (tried ${portsToCheck.join("-")} ${_fmtOnHost(options.host)}).`;
			if (availablePort) message += ` Using alternative port ${availablePort}.`;
			_log(options.verbose, message);
		}
	}
	if (!availablePort && _userOptions.random !== false) {
		availablePort = await getRandomPort(options.host);
		if (availablePort) _log(options.verbose, `Using random port ${availablePort}`);
	}
	if (!availablePort) {
		const triedRanges = [
			options.port,
			options.portRange.join("-"),
			options.alternativePortRange.join("-")
		].filter(Boolean).join(", ");
		throw new GetPortError(`Unable to find an available port ${_fmtOnHost(options.host)} (tried ${triedRanges})`);
	}
	return availablePort;
}
async function getRandomPort(host) {
	const port = await checkPort(0, host);
	if (port === false) throw new GetPortError(`Unable to find a random port ${_fmtOnHost(host)}`);
	return port;
}
async function checkPort(port, host = process.env.HOST, verbose) {
	if (!host) host = _getLocalHosts([void 0, "0.0.0.0"]);
	if (!Array.isArray(host)) return _tryPort(port, host);
	for (const _host of host) {
		const _port = await _tryPort(port, _host);
		if (_port === false) {
			if (port < 1024 && verbose) _log(verbose, `Unable to listen to the privileged port ${port} ${_fmtOnHost(_host)}`);
			return false;
		}
		if (port === 0 && _port !== 0) port = _port;
	}
	return port;
}
//#endregion
export { getPort as n, dist_exports as t };
