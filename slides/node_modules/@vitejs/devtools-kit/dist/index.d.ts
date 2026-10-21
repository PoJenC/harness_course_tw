import { t as DevToolsRpcServerFunctions } from "./rpc-augments-DADwD0R5.js";
import { t as DevToolsDocksUserSettings } from "./settings-DDLCGejq.js";
import { EntriesToObject, Thenable } from "devframe/rpc";
import { defineCommand, defineDockEntry } from "@devframes/hub";
import { ClientScriptEntry, ConnectionMeta, DevframeCapabilities, DevframeCapabilities as DevToolsCapabilities, DevframeChildProcessExecuteOptions as DevToolsChildProcessExecuteOptions, DevframeChildProcessTerminalSession as DevToolsChildProcessTerminalSession, DevframeClientCommand as DevToolsClientCommand, DevframeCommandBase as DevToolsCommandBase, DevframeCommandEntry as DevToolsCommandEntry, DevframeCommandHandle as DevToolsCommandHandle, DevframeCommandKeybinding as DevToolsCommandKeybinding, DevframeCommandShortcutOverrides as DevToolsCommandShortcutOverrides, DevframeCommandsHost as DevToolsCommandsHost, DevframeCommandsHostEvents as DevToolsCommandsHostEvents, DevframeDiagnosticsHost as DevToolsDiagnosticsHost, DevframeDiagnosticsLogger as DevToolsDiagnosticsLogger, DevframeDockActivation as DevToolsDockActivation, DevframeDockEntriesGrouped as DevToolsDockEntriesGrouped, DevframeDockEntry as DevToolsDockEntry, DevframeDockEntryBase as DevToolsDockEntryBase, DevframeDockEntryCategory, DevframeDockEntryIcon as DevToolsDockEntryIcon, DevframeDockUserEntry as DevToolsDockUserEntry, DevframeDocksActiveState as DevToolsDocksActiveState, DevframeDocksHost as DevToolsDockHost, DevframeHost as DevToolsHost, DevframeMessageElementPosition as DevToolsMessageElementPosition, DevframeMessageEntry as DevToolsMessageEntry, DevframeMessageEntryFrom as DevToolsMessageEntryFrom, DevframeMessageEntryInput as DevToolsMessageEntryInput, DevframeMessageFilePosition as DevToolsMessageFilePosition, DevframeMessageHandle as DevToolsMessageHandle, DevframeMessageLevel as DevToolsMessageLevel, DevframeMessagesClient as DevToolsMessagesClient, DevframeMessagesHost as DevToolsMessagesHost, DevframeNodeRpcSession as DevToolsNodeRpcSession, DevframeRpcClientFunctions as DevToolsRpcClientFunctions, DevframeRpcSharedStates as DevToolsRpcSharedStates, DevframeServerCommandEntry as DevToolsServerCommandEntry, DevframeServerCommandInput as DevToolsServerCommandInput, DevframeTerminalSession as DevToolsTerminalSession, DevframeTerminalSessionBase as DevToolsTerminalSessionBase, DevframeTerminalStatus as DevToolsTerminalStatus, DevframeTerminalsHost as DevToolsTerminalHost, DevframeViewAction as DevToolsViewAction, DevframeViewBuiltin as DevToolsViewBuiltin, DevframeViewCustomRender as DevToolsViewCustomRender, DevframeViewGroup as DevToolsViewGroup, DevframeViewHost as DevToolsViewHost, DevframeViewIframe as DevToolsViewIframe, DevframeViewLauncher, DevframeViewLauncherStatus as DevToolsViewLauncherStatus, EventEmitter, EventUnsubscribe, EventsMap, FrameSubTabsConfig as DevToolsFrameSubTabsConfig, NavTarget as DevToolsNavTarget, RemoteConnectionInfo, RemoteDockOptions, RpcBroadcastOptions, RpcDefinitionsFilter, RpcDefinitionsToFunctions, RpcFunctionsHost, RpcSharedStateGetOptions, RpcSharedStateHost, RpcStreamingChannel, RpcStreamingChannelOptions, RpcStreamingHost } from "@devframes/hub/types";
import { CreateHubContextOptions, DevframeHubContext } from "@devframes/hub/node";
import { CreateJsonRenderViewOptions } from "@devframes/json-render/node";
import { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { DevframeJsonRenderSpec, JsonRenderView, JsonRenderViewRef, UIElement } from "@devframes/json-render";
import { DockRendererRegistration } from "@devframes/hub/initiate";
import { DevframeJsonRenderDockEntry as DevToolsViewJsonRender } from "@devframes/json-render/hub";
import { DevframeDefineDiagnosticsOptions as DevToolsDefineDiagnosticsOptions, DevframeNodeContext as DevToolsNodeContext } from "devframe/types";
//#region src/types/json-render.d.ts
/** A json-render spec — the declarative UI description a plugin authors. */
type JsonRenderSpec<Element extends UIElement = UIElement> = DevframeJsonRenderSpec<Element>;
/** A single element within a spec's `elements` map. */
type JsonRenderElement = UIElement;
/**
 * The handle returned by `ctx.createJsonRenderer()`. It wraps a devframe
 * {@link JsonRenderView} (created via `@devframes/json-render`'s
 * `createJsonRenderView`) and exposes the kit's back-compat method names.
 *
 * Register a `json-render` dock entry with the handle's serializable
 * {@link JsonRenderViewRef} `view` (`docks.register({ type: 'json-render',
 * view: renderer.view, … })`); the client subscribes through its `stateKey`.
 * Drive the panel by calling `updateSpec` / `updateState` on the handle.
 */
interface JsonRenderer<SpecType extends JsonRenderSpec = JsonRenderSpec> {
  /** Replace the entire spec. */
  updateSpec: (spec: SpecType) => void;
  /** Shallow-merge values into the view's `state`. */
  updateState: (state: Record<string, unknown>) => void;
  /** Unregister the underlying view's shared state and listeners. */
  dispose: () => void;
  /** Shared-state key the client subscribes to for the live spec + state. */
  readonly _stateKey: string;
  /** The serializable reference to the underlying view. */
  readonly view: JsonRenderViewRef<SpecType>;
}
//#endregion
//#region src/node/context.d.ts
/**
 * Kit-augmented node context — the framework-neutral hub context from
 * `@devframes/hub`, plus the Vite-specific slots surfaced when kit hosts
 * the devtool inside Vite DevTools, and the kit's `createJsonRenderer`
 * factory (json-render is the opt-in `@devframes/json-render` package, so
 * the kit — not the hub — surfaces it on the context). The factory is typed
 * against `@devframes/json-render`'s `Spec` (`props` required).
 */
interface KitNodeContext extends DevframeHubContext {
  readonly viteConfig?: ResolvedConfig;
  readonly viteServer?: ViteDevServer;
  /**
   * Create a json-render handle for building declarative, server-driven
   * panels. Register a `json-render` dock entry with the handle's `view` ref
   * (`docks.register({ type: 'json-render', view: renderer.view, … })`) and
   * call `updateSpec` / `updateState` on the handle to drive it reactively.
   */
  createJsonRenderer: <SpecType extends JsonRenderSpec>(spec: SpecType, options?: Pick<CreateJsonRenderViewOptions<SpecType>, 'schema'>) => JsonRenderer<SpecType>;
}
interface CreateKitContextOptions extends CreateHubContextOptions {
  /** Optional Vite resolved config to surface on the context (for Vite-mounted hubs). */
  viteConfig?: ResolvedConfig;
  /** Optional Vite dev server to surface on the context. */
  viteServer?: ViteDevServer;
}
//#endregion
//#region src/types/docks.d.ts
/**
 * A selectable launch root offered by a launcher dock entry.
 *
 * When a launcher supplies {@link DevToolsViewLauncher.launcher.roots}, the
 * viewer renders a picker above the launch button. The selected root's
 * {@link DevToolsLaunchRoot.value} is forwarded to the launch as `{ root }`,
 * where a `createProcessLauncher` uses it as the spawned process's `cwd`.
 */
interface DevToolsLaunchRoot {
  /** Absolute path forwarded as the spawn `cwd` when this root is selected. */
  value: string;
  /** Human-friendly label shown in the picker (e.g. `Workspace root`). */
  label: string;
  /** Optional secondary line, e.g. the path itself. */
  description?: string;
}
/**
 * Payload carried from the client launch action to the bound launch command.
 */
interface DevToolsLaunchPayload {
  /** The {@link DevToolsLaunchRoot.value} of the root the user selected. */
  root?: string;
}
/**
 * Kit augmentation of hub's launcher entry: adds optional selectable launch
 * {@link DevToolsViewLauncher.launcher.roots | roots}.
 *
 * Docks belong to `@devframes/hub`; this extends the upstream launcher shape
 * locally until the field lands there. Since `roots` is optional, a plain hub
 * `DevframeViewLauncher` remains assignable to this type.
 */
interface DevToolsViewLauncher extends DevframeViewLauncher {
  launcher: DevframeViewLauncher['launcher'] & {
    /**
     * Selectable launch roots, owner-populated via `docks.update()`. When
     * present the viewer renders a picker; the chosen root's `value` is
     * forwarded to the launch command as {@link DevToolsLaunchPayload}.
     */
    roots?: DevToolsLaunchRoot[];
  };
}
/**
 * The kit's dock-entry category union. Vite Plus integrations are collected
 * under a dedicated dock group (see `'viteplus'`) rather than
 * a category, so this mirrors hub's framework-neutral set directly.
 */
type DevToolsDockEntryCategory = DevframeDockEntryCategory;
//#endregion
//#region src/types/vite-plugin.d.ts
interface DevToolsPluginOptions {
  capabilities?: {
    dev?: DevframeCapabilities | boolean;
    build?: DevframeCapabilities | boolean;
  };
  setup: (context: ViteDevToolsNodeContext) => void | Promise<void>;
}
/**
 * Vite-extended node context — kit-augmented context with the four hub
 * subsystems (`docks`, `terminals`, `messages`, `commands`) plus the
 * Vite-specific slots (`viteConfig`, `viteServer`). Plugins running
 * under `@vitejs/devtools` rely on this surface; portable devframe
 * apps should target {@link KitNodeContext} or the framework-neutral
 * `DevframeNodeContext` from `devframe/types`.
 */
interface ViteDevToolsNodeContext extends KitNodeContext {
  readonly viteConfig: ResolvedConfig;
  readonly viteServer?: ViteDevServer;
}
//#endregion
//#region src/types/vite-augment.d.ts
declare module 'vite' {
  interface Plugin {
    devtools?: DevToolsPluginOptions;
  }
}
interface PluginWithDevTools extends Plugin {
  devtools?: DevToolsPluginOptions;
}
//#endregion
//#region src/define.d.ts
/**
 * Identity helper that types a json-render spec literal. `@devframes/hub` no
 * longer ships this (json-render moved to the opt-in `@devframes/json-render`
 * package, whose spec is a plain `@json-render/core` `Spec`), so the kit keeps
 * the convenience helper for authoring specs with inference.
 */
export declare function defineJsonRenderSpec<SpecType extends JsonRenderSpec>(spec: SpecType): SpecType;
export declare const defineRpcFunction: <NAME extends string, TYPE extends import("devframe/rpc").RpcFunctionType, ARGS extends any[], RETURN = void, const AS extends import("devframe/rpc").RpcArgsSchema | undefined = undefined, const RS extends import("devframe/rpc").RpcReturnSchema | undefined = undefined>(definition: import("devframe/rpc").RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, AS, RS, ViteDevToolsNodeContext>) => import("devframe/rpc").RpcFunctionDefinition<NAME, TYPE, ARGS, RETURN, AS, RS, ViteDevToolsNodeContext>;
//#endregion
export { type ClientScriptEntry, type ConnectionMeta, type CreateKitContextOptions, type DevToolsCapabilities, type DevToolsChildProcessExecuteOptions, type DevToolsChildProcessTerminalSession, type DevToolsClientCommand, type DevToolsCommandBase, type DevToolsCommandEntry, type DevToolsCommandHandle, type DevToolsCommandKeybinding, type DevToolsCommandShortcutOverrides, type DevToolsCommandsHost, type DevToolsCommandsHostEvents, type DevToolsDefineDiagnosticsOptions, type DevToolsDiagnosticsHost, type DevToolsDiagnosticsLogger, type DevToolsDockActivation, type DevToolsDockEntriesGrouped, type DevToolsDockEntry, type DevToolsDockEntryBase, type DevToolsDockEntryCategory, type DevToolsDockEntryIcon, type DevToolsDockHost, type DevToolsDockUserEntry, type DevToolsDocksActiveState, type DevToolsDocksUserSettings, type DevToolsFrameSubTabsConfig, type DevToolsHost, type DevToolsLaunchPayload, type DevToolsLaunchRoot, type DevToolsMessageElementPosition, type DevToolsMessageEntry, type DevToolsMessageEntryFrom, type DevToolsMessageEntryInput, type DevToolsMessageFilePosition, type DevToolsMessageHandle, type DevToolsMessageLevel, type DevToolsMessagesClient, type DevToolsMessagesHost, type DevToolsNavTarget, type DevToolsNodeContext, type DevToolsNodeRpcSession, type DevToolsPluginOptions, type DevToolsRpcClientFunctions, type DevToolsRpcServerFunctions, type DevToolsRpcSharedStates, type DevToolsServerCommandEntry, type DevToolsServerCommandInput, type DevToolsTerminalHost, type DevToolsTerminalSession, type DevToolsTerminalSessionBase, type DevToolsTerminalStatus, type DevToolsViewAction, type DevToolsViewBuiltin, type DevToolsViewCustomRender, type DevToolsViewGroup, type DevToolsViewHost, type DevToolsViewIframe, type DevToolsViewJsonRender, type DevToolsViewLauncher, type DevToolsViewLauncherStatus, type DockRendererRegistration, type EntriesToObject, type EventEmitter, type EventUnsubscribe, type EventsMap, type JsonRenderElement, type JsonRenderSpec, type JsonRenderView, type JsonRenderViewRef, type JsonRenderer, type KitNodeContext, type PluginWithDevTools, type RemoteConnectionInfo, type RemoteDockOptions, type RpcBroadcastOptions, type RpcDefinitionsFilter, type RpcDefinitionsToFunctions, type RpcFunctionsHost, type RpcSharedStateGetOptions, type RpcSharedStateHost, type RpcStreamingChannel, type RpcStreamingChannelOptions, type RpcStreamingHost, type Thenable, type ViteDevToolsNodeContext, defineCommand, defineDockEntry };