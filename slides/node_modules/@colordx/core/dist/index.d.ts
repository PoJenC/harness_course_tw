import { A as AnyColor, f as ColorFormat, g as Colordx } from './colordx-XJPulNr2.js';
export { h as A98Color, i as A98ColorInput, j as CmykColor, k as CmykColorInput, C as ColorParser, b as HslColor, l as HslColorInput, c as HsvColor, m as HsvColorInput, H as HwbColor, n as HwbColorInput, L as LabColor, o as LabColorInput, p as LchColor, q as LchColorInput, d as OkhslColor, r as OkhslColorInput, e as OkhsvColor, s as OkhsvColorInput, O as OklabColor, t as OklabColorInput, a as OklchColor, u as OklchColorInput, P as P3Color, v as P3ColorInput, w as Plugin, x as ProPhotoColor, y as ProPhotoColorInput, z as Rec2020Color, B as Rec2020ColorInput, R as RgbColor, D as RgbColorInput, S as SrgbLinearColor, E as SrgbLinearColorInput, X as XyzColor, F as XyzColorInput, G as colordx, I as extend, J as nearest, K as random, M as toHex8 } from './colordx-XJPulNr2.js';
export { e as hslToRgbChannels, f as hslToRgbChannelsInto, g as rgbToHslChannels, i as rgbToHslChannelsInto, t as toHexByte } from './hsl-0v0ZyZ8u.js';

/** Input format tag such as `'hex'` or `'oklch'`, or `undefined` when unrecognised. */
declare const getFormat: (input: AnyColor) => ColorFormat | undefined;

/** True when the color is inside sRGB. sRGB-bounded inputs always are; invalid input is not. */
declare const inGamutSrgb: (input: AnyColor | Colordx) => boolean;

/** OKLCh → unclamped linear sRGB `[r, g, b]`. Channels outside [0, 1] are out of gamut. */
declare const oklchToLinear: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of `oklchToLinear` — writes `[lr, lg, lb]` into `out`. */
declare const oklchToLinearInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** OKLCh → gamma sRGB `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const oklchToRgbChannels: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of `oklchToRgbChannels` — writes `[r, g, b]` into `out`. */
declare const oklchToRgbChannelsInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** OKLCh → `[[lr, lg, lb], [r, g, b]]`, linear and gamma sRGB in one pass. */
declare const oklchToLinearAndSrgb: (l: number, c: number, h: number) => [[number, number, number], [number, number, number]];
/** Zero-allocation sibling of `oklchToLinearAndSrgb`. `linOut` and `srgbOut` must be distinct. */
declare const oklchToLinearAndSrgbInto: (linOut: Float64Array | number[], srgbOut: Float64Array | number[], l: number, c: number, h: number) => void;
/** Gamma sRGB in 0–1 → linear sRGB `[r, g, b]`. */
declare const rgbToLinear: (r: number, g: number, b: number) => [number, number, number];
/** Zero-allocation sibling of `rgbToLinear` — writes `[lr, lg, lb]` into `out`. */
declare const rgbToLinearInto: (out: Float64Array | number[], r: number, g: number, b: number) => void;
/** CIE Lab (D50) → unclamped linear sRGB `[r, g, b]`. Channels outside [0, 1] are out of gamut. */
declare const labToLinearSrgb: (l: number, a: number, b: number) => [number, number, number];
/** Zero-allocation sibling of `labToLinearSrgb` — writes `[lr, lg, lb]` into `out`. */
declare const labToLinearSrgbInto: (out: Float64Array | number[], l: number, a: number, b: number) => void;
/** CIE LCh (D50) → unclamped linear sRGB `[r, g, b]`. Channels outside [0, 1] are out of gamut. */
declare const lchToLinearSrgb: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of `lchToLinearSrgb` — writes `[lr, lg, lb]` into `out`. */
declare const lchToLinearSrgbInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** CIE Lab (D50) → gamma sRGB `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const labToRgbChannels: (l: number, a: number, b: number) => [number, number, number];
/** Zero-allocation sibling of `labToRgbChannels` — writes `[r, g, b]` into `out`. */
declare const labToRgbChannelsInto: (out: Float64Array | number[], l: number, a: number, b: number) => void;
/** CIE LCh (D50) → gamma sRGB `[r, g, b]` in 0–1. Out-of-gamut channels exceed it. */
declare const lchToRgbChannels: (l: number, c: number, h: number) => [number, number, number];
/** Zero-allocation sibling of `lchToRgbChannels` — writes `[r, g, b]` into `out`. */
declare const lchToRgbChannelsInto: (out: Float64Array | number[], l: number, c: number, h: number) => void;
/** CIE Lab (D50) → `[[lr, lg, lb], [r, g, b]]`, linear and gamma sRGB in one pass. */
declare const labToLinearAndSrgb: (l: number, a: number, b: number) => [[number, number, number], [number, number, number]];
/** Zero-allocation sibling of `labToLinearAndSrgb`. `linOut` and `srgbOut` must be distinct. */
declare const labToLinearAndSrgbInto: (linOut: Float64Array | number[], srgbOut: Float64Array | number[], l: number, a: number, b: number) => void;
/** CIE LCh (D50) → `[[lr, lg, lb], [r, g, b]]`, linear and gamma sRGB in one pass. */
declare const lchToLinearAndSrgb: (l: number, c: number, h: number) => [[number, number, number], [number, number, number]];
/** Zero-allocation sibling of `lchToLinearAndSrgb`. `linOut` and `srgbOut` must be distinct. */
declare const lchToLinearAndSrgbInto: (linOut: Float64Array | number[], srgbOut: Float64Array | number[], l: number, c: number, h: number) => void;

export { AnyColor, ColorFormat, Colordx, getFormat, inGamutSrgb, labToLinearAndSrgb, labToLinearAndSrgbInto, labToLinearSrgb, labToLinearSrgbInto, labToRgbChannels, labToRgbChannelsInto, lchToLinearAndSrgb, lchToLinearAndSrgbInto, lchToLinearSrgb, lchToLinearSrgbInto, lchToRgbChannels, lchToRgbChannelsInto, oklchToLinear, oklchToLinearAndSrgb, oklchToLinearAndSrgbInto, oklchToLinearInto, oklchToRgbChannels, oklchToRgbChannelsInto, rgbToLinear, rgbToLinearInto };
