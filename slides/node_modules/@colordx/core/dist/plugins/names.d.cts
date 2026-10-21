import { R as RgbColor, w as Plugin } from '../colordx-XJPulNr2.cjs';

declare module '@colordx/core' {
    interface Colordx {
        toName(options?: {
            closest?: boolean;
        }): string | undefined;
    }
}
declare const NAMES: Record<string, string>;
declare const parseNameString: (input: unknown) => RgbColor | null;
declare const names: Plugin;

export { NAMES, names as default, parseNameString };
