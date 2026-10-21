import { AstroIntegrationConfig } from "@unocss/astro";
import { AstroIntegration } from "astro";
//#region src/astro.d.ts
export default function UnocssAstroIntegration<Theme extends object>(config?: AstroIntegrationConfig<Theme>): AstroIntegration;
//#endregion