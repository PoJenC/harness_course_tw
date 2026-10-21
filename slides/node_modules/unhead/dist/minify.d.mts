/**
 * Lightweight CSS minifier in pure JS (no native deps).
 * Strips comments and collapses whitespace while preserving string literals.
 */
declare function minifyCSS(code: string): string;

/**
 * Lightweight JS minifier in pure JS (no native deps).
 * Strips comments and collapses whitespace while preserving string literals.
 */
declare function minifyJS(code: string): string;

/**
 * Minify JSON by stripping insignificant whitespace without re-serializing tokens.
 * Returns compact or invalid JSON unchanged.
 */
declare function minifyJSON(code: string): string;

export { minifyCSS, minifyJS, minifyJSON };
