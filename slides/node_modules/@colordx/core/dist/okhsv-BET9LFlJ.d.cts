import { e as OkhsvColor, R as RgbColor } from './colordx-XJPulNr2.cjs';

/** Gamma sRGB in 0–1 → Okhsv (h in [0, 360), s and v in 0–100), written into `out`. Unclamped: s can pass 100. */
declare const rgbToOkhsvChannelsInto: (out: Float64Array | number[], r: number, g: number, b: number) => void;
/** Allocating sibling of `rgbToOkhsvChannelsInto` — returns `[h, s, v]`. */
declare const rgbToOkhsvChannels: (r: number, g: number, b: number) => [number, number, number];
/** sRGB → Okhsv, rounded to 5 decimals. */
declare const rgbToOkhsv: (rgb: RgbColor) => OkhsvColor;
/** Okhsv (h in degrees, s and v in 0–100) → unclamped gamma sRGB in 0–1, written into `out`. */
declare const okhsvToRgbChannelsInto: (out: Float64Array | number[], h: number, s: number, v: number) => void;
/** Allocating sibling of `okhsvToRgbChannelsInto` — returns `[r, g, b]`. */
declare const okhsvToRgbChannels: (h: number, s: number, v: number) => [number, number, number];
/** Okhsv → sRGB, clamped to [0, 255]. h in degrees, s / v in 0–100. */
declare const okhsvToRgb: ({ h, s, v, alpha }: OkhsvColor) => RgbColor;
declare const parseOkhsvString: (input: unknown) => RgbColor | null;
declare const parseOkhsvObject: (input: unknown) => RgbColor | null;

export { parseOkhsvString as a, okhsvToRgbChannels as b, okhsvToRgbChannelsInto as c, rgbToOkhsvChannels as d, rgbToOkhsvChannelsInto as e, okhsvToRgb as o, parseOkhsvObject as p, rgbToOkhsv as r };
