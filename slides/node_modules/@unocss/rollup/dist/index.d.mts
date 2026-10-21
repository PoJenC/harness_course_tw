import { UserConfig, UserConfigDefaults } from "@unocss/core";
import { Plugin } from "rollup";
//#region src/types.d.ts
export interface RollupPluginConfig<Theme extends object = object> extends UserConfig<Theme> {
  /**
   * Warn when no UnoCSS virtual CSS entry is imported.
   *
   * @default false
   */
  checkImport?: boolean;
}
export type UnoCSSRollupPlugin = Plugin;
//#endregion
//#region src/index.d.ts
export declare function defineConfig<Theme extends object>(config: RollupPluginConfig<Theme>): RollupPluginConfig<Theme>;
export default function RollupPlugin<Theme extends object>(configOrPath?: RollupPluginConfig<Theme> | string, defaults?: UserConfigDefaults): UnoCSSRollupPlugin;
//#endregion