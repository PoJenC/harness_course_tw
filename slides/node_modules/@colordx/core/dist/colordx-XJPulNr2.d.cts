/** sRGB color. r, g, b in [0, 255]; alpha in [0, 1]. */
interface RgbColor {
    r: number;
    g: number;
    b: number;
    alpha: number;
}
/** Input shape of `RgbColor` — `alpha` is optional and defaults to 1. */
type RgbColorInput = Omit<RgbColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** HSL color. h in [0, 360); s, l in [0, 100]; alpha in [0, 1]. */
interface HslColor {
    h: number;
    s: number;
    l: number;
    alpha: number;
}
/** Input shape of `HslColor` — `alpha` is optional and defaults to 1. */
type HslColorInput = Omit<HslColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** HSV color. h in [0, 360); s, v in [0, 100]; alpha in [0, 1]. */
interface HsvColor {
    h: number;
    s: number;
    v: number;
    alpha: number;
}
/** Input shape of `HsvColor` — `alpha` is optional and defaults to 1. */
type HsvColorInput = Omit<HsvColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** HWB color. h in [0, 360); w, b in [0, 100]; alpha in [0, 1]. */
interface HwbColor {
    h: number;
    /** Whiteness [0, 100]. */
    w: number;
    b: number;
    alpha: number;
}
/** Input shape of `HwbColor` — `alpha` is optional and defaults to 1. */
type HwbColorInput = Omit<HwbColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** Okhsl color. h in [0, 360); s, l in [0, 100]; alpha in [0, 1]. */
interface OkhslColor {
    h: number;
    s: number;
    l: number;
    alpha: number;
    readonly colorSpace: 'okhsl';
}
/** Input shape of `OkhslColor` — `alpha` is optional and defaults to 1. */
type OkhslColorInput = Omit<OkhslColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** Okhsv color. h in [0, 360); s, v in [0, 100]; alpha in [0, 1]. */
interface OkhsvColor {
    h: number;
    s: number;
    v: number;
    alpha: number;
    readonly colorSpace: 'okhsv';
}
/** Input shape of `OkhsvColor` — `alpha` is optional and defaults to 1. */
type OkhsvColorInput = Omit<OkhsvColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** CIE Lab (D50). L in [0, 100]; a, b roughly in [-128, 128]. */
interface LabColor {
    l: number;
    a: number;
    b: number;
    alpha: number;
    readonly colorSpace: 'lab';
}
/** Input shape of `LabColor` — `alpha` is optional and defaults to 1. */
type LabColorInput = Omit<LabColor, 'alpha'> & {
    alpha?: number;
};
/** CIE LCh (D50). L in [0, 100]; C in [0, ~150]; h in degrees. */
interface LchColor {
    l: number;
    c: number;
    h: number;
    alpha: number;
    readonly colorSpace: 'lch';
}
/** Input shape of `LchColor` — `alpha` is optional and defaults to 1. */
type LchColorInput = Omit<LchColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** CIE XYZ (D50). x, y, z on the library's 0–100 scale. */
interface XyzColor {
    x: number;
    y: number;
    z: number;
    alpha: number;
}
/** Input shape of `XyzColor` — `alpha` is optional and defaults to 1. */
type XyzColorInput = Omit<XyzColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
interface XyzD65Color {
    x: number;
    y: number;
    z: number;
    alpha: number;
    readonly colorSpace: 'xyz-d65';
}
type XyzD65ColorInput = Omit<XyzD65Color, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** CMYK color. c, m, y, k in [0, 100]; alpha in [0, 1]. */
interface CmykColor {
    c: number;
    m: number;
    y: number;
    k: number;
    alpha: number;
}
/** Input shape of `CmykColor` — `alpha` is optional and defaults to 1. */
type CmykColorInput = Omit<CmykColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** OKLab. Perceptually uniform (D65). L in [0, 1]; a, b roughly in [-0.4, 0.4]. */
interface OklabColor {
    l: number;
    a: number;
    b: number;
    alpha: number;
}
/** Input shape of `OklabColor` — `alpha` is optional and defaults to 1. */
type OklabColorInput = Omit<OklabColor, 'alpha'> & {
    alpha?: number;
};
/** OKLCh. Polar form of OKLab. L in [0, 1]; C in [0, ~0.4]; h in degrees. */
interface OklchColor {
    l: number;
    c: number;
    h: number;
    alpha: number;
}
/** Input shape of `OklchColor` — `alpha` is optional and defaults to 1. */
type OklchColorInput = Omit<OklchColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** CSS Color 4 Display-P3. r, g, b in [0, 1]. */
interface P3Color {
    r: number;
    g: number;
    b: number;
    alpha: number;
    readonly colorSpace: 'display-p3';
}
/** Input shape of `P3Color` — `alpha` is optional and defaults to 1. */
type P3ColorInput = Omit<P3Color, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** CSS Color 4 Rec.2020. r, g, b in [0, 1]. */
interface Rec2020Color {
    r: number;
    g: number;
    b: number;
    alpha: number;
    readonly colorSpace: 'rec2020';
}
/** Input shape of `Rec2020Color` — `alpha` is optional and defaults to 1. */
type Rec2020ColorInput = Omit<Rec2020Color, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** CSS Color 4 A98 (Adobe RGB 1998). r, g, b in [0, 1]. */
interface A98Color {
    r: number;
    g: number;
    b: number;
    alpha: number;
    readonly colorSpace: 'a98-rgb';
}
/** Input shape of `A98Color` — `alpha` is optional and defaults to 1. */
type A98ColorInput = Omit<A98Color, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** CSS Color 4 ProPhoto (ROMM RGB). r, g, b in [0, 1]. */
interface ProPhotoColor {
    r: number;
    g: number;
    b: number;
    alpha: number;
    readonly colorSpace: 'prophoto-rgb';
}
/** Input shape of `ProPhotoColor` — `alpha` is optional and defaults to 1. */
type ProPhotoColorInput = Omit<ProPhotoColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** CSS Color 4 linear-light sRGB. r, g, b in [0, 1] when in gamut. */
interface SrgbLinearColor {
    r: number;
    g: number;
    b: number;
    alpha: number;
    readonly colorSpace: 'srgb-linear';
}
/** Input shape of `SrgbLinearColor` — `alpha` is optional and defaults to 1. */
type SrgbLinearColorInput = Omit<SrgbLinearColor, 'alpha'> & {
    alpha?: number;
    a?: number;
};
/** Any color input accepted by `colordx()` and friends — a CSS string or one of the input objects. */
type AnyColor = string | RgbColorInput | HslColorInput | HsvColorInput | HwbColorInput | OkhslColorInput | OkhsvColorInput | LabColorInput | LchColorInput | XyzColorInput | XyzD65ColorInput | CmykColorInput | OklabColorInput | OklchColorInput | P3ColorInput | Rec2020ColorInput | A98ColorInput | ProPhotoColorInput | SrgbLinearColorInput;
/** A parser registered by a plugin. Returns the sRGB equivalent or `null` if the input doesn't match. */
type ColorParser<T = AnyColor> = ((input: T) => RgbColor | null) & {
    inputKind?: 'string' | 'object';
};
/** Format tags returned by `getFormat()`. */
type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'hwb' | 'oklab' | 'oklch' | 'okhsl' | 'okhsv' | 'lab' | 'lch' | 'xyz' | 'xyz-d65' | 'cmyk' | 'p3' | 'rec2020' | 'a98-rgb' | 'prophoto-rgb' | 'srgb-linear' | 'name';

declare const _SENTINEL: unique symbol;
/** Immutable color value. Manipulation methods return a new `Colordx`. */
declare class Colordx {
    private readonly _rgb;
    private readonly _valid;
    constructor(input: AnyColor | Colordx | typeof _SENTINEL, _direct?: RgbColor);
    private static _make;
    static _makeFromStoredRgb(rgb: RgbColor): Colordx;
    static _makeFromLinearSrgb(lr: number, lg: number, lb: number, alpha: number, snap?: boolean): Colordx;
    /** True when the input parsed as a recognised color. */
    isValid(): boolean;
    /** sRGB channels in [0, 255] and alpha in [0, 1], rounded to integers or to `precision` decimals. */
    toRgb(precision?: number): RgbColor;
    _rawRgb(): RgbColor;
    _srgbRgb(): RgbColor;
    /** CSS `rgb()` string in modern syntax. `{ legacy: true }` gives comma syntax, `rgba()` when alpha < 1. */
    toRgbString(options?: {
        legacy?: boolean;
    }): string;
    /** Returns `#rrggbb` (or `#rrggbbaa` when alpha < 1). */
    toHex(): string;
    /** Always returns an 8-digit `#rrggbbaa`, even when alpha is 1. */
    toHex8(): string;
    /** Returns a 24-bit RGB integer (0x000000–0xFFFFFF). Alpha is not included. */
    toNumber(): number;
    /** 32-bit unsigned `0xrrggbbaa` integer, alpha included as a byte. */
    toNumber32(): number;
    /** Returns HSL channels: h in [0, 360), s/l in [0, 100], rounded to `precision` decimals. */
    toHsl(precision?: number): HslColor;
    /** Formats as a CSS `hsl()` string. */
    toHslString(precision?: number): string;
    /** Returns OKLab channels: L in [0, 1], a/b roughly in [-0.4, 0.4]. */
    toOklab(precision?: number): OklabColor;
    /** Formats as a CSS `oklab()` string. */
    toOklabString(precision?: number): string;
    /** Returns OKLCh channels: L in [0, 1], C in [0, ~0.4], H in degrees. */
    toOklch(precision?: number): OklchColor;
    /** Formats as a CSS `oklch()` string. Hue is `none` for achromatic colors. */
    toOklchString(precision?: number): string;
    /** Perceived brightness in [0, 1] using the ITU-R BT.601 weights, on the sRGB-clipped color. */
    brightness(): number;
    /** True when `brightness()` is below 0.5. */
    isDark(): boolean;
    /** True when `brightness()` is at or above 0.5. */
    isLight(): boolean;
    /** Get or set the alpha channel (clamped to [0, 1]). Setter returns a new `Colordx`. */
    alpha(): number;
    alpha(value: number): Colordx;
    /** Get or set the HSL hue in degrees. Setter returns a new `Colordx`. */
    hue(): number;
    hue(value: number): Colordx;
    /** Composites this color over `background` in gamma sRGB, as browsers do. Throws a RangeError on an invalid color. */
    over(background: AnyColor | Colordx): Colordx;
    /** Get or set the OKLCh lightness in [0, 1]. Setter returns a new `Colordx`. */
    lightness(): number;
    lightness(value: number): Colordx;
    /** Get or set the OKLCh chroma in [0, 0.4]. Setter returns a new `Colordx`. */
    chroma(): number;
    chroma(value: number): Colordx;
    /** Adds `amount * 100` to HSL lightness, or multiplies it by `1 + amount` with `{ relative: true }`. */
    lighten(amount?: number, options?: {
        relative?: boolean;
    }): Colordx;
    /** Inverse of `lighten`. */
    darken(amount?: number, options?: {
        relative?: boolean;
    }): Colordx;
    /** Adds `amount * 100` to HSL saturation, or multiplies it by `1 + amount` with `{ relative: true }`. */
    saturate(amount?: number, options?: {
        relative?: boolean;
    }): Colordx;
    /** Inverse of `saturate`. */
    desaturate(amount?: number, options?: {
        relative?: boolean;
    }): Colordx;
    /** Drops saturation to zero. */
    grayscale(): Colordx;
    /** Inverts each RGB channel (255 − channel) of the sRGB-clipped color. */
    invert(): Colordx;
    /** Shifts the HSL hue by `amount` degrees (default 15). */
    rotate(amount?: number): Colordx;
    /** True when both colors are valid and round to the same RGBA tuple. */
    isEqual(color: AnyColor | Colordx): boolean;
    /** Returns the hex form (alias for `toHex()`). */
    toString(): string;
    /** Clamps channels into sRGB, as browsers render. Hue and lightness may shift. Returns `this` when in gamut. */
    clampSrgb(): Colordx;
    /** Maps into sRGB with CSS Color 4 gamut mapping, keeping lightness and hue. Returns `this` when in gamut. */
    mapSrgb(): Colordx;
    _mapSrgb(snap: boolean): Colordx;
    /** Maps a color into sRGB with CSS Color 4 gamut mapping. In-gamut colors pass through. */
    static toGamutSrgb: (input: AnyColor | Colordx) => Colordx;
}
/** Plugin function. Receives the `Colordx` class and parser arrays to add methods and parsers. */
type Plugin = (ColordxClass: typeof Colordx, parsers: ColorParser[], formatParsers: [ColorParser, ColorFormat][]) => void;
/** Constructs a `Colordx` from any supported color input. Existing instances pass through. */
declare const colordx: (input: AnyColor | Colordx) => Colordx;
/** Emits an 8-digit `#rrggbbaa` hex for any color input. Shortcut for `colordx(c).toHex8()`. */
declare const toHex8: (input: AnyColor | Colordx) => string;
/** Registers plugins. Each plugin is called once with the `Colordx` class and parser arrays. */
declare const extend: (plugins: Plugin[]) => void;
/** Returns the candidate closest to `color` in OKLab. Throws when `candidates` is empty or a color is invalid. */
declare const nearest: <T extends AnyColor | Colordx>(color: AnyColor | Colordx, candidates: T[]) => T;
/** Returns a random opaque sRGB color. */
declare const random: () => Colordx;

export { type AnyColor as A, type Rec2020ColorInput as B, type ColorParser as C, type RgbColorInput as D, type SrgbLinearColorInput as E, type XyzColorInput as F, colordx as G, type HwbColor as H, extend as I, nearest as J, random as K, type LabColor as L, toHex8 as M, type XyzD65Color as N, type OklabColor as O, type P3Color as P, type RgbColor as R, type SrgbLinearColor as S, type XyzColor as X, type OklchColor as a, type HslColor as b, type HsvColor as c, type OkhslColor as d, type OkhsvColor as e, type ColorFormat as f, Colordx as g, type A98Color as h, type A98ColorInput as i, type CmykColor as j, type CmykColorInput as k, type HslColorInput as l, type HsvColorInput as m, type HwbColorInput as n, type LabColorInput as o, type LchColor as p, type LchColorInput as q, type OkhslColorInput as r, type OkhsvColorInput as s, type OklabColorInput as t, type OklchColorInput as u, type P3ColorInput as v, type Plugin as w, type ProPhotoColor as x, type ProPhotoColorInput as y, type Rec2020Color as z };
