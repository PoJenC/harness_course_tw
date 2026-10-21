import { d as OkhslColor, R as RgbColor } from './colordx-XJPulNr2.js';

/** Gamma sRGB in 0–1 → Okhsl (h in [0, 360), s and l in 0–100), written into `out`. Unclamped: s can pass 100. */
declare const rgbToOkhslChannelsInto: (out: Float64Array | number[], r: number, g: number, b: number) => void;
/** Allocating sibling of `rgbToOkhslChannelsInto` — returns `[h, s, l]`. */
declare const rgbToOkhslChannels: (r: number, g: number, b: number) => [number, number, number];
/** sRGB → Okhsl, rounded to 5 decimals. */
declare const rgbToOkhsl: (rgb: RgbColor) => OkhslColor;
/** Okhsl (h in degrees, s and l in 0–100) → unclamped gamma sRGB in 0–1, written into `out`. */
declare const okhslToRgbChannelsInto: (out: Float64Array | number[], h: number, s: number, l: number) => void;
/** Allocating sibling of `okhslToRgbChannelsInto` — returns `[r, g, b]`. */
declare const okhslToRgbChannels: (h: number, s: number, l: number) => [number, number, number];
/** Okhsl → sRGB, clamped to [0, 255]. h in degrees, s / l in 0–100. */
declare const okhslToRgb: ({ h, s, l, alpha }: OkhslColor) => RgbColor;
declare const parseOkhslString: (input: unknown) => RgbColor | null;
declare const parseOkhslObject: (input: unknown) => RgbColor | null;

export { parseOkhslString as a, okhslToRgbChannels as b, okhslToRgbChannelsInto as c, rgbToOkhslChannels as d, rgbToOkhslChannelsInto as e, okhslToRgb as o, parseOkhslObject as p, rgbToOkhsl as r };
