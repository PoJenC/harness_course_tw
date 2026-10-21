import { P as P3Color, A as AnyColor, w as Plugin, g as Colordx } from '../colordx-XJPulNr2.cjs';

declare module '@colordx/core' {
    interface Colordx {
        toP3(precision?: number): P3Color;
        toP3String(precision?: number): string;
    }
    namespace Colordx {
        function toGamutP3(input: AnyColor | Colordx): Colordx;
    }
}
/** Linear sRGB → gamma Display-P3 `[r, g, b]`. Pair with `oklchToLinear` to convert to several spaces. */
declare const linearToP3Channels: (lr: number, lg: number, lb: number) => [number, number, number];
/** Zero-allocation sibling of linearToP3Channels — writes [pr, pg, pb] (gamma-encoded, 0–1) into `out`. */
declare const linearToP3ChannelsInto: (out: Float64Array | number[], lr: number, lg: number, lb: number) => void;
/** OKLCh → gamma Display-P3 `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const oklchToP3Channels: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of oklchToP3Channels — writes [pr, pg, pb] into `out`. */
declare const oklchToP3ChannelsInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** CIE Lab (D50) → gamma Display-P3 `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const labToP3Channels: (l: number, a: number, b: number) => [number, number, number];
/** Zero-allocation sibling of labToP3Channels — writes [pr, pg, pb] into `out`. */
declare const labToP3ChannelsInto: (out: Float64Array | number[], l: number, a: number, b: number) => void;
/** CIE LCh (D50) → gamma Display-P3 `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const lchToP3Channels: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of lchToP3Channels — writes [pr, pg, pb] into `out`. */
declare const lchToP3ChannelsInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** True when the color is inside the Display-P3 gamut. sRGB inputs always are. */
declare const inGamutP3: (input: AnyColor | Colordx) => boolean;
declare const p3: Plugin;

export { p3 as default, inGamutP3, labToP3Channels, labToP3ChannelsInto, lchToP3Channels, lchToP3ChannelsInto, linearToP3Channels, linearToP3ChannelsInto, oklchToP3Channels, oklchToP3ChannelsInto };
