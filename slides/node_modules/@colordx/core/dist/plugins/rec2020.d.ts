import { z as Rec2020Color, A as AnyColor, w as Plugin, g as Colordx } from '../colordx-XJPulNr2.js';

declare module '@colordx/core' {
    interface Colordx {
        toRec2020(precision?: number): Rec2020Color;
        toRec2020String(precision?: number): string;
    }
    namespace Colordx {
        function toGamutRec2020(input: AnyColor | Colordx): Colordx;
    }
}
/** Linear sRGB → gamma Rec.2020 `[r, g, b]`. Pair with `oklchToLinear` to convert to several spaces. */
declare const linearToRec2020Channels: (lr: number, lg: number, lb: number) => [number, number, number];
/** Zero-allocation sibling of linearToRec2020Channels — writes [rr, rg, rb] (gamma-encoded, 0–1) into `out`. */
declare const linearToRec2020ChannelsInto: (out: Float64Array | number[], lr: number, lg: number, lb: number) => void;
/** OKLCh → gamma Rec.2020 `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const oklchToRec2020Channels: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of oklchToRec2020Channels — writes [rr, rg, rb] into `out`. */
declare const oklchToRec2020ChannelsInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** CIE Lab (D50) → gamma Rec.2020 `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const labToRec2020Channels: (l: number, a: number, b: number) => [number, number, number];
/** Zero-allocation sibling of labToRec2020Channels — writes [rr, rg, rb] into `out`. */
declare const labToRec2020ChannelsInto: (out: Float64Array | number[], l: number, a: number, b: number) => void;
/** CIE LCh (D50) → gamma Rec.2020 `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const lchToRec2020Channels: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of lchToRec2020Channels — writes [rr, rg, rb] into `out`. */
declare const lchToRec2020ChannelsInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** True when the color is inside the Rec.2020 gamut. sRGB inputs always are. */
declare const inGamutRec2020: (input: AnyColor | Colordx) => boolean;
declare const rec2020: Plugin;

export { rec2020 as default, inGamutRec2020, labToRec2020Channels, labToRec2020ChannelsInto, lchToRec2020Channels, lchToRec2020ChannelsInto, linearToRec2020Channels, linearToRec2020ChannelsInto, oklchToRec2020Channels, oklchToRec2020ChannelsInto };
