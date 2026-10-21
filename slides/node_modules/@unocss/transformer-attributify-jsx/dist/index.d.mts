import { SourceCodeTransformer, UnoGenerator } from "@unocss/core";
import MagicString from "magic-string";
//#region src/index.d.ts
export type FilterPattern = Array<string | RegExp> | string | RegExp | null;
export type ResolverType = 'oxc' | 'regex';
export interface ResolverFilterPattern {
  pattern: string | RegExp;
  resolver: ResolverType;
}
export type IncludePattern = Array<string | RegExp | ResolverFilterPattern> | string | RegExp | ResolverFilterPattern | null;
export interface TransformerAttributifyJsxOptions {
  /**
   * the list of attributes to ignore
   * @default []
   */
  blocklist?: (string | RegExp)[];
  /**
   * Patterns of modules to be included from processing.
   *
   * Use `{ pattern, resolver }` to select a resolver for matching files.
   * The first matching pattern is used.
   * Patterns without a resolver retain the default Oxc-to-regex fallback.
   *
   * @default [/\.[jt]sx$/, /\.mdx$/]
   */
  include?: IncludePattern;
  /**
   * Regex of modules to exclude from processing
   *
   * @default []
   */
  exclude?: FilterPattern;
}
export interface AttributifyResolverParams {
  code: MagicString;
  id: string;
  uno: UnoGenerator<object>;
  isBlocked: (matchedRule: string) => boolean;
}
export default function transformerAttributifyJsx(options?: TransformerAttributifyJsxOptions): SourceCodeTransformer;
//#endregion