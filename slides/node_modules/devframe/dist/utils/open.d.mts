//#region src/utils/open.d.ts
/**
 * Open a URL, file, or other target in its default OS handler
 * (browser for URLs, Finder/Explorer for paths, etc.).
 */
export declare function open(target: string): Promise<void>;
//#endregion