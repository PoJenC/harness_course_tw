import { R as RecordingEntry } from './shared/unhead.C7ofc94j.mjs';
export { h as AsVoidFunctions, m as EventHandlerOptions, w as ScriptInstance, x as ScriptScope, F as UseFunctionType, G as UseScriptContext, I as UseScriptContextOptions, J as UseScriptInput, K as UseScriptLoader, L as UseScriptLoaderInput, M as UseScriptLoaderOptions, N as UseScriptOptions, O as UseScriptResolvedInput, Q as UseScriptResolver, T as UseScriptReturn, V as UseScriptScopeReturn, W as UseScriptStatus, d as UseScriptTrigger, X as UseScriptWaitFor, Y as UseScriptWaitForResolve, Z as UseScriptWaitForSetup, _ as WarmupStrategy } from './shared/unhead.C7ofc94j.mjs';
export { u as useScript } from './shared/unhead.CvSeaqgI.mjs';
import 'hookable';
import './shared/unhead.DC0v7nqS.mjs';

declare function createSpyProxy<T extends Record<string, any> | any[]>(target: T, onApply: (stack: RecordingEntry[][]) => void): T;

export { RecordingEntry, createSpyProxy };
