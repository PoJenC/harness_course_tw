//#region src/utils/crypto-token.d.ts
/**
 * Generate a high-entropy, URL-safe (hex) random token suitable for use as a
 * bearer credential, e.g. the persistent client auth token or an ephemeral
 * remote-dock token. Defaults to 16 bytes (128 bits) of entropy.
 */
export declare function randomToken(byteLength?: number): string;
/**
 * Generate a uniformly-distributed string of decimal digits using rejection
 * sampling to avoid modulo bias. Intended for short, human-typed one-time
 * codes (e.g. a 6-digit authentication code). Leading zeros are preserved.
 */
export declare function randomDigits(length: number): string;
/**
 * Constant-time string equality. Compares every character so the comparison
 * time does not depend on the position of the first mismatch, mitigating
 * timing side-channels when verifying secrets.
 *
 * Length is treated as public (it short-circuits on differing lengths), which
 * is appropriate for fixed-length codes and tokens.
 */
export declare function timingSafeEqual(a: string, b: string): boolean;
//#endregion