import { U as Unhead, L as UseScriptLoaderInput, M as UseScriptLoaderOptions, x as ScriptScope, w as ScriptInstance, J as UseScriptInput, N as UseScriptOptions, I as UseScriptContextOptions, V as UseScriptScopeReturn, T as UseScriptReturn } from './unhead.BCbtEyRi.js';

/**
 * Load third-party scripts with SSR support and a proxied API.
 *
 * @see https://unhead.unjs.io/usage/composables/use-script
 */
type ScriptApi = Record<symbol | string, any>;
type ResolveScriptOptions<R> = Omit<UseScriptOptions<any>, 'resolve' | 'use'> & {
    resolve: (ctx: UseScriptContextOptions) => R;
    use?: never;
};
type ResolvedScriptApi<R> = Extract<NonNullable<Awaited<R>>, ScriptApi>;
declare function useScript<T extends Record<symbol | string, any>>(head: Unhead<any>, _input: UseScriptLoaderInput<T>, _options: UseScriptLoaderOptions<T> & {
    scope: true;
}): ScriptScope<T>;
declare function useScript<T extends Record<symbol | string, any>>(head: Unhead<any>, _input: UseScriptLoaderInput<T>, _options?: UseScriptLoaderOptions<T> & {
    scope?: false;
}): ScriptInstance<T>;
declare function useScript<T extends Record<symbol | string, any>>(head: Unhead<any>, _input: UseScriptLoaderInput<T>, _options?: UseScriptLoaderOptions<T>): ScriptInstance<T> | ScriptScope<T>;
declare function useScript<R>(head: Unhead<any>, _input: UseScriptInput, _options: ResolveScriptOptions<R> & {
    scope: true;
}): ScriptScope<ResolvedScriptApi<R>>;
declare function useScript<R>(head: Unhead<any>, _input: UseScriptInput, _options: ResolveScriptOptions<R> & {
    scope?: false;
}): ScriptInstance<ResolvedScriptApi<R>>;
declare function useScript<R>(head: Unhead<any>, _input: UseScriptInput, _options: ResolveScriptOptions<R>): ScriptInstance<ResolvedScriptApi<R>> | ScriptScope<ResolvedScriptApi<R>>;
declare function useScript<T extends Record<symbol | string, any> = Record<symbol | string, any>>(head: Unhead<any>, _input: UseScriptInput, _options: UseScriptOptions<T> & {
    scope: true;
}): UseScriptScopeReturn<T>;
declare function useScript<T extends Record<symbol | string, any> = Record<symbol | string, any>>(head: Unhead<any>, _input: UseScriptInput, _options?: UseScriptOptions<T> & {
    scope?: false;
}): UseScriptReturn<T>;
declare function useScript<T extends Record<symbol | string, any> = Record<symbol | string, any>>(head: Unhead<any>, _input: UseScriptInput, _options?: UseScriptOptions<T>): UseScriptReturn<T> | UseScriptScopeReturn<T>;

export { useScript as u };
