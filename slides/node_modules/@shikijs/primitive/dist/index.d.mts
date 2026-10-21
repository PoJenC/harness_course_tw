import { CodeToTokensBaseOptions, CodeToTokensWithThemesOptions, Grammar, GrammarState as GrammarState$1, GrammarStateMapKey, HighlighterCoreOptions, LanguageInput, LanguageRegistration, MaybeArray, MaybeGetter, PlainTextLanguage, RegexEngine, ShikiPrimitive, SpecialLanguage, SpecialTheme, ThemeInput, ThemeRegistrationAny, ThemeRegistrationResolved, ThemedToken, ThemedTokenWithVariants, TokenizeWithThemeOptions } from "@shikijs/types";
import { IOnigLib, IRawTheme, Registry as Registry$1, RegistryOptions, StateStack } from "@shikijs/vscode-textmate";
import { Root } from "hast";
export * from "@shikijs/types";
//#region src/constructors/async.d.ts
/**
 * Get the minimal shiki primitive instance.
 */
export declare function createShikiPrimitiveAsync(options: HighlighterCoreOptions): Promise<ShikiPrimitive>;
/**
 * @deprecated Use `createShikiPrimitiveAsync` instead.
 */
export declare const createShikiInternal: typeof createShikiPrimitiveAsync;
//#endregion
//#region src/constructors/primitive.d.ts
/**
 * Get the minimal shiki primitive instance.
 *
 * Requires to provide the engine and all themes and languages upfront.
 */
export declare function createShikiPrimitive(options: HighlighterCoreOptions<true>): ShikiPrimitive;
/**
 * @deprecated Use `createShikiPrimitive` instead.
 */
export declare const createShikiInternalSync: typeof createShikiPrimitive;
//#endregion
//#region src/highlight/code-to-tokens-base.d.ts
/**
 * Code to tokens, with a simple theme.
 */
export declare function codeToTokensBase(primitive: ShikiPrimitive, code: string, options?: CodeToTokensBaseOptions): ThemedToken[][];
export declare function getLastGrammarState(primitive: ShikiPrimitive, element: ThemedToken[][] | Root): GrammarState$1 | undefined;
export declare function getLastGrammarState(primitive: ShikiPrimitive, code: string, options?: CodeToTokensBaseOptions): GrammarState$1;
export declare function tokenizeWithTheme(code: string, grammar: Grammar, theme: ThemeRegistrationResolved, colorMap: string[], options: TokenizeWithThemeOptions): ThemedToken[][];
//#endregion
//#region src/highlight/code-to-tokens-themes.d.ts
/**
 * Get tokens with multiple themes
 */
export declare function codeToTokensWithThemes(primitive: ShikiPrimitive, code: string, options: CodeToTokensWithThemesOptions, codeToTokensBaseFn?: typeof codeToTokensBase): ThemedTokenWithVariants[][];
/**
 * Break tokens from multiple themes into same tokenization.
 *
 * For example, given two themes that tokenize `console.log("hello")` as:
 *
 * - `console . log (" hello ")` (6 tokens)
 * - `console .log ( "hello" )` (5 tokens)
 *
 * This function will return:
 *
 * - `console . log ( " hello " )` (8 tokens)
 * - `console . log ( " hello " )` (8 tokens)
 */
export declare function alignThemesTokenization(...themes: ThemedToken[][][]): ThemedToken[][][];
//#endregion
//#region src/textmate/getters-resolve.d.ts
/**
 * Resolve
 */
export declare function resolveLangs(langs: (LanguageInput | SpecialLanguage)[]): Promise<LanguageRegistration[]>;
export declare function resolveThemes(themes: (ThemeInput | SpecialTheme)[]): Promise<ThemeRegistrationResolved[]>;
//#endregion
//#region src/textmate/grammar-state.d.ts
export declare function setLastGrammarStateToMap(keys: GrammarStateMapKey, state: GrammarState$1): void;
export declare function getLastGrammarStateFromMap(keys: GrammarStateMapKey): GrammarState$1 | undefined;
/**
 * GrammarState is a special reference object that holds the state of a grammar.
 *
 * It's used to highlight code snippets that are part of the target language.
 */
export declare class GrammarState implements GrammarState$1 {
  /**
   * Theme to Stack mapping
   */
  private _stacks;
  readonly lang: string;
  get themes(): string[];
  get theme(): string;
  private get _stack();
  /**
   * Static method to create a initial grammar state.
   */
  static initial(lang: string, themes: string | string[]): GrammarState;
  constructor(stack: StateStack, lang: string, theme: string);
  constructor(stacksMap: Record<string, StateStack>, lang: string);
  /**
   * Get the internal stack object.
   * @internal
   */
  getInternalStack(theme?: string): StateStack | undefined;
  getScopes(theme?: string): string[];
  toJSON(): {
    lang: string;
    theme: string;
    themes: string[];
    scopes: string[];
  };
}
export declare function getGrammarStack(state: GrammarState | GrammarState$1, theme?: string): StateStack | undefined;
//#endregion
//#region src/textmate/normalize-theme.d.ts
/**
 * Normalize a textmate theme to shiki theme
 */
export declare function normalizeTheme(rawTheme: ThemeRegistrationAny): ThemeRegistrationResolved;
//#endregion
//#region src/textmate/resolver.d.ts
export declare class Resolver implements RegistryOptions {
  private readonly _langs;
  private readonly _scopeToLang;
  private readonly _injections;
  private readonly _onigLib;
  constructor(engine: RegexEngine, langs: LanguageRegistration[]);
  get onigLib(): IOnigLib;
  getLangRegistration(langIdOrAlias: string): LanguageRegistration;
  loadGrammar(scopeName: string): any;
  addLanguage(l: LanguageRegistration): void;
  getInjections(scopeName: string): string[] | undefined;
}
//#endregion
//#region src/textmate/registry.d.ts
export declare class Registry extends Registry$1 {
  private _resolver;
  private _themes;
  private _langs;
  private _alias;
  private _resolvedThemes;
  private _resolvedGrammars;
  private _langMap;
  private _langGraph;
  private _textmateThemeCache;
  private _loadedThemesCache;
  private _loadedLanguagesCache;
  constructor(_resolver: Resolver, _themes: ThemeRegistrationResolved[], _langs: LanguageRegistration[], _alias?: Record<string, string>);
  getTheme(theme: ThemeRegistrationAny | string): ThemeRegistrationResolved | undefined;
  loadTheme(theme: ThemeRegistrationAny): ThemeRegistrationResolved;
  getLoadedThemes(): string[];
  setTheme(theme: IRawTheme): void;
  getGrammar(name: string): Grammar | undefined;
  loadLanguage(lang: LanguageRegistration): void;
  dispose(): void;
  loadLanguages(langs: LanguageRegistration[]): void;
  getLoadedLanguages(): string[];
  private resolveEmbeddedLanguages;
}
//#endregion
//#region src/utils/colors.d.ts
export declare function resolveColorReplacements(theme: ThemeRegistrationAny | string, options?: TokenizeWithThemeOptions): Record<string, string | undefined>;
export declare function applyColorReplacements(color: string, replacements?: Record<string, string | undefined>): string;
export declare function applyColorReplacements(color?: string | undefined, replacements?: Record<string, string | undefined>): string | undefined;
//#endregion
//#region src/utils/general.d.ts
export declare function toArray<T>(x: MaybeArray<T>): T[];
/**
 * Normalize a getter to a promise.
 */
export declare function normalizeGetter<T>(p: MaybeGetter<T>): Promise<T>;
/**
 * Check if the language is plaintext that is ignored by Shiki.
 *
 * Hard-coded plain text languages: `plaintext`, `txt`, `text`, `plain`.
 */
export declare function isPlainLang(lang: string | null | undefined): lang is PlainTextLanguage;
/**
 * Check if the language is specially handled or bypassed by Shiki.
 *
 * Hard-coded languages: `ansi` and plaintexts like `plaintext`, `txt`, `text`, `plain`.
 */
export declare function isSpecialLang(lang: any): lang is SpecialLanguage;
/**
 * Check if the theme is specially handled or bypassed by Shiki.
 *
 * Hard-coded themes: `none`.
 */
export declare function isNoneTheme(theme: string | ThemeInput | null | undefined): theme is 'none';
/**
 * Check if the theme is specially handled or bypassed by Shiki.
 *
 * Hard-coded themes: `none`.
 */
export declare function isSpecialTheme(theme: string | ThemeInput | null | undefined): theme is SpecialTheme;
//#endregion
//#region src/utils/strings.d.ts
export declare function splitLines(code: string, preserveEnding?: boolean): [string, number][];
//#endregion
//#region src/utils/alias.d.ts
export declare function resolveLangAlias(name: string, alias?: Record<string, string>): string;
//#endregion