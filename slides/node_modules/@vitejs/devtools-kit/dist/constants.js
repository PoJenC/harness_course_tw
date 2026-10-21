import { DEFAULT_CATEGORIES_ORDER, DEFAULT_STATE_USER_SETTINGS } from "@devframes/hub/constants";
import { DEVFRAME_CONNECTION_META_FILENAME as DEVTOOLS_CONNECTION_META_FILENAME, DEVFRAME_DOCK_IMPORTS_FILENAME as DEVTOOLS_DOCK_IMPORTS_FILENAME, DEVFRAME_RPC_DUMP_DIRNAME as DEVTOOLS_RPC_DUMP_DIRNAME, DEVFRAME_RPC_DUMP_MANIFEST_FILENAME as DEVTOOLS_RPC_DUMP_MANIFEST_FILENAME, REMOTE_CONNECTION_KEY } from "devframe/constants";
//#region src/constants.ts
const DEVTOOLS_MOUNT_PATH = "/__devtools/";
const DEVTOOLS_MOUNT_PATH_NO_TRAILING_SLASH = "/__devtools";
const DEVTOOLS_DIRNAME = "__devtools";
/**
* Single upgrade route the RPC WebSocket binds to when it shares the Vite dev
* server (route-bound mode). `DEVTOOLS_WS_ROUTE` is the relative form written
* into `__connection.json` (resolved by the client against the meta file's
* `/__devtools/` location); `DEVTOOLS_WS_PATH` is the absolute upgrade path the
* server binds and the remote-dock endpoint URL embeds.
*/
const DEVTOOLS_WS_ROUTE = "__ws";
const DEVTOOLS_WS_PATH = `${DEVTOOLS_MOUNT_PATH}${DEVTOOLS_WS_ROUTE}`;
const DEVTOOLS_DOCK_IMPORTS_VIRTUAL_ID = "/__devtools-client-imports.js";
/**
* Dock id of the built-in Devframe Inspector (mounted from
* `@devframes/plugin-inspect`). Shared between the node side (which pins the
* mounted devframe to this id) and the client (which gates the dock behind the
* `showDevframeInspector` user setting). Mirrors the plugin's `PLUGIN_ID`.
*/
const DEVTOOLS_INSPECTOR_DOCK_ID = "devframes_plugin_inspect";
/**
* Dock id of the built-in Terminals feed (from `@devframes/plugin-terminals`).
* A launcher tracking a terminal session targets this dock via
* `hub:docks:activate({ dockId, params: { sessionId } })` to jump the user
* straight to that session's output. Mirrors the plugin's `PLUGIN_ID`.
*/
const DEVTOOLS_TERMINALS_DOCK_ID = "devframes_plugin_terminals";
//#endregion
export { DEFAULT_CATEGORIES_ORDER, DEFAULT_STATE_USER_SETTINGS, DEVTOOLS_CONNECTION_META_FILENAME, DEVTOOLS_DIRNAME, DEVTOOLS_DOCK_IMPORTS_FILENAME, DEVTOOLS_DOCK_IMPORTS_VIRTUAL_ID, DEVTOOLS_INSPECTOR_DOCK_ID, DEVTOOLS_MOUNT_PATH, DEVTOOLS_MOUNT_PATH_NO_TRAILING_SLASH, DEVTOOLS_RPC_DUMP_DIRNAME, DEVTOOLS_RPC_DUMP_MANIFEST_FILENAME, DEVTOOLS_TERMINALS_DOCK_ID, DEVTOOLS_WS_PATH, DEVTOOLS_WS_ROUTE, REMOTE_CONNECTION_KEY };
