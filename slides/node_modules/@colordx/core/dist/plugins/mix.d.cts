import { A as AnyColor, w as Plugin } from '../colordx-XJPulNr2.cjs';

declare module '@colordx/core' {
    interface Colordx {
        mix(color: AnyColor | Colordx, ratio?: number): Colordx;
        mixOklab(color: AnyColor | Colordx, ratio?: number): Colordx;
        tints(count?: number): Colordx[];
        shades(count?: number): Colordx[];
        tones(count?: number): Colordx[];
        palette(count: number, target?: AnyColor | Colordx): Colordx[];
    }
}
declare const mix: Plugin;

export { mix as default };
