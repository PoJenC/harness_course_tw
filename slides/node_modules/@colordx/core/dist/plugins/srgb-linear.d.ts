import { S as SrgbLinearColor, w as Plugin } from '../colordx-XJPulNr2.js';

declare module '@colordx/core' {
    interface Colordx {
        toSrgbLinear(precision?: number): SrgbLinearColor;
        toSrgbLinearString(precision?: number): string;
    }
}
declare const srgbLinear: Plugin;

export { srgbLinear as default };
