//#region src/cli/main.d.ts
/**
 * The `devframe` bin is the framework's own CLI, distinct from the per-app
 * CLI shells authors build with `createCac(definition)`. It hosts the
 * app-independent commands; today that is `connect`, the MCP connector.
 */
export declare function runDevframeCli(argv?: string[]): Promise<void>;
//#endregion