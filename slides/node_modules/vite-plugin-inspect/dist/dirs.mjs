import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
//#region src/dirs.ts
const DIR_DIST = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));
const DIR_CLIENT = resolve(DIR_DIST, "../dist/client");
//#endregion
export { DIR_CLIENT, DIR_DIST };
