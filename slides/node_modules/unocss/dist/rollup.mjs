import presetWind3 from "@unocss/preset-wind3";
import RollupPlugin from "@unocss/rollup";
export * from "@unocss/rollup";
//#region src/rollup.ts
function UnocssRollupPlugin(configOrPath) {
	return RollupPlugin(configOrPath, { presets: [presetWind3()] });
}
//#endregion
export { UnocssRollupPlugin as default };
