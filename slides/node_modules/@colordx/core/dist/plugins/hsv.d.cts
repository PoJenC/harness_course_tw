import { c as HsvColor, w as Plugin } from '../colordx-XJPulNr2.cjs';
export { b as hsvToRgbChannels, c as hsvToRgbChannelsInto, d as rgbToHsvChannels, e as rgbToHsvChannelsInto } from '../hsv-BjLv9S43.cjs';

declare module '@colordx/core' {
    interface Colordx {
        toHsv(precision?: number): HsvColor;
        toHsvString(precision?: number): string;
    }
}
declare const hsv: Plugin;

export { hsv as default };
