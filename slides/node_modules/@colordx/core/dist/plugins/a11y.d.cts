import { A as AnyColor, w as Plugin } from '../colordx-XJPulNr2.cjs';

type ApcaSpace = 'srgb' | 'p3';
interface FixContrastOptions {
    wcag?: number;
    apca?: number;
    space?: ApcaSpace;
}
declare module '@colordx/core' {
    interface Colordx {
        luminance(precision?: number): number;
        contrast(color?: AnyColor | Colordx, precision?: number): number;
        isReadable(background?: AnyColor | Colordx, options?: {
            level?: 'AA' | 'AAA';
            size?: 'normal' | 'large';
        }): boolean;
        readableScore(background?: AnyColor | Colordx): 'AAA' | 'AA' | 'AA large' | 'fail';
        minReadable(background?: AnyColor | Colordx): Colordx;
        fixContrast(background?: AnyColor | Colordx, options?: FixContrastOptions): Colordx | null;
        apcaContrast(background?: AnyColor | Colordx, options?: {
            precision?: number;
            space?: ApcaSpace;
        }): number;
        isReadableApca(background?: AnyColor | Colordx, options?: {
            size?: 'normal' | 'large';
            space?: ApcaSpace;
        }): boolean;
    }
}
declare const a11y: Plugin;

export { type ApcaSpace, type FixContrastOptions, a11y as default };
