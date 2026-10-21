import { log, prompt } from "./_chunks/log.mjs";
import { existsSync } from "node:fs";
import { constants } from "node:os";
async function startTunnel(opts) {
	const { installCloudflared, startCloudflaredTunnel, cloudflaredBinPath, cloudflaredNotice } = await import("./_chunks/cloudflared.mjs");
	const url = opts.url || `${opts.protocol || "http"}://${opts.hostname ?? "localhost"}:${opts.port ?? 3e3}`;
	log(`Starting cloudflared tunnel to ${url}`, "info");
	if (!existsSync(cloudflaredBinPath)) {
		log(cloudflaredNotice);
		if (!(opts.acceptCloudflareNotice || process.env.UNTUN_ACCEPT_CLOUDFLARE_NOTICE || await prompt(`Do you agree with the above terms and wish to install the binary from GitHub?`))) {
			log("Skipping tunnel setup.", "error");
			return;
		}
		await installCloudflared();
	}
	const args = [["--url", url], opts.verifyTLS ? void 0 : ["--no-tls-verify", null]].filter(Boolean);
	const tunnel = startCloudflaredTunnel(Object.fromEntries(args), opts.extraArgs);
	let closed = false;
	const signals = [
		"SIGINT",
		"SIGTERM",
		"SIGHUP"
	];
	const handlers = /* @__PURE__ */ new Map();
	const cleanup = async () => {
		if (closed) return;
		closed = true;
		for (const [sig, handler] of handlers) process.off(sig, handler);
		handlers.clear();
		await tunnel.stop();
	};
	for (const signal of signals) {
		const handler = () => {
			cleanup().finally(() => {
				const signo = constants.signals[signal] ?? 0;
				process.exit(128 + signo);
			});
		};
		handlers.set(signal, handler);
		process.once(signal, handler);
	}
	return {
		getURL: () => tunnel.url,
		close: cleanup
	};
}
export { startTunnel };
