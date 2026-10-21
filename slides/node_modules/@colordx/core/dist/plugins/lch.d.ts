import { p as LchColor, w as Plugin } from '../colordx-XJPulNr2.js';

declare module '@colordx/core' {
    interface Colordx {
        toLch(precision?: number): LchColor;
        toLchString(precision?: number): string;
    }
}
declare const lch: Plugin;

export { lch as default };
