import { e as OkhsvColor, w as Plugin } from '../colordx-XJPulNr2.cjs';
export { b as okhsvToRgbChannels, c as okhsvToRgbChannelsInto, d as rgbToOkhsvChannels, e as rgbToOkhsvChannelsInto } from '../okhsv-BET9LFlJ.cjs';

declare module '@colordx/core' {
    interface Colordx {
        toOkhsv(precision?: number): OkhsvColor;
        toOkhsvString(precision?: number): string;
    }
}
declare const okhsv: Plugin;

export { okhsv as default };
