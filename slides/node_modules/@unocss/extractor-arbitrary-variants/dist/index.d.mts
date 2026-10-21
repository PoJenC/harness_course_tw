import { Extractor } from "@unocss/core";
//#region src/index.d.ts
export declare const quotedArbitraryValuesRE: RegExp;
export declare const arbitraryPropertyRE: RegExp;
export declare function splitCodeWithArbitraryVariants(code: string): string[];
export declare function extractorArbitraryVariants(): Extractor;
//#endregion