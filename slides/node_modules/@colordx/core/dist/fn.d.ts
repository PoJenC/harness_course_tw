import { R as RgbColor, H as HwbColor, O as OklabColor, a as OklchColor, A as AnyColor } from './colordx-XJPulNr2.js';
export { C as ColorParser, b as HslColor, c as HsvColor, d as OkhslColor, e as OkhsvColor } from './colordx-XJPulNr2.js';
export { h as hslToRgb, p as parseHex, a as parseHslObject, b as parseHslString, r as rgbToHex, c as rgbToHex8, d as rgbToHsl } from './hsl-0v0ZyZ8u.js';
export { h as hsvToRgb, p as parseHsvObject, a as parseHsvString, r as rgbToHsv } from './hsv-JvbpREyh.js';
export { o as okhslToRgb, p as parseOkhslObject, a as parseOkhslString, r as rgbToOkhsl } from './okhsl-BEiiz8GL.js';
export { o as okhsvToRgb, p as parseOkhsvObject, a as parseOkhsvString, r as rgbToOkhsv } from './okhsv-Di_OGI_8.js';
export { NAMES, parseNameString } from './plugins/names.js';

declare const parseRgbObject: (input: unknown) => RgbColor | null;
declare const parseRgbString: (input: unknown) => RgbColor | null;
declare const parseSrgbColorString: (input: unknown) => RgbColor | null;

declare const rgbToHwb: (rgb: RgbColor) => HwbColor;
declare const hwbToRgb: ({ h, w, b, alpha }: HwbColor) => RgbColor;
declare const parseHwbObject: {
    (input: unknown): RgbColor | null;
    inputKind: "object";
};
declare const parseHwbString: {
    (input: unknown): RgbColor | null;
    inputKind: "string";
};

declare const rgbToOklab: ({ r, g, b, alpha }: RgbColor) => OklabColor;
declare const oklabToRgb: ({ l, a, b, alpha }: OklabColor) => RgbColor;
declare const parseOklabObject: (input: unknown) => RgbColor | null;
declare const parseOklabString: (input: unknown) => RgbColor | null;

declare const rgbToOklch: (rgb: RgbColor) => OklchColor;
declare const oklchToRgb: (oklch: OklchColor) => RgbColor;
declare const parseOklchObject: (input: unknown) => RgbColor | null;
declare const parseOklchString: (input: unknown) => RgbColor | null;

declare const parse: (input: AnyColor) => RgbColor | null;

export { AnyColor, HwbColor, OklabColor, OklchColor, RgbColor, hwbToRgb, oklabToRgb, oklchToRgb, parse, parseHwbObject, parseHwbString, parseOklabObject, parseOklabString, parseOklchObject, parseOklchString, parseRgbObject, parseRgbString, parseSrgbColorString, rgbToHwb, rgbToOklab, rgbToOklch };
