import { L as LabColor, X as XyzColor, N as XyzD65Color, A as AnyColor, w as Plugin } from '../colordx-XJPulNr2.js';

declare module '@colordx/core' {
    interface Colordx {
        toLab(precision?: number): LabColor;
        toLabString(precision?: number): string;
        toXyz(precision?: number): XyzColor;
        toXyzString(precision?: number): string;
        toXyzD65(precision?: number): XyzD65Color;
        toXyzD65String(precision?: number): string;
        mixLab(color: AnyColor | Colordx, ratio?: number): Colordx;
        delta(color?: AnyColor | Colordx, precision?: number): number;
    }
}
declare const lab: Plugin;

export { lab as default };
