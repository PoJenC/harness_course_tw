import { C as DevframeDockUserEntry, T as DevframeDocksHost$1, _ as DevframeDockEntry, d as DevframeServerCommandEntry, f as DevframeServerCommandInput, l as DevframeCommandsHost$1, o as DevframeCommandHandle, p as ClientScriptEntry, t as DevframeDocksUserSettings } from "../settings-DPLPzYfX.mjs";
import { A as DevframeMessagesHost$1, E as DevframeMessageHandle, M as DevframeMessagesListDelta, O as DevframeMessageShortcutInput, S as DevframeMessageEntry, _ as DevframeTerminalsHost$1, a as InstallDevframeOptions, h as DevframeTerminalSessionBase, i as createHubContext, l as DevframeChildProcessTerminalSession, m as DevframeTerminalSession, n as DevframeHubContext, o as DevframeChildProcessExecuteOptions, p as DevframePtyTerminalSession, r as HubMountedFrame, t as CreateHubContextOptions, u as DevframePtyExecuteOptions, w as DevframeMessageEntryInput } from "../context-BK50aJ-F.mjs";
import { RpcFunctionDefinitionAny } from "devframe/rpc";
import { SharedState } from "devframe/utils/shared-state";
//#region src/node/host-commands.d.ts
export declare class DevframeCommandsHost implements DevframeCommandsHost$1 {
  readonly context: DevframeHubContext;
  readonly commands: DevframeCommandsHost$1['commands'];
  readonly events: DevframeCommandsHost$1['events'];
  /**
   * Lazy agent projection: `ctx.agent` queries this provider at list/invoke
   * time, deriving tools from {@link commands} on demand, so the commands map
   * stays the single source of truth, nothing is mirrored or kept in sync.
   */
  private readonly agentProvider;
  constructor(context: DevframeHubContext);
  register(command: DevframeServerCommandInput): DevframeCommandHandle;
  unregister(id: string): boolean;
  execute(id: string, ...args: any[]): Promise<unknown>;
  list(): DevframeServerCommandEntry[];
  private findCommand;
  private toSerializable;
  /** Reject `agent` on handler-less commands anywhere in the tree, up front. */
  private validateAgentExposure;
  /**
   * Derive the agent-tool projection of the current command trees: every
   * agent-flagged, handler-bearing command (children included) becomes a
   * callable tool. Queried lazily by the provider registered in the
   * constructor. `when` clauses evaluate client-side only and are not
   * enforced here; opting in a `when`-gated command is a deliberate author
   * decision (documented on `DevframeCommandAgentOptions`).
   */
  private collectAgentTools;
}
//#endregion
//#region src/node/host-docks.d.ts
export declare class DevframeDocksHost implements DevframeDocksHost$1 {
  readonly context: DevframeHubContext;
  readonly views: DevframeDocksHost$1['views'];
  readonly events: DevframeDocksHost$1['events'];
  userSettings: SharedState<DevframeDocksUserSettings>;
  /** Dock-id → allocated remote token + resolved options. */
  private readonly remoteDocks;
  constructor(context: DevframeHubContext);
  init(): Promise<void>;
  values(): DevframeDockEntry[];
  private projectView;
  private resolveDevServerOrigin;
  register<T extends DevframeDockUserEntry>(view: T, force?: boolean): {
    update: (patch: Partial<T>) => void;
  };
  update(view: DevframeDockUserEntry): void;
  activate(dockId: string, params?: Record<string, unknown>): void;
  /**
   * Warn (don't throw, since a client-runtime `resolveClientModule` override may still cover
   * it) when a dock declares a **bare-specifier** client script on a host
   * that advertises no `staticConfig.dock.clientModuleResolution`: the
   * browser cannot resolve a bare npm specifier natively, so the script is
   * doomed to fail there.
   */
  private warnUnresolvableClientScript;
  private validateGroupMembership;
  private prepareRemoteRegistration;
}
//#endregion
//#region src/node/host-messages.d.ts
export declare class DevframeMessagesHost implements DevframeMessagesHost$1 {
  readonly context: DevframeHubContext;
  readonly entries: DevframeMessagesHost$1['entries'];
  readonly events: DevframeMessagesHost$1['events'];
  /** Tracks when each entry was last added or updated (monotonic) */
  readonly lastModified: Map<string, number>;
  /** Tracks recently removed entry IDs with their removal time */
  readonly removals: Array<{
    id: string;
    time: number;
  }>;
  private _autoDeleteTimers;
  private _clock;
  /**
   * The tick of the newest removal record dropped from the capped
   * `removals` log; cursors older than this can't get a reliable delta
   * and fall back to a full snapshot in {@link listSince}.
   */
  private _removalsTrimmedAt;
  private _tick;
  private _recordRemoval;
  constructor(context: DevframeHubContext);
  add(input: DevframeMessageEntryInput): Promise<DevframeMessageHandle>;
  update(id: string, patch: Partial<DevframeMessageEntryInput>): Promise<DevframeMessageEntry | undefined>;
  remove(id: string): Promise<void>;
  info(message: string, extra?: DevframeMessageShortcutInput): Promise<DevframeMessageHandle>;
  warn(message: string, extra?: DevframeMessageShortcutInput): Promise<DevframeMessageHandle>;
  error(message: string, extra?: DevframeMessageShortcutInput): Promise<DevframeMessageHandle>;
  success(message: string, extra?: DevframeMessageShortcutInput): Promise<DevframeMessageHandle>;
  debug(message: string, extra?: DevframeMessageShortcutInput): Promise<DevframeMessageHandle>;
  clear(): Promise<void>;
  listSince(since?: number | null): DevframeMessagesListDelta;
  private _createHandle;
}
//#endregion
//#region src/node/host-terminals.d.ts
type PartialWithoutId<T extends {
  id: string;
}> = Partial<T> & {
  id: string;
};
export declare class DevframeTerminalsHost implements DevframeTerminalsHost$1 {
  readonly context: DevframeHubContext;
  readonly sessions: DevframeTerminalsHost$1['sessions'];
  readonly events: DevframeTerminalsHost$1['events'];
  private _boundStreams;
  private _channel?;
  constructor(context: DevframeHubContext);
  /**
   * Lazily acquire the streaming channel, since `context.rpc` isn't assigned
   * until after every host is constructed, so we can't grab it in the
   * constructor.
   */
  private getStreamingChannel;
  /**
   * Per-run stream lifecycle shared by the child-process and PTY paths: guards
   * the single-close/error transition and keeps the session's `status` in step
   * with the process lifecycle (a hub-aware client sees `running` →
   * `stopped`/`error` instead of a value frozen at spawn time).
   */
  private createStreamLifecycle;
  register(session: DevframeTerminalSession): DevframeTerminalSession;
  update(patch: PartialWithoutId<DevframeTerminalSession>): void;
  remove(session: DevframeTerminalSession): void;
  /** Drain a session's output stream into its scrollback buffer and streaming sink. */
  private pumpStream;
  private bindStream;
  startChildProcess(executeOptions: DevframeChildProcessExecuteOptions, terminal: Omit<DevframeTerminalSessionBase, 'status'>): Promise<DevframeChildProcessTerminalSession>;
  startPtySession(executeOptions: DevframePtyExecuteOptions, terminal: Omit<DevframeTerminalSessionBase, 'status'>): Promise<DevframePtyTerminalSession>;
}
//#endregion
//#region src/node/rpc-builtins.d.ts
/**
 * `hub:commands:execute`: Invoke a registered server command by id. The
 * arguments after `id` are forwarded to the command's `handler(...)`.
 * Returns whatever the handler returns.
 *
 * Pairs with the `devframe:commands` shared state: clients read the list
 * from the shared state and dispatch by id via this RPC.
 */
export declare const hubCommandsExecute: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:commands:execute", "action", [id: string, ...args: any[]], Promise<unknown>, undefined, undefined, DevframeHubContext>;
/**
 * `hub:messages:add`: Add a message from a browser client into the hub's
 * messages subsystem. Marked `from: 'browser'`. Returns the serializable
 * entry (the mutation handle stays server-side).
 *
 * Pairs with the client-side {@link import('../client').createDevframeClientRuntime}
 * context, whose `messages` client dispatches through these built-ins so a
 * dock client script can report into the same feed the server writes to.
 */
export declare const hubMessagesAdd: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:messages:add", "action", [input: DevframeMessageEntryInput], Promise<DevframeMessageEntry>, undefined, undefined, DevframeHubContext>;
/** `hub:messages:update`: Patch a message by id; returns the updated entry (or `undefined`). */
export declare const hubMessagesUpdate: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:messages:update", "action", [id: string, patch: Partial<DevframeMessageEntryInput>], Promise<DevframeMessageEntry | undefined>, undefined, undefined, DevframeHubContext>;
/** `hub:messages:remove`: Remove a message by id. */
export declare const hubMessagesRemove: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:messages:remove", "action", [id: string], Promise<void>, undefined, undefined, DevframeHubContext>;
/** `hub:messages:clear`: Remove every message. */
export declare const hubMessagesClear: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:messages:clear", "action", [], Promise<void>, undefined, undefined, DevframeHubContext>;
/**
 * `hub:terminals:write`: Send input to an interactive PTY session spawned
 * via `ctx.terminals.startPtySession`. Lets a hub-aware terminal UI (e.g. the
 * terminals plugin) drive a session owned by another plugin.
 */
export declare const hubTerminalsWrite: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:terminals:write", "action", [id: string, data: string], Promise<void>, undefined, undefined, DevframeHubContext>;
/** `hub:terminals:resize`: Resize an interactive PTY session by id. */
export declare const hubTerminalsResize: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:terminals:resize", "action", [id: string, cols: number, rows: number], Promise<void>, undefined, undefined, DevframeHubContext>;
/**
 * `hub:terminals:terminate`: Kill a session's process while keeping the
 * session registered (its output/scrollback stays). Works for both read-only
 * child-process and interactive PTY sessions, letting a hub-aware terminal UI
 * force-kill a session owned by another plugin.
 */
export declare const hubTerminalsTerminate: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:terminals:terminate", "action", [id: string], Promise<void>, undefined, undefined, DevframeHubContext>;
/**
 * `hub:terminals:restart`: Re-run a session's command in place. Rejected for
 * sessions registered with `restartable: false`, whose lifecycle is owned
 * elsewhere.
 */
export declare const hubTerminalsRestart: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:terminals:restart", "action", [id: string], Promise<void>, undefined, undefined, DevframeHubContext>;
/**
 * `hub:terminals:remove`: Kill a session's process (when it still owns one)
 * and drop it from the registry, disposing its output stream. Lets a hub-aware
 * terminal UI discard a stopped aggregated session.
 */
export declare const hubTerminalsRemove: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:terminals:remove", "action", [id: string], Promise<void>, undefined, undefined, DevframeHubContext>;
/**
 * `hub:docks:activate`: Ask the active viewer to switch its focused dock to
 * `dockId`, optionally carrying `params` for the target dock to interpret
 * (e.g. `{ sessionId }` for the terminals dock to focus a session).
 *
 * Any connected client may call it, which is the point: a mounted devframe
 * running in its own iframe (on its own RPC client) can steer the host shell's
 * dock selection, client-local state it otherwise can't reach. The hub
 * broadcasts the request live to connected clients (the host shell switches)
 * and mirrors it into the `devframe:docks:active` shared state (a dock that
 * mounts in response still converges on it).
 */
export declare const hubDocksActivate: import("devframe/rpc").RpcFunctionDefinitionWithoutSchemas<"hub:docks:activate", "action", [input: {
  dockId: string;
  params?: Record<string, unknown>;
}], Promise<void>, undefined, undefined, DevframeHubContext>;
/**
 * Framework-neutral RPC declarations auto-registered by
 * {@link createHubContext}. Provide additional RPCs by passing your own
 * array via `CreateHubContextOptions.builtinRpcDeclarations`; the hub's
 * list is prepended automatically.
 */
export declare const builtinHubRpcDeclarations: readonly RpcFunctionDefinitionAny[];
//#endregion
//#region src/node/utils.d.ts
/**
 * Create a quick `ClientScriptEntry` from an inline function or
 * stringified code. Useful for prototyping `action` / `renderer`
 * dock entries without setting up a separate importable module.
 *
 * @experimental Prefer a proper importable module for production use.
 */
export declare function createSimpleClientScript(fn: string | ((ctx: any) => void)): ClientScriptEntry;
//#endregion
export { CreateHubContextOptions, DevframeHubContext, HubMountedFrame, type InstallDevframeOptions, createHubContext };