import presetWind3 from "@unocss/preset-wind3";
import AstroIntegrationPlugin from "@unocss/astro";
//#region src/astro.ts
function UnocssAstroIntegration(config) {
	return AstroIntegrationPlugin(config, { presets: [presetWind3()] });
}
//#endregion
export { UnocssAstroIntegration as default };
