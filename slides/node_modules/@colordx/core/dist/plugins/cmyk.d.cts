import { j as CmykColor, w as Plugin } from '../colordx-XJPulNr2.cjs';

declare module '@colordx/core' {
    interface Colordx {
        toCmyk(precision?: number): CmykColor;
        toCmykString(precision?: number): string;
    }
}
declare const cmyk: Plugin;

export { cmyk as default };
