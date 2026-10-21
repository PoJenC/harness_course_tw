import { h as A98Color, A as AnyColor, w as Plugin, g as Colordx } from '../colordx-XJPulNr2.js';

declare module '@colordx/core' {
    interface Colordx {
        toA98(precision?: number): A98Color;
        toA98String(precision?: number): string;
    }
    namespace Colordx {
        function toGamutA98(input: AnyColor | Colordx): Colordx;
    }
}
/** Linear sRGB → gamma A98 `[r, g, b]`. Pair with `oklchToLinear` to convert to several spaces. */
declare const linearToA98Channels: (lr: number, lg: number, lb: number) => [number, number, number];
/** Zero-allocation sibling of linearToA98Channels — writes [rr, rg, rb] (gamma-encoded, 0–1) into `out`. */
declare const linearToA98ChannelsInto: (out: Float64Array | number[], lr: number, lg: number, lb: number) => void;
/** OKLCh → gamma A98 `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const oklchToA98Channels: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of oklchToA98Channels — writes [rr, rg, rb] into `out`. */
declare const oklchToA98ChannelsInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** CIE Lab (D50) → gamma A98 `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const labToA98Channels: (l: number, a: number, b: number) => [number, number, number];
/** Zero-allocation sibling of labToA98Channels — writes [rr, rg, rb] into `out`. */
declare const labToA98ChannelsInto: (out: Float64Array | number[], l: number, a: number, b: number) => void;
/** CIE LCh (D50) → gamma A98 `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const lchToA98Channels: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of lchToA98Channels — writes [rr, rg, rb] into `out`. */
declare const lchToA98ChannelsInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** True when the color is inside the A98 gamut. sRGB inputs always are. */
declare const inGamutA98: (input: AnyColor | Colordx) => boolean;
declare const a98: Plugin;

export { a98 as default, inGamutA98, labToA98Channels, labToA98ChannelsInto, lchToA98Channels, lchToA98ChannelsInto, linearToA98Channels, linearToA98ChannelsInto, oklchToA98Channels, oklchToA98ChannelsInto };
