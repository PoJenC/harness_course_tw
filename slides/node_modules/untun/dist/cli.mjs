import { log } from "./_chunks/log.mjs";
import { parseArgs } from "node:util";
import { startTunnel } from "untun";
var name = "untun";
var version = "0.2.1";
const HELP = `Usage: ${name} [tunnel] [url] [options] [-- ...extraArgs]

Tunnel your local HTTP(s) server to the world! Powered by Cloudflare Quick Tunnels.

Arguments:
  url                       The URL of the tunnel (default: {protocol}://{hostname}:{port})

Options:
  --port <port>             The port of the tunnel (default: 3000)
  --hostname <host>         The hostname of the tunnel (default: localhost)
  --protocol <http|https>   The protocol of the tunnel (default: http)
  -h, --help                Show this help
  -v, --version             Show version

Anything after \`--\` is forwarded to cloudflared as extra arguments.
`;
const argv = process.argv.slice(2);
if (argv[0] === "-h" || argv[0] === "--help") {
	console.log(HELP);
	process.exit(0);
}
if (argv[0] === "-v" || argv[0] === "--version") {
	console.log(version);
	process.exit(0);
}
const rest = argv[0] === "tunnel" ? argv.slice(1) : argv;
const dashIndex = rest.indexOf("--");
const optionArgs = dashIndex === -1 ? rest : rest.slice(0, dashIndex);
const extraArgs = dashIndex === -1 ? void 0 : rest.slice(dashIndex + 1);
const { values, positionals } = parseArgs({
	args: optionArgs,
	allowPositionals: true,
	options: {
		port: { type: "string" },
		hostname: { type: "string" },
		protocol: { type: "string" },
		help: {
			type: "boolean",
			short: "h"
		}
	}
});
if (values.help) {
	console.log(HELP);
	process.exit(0);
}
const protocol = values.protocol;
if (protocol !== void 0 && protocol !== "http" && protocol !== "https") {
	log(`Invalid --protocol: ${protocol} (expected "http" or "https")`, "error");
	process.exit(1);
}
const tunnel = await startTunnel({
	url: positionals[0],
	port: values.port,
	hostname: values.hostname,
	protocol,
	extraArgs
});
if (!tunnel) {
	log("Tunnel not started.", "error");
	process.exit(1);
}
log("Waiting for tunnel URL...", "info");
log(`Tunnel ready at ${await tunnel.getURL()}`, "success");
export {};
