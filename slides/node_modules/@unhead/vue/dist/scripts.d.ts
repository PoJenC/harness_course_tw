import { ScriptInstance, UseScriptStatus, UseScriptOptions as UseScriptOptions$1, UseFunctionType, ScriptScope, UseScriptLoaderInput, UseScriptContextOptions } from 'unhead/scripts';
export { AsVoidFunctions, EventHandlerOptions, RecordingEntry, ScriptInstance, UseFunctionType, UseScriptContextOptions, UseScriptLoader, UseScriptLoaderInput, UseScriptResolvedInput, UseScriptResolver, UseScriptStatus, UseScriptTrigger, WarmupStrategy, createSpyProxy } from 'unhead/scripts';
import { GenericScript, DataKeys, SchemaAugmentations, HeadEntryOptions } from 'unhead/types';
import { Ref } from 'vue';
import { VueHeadClient } from './client.js';
import { ResolvableProperties } from './index.js';

interface VueScriptInstance<T extends Record<symbol | string, any>> extends Omit<ScriptInstance<T>, 'status'> {
    status: Ref<UseScriptStatus>;
}
interface VueScriptScope<T extends Record<symbol | string, any>> extends Omit<ScriptScope<T>, 'status'> {
    status: Ref<UseScriptStatus>;
}
type VueScriptSrcInput = string | (ResolvableProperties<Omit<GenericScript & DataKeys & SchemaAugmentations['script'], 'src'>> & {
    src: string;
});
type UseScriptInput = VueScriptSrcInput;
interface UseScriptOptions<T extends Record<symbol | string, any> = Record<string, any>> extends Omit<HeadEntryOptions, 'head'>, Partial<Pick<UseScriptOptions$1<T>, 'use' | 'resolve' | 'eventContext' | 'beforeInit' | 'scope'>> {
    /**
     * The trigger to load the script:
     * - `undefined` | `client` - (Default) Load the script on the client when this js is loaded.
     * - `manual` - Load the script manually by calling `$script.load()`, exists only on the client.
     * - `Promise` - Load the script when the promise resolves, exists only on the client.
     * - `Function` - Register a callback function to load the script, exists only on the client.
     * - `server` - Have the script injected on the server.
     * - `Ref<boolean>` - Load the script when the ref becomes true.
     * - `() => boolean` - Getter function, load the script when return value becomes true.
     */
    trigger?: UseScriptOptions$1['trigger'] | Ref<boolean> | (() => boolean);
    /**
     * Unhead instance.
     */
    head?: VueHeadClient<any>;
}
type UseScriptLoaderOptions<T extends Record<symbol | string, any>> = Omit<UseScriptOptions<T>, 'resolve' | 'use'> & {
    resolve?: never;
    use?: never;
};
type UseScriptContext<T extends Record<symbol | string, any>> = VueScriptInstance<T>;
type UseScriptReturn<T extends Record<symbol | string, any>> = UseScriptContext<UseFunctionType<UseScriptOptions<T>, T>>;
type UseScriptScopeReturn<T extends Record<symbol | string, any>> = VueScriptScope<UseFunctionType<UseScriptOptions<T>, T>>;
type ScriptApi = Record<symbol | string, any>;
type ResolveScriptOptions<R> = Omit<UseScriptOptions<any>, 'resolve' | 'use'> & {
    resolve: (ctx: UseScriptContextOptions) => R;
    use?: never;
};
type ResolvedScriptApi<R> = Extract<NonNullable<Awaited<R>>, ScriptApi>;
declare function useScript<T extends Record<symbol | string, any>>(_input: UseScriptLoaderInput<T>, _options: UseScriptLoaderOptions<T> & {
    scope: true;
}): VueScriptScope<T>;
declare function useScript<T extends Record<symbol | string, any>>(_input: UseScriptLoaderInput<T>, _options?: UseScriptLoaderOptions<T> & {
    scope?: false;
}): VueScriptInstance<T>;
declare function useScript<T extends Record<symbol | string, any>>(_input: UseScriptLoaderInput<T>, _options?: UseScriptLoaderOptions<T>): VueScriptInstance<T> | VueScriptScope<T>;
declare function useScript<R>(_input: UseScriptInput, _options: ResolveScriptOptions<R> & {
    scope: true;
}): VueScriptScope<ResolvedScriptApi<R>>;
declare function useScript<R>(_input: UseScriptInput, _options: ResolveScriptOptions<R> & {
    scope?: false;
}): VueScriptInstance<ResolvedScriptApi<R>>;
declare function useScript<R>(_input: UseScriptInput, _options: ResolveScriptOptions<R>): VueScriptInstance<ResolvedScriptApi<R>> | VueScriptScope<ResolvedScriptApi<R>>;
declare function useScript<T extends Record<symbol | string, any> = Record<symbol | string, any>>(_input: UseScriptInput, _options: UseScriptOptions<T> & {
    scope: true;
}): UseScriptScopeReturn<T>;
declare function useScript<T extends Record<symbol | string, any> = Record<symbol | string, any>>(_input: UseScriptInput, _options?: UseScriptOptions<T> & {
    scope?: false;
}): UseScriptReturn<T>;
declare function useScript<T extends Record<symbol | string, any> = Record<symbol | string, any>>(_input: UseScriptInput, _options?: UseScriptOptions<T>): UseScriptReturn<T> | UseScriptScopeReturn<T>;

export { useScript };
export type { UseScriptContext, UseScriptInput, UseScriptLoaderOptions, UseScriptOptions, UseScriptReturn, UseScriptScopeReturn, VueScriptInstance, VueScriptScope };
