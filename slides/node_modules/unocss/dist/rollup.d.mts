import { RollupPluginConfig } from "@unocss/rollup";
import { Plugin } from "rollup";
export * from "@unocss/rollup";
//#region src/rollup.d.ts
export default function UnocssRollupPlugin<Theme extends object>(configOrPath?: RollupPluginConfig<Theme> | string): Plugin;
//#endregion