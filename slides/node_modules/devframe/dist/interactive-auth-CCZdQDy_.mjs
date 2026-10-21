import { s as colors } from "./nostics-D0PvLZsn.mjs";
import { n as defineRpcFunction } from "./define-BLWPsH6y.mjs";
import { isAnonymousRpcMethod } from "./constants.mjs";
import { a as getTempAuthCodeInfo, n as describeUA, o as refreshTempAuthCode, r as exchangeTempAuthCode, s as verifyAuthToken, t as buildOtpAuthUrl } from "./state-W4wI6X5X.mjs";
import { t as getInternalContext } from "./context-B-2gsJ6Z.mjs";
//#region src/utils/simple-schema.ts
function ok(value) {
	return { value };
}
function fail(message, path) {
	return { issues: [path ? {
		message,
		path
	} : { message }] };
}
function make(type, validate, extra) {
	return {
		type,
		...extra,
		"~standard": {
			version: 1,
			vendor: "devframe",
			validate
		}
	};
}
/** Run a Standard Schema synchronously, rejecting async validators. */
function runSync(schema, value) {
	const result = schema["~standard"].validate(value);
	if (result instanceof Promise) throw new TypeError("[devframe/utils/simple-schema] async validators are not supported inside object()/optional()/nullable()");
	return result;
}
/** Any string. */
function string() {
	return make("string", (v) => typeof v === "string" ? ok(v) : fail("Expected a string"));
}
/** A finite number (rejects `NaN`). */
function number() {
	return make("number", (v) => typeof v === "number" && !Number.isNaN(v) ? ok(v) : fail("Expected a number"));
}
/** A boolean. */
function boolean() {
	return make("boolean", (v) => typeof v === "boolean" ? ok(v) : fail("Expected a boolean"));
}
/** `undefined`, mirroring valibot's `void`. */
function voidType() {
	return make("void", (v) => v === void 0 ? ok(void 0) : fail("Expected undefined"));
}
/** `null`. */
function nullType() {
	return make("null", (v) => v === null ? ok(null) : fail("Expected null"));
}
/** One of a fixed set of literal values. */
function picklist(values) {
	const set = new Set(values);
	return make("picklist", (v) => set.has(v) ? ok(v) : fail(`Expected one of: ${values.join(", ")}`), { values });
}
/** A single literal value (string / number / boolean). */
function literal(value) {
	return make("literal", (v) => v === value ? ok(v) : fail(`Expected ${JSON.stringify(value)}`), { value });
}
/** A value matching any one of the given schemas. */
function union(options) {
	return make("union", (v) => {
		const issues = [];
		for (const option of options) {
			const result = runSync(option, v);
			if (!result.issues) return ok(v);
			issues.push(...result.issues);
		}
		return { issues };
	}, { options });
}
/** A record with string keys whose values each satisfy the value schema. */
function record(_key, value) {
	return make("record", (v) => {
		if (typeof v !== "object" || v === null || Array.isArray(v)) return fail("Expected an object");
		const obj = v;
		const issues = [];
		for (const key of Object.keys(obj)) {
			const result = runSync(value, obj[key]);
			if (result.issues) for (const issue of result.issues) issues.push({
				message: issue.message,
				path: [key, ...issue.path ?? []]
			});
		}
		return issues.length ? { issues } : ok(v);
	});
}
/** An array whose every element satisfies the item schema. */
function array(item) {
	return make("array", (v) => {
		if (!Array.isArray(v)) return fail("Expected an array");
		const issues = [];
		for (let i = 0; i < v.length; i++) {
			const result = runSync(item, v[i]);
			if (result.issues) for (const issue of result.issues) issues.push({
				message: issue.message,
				path: [i, ...issue.path ?? []]
			});
		}
		return issues.length ? { issues } : ok(v);
	});
}
/** An object whose known keys each satisfy their schema (extra keys are kept). */
function object(shape) {
	const entries = Object.entries(shape);
	return make("object", (v) => {
		if (typeof v !== "object" || v === null || Array.isArray(v)) return fail("Expected an object");
		const obj = v;
		const issues = [];
		for (const [key, schema] of entries) {
			const result = runSync(schema, obj[key]);
			if (result.issues) for (const issue of result.issues) issues.push({
				message: issue.message,
				path: [key, ...issue.path ?? []]
			});
		}
		return issues.length ? { issues } : ok(v);
	});
}
/** Allow `undefined` in addition to the inner schema. */
function optional(inner) {
	return make("optional", (v) => v === void 0 ? ok(void 0) : runSync(inner, v), { wrapped: inner });
}
/** Allow `null` in addition to the inner schema. */
function nullable(inner) {
	return make("nullable", (v) => v === null ? ok(null) : runSync(inner, v), { wrapped: inner });
}
/** Attach a human-readable description (used for CLI option help). */
function describe(schema, description) {
	return {
		...schema,
		description
	};
}
/**
* Grouped access to every builder: `s.string()`, `s.object({ ... })`,
* `s.void()`, etc. Handy for a valibot-like `import { s } from
* 'devframe/utils/simple-schema'` call site.
*/
const s = {
	string,
	number,
	boolean,
	void: voidType,
	null: nullType,
	literal,
	picklist,
	union,
	record,
	array,
	object,
	optional,
	nullable,
	describe
};
//#endregion
//#region src/recipes/interactive-auth.ts
/**
* Build a {@link AuthBannerFunction} that renders the auth code + magic-link
* URL as a small bordered box, its two rows label-aligned. `createInteractiveAuth`
* falls back to `createAuthBanner()` when no `banner` is given; call this
* yourself to rebrand the box (`title` / `colors`) and pass the result as
* `options.banner`.
*/
function createAuthBanner(options = {}) {
	const title = options.title ?? "Devframe";
	const palette = {
		border: colors.dim,
		title: (x) => colors.gray(colors.bold(x)),
		label: colors.dim,
		code: (f) => colors.green(colors.bold(f)),
		url: colors.cyan,
		...options.colors
	};
	return (info) => {
		const rows = [
			[
				"auth code",
				info.code,
				palette.code
			],
			[
				"or open",
				info.url,
				palette.url
			],
			[
				"expires at",
				new Date(info.expireAt).toLocaleTimeString(),
				palette.label
			]
		];
		if (info.requester) {
			rows.push([
				"ua",
				info.requester.ua,
				palette.label
			]);
			rows.push([
				"origin",
				info.requester.origin,
				palette.label
			]);
		}
		const labelWidth = Math.max(...rows.map(([label]) => label.length));
		const contentWidth = Math.max(...rows.map(([, value]) => labelWidth + 2 + value.length));
		const titleBarLength = title.length + 2;
		const lineWidth = Math.max(contentWidth, titleBarLength - 2);
		const top = [
			palette.border(`╭`),
			palette.title(title),
			palette.border(`${"─".repeat(Math.max(lineWidth + 2 - titleBarLength, 0))}╮`)
		].join(" ");
		const bottom = `╰${"─".repeat(lineWidth + 2)}╯`;
		const body = rows.map(([label, value, color]) => {
			const plain = `${label.padEnd(labelWidth)}  ${value}`;
			const pad = " ".repeat(lineWidth - plain.length);
			return `${palette.border("│")} ${palette.label(label.padEnd(labelWidth))}  ${color(value)}${pad} ${palette.border("│")}`;
		});
		console.log(`\n${palette.border(top)}\n${body.join("\n")}\n${palette.border(bottom)}\n`);
	};
}
/**
* Package the interactive OTP auth protocol devframe's primitives
* (`exchangeTempAuthCode`, `verifyAuthToken`, `revokeAuthToken`,
* `getTempAuthCode`, `buildOtpAuthUrl`) implement into a ready-made
* {@link DevframeAuthHandler}: the handshake RPC functions, the resolver
* gate, the connect-time trust hook, and the startup banner.
*
* The auth storage stays internal to this handler; callers never reach into
* `devframe/node/hub-internals` themselves.
*
* ```ts
* import { createInteractiveAuth } from 'devframe/recipes/interactive-auth'
*
* const auth = createInteractiveAuth(ctx)
* auth.rpcFunctions.forEach(fn => ctx.rpc.register(fn))
* auth.printBanner()
*
* // wire `auth.authorize` / `auth.onConnect` into your transport, or pass
* // the whole handler to `initDevframe` / `initHub` via their `auth` option.
* ```
*/
function createInteractiveAuth(context, options = {}) {
	const internal = getInternalContext(context);
	const storage = internal.storage.auth;
	const staticTokens = new Set(options.clientAuthTokens ?? []);
	function isStaticToken(token) {
		return !!token && staticTokens.has(token);
	}
	function resolveServerUrl() {
		return options.serverUrl?.() ?? context.host.resolveOrigin();
	}
	const banner = options.banner ?? createAuthBanner();
	let bannerPrintedForCode;
	function printBanner(info) {
		const { code, expireAt } = getTempAuthCodeInfo();
		if (code === bannerPrintedForCode) return;
		bannerPrintedForCode = code;
		const url = buildOtpAuthUrl(resolveServerUrl(), code);
		banner({
			code,
			url,
			expireAt,
			...info?.requester ? { requester: info.requester } : {}
		});
	}
	const anonymousAuth = defineRpcFunction({
		name: "anonymous:devframe:auth",
		type: "action",
		jsonSerializable: true,
		args: [s.object({
			authToken: s.string(),
			ua: s.string(),
			origin: s.string()
		})],
		returns: s.object({ isTrusted: s.boolean() }),
		handler(params) {
			const session = context.rpc.getCurrentRpcSession();
			if (!session) return { isTrusted: false };
			if (session.meta.isTrusted) return { isTrusted: true };
			if (isStaticToken(params.authToken)) {
				session.meta.clientAuthToken = params.authToken;
				session.meta.isTrusted = true;
				return { isTrusted: true };
			}
			return { isTrusted: verifyAuthToken(params.authToken, session, storage) };
		}
	});
	const anonymousAuthExchange = defineRpcFunction({
		name: "anonymous:devframe:auth:exchange",
		type: "action",
		jsonSerializable: true,
		args: [s.object({
			code: s.string(),
			ua: s.string(),
			origin: s.string()
		})],
		returns: s.object({ authToken: s.nullable(s.string()) }),
		handler(params) {
			const session = context.rpc.getCurrentRpcSession();
			if (!session) return { authToken: null };
			const authToken = exchangeTempAuthCode(params.code, session, params, storage);
			if (authToken) options.onTrusted?.({
				session,
				authToken
			});
			return { authToken };
		}
	});
	const anonymousAuthRequestCode = defineRpcFunction({
		name: "anonymous:devframe:auth:request-code",
		type: "action",
		jsonSerializable: true,
		args: [s.object({
			ua: s.string(),
			origin: s.string(),
			reissue: s.optional(s.boolean())
		})],
		returns: s.void(),
		handler(params) {
			if (params.reissue) refreshTempAuthCode();
			printBanner({ requester: {
				ua: describeUA(params.ua),
				origin: params.origin
			} });
		}
	});
	const revoke = defineRpcFunction({
		name: "devframe:auth:revoke",
		type: "action",
		jsonSerializable: true,
		args: [],
		returns: s.void(),
		async handler() {
			const token = context.rpc.getCurrentRpcSession()?.meta.clientAuthToken;
			if (token) await internal.revokeAuthToken(token);
		}
	});
	function authorize(methodName, session) {
		if (isAnonymousRpcMethod(methodName)) return true;
		return !!session.meta.isTrusted;
	}
	function onConnect(connection, session) {
		let token;
		let requestOrigin;
		try {
			token = new URL(connection.request?.url ?? "", "http://localhost").searchParams.get("devframe_auth_token") ?? void 0;
		} catch {}
		try {
			requestOrigin = connection.request?.headers?.get?.("origin") ?? void 0;
		} catch {}
		if (!token) return;
		if (isStaticToken(token)) {
			session.meta.clientAuthToken = token;
			session.meta.isTrusted = true;
			return;
		}
		if (verifyAuthToken(token, session, storage)) return;
		if (internal.isRemoteTokenTrusted(token, requestOrigin)) {
			session.meta.clientAuthToken = token;
			session.meta.isTrusted = true;
		}
	}
	function buildOpenUrl(url) {
		return buildOtpAuthUrl(url);
	}
	return {
		rpcFunctions: [
			anonymousAuth,
			anonymousAuthExchange,
			anonymousAuthRequestCode,
			revoke
		],
		authorize,
		onConnect,
		printBanner,
		buildOpenUrl
	};
}
//#endregion
export { createInteractiveAuth as n, createAuthBanner as t };
