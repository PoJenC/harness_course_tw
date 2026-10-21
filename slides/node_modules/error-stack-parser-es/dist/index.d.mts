import { ParseOptions, StackFrame, StackFrameLite, extractLocation } from "./lite.mjs";

//#region src/index.d.ts
/**
 * Given an Error object, extract the most information from it.
 *
 * @param {Error} error object
 * @return {Array} of StackFrames
 */
declare function parse(error: Error, options?: ParseOptions): StackFrame[];
declare function parseV8OrIE(error: Error): StackFrame[];
declare function parseFFOrSafari(error: Error): StackFrame[];
declare function parseOpera(e: Error): StackFrame[];
declare function parseOpera9(e: Error): StackFrame[];
declare function parseOpera10(e: Error): StackFrame[];
declare function parseOpera11(error: Error): StackFrame[];
//#endregion
export { ParseOptions, StackFrame, StackFrameLite, extractLocation, parse, parseFFOrSafari, parseOpera, parseOpera10, parseOpera11, parseOpera9, parseV8OrIE };