import { d as OkhslColor, w as Plugin } from '../colordx-XJPulNr2.cjs';
export { b as okhslToRgbChannels, c as okhslToRgbChannelsInto, d as rgbToOkhslChannels, e as rgbToOkhslChannelsInto } from '../okhsl-BZRqgoEA.cjs';

declare module '@colordx/core' {
    interface Colordx {
        toOkhsl(precision?: number): OkhslColor;
        toOkhslString(precision?: number): string;
    }
}
declare const okhsl: Plugin;

export { okhsl as default };
