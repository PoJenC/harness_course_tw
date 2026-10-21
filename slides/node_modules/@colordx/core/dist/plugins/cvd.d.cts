import { w as Plugin } from '../colordx-XJPulNr2.cjs';

type CvdType = 'protanopia' | 'deuteranopia' | 'tritanopia';
declare module '@colordx/core' {
    interface Colordx {
        simulate(type: CvdType): Colordx;
    }
}
declare const cvd: Plugin;

export { type CvdType, cvd as default };
