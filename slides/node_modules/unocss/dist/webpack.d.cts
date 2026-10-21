import { WebpackPluginOptions } from "@unocss/webpack";
import { WebpackPluginInstance } from "webpack";
export * from "@unocss/webpack";
//#region src/webpack.d.ts
export default function UnocssWebpackPlugin<Theme extends object>(configOrPath?: WebpackPluginOptions<Theme> | string): WebpackPluginInstance;
//#endregion