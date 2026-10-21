import { R as RgbColor, b as HslColor } from './colordx-XJPulNr2.js';

/** Number in [0, 255] → 2-char lowercase hex byte. Clamps and rounds; NaN reads as 0. */
declare const toHexByte: (n: number) => string;
declare const parseHex: (input: unknown) => RgbColor | null;
declare const rgbToHex: ({ r, g, b, alpha }: RgbColor) => string;
/** Always emits 8-digit `#rrggbbaa`, regardless of alpha. Companion to `rgbToHex`. */
declare const rgbToHex8: ({ r, g, b, alpha }: RgbColor) => string;

/** Gamma sRGB in 0–1 → HSL (h in [0, 360), s and l in 0–100), written into `out`. Clip wide-gamut input first. */
declare const rgbToHslChannelsInto: (out: Float64Array | number[], r: number, g: number, b: number) => void;
/** Allocating sibling of `rgbToHslChannelsInto` — returns `[h, s, l]`. */
declare const rgbToHslChannels: (r: number, g: number, b: number) => [number, number, number];
declare const rgbToHsl: (rgb: RgbColor) => HslColor;
/** HSL (h in degrees, s and l in 0–100) → unclamped gamma sRGB in 0–1, written into `out`. */
declare const hslToRgbChannelsInto: (out: Float64Array | number[], h: number, s: number, l: number) => void;
/** Allocating sibling of `hslToRgbChannelsInto` — returns `[r, g, b]`. */
declare const hslToRgbChannels: (h: number, s: number, l: number) => [number, number, number];
declare const hslToRgb: ({ h, s, l, alpha }: HslColor) => RgbColor;
declare const parseHslObject: (input: unknown) => RgbColor | null;
declare const parseHslString: (input: unknown) => RgbColor | null;

export { parseHslObject as a, parseHslString as b, rgbToHex8 as c, rgbToHsl as d, hslToRgbChannels as e, hslToRgbChannelsInto as f, rgbToHslChannels as g, hslToRgb as h, rgbToHslChannelsInto as i, parseHex as p, rgbToHex as r, toHexByte as t };
