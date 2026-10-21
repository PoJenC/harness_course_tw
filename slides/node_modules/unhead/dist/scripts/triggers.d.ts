import { UseScriptTrigger } from '../scripts.js';
import 'hookable';
import '../shared/unhead.DC0v7nqS.js';

interface ScriptTriggerTimeoutOptions {
    /** Delay in milliseconds before loading. */
    timeout: number;
}
/** Load a script after a cancellable timeout. */
declare function createScriptTriggerTimeout(options: ScriptTriggerTimeoutOptions): UseScriptTrigger;
interface ScriptTriggerInteractionOptions {
    /** Events that should start loading. */
    events: string[];
    /** Event target, resolved when the trigger is installed. Defaults to the document root. */
    target?: EventTarget | (() => EventTarget | null);
}
/** Load a script on the first matching user interaction. */
declare function createScriptTriggerInteraction(options: ScriptTriggerInteractionOptions): UseScriptTrigger;
interface ScriptTriggerServiceWorkerOptions {
    /** Fallback delay in milliseconds. @default 3000 */
    timeout?: number;
    /** Called when the fallback delay elapses before a controller is available. */
    onTimeout?: () => void;
}
/** Load once a service worker controls the page, with a timeout fallback. */
declare function createScriptTriggerServiceWorker(options?: ScriptTriggerServiceWorkerOptions): UseScriptTrigger;

export { createScriptTriggerInteraction, createScriptTriggerServiceWorker, createScriptTriggerTimeout };
export type { ScriptTriggerInteractionOptions, ScriptTriggerServiceWorkerOptions, ScriptTriggerTimeoutOptions };
