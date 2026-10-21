import { r as Theme } from "./colors-BKlzSQvk.mjs";
import "./theme-tccFXWUe.mjs";
import { CSSEntries, Rule, StaticRule } from "@unocss/core";
//#region src/_rules/align.d.ts
export declare const verticalAligns: Rule[];
export declare const textAligns: Rule[];
//#endregion
//#region src/_rules/behaviors.d.ts
export declare const outline: Rule<Theme>[];
export declare const appearance: Rule[];
export declare const willChange: Rule[];
//#endregion
//#region src/_rules/border.d.ts
export declare const borderStyles: string[];
export declare const borders: Rule[];
export declare function handlerBorderStyle([, a, s]: string[]): CSSEntries | undefined;
//#endregion
//#region src/_rules/color.d.ts
/**
 * @example op10 op-30 opacity-100
 */
export declare const opacity: Rule[];
export declare const bgColors: Rule[];
export declare const colorScheme: Rule[];
//#endregion
//#region src/_rules/container.d.ts
export declare const containerParent: Rule[];
//#endregion
//#region src/_rules/decoration.d.ts
export declare const textDecorations: Rule<Theme>[];
//#endregion
//#region src/_rules/default.d.ts
export declare const rules: Rule<Theme>[];
//#endregion
//#region src/_rules/flex.d.ts
export declare const flex: Rule<Theme>[];
//#endregion
//#region src/_rules/gap.d.ts
export declare const gaps: Rule[];
//#endregion
//#region src/_rules/grid.d.ts
export declare const grids: Rule<Theme>[];
//#endregion
//#region src/_rules/layout.d.ts
export declare const overflows: Rule[];
//#endregion
//#region src/_rules/position.d.ts
export declare const positions: Rule[];
export declare const justifies: StaticRule[];
export declare const orders: Rule[];
export declare const alignments: StaticRule[];
export declare const placements: StaticRule[];
/**
 * This is to add `flex-` and `grid-` prefix to the alignment rules,
 * supporting `flex="~ items-center"` in attributify mode.
 */
export declare const flexGridJustifiesAlignments: StaticRule[];
export declare const insets: Rule[];
export declare const floats: Rule[];
export declare const zIndexes: Rule[];
export declare const boxSizing: Rule[];
//#endregion
//#region src/_rules/question-mark.d.ts
/**
 * Used for debugging, only available in development mode.
 *
 * @example `?` / `where`
 */
export declare const questionMark: Rule[];
//#endregion
//#region src/_rules/ring.d.ts
export declare const ringBase: {
  '--un-ring-inset': string;
  '--un-ring-offset-width': string;
  '--un-ring-offset-color': string;
  '--un-ring-width': string;
  '--un-ring-color': string;
  '--un-shadow': string;
};
export declare const rings: Rule<Theme>[];
//#endregion
//#region src/_rules/shadow.d.ts
export declare const boxShadowsBase: {
  '--un-ring-offset-shadow': string;
  '--un-ring-shadow': string;
  '--un-shadow-inset': string;
  '--un-shadow': string;
};
export declare const boxShadows: Rule<Theme>[];
//#endregion
//#region src/_rules/size.d.ts
export declare const sizes: Rule<Theme>[];
export declare const aspectRatio: Rule[];
//#endregion
//#region src/_rules/spacing.d.ts
export declare const paddings: Rule[];
export declare const margins: Rule[];
//#endregion
//#region src/_rules/static.d.ts
export declare const varEmpty = " ";
export declare const displays: Rule[];
export declare const appearances: Rule[];
export declare const cursors: Rule[];
export declare const contains: Rule[];
export declare const pointerEvents: Rule[];
export declare const resizes: Rule[];
export declare const userSelects: Rule[];
export declare const whitespaces: Rule[];
export declare const contentVisibility: Rule[];
export declare const contents: Rule[];
export declare const breaks: Rule[];
export declare const textWraps: Rule[];
export declare const textOverflows: Rule[];
export declare const textTransforms: Rule[];
export declare const fontStyles: Rule[];
export declare const fontSmoothings: Rule[];
export declare const fieldSizing: Rule[];
//#endregion
//#region src/_rules/svg.d.ts
export declare const svgUtilities: Rule<Theme>[];
//#endregion
//#region src/_rules/transform.d.ts
export declare const transformBase: {
  '--un-rotate': number;
  '--un-rotate-x': number;
  '--un-rotate-y': number;
  '--un-rotate-z': number;
  '--un-scale-x': number;
  '--un-scale-y': number;
  '--un-scale-z': number;
  '--un-skew-x': number;
  '--un-skew-y': number;
  '--un-translate-x': number;
  '--un-translate-y': number;
  '--un-translate-z': number;
};
export declare const transforms: Rule[];
//#endregion
//#region src/_rules/transition.d.ts
export declare const transitions: Rule<Theme>[];
//#endregion
//#region src/_rules/typography.d.ts
export declare const fonts: Rule<Theme>[];
export declare const tabSizes: Rule<Theme>[];
export declare const textIndents: Rule<Theme>[];
export declare const textStrokes: Rule<Theme>[];
export declare const textShadows: Rule<Theme>[];
//#endregion
//#region src/_rules/variables.d.ts
export declare const cssVariables: Rule[];
export declare const cssProperty: Rule[];
//#endregion