import { H as HeadPluginInput } from './unhead.C7ofc94j.mjs';

/**
 * Maps unhead v1/v2 tag props (`children`, `hid`, `vmid`, `body`, `renderPriority`) to their
 * v3 equivalents (`innerHTML`, `key`, `tagPosition`, `tagPriority`).
 *
 * Intended as a temporary migration aid. Remove once all call sites use the v3 API.
 *
 * @deprecated Will be removed in v4. Migrate tag props to their v3 equivalents
 * (`innerHTML`, `key`, `tagPosition`, `tagPriority`) directly and drop this plugin.
 */
declare const DeprecationsPlugin: HeadPluginInput;

export { DeprecationsPlugin as D };
