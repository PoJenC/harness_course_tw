//#region src/utils/crypto-token.ts
const HEX = "0123456789abcdef";
/**
* Generate a high-entropy, URL-safe (hex) random token suitable for use as a
* bearer credential, e.g. the persistent client auth token or an ephemeral
* remote-dock token. Defaults to 16 bytes (128 bits) of entropy.
*/
function randomToken(byteLength = 16) {
	const bytes = new Uint8Array(byteLength);
	globalThis.crypto.getRandomValues(bytes);
	let out = "";
	for (let i = 0; i < bytes.length; i++) out += HEX[bytes[i] >> 4] + HEX[bytes[i] & 15];
	return out;
}
/**
* Generate a uniformly-distributed string of decimal digits using rejection
* sampling to avoid modulo bias. Intended for short, human-typed one-time
* codes (e.g. a 6-digit authentication code). Leading zeros are preserved.
*/
function randomDigits(length) {
	const limit = 250;
	const buf = /* @__PURE__ */ new Uint8Array(1);
	let out = "";
	while (out.length < length) {
		globalThis.crypto.getRandomValues(buf);
		if (buf[0] < limit) out += String(buf[0] % 10);
	}
	return out;
}
/**
* Constant-time string equality. Compares every character so the comparison
* time does not depend on the position of the first mismatch, mitigating
* timing side-channels when verifying secrets.
*
* Length is treated as public (it short-circuits on differing lengths), which
* is appropriate for fixed-length codes and tokens.
*/
function timingSafeEqual(a, b) {
	if (a.length !== b.length) return false;
	let mismatch = 0;
	for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return mismatch === 0;
}
//#endregion
export { randomDigits, randomToken, timingSafeEqual };
