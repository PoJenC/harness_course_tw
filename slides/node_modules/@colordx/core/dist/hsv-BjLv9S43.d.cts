import { c as HsvColor, R as RgbColor } from './colordx-XJPulNr2.cjs';

/** Gamma sRGB in 0–1 → HSV (h in [0, 360), s and v in 0–100), written into `out`. Clip wide-gamut input first. */
declare const rgbToHsvChannelsInto: (out: Float64Array | number[], r: number, g: number, b: number) => void;
/** Allocating sibling of `rgbToHsvChannelsInto` — returns `[h, s, v]`. */
declare const rgbToHsvChannels: (r: number, g: number, b: number) => [number, number, number];
declare const rgbToHsv: (rgb: RgbColor) => HsvColor;
/** HSV (h in degrees, s and v in 0–100) → unclamped gamma sRGB in 0–1, written into `out`. */
declare const hsvToRgbChannelsInto: (out: Float64Array | number[], h: number, s: number, v: number) => void;
/** Allocating sibling of `hsvToRgbChannelsInto` — returns `[r, g, b]`. */
declare const hsvToRgbChannels: (h: number, s: number, v: number) => [number, number, number];
declare const hsvToRgb: ({ h, s, v, alpha }: HsvColor) => RgbColor;
declare const parseHsvString: (input: unknown) => RgbColor | null;
declare const parseHsvObject: (input: unknown) => RgbColor | null;

export { parseHsvString as a, hsvToRgbChannels as b, hsvToRgbChannelsInto as c, rgbToHsvChannels as d, rgbToHsvChannelsInto as e, hsvToRgb as h, parseHsvObject as p, rgbToHsv as r };
