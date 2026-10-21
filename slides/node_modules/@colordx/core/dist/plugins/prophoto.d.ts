import { x as ProPhotoColor, A as AnyColor, w as Plugin, g as Colordx } from '../colordx-XJPulNr2.js';

declare module '@colordx/core' {
    interface Colordx {
        toProphoto(precision?: number): ProPhotoColor;
        toProphotoString(precision?: number): string;
    }
    namespace Colordx {
        function toGamutProphoto(input: AnyColor | Colordx): Colordx;
    }
}
/** Linear sRGB → gamma ProPhoto `[r, g, b]`. Pair with `oklchToLinear` to convert to several spaces. */
declare const linearToProphotoChannels: (lr: number, lg: number, lb: number) => [number, number, number];
/** Zero-allocation sibling of linearToProphotoChannels — writes [rr, rg, rb] (gamma-encoded, 0–1) into `out`. */
declare const linearToProphotoChannelsInto: (out: Float64Array | number[], lr: number, lg: number, lb: number) => void;
/** OKLCh → gamma ProPhoto `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const oklchToProphotoChannels: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of oklchToProphotoChannels — writes [rr, rg, rb] into `out`. */
declare const oklchToProphotoChannelsInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** CIE Lab (D50) → gamma ProPhoto `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const labToProphotoChannels: (l: number, a: number, b: number) => [number, number, number];
/** Zero-allocation sibling of labToProphotoChannels — writes [rr, rg, rb] into `out`. */
declare const labToProphotoChannelsInto: (out: Float64Array | number[], l: number, a: number, b: number) => void;
/** CIE LCh (D50) → gamma ProPhoto `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const lchToProphotoChannels: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of lchToProphotoChannels — writes [rr, rg, rb] into `out`. */
declare const lchToProphotoChannelsInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** True when the color is inside the ProPhoto gamut. sRGB inputs always are. */
declare const inGamutProphoto: (input: AnyColor | Colordx) => boolean;
declare const prophoto: Plugin;

export { prophoto as default, inGamutProphoto, labToProphotoChannels, labToProphotoChannelsInto, lchToProphotoChannels, lchToProphotoChannelsInto, linearToProphotoChannels, linearToProphotoChannelsInto, oklchToProphotoChannels, oklchToProphotoChannelsInto };
