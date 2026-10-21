import { w as Plugin } from '../colordx-XJPulNr2.js';

type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary' | 'double-split-complementary' | 'rectangle';
declare module '@colordx/core' {
    interface Colordx {
        harmonies(type?: HarmonyType): Colordx[];
    }
}
declare const harmonies: Plugin;

export { harmonies as default };
