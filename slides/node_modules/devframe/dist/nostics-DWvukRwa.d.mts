import { AnyDiagnosticReporter, AnyDiagnosticReporter as AnyDiagnosticReporter$1, ConsoleMethod, ConsoleReporterOptions, Diagnostic, Diagnostic as Diagnostic$1, DiagnosticCallParams, DiagnosticDefinition, DiagnosticDefinition as DiagnosticDefinition$1, DiagnosticHandle, DiagnosticInit, DiagnosticReporter, Diagnostics, Diagnostics as Diagnostics$1, createConsoleReporter, defineProdDiagnostics, formatDiagnostic } from "nostics";
import { ansiFormatter } from "nostics/formatters/ansi";
//#region src/utils/nostics.d.ts
/**
 * The reporter every {@link defineDiagnostics} call below wires in ahead of
 * any caller-supplied ones: prints the diagnostic through devframe's own
 * ANSI colors via `console[method]` (default `'warn'`).
 */
declare function devframeReporter(d: Diagnostic, { method }?: {
  method?: 'log' | 'warn' | 'error';
}): void;
/**
 * Options accepted by {@link defineDiagnostics}, identical to `nostics`'s
 * own `DefineDiagnosticsOptions`, minus the reporter devframe already
 * prepends.
 */
type DevframeDefineDiagnosticsOptions<Codes extends Record<string, DiagnosticDefinition>, Reporters extends readonly AnyDiagnosticReporter[] = []> = Parameters<typeof defineDiagnostics<Codes, Reporters>>[0];
/**
 * Drop-in replacement for `nostics`'s `defineDiagnostics()` with devframe's
 * ANSI console reporter pre-wired ahead of any `reporters` passed in. Every
 * `diagnostics.ts` in devframe core, `@devframes/hub`, `@devframes/json-render`,
 * and the built-in plugins defines its codes through this instead of
 * `nostics`'s own `defineDiagnostics`; the reporter registration lives
 * here, once, so none of them need to build their own reporter (`colors`,
 * `ansiFormatter`) or take a direct dependency on `nostics` themselves.
 */
declare function defineDiagnostics<const Codes extends Record<string, DiagnosticDefinition>, const Reporters extends readonly AnyDiagnosticReporter[] = []>(options: {
  docsBase?: string | ((code: keyof Codes) => string | undefined);
  codes: Codes;
  reporters?: Reporters;
}): DevframeDiagnostics<Codes, Reporters>;
/**
 * The `Diagnostics` object returned by devframe's {@link defineDiagnostics}
 * (devframe's ANSI console reporter is always prepended). Integrations that
 * export their own `defineDiagnostics(...)` result as public API annotate it
 * with this type, so the reference resolves through `devframe/utils/nostics`
 * rather than inlining `nostics`'s types or taking a direct `nostics`
 * dependency.
 */
type DevframeDiagnostics<Codes extends Record<string, DiagnosticDefinition>, Reporters extends readonly AnyDiagnosticReporter[] = []> = Diagnostics<Codes, readonly [typeof devframeReporter, ...Reporters]>;
//#endregion
export { formatDiagnostic as _, DevframeDiagnostics as a, DiagnosticDefinition$1 as c, DiagnosticReporter as d, Diagnostics$1 as f, defineProdDiagnostics as g, defineDiagnostics as h, DevframeDefineDiagnosticsOptions as i, DiagnosticHandle as l, createConsoleReporter as m, ConsoleMethod as n, Diagnostic$1 as o, ansiFormatter as p, ConsoleReporterOptions as r, DiagnosticCallParams as s, AnyDiagnosticReporter$1 as t, DiagnosticInit as u };